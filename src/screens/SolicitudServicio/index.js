import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icons2 from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appColors from '../../themes/appColors';
import styles from './style.css';
import api from '../../../axiosInstance';

const MAPBOX_TOKEN = 'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

const buildLocationPickerHTML = (lat, lng) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,sans-serif;background:#1D1E56;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none!important;}
    /* Crosshair pin fijo en el centro */
    #pin{
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-100%);
      z-index:10;pointer-events:none;
    }
    #pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));}
    /* Panel inferior */
    #bottom{
      position:absolute;bottom:0;left:0;right:0;
      background:#1D1E56;border-radius:22px 22px 0 0;
      padding:16px 20px 40px;
      box-shadow:0 -4px 24px rgba(0,0,0,0.4);
      z-index:20;
    }
    #handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px;}
    #confirm-btn{
      width:100%;padding:17px 0;border:none;border-radius:16px;
      background:#FFD60A;font-size:16px;font-weight:900;
      color:#1D1E56;cursor:pointer;letter-spacing:0.2px;
    }
    /* Indicador "Mueve el mapa" */
    #hint{
      position:absolute;top:80px;left:50%;transform:translateX(-50%);
      background:rgba(29,30,86,0.82);border-radius:20px;
      padding:7px 16px;z-index:15;pointer-events:none;
      white-space:nowrap;
    }
    #hint span{font-size:12px;color:#FFFFFF;font-weight:600;}
    /* Botón mi ubicación */
    #locate-btn{
      position:absolute;top:16px;right:16px;
      width:46px;height:46px;border-radius:23px;
      background:#FFFFFF;border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.3);z-index:15;
      transition:opacity 0.2s;
    }
    #locate-btn.loading{opacity:0.5;pointer-events:none;}
    @keyframes spin{to{transform:rotate(360deg);}}
    #locate-btn.loading svg{animation:spin 0.9s linear infinite;}
  </style>
</head>
<body>
<div id="map"></div>
<div id="pin">
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#E11D48"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
  </svg>
</div>
<div id="hint"><span>Mueve el mapa para ajustar el pin</span></div>
<button id="locate-btn" onclick="requestLocation()">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="#1D1E56" stroke-width="2.2"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1D1E56" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
</button>
<div id="bottom">
  <div id="handle"></div>
  <button id="confirm-btn" onclick="confirm()">Usar esta ubicación</button>
