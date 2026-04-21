import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import {countActiveMaintenanceByAlertLevel} from '../../../utils/homeMaintenanceDue';
import {useValues} from '../../../../App';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import styles from './style.css';
import Icons2 from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import VehicleFormModal from './VehicleFormModal';
import vehicleFormStyles from './VehicleFormModal/style.css';
import {ArrowLeft} from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import {launchImageLibrary} from 'react-native-image-picker';

const getVehicleKey = item =>
  String(item?.id ?? item?.uid ?? item?.vehiculo_uid ?? '').trim();

const formatRevisionDate = value => {
  if (value == null || value === '') return '—';
  const localeOpts = {day: 'numeric', month: 'short', year: 'numeric'};
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        const d = value.toDate();
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-ES', localeOpts);
      } catch (_) {}
    }
    const sec = value?._seconds ?? value?.seconds;
    if (sec != null) {
      const d = new Date(Number(sec) * 1000);
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-ES', localeOpts);
    }
    return '—';
  }
  const raw = String(value).trim();
  if (!raw || raw === '—' || raw === '--') return '—';
  const normalized = raw.replace(/-/g, '/');
  const slashParts = normalized.split('/');
  if (slashParts.length === 3) {
    const y0 = String(slashParts[0]);
    const y2 = String(slashParts[2]);
    if (y0.length === 4) {
      const d = new Date(Number(slashParts[0]), Number(slashParts[1]) - 1, Number(slashParts[2]));
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-ES', localeOpts);
    }
    if (y2.length === 4) {
      const d = new Date(Number(slashParts[2]), Number(slashParts[1]) - 1, Number(slashParts[0]));
      if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-ES', localeOpts);
    }
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('es-ES', localeOpts);
  return raw;
};

const revisionHasData = value => formatRevisionDate(value) !== '—';

const buildVehicleNotificationsMap = (notificacionesVehiculos, vehiclesList) => {
  const map = {};
  if (!Array.isArray(notificacionesVehiculos)) return map;

  const vehicleById = {};
  for (const v of vehiclesList || []) {
    const k = getVehicleKey(v);
    if (k) vehicleById[k] = v;
  }

  for (const entry of notificacionesVehiculos) {
    const vid = String(entry?.uidvehicle ?? '').trim();
    if (!vid) continue;

    const vehicle = vehicleById[vid] ?? {};
    const {vencidos, porVencer, alDia, totalActive} = countActiveMaintenanceByAlertLevel(
      vehicle,
      entry,
    );

    const notificaciones = Array.isArray(entry?.notificaciones) ? entry.notificaciones : [];
    const filtered = notificaciones
      .filter(n => n?.active === true)
      .map((n, idx) => ({
        id: String(n?.id ?? n?.uid ?? n?.secretCode ?? idx),
        nombre: String(n?.nombre ?? '').trim() || 'Mantenimiento',
        secretCode: n?.secretCode,
        ultimaRevision: n?.ultimaRevision ?? n?.ultima_revision,
        proximaRevision: n?.proximaRevision ?? n?.proxima_revision ?? n?.dateRecommended,
      }))
      .filter(
        row =>
          revisionHasData(row.ultimaRevision) && revisionHasData(row.proximaRevision),
      );
    const total = filtered.length;
    const items = filtered.slice(0, 2);

    map[vid] = {items, total, vencidos, porVencer, alDia, totalActive};
  }

  return map;
};

const timestampToDateDriverDocs = ts => {
  if (!ts) return null;
  if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'object') {
    const sec = ts?._seconds ?? ts?.seconds;
    if (sec == null) return null;
    const d = new Date(Number(sec) * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/** RCV / trimestre en la tarjeta de vehículo (mismo criterio que timestamps de Firestore). */
const DOC_EXPIRY_SOON_DAYS = 30;

const parseVehicleExpiryDate = value => {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return null;
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        const d = value.toDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : null;
      } catch (_) {}
    }
    const sec = value?._seconds ?? value?.seconds;
    if (sec != null) {
      const d = new Date(Number(sec) * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
};

const startOfLocalDayMs = d =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const daysFromTodayToExpiry = expiryDate => {
  const t0 = startOfLocalDayMs(new Date());
  const t1 = startOfLocalDayMs(expiryDate);
  return Math.round((t1 - t0) / 86400000);
};

const getVehicleDocExpiryMeta = expiryDate => {
  const days = daysFromTodayToExpiry(expiryDate);
  if (days < 0) return {status: 'expired', days};
  if (days === 0) return {status: 'soon', days: 0};
  if (days <= DOC_EXPIRY_SOON_DAYS) return {status: 'soon', days};
  return {status: 'ok', days};
};

const formatVehicleExpiryCardDate = d =>
  d
    .toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(/\s/g, ' ');

/** Mini-tarjeta RCV / trimestre; palpita si el documento está vencido. */
const DocExpiryPill = ({shortLabel, date}) => {
  const meta = getVehicleDocExpiryMeta(date);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (meta.status !== 'expired') {
      pulse.setValue(1);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 0.42, duration: 700, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1, duration: 700, useNativeDriver: true}),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [meta.status, pulse]);

  const statusText =
    meta.status === 'expired'
      ? meta.days <= -2
        ? `Vencido · hace ${Math.abs(meta.days)} d.`
        : meta.days === -1
          ? 'Vencido · ayer'
          : 'Vencido'
      : meta.status === 'soon'
        ? meta.days === 0
          ? 'Vence hoy'
          : meta.days === 1
            ? 'Vence mañana'
            : `Quedan ${meta.days} d.`
        : 'Al día';
  const pillStyle =
    meta.status === 'expired'
      ? styles.cardDocExpiryPillExpired
      : meta.status === 'soon'
        ? styles.cardDocExpiryPillSoon
        : styles.cardDocExpiryPillOk;
  const detailStyle =
    meta.status === 'expired'
      ? styles.cardDocExpiryTextExpired
      : meta.status === 'soon'
        ? styles.cardDocExpiryTextSoon
        : styles.cardDocExpiryTextOk;

  const cardBody = (
    <View style={[styles.cardDocExpiryCard, pillStyle]}>
      <Text style={styles.cardDocExpiryCardTitle}>{shortLabel}</Text>
      <Text style={styles.cardDocExpiryCardDate} numberOfLines={1}>
        {formatVehicleExpiryCardDate(date)}
      </Text>
      <Text style={[styles.cardDocExpiryCardStatus, detailStyle]} numberOfLines={2}>
        {statusText}
      </Text>
    </View>
  );

  if (meta.status === 'expired') {
    return (
      <Animated.View style={[styles.cardDocExpiryCardWrap, {opacity: pulse}]}>
        {cardBody}
      </Animated.View>
    );
  }
  return <View style={styles.cardDocExpiryCardWrap}>{cardBody}</View>;
};

