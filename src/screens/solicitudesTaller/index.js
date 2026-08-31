import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Keyboard,
  Image,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';
import MapboxNavigation from '../../commonComponents/MapboxNavigation';
import appColors from '../../themes/appColors';
import api from '../../../axiosInstance';

const STATUS_EN_ESPERA = 'En espera por aprobación';

const MAPBOX_TOKEN = 'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

/**
 * Mapa de solo lectura con un marker en la ubicación dada.
 * `interactive=false` → thumbnail embebido en el modal (no roba el scroll).
 * `interactive=true`  → fullscreen navegable.
 */
const buildLocationViewerHTML = (lat, lng, interactive = true) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;background:#EEF1F8;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none!important;}
    .mapboxgl-ctrl-top-right,.mapboxgl-ctrl-top-left{display:none!important;}
  </style>
</head>
<body>
<div id="map"></div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({
  container:'map',
  style:'mapbox://styles/mapbox/streets-v12',
  center:[${lng},${lat}],
  zoom:15,
  attributionControl:false,
  interactive:${interactive}
});
new mapboxgl.Marker({color:'#E11D48'})
  .setLngLat([${lng},${lat}])
  .addTo(map);
<\/script>
</body>
</html>`;
const RADIO_SOLICITUDES_KM = 10;

/** Igual que en home / mantenimiento: unifica userData anidado de getUserByUid. */
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
 * Taller: cuenta aprobada + subscripcion_actual.status === 'Aprobado'.
 * `userRow` debe venir de getUserByUid (aplanado), no solo de AsyncStorage.
 */
const getTallerSolicitudesAccess = userRow => {
  if (!userRow || userRow.typeUser !== 'Taller') {
    return {allowed: true, bloqueoMotivo: null};
  }
  const cuentaOk =
    String(userRow.status ?? '').trim().toLowerCase() === 'aprobado';
  if (!cuentaOk) {
    return {allowed: false, bloqueoMotivo: 'cuenta_pendiente'};
  }
  const subRaw = String(userRow.subscripcion_actual?.status ?? '').trim();
  const subNorm = subRaw.toLowerCase();
  const planOk = subRaw === 'Aprobado' || subNorm === 'aprobado';
  if (!planOk) {
    return {allowed: false, bloqueoMotivo: 'plan_no_activo'};
  }
  return {allowed: true, bloqueoMotivo: null};
};

const TIEMPO_OPCIONES = [
  { value: '1 hora' },
  { value: '2-3 horas' },
  { value: 'Medio día' },
  { value: '1 día' },
  { value: '2+ días' },
  { value: 'Otro', isOtro: true },
];

const formatPrecioConPuntos = rawStr => {
  const digits = (rawStr || '').replace(/\D/g, '');
  if (digits.length === 0) return '';
  const reversed = digits.split('').reverse();
  const groups = [];
  for (let i = 0; i < reversed.length; i += 3) {
    groups.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  return groups.reverse().join('.');
};

const precioToRaw = formattedStr => (formattedStr || '').replace(/\./g, '');

const formatFechaSolicitud = fecha_solicitud => {
  if (!fecha_solicitud || typeof fecha_solicitud._seconds !== 'number') {
    return '';
  }
  const d = new Date(fecha_solicitud._seconds * 1000);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${anio}-${mes}-${dia} ${h}:${min}`;
};

const toRad = value => (value * Math.PI) / 180;
const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const _lat1 = parseFloat(lat1);
  const _lon1 = parseFloat(lon1);
  const _lat2 = parseFloat(lat2);
  const _lon2 = parseFloat(lon2);

  if (![ _lat1, _lon1, _lat2, _lon2 ].every(v => Number.isFinite(v))) return null;

  const R = 6371; // km
  const dLat = toRad(_lat2 - _lat1);
  const dLon = toRad(_lon2 - _lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(_lat1)) * Math.cos(toRad(_lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const mapItemToServicio = item => {
  const vehiculo = item.vehiculo || {};
  const marca = vehiculo.vehiculo_marca || '';
  const modelo = vehiculo.vehiculo_modelo || '';
  const anio =
    vehiculo.vehiculo_anio !== undefined &&
    vehiculo.vehiculo_anio !== null &&
    String(vehiculo.vehiculo_anio).trim() !== ''
      ? ` (${vehiculo.vehiculo_anio})`
      : '';
  const vehiculoTexto = `${marca} ${modelo}${anio}`.trim() || '—';
  return {
    id: item.id,
    nombreSolicitud: item.nombre_solicitud || 'Solicitud de servicio',
    cliente: item.nombre_usuario || '—',
    vehiculo: vehiculoTexto,
    vehiculoObj: vehiculo,
    fecha: formatFechaSolicitud(item.fecha_propuesta ?? item.fecha_solicitud),
    urgencia: item.urgencia || 'Normal',
    status: item.status || STATUS_EN_ESPERA,
    descripcion: item.descripcion || '',
    imagenes: Array.isArray(item.solicitud_images) ? item.solicitud_images : [],
    precio_estimado: item.precio_estimado ?? null,
    tiempo_estimado: item.tiempo_estimado ?? '',
    comentario: item.comentario ?? '',
    _distanceKm: item._distanceKm ?? null,
    latitude: item.latitude,
    longitude: item.longitude,
  };
};

const formatVehiculoValue = (value, suffix = '') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return '—';
  }
  return suffix ? `${value}${suffix}` : String(value);
};

const FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'aceptadas', label: 'Aceptadas' },
  { key: 'presupuestadas', label: 'Cotizadas' },
  { key: 'inspeccion_previa', label: 'Inspección' },
  { key: 'rechazadas', label: 'Rechazadas' },
];

