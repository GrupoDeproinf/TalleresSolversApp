// Lista de negocios del certificador.
//
// Lo que esperan una decisión va primero, ordenado por quien lleva más días
// esperando. Cada tarjeta dice cuánto tiene listo y qué le falta, y deja
// llamar, escribir por WhatsApp o abrir la ruta sin entrar en la ficha.
//
// La lista se muestra en cuanto llegan los datos: la distancia se calcula
// después, con la ubicación del teléfono, y no bloquea (antes la lista
// esperaba al GPS, hasta 15 s, cada vez que se volvía a esta pantalla).
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Platform,
  PermissionsAndroid,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CalendarDays,
  CircleCheck,
  KeyRound,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  SlidersHorizontal,
  Store,
  X,
} from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  AppText,
  Banner,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  IconButton,
  SearchBar,
  Segmented,
  Tag,
  TallerCardSkeleton,
  MAX_FONT_SCALE,
  TOUCH,
  colors,
  fonts,
  radius,
  shadow,
  space,
} from '../../ui';
import {Avatar, GrupoMenu, FilaMenu, abrirSoporte, confirmarCerrarSesion} from '../../ui/cuenta';
import {cerrarSesionFirebase} from '../../utils/sesionSegura';
import {abrirRutaExterna, abrirWhatsApp, llamar, puedeLlamar, puedeWhatsApp} from '../../utils/contacto';
import {
  ESTADOS_POR_REVISAR,
  diasDesde,
  resumenRevision,
  revisionDeFicha,
  textoEspera,
  textoFalta,
} from '../../utils/revisionTaller';
import api from '../../../axiosInstance';

// ── Fechas y texto ─────────────────────────────────────────────────────────

