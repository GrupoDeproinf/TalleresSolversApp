import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Image,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icons from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import SolicitudLocationMap from '../../components/maps/SolicitudLocationMap';
import { launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appColors from '../../themes/appColors';
import styles from './style.css';
import api from '../../../axiosInstance';

const MIN_DESCRIPCION = 20;
const MAX_DESCRIPCION = 125;
const URGENCIA_OPTIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Urgente', label: 'Urgente' },
  { value: 'Emergencia', label: 'Emergencia' },
];

/** Primera letra en mayúscula, resto en minúsculas (por etiqueta de categoría). */
const sentenceCase = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const SolicitudServicio = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const vehicle = route.params?.vehicle ?? null;
  const uid_taller = route.params?.uid_taller ?? null;

  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [nombreSolicitud, setNombreSolicitud] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState([]);
  const [urgencia, setUrgencia] = useState('Normal');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationFullScreenVisible, setLocationFullScreenVisible] = useState(false);
  const [mapSelection, setMapSelection] = useState({
    latitude: 10.4806,
    longitude: -66.9036,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  const descripcionLength = (descripcion || '').trim().length;
  const descripcionValid =
    descripcionLength >= MIN_DESCRIPCION && descripcionLength <= MAX_DESCRIPCION;

  const setCurrentLocationAsDefault = useCallback(async () => {
    try {
      if (selectedLocation) return;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Geolocation.getCurrentPosition(
        position => {
          const current = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          };
          setMapSelection(current);
          setSelectedLocation(current);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
      );
    } catch (_) {}
  }, [selectedLocation]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: { 'Content-Type': 'application/json' },
      });
      const result = response?.data;
      const list = result?.categories ?? [];
      const options = list
        .filter((c) => c.id && c.nombre)
        .map((c) => ({
          label: sentenceCase(c.nombre),
          value: c.id,
        }));
      setCategoriaOptions(options);
      if (options.length && !categoriaId) setCategoriaId(options[0].value);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setCategoriaOptions([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentLocationAsDefault();
  }, [setCurrentLocationAsDefault]);

  const addPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5 - fotos.length,
        includeBase64: true,
        quality: 0.4,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      response => {
        if (response.didCancel || response.errorCode) return;
        const newItems =
          (response.assets || [])
            .map(a => ({
              uri: a.uri,
              base64: a.base64 || '',
            }))
            .filter(item => !!item.uri) || [];
        if (!newItems.length) return;
        setFotos(prev => [...prev, ...newItems].slice(0, 5));
      },
    );
  };

  const removePhoto = (index) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = descripcionValid && categoriaId && vehicle && selectedLocation;

  const handleMapPress = ({ latitude, longitude }) => {
    setMapSelection({
      latitude: Number(Number(latitude).toFixed(6)),
      longitude: Number(Number(longitude).toFixed(6)),
    });
  };
  useEffect(() => {
    if (locationModalVisible && selectedLocation) {
      setMapSelection({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  }, [locationModalVisible, selectedLocation]);


  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!descripcionValid) {
      Alert.alert(
        'Revisa el formulario',
        'La descripción del problema debe tener entre 20 y 125 caracteres.',
      );
      return;
    }
    if (!selectedLocation) {
      Alert.alert(
        'Ubicación requerida',
        'Selecciona tu ubicación en el mapa para poder enviar la solicitud.',
      );
      return;
    }
    setConfirmModalVisible(false);
    setSending(true);
    try {
      let nombre_usuario = '';
      let uid_usuario = '';
      let phone = '';
      try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        nombre_usuario = (user?.nombre || user?.name || '').trim() || '';
        uid_usuario = (user?.uid ?? user?.id ?? '').toString().trim() || '';
        phone = (user?.phone || user?.telefono || '').toString().trim() || '';
      } catch (_) {}
      const payload = {
        nombre_usuario,
        uid_usuario,
        phone_usuario: phone,
        nombreSolicitud: (nombreSolicitud || '').trim(),
        vehiculo: vehicle || null,
        categoriaId,
        descripcion: (descripcion || '').trim(),
        urgencia,
        latitude: selectedLocation?.latitude ?? null,
        longitude: selectedLocation?.longitude ?? null,
        fotos: (fotos || []).map(f => f.base64).filter(Boolean),
        ...(uid_taller != null && String(uid_taller).trim() !== ''
          ? { uid_taller: String(uid_taller).trim() }
          : {}),
      };
      console.log('payload', payload);
      await api.post('usuarios/saveSolicitud', payload);
      setSuccessModalVisible(true);
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setSending(false);
    }
  };

  const goToHome = () => {
    setSuccessModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'DrawerScreen' }] });
  };

  const vehicleLabel = vehicle
    ? [vehicle.vehiculo_marca, vehicle.vehiculo_modelo].filter(Boolean).join(' ') || 'Vehículo'
    : '';
  const vehicleSummaryWithYear =
    vehicleLabel && vehicle?.vehiculo_anio
      ? `${vehicleLabel} (${vehicle.vehiculo_anio})`
      : vehicleLabel || '—';
  const categoryLabel =
    categoriaOptions.find((c) => c.value === categoriaId)?.label ?? '—';
  const descripcionPreview =
    (descripcion || '').trim().length > 80
      ? `${(descripcion || '').trim().slice(0, 80)}...`
      : (descripcion || '').trim() || '—';
  const locationPreview = selectedLocation
    ? `${selectedLocation.latitude}, ${selectedLocation.longitude}`
    : 'No seleccionada';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icons name="angle-left" size={24} color={appColors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Solicitud de servicio</Text>
          <Text style={styles.headerSubtitle}>Completa los datos para enviar tu solicitud</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {vehicle && (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIconWrap}>
                <MaterialCommunityIcons name="car-side" size={26} color={appColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleTitle}>{vehicleLabel}</Text>
                <Text style={styles.vehicleSub}>
                  {[vehicle.vehiculo_anio, vehicle.KM].filter(Boolean).join(' · ') || 'Vehículo seleccionado'} {vehicle.KM ? `KM` : ''}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos de la solicitud</Text>

            <Text style={styles.label}>Nombre del servicio</Text>
            <TextInput
              style={styles.input}
              value={nombreSolicitud}
              onChangeText={setNombreSolicitud}
              placeholder="Ej: Cambio de aceite, Revisión de frenos"
              placeholderTextColor="#9CA3AF"
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 18 }]}>
              Categoría <Text style={styles.labelRequired}>*</Text>
            </Text>
            {loadingCategories ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={appColors.primary} />
              </View>
            ) : (
              <Dropdown
                data={categoriaOptions}
                labelField="label"
                valueField="value"
                placeholder="Selecciona la categoría del servicio"
                value={categoriaId}
                onChange={(item) => setCategoriaId(item?.value ?? '')}
                style={styles.dropdown}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                search={true}
              />
            )}

            <Text style={[styles.label, { marginTop: 18 }]}>
              Descripción del problema <Text style={styles.labelRequired}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={descripcion}
              onChangeText={text =>
                setDescripcion(
                  text && text.length > MAX_DESCRIPCION
                    ? text.slice(0, MAX_DESCRIPCION)
                    : text,
                )
              }
              placeholder="Describe qué sucede con tu vehículo (mínimo 20 y máximo 125 caracteres)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
            <Text
              style={[
                styles.charCount,
                ((descripcionLength > 0 && descripcionLength < MIN_DESCRIPCION) ||
                  descripcionLength > MAX_DESCRIPCION) &&
                  styles.charCountError,
              ]}>
              {descripcionLength} / {MAX_DESCRIPCION} caracteres
            </Text>

            <Text style={[styles.label, { marginTop: 18 }]}>Fotos (opcional)</Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
              Añade hasta 5 fotos para que podamos evaluar mejor tu solicitud.
            </Text>
            <View style={styles.photoRow}>
              {fotos.map((foto, index) => (
                <View key={index} style={{ position: 'relative' }}>
                  <Image source={{ uri: foto.uri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(index)}
                    activeOpacity={0.8}>
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {fotos.length < 5 && (
                <TouchableOpacity style={styles.photoAddBtn} onPress={addPhoto} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera-plus" size={28} color={appColors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>
              Ubicación actual <Text style={styles.labelRequired}>*</Text>
            </Text>
            <View style={styles.locationCard}>
              <View style={styles.locationBadge}>
                <MaterialCommunityIcons name="map-marker-radius" size={18} color="#2D3261" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Ubicación del servicio</Text>
                <Text style={styles.locationCoords} numberOfLines={1}>
                  {selectedLocation ? `${selectedLocation.latitude}, ${selectedLocation.longitude}` : 'Aún no has seleccionado una ubicación'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.locationSelectBtn}
                onPress={() => setLocationModalVisible(true)}
                activeOpacity={0.85}>
                <Text style={styles.locationSelectBtnText}>
                  {selectedLocation ? 'Cambiar' : 'Seleccionar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Urgencia</Text>
            <View style={styles.urgenciaRow}>
              {URGENCIA_OPTIONS.map((opt) => {
                const isSelected = urgencia === opt.value;
                const isUrgente = opt.value === 'Urgente';
                const isEmergencia = opt.value === 'Emergencia';
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.urgenciaOption,
                      isSelected && styles.urgenciaOptionSelected,
                      isSelected && isUrgente && styles.urgenciaOptionUrgente,
                      isSelected && isEmergencia && styles.urgenciaOptionEmergencia,
                    ]}
                    onPress={() => setUrgencia(opt.value)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.urgenciaLabel,
                        isSelected && isEmergencia && { color: appColors.red },
                        isSelected && isUrgente && !isEmergencia && { color: '#EA580C' },
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || sending) && styles.submitBtnDisabled]}
            onPress={() => canSubmit && setConfirmModalVisible(true)}
            disabled={!canSubmit || sending}
            activeOpacity={0.85}>
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar solicitud</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <MaterialCommunityIcons name="car" size={44} color="#FFD60A" />
            </View>
            <Text style={styles.confirmTitle}>Resumen de tu solicitud</Text>
            <Text style={styles.confirmSubtitle}>
              Revisa los datos antes de confirmar. ¿Deseas crear esta solicitud?
            </Text>
            <View style={styles.confirmSummary}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Nombre del servicio</Text>
                <Text style={styles.confirmValue} numberOfLines={1}>{nombreSolicitud.trim() || '—'}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Vehículo</Text>
                <Text style={styles.confirmValue} numberOfLines={1}>{vehicleSummaryWithYear}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Categoría</Text>
                <Text style={styles.confirmValue} numberOfLines={1}>{categoryLabel}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Urgencia</Text>
                <Text style={styles.confirmValue}>{urgencia}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Ubicación</Text>
                <Text style={styles.confirmValue} numberOfLines={2}>{locationPreview}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Fotos</Text>
                <Text style={styles.confirmValue}>{fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Descripción</Text>
                <Text style={styles.confirmValue} numberOfLines={3}>{descripcionPreview}</Text>
              </View>
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setConfirmModalVisible(false)}
                activeOpacity={0.8}>
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmitBtn}
                onPress={() => handleSubmit()}
                activeOpacity={0.85}>
                <Text style={styles.confirmSubmitText}>Sí, crear solicitud</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.mapOverlay}>
          <View style={styles.mapSheet}>
            <View style={styles.mapSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.mapSheetTitle}>Selecciona tu ubicación</Text>
                <TouchableOpacity
                  onPress={() => {
                    setLocationModalVisible(false);
                    setLocationFullScreenVisible(true);
                  }}
                  style={styles.mapSheetFullScreenBtn}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons name="fullscreen" size={20} color="#2D3261" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                style={styles.mapSheetCloseBtn}
                activeOpacity={0.8}>
                <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.mapSheetSubtitle}>
              Toca el mapa para fijar el punto exacto donde te encuentras.
            </Text>

            <View style={styles.mapMockArea}>
              <SolicitudLocationMap
                style={styles.map}
                latitude={mapSelection.latitude}
                longitude={mapSelection.longitude}
                onPress={handleMapPress}
                showsUserLocation
                polylineFrom={selectedLocation || null}
                polylineTo={selectedLocation ? mapSelection : null}
              />
            </View>

            <View style={styles.mapCoordsBox}>
              <Text style={styles.mapCoordsText}>
                Lat: {mapSelection.latitude} · Lng: {mapSelection.longitude}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.mapApplyBtn}
              onPress={() => {
                setSelectedLocation({
                  latitude: mapSelection.latitude,
                  longitude: mapSelection.longitude,
                });
                setLocationModalVisible(false);
              }}
              activeOpacity={0.85}>
              <Text style={styles.mapApplyBtnText}>Usar esta ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={locationFullScreenVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setLocationFullScreenVisible(false)}>
        <View style={styles.mapFullScreenContainer}>
          <View
            style={[
              styles.mapFullScreenHeader,
              { paddingTop: Platform.OS === 'ios' ? 54 : 24 },
            ]}>
            <TouchableOpacity
              onPress={() => {
                setLocationFullScreenVisible(false);
                setLocationModalVisible(true);
              }}
              style={styles.mapSheetCloseBtn}
              activeOpacity={0.8}>
              <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.mapFullScreenTitle}>Mapa a pantalla completa</Text>
          </View>

          <SolicitudLocationMap
            style={styles.mapFullScreenMap}
            latitude={mapSelection.latitude}
            longitude={mapSelection.longitude}
            onPress={handleMapPress}
            showsUserLocation
          />

          <View style={styles.mapFooter}>
            <TouchableOpacity
              style={styles.mapConfirmBtn}
              onPress={() => {
                setSelectedLocation({
                  latitude: mapSelection.latitude,
                  longitude: mapSelection.longitude,
                });
                setLocationFullScreenVisible(false);
              }}
              activeOpacity={0.85}>
              <Text style={styles.mapConfirmText}>Usar esta ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={goToHome}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <MaterialCommunityIcons name="check-circle" size={52} color="#11A679" />
            </View>
            <Text style={styles.successTitle}>¡Solicitud creada!</Text>
            <Text style={styles.successMessage}>
              Tu solicitud de servicio ha sido registrada correctamente. Te contactaremos pronto.
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={goToHome} activeOpacity={0.85}>
              <Text style={styles.successBtnText}>Ir al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SolicitudServicio;