const SolicitudesTallerScreen = () => {
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const toggleSection = key =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const [cotizacionModalVisible, setCotizacionModalVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [mapFullScreenVisible, setMapFullScreenVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [precioEstimado, setPrecioEstimado] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState('');
  const [tiempoEstimadoOtro, setTiempoEstimadoOtro] = useState('');
  const [comentario, setComentario] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [servicios, setServicios] = useState([]);
  const [serviciosRaw, setServiciosRaw] = useState([]); // estructura original del API para savePropuesta
  const [serviciosEnEspera, setServiciosEnEspera] = useState([]);
  const [serviciosEnEsperaRaw, setServiciosEnEsperaRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmInspeccionVisible, setConfirmInspeccionVisible] = useState(false);
  const [inspeccionMotivo, setInspeccionMotivo] = useState('');
  const [confirmRechazarVisible, setConfirmRechazarVisible] = useState(false);
  const [loadingCotizacion, setLoadingCotizacion] = useState(false);
  const [loadingInspeccion, setLoadingInspeccion] = useState(false);
  const [loadingRechazar, setLoadingRechazar] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const userLocationRequestedRef = useRef(false);
  /** null = comprobando; false = no puede operar; true = cuenta + plan OK */
  const [tallerCuentaAprobada, setTallerCuentaAprobada] = useState(null);
  /** Si false: por cuenta pendiente o por suscripción distinta de Aprobado */
  const [solicitudesBloqueoMotivo, setSolicitudesBloqueoMotivo] = useState(null);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permiso de ubicación',
        message: 'Necesitamos tu ubicación para ordenar las solicitudes por cercanía.',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;

      return await new Promise(resolve => {
        Geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      });
    } catch {
      return null;
    }
  }, [requestLocationPermission]);

  const attachDistanceAndSort = useCallback((rawList, location) => {
    const data = Array.isArray(rawList) ? rawList : [];
    const withDistance = data.map(item => {
      const distance = calcularDistanciaKm(
        location?.latitude,
        location?.longitude,
        item?.latitude,
        item?.longitude,
      );
      return {
        ...item,
        _distanceKm: Number.isFinite(distance) ? distance : null,
      };
    });

    withDistance.sort((a, b) => {
      const da = Number.isFinite(a?._distanceKm)
        ? a._distanceKm
        : Number.MAX_SAFE_INTEGER;
      const db = Number.isFinite(b?._distanceKm)
        ? b._distanceKm
        : Number.MAX_SAFE_INTEGER;
      return da - db;
    });

    return withDistance;
  }, []);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid ?? userInfo?.id;
      if (!uid) {
        setServicios([]);
        setError('No se encontró la sesión del taller.');
        return;
      }

      console.log("uid- status- en espera", uid, STATUS_EN_ESPERA);
      const response = await api.post('usuarios/getSolicitudesByUsuarioAndStatus', {
        uid_taller: uid,
        status: STATUS_EN_ESPERA,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      const sortedData = attachDistanceAndSort(data, userLocation);
      const hasUserLoc =
        userLocation &&
        Number.isFinite(userLocation.latitude) &&
        Number.isFinite(userLocation.longitude);
      const filteredData = hasUserLoc
        ? sortedData.filter(
            item =>
              Number.isFinite(item._distanceKm) &&
              item._distanceKm <= RADIO_SOLICITUDES_KM,
          )
        : sortedData;
      setServicios(filteredData.map(mapItemToServicio));
      setServiciosRaw(filteredData);
      setServiciosEnEspera(filteredData.map(mapItemToServicio));
      setServiciosEnEsperaRaw(filteredData);
    } catch (e) {
      setServicios([]);
      setServiciosEnEspera([]);
      setServiciosEnEsperaRaw([]);
      setError('No se pudieron cargar las solicitudes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [attachDistanceAndSort, userLocation]);

  const statusByFilter = {
    aceptadas: 'Aceptada',
    presupuestadas: 'Cotizado',
    inspeccion_previa: 'inspeccion',
    rechazadas: 'Rechazada',
  };

  const loadPropuestasByStatus = useCallback(async filterKey => {
    const status = statusByFilter[filterKey];
    if (!status) return;
    try {
      setLoading(true);
      setError('');
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid ?? userInfo?.id;
      if (!uid) {
        setServicios([]);
        setServiciosRaw([]);
        setError('No se encontró la sesión del taller.');
        return;
      }


      const response = await api.post('usuarios/getPropuestasByStatus', {
        uid_taller: uid,
        status,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      console.log("data", data);
      const sortedData = attachDistanceAndSort(data, userLocation);
      setServicios(sortedData.map(mapItemToServicio));
      setServiciosRaw(sortedData);
    } catch (e) {
      setServicios([]);
      setServiciosRaw([]);
      setError('No se pudieron cargar las propuestas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [attachDistanceAndSort, userLocation]);

  useEffect(() => {
    if (userLocationRequestedRef.current) return;
    userLocationRequestedRef.current = true;
    getCurrentLocation().then(location => {
      if (location) {
        setUserLocation(location);
      }
    });
  }, [getCurrentLocation]);

  // Solo reaccionar al cambio de filtro cuando NO es Todas (Todas se carga por clic o por mount)
  useEffect(() => {
    if (tallerCuentaAprobada !== true) return;
    if (activeFilter === 'todas') return;
    if (activeFilter === 'aceptadas' || activeFilter === 'presupuestadas' || activeFilter === 'inspeccion_previa' || activeFilter === 'rechazadas') {
      loadPropuestasByStatus(activeFilter);
    }
  }, [activeFilter, loadPropuestasByStatus, tallerCuentaAprobada]);

  /**
   * 1) usuarios/getUserByUid → aplanar → validar cuenta + plan.
   * 2) Si OK, cargar solicitudes o propuestas según filtro actual.
   * cancelRef.cancelled = true al salir de la pantalla (evita setState tras blur).
   */
  const bootstrapFromGetUserByUid = useCallback(
    async cancelRef => {
      const isDead = () => cancelRef?.cancelled === true;
      try {
        const str = await AsyncStorage.getItem('@userInfo');
        const local = str ? JSON.parse(str) : null;
        const uid = local?.uid ?? local?.id;
        if (!uid) {
          if (!isDead()) {
            setTallerCuentaAprobada(false);
            setSolicitudesBloqueoMotivo('cuenta_pendiente');
            setLoading(false);
            setError('');
            setServicios([]);
            setServiciosRaw([]);
            setServiciosEnEspera([]);
            setServiciosEnEsperaRaw([]);
          }
          return;
        }

        if (!isDead()) {
          setLoading(true);
        }
        const res = await api.post('usuarios/getUserByUid', {uid});
        if (isDead()) return;

        const userRow = flattenUserDataFromGetUserResponse(res?.data ?? {});
        const gate = getTallerSolicitudesAccess(userRow);

        if (isDead()) return;
        setTallerCuentaAprobada(gate.allowed);
        setSolicitudesBloqueoMotivo(gate.bloqueoMotivo);

        if (!gate.allowed) {
          setLoading(false);
          setError('');
          setServicios([]);
          setServiciosRaw([]);
          setServiciosEnEspera([]);
          setServiciosEnEsperaRaw([]);
          return;
        }

        if (activeFilter === 'todas') {
          await loadSolicitudes();
        } else if (
          activeFilter === 'aceptadas' ||
          activeFilter === 'presupuestadas' ||
          activeFilter === 'inspeccion_previa' ||
          activeFilter === 'rechazadas'
        ) {
          await loadPropuestasByStatus(activeFilter);
        } else {
          await loadSolicitudes();
        }
      } catch {
        if (!isDead()) {
          setTallerCuentaAprobada(false);
          setSolicitudesBloqueoMotivo('cuenta_pendiente');
          setLoading(false);
          setError('');
          setServicios([]);
          setServiciosRaw([]);
          setServiciosEnEspera([]);
          setServiciosEnEsperaRaw([]);
        }
      }
    },
    [activeFilter, loadSolicitudes, loadPropuestasByStatus],
  );

  const handleRefresh = useCallback(() => {
    void bootstrapFromGetUserByUid(null);
  }, [bootstrapFromGetUserByUid]);

  useFocusEffect(
    useCallback(() => {
      const cancelRef = {cancelled: false};
      void bootstrapFromGetUserByUid(cancelRef);
      return () => {
        cancelRef.cancelled = true;
      };
    }, [bootstrapFromGetUserByUid]),
  );

  const filteredServicios = useMemo(() => {
    if (activeFilter === 'todas') return servicios;
    // Aceptadas, Cotizadas, Inspección y Rechazadas ya vienen filtradas por getPropuestasByStatus
    if (activeFilter === 'aceptadas' || activeFilter === 'presupuestadas' || activeFilter === 'inspeccion_previa' || activeFilter === 'rechazadas') return servicios;
    return servicios;
  }, [activeFilter, servicios]);

  const handleOpenDetalle = servicio => {
    setSelectedServicio(servicio);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedServicio(null);
    setOpenSections({});
  };

  const closeFullImage = useCallback(() => {
    setFullImageVisible(false);
    setFullImageUrl('');
    if (selectedServicio) {
      setTimeout(() => setModalVisible(true), 250);
    }
  }, [selectedServicio]);

  const openCotizacionModal = () => {
    setModalVisible(false);
    setPrecioEstimado('');
    setTiempoEstimado('');
    setTiempoEstimadoOtro('');
    setComentario('');
    setTimeout(() => setCotizacionModalVisible(true), 350);
  };

  const closeCotizacionModal = () => {
    if (loadingCotizacion) return;
    setCotizacionModalVisible(false);
    setPrecioEstimado('');
    setTiempoEstimado('');
    setTiempoEstimadoOtro('');
    setComentario('');
    setLoadingCotizacion(false);
  };

  const handlePrecioChange = text => {
    setPrecioEstimado(formatPrecioConPuntos(text));
  };

  // Construye el body para usuarios/savePropuesta: misma estructura que recibimos + status + uid_taller + nombre_taller + (si Cotizado) los 3 campos
  const buildSavePropuestaBody = useCallback(
    (rawItem, action, cotizacionFields = null, userInfo = null) => {
      if (!rawItem) return null;
      const { fecha_solicitud, ...restRaw } = rawItem;
      const uid_taller = userInfo?.uid ?? userInfo?.id ?? '';
      const nombre_taller = userInfo?.nombre_taller ?? userInfo?.nombre ?? userInfo?.taller ?? '';
      const base = {
        ...restRaw,
        status: action,
        nombre_solicitud: rawItem.nombre_solicitud ?? '',
        uid_solicitud: rawItem.id ?? '', // id de la consulta getSolicitudesByUsuarioAndStatus
        uid_taller,
        nombre_taller,
      };
      if (action === 'Cotizado') {
        base.precio_estimado = cotizacionFields?.precio_estimado ?? '';
        base.tiempo_estimado = cotizacionFields?.tiempo_estimado ?? '';
        base.comentario = cotizacionFields?.comentario ?? '';
      }
      if (action === 'inspeccion' && cotizacionFields?.comentario != null) {
        base.comentario = String(cotizacionFields.comentario).trim();
      }
      return base;
    },
    [],
  );

  const handleEnviarCotizacion = async () => {
    if (loadingCotizacion) return;
    const precioRaw = precioToRaw(precioEstimado).trim();
    if (!precioRaw) {
      Alert.alert('Campo requerido', 'Ingresa el precio estimado.');
      return;
    }
    const tiempoFinal = tiempoEstimado === 'Otro' ? (tiempoEstimadoOtro || '').trim() : (tiempoEstimado || '').trim();
    if (!tiempoFinal) {
      Alert.alert(
        'Campo requerido',
        tiempoEstimado === 'Otro' ? 'Escribe el tiempo estimado en el campo "Otro".' : 'Selecciona el tiempo estimado.',
      );
      return;
    }
    const rawItem = serviciosRaw.find(s => s.id === selectedServicio?.id);
    if (!rawItem) {
      Alert.alert('Error', 'No se encontró la solicitud.');
      return;
    }
    setLoadingCotizacion(true);
    try {
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const body = buildSavePropuestaBody(rawItem, 'Cotizado', {
        precio_estimado: precioRaw,
        tiempo_estimado: tiempoFinal,
        comentario: (comentario || '').trim(),
      }, userInfo);

      console.log('body1234567890', body);



      await api.post('usuarios/savePropuesta', body);
      closeCotizacionModal();
      handleCloseModal();
      handleRefresh();
      Alert.alert('Cotización enviada', 'Tu cotización ha sido enviada al cliente.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo enviar la cotización.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingCotizacion(false);
    }
  };

  const openConfirmInspeccion = () => {
    setInspeccionMotivo('');
    setModalVisible(false);
    setTimeout(() => setConfirmInspeccionVisible(true), 300);
  };
  const openConfirmRechazar = () => {
    setModalVisible(false);
    setTimeout(() => setConfirmRechazarVisible(true), 300);
  };

  const closeConfirmInspeccionModal = () => {
    if (!loadingInspeccion) {
      setInspeccionMotivo('');
      setConfirmInspeccionVisible(false);
      if (selectedServicio) setTimeout(() => setModalVisible(true), 250);
    }
  };
  const closeConfirmRechazarModal = () => {
    if (!loadingRechazar) {
      setConfirmRechazarVisible(false);
      if (selectedServicio) setTimeout(() => setModalVisible(true), 250);
    }
  };

  const handleConfirmInspeccion = async () => {
    if (!selectedServicio || loadingInspeccion) return;
    const motivo = inspeccionMotivo.trim();
    if (!motivo) {
      Alert.alert(
        'Campo requerido',
        'Escribe el motivo por el que solicitas la inspección previa.',
      );
      return;
    }
    const rawItem = serviciosRaw.find(s => s.id === selectedServicio.id);
    if (!rawItem) {
      Alert.alert('Error', 'No se encontró la solicitud.');
      return;
    }
    setLoadingInspeccion(true);
    try {
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const body = buildSavePropuestaBody(
        rawItem,
        'inspeccion',
        {comentario: motivo},
        userInfo,
      );
      console.log('body1234567890', body);
      await api.post('usuarios/savePropuesta', body);
      setInspeccionMotivo('');
      setConfirmInspeccionVisible(false);
      handleCloseModal();
      handleRefresh();
      Alert.alert('Inspección solicitada', 'Se ha solicitado la inspección previa para esta solicitud.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo completar la acción.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingInspeccion(false);
    }
  };

  const handleConfirmRechazar = async () => {
    if (!selectedServicio || loadingRechazar) return;
    const rawItem = serviciosRaw.find(s => s.id === selectedServicio.id);
    if (!rawItem) {
      Alert.alert('Error', 'No se encontró la solicitud.');
      return;
    }
    setLoadingRechazar(true);
    try {
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const body = buildSavePropuestaBody(rawItem, 'Rechazada', null, userInfo);
      console.log('body1234567890', body);
      await api.post('usuarios/savePropuesta', body);
      setConfirmRechazarVisible(false);
      handleCloseModal();
      handleRefresh();
      Alert.alert('Solicitud rechazada', 'La solicitud ha sido rechazada.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo completar la acción.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingRechazar(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>Solicitudes de servicio</Text>
            {tallerCuentaAprobada === true && (
              <TouchableOpacity
                style={styles.headerRefreshBtn}
                onPress={handleRefresh}
                activeOpacity={0.8}>
                <MaterialCommunityIcons
                  name="refresh"
                  size={16}
                  color={appColors.subtitle}
                />
                <Text style={styles.headerRefreshText}>Actualizar</Text>
              </TouchableOpacity>
            )}
          </View>
          {tallerCuentaAprobada === true && (
            <Text style={styles.headerSubtitle}>
              Revisa las solicitudes que han llegado a tu taller y decide el siguiente paso.
            </Text>
          )}
          {tallerCuentaAprobada === false && (
            <Text style={styles.headerSubtitle}>
              {solicitudesBloqueoMotivo === 'plan_no_activo'
                ? 'Necesitas un plan activo y aprobado para ver y responder solicitudes.'
                : 'Tu cuenta de taller aún no está activa en la plataforma.'}
            </Text>
          )}
        </View>
      </View>

      {tallerCuentaAprobada === true && (
      <>
      {/* Filtros por estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersScrollContent}
        nestedScrollEnabled>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          const onFilterPress = () => {
            setActiveFilter(f.key);
            if (f.key === 'todas') loadSolicitudes();
          };
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.85}
              onPress={onFilterPress}>
              <Text
                numberOfLines={1}
                style={[
                  styles.filterChipLabel,
                  isActive && styles.filterChipLabelActive,
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista filtrada */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={
          loading
            ? styles.loadingContent
            : filteredServicios.length === 0
            ? styles.emptyContent
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={appColors.primary} />
            <Text style={styles.loadingText}>Cargando solicitudes...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color={appColors.subtitle}
            />
            <Text style={styles.emptyTitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRefresh}
              activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : filteredServicios.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={48}
              color={appColors.subtitle}
            />
            <Text style={styles.emptyTitle}>No hay solicitudes en este filtro</Text>
            <Text style={styles.emptySubtitle}>
              Cambia el filtro superior para ver otras solicitudes disponibles.
            </Text>
          </View>
        ) : (
          filteredServicios.map(item => {
            const cardClickable = true;
            return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={cardClickable ? 0.9 : 1}
              onPress={cardClickable ? () => handleOpenDetalle(item) : undefined}
              style={styles.card}
              disabled={!cardClickable}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleColumn}>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {item.nombreSolicitud}
                  </Text>
                  <Text style={styles.cardCliente} numberOfLines={1}>
                    {item.cliente}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <View style={styles.badgeUrgencia(item.urgencia)}>
                    <Text style={styles.badgeUrgenciaText}>{item.urgencia}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={14}
                  color={appColors.subtitle}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>{item.fecha}</Text>
              </View>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons
                  name="car-side"
                  size={14}
                  color={appColors.subtitle}
                  style={styles.metaIcon}
                />
                <Text style={styles.vehicleText} numberOfLines={1}>
                  {item.vehiculo}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.statusChip}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#0369A1"
                    style={styles.metaIcon}
                  />
                  <Text style={styles.statusChipText} numberOfLines={1}>
                    {item.status}
                  </Text>
                </View>
                <View style={styles.distanceChip}>
                  <MaterialCommunityIcons
                    name="map-marker-distance"
                    size={12}
                    color="#1D4ED8"
                  />
                  <Text style={styles.distanceChipText}>
                    {item?._distanceKm != null
                      ? Number(item._distanceKm).toFixed(2)
                      : '—'} km
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      </>
      )}

      {tallerCuentaAprobada === false && (
        <View style={styles.pendingAccountWrap}>
          <View style={styles.pendingAccountCard}>
            <View style={styles.pendingIconCircle}>
              <MaterialCommunityIcons
                name={
                  solicitudesBloqueoMotivo === 'plan_no_activo'
                    ? 'credit-card-clock-outline'
                    : 'clock-outline'
                }
                size={44}
                color="#D97706"
              />
            </View>
            {solicitudesBloqueoMotivo === 'plan_no_activo' ? (
              <>
                <Text style={styles.pendingAccountTitle}>
                  Activa tu plan para usar solicitudes
                </Text>
                <Text style={styles.pendingAccountText}>
                  Solo puedes operar esta sección con una suscripción en estado
                  Aprobado. Si tu plan venció, está por aprobar o aún no tienes
                  uno contratado, renueva o elige un plan desde tu perfil.
                </Text>
                <Text style={styles.pendingAccountHint}>
                  En cuanto la suscripción quede aprobada, podrás ver las
                  solicitudes cercanas a tu taller.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.pendingAccountTitle}>
                  Estamos revisando tu taller
                </Text>
                <Text style={styles.pendingAccountText}>
                  Tu perfil todavía no está activo. Los administradores validarán
                  tu registro y, cuando te aprueben, podrás ver y responder las
                  solicitudes de servicio de clientes cercanos.
                </Text>
                <Text style={styles.pendingAccountHint}>
                  No necesitas hacer nada más por ahora: te avisaremos cuando tu
                  cuenta quede habilitada.
                </Text>
              </>
            )}
          </View>
        </View>
      )}

      {tallerCuentaAprobada === null && (
        <View style={[styles.list, styles.pendingAccountWrap]}>
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={appColors.primary} />
            <Text style={styles.loadingText}>
              Comprobando cuenta y suscripción...
            </Text>
          </View>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              selectedServicio?.status !== STATUS_EN_ESPERA && styles.modalCardLarge,
            ]}>
            <Text style={styles.modalTitle}>Detalle de la solicitud</Text>

            {selectedServicio && (
              <ScrollView
                style={
                  selectedServicio.status === STATUS_EN_ESPERA
                    ? styles.modalScroll
                    : styles.modalScrollLarge
                }
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}>
                {selectedServicio.imagenes && selectedServicio.imagenes.length > 0 && (
                  <View style={styles.modalImagesSection}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.modalImagesRow}>
                      {selectedServicio.imagenes.map((url, idx) => (
                        <TouchableOpacity
                          key={`${url}-${idx}`}
                          activeOpacity={0.85}
                          onPress={() => {
                            setFullImageUrl(url);
                            setModalVisible(false);
                            setTimeout(() => setFullImageVisible(true), 300);
                          }}>
                          <Image
                            source={{ uri: url }}
                            style={styles.modalImageThumb}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {/* Sección: Solicitud */}
                <View style={[styles.modalSection, { borderLeftColor: '#1D1E56' }]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleSection('solicitud')}
                    style={[styles.modalSectionHeader, { backgroundColor: '#1D1E56' }]}>
                    <MaterialCommunityIcons name="file-document-outline" size={17} color="#FFD60A" />
                    <Text style={styles.modalSectionTitle}>Solicitud</Text>
                    <MaterialCommunityIcons
                      name={openSections.solicitud ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                  {openSections.solicitud && (
                    <View style={styles.modalSectionCard}>
                      <Text style={styles.modalServiceName} numberOfLines={2}>
                        {selectedServicio.nombreSolicitud}
                      </Text>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Cliente</Text>
                        <Text style={styles.modalValue}>{selectedServicio.cliente}</Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Fecha</Text>
                        <Text style={styles.modalValue}>{selectedServicio.fecha}</Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Urgencia</Text>
                        <Text style={styles.modalValue}>{selectedServicio.urgencia}</Text>
                      </View>
                      <View style={[styles.modalRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.modalLabel}>Estado</Text>
                        <Text style={styles.modalValue}>{selectedServicio.status}</Text>
                      </View>
                      {!!selectedServicio.descripcion && (
                        <>
                          <Text style={[styles.modalLabel, { marginTop: 10 }]}>Descripción</Text>
                          <Text style={styles.modalDescription} numberOfLines={6}>
                            {selectedServicio.descripcion}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </View>

                {selectedServicio.status === STATUS_EN_ESPERA &&
                  Number.isFinite(Number(selectedServicio.latitude)) &&
                  Number.isFinite(Number(selectedServicio.longitude)) && (
                    <View style={[styles.modalSection, { borderLeftColor: '#059669' }]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => toggleSection('ubicacion')}
                        style={[styles.modalSectionHeader, { backgroundColor: '#059669' }]}>
                        <MaterialCommunityIcons name="map-marker-radius" size={17} color="#FFFFFF" />
                        <Text style={styles.modalSectionTitle}>Ubicación</Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => {
                            setModalVisible(false);
                            setTimeout(() => setNavVisible(true), 180);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 20,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            marginRight: 6,
                          }}>
                          <MaterialCommunityIcons name="navigation" size={14} color="#FFFFFF" />
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                            Navegar
                          </Text>
                        </TouchableOpacity>
                        <MaterialCommunityIcons
                          name={openSections.ubicacion ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="rgba(255,255,255,0.7)"
                        />
                      </TouchableOpacity>
                      {openSections.ubicacion && (
                        <View style={styles.modalSectionCard}>
                          <View style={styles.modalMapWrap}>
                            <WebView
                              style={styles.modalMap}
                              originWhitelist={['*']}
                              source={{
                                html: buildLocationViewerHTML(
                                  Number(selectedServicio.latitude),
                                  Number(selectedServicio.longitude),
                                  false,
                                ),
                              }}
                              javaScriptEnabled
                              scrollEnabled={false}
                              overScrollMode="never"
                              bounces={false}
                            />
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                {/* Sección: Detalles de la propuesta (si existen los 3 campos) */}
                {selectedServicio.precio_estimado != null &&
                  selectedServicio.precio_estimado !== '' &&
                  selectedServicio.tiempo_estimado &&
                  selectedServicio.comentario && (
                    <View style={[styles.modalSection, { borderLeftColor: '#D97706' }]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => toggleSection('propuesta')}
                        style={[styles.modalSectionHeader, { backgroundColor: '#D97706' }]}>
                        <MaterialCommunityIcons name="cash-check" size={17} color="#FFFFFF" />
                        <Text style={styles.modalSectionTitle}>Propuesta del taller</Text>
                        <MaterialCommunityIcons
                          name={openSections.propuesta ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="rgba(255,255,255,0.7)"
                        />
                      </TouchableOpacity>
                      {openSections.propuesta && (
                        <View style={styles.modalSectionCard}>
                          <View style={styles.modalRow}>
                            <Text style={styles.modalLabel}>Precio estimado</Text>
                            <Text style={[styles.modalValue, { color: '#059669' }]}>
                              ${formatPrecioConPuntos(String(selectedServicio.precio_estimado))}
                            </Text>
                          </View>
                          <View style={[styles.modalRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.modalLabel}>Tiempo estimado</Text>
                            <Text style={styles.modalValue}>{selectedServicio.tiempo_estimado}</Text>
                          </View>
                          {!!selectedServicio.comentario && (
                            <>
                              <Text style={[styles.modalLabel, { marginTop: 10 }]}>Comentario</Text>
                              <Text style={styles.modalDescription} numberOfLines={6}>
                                {selectedServicio.comentario}
                              </Text>
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  )}

                {/* Sección: Vehículo */}
                <View style={[styles.modalSection, { borderLeftColor: '#DC2626' }]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleSection('vehiculo')}
                    style={[styles.modalSectionHeader, { backgroundColor: '#DC2626' }]}>
                    <MaterialCommunityIcons name="car-side" size={17} color="#FFFFFF" />
                    <Text style={styles.modalSectionTitle}>Vehículo</Text>
                    <MaterialCommunityIcons
                      name={openSections.vehiculo ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                  {openSections.vehiculo && (
                    <View style={styles.modalSectionCard}>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Vehículo</Text>
                        <Text style={styles.modalValue}>{selectedServicio.vehiculo}</Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Placa</Text>
                        <Text style={styles.modalValue}>
                          {formatVehiculoValue(selectedServicio.vehiculoObj?.vehiculo_placa)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Color</Text>
                        <Text style={styles.modalValue}>
                          {formatVehiculoValue(selectedServicio.vehiculoObj?.vehiculo_color)}
                        </Text>
                      </View>
                      <View style={styles.modalRow}>
                        <Text style={styles.modalLabel}>Kilometraje</Text>
                        <Text style={styles.modalValue}>
                          {formatVehiculoValue(selectedServicio.vehiculoObj?.KM, ' km')}
                        </Text>
                      </View>
                      <View style={[styles.modalRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.modalLabel}>Tipo de vehículo</Text>
                        <Text style={styles.modalValue}>
                          {formatVehiculoValue(selectedServicio.vehiculoObj?.tipo_vehiculo)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {selectedServicio?.status === STATUS_EN_ESPERA && (
              <View style={styles.modalActionsGroup}>
                <Text style={styles.modalActionsTitle}>Acciones</Text>
                <View style={styles.modalActionsInner}>
                  <TouchableOpacity
                    style={styles.modalBtnPrimary}
                    activeOpacity={0.9}
                    onPress={openCotizacionModal}>
                    <Text style={styles.modalBtnPrimaryText}>Enviar cotización</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnSecondary}
                    activeOpacity={0.85}
                    onPress={openConfirmInspeccion}>
                    <Text style={styles.modalBtnSecondaryText}>Solicitar inspección previa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnSecondary}
                    activeOpacity={0.85}
                    onPress={openConfirmRechazar}>
                    <Text style={styles.modalBtnSecondaryText}>Rechazar solicitud</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.modalCloseLink}
              activeOpacity={0.8}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Enviar cotización */}
      <Modal
        visible={cotizacionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCotizacionModal}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.cotizacionOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.cotizacionKeyboard}>
              <View style={styles.cotizacionCard}>
              <View style={styles.cotizacionHeader}>
                <View style={styles.cotizacionIconWrap}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={28}
                    color={appColors.primary}
                  />
                </View>
                <Text style={styles.cotizacionTitle}>Enviar cotización</Text>
                <Text style={styles.cotizacionSubtitle}>
                  Completa los datos para enviar tu cotización al cliente.
                </Text>
              </View>

              <View style={styles.cotizacionForm}>
                <Text style={styles.cotizacionLabel}>
                  Precio estimado <Text style={styles.cotizacionRequired}>*</Text>
                </Text>
                <View style={styles.cotizacionPrecioWrap}>
                  <Text style={styles.cotizacionDolar}>$</Text>
                  <TextInput
                    style={styles.cotizacionPrecioInput}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={precioEstimado}
                    onChangeText={handlePrecioChange}
                    keyboardType="decimal-pad"
                  />
                </View>

                <Text style={styles.cotizacionLabel}>
                  Tiempo estimado <Text style={styles.cotizacionRequired}>*</Text>
                </Text>
                <View style={styles.cotizacionTiempoRow}>
                  {TIEMPO_OPCIONES.map(op => {
                    const selected = tiempoEstimado === op.value;
                    return (
                      <TouchableOpacity
                        key={op.value}
                        style={[
                          styles.cotizacionTiempoChip,
                          selected && styles.cotizacionTiempoChipSelected,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setTiempoEstimado(op.value)}>
                        <Text
                          style={[
                            styles.cotizacionTiempoChipText,
                            selected && styles.cotizacionTiempoChipTextSelected,
                          ]}>
                          {op.value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {tiempoEstimado === 'Otro' && (
                  <TextInput
                    style={styles.cotizacionInput}
                    placeholder="Ej: 1 semana, 3-4 días..."
                    placeholderTextColor="#9CA3AF"
                    value={tiempoEstimadoOtro}
                    onChangeText={setTiempoEstimadoOtro}
                    autoFocus
                  />
                )}

                <Text style={styles.cotizacionLabel}>Comentario (opcional)</Text>
                <TextInput
                  style={[styles.cotizacionInput, styles.cotizacionInputArea]}
                  placeholder="Agrega un comentario si lo deseas..."
                  placeholderTextColor="#9CA3AF"
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.cotizacionEnviarBtn}
                activeOpacity={0.9}
                onPress={handleEnviarCotizacion}
                disabled={loadingCotizacion}>
                {loadingCotizacion ? (
                  <ActivityIndicator size="small" color={appColors.primary} />
                ) : (
                  <Text style={styles.cotizacionEnviarBtnText}>Enviar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeCotizacionModal}
                disabled={loadingCotizacion}
                style={styles.cotizacionCancelLink}
                activeOpacity={0.8}>
                <Text style={styles.cotizacionCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal confirmación: solicitar inspección previa */}
      <Modal
        visible={confirmInspeccionVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmInspeccionModal}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.confirmOverlay}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={Keyboard.dismiss}
              accessibilityLabel="Ocultar teclado"
              accessibilityRole="button"
            />
            <View style={[styles.confirmCard, styles.confirmCardInspeccion]}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                  <Text style={styles.confirmTitle}>Solicitar inspección previa</Text>
                  <Text style={styles.confirmMessage}>
                    Indica el motivo por el que necesitas una inspección previa en esta solicitud.
                  </Text>
                  <Text style={styles.confirmTextAreaLabel}>
                    Motivo <Text style={styles.confirmRequiredMark}>*</Text>
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <TextInput
                style={styles.confirmTextArea}
                value={inspeccionMotivo}
                onChangeText={setInspeccionMotivo}
                placeholder="Ej.: Revisar daños no visibles en fotos, comprobar estado real del vehículo…"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={800}
                editable={!loadingInspeccion}
                textAlignVertical="top"
              />
              <View style={styles.confirmButtonsRow}>
                <TouchableOpacity
                  style={styles.confirmBtnCancel}
                  onPress={closeConfirmInspeccionModal}
                  disabled={loadingInspeccion}
                  activeOpacity={0.85}>
                  <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtnOk,
                    inspeccionMotivo.trim().length === 0 || loadingInspeccion
                      ? styles.confirmBtnOkDisabled
                      : null,
                  ]}
                  onPress={handleConfirmInspeccion}
                  disabled={
                    loadingInspeccion || inspeccionMotivo.trim().length === 0
                  }
                  activeOpacity={0.9}>
                  {loadingInspeccion ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmBtnOkText}>Sí, solicitar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal confirmación: rechazar solicitud */}
      <Modal
        visible={confirmRechazarVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmRechazarModal}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Rechazar solicitud</Text>
            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.confirmBtnCancel}
                onPress={closeConfirmRechazarModal}
                disabled={loadingRechazar}
                activeOpacity={0.85}>
                <Text style={styles.confirmBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtnOk, styles.confirmBtnOkRechazar]}
                onPress={handleConfirmRechazar}
                disabled={loadingRechazar}
                activeOpacity={0.9}>
                {loadingRechazar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnOkText}>Sí, rechazar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MapboxNavigation
        visible={navVisible}
        destinationLat={selectedServicio?.latitude}
        destinationLng={selectedServicio?.longitude}
        destinationName={selectedServicio?.nombreSolicitud || selectedServicio?.cliente || 'Ubicación de la solicitud'}
        onClose={() => {
          setNavVisible(false);
          setTimeout(() => {
            if (selectedServicio) {
              setModalVisible(true);
            }
          }, 180);
        }}
      />

      {/* Modal imagen fullscreen */}
      <Modal
        visible={fullImageVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullImage}>
        <View style={styles.fullImageOverlay}>
          <TouchableWithoutFeedback onPress={closeFullImage}>
            <View style={styles.fullImageTouchArea}>
              {fullImageUrl ? (
                <Image
                  source={{ uri: fullImageUrl }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={styles.fullImageCloseBtn}
            onPress={closeFullImage}
            activeOpacity={0.9}>
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTextBlock: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: appColors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: appColors.subtitle,
  },
  headerRefreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRefreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: appColors.subtitle,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    paddingRight: 20,
  },
  filterChip: {
    flexShrink: 0,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FFD60A',
    borderColor: '#FFD60A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: appColors.subtitle,
  },
  filterChipLabelActive: {
    color: appColors.primary,
  },
  pendingAccountWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  pendingAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  pendingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  pendingAccountTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: appColors.primary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  pendingAccountText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  pendingAccountHint: {
    fontSize: 13,
    color: appColors.subtitle,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  loadingContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingState: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: appColors.subtitle,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: appColors.primary,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appColors.primary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: appColors.subtitle,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD60A',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitleColumn: {
    flex: 1,
    marginRight: 8,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 24,
  },
  distanceChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    marginLeft: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2933',
  },
  cardCliente: {
    marginTop: 2,
    fontSize: 12,
    color: appColors.subtitle,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: appColors.subtitle,
  },
  vehicleText: {
    fontSize: 13,
    color: '#111827',
  },
  statusChip: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 24,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  badgeUrgencia: urgencia => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor:
      urgencia === 'Emergencia'
        ? '#FEE2E2'
        : urgencia === 'Urgente'
        ? '#FFEDD5'
        : '#E0F2FE',
  }),
  badgeUrgenciaText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalCardLarge: {
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: appColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalScroll: {
    width: '100%',
    maxHeight: 320,
  },
  modalScrollLarge: {
    width: '100%',
    maxHeight: 520,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalImagesSection: {
    marginBottom: 16,
  },
  modalImagesRow: {
    paddingVertical: 4,
  },
  modalImageThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  modalSection: {
    width: '100%',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#1F2344',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  modalMapFullscreenBtn: {
    marginLeft: 'auto',
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    flex: 1,
  },
  modalSectionCard: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalServiceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  modalMapWrap: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalMap: {
    width: '100%',
    height: '100%',
  },
  modalActionsGroup: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#F5F6F8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: appColors.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalActionsInner: {
    width: '100%',
  },
  modalBtnPrimary: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: appColors.primary,
  },
  modalBtnSecondary: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  modalCloseLink: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '600',
    color: appColors.subtitle,
    textDecorationLine: 'underline',
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapFullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapFullScreenMap: {
    width: '100%',
    height: '100%',
  },
  mapFullScreenFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 36 : 20,
  },
  mapFullScreenFooterBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFullScreenFooterBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2344',
  },
  mapFullScreenCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(31,35,68,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageTouchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  fullImageCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cotizacionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cotizacionKeyboard: {
    width: '100%',
    maxWidth: 400,
  },
  cotizacionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  cotizacionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cotizacionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cotizacionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: appColors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  cotizacionSubtitle: {
    fontSize: 14,
    color: appColors.subtitle,
    textAlign: 'center',
    lineHeight: 20,
  },
  cotizacionForm: {
    width: '100%',
    marginBottom: 20,
  },
  cotizacionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  cotizacionRequired: {
    color: '#DC2626',
  },
  cotizacionPrecioWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    paddingLeft: 14,
  },
  cotizacionDolar: {
    fontSize: 18,
    fontWeight: '700',
    color: appColors.primary,
    marginRight: 6,
  },
  cotizacionPrecioInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    fontSize: 16,
    color: '#111827',
  },
  cotizacionTiempoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    marginHorizontal: -4,
  },
  cotizacionTiempoChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  cotizacionTiempoChipSelected: {
    backgroundColor: '#FFF8E6',
    borderColor: '#FFD60A',
  },
  cotizacionTiempoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  cotizacionTiempoChipTextSelected: {
    color: appColors.primary,
  },
  cotizacionInput: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  cotizacionInputArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cotizacionEnviarBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
  },
  cotizacionEnviarBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.primary,
  },
  cotizacionCancelLink: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cotizacionCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: appColors.subtitle,
    textDecorationLine: 'underline',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmCardInspeccion: {
    maxWidth: 380,
    alignItems: 'stretch',
  },
  confirmTextAreaLabel: {
    alignSelf: 'stretch',
    fontSize: 13,
    fontWeight: '700',
    color: appColors.primary,
    marginBottom: 8,
  },
  confirmRequiredMark: {
    color: '#DC2626',
  },
  confirmTextArea: {
    alignSelf: 'stretch',
    minHeight: 100,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: appColors.titleText,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  confirmBtnOkDisabled: {
    opacity: 0.45,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: appColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: appColors.subtitle,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  confirmBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  confirmBtnOk: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    minWidth: 44,
  },
  confirmBtnOkRechazar: {
    backgroundColor: '#DC2626',
  },
  confirmBtnOkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SolicitudesTallerScreen;