</div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({
  container:'map',style:'mapbox://styles/mapbox/streets-v12',
  center:[${lng},${lat}],zoom:15,
  attributionControl:false
});
var currentLng=${lng},currentLat=${lat};
map.on('move',function(){
  var c=map.getCenter();
  currentLng=+c.lng.toFixed(6);currentLat=+c.lat.toFixed(6);
});
// Hide hint after 3s
setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);
function confirm(){
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
    JSON.stringify({type:'confirm',lat:currentLat,lng:currentLng})
  );
}
function requestLocation(){
  var btn=document.getElementById('locate-btn');
  if(btn)btn.classList.add('loading');
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
    JSON.stringify({type:'requestLocation'})
  );
}
window.flyToLocation=function(lat,lng){
  currentLat=lat;currentLng=lng;
  map.flyTo({center:[lng,lat],zoom:16,duration:800,essential:true});
  var btn=document.getElementById('locate-btn');
  if(btn)btn.classList.remove('loading');
};
<\/script>
</body>
</html>`;

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

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState('');
  const [urgencia, setUrgencia] = useState('Normal');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const locationWebViewRef = useRef(null);
  const [mapSelection, setMapSelection] = useState({
    latitude: 10.4806,
    longitude: -66.9036,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationManuallyModified, setLocationManuallyModified] = useState(false);

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

  const fileToBase64 = uri =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });

  const applyPhotoResult = (target, uri, b64) => {
    if (target === 'foto') {
      setFotos(prev => [...prev, { uri, base64: b64 }].slice(0, 5));
    }
  };

  const openPhotoOptions = target => {
    setPhotoModalTarget(target);
    setPhotoModalVisible(true);
  };

  const handlePickGallery = () => {
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary(
        { mediaType: 'photo', includeBase64: true, selectionLimit: 5 - fotos.length, quality: 0.4, maxWidth: 1024, maxHeight: 1024 },
        response => {
          if (response.didCancel || response.errorCode) return;
          (response.assets || []).forEach(a => {
            if (a.uri) applyPhotoResult(photoModalTarget, a.uri, a.base64 || '');
          });
        },
      );
    }, 400);
  };

  const handlePickCamera = async () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera(
        { mediaType: 'photo', includeBase64: true, quality: 0.4, maxWidth: 1024, maxHeight: 1024 },
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset?.uri) applyPhotoResult(photoModalTarget, asset.uri, asset.base64 || '');
        },
      );
    }, 400);
  };

  const handlePickDocument = () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      try {
        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
        const b64 = await fileToBase64(res.uri);
        applyPhotoResult(photoModalTarget, res.uri, b64);
      } catch (e) {
        if (!DocumentPicker.isCancel(e)) console.warn(e);
      }
    }, 400);
  };

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

  const handleLocationMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'confirm') {
        setSelectedLocation({ latitude: msg.lat, longitude: msg.lng });
        setMapSelection({ latitude: msg.lat, longitude: msg.lng });
        setLocationManuallyModified(true);
        setLocationModalVisible(false);
      } else if (msg.type === 'requestLocation') {
        Geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            locationWebViewRef.current?.injectJavaScript(
              `window.flyToLocation(${lat}, ${lng}); true;`
            );
          },
          () => {
            locationWebViewRef.current?.injectJavaScript(
              `var b=document.getElementById('locate-btn');if(b)b.classList.remove('loading'); true;`
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
        );
      }
    } catch (_) {}
  };


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
                <TouchableOpacity style={styles.photoAddBtn} onPress={() => openPhotoOptions('foto')} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera-plus" size={28} color={appColors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>
              Ubicación actual <Text style={styles.labelRequired}>*</Text>
            </Text>
            <View style={styles.locationCard}>
              <View style={[styles.locationBadge, selectedLocation && { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons
                  name={selectedLocation ? 'map-marker-check' : 'map-marker-radius'}
                  size={18}
                  color={selectedLocation ? '#16A34A' : '#2D3261'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.locationTitle}>Ubicación del servicio</Text>
                  {selectedLocation && (
                    <View style={[
                      styles.locationTakenBadge,
                      locationManuallyModified && { backgroundColor: '#DBEAFE' },
                    ]}>
                      <Text style={[
                        styles.locationTakenText,
                        locationManuallyModified && { color: '#1D4ED8' },
                      ]}>
                        {locationManuallyModified ? 'Modificada' : 'Tomada'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationCoords} numberOfLines={1}>
                  {selectedLocation ? 'Ubicación capturada correctamente' : 'Aún no has seleccionado una ubicación'}
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
        transparent={false}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#1D1E56' }}>
          {/* Header */}
          <View style={styles.mapFullScreenHeader}>
            <TouchableOpacity
              onPress={() => setLocationModalVisible(false)}
              style={styles.mapSheetCloseBtn}
              activeOpacity={0.8}>
              <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.mapFullScreenTitle}>Selecciona tu ubicación</Text>
            <View style={{ width: 36 }} />
          </View>
          {/* Mapbox WebView */}
          <WebView
            ref={locationWebViewRef}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            source={{ html: buildLocationPickerHTML(mapSelection.latitude, mapSelection.longitude) }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleLocationMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D1E56' }}>
                <ActivityIndicator size="large" color="#FFD60A" />
              </View>
            )}
          />
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

      {/* ── Modal selector de foto ────────────────────────────────────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,68,0.55)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPhotoModalVisible(false)} />
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 22 }} />
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2344', textAlign: 'center', marginBottom: 6 }}>
              Adjuntar imagen o archivo
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              Seleccione una opción para capturar{'\n'}la imagen y comprobar el documento
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Documento', icon: 'document-attach-outline', onPress: handlePickDocument },
                { label: 'Galería',   icon: 'images-outline',          onPress: handlePickGallery },
                { label: 'Cámara',    icon: 'camera-outline',          onPress: handlePickCamera },
              ].map(({ label, icon, onPress }) => (
                <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.75}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20,
                    borderRadius: 18, backgroundColor: '#F0F1FA', borderWidth: 1.5, borderColor: '#2D3261' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#2D3261',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icons2 name={icon} size={26} color="#FFD60A" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)}
              style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: '#F0F1FA', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SolicitudServicio;
