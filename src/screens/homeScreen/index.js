import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {
  Car,
  Gauge,
  Bell,
  ChevronRight,
  Sparkles,
  Wrench,
  Map as MapIcon,
  Navigation,
  Clock,
  Star,
  SearchX,
} from 'lucide-react-native';
import {
  AppText,
  Banner,
  Card,
  Chip,
  EmptyState,
  IconButton,
  SearchBar,
  TallerCard,
  TallerCardSkeleton,
  colors,
  space,
  radius,
} from '../../ui';
import {
  firstImage,
  formatKm,
  formatPrice,
  formatRating,
  openState,
  priceValue,
  ratingValue,
  sentenceCase,
  serviceDistanceKm,
} from '../../utils/taller';
import useServiciosCercanos, {
  MIN_RATING,
  NEAR_KM,
  PAGE_SIZE,
} from './useServiciosCercanos';
import Icons from 'react-native-vector-icons/FontAwesome5';
import {
  fetchHomeDueMaintenanceAlerts,
  shouldShowMaintenancePopupModal,
} from '../../utils/homeMaintenanceDue';
import LocationPermissionModal from '../../commonComponents/LocationPermissionModal';
import {
  shouldShowReminder,
  markReminderShown,
  snoozeReminder,
  markKmUpdated,
} from '../../utils/homeReminderPolicy';

const readUidFromStorage = async () => {
  try {
    const j = await AsyncStorage.getItem('@userInfo');
    const u = j ? JSON.parse(j) : null;
    return String(u?.uid ?? u?.id ?? '');
  } catch (_) {
    return '';
  }
};

const getVehicleReminderKey = v =>
  String(v?.id ?? v?.uid ?? v?.vehiculo_uid ?? '').trim();

/** Prioridad visual si coinciden (mayor = encima). Por flujo: mantenimiento primero y KM solo al cerrar mantenimiento. */
const MODAL_LAYER_VEHICLES = 100;
const MODAL_LAYER_KM_INPUT = 200;
const MODAL_LAYER_KM_SUCCESS = 300;
const MODAL_LAYER_MAINTENANCE_DUE = 400;
const MODAL_ELEVATION_VEHICLES = 4;
const MODAL_ELEVATION_KM_INPUT = 8;
const MODAL_ELEVATION_KM_SUCCESS = 16;
const MODAL_ELEVATION_MAINTENANCE_DUE = 24;

/** Máximo de ítems en el modal de mantenimientos en inicio; el resto enlaza a Mis vehículos. */
const MAINT_DUE_MODAL_PREVIEW_LIMIT = 2;

/** Misma forma de aplanar la respuesta que en vehículos / notificaciones. */
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