const isRemoteDriverDocUrl = uri =>
  /^https?:\/\//i.test(String(uri ?? '').trim());

/** Misma regla que vehículo: en *_base64 va base64 nuevo o URL si no hubo cambio. */
const driverDocBase64FieldValue = (uri, b64, initialUrlFromGet) => {
  const b = String(b64 ?? '').trim();
  const u = String(uri ?? '').trim();
  if (b) return b;
  if (isRemoteDriverDocUrl(u)) return u;
  const iu = String(initialUrlFromGet ?? '').trim();
  if (iu) return null;
  return null;
};

const formatDriverDocDate = d =>
  d instanceof Date && !isNaN(d.getTime())
    ? d.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})
    : '';

const emptyDriverDocsForm = () => ({
  licencia_frente_uri: '',
  licencia_frente_b64: '',
  licencia_reverso_uri: '',
  licencia_reverso_b64: '',
  licencia_vencimiento: null,
  cert_med_frente_uri: '',
  cert_med_frente_b64: '',
  cert_med_reverso_uri: '',
  cert_med_reverso_b64: '',
  cert_med_vencimiento: null,
});

const emptyDriverDocsInitialUrls = () => ({
  licencia_frente: '',
  licencia_reverso: '',
  cert_med_frente: '',
  cert_med_reverso: '',
});

/** Une userData / data / user / userData anidado para leer los mismos campos que devuelve el GET. */
const flattenUserDataFromGetUserResponse = data => {
  if (!data || typeof data !== 'object') return {};
  let merged = {...data};
  const nest = data.userData ?? data.data ?? data.user;
  if (nest && typeof nest === 'object' && !Array.isArray(nest)) {
    merged = {...merged, ...nest};
    const inner = nest.userData;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = {...merged, ...inner};
    }
  }
  return merged;
};

/**
 * Valor por defecto para la miniatura: URL del GET.
 * Orden: *_url; si no, el mismo campo que en el save (*_base64) cuando el backend devuelve ahí la URL.
 */
const pickDriverDocUrlDefault = (ud, urlFieldKey, saveMirrorBase64Key) => {
  const fromUrl = String(ud?.[urlFieldKey] ?? '').trim();
  if (fromUrl) return fromUrl;
  const fromMirror = String(ud?.[saveMirrorBase64Key] ?? '').trim();
  if (fromMirror) return fromMirror;
  return '';
};

const VehiclesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {textColorStyle, viewRTLStyle, bgFullStyle} = useValues();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [planRequiredModalVisible, setPlanRequiredModalVisible] = useState(false);
  const [plansModalVisible, setPlansModalVisible] = useState(false);
  const [vehicleNotificationsByUid, setVehicleNotificationsByUid] = useState({});
  const [driverDocsModalVisible, setDriverDocsModalVisible] = useState(false);
  const [driverDocsForm, setDriverDocsForm] = useState(emptyDriverDocsForm);
  const [driverDocsInitialUrls, setDriverDocsInitialUrls] = useState(emptyDriverDocsInitialUrls);
  const [driverDocsLoading, setDriverDocsLoading] = useState(false);
  const [driverDocsSaving, setDriverDocsSaving] = useState(false);
  const [driverDocsDatePicker, setDriverDocsDatePicker] = useState({
    visible: false,
    fieldKey: null,
    tempDate: new Date(),
  });
  const [driverDocsImagesExpanded, setDriverDocsImagesExpanded] = useState(false);
  const [driverDocsImagePreview, setDriverDocsImagePreview] = useState(null);

  const driverDocsDatesComplete =
    driverDocsForm.licencia_vencimiento instanceof Date &&
    !isNaN(driverDocsForm.licencia_vencimiento.getTime()) &&
    driverDocsForm.cert_med_vencimiento instanceof Date &&
    !isNaN(driverDocsForm.cert_med_vencimiento.getTime());

  const fetchUserVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (!user) {
        setVehicles([]);
        setVehicleNotificationsByUid({});
        setLoading(false);
        return;
      }

      const uid = user?.uid || user?.id;
      if (!uid) {
        setVehicles([]);
        setVehicleNotificationsByUid({});
        setLoading(false);
        return;
      }

      const [vehiclesRes, userRes] = await Promise.all([
        api.post('usuarios/getVehiculosByUsuarioUid', {uid}),
        api.post('usuarios/getUserByUid', {uid}).catch(e => {
          console.warn('getUserByUid (notificaciones):', e?.message || e);
          return null;
        }),
      ]);

      const data = vehiclesRes?.data;
      console.log('Data vehículos:', data);
      const list = Array.isArray(data) ? data : data?.data ?? [];

      if (userRes?.data) {
        const rawUser = userRes.data;
        const userData =
          rawUser && typeof rawUser === 'object' && !Array.isArray(rawUser) && (rawUser.data || rawUser.user)
            ? rawUser.data || rawUser.user
            : rawUser;
        const notificacionesVehiculos =
          userData?.notificacionesVehiculos ?? userData?.userData?.notificacionesVehiculos ?? [];
        setVehicleNotificationsByUid(
          buildVehicleNotificationsMap(notificacionesVehiculos, list),
        );
      } else {
        setVehicleNotificationsByUid({});
      }

      setVehicles(list);
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al cargar vehículos');
      setVehicles([]);
      setVehicleNotificationsByUid({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserVehicles();
  }, [fetchUserVehicles]);

  useFocusEffect(
    useCallback(() => {
      fetchUserVehicles();
    }, [fetchUserVehicles]),
  );

  /** Al abrir el modal (botón del header): getUserByUid con `uid` del usuario logueado y estado de documentos. */
  const loadDriverDocsFromGetUserByUid = useCallback(async () => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;
    const uid = user?.uid || user?.id || '';
    if (!uid) {
      return {ok: false, reason: 'no_uid'};
    }
    const res = await api.post('usuarios/getUserByUid', {uid});
    const ud = flattenUserDataFromGetUserResponse(res?.data ?? {});
    return {ok: true, ud};
  }, []);

  useEffect(() => {
    if (!driverDocsModalVisible) {
      setDriverDocsImagePreview(null);
      return;
    }
    setDriverDocsImagesExpanded(false);
    let cancelled = false;
    (async () => {
      setDriverDocsLoading(true);
      try {
        const result = await loadDriverDocsFromGetUserByUid();
        if (cancelled) return;
        if (!result.ok) {
          if (result.reason === 'no_uid') {
            setDriverDocsLoading(false);
            return;
          }
        }
        const ud = result.ud ?? {};
        const licF = pickDriverDocUrlDefault(ud, 'licencia_frente_url', 'licencia_frente_base64');
        const licR = pickDriverDocUrlDefault(ud, 'licencia_reverso_url', 'licencia_reverso_base64');
        const cmF = pickDriverDocUrlDefault(
          ud,
          'certificado_medico_frente_url',
          'certificado_medico_frente_base64',
        );
        const cmR = pickDriverDocUrlDefault(
          ud,
          'certificado_medico_reverso_url',
          'certificado_medico_reverso_base64',
        );
        setDriverDocsForm({
          ...emptyDriverDocsForm(),
          licencia_frente_uri: licF,
          licencia_reverso_uri: licR,
          licencia_vencimiento: timestampToDateDriverDocs(ud?.licencia_fecha_vencimiento),
          cert_med_frente_uri: cmF,
          cert_med_reverso_uri: cmR,
          cert_med_vencimiento: timestampToDateDriverDocs(ud?.certificado_medico_fecha_vencimiento),
        });
        setDriverDocsInitialUrls({
          licencia_frente: licF,
          licencia_reverso: licR,
          cert_med_frente: cmF,
          cert_med_reverso: cmR,
        });
      } catch (e) {
        if (!cancelled) {
          Alert.alert(
            'Atención',
            'No se pudieron cargar tus documentos. Puedes cargarlos y guardar de todas formas.',
          );
          setDriverDocsForm(emptyDriverDocsForm());
          setDriverDocsInitialUrls(emptyDriverDocsInitialUrls());
        }
      } finally {
        if (!cancelled) setDriverDocsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driverDocsModalVisible, loadDriverDocsFromGetUserByUid]);

  const pickDriverDocImage = (uriKey, b64Key) => {
    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 1, includeBase64: true},
      response => {
        if (response?.didCancel) return;
        if (response?.errorCode) return;
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        const base64 = asset?.base64 ?? '';
        if (uri) {
          setDriverDocsForm(prev => ({...prev, [uriKey]: uri, [b64Key]: base64}));
        }
      },
    );
  };

  const clearDriverDoc = (uriKey, b64Key) => {
    setDriverDocsForm(prev => ({...prev, [uriKey]: '', [b64Key]: ''}));
  };

  const openDriverDocsImagePreview = useCallback(uri => {
    const u = String(uri ?? '').trim();
    if (u) setDriverDocsImagePreview(u);
  }, []);

  const closeDriverDocsImagePreview = useCallback(() => setDriverDocsImagePreview(null), []);

  const renderDriverDocPhotoSlot = (uriKey, b64Key, previewLabel) => {
    const uri = driverDocsForm[uriKey];
    if (!uri) {
      return (
        <TouchableOpacity
          style={styles.driverDocsPickBtn}
          onPress={() => pickDriverDocImage(uriKey, b64Key)}
          activeOpacity={0.85}>
          <Text style={styles.driverDocsPickText}>Galería</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={[styles.driverDocsPickBtn, styles.driverDocsPickBtnFilled]}>
        <Pressable
          style={styles.driverDocsThumbHit}
          onPress={() => openDriverDocsImagePreview(uri)}
          android_ripple={{color: 'rgba(255,255,255,0.2)'}}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${previewLabel} a pantalla completa`}>
          <Image source={{uri}} style={styles.driverDocsThumb} resizeMode="cover" />
        </Pressable>
        <Pressable
          style={styles.driverDocsExpandPhotoBtn}
          onPress={() => openDriverDocsImagePreview(uri)}
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
          android_ripple={{color: 'rgba(255,255,255,0.15)'}}
          accessibilityLabel="Pantalla completa">
          <Icons name="expand-arrows-alt" size={12} color="#FFD60A" solid />
        </Pressable>
        <TouchableOpacity
          style={styles.driverDocsChangePhotoBtn}
          onPress={() => pickDriverDocImage(uriKey, b64Key)}
          activeOpacity={0.85}
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
          accessibilityLabel="Cambiar foto">
          <Icons name="camera" size={12} color="#FFD60A" solid />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.driverDocsRemoveX}
          onPress={() => clearDriverDoc(uriKey, b64Key)}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
          accessibilityLabel="Quitar foto">
          <Icons name="times" size={14} color="#FFD60A" />
        </TouchableOpacity>
      </View>
    );
  };

  const openDriverDocsDatePicker = fieldKey => {
    const current = driverDocsForm[fieldKey];
    setDriverDocsDatePicker({
      visible: true,
      fieldKey,
      tempDate: current instanceof Date && !isNaN(current.getTime()) ? current : new Date(),
    });
  };

  const closeDriverDocsDatePicker = () =>
    setDriverDocsDatePicker(prev => ({...prev, visible: false, fieldKey: null}));

  const confirmDriverDocsDatePicker = () => {
    if (driverDocsDatePicker.fieldKey) {
      setDriverDocsForm(prev => ({
        ...prev,
        [driverDocsDatePicker.fieldKey]: driverDocsDatePicker.tempDate,
      }));
    }
    closeDriverDocsDatePicker();
  };

  const handleSaveDriverDocs = async () => {
    let uiduser = '';
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      uiduser = user?.uid ?? user?.id ?? '';
    } catch (e) {
      uiduser = '';
    }
    if (!uiduser) {
      Alert.alert('Sesión', 'No se encontró tu usuario. Inicia sesión de nuevo.');
      return;
    }

    const safeDate = d => (d instanceof Date && !isNaN(d.getTime()) ? d : null);
    if (!safeDate(driverDocsForm.licencia_vencimiento) || !safeDate(driverDocsForm.cert_med_vencimiento)) {
      Alert.alert('Fechas requeridas', 'Completa el vencimiento de licencia y certificado médico.');
      return;
    }

    const licF = driverDocBase64FieldValue(
      driverDocsForm.licencia_frente_uri,
      driverDocsForm.licencia_frente_b64,
      driverDocsInitialUrls.licencia_frente,
    );
    const licR = driverDocBase64FieldValue(
      driverDocsForm.licencia_reverso_uri,
      driverDocsForm.licencia_reverso_b64,
      driverDocsInitialUrls.licencia_reverso,
    );
    const cmF = driverDocBase64FieldValue(
      driverDocsForm.cert_med_frente_uri,
      driverDocsForm.cert_med_frente_b64,
      driverDocsInitialUrls.cert_med_frente,
    );
    const cmR = driverDocBase64FieldValue(
      driverDocsForm.cert_med_reverso_uri,
      driverDocsForm.cert_med_reverso_b64,
      driverDocsInitialUrls.cert_med_reverso,
    );

    // UpdateUsuariosAll: uid del usuario logueado + documentos (en *_base64 va base64 si cambió la foto, o la misma URL del GET si no).
    const payload = {
      uid: uiduser,
      licencia_frente_base64: licF,
      licencia_reverso_base64: licR,
      licencia_fecha_vencimiento: safeDate(driverDocsForm.licencia_vencimiento),
      certificado_medico_frente_base64: cmF,
      certificado_medico_reverso_base64: cmR,
      certificado_medico_fecha_vencimiento: safeDate(driverDocsForm.cert_med_vencimiento),
    };

    setDriverDocsSaving(true);
    try {
      await api.post('usuarios/updateUsuarioDocumentacionConductor', payload);
      setDriverDocsModalVisible(false);
      Alert.alert('¡Listo!', 'Tus documentos se guardaron correctamente.', [{text: 'Entendido'}]);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ??
        err?.message ??
        'No se pudieron guardar los documentos. Verifica tu conexión o el servicio.';
      Alert.alert('Error', errorMsg);
    } finally {
      setDriverDocsSaving(false);
    }
  };

  const handleAddVehicle = () => {
    if (vehicles.length >= 1) {
      setPlanRequiredModalVisible(true);
      return;
    }
    setEditingVehicle(null);
    navigation.navigate('VehicleAddStepper');
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);
    setEditingVehicle(null);
    setSelectedVehicle(null);
    setActionModalVisible(false);
  };

  const handleSubmitVehicle = async (payload) => {
    try {
      await api.post('usuarios/saveOrUpdateVehiculo', payload);
      setAddModalVisible(false);
      fetchUserVehicles();
      Alert.alert(
        '¡Listo!',
        'Tu vehículo se guardó correctamente.',
        [{ text: 'Entendido' }]
      );
    } catch (err) {
      const errorMsg = err?.response?.data?.message ?? err?.message ?? 'No se pudo guardar el vehículo. Intenta de nuevo.';
      Alert.alert('Error', errorMsg);
    }
  };

  const formatVehicleModel = (item) => {
    const parts = [item?.vehiculo_marca, item?.vehiculo_modelo].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Vehículo';
  };

  const formatTimestamp = (ts) => {
    if (!ts || typeof ts !== 'object') return '—';
    const sec = ts?._seconds ?? ts?.seconds;
    if (sec == null) return '—';
    const d = new Date(sec * 1000);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatKmLabel = value => {
    if (value == null || value === '') return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return `${num.toLocaleString('es')} km`;
  };

  const renderVehicleDocExpiryRow = item => {
    const rcvD = parseVehicleExpiryDate(item?.rcv_fecha_vencimiento);
    const trimD = parseVehicleExpiryDate(item?.trimestres_fecha_vencimiento);
    if (!rcvD && !trimD) return null;

    return (
      <View style={styles.cardDocExpiryStrip}>
        {rcvD ? <DocExpiryPill shortLabel="RCV" date={rcvD} /> : null}
        {trimD ? <DocExpiryPill shortLabel="Trimestre" date={trimD} /> : null}
      </View>
    );
  };

  const handleCardPress = (item) => {
    setSelectedVehicle(item);
    setActionModalVisible(true);
  };

  const handleEditSelected = () => {
    if (!selectedVehicle) {
      setActionModalVisible(false);
      return;
    }
    setActionModalVisible(false);
    navigation.navigate('VehicleAddStepper', {
      vehicleId: getVehicleKey(selectedVehicle ?? {}),
      initialValues: selectedVehicle,
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedVehicle) return;

    Alert.alert(
      'Eliminar vehículo',
      '¿Seguro que deseas eliminar este vehículo?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const jsonValue = await AsyncStorage.getItem('@userInfo');
              const user = jsonValue != null ? JSON.parse(jsonValue) : null;
              const uiduser = user?.uid ?? user?.id ?? '';
              const uidvehicle = getVehicleKey(selectedVehicle ?? {});

              const payload = {uiduser, uidvehicle};
              console.log('Payload eliminar vehículo:', payload);

              await api.post('usuarios/deleteVehiculo', payload);
              setActionModalVisible(false);
              fetchUserVehicles();
              Alert.alert('Vehículo eliminado', 'El vehículo se eliminó correctamente.');
            } catch (err) {
              const errorMsg =
                err?.response?.data?.message ??
                err?.message ??
                'No se pudo eliminar el vehículo. Intenta de nuevo.';
              Alert.alert('Error', errorMsg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleVehicleStatus = () => {
    setActionModalVisible(false);
    navigation.navigate('VehicleMaintenanceScreen', {
      vehicleId: getVehicleKey(selectedVehicle ?? {}),
      vehicleData: selectedVehicle ?? null,
    });
  };

  const handleVehicleNotifications = () => {
    setActionModalVisible(false);
    navigation.navigate('VehicleNotificationsScreen', {
      vehicleId: getVehicleKey(selectedVehicle ?? {}),
      vehicleData: selectedVehicle ?? null,
    });
  };

  const openVehicleNotificationsFromCard = vehicle => {
    navigation.navigate('VehicleNotificationsScreen', {
      vehicleId: getVehicleKey(vehicle ?? {}),
      vehicleData: vehicle ?? null,
    });
  };

  const renderDetailRow = (iconName, label, value, showChevron = false) => (
    <View style={styles.cardDetailRow}>
      <View style={styles.cardDetailIcon}>
        <Entypo name={iconName} size={16} color="#FFD60A" />
      </View>
      <View style={[styles.cardDetailBody, {flex: 1}]}>
        <View style={{flex: 1}}>
          <Text style={styles.cardDetailLabel}>
            {label}
          </Text>
          <Text style={[styles.cardDetailValue, {color: textColorStyle}]}>
            {value}
          </Text>
        </View>
        {showChevron && (
          <Entypo
            name="chevron-small-right"
            size={20}
                  color="#1F2344"
            style={styles.cardDetailChevron}
          />
        )}
      </View>
    </View>
  );

  const renderVehicleNotificationsBlock = item => {
    const vid = getVehicleKey(item);
    const summary = vehicleNotificationsByUid[vid];

    const renderMaintenanceAlertPills = () => {
      const v = summary?.vencidos ?? 0;
      const p = summary?.porVencer ?? 0;
      const a = summary?.alDia ?? 0;
      if (v <= 0 && p <= 0 && a <= 0) return null;
      return (
        <View style={styles.cardNotifPillsInline}>
          {v > 0 ? (
            <View style={[styles.cardNotifAlertPill, styles.cardNotifAlertPillDanger]}>
              <Text style={[styles.cardNotifAlertPillText, styles.cardNotifAlertPillTextDanger]}>
                {v === 1 ? '1 vencido' : `${v} vencidos`}
              </Text>
            </View>
          ) : null}
          {p > 0 ? (
            <View style={[styles.cardNotifAlertPill, styles.cardNotifAlertPillWarn]}>
              <Text style={[styles.cardNotifAlertPillText, styles.cardNotifAlertPillTextWarn]}>
                {p === 1 ? '1 por vencer' : `${p} por vencer`}
              </Text>
            </View>
          ) : null}
          {a > 0 ? (
            <View style={[styles.cardNotifAlertPill, styles.cardNotifAlertPillOk]}>
              <Text style={[styles.cardNotifAlertPillText, styles.cardNotifAlertPillTextOk]}>
                {a === 1 ? '1 al día' : `${a} al día`}
              </Text>
            </View>
          ) : null}
        </View>
      );
    };

    const renderNotifHeaderRow = count => (
      <View style={styles.cardNotifHeaderRow}>
        <View style={styles.cardNotifTitleGroup}>
          <Icons name="bell" size={14} color="#1F2344" />
          <Text style={styles.cardNotifTitle}>Recordatorios ({count})</Text>
        </View>
        {summary ? renderMaintenanceAlertPills() : null}
      </View>
    );

    if (!summary) {
      return (
        <View style={styles.cardNotifSection}>
          {renderNotifHeaderRow(0)}
          <Text style={styles.cardNotifMuted}>
            Sin datos de recordatorios vinculados a este vehículo.
          </Text>
        </View>
      );
    }

    const notifTotal = summary.total ?? summary.items.length;
    const displayCount =
      summary.totalActive != null && summary.totalActive > 0
        ? summary.totalActive
        : notifTotal;

    if (summary.items.length === 0) {
      return (
        <View style={styles.cardNotifSection}>
          {renderNotifHeaderRow(displayCount)}
          <Text style={styles.cardNotifMuted}>
            {displayCount === 0
              ? 'No hay recordatorios activos para este vehículo.'
              : 'Completa fechas en Salud automotriz para ver el detalle aquí.'}
          </Text>
        </View>
      );
    }

    const remindersTotal = summary.total ?? summary.items.length;
    const showVerMas = remindersTotal > 1;

    return (
      <View style={styles.cardNotifSection}>
        {renderNotifHeaderRow(displayCount)}
        {summary.items.slice(0, 1).map(n => (
          <View key={n.id} style={styles.cardNotifItemWrap}>
            <Text style={styles.cardNotifItemName} numberOfLines={2}>
              {String(n.nombre || '').toUpperCase()}
            </Text>
            <View style={styles.cardDetailGridRow}>
              <View style={[styles.cardDetailHalf, styles.cardDetailHalfLeft]}>
                <View style={styles.cardDetailIcon}>
                  <Entypo name="calendar" size={16} color="#FFD60A" />
                </View>
                <View style={[styles.cardDetailBody, {flex: 1}]}>
                  <View style={{flex: 1}}>
                    <Text style={styles.cardDetailLabel}>ÚLTIMA REVISIÓN</Text>
                    <Text style={[styles.cardDetailValue, {color: textColorStyle}]}>
                      {formatRevisionDate(n.ultimaRevision)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardDetailHalf}>
                <View style={styles.cardDetailIcon}>
                  <Entypo name="calendar" size={16} color="#FFD60A" />
                </View>
                <View style={[styles.cardDetailBody, {flex: 1}]}>
                  <View style={{flex: 1}}>
                    <Text style={styles.cardDetailLabel}>PRÓXIMA REVISIÓN</Text>
                    <Text style={[styles.cardDetailValue, {color: textColorStyle}]}>
                      {formatRevisionDate(n.proximaRevision)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
        {showVerMas ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => openVehicleNotificationsFromCard(item)}
            style={styles.cardNotifVerMasBtn}>
            <Text style={styles.cardNotifVerMasText}>Ver más</Text>
            <Entypo name="chevron-small-right" size={16} color="#2563EB" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.cardTouchable}
      activeOpacity={0.85}
      onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.cardHeaderWrap}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardPlateRow}>
                <Text
                  style={[styles.cardPlateText, {color: '#FFFFFF'}]}
                  numberOfLines={1}>
                  {(item?.vehiculo_placa || '').toUpperCase()}
                </Text>
                {item?.vehiculo_anio != null && item?.vehiculo_anio != '' && (
                  <View style={[styles.cardYearTag, styles.cardMetaTagMargin]}>
                    <Text style={styles.cardYearTagText}>{item?.vehiculo_anio}</Text>
                  </View>
                )}
                {formatKmLabel(item?.KM) !== '—' ? (
                  <View style={[styles.cardYearTag, styles.cardMetaTagMargin]}>
                    <Text style={styles.cardYearTagText} numberOfLines={1}>
                      {formatKmLabel(item?.KM)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[styles.cardModelText, {color: '#FFFFFF'}]}
                numberOfLines={1}>
                {(formatVehicleModel(item) || '').toUpperCase()}
              </Text>
              {item?.vehiculo_color != null && item?.vehiculo_color !== '' && (
                <Text
                  style={[styles.cardColorText, {color: '#FFFFFF'}]}
                  numberOfLines={1}>
                  {(item?.vehiculo_color || '').toUpperCase()}
                </Text>
              )}
              {(!item?.activo || item?.por_defecto) && (
                <View style={styles.cardHeaderFlagsInline}>
                  {!item?.activo ? (
                    <Text style={styles.cardHeaderFlagWarn}>Inactivo</Text>
                  ) : null}
                  {item?.por_defecto ? (
                    <Text
                      style={[
                        styles.cardHeaderFlagOk,
                        !item?.activo ? styles.cardHeaderFlagSep : null,
                      ]}>
                      Predet.
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
            <View style={styles.cardIconTopRight}>
              <Icons name="car" size={22} color="#FFD60A" />
            </View>
          </View>
        </View>

        <View style={styles.cardSeparator} />

        {renderVehicleDocExpiryRow(item)}

        {item?.ultimo_lavado != null &&
          (item?.ultimo_lavado?._seconds != null || item?.ultimo_lavado?.seconds != null) &&
          renderDetailRow(
            'calendar',
            'ÚLTIMO LAVADO',
            formatTimestamp(item?.ultimo_lavado),
            false,
          )}

        {renderVehicleNotificationsBlock(item)}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconWrap}>
            <Icons name="car" size={48} color={appColors?.primary} />
          </View>
          <Text style={[styles.emptyText, {color: textColorStyle}]}>
            {error}
          </Text>
          <Text style={[styles.emptySubtext, {color: textColorStyle}]}>
            Vuelve a intentar más tarde
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        {/* Hero superior */}
        <View style={styles.emptyHero}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 14, left: 14, zIndex: 3 }}
            activeOpacity={0.85}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,214,10,0.14)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ArrowLeft size={20} color="#FFD60A" />
            </View>
          </TouchableOpacity>

          <View style={styles.emptyHeroInner}>
            <Text style={styles.emptyHeroTitle}>
              Controla tus{"\n"}vehículos
            </Text>
            <Text style={styles.emptyHeroSubtitle}>
              Aquí verás y administrarás los vehículos de tu cuenta. Mantén tu historial al día y actualiza cada detalle cuando lo necesites.
            </Text>
          </View>
        </View>

        {/* Tarjeta de beneficios */}
        <View style={styles.emptyCard}>
          <View style={styles.emptyCardItem}>
            <Icons name="check-circle" size={18} color="#1F2344" />
            <View style={styles.emptyCardItemTextWrap}>
              <Text style={styles.emptyCardItemTitle}>Controla tu historial</Text>
              <Text style={styles.emptyCardItemSubtitle}>Más fácil dar seguimiento</Text>
            </View>
          </View>
          <View style={styles.emptyCardItem}>
            <Icons name="check-circle" size={18} color="#1F2344" />
            <View style={styles.emptyCardItemTextWrap}>
              <Text style={styles.emptyCardItemTitle}>Todo en un solo lugar</Text>
              <Text style={styles.emptyCardItemSubtitle}>Acceso rápido a tus datos</Text>
            </View>
          </View>
          <View style={styles.emptyCardItem}>
            <Icons name="check-circle" size={20} color="#1F2344" />
            <View style={styles.emptyCardItemTextWrap}>
              <Text style={styles.emptyCardItemTitle}>Menos tiempo</Text>
              <Text style={styles.emptyCardItemSubtitle}>Regístralo y listo</Text>
            </View>
          </View>
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={styles.emptyPrimaryButton}
          activeOpacity={0.9}
          onPress={handleAddVehicle}>
          <View style={styles.emptyPrimaryIconWrap}>
            <Icons name="plus" size={25} color="#1F2344" />
          </View>
          <Text style={styles.emptyPrimaryText}>Agregar vehículo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors?.primary || '#3A4A85'} />
        </View>
      ) : (
        <>
          {vehicles.length > 0 ? (
            <View style={styles.vehiclesTopHeader}>
              <View style={styles.vehiclesHeaderCircle1} />
              <View style={styles.vehiclesHeaderCircle2} />
              <View style={styles.vehiclesHeaderRow}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.vehiclesHeaderBackBtn}
                  activeOpacity={0.85}>
                  <ArrowLeft size={20} color="#FFD60A" />
                </TouchableOpacity>
                <View style={styles.vehiclesHeaderCenter}>
                  <Text style={styles.vehiclesHeaderTitle}>Vehículos Asociados</Text>
                  <Text style={styles.vehiclesHeaderSubtitle}>
                    Tus vehículos en un solo lugar, fácil de revisar.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {vehicles.length > 0 ? (
            <TouchableOpacity
              style={styles.driverDocsEntryBanner}
              activeOpacity={0.88}
              onPress={() => setDriverDocsModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Documentos de conductor. Licencia y certificado médico">
              <View style={styles.driverDocsEntryBannerIcon}>
                <Icons name="id-card" size={22} color="#1F2344" solid />
              </View>
              <View style={styles.driverDocsEntryBannerTextCol}>
                <Text style={styles.driverDocsEntryBannerTitle}>
                  Documentos de conductor
                </Text>
                <Text style={styles.driverDocsEntryBannerSubtitle}>
                  Licencia y certificado médico · Toca para revisar o actualizar
                </Text>
              </View>
              <View style={styles.driverDocsEntryBannerChevron}>
                <Icons name="chevron-right" size={18} color="#1F2344" />
              </View>
            </TouchableOpacity>
          ) : null}

          <FlatList
            data={vehicles}
            extraData={vehicleNotificationsByUid}
            keyExtractor={item =>
              getVehicleKey(item) || `vehicle-${item?.vehiculo_placa}-${item?.vehiculo_marca}-${item?.vehiculo_modelo}`
            }
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={
              vehicles.length === 0 ? styles.emptyListContent : styles.listContentWithFooter
            }
          />
          {vehicles.length > 0 ? (
            <View style={styles.stickyFooter}>
              <TouchableOpacity
                style={styles.stickyAddButton}
                activeOpacity={0.9}
                onPress={handleAddVehicle}>
                <View style={styles.stickyAddIconWrap}>
                  <Icons name="plus" size={22} color="#1F2344" />
                </View>
                <Text style={styles.stickyAddButtonText}>Agregar vehículo</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      <Modal
        visible={driverDocsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (driverDocsImagePreview) {
            closeDriverDocsImagePreview();
            return;
          }
          if (driverDocsDatePicker.visible) {
            closeDriverDocsDatePicker();
            return;
          }
          if (!driverDocsSaving) {
            setDriverDocsModalVisible(false);
          }
        }}>
        <View style={{flex: 1}}>
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            <View style={styles.driverDocsModalOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={() =>
                  !driverDocsSaving &&
                  !driverDocsDatePicker.visible &&
                  !driverDocsImagePreview &&
                  setDriverDocsModalVisible(false)
                }
              />
              <View style={styles.driverDocsModalCard}>
            <View style={styles.driverDocsModalHero}>
              <View style={styles.driverDocsModalHeroIcon}>
                <Icons name="id-card" size={26} color="#FFD60A" solid />
              </View>
              <Text style={styles.driverDocsModalTitle}>Documentos de conductor</Text>
              <Text style={styles.driverDocsModalSubtitle}>
                Completa el vencimiento de tu licencia y de tu certificado médico para guardar. Las fotos son
                opcionales: puedes añadirlas más abajo cuando quieras.
              </Text>
            </View>

            {driverDocsLoading ? (
              <View style={styles.driverDocsModalLoadingWrap}>
                <ActivityIndicator size="large" color="#1F2344" />
                <Text style={styles.driverDocsModalLoadingText}>
                  Cargando datos…
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.driverDocsModalScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                nestedScrollEnabled
                bounces
                contentContainerStyle={styles.driverDocsScroll}>
                <View style={styles.driverDocsSection}>
                  <Text style={styles.driverDocsSectionTitle}>Licencia de conducir</Text>
                  <Text style={[styles.driverDocsLabel, {marginTop: 4}]}>Vencimiento *</Text>
                  <TouchableOpacity
                    style={styles.driverDocsDateBtn}
                    onPress={() => openDriverDocsDatePicker('licencia_vencimiento')}
                    activeOpacity={0.85}>
                    <Text
                      style={[
                        styles.driverDocsDateText,
                        !driverDocsForm.licencia_vencimiento &&
                          styles.driverDocsDatePlaceholder,
                      ]}>
                      {formatDriverDocDate(driverDocsForm.licencia_vencimiento) ||
                        'Toca para elegir fecha'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.driverDocsSection}>
                  <Text style={styles.driverDocsSectionTitle}>Certificado médico</Text>
                  <Text style={[styles.driverDocsLabel, {marginTop: 4}]}>Vencimiento *</Text>
                  <TouchableOpacity
                    style={styles.driverDocsDateBtn}
                    onPress={() => openDriverDocsDatePicker('cert_med_vencimiento')}
                    activeOpacity={0.85}>
                    <Text
                      style={[
                        styles.driverDocsDateText,
                        !driverDocsForm.cert_med_vencimiento &&
                          styles.driverDocsDatePlaceholder,
                      ]}>
                      {formatDriverDocDate(driverDocsForm.cert_med_vencimiento) ||
                        'Toca para elegir fecha'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.driverDocsInfoBox}>
                  <Text style={styles.driverDocsInfoTitle}>¿Necesito subir fotos?</Text>
                  <Text style={styles.driverDocsInfoText}>
                    No es obligatorio. Si decides adjuntarlas, las preparamos en un formato codificado y seguro
                    antes de enviarlas al servidor, para cuidar tu información. Puedes guardar solo con las
                    fechas si lo prefieres.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.driverDocsTogglePhotos}
                  onPress={() => setDriverDocsImagesExpanded(v => !v)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={
                    driverDocsImagesExpanded
                      ? 'Ocultar sección de fotos'
                      : 'Mostrar sección para adjuntar fotos'
                  }>
                  <View style={styles.driverDocsTogglePhotosInner}>
                    <Text style={styles.driverDocsTogglePhotosText}>
                      {driverDocsImagesExpanded
                        ? 'Ocultar fotos de documentos'
                        : 'Adjuntar o cambiar fotos'}
                    </Text>
                    <Icons
                      name={driverDocsImagesExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#2563EB"
                      solid
                    />
                  </View>
                </TouchableOpacity>

                {driverDocsImagesExpanded ? (
                  <>
                    <View style={[styles.driverDocsSection, {marginTop: 12}]}>
                      <Text style={styles.driverDocsSectionTitle}>Licencia — fotos</Text>
                      <Text style={styles.driverDocsSectionHint}>
                        Toca la miniatura o el botón de ampliar para verla a pantalla completa. El ícono de
                        cámara te permite elegir otra imagen.
                      </Text>
                      <View style={styles.driverDocsRow}>
                        <View style={styles.driverDocsSlot}>
                          <Text style={styles.driverDocsLabel}>Frente</Text>
                          {renderDriverDocPhotoSlot(
                            'licencia_frente_uri',
                            'licencia_frente_b64',
                            'Licencia (frente)',
                          )}
                        </View>
                        <View style={styles.driverDocsSlotLast}>
                          <Text style={styles.driverDocsLabel}>Reverso</Text>
                          {renderDriverDocPhotoSlot(
                            'licencia_reverso_uri',
                            'licencia_reverso_b64',
                            'Licencia (reverso)',
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.driverDocsSection}>
                      <Text style={styles.driverDocsSectionTitle}>Certificado — fotos</Text>
                      <Text style={styles.driverDocsSectionHint}>
                        Mismo uso: ampliar para ver en grande o cámara para cambiar la foto.
                      </Text>
                      <View style={styles.driverDocsRow}>
                        <View style={styles.driverDocsSlot}>
                          <Text style={styles.driverDocsLabel}>Frente</Text>
                          {renderDriverDocPhotoSlot(
                            'cert_med_frente_uri',
                            'cert_med_frente_b64',
                            'Certificado médico (frente)',
                          )}
                        </View>
                        <View style={styles.driverDocsSlotLast}>
                          <Text style={styles.driverDocsLabel}>Reverso</Text>
                          {renderDriverDocPhotoSlot(
                            'cert_med_reverso_uri',
                            'cert_med_reverso_b64',
                            'Certificado médico (reverso)',
                          )}
                        </View>
                      </View>
                    </View>
                  </>
                ) : null}
              </ScrollView>
            )}

            <View style={styles.driverDocsFooter}>
              <TouchableOpacity
                style={[styles.driverDocsBtnSecondary, {marginRight: 10}]}
                onPress={() => !driverDocsSaving && setDriverDocsModalVisible(false)}
                activeOpacity={0.85}
                disabled={driverDocsSaving}>
                <Text style={styles.driverDocsBtnSecondaryText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.driverDocsBtnPrimary,
                  !driverDocsDatesComplete && styles.driverDocsBtnPrimaryDisabled,
                ]}
                onPress={handleSaveDriverDocs}
                activeOpacity={0.88}
                disabled={driverDocsSaving || driverDocsLoading || !driverDocsDatesComplete}>
                {driverDocsSaving ? (
                  <ActivityIndicator color="#FFD60A" />
                ) : (
                  <Text
                    style={[
                      styles.driverDocsBtnPrimaryText,
                      !driverDocsDatesComplete && styles.driverDocsBtnPrimaryTextDisabled,
                    ]}>
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
              </View>
            </View>
          </KeyboardAvoidingView>

          {driverDocsDatePicker.visible ? (
            <View style={styles.driverDocsDatePickerLayer}>
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={closeDriverDocsDatePicker}
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {}}
                style={[vehicleFormStyles.datePickerBox, {zIndex: 1, elevation: 1}]}>
                <Text style={vehicleFormStyles.datePickerTitle}>
                  {driverDocsDatePicker.fieldKey === 'licencia_vencimiento'
                    ? 'Vencimiento de la licencia'
                    : driverDocsDatePicker.fieldKey === 'cert_med_vencimiento'
                      ? 'Vencimiento del certificado médico'
                      : 'Fecha'}
                </Text>
                <DatePicker
                  date={driverDocsDatePicker.tempDate}
                  onDateChange={d => setDriverDocsDatePicker(prev => ({...prev, tempDate: d}))}
                  theme="light"
                  mode="date"
                  style={vehicleFormStyles.datePicker}
                  locale="es"
                />
                <View style={vehicleFormStyles.datePickerFooter}>
                  <TouchableOpacity
                    style={vehicleFormStyles.datePickerBtnCancel}
                    onPress={closeDriverDocsDatePicker}>
                    <Text style={vehicleFormStyles.datePickerBtnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={vehicleFormStyles.datePickerBtnConfirm}
                    onPress={confirmDriverDocsDatePicker}>
                    <Text style={vehicleFormStyles.datePickerBtnConfirmText}>Listo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {driverDocsImagePreview ? (
            <View
              style={styles.driverDocsFullPreviewLayer}
              accessibilityViewIsModal
              importantForAccessibility="yes">
              <View style={[styles.driverDocsFullPreviewBody, {paddingTop: insets.top}]}>
                <Image
                  source={{uri: driverDocsImagePreview}}
                  style={styles.driverDocsFullPreviewImage}
                  resizeMode="contain"
                />
              </View>
              <View
                style={[
                  styles.driverDocsFullPreviewFooter,
                  {paddingBottom: Math.max(insets.bottom, 18)},
                ]}>
                <TouchableOpacity
                  style={styles.driverDocsFullPreviewClose}
                  onPress={closeDriverDocsImagePreview}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar vista previa">
                  <Text style={styles.driverDocsFullPreviewCloseText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}>
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.actionModalBox}>
            <View style={styles.actionModalHeaderIconWrap}>
              <Icons2 name="car" size={28} color={appColors?.primary ?? '#2D3261'} />
            </View>
            <Text style={styles.actionModalTitle}>¿Qué deseas hacer?</Text>
            <Text style={styles.actionModalSubtitle}>
              Selecciona una opción para este vehículo.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionBtnEdit}
                onPress={handleEditSelected}
                activeOpacity={0.8}
                disabled={deleting}>
                <View style={styles.actionBtnEditIconWrap}>
                  <Icons2 name="edit" size={22} color="#2D7CFF" />
                </View>
                <Text style={styles.actionBtnEditText}>Manual digital</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnInfo}
                onPress={handleVehicleStatus}
                activeOpacity={0.8}
                disabled={deleting}>
                <View style={styles.actionBtnInfoIconWrap}>
                  <Icons2 name="car" size={22} color="#2D3261" />
                </View>
                <Text style={styles.actionBtnInfoText}>Salud Automotriz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnInfo}
                onPress={handleVehicleNotifications}
                activeOpacity={0.8}
                disabled={deleting}>
                <View style={styles.actionBtnInfoIconWrap}>
                  <Icons2 name="bells" size={22} color="#2D3261" />
                </View>
                <Text style={styles.actionBtnInfoText}>Notificaciones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnDelete}
                onPress={handleDeleteSelected}
                activeOpacity={0.8}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <View style={styles.actionBtnDeleteIconWrap}>
                      <Icons2 name="delete" size={22} color="#FF3B30" />
                    </View>
                    <Text style={styles.actionBtnDeleteText}>Eliminar</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity
              style={styles.actionModalCerrar}
              onPress={() => setActionModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.actionModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={planRequiredModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlanRequiredModalVisible(false)}>
        <TouchableOpacity
          style={styles.planModalOverlay}
          activeOpacity={1}
          onPress={() => setPlanRequiredModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.planModalCard}>
            <View style={styles.planModalIconWrap}>
              <Icons2 name="rocket1" size={42} color="#FFFFFF" />
            </View>
            <Text style={styles.planModalTitle}>Coming soon</Text>
            <Text style={styles.planModalMessage}>
              Estamos trabajando para ofrecerte muy pronto la posibilidad de cargar más
              vehículos en tu cuenta con una experiencia mucho más completa.
            </Text>
            <TouchableOpacity
              style={styles.planModalBtn}
              onPress={() => setPlanRequiredModalVisible(false)}
              activeOpacity={0.85}>
              <Text style={styles.planModalBtnText}>Entendido</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.planModalCerrar}
              onPress={() => setPlanRequiredModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.planModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={plansModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlansModalVisible(false)}>
        <TouchableOpacity
          style={styles.planModalOverlay}
          activeOpacity={1}
          onPress={() => setPlansModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.plansModalCard}>
            <View style={styles.plansModalHeader}>
              <Text style={styles.plansModalTitle}>Planes disponibles</Text>
              <TouchableOpacity
                onPress={() => setPlansModalVisible(false)}
                style={styles.plansModalCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Icons2 name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.planItemCard}>
              <View style={styles.planItemBadge}>
                <Text style={styles.planItemPrice}>$1</Text>
                <Text style={styles.planItemPeriod}>/ mes</Text>
              </View>
              <Text style={styles.planItemVehicles}>Hasta 10 vehículos</Text>
              <Text style={styles.planItemDesc}>Con este plan puedes registrar hasta 10 vehículos en tu cuenta.</Text>
            </View>
            <TouchableOpacity
              style={styles.planModalCerrar}
              onPress={() => setPlansModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.planModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <VehicleFormModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitVehicle}
        initialValues={editingVehicle}
      />
    </View>
  );
};

export default VehiclesScreen;
