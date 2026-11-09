// Solicitud de servicio del conductor (Fase 1 de la mejora de experiencia).
//
// Tres pasos cortos en vez de una pantalla larga:
//   1. Tu carro y qué necesita (vehículo, categoría, descripción, fotos)
//   2. Dónde y qué tan urgente
//   3. Revisar y enviar
// Después, una pantalla que explica qué pasa ahora y lleva a seguir la solicitud.
//
// Se abre desde la pestaña Emergencia, desde un servicio o desde un taller.
// Parámetros opcionales: vehicle, uid_taller, nombre_taller, categoriaId,
// nombre_servicio (llegan desde el servicio o el taller para no repetir datos).
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Image,
  Modal,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Car,
  Camera,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Send,
  X,
  CheckCircle2,
  ClipboardList,
  Bell,
  HandCoins,
} from 'lucide-react-native';
import {
  AppText,
  Banner,
  BottomSheet,
  Button,
  Card,
  colors,
  space,
  radius,
  fonts,
  shadow,
  TOUCH,
} from '../../ui';
import styles from './style.css';
import api from '../../../axiosInstance';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ';

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

/** Primera letra en mayúscula, resto en minúsculas (por etiqueta de categoría). */
const sentenceCase = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};


/** "Cambio de aceite y filtro. Además…" → "Cambio de aceite y filtro" (máx. 50). */
const tituloDesdeDescripcion = texto => {
  const t = String(texto || '').trim().replace(/\s+/g, ' ');
  // Sin lookbehind: el motor JS de algunos Android no lo soporta.
  const primera = (t.split(/[.!?]\s/)[0] || t).trim();
  if (primera.length <= 50) return primera.replace(/[.\s]+$/, '');
  const corte = primera.slice(0, 50);
  return `${corte.slice(0, corte.lastIndexOf(' ') > 20 ? corte.lastIndexOf(' ') : 50)}…`;
};


const URGENCIAS = [
  { value: 'Normal', label: 'Normal', ayuda: 'Puedo esperar unos días' },
  { value: 'Urgente', label: 'Urgente', ayuda: 'Lo necesito lo antes posible' },
  { value: 'Emergencia', label: 'Emergencia', ayuda: 'El carro no anda o me dejó accidentado' },
];

const PASOS = [
  { titulo: '¿Qué necesita tu carro?', corto: 'El problema' },
  { titulo: '¿Dónde y qué tan urgente?', corto: 'Ubicación' },
  { titulo: 'Revisa y envía', corto: 'Enviar' },
];

const nombreVehiculo = v =>
  [v?.vehiculo_marca, v?.vehiculo_modelo].filter(Boolean).join(' ') || 'Vehículo';
const detalleVehiculo = v =>
  [v?.vehiculo_anio, v?.vehiculo_placa || v?.placa, v?.KM ? `${v.KM} km` : '']
    .map(x => String(x || '').trim())
    .filter(Boolean)
    .join(' · ');

const leerUsuario = async () => {
  try {
    const json = await AsyncStorage.getItem('@userInfo');
    return json ? JSON.parse(json) : null;
  } catch (_) {
    return null;
  }
};

/** Barra de progreso de 3 tramos con el nombre del paso. */
const Progreso = ({ paso }) => (
  <View style={s.progreso} accessibilityLabel={`Paso ${paso} de ${PASOS.length}`}>
    <View style={s.progresoBarras}>
      {PASOS.map((_, i) => (
        <View key={i} style={[s.progresoTramo, i < paso && s.progresoTramoOn]} />
      ))}
    </View>
    <AppText variant="caption" color={colors.onNavyMuted}>
      Paso {paso} de {PASOS.length} · {PASOS[paso - 1].corto}
    </AppText>
  </View>
);