/** createdAt llega como timestamp de Firestore, texto ISO o número. */
const parseCreatedAt = raw => {
  if (!raw) return null;
  if (typeof raw === 'object' && typeof raw._seconds === 'number') return new Date(raw._seconds * 1000);
  if (typeof raw === 'number') return new Date(raw > 1e12 ? raw : raw * 1000);
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const soloFecha = date =>
  date ? date.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'}) : null;

const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Minúsculas y sin acentos, para buscar "jose" y encontrar "José". */
const normalizar = v =>
  String(v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Solo dígitos, para buscar teléfonos y RIF con o sin guiones. */
const digitos = v => String(v || '').replace(/\D/g, '');

const formatKm = km => (km == null ? null : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

// ── Ubicación del teléfono (sin bloquear la lista) ─────────────────────────

const toRad = v => (v * Math.PI) / 180;
const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Se guarda unos minutos: al volver de una ficha no se vuelve a pedir.
const UBICACION_VALIDA_MS = 5 * 60 * 1000;
let ubicacionGuardada = null; // {latitude, longitude, at}
let pidiendoUbicacion = null; // promesa en curso

const pedirUbicacion = async () => {
  if (ubicacionGuardada && Date.now() - ubicacionGuardada.at < UBICACION_VALIDA_MS) return ubicacionGuardada;
  if (pidiendoUbicacion) return pidiendoUbicacion;
  pidiendoUbicacion = (async () => {
    try {
      if (Platform.OS === 'android') {
        const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (r !== PermissionsAndroid.RESULTS.GRANTED) return null;
      }
      const pos = await new Promise(resolve =>
        Geolocation.getCurrentPosition(
          p => resolve({latitude: p.coords.latitude, longitude: p.coords.longitude, at: Date.now()}),
          () => resolve(null),
          {enableHighAccuracy: false, timeout: 15000, maximumAge: 60000},
        ),
      );
      if (pos) ubicacionGuardada = pos;
      return pos || ubicacionGuardada;
    } catch {
      return ubicacionGuardada;
    } finally {
      pidiendoUbicacion = null;
    }
  })();
  return pidiendoUbicacion;
};

const conDistancia = (lista, pos) =>
  lista.map(item => {
    const lat = Number(item?.ubicacion?.lat);
    const lng = Number(item?.ubicacion?.lng);
    const km =
      pos && Number.isFinite(lat) && Number.isFinite(lng)
        ? calcularDistanciaKm(pos.latitude, pos.longitude, lat, lng)
        : null;
    return {...item, km_distance: km};
  });

// ── Pestañas, filtros y orden ──────────────────────────────────────────────

const PESTANAS = [
  {value: 'por_revisar', label: 'Por revisar', test: t => ESTADOS_POR_REVISAR.includes(t.status)},
  {value: 'aprobado', label: 'Aprobados', test: t => t.status === 'Aprobado'},
  {value: 'rechazado', label: 'Rechazados', test: t => t.status === 'Rechazado'},
];

const SUBESTATUS = [
  {key: 'En espera por aprobación', label: 'En revisión'},
  {key: 'En espera de documentos', label: 'Esperando documentos'},
];

const PLANES = [
  {key: 'con_plan', label: 'Con plan', test: t => !!t.subscripcion_actual?.nombre},
  {key: 'sin_plan', label: 'Sin plan', test: t => !t.subscripcion_actual?.nombre},
  {key: 'vencido', label: 'Plan vencido', test: t => t.subscripcion_actual?.status === 'Vencido'},
];

const ORDENES = [
  {key: 'espera', label: 'Más tiempo esperando'},
  {key: 'nuevo', label: 'Más nuevos'},
  {key: 'cerca', label: 'Más cercanos'},
];

const fechaMs = t => parseCreatedAt(t.createdAt)?.getTime() ?? 0;
const ordenar = (lista, orden) => {
  const r = [...lista];
  if (orden === 'nuevo') return r.sort((a, b) => fechaMs(b) - fechaMs(a));
  if (orden === 'cerca') {
    return r.sort((a, b) => (a.km_distance ?? Infinity) - (b.km_distance ?? Infinity));
  }
  // «espera»: el que lleva más tiempo, primero. Sin fecha, al final.
  return r.sort((a, b) => (fechaMs(a) || Infinity) - (fechaMs(b) || Infinity));
};

const FILTROS_VACIOS = {estados: [], subestatus: [], plan: null, dia: null, orden: null};

const STATUS_TAG = {
  'En espera por aprobación': {label: 'En revisión', tone: 'warn'},
  'En espera de documentos': {label: 'Esperando documentos', tone: 'info'},
  Aprobado: {label: 'Aprobado', tone: 'ok'},
  Rechazado: {label: 'Rechazado', tone: 'error'},
  Pendiente: {label: 'Pendiente', tone: 'warn'},
};

// ── Tarjeta ────────────────────────────────────────────────────────────────

const Accion = ({icon: Icon, label, onPress, disabled, color = colors.navy}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{disabled: !!disabled}}
    hitSlop={4}
    style={({pressed}) => [st.accion, pressed && {backgroundColor: colors.border}, disabled && {opacity: 0.35}]}>
    <Icon size={16} color={color} strokeWidth={2.3} />
    <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[st.accionTexto, {color}]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const TarjetaNegocio = ({item, porRevisar, mostrarEstatus, onPress}) => {
  const creado = parseCreatedAt(item.createdAt);
  const dias = diasDesde(creado);
  const rev = resumenRevision(revisionDeFicha(item));
  const completo = rev.listos === rev.total;
  const tag = STATUS_TAG[item.status];
  const plan = item.subscripcion_actual?.nombre
    ? `Plan ${item.subscripcion_actual.nombre}${item.subscripcion_actual.status === 'Vencido' ? ' (vencido)' : ''}`
    : 'Sin plan';
  const linea = [item.ciudad || item.municipio || item.estado, formatKm(item.km_distance), plan].filter(Boolean).join(' · ');
  const whats = item.whatsapp || item.phone;
  const lat = Number(item?.ubicacion?.lat);
  const lng = Number(item?.ubicacion?.lng);
  const hayRuta = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const falta = textoFalta(rev.faltan);

  const a11y = [
    item.nombre || 'Sin nombre',
    porRevisar ? textoEspera(dias) : soloFecha(creado),
    linea,
    porRevisar ? (completo ? 'Todo listo para aprobar' : falta) : tag?.label,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View style={st.card}>
      <Pressable
        onPress={() => onPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${a11y}. Abrir ficha`}
        style={({pressed}) => [st.cardMain, pressed && {opacity: 0.85}]}>
        <View style={st.cardTop}>
          <AppText variant="subtitle" numberOfLines={1} style={{flex: 1}}>
            {item.nombre || 'Sin nombre'}
          </AppText>
          {porRevisar ? (
            <Text
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              style={[st.espera, dias != null && dias < 3 && {color: colors.muted, fontFamily: fonts.medium}]}>
              {textoEspera(dias)}
            </Text>
          ) : (
            <AppText variant="caption" color={colors.muted}>
              {soloFecha(creado)}
            </AppText>
          )}
        </View>
        {linea ? (
          <AppText variant="caption" color={colors.muted} numberOfLines={1}>
            {linea}
          </AppText>
        ) : null}

        {porRevisar ? (
          <View style={{gap: 6, marginTop: 2}}>
            <View style={st.barra} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View
                style={[
                  st.barraLlena,
                  {width: `${Math.round((rev.listos / rev.total) * 100)}%`},
                  !completo && {backgroundColor: '#C97A00'},
                ]}
              />
            </View>
            <View style={st.filaEstado}>
              <Text
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[st.falta, completo && st.listo]}
                numberOfLines={2}>
                {completo ? `Todo listo: ${rev.listos} de ${rev.total}` : falta}
              </Text>
              {item.status === 'En espera de documentos' ? <Tag label="Esperando documentos" tone="info" /> : null}
            </View>
          </View>
        ) : mostrarEstatus && tag ? (
          <Tag label={tag.label} tone={tag.tone} style={{alignSelf: 'flex-start', marginTop: 2}} />
        ) : null}
      </Pressable>

      <View style={st.acciones}>
        <Accion icon={Phone} label="Llamar" onPress={() => llamar(item.phone)} disabled={!puedeLlamar(item.phone)} />
        <Accion
          icon={MessageCircle}
          label="WhatsApp"
          color={colors.whatsapp}
          onPress={() => abrirWhatsApp(whats, `Hola, te escribo de Solvers sobre el registro de ${item.nombre || 'tu negocio'}.`)}
          disabled={!puedeWhatsApp(whats)}
        />
        <Accion
          icon={Navigation}
          label="Cómo llegar"
          onPress={() => abrirRutaExterna({lat, lng}, item.nombre)}
          disabled={!hayRuta}
        />
      </View>
    </View>
  );
};

// ── Pantalla ───────────────────────────────────────────────────────────────

const TalleresContainer = () => {
  const navigation = useNavigation();

  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const [pestana, setPestana] = useState('por_revisar');
  const [busqueda, setBusqueda] = useState('');
  const [soloListos, setSoloListos] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const [verFiltros, setVerFiltros] = useState(false);
  const [verFecha, setVerFecha] = useState(false);
  const [cuentaVisible, setCuentaVisible] = useState(false);
  const [yo, setYo] = useState(null);
  const pedidoRef = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem('@userInfo')
      .then(v => setYo(v ? JSON.parse(v) : null))
      .catch(() => setYo(null));
  }, []);

  const cargar = useCallback(async () => {
    const mio = ++pedidoRef.current;
    try {
      const v = await AsyncStorage.getItem('@userInfo');
      const user = v ? JSON.parse(v) : null;
      const r = await api.post(
        '/usuarios/getTalleres',
        {estado: user?.estado, todos: true},
        {headers: {'Content-Type': 'application/json'}},
      );
      if (mio !== pedidoRef.current) return;
      const lista = Array.isArray(r?.data) ? r.data : [];
      setErrorCarga(false);
      // Se pinta ya, con la última ubicación conocida si la hay.
      setTalleres(conDistancia(lista, ubicacionGuardada));
      // La distancia se completa después, sin bloquear la lista.
      pedirUbicacion().then(pos => {
        if (pos && mio === pedidoRef.current) setTalleres(conDistancia(lista, pos));
      });
    } catch {
      // Sin conexión o error del servidor: se conserva lo que ya estaba.
      if (mio === pedidoRef.current) setErrorCarga(true);
    } finally {
      if (mio === pedidoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => navigation.addListener('focus', cargar), [navigation, cargar]);

  const refrescar = async () => {
    if (refrescando) return;
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  // Filtros del panel (estado, plan, día) y búsqueda.
  const filtrados = useMemo(() => {
    let r = talleres;
    const q = normalizar(busqueda.trim());
    const qd = digitos(busqueda);
    if (q) {
      r = r.filter(
        t =>
          normalizar(t.nombre).includes(q) ||
          normalizar(t.responsable || t.nombre_responsable).includes(q) ||
          normalizar(t.email).includes(q) ||
          (qd.length >= 4 && (digitos(t.rif).includes(qd) || digitos(t.phone).includes(qd))),
      );
    }
    if (filtros.estados.length) r = r.filter(t => filtros.estados.includes(t.estado));
    if (filtros.plan) {
      const p = PLANES.find(x => x.key === filtros.plan);
      if (p) r = r.filter(p.test);
    }
    if (filtros.dia) r = r.filter(t => isSameDay(parseCreatedAt(t.createdAt), filtros.dia));
    return r;
  }, [talleres, busqueda, filtros]);

  const conteo = useMemo(() => {
    const c = {};
    PESTANAS.forEach(p => {
      c[p.value] = filtrados.filter(p.test).length;
    });
    return c;
  }, [filtrados]);

  // Al buscar se busca en todos los estatus: así se encuentra cualquier
  // negocio sin saber en qué pestaña está.
  const buscando = busqueda.trim().length > 0;
  const enPestana = useMemo(() => {
    if (buscando) return filtrados;
    const p = PESTANAS.find(x => x.value === pestana) || PESTANAS[0];
    let r = filtrados.filter(p.test);
    if (pestana === 'por_revisar' && filtros.subestatus.length) {
      r = r.filter(t => filtros.subestatus.includes(t.status));
    }
    return r;
  }, [filtrados, pestana, filtros.subestatus, buscando]);

  const listos = useMemo(
    () =>
      pestana === 'por_revisar' && !buscando
        ? enPestana.filter(t => {
            const s = resumenRevision(revisionDeFicha(t));
            return s.listos === s.total;
          })
        : [],
    [enPestana, pestana, buscando],
  );

  const orden = filtros.orden || (pestana === 'por_revisar' && !buscando ? 'espera' : 'nuevo');
  const visibles = useMemo(() => {
    const base = soloListos && listos.length ? listos : enPestana;
    return ordenar(base, orden);
  }, [enPestana, listos, soloListos, orden]);

  useEffect(() => {
    if (!listos.length) setSoloListos(false);
  }, [listos.length]);

  const estadosDisponibles = useMemo(
    () => Array.from(new Set(talleres.map(t => t.estado).filter(Boolean))).sort(),
    [talleres],
  );

  const filtrosActivos =
    filtros.estados.length +
    filtros.subestatus.length +
    (filtros.plan ? 1 : 0) +
    (filtros.dia ? 1 : 0) +
    (filtros.orden ? 1 : 0);

  const abrirFiltros = () => {
    setBorrador(filtros);
    setVerFiltros(true);
  };
  const aplicarFiltros = () => {
    setFiltros(borrador);
    setVerFiltros(false);
  };
  const limpiarFiltros = () => {
    setBorrador(FILTROS_VACIOS);
    setFiltros(FILTROS_VACIOS);
    setVerFiltros(false);
  };
  const alternar = (campo, valor) =>
    setBorrador(b => ({
      ...b,
      [campo]: b[campo].includes(valor) ? b[campo].filter(x => x !== valor) : [...b[campo], valor],
    }));

  // La ficha recibe la cola de «Por revisar» en el orden de la lista, para
  // ofrecer «Revisar el siguiente» después de decidir.
  const abrirFicha = item => {
    const cola =
      pestana === 'por_revisar' && !buscando
        ? visibles.filter(t => t.uid).map(t => ({uid: t.uid, nombre: t.nombre || '', createdAt: fechaMs(t)}))
        : [];
    navigation.navigate('FormTaller', {uid: item.uid, cola});
  };

  const cerrarSesion = async () => {
    setCuentaVisible(false);
    try {
      await AsyncStorage.removeItem('@userInfo');
    } catch {}
    await cerrarSesionFirebase();
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch {}
  };

  const nombreCorto = String(yo?.nombre || '').trim().split(/\s+/)[0];
  const tituloLista = buscando ? 'Resultados' : (PESTANAS.find(p => p.value === pestana) || PESTANAS[0]).label;

  return (
    <View style={st.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Cabecera */}
      <View style={st.header}>
        <View style={{flex: 1}}>
          <AppText variant="caption" color={colors.muted} numberOfLines={1}>
            {[yo?.estado, nombreCorto ? `Hola, ${nombreCorto}` : null].filter(Boolean).join(' · ') ||
              'Certificador de Solvers'}
          </AppText>
          <AppText variant="display" numberOfLines={1} accessibilityRole="header">
            {tituloLista}
          </AppText>
        </View>
        <IconButton icon={RefreshCw} label="Actualizar la lista" onPress={refrescar} />
        <Pressable
          onPress={() => setCuentaVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Mi cuenta"
          hitSlop={6}>
          <Avatar uri={yo?.image_perfil} size={40} />
        </Pressable>
      </View>

      <Segmented
        style={st.segmented}
        value={buscando ? null : pestana}
        onChange={v => {
          setPestana(v);
          setSoloListos(false);
          if (busqueda) setBusqueda('');
        }}
        options={PESTANAS.map(p => ({
          value: p.value,
          label: cargando ? p.label : `${p.label} ${conteo[p.value] || 0}`,
        }))}
      />

      <View style={st.buscarFila}>
        <SearchBar value={busqueda} onChangeText={setBusqueda} placeholder="Nombre, RIF o teléfono" style={{flex: 1}} />
        <Pressable
          onPress={abrirFiltros}
          accessibilityRole="button"
          accessibilityLabel={filtrosActivos ? `Filtros, ${filtrosActivos} activos` : 'Filtros'}
          style={({pressed}) => [st.filtrosBtn, filtrosActivos > 0 && st.filtrosBtnOn, pressed && {opacity: 0.8}]}>
          <SlidersHorizontal size={20} color={filtrosActivos ? colors.yellow : colors.navy} strokeWidth={2.2} />
          {filtrosActivos > 0 ? (
            <View style={st.filtrosBadge}>
              <Text style={st.filtrosBadgeText}>{filtrosActivos}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(item, i) => String(item.uid || item.id || i)}
        renderItem={({item}) => (
          <TarjetaNegocio
            item={item}
            porRevisar={!buscando && pestana === 'por_revisar'}
            mostrarEstatus={buscando}
            onPress={abrirFicha}
          />
        )}
        contentContainerStyle={st.lista}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.navy} />}
        ListHeaderComponent={
          <View style={{gap: space.s}}>
            {errorCarga ? (
              <Banner
                tone="warn"
                text={
                  talleres.length
                    ? 'No pudimos actualizar la lista. Revisa tu conexión.'
                    : 'No pudimos cargar los negocios. Revisa tu conexión.'
                }
                actionLabel="Reintentar"
                onAction={refrescar}
              />
            ) : null}
            {buscando && !cargando ? (
              <AppText variant="caption" color={colors.muted}>
                {visibles.length === 1 ? '1 negocio' : `${visibles.length} negocios`} en todos los estatus
              </AppText>
            ) : null}
            {listos.length > 0 ? (
              <Pressable
                onPress={() => setSoloListos(v => !v)}
                accessibilityRole="button"
                accessibilityState={{selected: soloListos}}
                accessibilityLabel={
                  soloListos
                    ? 'Mostrando solo los listos para aprobar. Tocar para ver todos'
                    : `${listos.length} con todo listo para aprobar. Tocar para ver solo esos`
                }
                style={({pressed}) => [st.listos, pressed && {opacity: 0.85}]}>
                <CircleCheck size={18} color={colors.ok} strokeWidth={2.4} />
                <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={st.listosTexto}>
                  {soloListos
                    ? `Solo los ${listos.length} listos para aprobar`
                    : `${listos.length} ${listos.length === 1 ? 'tiene' : 'tienen'} todo listo para aprobar`}
                </Text>
                <Text style={st.listosAccion}>{soloListos ? 'Ver todos' : 'Ver'}</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          errorCarga && !talleres.length ? null : cargando ? (
            <View accessible accessibilityLabel="Cargando negocios">
              {[0, 1, 2, 3].map(i => (
                <TallerCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={Store}
              title={
                buscando || filtrosActivos
                  ? 'No hay negocios con estos filtros'
                  : pestana === 'por_revisar'
                  ? 'No hay negocios por revisar'
                  : 'No hay negocios aquí'
              }
              message={
                buscando || filtrosActivos
                  ? 'Prueba con otra búsqueda o quita algún filtro.'
                  : pestana === 'por_revisar'
                  ? 'Cuando un taller termine su registro aparecerá en esta lista.'
                  : null
              }
              actionLabel={filtrosActivos ? 'Quitar filtros' : null}
              onAction={filtrosActivos ? limpiarFiltros : null}
            />
          )
        }
      />

      {/* Filtros */}
      <BottomSheet visible={verFiltros} onClose={() => setVerFiltros(false)} title="Filtros">
        <ScrollView style={{maxHeight: 460}} contentContainerStyle={{gap: space.l, paddingBottom: space.m}}>
          <Grupo titulo="Ordenar">
            {ORDENES.map(o => (
              <Chip
                key={o.key}
                label={o.label}
                selected={(borrador.orden || null) === o.key}
                onPress={() => setBorrador(b => ({...b, orden: b.orden === o.key ? null : o.key}))}
              />
            ))}
          </Grupo>
          <Grupo titulo="En «Por revisar»">
            {SUBESTATUS.map(s => (
              <Chip
                key={s.key}
                label={s.label}
                selected={borrador.subestatus.includes(s.key)}
                onPress={() => alternar('subestatus', s.key)}
              />
            ))}
          </Grupo>
          <Grupo titulo="Plan">
            {PLANES.map(p => (
              <Chip
                key={p.key}
                label={p.label}
                selected={borrador.plan === p.key}
                onPress={() => setBorrador(b => ({...b, plan: b.plan === p.key ? null : p.key}))}
              />
            ))}
          </Grupo>
          {estadosDisponibles.length > 1 ? (
            <Grupo titulo="Estado">
              {estadosDisponibles.map(e => (
                <Chip key={e} label={e} selected={borrador.estados.includes(e)} onPress={() => alternar('estados', e)} />
              ))}
            </Grupo>
          ) : null}
          <Grupo titulo="Registrado el día">
            <Chip
              icon={CalendarDays}
              label={borrador.dia ? soloFecha(borrador.dia) : 'Elegir un día'}
              selected={!!borrador.dia}
              onPress={() => setVerFecha(true)}
            />
            {borrador.dia ? <Chip icon={X} label="Quitar día" onPress={() => setBorrador(b => ({...b, dia: null}))} /> : null}
          </Grupo>
        </ScrollView>
        <View style={st.filtrosPie}>
          <Button title="Quitar filtros" variant="secondary" size="m" onPress={limpiarFiltros} style={{flex: 1}} />
          <Button title="Aplicar" variant="primary" size="m" onPress={aplicarFiltros} style={{flex: 1.4}} />
        </View>
        <DatePicker
          modal
          open={verFecha}
          date={borrador.dia || new Date()}
          mode="date"
          locale="es"
          title="Registrado el día"
          confirmText="Elegir"
          cancelText="Cancelar"
          onConfirm={d => {
            setVerFecha(false);
            setBorrador(b => ({...b, dia: d}));
          }}
          onCancel={() => setVerFecha(false)}
        />
      </BottomSheet>

      {/* Mi cuenta */}
      <BottomSheet visible={cuentaVisible} onClose={() => setCuentaVisible(false)} title="Mi cuenta">
        <View style={{flexDirection: 'row', alignItems: 'center', gap: space.m}}>
          <Avatar uri={yo?.image_perfil} size={56} />
          <View style={{flex: 1}}>
            <AppText variant="subtitle" numberOfLines={1}>
              {yo?.nombre || 'Certificador'}
            </AppText>
            <AppText variant="caption" color={colors.muted} numberOfLines={1}>
              {[yo?.email, yo?.estado].filter(Boolean).join(' · ') || 'Certificador de Solvers'}
            </AppText>
          </View>
        </View>
        <GrupoMenu style={{marginTop: space.m}}>
          <FilaMenu
            icon={KeyRound}
            titulo="Cambiar contraseña"
            ayuda="Te enviamos un enlace a tu correo"
            onPress={() => {
              setCuentaVisible(false);
              navigation.navigate('ForgetPassword');
            }}
          />
          <FilaMenu icon={LifeBuoy} titulo="Soporte" ayuda="Escríbenos por WhatsApp" externo onPress={abrirSoporte} />
        </GrupoMenu>
        <GrupoMenu style={{marginTop: space.m, marginBottom: space.l}}>
          <FilaMenu icon={LogOut} titulo="Cerrar sesión" peligro onPress={() => confirmarCerrarSesion(cerrarSesion)} />
        </GrupoMenu>
      </BottomSheet>
    </View>
  );
};

const Grupo = ({titulo, children}) => (
  <View style={{gap: space.s}}>
    <AppText variant="caption" color={colors.muted} style={st.grupoTitulo}>
      {titulo}
    </AppText>
    <View style={st.chips}>{children}</View>
  </View>
);

const st = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    paddingHorizontal: space.m,
    paddingTop: space.m,
    paddingBottom: space.s,
  },
  segmented: {marginHorizontal: space.m},
  buscarFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    paddingHorizontal: space.m,
    paddingTop: space.s + 4,
    paddingBottom: space.s,
  },
  filtrosBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.m,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtrosBtnOn: {backgroundColor: colors.navy, borderColor: colors.navy},
  filtrosBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtrosBadgeText: {fontFamily: fonts.bold, fontSize: 12, color: colors.navy},
  lista: {paddingHorizontal: space.m, paddingTop: space.xs, paddingBottom: space.xl, gap: space.s + 4},
  listos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    minHeight: TOUCH,
    paddingHorizontal: space.m,
    borderRadius: radius.m,
    backgroundColor: colors.okBg,
  },
  listosTexto: {flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.ok},
  listosAccion: {fontFamily: fonts.bold, fontSize: 14, color: colors.ok},
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardMain: {padding: space.m, paddingBottom: space.s + 4, gap: 4},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: space.s},
  espera: {fontFamily: fonts.bold, fontSize: 13, color: colors.warn},
  barra: {height: 6, borderRadius: 3, backgroundColor: colors.skeleton, overflow: 'hidden'},
  barraLlena: {height: '100%', borderRadius: 3, backgroundColor: colors.ok},
  filaEstado: {flexDirection: 'row', alignItems: 'center', gap: space.s},
  falta: {flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.warn},
  listo: {color: colors.ok, fontFamily: fonts.bold},
  acciones: {flexDirection: 'row', gap: space.s, paddingHorizontal: space.m, paddingBottom: space.m},
  accion: {
    flex: 1,
    minHeight: TOUCH,
    borderRadius: radius.s,
    backgroundColor: colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  accionTexto: {fontFamily: fonts.semibold, fontSize: 13},
  grupoTitulo: {textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: fonts.semibold},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: space.s},
  filtrosPie: {flexDirection: 'row', gap: space.s, paddingTop: space.s, paddingBottom: space.m},
});

export default TalleresContainer;