const HomeScreen = () => {
  const navigation = useNavigation();
  // Márgenes del sistema: los aplica MainActivity (Android) y App.tsx (iOS).
  const insets = {top: 0, bottom: 0};
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationAttempted, setLocationAttempted] = useState(false);

  const [vehiclePickerModalVisible, setVehiclePickerModalVisible] = useState(false);
  const [kmUpdateModalVisible, setKmUpdateModalVisible] = useState(false);
  const [vehiclesReminderList, setVehiclesReminderList] = useState([]);
  const [vehiclesReminderLoading, setVehiclesReminderLoading] = useState(false);
  const [selectedVehicleKey, setSelectedVehicleKey] = useState('');
  /** Marcado = el usuario no quiere ver este recordatorio al entrar al inicio */
  const [reminderDoNotShowAgain, setReminderDoNotShowAgain] = useState(false);
  const [kmReminderDraft, setKmReminderDraft] = useState('');
  const [savingKmReminder, setSavingKmReminder] = useState(false);
  const [kmSuccessModalVisible, setKmSuccessModalVisible] = useState(false);
  const [kmSuccessFormatted, setKmSuccessFormatted] = useState('');

  const [maintenanceDueModalVisible, setMaintenanceDueModalVisible] = useState(false);
  const [maintenanceDueRows, setMaintenanceDueRows] = useState([]);
  const [maintenanceDueLoading, setMaintenanceDueLoading] = useState(false);
  const [maintenanceDoNotShowAgain, setMaintenanceDoNotShowAgain] = useState(false);

  // ── Modal de GPS / permisos de ubicación (se muestra automáticamente al entrar) ──
  const [locPermModalVisible, setLocPermModalVisible] = useState(false);
  const [locPermModalType,    setLocPermModalType]    = useState('permission'); // 'permission' | 'gps'

  // ── Modal de alerta genérico (reemplaza todos los Alert.alert) ────────────
  const [appAlertModal, setAppAlertModal] = useState({ visible: false, title: '', message: '' });
  const showAppAlert = useCallback((title, message) => {
    setAppAlertModal({ visible: true, title, message });
  }, []);
  /** Tras cerrar mantenimientos, abrir recordatorio KM si aún aplica (mismo foco). */
  const pendingKmReminderAfterMaintenanceCloseRef = useRef(false);

  const loadUserVehiclesForReminder = useCallback(async () => {
    setVehiclesReminderLoading(true);
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      const uid = user?.uid ?? user?.id ?? '';
      if (!uid) {
        setVehiclesReminderList([]);
        return;
      }
      const res = await api.post('usuarios/getVehiculosByUsuarioUid', {uid});
      const data = res?.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setVehiclesReminderList(list);
    } catch (e) {
      setVehiclesReminderList([]);
    } finally {
      setVehiclesReminderLoading(false);
    }
  }, []);

  const persistDoNotShowReminder = useCallback(async doNotShow => {
    setReminderDoNotShowAgain(doNotShow);
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      const uid = String(user?.uid ?? user?.id ?? '');
      if (!uid) return;
      const showModalKm = !doNotShow;
      await api.post('usuarios/UpdateUsuariosAll', {
        uid,
        showModalKm,
      });
      await AsyncStorage.setItem(
        '@userInfo',
        JSON.stringify({...(user && typeof user === 'object' ? user : {}), showModalKm}),
      );
    } catch (e) {
      setReminderDoNotShowAgain(!doNotShow);
      showAppAlert('Atención', 'No se pudo guardar tu preferencia. Intenta de nuevo.');
    }
  }, [showAppAlert]);

  const persistDoNotShowMaintenancePopup = useCallback(async doNotShow => {
    setMaintenanceDoNotShowAgain(doNotShow);
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      const uid = String(user?.uid ?? user?.id ?? '');
      if (!uid) return;
      const showMaintenancePopup = !doNotShow;
      await api.post('usuarios/UpdateUsuariosAll', {
        uid,
        showMaintenancePopup,
      });
      await AsyncStorage.setItem(
        '@userInfo',
        JSON.stringify({
          ...(user && typeof user === 'object' ? user : {}),
          showMaintenancePopup,
        }),
      );
    } catch (e) {
      setMaintenanceDoNotShowAgain(!doNotShow);
      showAppAlert('Atención', 'No se pudo guardar tu preferencia. Intenta de nuevo.');
    }
  }, [showAppAlert]);

  const closeMaintenanceDueModal = useCallback(() => {
    setMaintenanceDueModalVisible(false);
    (async () => {
      void snoozeReminder('maint', await readUidFromStorage());
    })();
    if (!pendingKmReminderAfterMaintenanceCloseRef.current) {
      return;
    }
    pendingKmReminderAfterMaintenanceCloseRef.current = false;
    setReminderDoNotShowAgain(false);
    (async () => {
      try {
        const j = await AsyncStorage.getItem('@userInfo');
        const u = j ? JSON.parse(j) : null;
        const uid = String(u?.uid ?? u?.id ?? '');
        // El recordatorio de vehículo es para conductores, no para talleres.
        if (u?.typeUser === 'Taller') {
          return;
        }
        if (u?.showModalKm === false || !(await shouldShowReminder('km', uid))) {
          return;
        }
        setVehiclePickerModalVisible(true);
        void markReminderShown('km', uid);
        void loadUserVehiclesForReminder();
      } catch (_) {}
    })();
  }, [loadUserVehiclesForReminder]);

  /** Ir a vehículos: cierra mantenimiento y no abre el modal de KM (como Cerrar en ese flujo, sin guardar en BD). */
  const goToVehiclesFromMaintenanceModal = useCallback(() => {
    pendingKmReminderAfterMaintenanceCloseRef.current = false;
    setMaintenanceDueModalVisible(false);
    setVehiclePickerModalVisible(false);
    setSelectedVehicleKey('');
    setKmUpdateModalVisible(false);
    setKmSuccessModalVisible(false);
    navigation.navigate('VehiclesScreen');
  }, [navigation]);

  const closeVehiclePickerModal = useCallback(() => {
    setVehiclePickerModalVisible(false);
    setSelectedVehicleKey('');
    (async () => {
      void snoozeReminder('km', await readUidFromStorage());
    })();
  }, []);

  const dismissKmSuccessModal = useCallback(() => {
    // Tras actualizar el km no se vuelve a abrir el selector: ya cumplió su objetivo.
    setKmSuccessModalVisible(false);
    setVehiclePickerModalVisible(false);
    setSelectedVehicleKey('');
  }, []);

  const handleOpenKmReminderStep = useCallback(() => {
    if (!selectedVehicleKey) {
      showAppAlert('Vehículo', 'Selecciona un vehículo para continuar.');
      return;
    }
    const v = vehiclesReminderList.find(item => getVehicleReminderKey(item) === selectedVehicleKey);
    if (!v) return;
    const rawKm = String(v?.KM ?? v?.km_actual ?? '').replace(/\D/g, '');
    setKmReminderDraft(rawKm);
    setVehiclePickerModalVisible(false);
    setKmUpdateModalVisible(true);
  }, [selectedVehicleKey, vehiclesReminderList]);

  const handleSaveKmReminder = useCallback(async () => {
    const digits = kmReminderDraft.replace(/\D/g, '');
    const kmNum = parseInt(digits, 10);
    if (!digits || !Number.isFinite(kmNum) || kmNum < 0) {
      showAppAlert('Kilometraje', 'Ingresa un kilometraje válido (solo números).');
      return;
    }
    let uiduser = '';
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      uiduser = String(user?.uid ?? user?.id ?? '');
    } catch (_) {
      uiduser = '';
    }
    if (!uiduser || !selectedVehicleKey) {
      showAppAlert('Sesión', 'No se encontró tu usuario o el vehículo.');
      return;
    }
    setSavingKmReminder(true);
    try {
      await api.post('usuarios/updateVehiculoKm', {
        uid_user: uiduser,
        uid_vehicle: selectedVehicleKey,
        km: Math.round(kmNum),
      });
      const kmRounded = Math.round(kmNum);
      void markKmUpdated(uiduser);
      setKmUpdateModalVisible(false);
      await loadUserVehiclesForReminder();
      setKmSuccessFormatted(kmRounded.toLocaleString('es-ES'));
      // Solo el modal de éxito aquí: si abrimos también el de vehículos, en Android
      // suele quedar encima y tapa el de "kilometraje actualizado".
      setKmSuccessModalVisible(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'No se pudo guardar. Intenta de nuevo.';
      showAppAlert('Error', String(msg));
    } finally {
      setSavingKmReminder(false);
    }
  }, [kmReminderDraft, selectedVehicleKey, loadUserVehiclesForReminder]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const json = await AsyncStorage.getItem('@userInfo');
          const user = json ? JSON.parse(json) : null;
          const uid = String(user?.uid ?? user?.id ?? '');
          if (!uid || !active) return;

          /** Preferencia recordatorio KM (false = no mostrar al entrar al inicio). */
          let userSnapshot = user;

          let showMaintenancePopup = true;
          /** Reutilizado en alertas de mantenimiento (mismo endpoint, sin segunda llamada si OK). */
          let getUserResponseData = null;
          try {
            const res = await api.post('usuarios/getUserByUid', {uid});
            getUserResponseData = res?.data ?? null;
            const ud = flattenUserDataFromGetUserResponse(getUserResponseData ?? {});
            showMaintenancePopup = shouldShowMaintenancePopupModal(ud);
            if (ud && user && typeof user === 'object') {
              const next = {...user};
              if (Object.prototype.hasOwnProperty.call(ud, 'showModalKm')) {
                next.showModalKm = ud.showModalKm;
              }
              if (Object.prototype.hasOwnProperty.call(ud, 'showMaintenancePopup')) {
                next.showMaintenancePopup = ud.showMaintenancePopup;
              }
              userSnapshot = next;
              if (
                Object.prototype.hasOwnProperty.call(ud, 'showModalKm') ||
                Object.prototype.hasOwnProperty.call(ud, 'showMaintenancePopup')
              ) {
                await AsyncStorage.setItem('@userInfo', JSON.stringify(next));
              }
            }
          } catch (_) {
            showMaintenancePopup = shouldShowMaintenancePopupModal({
              showMaintenancePopup: user?.showMaintenancePopup,
            });
          }
          if (!active) return;

          /**
           * Orden: 1) showMaintenancePopup (checkbox "no mostrar" desactivado en BD).
           * 2) Si hay vencidos / por vencer → modal mantenimiento primero y el de KM después al cerrar.
           */
          pendingKmReminderAfterMaintenanceCloseRef.current = false;
          let deferKmReminderForMaintenance = false;

          if (showMaintenancePopup) {
            setMaintenanceDueLoading(true);
            const rows = await fetchHomeDueMaintenanceAlerts(
              api,
              uid,
              getUserResponseData,
            );
            if (!active) return;
            setMaintenanceDueLoading(false);
            setMaintenanceDueRows(rows);
            if (rows.length > 0 && (await shouldShowReminder('maint', uid))) {
              setMaintenanceDoNotShowAgain(false);
              deferKmReminderForMaintenance = true;
              pendingKmReminderAfterMaintenanceCloseRef.current = true;
              setMaintenanceDueModalVisible(true);
              void markReminderShown('maint', uid);
            } else {
              setMaintenanceDueModalVisible(false);
            }
          } else {
            setMaintenanceDueRows([]);
            setMaintenanceDueModalVisible(false);
          }

          if (!active) return;

          if (deferKmReminderForMaintenance) {
            return;
          }

          /* El recordatorio de vehículo es para conductores, no para talleres. */
          if (userSnapshot?.typeUser === 'Taller') {
            setVehiclePickerModalVisible(false);
            return;
          }
          /* Recordatorio KM solo si el usuario no desactivó el aviso (showModalKm !== false). */
          if (userSnapshot?.showModalKm === false) {
            setVehiclePickerModalVisible(false);
            return;
          }
          if (!(await shouldShowReminder('km', uid))) {
            setVehiclePickerModalVisible(false);
            return;
          }
          setReminderDoNotShowAgain(false);
          setVehiclePickerModalVisible(true);
          void markReminderShown('km', uid);
          await loadUserVehiclesForReminder();
        } catch (_) {}
      })();
      return () => {
        active = false;
      };
    }, [loadUserVehiclesForReminder]),
  );

  const {
    query,
    setQuery,
    searching,
    debouncedQuery,
    category,
    setCategory,
    filters,
    toggleFilter,
    anyFilter,
    clearAll,
    items,
    status,
    error: listError,
    reload,
    loadMore,
    loadingMore,
    hasMore,
  } = useServiciosCercanos({location, ready: locationAttempted});

  const [firstName, setFirstName] = useState('');
  const [solicitudActiva, setSolicitudActiva] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const j = await AsyncStorage.getItem('@userInfo');
          const u = j ? JSON.parse(j) : null;
          if (!active || !u) return;
          setFirstName(String(u?.nombre || '').trim().split(/\s+/)[0] || '');
          if (!u?.uid) return;
          const r = await api.post('usuarios/getSolicitudesByUsuario', {
            uid_usuario: u.uid,
            solo_ultima: true,
            status: 'En espera por aprobación',
          });
          const raw = r?.data;
          const item =
            raw && typeof raw === 'object' && !Array.isArray(raw) && raw.id
              ? raw
              : Array.isArray(raw) && raw.length > 0
              ? raw[0]
              : null;
          if (active) setSolicitudActiva(item);
        } catch (_) {
          if (active) setSolicitudActiva(null);
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const handleScrollViewScroll = useCallback(
    ({nativeEvent}) => {
      const {contentOffset, contentSize, layoutMeasurement} = nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 240) {
        loadMore();
      }
    },
    [loadMore],
  );

  // Lo primero al entrar: solicitar ubicación (lat/lng), luego cargar categorías
  useEffect(() => {
    getCategories();
    requestLocationPermission();
  }, []);



  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;

        if (Array.isArray(result.categories)) {
          console.log('Categories:', result.categories);
          result.categories.unshift({ id: 'Todos', nombre: 'Todos' });
          setCategories(result.categories);
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data?.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    console.log('🔍 Ejecutando getCurrentLocation en HomeScreen...');
    setIsLoadingLocation(true);

    Geolocation.getCurrentPosition(
      info => {
        console.log('📍 Ubicación obtenida en HomeScreen:', info);
        const { latitude, longitude } = info.coords;
        console.log('🔍 Ubicación obtenida:', latitude, longitude);

        // Siempre actualizar la ubicación con los nuevos valores
        setLocation({ latitude, longitude });
        setLocationAttempted(true);
        setIsLoadingLocation(false);

        // Guardar la ubicación en AsyncStorage para uso posterior
        AsyncStorage.setItem('@userLocation', JSON.stringify({ latitude, longitude }))
          .then(() => console.log('📍 Ubicación guardada en AsyncStorage'))
          .catch(error => console.error('Error al guardar ubicación:', error));
      },
      error => {
        console.warn('⚠️ GPS no disponible en HomeScreen (code=' + error.code + '):', error.message);
        setLocationAttempted(true);
        setIsLoadingLocation(false);

        if (error.code === 1) {
          // Permiso denegado (principalmente iOS sin permiso concedido)
          setLocPermModalType('permission');
          setLocPermModalVisible(true);
        } else if (error.code === 2) {
          // Servicios de ubicación / GPS apagados
          setLocPermModalType('gps');
          setLocPermModalVisible(true);
        }
        // code 3 = timeout → silencioso, la app sigue funcionando sin coords
      },
      {
        enableHighAccuracy: false, // red (WiFi/cell) → respuesta inmediata en interiores
        timeout: 10000,
        maximumAge: 300000,        // aceptar caché de hasta 5 min
      }
    );
  };

  // Función para solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const fine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const coarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

        console.log('Permiso fine:', fine);
        console.log('Permiso coarse:', coarse);

        // Si ya tenemos permisos, obtener ubicación directamente
        if (fine === PermissionsAndroid.RESULTS.GRANTED || coarse === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permisos ya concedidos en HomeScreen');
          const timeoutId = setTimeout(() => {
            getCurrentLocation();
          }, 500);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'Esta app necesita acceder a tu ubicación para mostrar servicios cercanos',
            buttonNeutral: 'Pregúntame después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso concedido en HomeScreen');
          const timeoutId = setTimeout(() => {
            getCurrentLocation();
          }, 1000);
        } else {
          console.warn('Permiso de ubicación denegado en HomeScreen');
          setLocationAttempted(true);
          setLocPermModalType('permission');
          setLocPermModalVisible(true);
        }
      } else {
        // iOS: intentar obtener ubicación; el callback de error maneja el modal
        getCurrentLocation();
      }
    } catch (err) {
      console.error('Error al pedir permiso en HomeScreen:', err);
      setLocationAttempted(true);
      setLocPermModalType('permission');
      setLocPermModalVisible(true);
    }
  };

  // Función para obtener ubicación guardada
  const getStoredLocation = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem('@userLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        // Siempre actualizar el estado con la ubicación guardada
        console.log('📍 Ubicación recuperada de AsyncStorage:', parsedLocation);
        setLocation(parsedLocation);
        return parsedLocation;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener ubicación guardada:', error);
      return null;
    }
  };

  // Función para actualizar ubicación manualmente
  const updateLocation = () => {
    console.log('🔄 Actualizando ubicación...');
    requestLocationPermission();
  };

  const categoryChips = useMemo(
    () => (categories || []).filter(c => c?.id && c.id !== 'Todos' && c?.nombre),
    [categories],
  );

  const sectionTitle = debouncedQuery
    ? `Resultados para “${debouncedQuery}”`
    : filters.open
    ? location
      ? 'Abiertos ahora, cerca de ti'
      : 'Abiertos ahora'
    : location
    ? 'Cerca de ti'
    : 'Servicios';

  const renderServicio = item => {
    const t = item?.taller || {};
    const km = serviceDistanceKm(item, location);
    const rating = ratingValue(item);
    const price = priceValue(item);
    const cat = item?.nombre_categoria || item?.categoria;
    return (
      <TallerCard
        key={item.id || item.uid_servicio}
        title={sentenceCase(item?.nombre_servicio) || 'Servicio'}
        subtitle={sentenceCase(t?.nombre || t?.nombre_taller) || undefined}
        imageUri={firstImage(item?.service_image) || firstImage(t?.image_perfil)}
        distance={formatKm(km)}
        rating={formatRating(rating)}
        open={openState(t?.horarios_atencion)}
        tag={cat ? sentenceCase(cat) : undefined}
        price={formatPrice(price)}
        onPress={() =>
          navigation.navigate('ProductDetailOne', {uid: item.uid_servicio || item.id})
        }
      />
    );
  };

  return (
    <>
      <View style={[homeStyles.header, {paddingTop: insets.top + space.s}]}>
        <View style={homeStyles.headerTop}>
          <View style={{flex: 1}}>
            <AppText variant="body" color={colors.onNavyMuted}>
              {firstName ? `Hola, ${firstName}` : 'Hola'}
            </AppText>
            <AppText variant="display" color={colors.onNavy} accessibilityRole="header">
              ¿Qué necesita tu carro?
            </AppText>
          </View>
          <IconButton
            icon={MapIcon}
            label="Ver talleres en el mapa"
            color={colors.yellow}
            bg="rgba(255,255,255,0.1)"
            onPress={() => navigation.navigate('RadioSelector')}
          />
        </View>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Ej: frenos, cambio de aceite, cauchos…"
          style={{marginTop: space.m}}
        />
      </View>

      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScrollViewScroll}
        scrollEventThrottle={200}
        keyboardShouldPersistTaps="handled">
        {solicitudActiva ? (
          <Card
            style={homeStyles.activeCard}
            onPress={() => navigation.navigate('DrawerScreen', {screen: 'MisSolicitudes'})}
            accessibilityLabel="Ver tu solicitud en curso">
            <View style={homeStyles.activeRow}>
              <View style={{flex: 1}}>
                <AppText variant="caption" color={colors.yellow}>
                  Tu solicitud en curso
                </AppText>
                <AppText variant="subtitle" color={colors.onNavy} numberOfLines={1}>
                  {String(solicitudActiva?.nombre_solicitud || '').trim() || 'Solicitud de servicio'}
                </AppText>
                <AppText variant="caption" color={colors.onNavyMuted}>
                  Esperando respuesta de los talleres · toca para ver propuestas
                </AppText>
              </View>
              <ChevronRight color={colors.yellow} size={22} strokeWidth={2.5} />
            </View>
          </Card>
        ) : null}

        {categoryChips.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={homeStyles.chipsRow}>
            <Chip label="Todos" selected={!category} onPress={() => setCategory(null)} />
            {categoryChips.map(c => (
              <Chip
                key={c.id}
                label={sentenceCase(c.nombre)}
                selected={category === c.id}
                onPress={() => setCategory(category === c.id ? null : c.id)}
              />
            ))}
          </ScrollView>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.chipsRow}>
          <Chip
            icon={Navigation}
            label={`A menos de ${NEAR_KM} km`}
            selected={filters.near}
            onPress={() => toggleFilter('near')}
          />
          <Chip
            icon={Clock}
            label="Abierto ahora"
            selected={filters.open}
            onPress={() => toggleFilter('open')}
          />
          <Chip
            icon={Star}
            label={`${MIN_RATING}★ o más`}
            selected={filters.rated}
            onPress={() => toggleFilter('rated')}
          />
        </ScrollView>

        {filters.near && !location ? (
          <Banner
            tone="warn"
            text="Activa tu ubicación para ver los talleres cercanos."
            actionLabel="Activar"
            onAction={updateLocation}
            style={homeStyles.block}
          />
        ) : null}

        <View style={homeStyles.sectionHead}>
          <AppText variant="title" style={{flex: 1}} numberOfLines={2}>
            {sectionTitle}
          </AppText>
          {searching ? <ActivityIndicator color={colors.navy} /> : null}
        </View>

        {status === 'loading' ? (
          <View style={homeStyles.list}>
            <TallerCardSkeleton />
            <TallerCardSkeleton />
            <TallerCardSkeleton />
          </View>
        ) : status === 'error' ? (
          <Banner text={listError} actionLabel="Reintentar" onAction={reload} style={homeStyles.block} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={anyFilter || debouncedQuery || category ? 'No encontramos servicios con esa búsqueda' : 'Aún no hay servicios cerca'}
            message={
              anyFilter || debouncedQuery || category
                ? 'Prueba con otra palabra o quita algunos filtros.'
                : 'Mira el mapa para ver talleres en tu zona.'
            }
            actionLabel={anyFilter || debouncedQuery || category ? 'Quitar filtros' : 'Ver mapa'}
            onAction={
              anyFilter || debouncedQuery || category
                ? clearAll
                : () => navigation.navigate('RadioSelector')
            }
          />
        ) : (
          <View style={homeStyles.list}>
            {items.map(renderServicio)}
            {loadingMore ? (
              <ActivityIndicator color={colors.navy} style={{marginVertical: space.m}} />
            ) : !hasMore && !anyFilter && items.length > PAGE_SIZE ? (
              <AppText variant="caption" color={colors.muted} style={{textAlign: 'center', marginVertical: space.m}}>
                Eso es todo por ahora
              </AppText>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* ── Modal de alerta genérico (reemplaza Alert.alert en toda la pantalla) ── */}
      <Modal
        visible={appAlertModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setAppAlertModal(a => ({...a, visible: false}))}>
        <View style={appAlertModalStyles.overlay}>
          <View style={appAlertModalStyles.card}>
            <View style={appAlertModalStyles.iconCircle}>
              <Bell color="#1F2344" size={26} strokeWidth={2.2} />
            </View>
            <Text style={appAlertModalStyles.title}>{appAlertModal.title}</Text>
            <Text style={appAlertModalStyles.message}>{appAlertModal.message}</Text>
            <TouchableOpacity
              style={appAlertModalStyles.btn}
              activeOpacity={0.85}
              onPress={() => setAppAlertModal(a => ({...a, visible: false}))}>
              <Text style={appAlertModalStyles.btnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal GPS / permisos de ubicación — se muestra automáticamente al entrar */}
      <LocationPermissionModal
        visible={locPermModalVisible}
        type={locPermModalType}
        onClose={() => setLocPermModalVisible(false)}
      />

      {/* Capa inferior: lista de vehículos (zIndex más bajo) */}
      <Modal
        visible={
          vehiclePickerModalVisible &&
          !kmUpdateModalVisible &&
          !maintenanceDueModalVisible
        }
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeVehiclePickerModal}>
        <View
          style={[
            vehicleReminderStyles.modalLayerRoot,
            {
              zIndex: MODAL_LAYER_VEHICLES,
              elevation: MODAL_ELEVATION_VEHICLES,
            },
          ]}>
        <View style={vehicleReminderStyles.overlay}>
          <View style={vehicleReminderStyles.card}>
            <View style={vehicleReminderStyles.cardHeader}>
              <View style={vehicleReminderStyles.headerAccent} />
              <View style={vehicleReminderStyles.iconHeroWrap}>
                <View style={vehicleReminderStyles.iconHeroCircle}>
                  <Car color="#1F2344" size={34} strokeWidth={2.2} />
                </View>
                <View style={vehicleReminderStyles.sparkleIcon}>
                  <Sparkles color="#FFD60A" size={22} strokeWidth={2} />
                </View>
              </View>
              <Text style={vehicleReminderStyles.cardTitle}>Actualiza tu Vehículo</Text>
              <Text style={vehicleReminderStyles.cardSubtitle}>
                Kilometraje al día = mejores avisos para ti.
              </Text>
              <View style={vehicleReminderStyles.hintChips}>
                <View style={vehicleReminderStyles.hintChip}>
                  <Gauge color="#FFD60A" size={16} strokeWidth={2.2} />
                  <Text style={vehicleReminderStyles.hintChipText}>Km</Text>
                </View>
                <View style={vehicleReminderStyles.hintChip}>
                  <Bell color="#FFD60A" size={16} strokeWidth={2.2} />
                  <Text style={vehicleReminderStyles.hintChipText}>Alertas</Text>
                </View>
                <View style={vehicleReminderStyles.hintChip}>
                  <Car color="#FFD60A" size={16} strokeWidth={2.2} />
                  <Text style={vehicleReminderStyles.hintChipText}>Negocios</Text>
                </View>
              </View>
            </View>

            <Text style={vehicleReminderStyles.sectionLabel}>Elige un vehículo</Text>
            {vehiclesReminderLoading ? (
              <ActivityIndicator size="large" color="#1F2344" style={vehicleReminderStyles.loader} />
            ) : (
              <FlatList
                data={vehiclesReminderList}
                keyExtractor={(item, index) => getVehicleReminderKey(item) || `vehicle-reminder-${index}`}
                style={vehicleReminderStyles.list}
                ListEmptyComponent={
                  <View style={vehicleReminderStyles.emptyWrap}>
                    <Car color="#94A3B8" size={40} strokeWidth={1.8} />
                    <Text style={vehicleReminderStyles.emptyText}>
                      Aún no tienes vehículos registrados.
                    </Text>
                    <TouchableOpacity
                      style={vehicleReminderStyles.emptyAddBtn}
                      activeOpacity={0.88}
                      onPress={() => {
                        setVehiclePickerModalVisible(false);
                        navigation.navigate('VehiclesScreen');
                      }}>
                      <Text style={vehicleReminderStyles.emptyAddBtnText}>
                        Registrar vehículo
                      </Text>
                      <ChevronRight color="#1F2344" size={20} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                }
                renderItem={({item}) => {
                  const key = getVehicleReminderKey(item);
                  const selected = key === selectedVehicleKey;
                  const placa = String(item?.vehiculo_placa || '').toUpperCase();
                  const mm = [item?.vehiculo_marca, item?.vehiculo_modelo].filter(Boolean).join(' ');
                  return (
                    <TouchableOpacity
                      style={[vehicleReminderStyles.row, selected && vehicleReminderStyles.rowSelected]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedVehicleKey(key)}>
                      <View style={vehicleReminderStyles.rowIconCircle}>
                        <Car color={selected ? '#1F2344' : '#64748B'} size={22} strokeWidth={2} />
                      </View>
                      <View style={vehicleReminderStyles.rowTextCol}>
                        <Text style={vehicleReminderStyles.rowPlaca}>{placa || '—'}</Text>
                        <Text style={vehicleReminderStyles.rowSub} numberOfLines={2}>
                          {mm || 'Vehículo'}
                        </Text>
                      </View>
                      {selected ? (
                        <View style={vehicleReminderStyles.rowCheckDot}>
                          <Text style={vehicleReminderStyles.rowCheckMark}>✓</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity
              style={vehicleReminderStyles.checkRow}
              activeOpacity={0.8}
              onPress={() => persistDoNotShowReminder(!reminderDoNotShowAgain)}>
              <View
                style={[
                  vehicleReminderStyles.checkBox,
                  reminderDoNotShowAgain && vehicleReminderStyles.checkBoxOn,
                ]}>
                {reminderDoNotShowAgain ? (
                  <Text style={vehicleReminderStyles.checkMark}>✓</Text>
                ) : null}
              </View>
              <Text style={vehicleReminderStyles.checkLabel}>
                No volver a mostrar este aviso
              </Text>
            </TouchableOpacity>
            <View style={vehicleReminderStyles.btnRow}>
              <TouchableOpacity
                style={vehicleReminderStyles.btnGhost}
                activeOpacity={0.85}
                onPress={closeVehiclePickerModal}>
                <Text style={vehicleReminderStyles.btnGhostText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  vehicleReminderStyles.btnPrimary,
                  (!selectedVehicleKey || vehiclesReminderLoading) &&
                    vehicleReminderStyles.btnPrimaryDisabled,
                ]}
                activeOpacity={
                  !selectedVehicleKey || vehiclesReminderLoading ? 1 : 0.88
                }
                disabled={!selectedVehicleKey || vehiclesReminderLoading}
                onPress={handleOpenKmReminderStep}>
                <Text
                  style={[
                    vehicleReminderStyles.btnPrimaryText,
                    (!selectedVehicleKey || vehiclesReminderLoading) &&
                      vehicleReminderStyles.btnPrimaryTextDisabled,
                  ]}>
                  Siguiente
                </Text>
                <ChevronRight
                  color={
                    !selectedVehicleKey || vehiclesReminderLoading
                      ? '#94A3B8'
                      : '#1F2344'
                  }
                  size={22}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </View>
      </Modal>

      {/* Capa media: input de kilometraje */}
      <Modal
        visible={kmUpdateModalVisible && !maintenanceDueModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => {}}>
        <View
          style={[
            vehicleReminderStyles.modalLayerRoot,
            {
              zIndex: MODAL_LAYER_KM_INPUT,
              elevation: MODAL_ELEVATION_KM_INPUT,
            },
          ]}>
        <KeyboardAvoidingView
          style={vehicleReminderStyles.kmModalKeyboardRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}>
            <View style={vehicleReminderStyles.kmModalRoot}>
              <Pressable
                style={vehicleReminderStyles.kmModalBackdrop}
                onPress={Keyboard.dismiss}
              />
              <View style={vehicleReminderStyles.kmModalCard} pointerEvents="box-none">
                <Pressable onPress={Keyboard.dismiss}>
                  <View style={vehicleReminderStyles.kmModalHeader}>
                    <View style={vehicleReminderStyles.kmModalHeaderIcon}>
                      <Icons name="road" size={20} color="#FFD60A" />
                    </View>
                    <Text style={vehicleReminderStyles.kmModalTitle}>Actualizar kilometraje</Text>
                    <Text style={vehicleReminderStyles.kmModalSubtitle}>
                      Usamos este dato para calcular cuánto falta para cada mantenimiento por km.
                    </Text>
                  </View>
                </Pressable>
                <View style={vehicleReminderStyles.kmModalInputWrap}>
                  <Pressable onPress={Keyboard.dismiss}>
                    <Text style={vehicleReminderStyles.kmModalInputLabel}>Odómetro (km)</Text>
                  </Pressable>
                  <TextInput
                    style={vehicleReminderStyles.kmModalInput}
                    value={kmReminderDraft}
                    onChangeText={t => setKmReminderDraft(t.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    placeholder="Ej. 45200"
                    placeholderTextColor="#94A3B8"
                    maxLength={9}
                    editable={!savingKmReminder}
                  />
                </View>
                <View style={vehicleReminderStyles.kmModalActions}>
                <TouchableOpacity
                  style={vehicleReminderStyles.kmModalBtnGhost}
                  activeOpacity={0.85}
                  disabled={savingKmReminder}
                  onPress={() => {
                    Keyboard.dismiss();
                    setKmUpdateModalVisible(false);
                    setVehiclePickerModalVisible(true);
                  }}>
                  <Text style={vehicleReminderStyles.kmModalBtnGhostText}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={vehicleReminderStyles.kmModalBtnPrimary}
                  activeOpacity={0.88}
                  disabled={savingKmReminder}
                  onPress={handleSaveKmReminder}>
                  {savingKmReminder ? (
                    <ActivityIndicator color="#1F2344" />
                  ) : (
                    <Text style={vehicleReminderStyles.kmModalBtnPrimaryText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Capa superior: éxito tras guardar KM (máxima prioridad) */}
      <Modal
        visible={kmSuccessModalVisible && !maintenanceDueModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={dismissKmSuccessModal}>
        <View
          style={[
            vehicleReminderStyles.modalLayerRoot,
            {
              zIndex: MODAL_LAYER_KM_SUCCESS,
              elevation: MODAL_ELEVATION_KM_SUCCESS,
            },
          ]}>
        <TouchableOpacity
          style={vehicleReminderStyles.kmSuccessModalOverlay}
          activeOpacity={1}
          onPress={dismissKmSuccessModal}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={vehicleReminderStyles.kmSuccessModalCard}>
            <View style={vehicleReminderStyles.kmSuccessIconWrap}>
              <Icons name="check" size={28} color="#1F2344" />
            </View>
            <Text style={vehicleReminderStyles.kmSuccessTitle}>¡Kilometraje actualizado!</Text>
            <Text style={vehicleReminderStyles.kmSuccessSubtitle}>
              {kmSuccessFormatted
                ? `Se guardó correctamente: ${kmSuccessFormatted} km. Las alertas por distancia usarán este valor.`
                : 'El kilometraje se guardó correctamente.'}
            </Text>
            <TouchableOpacity
              style={vehicleReminderStyles.kmSuccessBtn}
              onPress={dismissKmSuccessModal}
              activeOpacity={0.85}>
              <Text style={vehicleReminderStyles.kmSuccessBtnText}>Perfecto</Text>
            </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Mantenimientos vencidos o por vencer (misma lógica que pantalla de mantenimientos) */}
      <Modal
        visible={maintenanceDueModalVisible}
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeMaintenanceDueModal}>
        <View
          style={[
            vehicleReminderStyles.modalLayerRoot,
            {
              zIndex: MODAL_LAYER_MAINTENANCE_DUE,
              elevation: MODAL_ELEVATION_MAINTENANCE_DUE,
            },
          ]}>
          <View style={maintenanceDueModalStyles.overlay}>
            <View style={maintenanceDueModalStyles.card}>
              <View style={maintenanceDueModalStyles.cardHeader}>
                <View style={maintenanceDueModalStyles.headerAccent} />
                <View style={maintenanceDueModalStyles.iconHeroWrap}>
                  <View style={maintenanceDueModalStyles.iconHeroCircle}>
                    <Wrench color="#1F2344" size={32} strokeWidth={2.2} />
                  </View>
                </View>
                <Text style={maintenanceDueModalStyles.cardTitle}>
                  Mantenimientos pendientes
                </Text>
                <Text style={maintenanceDueModalStyles.cardSubtitle}>
                  Hay uno o más servicios vencidos o por vencer. Revisa y actualiza cuando puedas.
                </Text>
              </View>

              {maintenanceDueLoading ? (
                <View style={maintenanceDueModalStyles.listStaticLoading}>
                  <ActivityIndicator size="large" color="#1F2344" />
                </View>
              ) : (
                <View style={maintenanceDueModalStyles.listStaticArea}>
                  {maintenanceDueRows
                    .slice(0, MAINT_DUE_MODAL_PREVIEW_LIMIT)
                    .map(item => {
                      const dRaw = item?.dueInDays;
                      const d = Number(dRaw);
                      const timeLeftLabel =
                        dRaw != null && Number.isFinite(d)
                          ? d < 0
                            ? `Atrasado ${Math.abs(Math.round(d))} días`
                            : d === 0
                              ? 'Vence hoy (días)'
                              : `Faltan ${Math.round(d)} días`
                          : null;
                      const kmHastaRaw = String(
                        item.kmUntilNextServiceText ?? '',
                      ).trim();
                      const kmHastaValor =
                        kmHastaRaw && kmHastaRaw !== '--' ? kmHastaRaw : '—';
                      const hastaProxServicioTag = `Hasta próx. servicio · ${kmHastaValor}`;
                      const tagParts = [
                        item.vehiclePlaca &&
                        String(item.vehiclePlaca).trim() !== '—'
                          ? `Placa ${String(item.vehiclePlaca).trim()}`
                          : null,
                        item.vehicleMarcaModelo &&
                        String(item.vehicleMarcaModelo).trim() &&
                        String(item.vehicleMarcaModelo).trim() !== 'Vehículo'
                          ? String(item.vehicleMarcaModelo).trim()
                          : null,
                        item.nextReview &&
                        String(item.nextReview).trim() &&
                        String(item.nextReview).trim() !== '—'
                          ? `Próx. ${String(item.nextReview).trim()}`
                          : null,
                        timeLeftLabel,
                        hastaProxServicioTag,
                      ].filter(Boolean);
                      return (
                        <View key={item.key} style={maintenanceDueModalStyles.row}>
                          <View style={maintenanceDueModalStyles.rowTop}>
                            <Text
                              style={maintenanceDueModalStyles.rowTitleInTop}
                              numberOfLines={2}>
                              {item.title}
                            </Text>
                            <View
                              style={[
                                maintenanceDueModalStyles.badge,
                                {backgroundColor: item.statusColor},
                              ]}>
                              <Text style={maintenanceDueModalStyles.badgeText}>
                                {item.statusLabel}
                              </Text>
                            </View>
                          </View>
                          <ScrollView
                            horizontal
                            nestedScrollEnabled
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            style={maintenanceDueModalStyles.vehicleTagsScroll}
                            contentContainerStyle={
                              maintenanceDueModalStyles.vehicleTagsScrollContent
                            }>
                            {tagParts.length > 0 ? (
                              tagParts.map((label, idx) => (
                                <View
                                  key={`${item.key}-tag-${idx}`}
                                  style={maintenanceDueModalStyles.tagChip}>
                                  <Text
                                    style={maintenanceDueModalStyles.tagChipText}
                                    numberOfLines={1}>
                                    {label}
                                  </Text>
                                </View>
                              ))
                            ) : (
                              <View style={maintenanceDueModalStyles.tagChip}>
                                <Text
                                  style={maintenanceDueModalStyles.tagChipText}>
                                  Vehículo
                                </Text>
                              </View>
                            )}
                          </ScrollView>
                        </View>
                      );
                    })}
                  {maintenanceDueRows.length > MAINT_DUE_MODAL_PREVIEW_LIMIT ? (
                    <TouchableOpacity
                      style={maintenanceDueModalStyles.moreVehiclesLink}
                      activeOpacity={0.88}
                      onPress={goToVehiclesFromMaintenanceModal}>
                      <View style={maintenanceDueModalStyles.moreVehiclesTextCol}>
                        <Text style={maintenanceDueModalStyles.moreVehiclesCount}>
                          {(maintenanceDueRows.length -
                            MAINT_DUE_MODAL_PREVIEW_LIMIT) ===
                          1
                            ? 'Hay 1 mantenimiento más'
                            : `Hay ${
                                maintenanceDueRows.length -
                                MAINT_DUE_MODAL_PREVIEW_LIMIT
                              } mantenimientos más`}
                        </Text>
                        <Text style={maintenanceDueModalStyles.moreVehiclesHint}>
                          Ir a Mis vehículos para verlos todos
                        </Text>
                      </View>
                      <ChevronRight
                        color="#1F2344"
                        size={22}
                        strokeWidth={2.5}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}

              <View style={maintenanceDueModalStyles.footerSticky}>
                <TouchableOpacity
                  style={vehicleReminderStyles.checkRow}
                  activeOpacity={0.8}
                  onPress={() =>
                    persistDoNotShowMaintenancePopup(!maintenanceDoNotShowAgain)
                  }>
                  <View
                    style={[
                      vehicleReminderStyles.checkBox,
                      maintenanceDoNotShowAgain &&
                        vehicleReminderStyles.checkBoxOn,
                    ]}>
                    {maintenanceDoNotShowAgain ? (
                      <Text style={vehicleReminderStyles.checkMark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={vehicleReminderStyles.checkLabel}>
                    No volver a mostrar este aviso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={maintenanceDueModalStyles.closeBtn}
                  activeOpacity={0.85}
                  onPress={closeMaintenanceDueModal}>
                  <Text style={maintenanceDueModalStyles.closeBtnText}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const maintenanceDueModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.62)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '88%',
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },
  cardHeader: {
    flexShrink: 0,
    backgroundColor: '#1F2344',
    paddingTop: 6,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD60A',
    marginBottom: 12,
  },
  iconHeroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconHeroCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 6,
  },
  listStaticArea: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    marginTop: 10,
  },
  listStaticLoading: {
    minHeight: 120,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28,
  },
  moreVehiclesLink: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C5D4F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreVehiclesTextCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  moreVehiclesCount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 3,
  },
  moreVehiclesHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 17,
  },
  footerSticky: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  closeBtn: {
    marginTop: 12,
    marginHorizontal: 0,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#F8FAFF',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 8,
  },
  rowTitleInTop: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2344',
    marginRight: 4,
  },
  vehicleTagsScroll: {
    marginTop: 8,
  },
  vehicleTagsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingRight: 4,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C5D4F5',
    marginRight: 8,
    maxWidth: 220,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {fontSize: 11, fontWeight: '800', color: '#FFFFFF'},
});

const vehicleReminderStyles = StyleSheet.create({
  modalLayerRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.62)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingBottom: 18,
    maxHeight: '82%',
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },
  cardHeader: {
    backgroundColor: '#1F2344',
    paddingTop: 6,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerAccent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD60A',
    marginBottom: 14,
  },
  iconHeroWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconHeroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  sparkleIcon: {
    position: 'absolute',
    right: -6,
    top: -4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  hintChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.45)',
  },
  hintChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD60A',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
    marginHorizontal: 18,
  },
  loader: {marginVertical: 20},
  list: {maxHeight: 220, marginBottom: 4, paddingHorizontal: 18},
  emptyWrap: {alignItems: 'center', paddingVertical: 20},
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    fontWeight: '600',
    marginTop: 12,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  emptyAddBtn: {
    marginTop: 18,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2344',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFF',
  },
  rowSelected: {
    borderColor: '#FFD60A',
    backgroundColor: 'rgba(255,214,10,0.14)',
    borderWidth: 2,
  },
  rowIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rowTextCol: {flex: 1},
  rowPlaca: {fontSize: 17, fontWeight: '900', color: '#1F2344'},
  rowSub: {fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 3},
  rowCheckDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCheckMark: {color: '#1F2344', fontWeight: '900', fontSize: 14},
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
    marginHorizontal: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1F2344',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {backgroundColor: '#1F2344'},
  checkMark: {color: '#FFD60A', fontWeight: '900', fontSize: 14},
  checkLabel: {flex: 1, fontSize: 13, color: '#334155', fontWeight: '600', lineHeight: 20},
  checkLabelHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: {fontSize: 15, fontWeight: '800', color: '#64748B'},
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnPrimaryDisabled: {
    backgroundColor: '#E2E8F0',
  },
  btnPrimaryText: {fontSize: 15, fontWeight: '900', color: '#1F2344'},
  btnPrimaryTextDisabled: {
    color: '#94A3B8',
  },
  kmModalKeyboardRoot: {flex: 1},
  kmModalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  kmModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,13,46,0.55)',
  },
  kmModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    shadowColor: '#0A1840',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 14,
    zIndex: 2,
  },
  kmModalHeader: {alignItems: 'center', marginBottom: 18},
  kmModalHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kmModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2344',
    textAlign: 'center',
    marginBottom: 6,
  },
  kmModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  kmModalInputWrap: {marginBottom: 20},
  kmModalInputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
  },
  kmModalInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2344',
    backgroundColor: '#F3F6FF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#C5D4F5',
  },
  kmModalActions: {flexDirection: 'row'},
  kmModalBtnGhost: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmModalBtnGhostText: {fontSize: 15, fontWeight: '800', color: '#64748B'},
  kmModalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmModalBtnPrimaryText: {fontSize: 15, fontWeight: '900', color: '#1F2344'},
  kmSuccessModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  kmSuccessModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECFA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  kmSuccessIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  kmSuccessTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 6,
    textAlign: 'center',
  },
  kmSuccessSubtitle: {
    fontSize: 14,
    color: '#5D668A',
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },
  kmSuccessBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

const homeStyles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: space.m,
    paddingTop: space.m,
    paddingBottom: space.m + 4,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {flexDirection: 'row', alignItems: 'flex-start', gap: space.s},
  scroll: {flex: 1, backgroundColor: colors.bg},
  scrollContent: {paddingBottom: 96, paddingTop: space.m},
  chipsRow: {paddingHorizontal: space.m, paddingBottom: space.s},
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.m,
    marginTop: space.s,
    marginBottom: 12,
    gap: space.s,
  },
  list: {paddingHorizontal: space.m},
  block: {marginHorizontal: space.m, marginBottom: 12},
  activeCard: {
    marginHorizontal: space.m,
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  activeRow: {flexDirection: 'row', alignItems: 'center', gap: space.s},
});

const appAlertModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,45,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FFD60A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2344',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  btn: {
    backgroundColor: '#1F2344',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1F2344',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default React.memo(HomeScreen);