/** Fila del resumen del paso 3, con acceso directo para corregir. */
const FilaResumen = ({ etiqueta, valor, onEditar, ultima }) => (
  <View style={[s.filaResumen, ultima && { borderBottomWidth: 0 }]}>
    <View style={{ flex: 1 }}>
      <AppText variant="caption" color={colors.muted}>
        {etiqueta}
      </AppText>
      <AppText variant="body" numberOfLines={3}>
        {valor}
      </AppText>
    </View>
    {onEditar ? (
      <Pressable
        onPress={onEditar}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Cambiar ${etiqueta.toLowerCase()}`}
        style={s.editar}>
        <Pencil size={16} color={colors.navy} strokeWidth={2.2} />
        <AppText variant="caption">Cambiar</AppText>
      </Pressable>
    ) : null}
  </View>
);

const SolicitudServicio = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};
  const uid_taller = String(params.uid_taller || '').trim() || null;
  const nombreTaller = String(params.nombre_taller || '').trim();
  const nombreServicio = String(params.nombre_servicio || '').trim();

  const [paso, setPaso] = useState(1);
  const [intento, setIntento] = useState(0); // para mostrar qué falta al tocar Continuar

  // Paso 1
  const [vehiculos, setVehiculos] = useState(params.vehicle ? [params.vehicle] : []);
  const [vehicle, setVehicle] = useState(params.vehicle || null);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(!params.vehicle);
  const [errorVehiculos, setErrorVehiculos] = useState('');
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriaId, setCategoriaId] = useState(String(params.categoriaId || ''));
  const [descripcion, setDescripcion] = useState(nombreServicio ? `${nombreServicio}. ` : '');
  const [fotos, setFotos] = useState([]);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // Paso 2
  const [urgencia, setUrgencia] = useState('Normal');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const locationWebViewRef = useRef(null);
  const [mapSelection, setMapSelection] = useState({ latitude: 10.4806, longitude: -66.9036 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(true);
  const [locationManuallyModified, setLocationManuallyModified] = useState(false);

  // Envío
  const [sending, setSending] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviada, setEnviada] = useState(false);

  const descripcionLength = (descripcion || '').trim().length;
  const descripcionValid = descripcionLength >= MIN_DESCRIPCION && descripcionLength <= MAX_DESCRIPCION;

  // ── Datos ────────────────────────────────────────────────────────────────
  const cargarVehiculos = useCallback(async () => {
    try {
      setCargandoVehiculos(true);
      setErrorVehiculos('');
      const user = await leerUsuario();
      const uid = user?.uid ?? user?.id ?? '';
      if (!uid) {
        setErrorVehiculos('No encontramos tu sesión. Vuelve a iniciar sesión.');
        return;
      }
      const response = await api.post('usuarios/getVehiculosByUsuarioUid', { uid });
      const data = response?.data;
      const lista = Array.isArray(data) ? data : data?.data ?? [];
      setVehiculos(lista);
      setVehicle(actual => {
        if (actual && lista.some(v => v.id === actual.id)) return actual;
        return lista.find(v => v.por_defecto === true) || lista[0] || null;
      });
    } catch (err) {
      setErrorVehiculos('No pudimos cargar tus vehículos. Revisa tu conexión.');
    } finally {
      setCargandoVehiculos(false);
    }
  }, []);

  // Al volver de "Mis vehículos" (por ejemplo, tras agregar uno) se recarga la lista.
  useFocusEffect(
    useCallback(() => {
      cargarVehiculos();
    }, [cargarVehiculos]),
  );

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: { 'Content-Type': 'application/json' },
      });
      const list = response?.data?.categories ?? [];
      setCategoriaOptions(
        list.filter(c => c.id && c.nombre).map(c => ({ label: sentenceCase(c.nombre), value: c.id })),
      );
    } catch (err) {
      setCategoriaOptions([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const tomarUbicacionActual = useCallback(async () => {
    setBuscandoUbicacion(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setBuscandoUbicacion(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          const current = {
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          };
          setMapSelection(current);
          setSelectedLocation(prev => prev || current);
          setBuscandoUbicacion(false);
        },
        () => setBuscandoUbicacion(false),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
      );
    } catch (_) {
      setBuscandoUbicacion(false);
    }
  }, []);

  useEffect(() => {
    tomarUbicacionActual();
  }, [tomarUbicacionActual]);

  // ── Navegación entre pasos ──────────────────────────────────────────────
  const faltaEnPaso = n => {
    if (n === 1) {
      if (!vehicle) return 'Elige el vehículo (o agrega uno).';
      if (!categoriaId) return 'Elige qué tipo de servicio necesitas.';
      if (descripcionLength < MIN_DESCRIPCION)
        return `Cuéntanos un poco más del problema (mínimo ${MIN_DESCRIPCION} letras).`;
      return '';
    }
    if (n === 2) {
      if (!selectedLocation) return 'Marca en el mapa dónde está el carro.';
      return '';
    }
    return '';
  };

  const scrollRef = useRef(null);
  const irAPaso = n => {
    setIntento(0);
    setErrorEnvio('');
    setPaso(n);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  };

  const continuar = () => {
    if (faltaEnPaso(paso)) {
      setIntento(i => i + 1);
      return;
    }
    irAPaso(paso + 1);
  };

  const atras = useCallback(() => {
    if (paso > 1) {
      irAPaso(paso - 1);
      return true;
    }
    navigation.goBack();
    return true;
  }, [paso, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (enviada) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', atras);
      return () => sub.remove();
    }, [atras, enviada]),
  );

  // ── Fotos ───────────────────────────────────────────────────────────────
  const agregarFotos = assets => {
    const nuevas = (assets || []).filter(a => a?.uri).map(a => ({ uri: a.uri, base64: a.base64 || '' }));
    if (nuevas.length) setFotos(prev => [...prev, ...nuevas].slice(0, 5));
  };

  const handlePickGallery = () => {
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary(
        { mediaType: 'photo', includeBase64: true, selectionLimit: 5 - fotos.length, quality: 0.4, maxWidth: 1024, maxHeight: 1024 },
        response => {
          if (response.didCancel || response.errorCode) return;
          agregarFotos(response.assets);
        },
      );
    }, 400);
  };

  const handlePickCamera = () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera(
        { mediaType: 'photo', includeBase64: true, quality: 0.4, maxWidth: 1024, maxHeight: 1024 },
        response => {
          if (response.didCancel || response.errorCode) return;
          agregarFotos(response.assets);
        },
      );
    }, 400);
  };

  const removePhoto = index => setFotos(prev => prev.filter((_, i) => i !== index));

  // ── Mapa ────────────────────────────────────────────────────────────────
  const handleLocationMessage = event => {
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
            locationWebViewRef.current?.injectJavaScript(
              `window.flyToLocation(${pos.coords.latitude}, ${pos.coords.longitude}); true;`,
            );
          },
          () => {
            locationWebViewRef.current?.injectJavaScript(
              `var b=document.getElementById('locate-btn');if(b)b.classList.remove('loading'); true;`,
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
        );
      }
    } catch (_) {}
  };

  // ── Envío ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const falta = faltaEnPaso(1) || faltaEnPaso(2);
    if (falta) {
      setErrorEnvio(falta);
      return;
    }
    setSending(true);
    setErrorEnvio('');
    try {
      const user = await leerUsuario();
      const payload = {
        nombre_usuario: String(user?.nombre || user?.name || '').trim(),
        uid_usuario: String(user?.uid ?? user?.id ?? '').trim(),
        phone_usuario: String(user?.phone || user?.telefono || '').trim(),
        // Req. 006: un solo campo. El título sale del comienzo de la descripción.
        nombreSolicitud: tituloDesdeDescripcion(descripcion),
        vehiculo: vehicle || null,
        categoriaId,
        descripcion: (descripcion || '').trim(),
        urgencia,
        latitude: selectedLocation?.latitude ?? null,
        longitude: selectedLocation?.longitude ?? null,
        fotos: (fotos || []).map(f => f.base64).filter(Boolean),
        ...(uid_taller ? { uid_taller } : {}),
      };
      await api.post('usuarios/saveSolicitud', payload);
      setEnviada(true);
    } catch (err) {
      setErrorEnvio(
        err?.response?.data?.message || 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setSending(false);
    }
  };

  const irAlInicio = () => navigation.reset({ index: 0, routes: [{ name: 'DrawerScreen' }] });
  const verMiSolicitud = () => {
    navigation.reset({ index: 0, routes: [{ name: 'DrawerScreen' }] });
    setTimeout(() => navigation.navigate('DrawerScreen', { screen: 'MisSolicitudes' }), 150);
  };

  const categoryLabel = categoriaOptions.find(c => c.value === categoriaId)?.label || '';
  const destino = uid_taller
    ? nombreTaller || 'el taller que elegiste'
    : categoryLabel
    ? `los talleres de ${categoryLabel.toLowerCase()} cerca de ti`
    : 'los talleres cerca de ti';
  const falta = intento > 0 ? faltaEnPaso(paso) : '';

  // ── Pantalla final ──────────────────────────────────────────────────────
  if (enviada) {
    const pasosSiguientes = [
      {
        icon: Bell,
        texto: uid_taller
          ? `${nombreTaller || 'El taller'} recibe tu solicitud ahora mismo.`
          : 'Los talleres cerca de ti reciben tu solicitud ahora mismo.',
      },
      { icon: HandCoins, texto: 'Te mandan su propuesta con precio y fecha. Te avisamos con una notificación.' },
      { icon: ClipboardList, texto: 'Comparas las propuestas en "Mis solicitudes" y aceptas la que prefieras.' },
    ];
    return (
      <View style={[s.pantalla, { backgroundColor: colors.card }]}>
        <ScrollView contentContainerStyle={s.finalContenido}>
          <View style={s.finalIcono}>
            <CheckCircle2 size={56} color={colors.ok} strokeWidth={2} />
          </View>
          <AppText variant="display" style={s.centro} accessibilityRole="header">
            ¡Solicitud enviada!
          </AppText>
          <AppText variant="body" color={colors.muted} style={[s.centro, { marginTop: space.s }]}>
            La enviamos a {destino}.
          </AppText>

          <AppText variant="subtitle" style={{ marginTop: space.xl, marginBottom: space.m }}>
            ¿Qué pasa ahora?
          </AppText>
          {pasosSiguientes.map(({ icon: Icon, texto }, i) => (
            <View key={i} style={s.siguiente}>
              <View style={s.siguienteIcono}>
                <Icon size={20} color={colors.navy} strokeWidth={2.2} />
              </View>
              <AppText variant="body" style={{ flex: 1 }}>
                {texto}
              </AppText>
            </View>
          ))}
        </ScrollView>
        <View style={s.pie}>
          <Button title="Ver mi solicitud" variant="accent" onPress={verMiSolicitud} />
          <Button title="Ir al inicio" variant="ghost" onPress={irAlInicio} style={{ marginTop: space.s }} />
        </View>
      </View>
    );
  }

  // ── Pasos ───────────────────────────────────────────────────────────────
  const paso1 = (
    <>
      {nombreServicio || nombreTaller ? (
        <Card style={s.contexto}>
          <AppText variant="caption" color={colors.muted}>
            {uid_taller ? 'Le pides a' : 'Servicio'}
          </AppText>
          <AppText variant="subtitle" numberOfLines={2}>
            {[nombreServicio, uid_taller ? nombreTaller : ''].filter(Boolean).join(' · ')}
          </AppText>
        </Card>
      ) : null}

      <AppText variant="subtitle" style={[s.etiqueta, !(nombreServicio || nombreTaller) && { marginTop: 0 }]}>
        Tu vehículo
      </AppText>
      {cargandoVehiculos && !vehiculos.length ? (
        <View style={s.cargando}>
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : errorVehiculos && !vehiculos.length ? (
        <Banner text={errorVehiculos} actionLabel="Reintentar" onAction={cargarVehiculos} />
      ) : !vehiculos.length ? (
        <Card style={[s.sinVehiculo, falta && !vehicle && s.campoError, { borderWidth: 1.5, borderColor: falta && !vehicle ? colors.error : 'transparent' }]} onPress={() => navigation.navigate('VehiclesScreen')} accessibilityLabel="Agregar vehículo">
          <View style={s.vehiculoIcono}>
            <Plus size={22} color={colors.navy} strokeWidth={2.4} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle">Agrega tu vehículo</AppText>
            <AppText variant="caption" color={colors.muted}>
              Lo necesitamos para que el taller sepa qué carro va a atender.
            </AppText>
          </View>
        </Card>
      ) : (
        <View style={{ gap: space.s }}>
          {vehiculos.map(v => {
            const on = vehicle?.id === v.id;
            return (
              <Pressable
                key={v.id || nombreVehiculo(v)}
                onPress={() => setVehicle(v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[s.opcion, on && s.opcionOn]}>
                <View style={[s.vehiculoIcono, on && { backgroundColor: colors.yellow }]}>
                  <Car size={22} color={colors.navy} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" numberOfLines={1}>
                    {nombreVehiculo(v)}
                  </AppText>
                  {detalleVehiculo(v) ? (
                    <AppText variant="caption" color={colors.muted} numberOfLines={1}>
                      {detalleVehiculo(v)}
                    </AppText>
                  ) : null}
                </View>
                <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioPunto} /> : null}</View>
              </Pressable>
            );
          })}
        </View>
      )}

      <AppText variant="subtitle" style={s.etiqueta}>
        Tipo de servicio
      </AppText>
      {loadingCategories ? (
        <View style={s.cargando}>
          <ActivityIndicator color={colors.navy} />
        </View>
      ) : (
        <Dropdown
          data={categoriaOptions}
          labelField="label"
          valueField="value"
          placeholder="Elige una categoría"
          searchPlaceholder="Buscar…"
          value={categoriaId}
          onChange={item => setCategoriaId(item?.value ?? '')}
          style={[s.campo, falta && !categoriaId && s.campoError]}
          placeholderStyle={s.campoPlaceholder}
          selectedTextStyle={s.campoTexto}
          itemTextStyle={s.campoTexto}
          inputSearchStyle={s.campoTexto}
          search={categoriaOptions.length > 8}
        />
      )}

      <AppText variant="subtitle" style={s.etiqueta}>
        ¿Qué le pasa o qué necesitas?
      </AppText>
      <TextInput
        style={[s.campo, s.campoMultilinea, falta && !descripcionValid && s.campoError]}
        value={descripcion}
        onChangeText={t => setDescripcion(t && t.length > MAX_DESCRIPCION ? t.slice(0, MAX_DESCRIPCION) : t)}
        placeholder="Ej: suenan los frenos al detenerme, o: cambio de aceite y filtro"
        placeholderTextColor={colors.placeholder}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Describe el problema"
      />
      <AppText
        variant="caption"
        color={descripcionLength > 0 && descripcionLength < MIN_DESCRIPCION ? colors.warn : colors.muted}
        style={{ marginTop: space.xs }}>
        {descripcionLength < MIN_DESCRIPCION
          ? `Mínimo ${MIN_DESCRIPCION} letras · te faltan ${MIN_DESCRIPCION - descripcionLength}`
          : `${descripcionLength} de ${MAX_DESCRIPCION}`}
      </AppText>

      <AppText variant="subtitle" style={s.etiqueta}>
        Fotos <AppText variant="caption" color={colors.muted}>(opcional, hasta 5)</AppText>
      </AppText>
      <AppText variant="caption" color={colors.muted} style={{ marginBottom: space.s }}>
        Una foto del problema ayuda al taller a darte un precio más exacto.
      </AppText>
      <View style={s.fotos}>
        {fotos.map((foto, index) => (
          <View key={`${foto.uri}-${index}`}>
            <Image source={{ uri: foto.uri }} style={s.foto} resizeMode="cover" />
            <Pressable
              style={s.fotoQuitar}
              onPress={() => removePhoto(index)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Quitar foto ${index + 1}`}>
              <X size={14} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>
        ))}
        {fotos.length < 5 ? (
          <Pressable
            style={s.fotoAgregar}
            onPress={() => setPhotoModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Agregar foto">
            <Camera size={24} color={colors.navy} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </>
  );

  const paso2 = (
    <>
      <AppText variant="subtitle" style={[s.etiqueta, { marginTop: 0 }]}>
        ¿Dónde está el carro?
      </AppText>
      <Card style={[s.ubicacion, falta && !selectedLocation && s.campoError]}>
        <View style={[s.vehiculoIcono, selectedLocation && { backgroundColor: colors.okBg }]}>
          {buscandoUbicacion && !selectedLocation ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <MapPin size={22} color={selectedLocation ? colors.ok : colors.navy} strokeWidth={2.2} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="subtitle">
            {selectedLocation
              ? locationManuallyModified
                ? 'Ubicación marcada en el mapa'
                : 'Usaremos tu ubicación actual'
              : buscandoUbicacion
              ? 'Buscando tu ubicación…'
              : 'Falta la ubicación'}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {selectedLocation
              ? 'Así los talleres saben qué tan lejos estás.'
              : 'Márcala en el mapa para que te lleguen talleres cercanos.'}
          </AppText>
        </View>
      </Card>
      <Button
        title={selectedLocation ? 'Ajustar en el mapa' : 'Marcar en el mapa'}
        variant="secondary"
        size="m"
        icon={MapPin}
        onPress={() => setLocationModalVisible(true)}
        style={{ marginTop: space.s }}
      />

      <AppText variant="subtitle" style={s.etiqueta}>
        ¿Qué tan urgente es?
      </AppText>
      <View style={{ gap: space.s }}>
        {URGENCIAS.map(op => {
          const on = urgencia === op.value;
          const tono = op.value === 'Emergencia' ? colors.error : op.value === 'Urgente' ? colors.warn : colors.navy;
          return (
            <Pressable
              key={op.value}
              onPress={() => setUrgencia(op.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[s.opcion, on && s.opcionOn, on && { borderColor: tono }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" color={on ? tono : colors.text}>
                  {op.label}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {op.ayuda}
                </AppText>
              </View>
              <View style={[s.radio, on && { borderColor: tono }]}>
                {on ? <View style={[s.radioPunto, { backgroundColor: tono }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const paso3 = (
    <>
      <Card style={s.destino}>
        <Send size={20} color={colors.navy} strokeWidth={2.2} />
        <AppText variant="body" style={{ flex: 1 }}>
          Se enviará a <AppText variant="subtitle">{destino}</AppText>.
        </AppText>
      </Card>
      <Card style={{ paddingVertical: space.xs }}>
        <FilaResumen
          etiqueta="Vehículo"
          valor={[nombreVehiculo(vehicle), detalleVehiculo(vehicle)].filter(Boolean).join(' · ')}
          onEditar={() => irAPaso(1)}
        />
        <FilaResumen etiqueta="Tipo de servicio" valor={categoryLabel || '—'} onEditar={() => irAPaso(1)} />
        <FilaResumen etiqueta="Qué necesitas" valor={(descripcion || '').trim()} onEditar={() => irAPaso(1)} />
        <FilaResumen
          etiqueta="Fotos"
          valor={fotos.length ? `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}` : 'Sin fotos'}
          onEditar={() => irAPaso(1)}
        />
        <FilaResumen
          etiqueta="Ubicación"
          valor={locationManuallyModified ? 'Marcada en el mapa' : 'Tu ubicación actual'}
          onEditar={() => irAPaso(2)}
        />
        <FilaResumen etiqueta="Urgencia" valor={urgencia} onEditar={() => irAPaso(2)} ultima />
      </Card>
    </>
  );

  return (
    <View style={s.pantalla}>
      <View style={s.cabecera}>
        <View style={s.cabeceraFila}>
          <Pressable
            onPress={atras}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={paso > 1 ? 'Paso anterior' : 'Volver'}
            style={s.atras}>
            <ArrowLeft size={24} color={colors.onNavy} strokeWidth={2.2} />
          </Pressable>
          <AppText variant="title" color={colors.onNavy} style={{ flex: 1 }} accessibilityRole="header">
            {PASOS[paso - 1].titulo}
          </AppText>
        </View>
        <Progreso paso={paso} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.contenido}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {paso === 1 ? paso1 : paso === 2 ? paso2 : paso3}
        </ScrollView>

        <View style={s.pie}>
          {falta || errorEnvio ? (
            <AppText variant="caption" color={colors.error} style={s.falta} accessibilityLiveRegion="polite">
              {falta || errorEnvio}
            </AppText>
          ) : null}
          {paso < PASOS.length ? (
            <Button title="Continuar" variant="accent" onPress={continuar} />
          ) : (
            <Button title="Enviar solicitud" variant="accent" icon={Send} loading={sending} onPress={handleSubmit} />
          )}
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={photoModalVisible} onClose={() => setPhotoModalVisible(false)} title="Agregar foto">
        <View style={s.hojaFila}>
          <Pressable style={s.hojaOpcion} onPress={handlePickCamera} accessibilityRole="button">
            <Camera size={28} color={colors.navy} strokeWidth={2} />
            <AppText variant="subtitle">Tomar foto</AppText>
          </Pressable>
          <Pressable style={s.hojaOpcion} onPress={handlePickGallery} accessibilityRole="button">
            <ImageIcon size={28} color={colors.navy} strokeWidth={2} />
            <AppText variant="subtitle">Galería</AppText>
          </Pressable>
        </View>
      </BottomSheet>

      <Modal
        visible={locationModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#1D1E56' }}>
          <View style={styles.mapFullScreenHeader}>
            <Pressable
              onPress={() => setLocationModalVisible(false)}
              style={styles.mapSheetCloseBtn}
              accessibilityRole="button"
              accessibilityLabel="Cerrar mapa">
              <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
            </Pressable>
            <AppText variant="subtitle" color={colors.onNavy}>
              ¿Dónde está el carro?
            </AppText>
            <View style={{ width: 36 }} />
          </View>
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
    </View>
  );
};

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  centro: { textAlign: 'center' },
  cabecera: {
    backgroundColor: colors.navy,
    paddingTop: space.s,
    paddingHorizontal: space.m,
    paddingBottom: space.m,
  },
  cabeceraFila: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  atras: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center', marginLeft: -space.s },
  progreso: { marginTop: space.m, gap: space.s },
  progresoBarras: { flexDirection: 'row', gap: space.xs },
  progresoTramo: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  progresoTramoOn: { backgroundColor: colors.yellow },
  contenido: { padding: space.m, paddingBottom: space.xl },
  etiqueta: { marginTop: space.l, marginBottom: space.s },
  cargando: { paddingVertical: space.m, alignItems: 'center' },
  contexto: { gap: 2 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    minHeight: 64,
    padding: space.m,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  opcionOn: { borderColor: colors.navy, backgroundColor: '#F7F8FF' },
  vehiculoIcono: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.navy },
  radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.navy },
  sinVehiculo: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  campo: {
    minHeight: 52,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: space.m,
  },
  campoMultilinea: {
    minHeight: 110,
    paddingTop: space.m,
    paddingBottom: space.m,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  campoError: { borderColor: colors.error },
  campoPlaceholder: { fontFamily: fonts.regular, fontSize: 15, color: colors.placeholder },
  campoTexto: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  fotos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  foto: { width: 76, height: 76, borderRadius: radius.s, backgroundColor: colors.skeleton },
  fotoQuitar: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoAgregar: {
    width: 76,
    height: 76,
    borderRadius: radius.s,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  ubicacion: { flexDirection: 'row', alignItems: 'center', gap: space.m, borderWidth: 1.5, borderColor: 'transparent' },
  destino: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.m, backgroundColor: colors.infoBg },
  filaResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingVertical: space.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  editar: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: TOUCH, paddingLeft: space.s },
  pie: {
    paddingHorizontal: space.m,
    paddingTop: space.m,
    paddingBottom: Platform.OS === 'ios' ? space.l : space.m,
    backgroundColor: colors.card,
    ...shadow.bar,
  },
  falta: { marginBottom: space.s, textAlign: 'center' },
  hojaFila: { flexDirection: 'row', gap: space.m, paddingBottom: space.l },
  hojaOpcion: {
    flex: 1,
    alignItems: 'center',
    gap: space.s,
    paddingVertical: space.l,
    borderRadius: radius.l,
    backgroundColor: colors.bg,
  },
  finalContenido: { padding: space.l, paddingTop: space.xxl },
  finalIcono: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.okBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.l,
  },
  siguiente: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginBottom: space.m },
  siguienteIcono: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SolicitudServicio;
