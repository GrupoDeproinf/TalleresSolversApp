import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import appColors from '../../../../themes/appColors';
import styles from './style.css';
import api from '../../../../../axiosInstance';

const TIPO_VEHICULO_OPTIONS_FALLBACK = [
  { label: 'Automóvil', value: 'Automóvil' },
  { label: 'Moto', value: 'Moto' },
  { label: 'Camión', value: 'Camión' },
  { label: 'Camioneta', value: 'Camioneta' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Bus', value: 'Bus' },
  { label: 'Otro', value: 'Otro' },
];

const timestampToDate = (ts) => {
  if (!ts) return null;

  // Ya viene como Date
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? null : ts;
  }

  // Viene como string o number (ISO, millis, etc.)
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }

  // Viene como objeto tipo timestamp de Firebase {_seconds, _nanoseconds} o {seconds}
  if (typeof ts === 'object') {
    const sec = ts?._seconds ?? ts?.seconds;
    if (sec == null) return null;
    const d = new Date(sec * 1000);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const dateToTimestamp = (d) =>
  d instanceof Date && !isNaN(d.getTime()) ? Math.floor(d.getTime() / 1000) : null;

const formatDateDisplay = (d) =>
  d instanceof Date && !isNaN(d.getTime())
    ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

const DEFAULT_VALUES = {
  vehiculo_placa: '',
  vehiculo_marca: '',
  vehiculo_modelo: '',
  vehiculo_anio: '',
  vehiculo_color: '',
  tipo_vehiculo: '',
  uid_tipo_vehiculo: '',
  KM: '',
  KM_correa_tiempo: '',
  KM_ultima_rotacion_cauchos: '',
  proximo_cambio_aceite: null,
  ultimo_cambio_bujias_filtro: null,
  ultimo_cambio_pila_gasolina: null,
  ultimo_lavado: null,
  ultima_vez_gasolina: null,
  ultima_vez_alineacion: null,
  contratacion_RCV: false,
  grua: false,
  activo: true,
  por_defecto: false,
  path: '',
  imagen_base64: '',
};

/**
 * Modal reutilizable con formulario para crear/editar vehículo.
 * @param {boolean} visible - Si el modal está visible
 * @param {function} onClose - Callback al cerrar (sin guardar)
 * @param {function} onSubmit - Callback al guardar (recibe objeto con los campos del formulario)
 * @param {object} initialValues - Valores iniciales para edición (opcional)
 */
const DATE_FIELDS = [
  { key: 'proximo_cambio_aceite', label: 'Próximo cambio de aceite' },
  { key: 'ultimo_cambio_bujias_filtro', label: 'Último cambio bujías/filtro' },
  { key: 'ultimo_cambio_pila_gasolina', label: 'Último cambio pila gasolina' },
  { key: 'ultimo_lavado', label: 'Último lavado' },
  { key: 'ultima_vez_gasolina', label: 'Último abastecimiento de combustible' },
  { key: 'ultima_vez_alineacion', label: 'Última alineación de ruedas' },
];

const VehicleFormModal = ({ visible, onClose, onSubmit, initialValues }) => {
  const [form, setForm] = useState(DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);
  const [tipoVehiculoOptions, setTipoVehiculoOptions] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({ 1: true, 2: false, 3: false });
  const [datePickerModal, setDatePickerModal] = useState({
    visible: false,
    fieldKey: null,
    tempDate: new Date(),
  });

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState('');

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoadingTipos(true);
    api
      .get('usuarios/getTiposVehiculo', {})
      .then((response) => {
        if (cancelled) return;
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.data ?? data ?? [];
        const options = list.map((item) => ({
          label: item.nombre ?? item.label ?? String(item.id ?? ''),
          value: String(item.id ?? ''),
        })).filter((o) => o.value && o.label);
        setTipoVehiculoOptions(options.length ? options : TIPO_VEHICULO_OPTIONS_FALLBACK);
      })
      .catch(() => {
        if (!cancelled) setTipoVehiculoOptions(TIPO_VEHICULO_OPTIONS_FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoadingTipos(false);
      });
    return () => { cancelled = true; };
  }, [visible]);

  const toggleStep = (step) => {
    setExpandedSteps((prev) => ({
      1: false,
      2: false,
      3: false,
      [step]: !prev[step],
    }));
  };

  useEffect(() => {
    if (visible) {
      setExpandedSteps({ 1: true, 2: false, 3: false });
      setForm(
        initialValues && typeof initialValues === 'object'
          ? {
            vehiculo_placa: String(initialValues?.vehiculo_placa ?? ''),
            vehiculo_marca: String(initialValues?.vehiculo_marca ?? ''),
            vehiculo_modelo: String(initialValues?.vehiculo_modelo ?? ''),
            vehiculo_anio: String(initialValues?.vehiculo_anio ?? ''),
            vehiculo_color: String(initialValues?.vehiculo_color ?? ''),
            tipo_vehiculo: String(initialValues?.tipo_vehiculo ?? ''),
            uid_tipo_vehiculo: String(initialValues?.uid_tipo_vehiculo ?? ''),
            KM: String(initialValues?.KM ?? ''),
            KM_correa_tiempo: String(initialValues?.KM_correa_tiempo ?? ''),
            KM_ultima_rotacion_cauchos: String(initialValues?.KM_ultima_rotacion_cauchos ?? ''),
            proximo_cambio_aceite: timestampToDate(initialValues?.proximo_cambio_aceite),
            ultimo_cambio_bujias_filtro: timestampToDate(initialValues?.ultimo_cambio_bujias_filtro),
            ultimo_cambio_pila_gasolina: timestampToDate(initialValues?.ultimo_cambio_pila_gasolina),
            ultimo_lavado: timestampToDate(initialValues?.ultimo_lavado),
            ultima_vez_gasolina: timestampToDate(initialValues?.ultima_vez_gasolina),
            ultima_vez_alineacion: timestampToDate(initialValues?.ultima_vez_alineacion),
            contratacion_RCV: Boolean(initialValues?.contratacion_RCV),
            grua: Boolean(initialValues?.grua),
            activo: initialValues?.activo !== false,
            por_defecto: Boolean(initialValues?.por_defecto),
            path: String(initialValues?.path ?? ''),
            imagen_base64: '',
          }
          : { ...DEFAULT_VALUES }
      );
    }
  }, [visible, initialValues]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const openDatePicker = (fieldKey) => {
    const current = form[fieldKey];
    setDatePickerModal({
      visible: true,
      fieldKey,
      tempDate: current instanceof Date && !isNaN(current.getTime()) ? current : new Date(),
    });
  };

  const closeDatePicker = () => {
    setDatePickerModal(prev => ({ ...prev, visible: false, fieldKey: null }));
  };

  const confirmDatePicker = () => {
    if (datePickerModal.fieldKey) {
      updateField(datePickerModal.fieldKey, datePickerModal.tempDate);
    }
    closeDatePicker();
  };

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
    if (target === 'imagen') {
      setForm(prev => ({ ...prev, path: uri, imagen_base64: b64 }));
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
        { mediaType: 'photo', selectionLimit: 1, includeBase64: true },
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64 ?? '');
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
        { mediaType: 'photo', includeBase64: true },
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64 ?? '');
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

  const pickVehicleImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1, includeBase64: true },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) return;
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        const base64 = asset?.base64 ?? '';
        if (uri) {
          setForm((prev) => ({ ...prev, path: uri, imagen_base64: base64 }));
        }
      }
    );
  };

  const clearVehicleImage = () => {
    setForm((prev) => ({ ...prev, path: '', imagen_base64: '' }));
  };

  const handleSubmit = async () => {
    const marca = (form.vehiculo_marca || '').trim();
    const modelo = (form.vehiculo_modelo || '').trim();
    const anio = (form.vehiculo_anio || '').trim();
    const km = (form.KM || '').trim();
    if (!marca) {
      Alert.alert('Campo requerido', 'La marca del vehículo es obligatoria.');
      return;
    }
    if (!modelo) {
      Alert.alert('Campo requerido', 'El modelo del vehículo es obligatorio.');
      return;
    }
    if (!anio) {
      Alert.alert('Campo requerido', 'El año del vehículo es obligatorio.');
      return;
    }
    if (!km) {
      Alert.alert('Campo requerido', 'El kilometraje del vehículo es obligatorio.');
      return;
    }

    let uiduser = '';
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      uiduser = user?.uid ?? user?.id ?? '';
    } catch (_) { }

    const uidvehicle = initialValues?.id != null ? String(initialValues.id) : '';

    const imagen_base64 = (form.imagen_base64 || '').trim() || null;

    const safeDate = (d) =>
      d instanceof Date && !isNaN(d.getTime()) ? d : null;

    const payload = {
      uiduser,
      uidvehicle,
      vehiculo_placa: (form.vehiculo_placa || '').trim() || null,
      vehiculo_marca: marca,
      vehiculo_modelo: modelo,
      vehiculo_anio: parseInt(anio, 10),
      vehiculo_color: (form.vehiculo_color || '').trim() || null,
      tipo_vehiculo: (form.tipo_vehiculo || '').trim() || null,
      uid_tipo_vehiculo: (form.uid_tipo_vehiculo || '').trim() || null,
      KM: parseInt(km, 10),
      KM_correa_tiempo: form.KM_correa_tiempo ? parseInt(form.KM_correa_tiempo, 10) : null,
      KM_ultima_rotacion_cauchos: form.KM_ultima_rotacion_cauchos ? parseInt(form.KM_ultima_rotacion_cauchos, 10) : null,
      proximo_cambio_aceite: safeDate(form.proximo_cambio_aceite),
      ultimo_cambio_bujias_filtro: safeDate(form.ultimo_cambio_bujias_filtro),
      ultimo_cambio_pila_gasolina: safeDate(form.ultimo_cambio_pila_gasolina),
      ultimo_lavado: safeDate(form.ultimo_lavado),
      ultima_vez_gasolina: safeDate(form.ultima_vez_gasolina),
      ultima_vez_alineacion: safeDate(form.ultima_vez_alineacion),
      contratacion_RCV: form.contratacion_RCV,
      grua: form.grua,
      activo: form.activo,
      por_defecto: form.por_defecto,
      imagen_base64,
    };

    console.log('Payload a enviar a la API:', payload);

    setSaving(true);
    try {
      await onSubmit?.(payload);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -220 : 0}>
        <View style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>
                {initialValues?.id != null ? 'Editar vehículo' : 'Nuevo vehículo'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {initialValues?.id != null
                  ? 'Actualiza los datos y guarda los cambios.'
                  : 'Puedes guardar ahora y completar o editar los datos después.'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icons name="times" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">

            {/* Paso 1: Información del vehículo */}
            <View style={styles.stepSection}>
              <TouchableOpacity
                style={[styles.stepHeader, expandedSteps[1] && styles.stepHeaderExpanded]}
                onPress={() => toggleStep(1)}
                activeOpacity={0.7}>
                <View style={styles.stepHeaderLeft}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>1</Text>
                  </View>
                  <Text style={styles.stepTitle}>Información del vehículo</Text>
                </View>
                <Icons
                  name={expandedSteps[1] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={appColors?.primary}
                />
              </TouchableOpacity>
              {expandedSteps[1] && (
                <View style={styles.stepCard}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Placa (opcional)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.vehiculo_placa}
                      onChangeText={v => updateField('vehiculo_placa', v)}
                      placeholder="Ej: ABC123"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="characters"
                      returnKeyType="done"
                    />
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Marca <Text style={styles.labelRequired}>*</Text></Text>
                      <TextInput
                        style={styles.input}
                        value={form.vehiculo_marca}
                        onChangeText={v => updateField('vehiculo_marca', v)}
                        placeholder="Ej: Toyota"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Modelo <Text style={styles.labelRequired}>*</Text></Text>
                      <TextInput
                        style={styles.input}
                        value={form.vehiculo_modelo}
                        onChangeText={v => updateField('vehiculo_modelo', v)}
                        placeholder="Ej: Corolla"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Año <Text style={styles.labelRequired}>*</Text></Text>
                      <TextInput
                        style={styles.input}
                        value={form.vehiculo_anio}
                        onChangeText={v => updateField('vehiculo_anio', v.replace(/\D/g, '').slice(0, 4))}
                        placeholder="Ej: 2022"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Color</Text>
                      <TextInput
                        style={styles.input}
                        value={form.vehiculo_color}
                        onChangeText={v => updateField('vehiculo_color', v)}
                        placeholder="Ej: Blanco"
                        placeholderTextColor="#9CA3AF"
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Tipo de vehículo</Text>
                    {loadingTipos ? (
                      <View style={[styles.input, { justifyContent: 'center' }]}>
                        <ActivityIndicator size="small" color={appColors?.primary} />
                      </View>
                    ) : (
                      <Dropdown
                        keyboardAvoiding={true}
                        style={styles.dropdown}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        data={tipoVehiculoOptions.length ? tipoVehiculoOptions : TIPO_VEHICULO_OPTIONS_FALLBACK}
                        labelField="label"
                        valueField="value"
                        placeholder="Seleccione tipo de vehículo"
                        value={form.uid_tipo_vehiculo}
                        onChange={(item) => {
                          updateField('uid_tipo_vehiculo', item?.value ?? '');
                          updateField('tipo_vehiculo', item?.label ?? '');
                        }}
                        search={true}
                      />
                    )}
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      Kilometraje (KM) <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={form.KM}
                      onChangeText={v => updateField('KM', v.replace(/\D/g, ''))}
                      placeholder="Ej: 50000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Paso 2: Servicios */}
            <View style={styles.stepSection}>
              <TouchableOpacity
                style={[styles.stepHeader, expandedSteps[2] && styles.stepHeaderExpanded]}
                onPress={() => toggleStep(2)}
                activeOpacity={0.7}>
                <View style={styles.stepHeaderLeft}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>2</Text>
                  </View>
                  <Text style={styles.stepTitle}>Servicios</Text>
                </View>
                <Icons
                  name={expandedSteps[2] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={appColors?.primary}
                />
              </TouchableOpacity>
              {expandedSteps[2] && (
                <View style={styles.stepCard}>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>KM correa de tiempo</Text>
                      <TextInput
                        style={styles.input}
                        value={form.KM_correa_tiempo}
                        onChangeText={v => updateField('KM_correa_tiempo', v.replace(/\D/g, ''))}
                        placeholder="Ej: 50000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Último lavado</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('ultimo_lavado')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.ultimo_lavado && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.ultimo_lavado) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Último cambio bujías/filtro</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('ultimo_cambio_bujias_filtro')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.ultimo_cambio_bujias_filtro && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.ultimo_cambio_bujias_filtro) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Próximo cambio de aceite</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('proximo_cambio_aceite')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.proximo_cambio_aceite && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.proximo_cambio_aceite) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>KM última rotación ruedas</Text>
                      <TextInput
                        style={styles.input}
                        value={form.KM_ultima_rotacion_cauchos}
                        onChangeText={v => updateField('KM_ultima_rotacion_cauchos', v.replace(/\D/g, ''))}
                        placeholder="Ej: 45000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Último mantenimiento al sistema de inyección</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('ultimo_cambio_pila_gasolina')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.ultimo_cambio_pila_gasolina && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.ultimo_cambio_pila_gasolina) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Último abastecimiento de combustible</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('ultima_vez_gasolina')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.ultima_vez_gasolina && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.ultima_vez_gasolina) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.field, styles.rowHalf]}>
                      <Text style={styles.label}>Última alineación de ruedas</Text>
                      <TouchableOpacity
                        style={styles.dateInputTouchable}
                        onPress={() => openDatePicker('ultima_vez_alineacion')}
                        activeOpacity={0.7}>
                        <Text style={[styles.dateInputText, !form.ultima_vez_alineacion && styles.dateInputPlaceholder]} numberOfLines={1}>
                          {formatDateDisplay(form.ultima_vez_alineacion) || 'Fecha'}
                        </Text>
                        <Icons name="calendar-o" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Contratación RCV</Text>
                    <Switch
                      value={form.contratacion_RCV}
                      onValueChange={v => updateField('contratacion_RCV', v)}
                      trackColor={{ false: '#E5E7EB', true: appColors?.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Grúa</Text>
                    <Switch
                      value={form.grua}
                      onValueChange={v => updateField('grua', v)}
                      trackColor={{ false: '#E5E7EB', true: appColors?.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Vehículo activo</Text>
                    <Switch
                      value={form.activo}
                      onValueChange={v => updateField('activo', v)}
                      trackColor={{ false: '#E5E7EB', true: appColors?.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Vehículo predeterminado</Text>
                    <Switch
                      value={form.por_defecto}
                      onValueChange={v => updateField('por_defecto', v)}
                      trackColor={{ false: '#E5E7EB', true: appColors?.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Paso 3: Imagen - deshabilitado (ya no es necesario seleccionar imagen)
            <View style={styles.stepSection}>
              <TouchableOpacity
                style={[styles.stepHeader, expandedSteps[3] && styles.stepHeaderExpanded]}
                onPress={() => toggleStep(3)}
                activeOpacity={0.7}>
                <View style={styles.stepHeaderLeft}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>3</Text>
                  </View>
                  <Text style={styles.stepTitle}>Imagen</Text>
                </View>
                <Icons
                  name={expandedSteps[3] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={appColors?.primary}
                />
              </TouchableOpacity>
              {expandedSteps[3] && (
                <View style={styles.stepCard}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Imagen del vehículo</Text>
                    <Text style={styles.fieldHint}>Solo una foto. Toca el recuadro para elegir desde la galería.</Text>
                    <TouchableOpacity
                      style={styles.imagePickTouchable}
                      onPress={() => openPhotoOptions('imagen')}
                      activeOpacity={0.8}>
                      {form.path ? (
                        <View style={styles.imagePreviewWrap}>
                          <Image source={{ uri: form.path }} style={styles.imagePreview} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.imageRemoveBtn}
                            onPress={clearVehicleImage}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <Icons name="times-circle" size={28} color="#E53935" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Icons name="camera" size={40} color="#9CA3AF" />
                          <Text style={styles.imagePlaceholderText}>Toca para cargar una foto</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            */}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text style={styles.btnTextSecondary}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.8}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.btnTextPrimary}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={datePickerModal.visible}
        transparent
        animationType="fade">
        <TouchableOpacity
          style={styles.datePickerOverlay}
          activeOpacity={1}
          onPress={closeDatePicker}>
          <TouchableOpacity activeOpacity={1} onPress={() => { }} style={styles.datePickerBox}>
            <Text style={styles.datePickerTitle}>
              {DATE_FIELDS.find((f) => f.key === datePickerModal.fieldKey)?.label ?? 'Fecha'}
            </Text>
            <DatePicker
              // maximumDate={new Date()}
              date={datePickerModal.tempDate}
              onDateChange={(d) => setDatePickerModal((prev) => ({ ...prev, tempDate: d }))}
              theme="light"
              mode="date"
              style={styles.datePicker}
              locale="es"
            />
            <View style={styles.datePickerFooter}>
              <TouchableOpacity style={styles.datePickerBtnCancel} onPress={closeDatePicker}>
                <Text style={styles.datePickerBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerBtnConfirm} onPress={confirmDatePicker}>
                <Text style={styles.datePickerBtnConfirmText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
    </Modal>
  );
};

export default VehicleFormModal;
