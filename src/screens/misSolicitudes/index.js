import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, Image, Alert, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Store,
  ChevronRight,
  Clock,
  Phone,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Car,
} from 'lucide-react-native';
import api from '../../../axiosInstance';
import {
  AppText,
  Button,
  Card,
  Tag,
  Banner,
  EmptyState,
  Segmented,
  Chip,
  BottomSheet,
  TallerCardSkeleton,
  colors,
  space,
  radius,
} from '../../ui';
import { hora12, priceValue, formatPrice, sentenceCase } from '../../utils/taller';

const mapBackendStatusToInternal = statusText => {
  if (!statusText) {
    return 'enviada';
  }

  const normalized = statusText.toLowerCase();

  if (normalized.includes('espera') && (normalized.includes('aprobación') || normalized.includes('aprobacion'))) {
    return 'enviada';
  }
  // Primero los estados finales: "Inspección aceptada" contiene "inspecc" y
  // antes se trataba como una propuesta que todavía se podía elegir.
  if (normalized.includes('cancel')) {
    return 'cancelada';
  }
  if (normalized.includes('venc') || normalized.includes('expir')) {
    return 'expirada';
  }
  if (normalized.includes('rechaz')) {
    return 'rechazada';
  }
  if (normalized.includes('aceptad')) {
    return 'aceptada';
  }
  if (normalized.includes('inspecc')) {
    return 'inspeccion_previa';
  }
  if (normalized.includes('cotiz')) {
    return 'cotizada';
  }
  if (normalized.includes('respuesta')) {
    return 'con_respuestas';
  }

  return 'enviada';
};

/** Fecha de Firestore ({_seconds} o {seconds}), ISO o milisegundos. */
const parseFecha = v => {
  if (!v) return null;
  if (typeof v === 'object' && typeof v._seconds === 'number') return new Date(v._seconds * 1000);
  if (typeof v === 'object' && typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatFechaSolicitud = fecha_solicitud => {
  const fechaDate = parseFecha(fecha_solicitud);
  if (!fechaDate) {
    return { fechaTexto: '', fechaDate: null };
  }

  const dia = fechaDate.getDate().toString().padStart(2, '0');
  const mes = (fechaDate.getMonth() + 1).toString().padStart(2, '0');
  const anio = fechaDate.getFullYear();
  const horas = fechaDate.getHours().toString().padStart(2, '0');
  const minutos = fechaDate.getMinutes().toString().padStart(2, '0');

  return {
    fechaTexto: `${anio}-${mes}-${dia} ${horas}:${minutos}`,
    fechaDate,
  };
};

const mapItemToSolicitud = item => {
  const { fechaTexto, fechaDate } = formatFechaSolicitud(item.fecha_solicitud);
  const fv = formatFechaSolicitud(item.fecha_vencido);
  const vehiculo = item.vehiculo || {};
  const marca = vehiculo.vehiculo_marca || '';
  const modelo = vehiculo.vehiculo_modelo || '';
  const anio =
    vehiculo.vehiculo_anio !== undefined &&
    vehiculo.vehiculo_anio !== null &&
    vehiculo.vehiculo_anio !== ''
      ? ` (${vehiculo.vehiculo_anio})`
      : '';
  const vehiculoTexto = `${marca} ${modelo}${anio}`.trim();
  const nombreSol = (item.nombre_solicitud || '').trim() || 'Solicitud de servicio';
  return {
    id: item.id,
    nombreSolicitud: nombreSol,
    nombre_solicitud: nombreSol,
    // Número de referencia de la solicitud (S-000123).
    codigo: item.codigo_solicitud || '',
    estado: mapBackendStatusToInternal(item.status),
    statusOriginal: item.status,
    fecha: fechaTexto,
    fechaDate,
    fecha_solicitud: fechaTexto,
    fecha_vencido: fv.fechaTexto || '',
    vehiculo: vehiculoTexto,
    urgencia: item.urgencia || '',
    descripcion: item.descripcion || '',
    fotos: Array.isArray(item.solicitud_images) ? item.solicitud_images : [],
  };
};

const mapPropuestaToCard = (p, solicitudEnEspera) => {
  const fechaRaw = p.fecha_propuesta || p.fecha_solicitud || p.fecha;
  const parsed = formatFechaSolicitud(fechaRaw);
  const fechaTexto = parsed.fechaTexto || p.fecha_texto || '';
  const fechaDate = parsed.fechaDate;
  const vehiculo = p.vehiculo || solicitudEnEspera?.vehiculo || '';
  const vehiculoStr = typeof vehiculo === 'string'
    ? vehiculo
    : (vehiculo.vehiculo_marca || '') + ' ' + (vehiculo.vehiculo_modelo || '') + (vehiculo.vehiculo_anio ? ` (${vehiculo.vehiculo_anio})` : '');
  return {
    // Sin id no se puede elegir ni rechazar: esas se descartan al cargar.
    id: p.id || p.uid || null,
    nombreSolicitud: p.nombre_servicio || p.nombre_solicitud || solicitudEnEspera?.nombreSolicitud || 'Propuesta',
    codigo: p.codigo_solicitud || solicitudEnEspera?.codigo || '',
    estado: mapBackendStatusToInternal(p.status),
    statusOriginal: p.status,
    fecha: fechaTexto,
    fechaDate,
    vehiculo: vehiculoStr.trim() || '—',
    urgencia: p.urgencia || solicitudEnEspera?.urgencia || '',
    descripcion: p.descripcion || p.mensaje || '',
    fotos: Array.isArray(p.imagenes) ? p.imagenes : [],
    // Campos para Cotizado
    precio_estimado: p.precio_estimado != null && p.precio_estimado !== '' ? String(p.precio_estimado) : null,
    tiempo_estimado: p.tiempo_estimado || null,
    comentario: p.comentario || null,
    nombre_taller: p.nombre_taller || null,
    uid_taller: p.uid_taller || p.uid_taller_propuesta || p.uid_taller_asignado || null,
  };
};

// ── Fase 3: pantalla rediseñada ────────────────────────────────────────────
// Una sola lista con desplazamiento (antes: dos mitades fijas), tres vistas en
// lugar de seis pestañas, y las propuestas se eligen o rechazan desde la misma
// tarjeta, con el precio más bajo marcado para comparar de un vistazo.

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaCorta = d => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const hh = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${hora12(hh)}`;
};

/** Precio de la propuesta como número (null si no hay). Antes se borraban los decimales. */
const precioPropuesta = item => priceValue({ precio: item?.precio_estimado });

const ACCIONABLES = ['cotizada', 'inspeccion_previa'];
// Estados en los que la solicitud ya no está "en curso".
const TERMINALES = ['aceptada', 'rechazada', 'cancelada', 'expirada'];

const VISTAS = [
  { value: 'activa', label: 'En curso' },
  { value: 'aceptadas', label: 'Aceptadas' },
  { value: 'canceladas', label: 'Canceladas' },
];

const ETAPAS = ['Enviada', 'Propuestas', 'Taller elegido'];

/** Línea de progreso de la solicitud: Enviada → Propuestas → Taller elegido. */
const Progreso = ({ etapa }) => (
  <View style={m.progreso} accessibilityLabel={`Paso ${etapa + 1} de 3: ${ETAPAS[etapa]}`}>
    {ETAPAS.map((e, i) => (
      <View key={e} style={{ flex: 1 }}>
        <View style={[m.progresoBarra, i <= etapa && m.progresoBarraOn]} />
        <AppText variant="caption" color={i <= etapa ? colors.text : colors.muted} style={{ marginTop: 4 }}>
          {e}
        </AppText>
      </View>
    ))}
  </View>
);

const PropuestaCard = ({ item, masBarata, bloqueada, ocupada, onElegir, onRechazar, onVerTaller }) => {
  const precio = precioPropuesta(item);
  const esInspeccion = item.estado === 'inspeccion_previa';
  const accionable = ACCIONABLES.includes(item.estado) && !bloqueada;
  const tag =
    item.estado === 'aceptada'
      ? { label: 'Elegido', tone: 'ok' }
      : item.estado === 'rechazada'
      ? { label: 'Rechazada', tone: 'neutral' }
      : bloqueada
      ? { label: 'No elegida', tone: 'neutral' }
      : esInspeccion
      ? { label: 'Quiere ver el carro', tone: 'warn' }
      : null;
  const apagada = item.estado === 'rechazada' || (bloqueada && item.estado !== 'aceptada');

  return (
    <Card style={[m.propuesta, item.estado === 'aceptada' && m.propuestaElegida, apagada && { opacity: 0.6 }]}>
      <Pressable
        onPress={onVerTaller}
        disabled={!item.uid_taller}
        accessibilityRole="button"
        accessibilityLabel={`Ver el taller ${item.nombre_taller || ''}`}
        style={m.propuestaTaller}>
        <View style={m.tallerIcono}>
          <Store size={18} color={colors.navy} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="subtitle" numberOfLines={1}>
            {item.nombre_taller || 'Taller'}
          </AppText>
          {item.fechaDate ? (
            <AppText variant="caption" color={colors.muted}>
              Respondió el {fechaCorta(item.fechaDate)}
            </AppText>
          ) : null}
        </View>
        {item.uid_taller ? <ChevronRight size={20} color={colors.muted} strokeWidth={2.2} /> : null}
      </Pressable>

      <View style={m.filaTags}>
        {masBarata && accionable ? <Tag label="Precio más bajo" tone="ok" /> : null}
        {tag ? <Tag label={tag.label} tone={tag.tone} /> : null}
      </View>

      {esInspeccion && precio == null ? (
        <AppText variant="body" style={{ marginTop: space.s }}>
          Necesita revisar el carro en el taller antes de darte un precio.
        </AppText>
      ) : (
        <View style={m.precioFila}>
          <AppText variant="title">{precio != null ? formatPrice(precio) : 'Sin precio'}</AppText>
          {item.tiempo_estimado ? (
            <View style={m.tiempo}>
              <Clock size={16} color={colors.muted} strokeWidth={2.2} />
              <AppText variant="caption" color={colors.muted}>
                {item.tiempo_estimado}
              </AppText>
            </View>
          ) : null}
        </View>
      )}

      {item.comentario ? (
        <View style={m.comentario}>
          <AppText variant="caption" color={colors.muted}>
            Comentario del taller
          </AppText>
          <AppText variant="body" numberOfLines={5}>
            {item.comentario}
          </AppText>
        </View>
      ) : null}

      {accionable ? (
        <View style={m.botones}>
          <Button
            title="Rechazar"
            variant="secondary"
            size="m"
            onPress={onRechazar}
            disabled={!!ocupada}
            loading={ocupada === 'rechazar'}
            style={{ flex: 1 }}
          />
          <Button
            title={esInspeccion ? 'Aceptar revisión' : 'Elegir taller'}
            variant="accent"
            size="m"
            onPress={onElegir}
            disabled={!!ocupada}
            loading={ocupada === 'elegir'}
            style={{ flex: 1.4 }}
          />
        </View>
      ) : item.estado === 'aceptada' && item.uid_taller ? (
        <Button
          title="Ver taller y contactar"
          variant="primary"
          size="m"
          icon={Phone}
          onPress={onVerTaller}
          style={{ marginTop: space.m }}
        />
      ) : null}
    </Card>
  );
};

const MisSolicitudesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [vista, setVista] = useState('activa');
  const [solicitudEnEsperaData, setSolicitudEnEsperaData] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  // { id, accion: 'elegir' | 'rechazar' } de la propuesta en curso.
  const [accionEnCurso, setAccionEnCurso] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorPropuestas, setErrorPropuestas] = useState('');
  // Todas las solicitudes abiertas (antes solo se veía la última).
  const [activas, setActivas] = useState([]);
  const seleccionRef = useRef(null);
  // Cada carga lleva un número: si el usuario cambió de pestaña mientras
  // llegaba la respuesta, la respuesta vieja se descarta.
  const pedidoRef = useRef(0);
  const cancelandoRef = useRef(false);
  const [elegido, setElegido] = useState(null); // { nombre_taller, uid_taller, esInspeccion }

  const leerUid = async () => {
    const userInfoStr = await AsyncStorage.getItem('@userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    return userInfo?.uid || null;
  };

  const loadSolicitudes = useCallback(async () => {
    const yo = ++pedidoRef.current;
    const vigente = () => yo === pedidoRef.current;
    try {
      setLoading(true);
      setError('');
      setErrorPropuestas('');
      const uid = await leerUid();
      if (!vigente()) return;
      if (!uid) {
        setSolicitudEnEsperaData(null);
        setActivas([]);
        setSolicitudes([]);
        setError('No pudimos identificar tu cuenta. Cierra sesión y vuelve a entrar.');
        return;
      }

      const listRes = await api.post('usuarios/getSolicitudesByUsuario', {
        uid_usuario: uid,
        solo_ultima: false,
      });
      if (!vigente()) return;
      // El servidor no las ordena: de la más nueva a la más vieja.
      const todas = (Array.isArray(listRes.data) ? listRes.data : [])
        .filter(x => x?.id)
        .map(mapItemToSolicitud)
        .sort((a, b) => (b.fechaDate?.getTime() || 0) - (a.fechaDate?.getTime() || 0));
      const abiertas = todas.filter(s => !TERMINALES.includes(s.estado));
      const elegida = abiertas.find(s => s.id === seleccionRef.current) || abiertas[0] || null;
      seleccionRef.current = elegida?.id || null;
      // Sin solicitud abierta se muestran las propuestas de la última que no
      // se canceló ni venció (para ver el taller elegido).
      const base = elegida || todas.find(s => !['cancelada', 'expirada'].includes(s.estado)) || null;
      setActivas(abiertas);
      setSolicitudEnEsperaData(elegida);

      if (base) {
        try {
          const propuestasRes = await api.post('usuarios/getPropuestasBySolicitud', { uid_solicitud: base.id });
          if (!vigente()) return;
          const lista = Array.isArray(propuestasRes.data) ? propuestasRes.data : [];
          setSolicitudes(lista.filter(p => p?.id || p?.uid).map(p => mapPropuestaToCard(p, base)));
        } catch (_e) {
          if (!vigente()) return;
          // Se conserva lo que ya se veía y se avisa, en vez de decir "sin propuestas".
          setErrorPropuestas('No pudimos cargar las propuestas. Desliza hacia abajo para reintentar.');
        }
      } else {
        setSolicitudes([]);
      }
    } catch (e) {
      if (!vigente()) return;
      setError('No pudimos cargar tus solicitudes. Revisa tu conexión.');
    } finally {
      if (vigente()) setLoading(false);
    }
  }, []);

  const elegirSolicitud = id => {
    if (id === seleccionRef.current) return;
    seleccionRef.current = id;
    setSolicitudes([]);
    loadSolicitudes();
  };

  const loadAceptadas = useCallback(async () => {
    const yo = ++pedidoRef.current;
    const vigente = () => yo === pedidoRef.current;
    try {
      setLoading(true);
      setError('');
      const uid = await leerUid();
      if (!vigente()) return;
      if (!uid) {
        setSolicitudes([]);
        setError('No pudimos identificar tu cuenta. Cierra sesión y vuelve a entrar.');
        return;
      }
      // Se incluyen también las inspecciones aceptadas (antes no aparecían).
      const resultados = await Promise.allSettled(
        ['Aceptada', 'Inspección aceptada'].map(status =>
          api
            .post('usuarios/getSolicitudesByUsuario', { uid_usuario: uid, status })
            .then(r => (Array.isArray(r.data) ? r.data : r.data?.id ? [r.data] : [])),
        ),
      );
      if (!vigente()) return;
      const fallidas = resultados.filter(r => r.status === 'rejected').length;
      if (fallidas === resultados.length) throw new Error('sin conexión');
      if (fallidas) setError('Puede que falten algunas: no pudimos cargarlas todas. Desliza para reintentar.');
      const vistos = new Set();
      const lista = resultados
        .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
        .filter(x => x?.id && !vistos.has(x.id) && vistos.add(x.id));
      setSolicitudes(
        lista.map(p => ({
          ...mapPropuestaToCard(p, null),
          // Son solicitudes ya cerradas con un taller: se muestran como elegidas.
          estado: 'aceptada',
          nombreSolicitud: (p.nombre_solicitud || '').trim() || 'Solicitud de servicio',
        })),
      );
    } catch (e) {
      if (!vigente()) return;
      setError('No pudimos cargar tus solicitudes aceptadas. Revisa tu conexión.');
    } finally {
      if (vigente()) setLoading(false);
    }
  }, []);

  const loadCanceladas = useCallback(async () => {
    const yo = ++pedidoRef.current;
    const vigente = () => yo === pedidoRef.current;
    try {
      setLoading(true);
      setError('');
      const uid = await leerUid();
      if (!vigente()) return;
      if (!uid) {
        setSolicitudes([]);
        setError('No pudimos identificar tu cuenta. Cierra sesión y vuelve a entrar.');
        return;
      }
      // También las vencidas (nadie respondió a tiempo), con su propia etiqueta.
      const resultados = await Promise.allSettled(
        ['Cancelado', 'Vencido'].map(status =>
          api
            .post('usuarios/getSolicitudesByUsuario', { uid_usuario: uid, status })
            .then(r => (Array.isArray(r.data) ? r.data : r.data?.id ? [r.data] : [])),
        ),
      );
      if (!vigente()) return;
      const fallidas = resultados.filter(r => r.status === 'rejected').length;
      if (fallidas === resultados.length) throw new Error('sin conexión');
      if (fallidas) setError('Puede que falten algunas: no pudimos cargarlas todas. Desliza para reintentar.');
      const vistos = new Set();
      const list = resultados
        .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
        .filter(x => x?.id && !vistos.has(x.id) && vistos.add(x.id));
      setSolicitudes(list.map(mapItemToSolicitud));
    } catch (e) {
      if (!vigente()) return;
      setError('No pudimos cargar tus solicitudes canceladas. Revisa tu conexión.');
    } finally {
      if (vigente()) setLoading(false);
    }
  }, []);

  const cargarVista = useCallback(
    v => (v === 'aceptadas' ? loadAceptadas() : v === 'canceladas' ? loadCanceladas() : loadSolicitudes()),
    [loadAceptadas, loadCanceladas, loadSolicitudes],
  );

  useFocusEffect(
    useCallback(() => {
      cargarVista(vista);
    }, [vista, cargarVista]),
  );

  const cambiarVista = v => {
    if (v === vista) return;
    pedidoRef.current += 1; // descarta respuestas de la pestaña anterior
    setSolicitudes([]);
    setError('');
    setVista(v);
  };

  const refrescar = async () => {
    setRefrescando(true);
    await cargarVista(vista);
    setRefrescando(false);
  };

  const verTaller = uid => uid && navigation.navigate('TallerDetail', { tallerId: uid });

  const elegirPropuesta = item => {
    if (!item?.id || accionEnCurso) return;
    const esInspeccion = item.estado === 'inspeccion_previa';
    const nombre = item.nombre_taller || 'este taller';
    Alert.alert(
      esInspeccion ? '¿Aceptar la revisión?' : '¿Elegir este taller?',
      esInspeccion
        ? `${nombre} revisará tu carro en el taller y luego te dará el precio. Le avisaremos para que coordine contigo.`
        : `Le avisaremos a ${nombre} para que coordine contigo. Las demás propuestas quedarán sin elegir.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: esInspeccion ? 'Sí, aceptar' : 'Sí, elegir',
          onPress: async () => {
            setAccionEnCurso({ id: item.id, accion: 'elegir' });
            try {
              await api.post('usuarios/updatePropuesta', { uid_propuesta: item.id, status: 'aceptada' });
              setElegido({ nombre_taller: item.nombre_taller || 'El taller', uid_taller: item.uid_taller, esInspeccion });
              loadSolicitudes();
            } catch (e) {
              Alert.alert('No se pudo elegir', 'Revisa tu conexión e inténtalo de nuevo.');
            } finally {
              setAccionEnCurso(null);
            }
          },
        },
      ],
    );
  };

  const rechazarPropuesta = item => {
    if (!item?.id || accionEnCurso) return;
    Alert.alert(
      '¿Rechazar esta propuesta?',
      `La propuesta de ${item.nombre_taller || 'este taller'} quedará rechazada y no podrás recuperarla.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, rechazar',
          style: 'destructive',
          onPress: async () => {
            setAccionEnCurso({ id: item.id, accion: 'rechazar' });
            try {
              await api.post('usuarios/updatePropuesta', { uid_propuesta: item.id, status: 'rechazada' });
              loadSolicitudes();
            } catch (e) {
              Alert.alert('No se pudo rechazar', 'Revisa tu conexión e inténtalo de nuevo.');
            } finally {
              setAccionEnCurso(null);
            }
          },
        },
      ],
    );
  };

  const cancelarSolicitud = sol => {
    if (!sol?.id || cancelandoRef.current) return;
    Alert.alert(
      '¿Cancelar la solicitud?',
      'Los talleres ya no podrán enviarte propuestas para esta solicitud.',
      [
        { text: 'No, seguir', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            if (cancelandoRef.current) return;
            cancelandoRef.current = true;
            setCancelando(true);
            try {
              await api.post('usuarios/updateSolicitudStatus', { uid_solicitud: sol.id, status: 'Cancelado' });
              seleccionRef.current = null;
              loadSolicitudes();
            } catch (e) {
              Alert.alert('No se pudo cancelar', 'Revisa tu conexión e inténtalo de nuevo.');
            } finally {
              cancelandoRef.current = false;
              setCancelando(false);
            }
          },
        },
      ],
    );
  };

  // ── Datos de la vista "En curso" ─────────────────────────────────────────
  const hayElegida = solicitudes.some(s => s.estado === 'aceptada');
  const pendientes = solicitudes
    .filter(s => ACCIONABLES.includes(s.estado))
    // Primero las que tienen precio, de menor a mayor; luego las de revisión.
    .sort((a, b) => (precioPropuesta(a) ?? Infinity) - (precioPropuesta(b) ?? Infinity));
  const conPrecio = pendientes.filter(s => precioPropuesta(s) != null);
  const idMasBarata = !hayElegida && conPrecio.length >= 2 ? conPrecio[0].id : null;
  const ordenActiva = [
    ...solicitudes.filter(s => s.estado === 'aceptada'),
    ...pendientes,
    ...solicitudes.filter(s => !ACCIONABLES.includes(s.estado) && s.estado !== 'aceptada'),
  ];
  const etapa = hayElegida ? 2 : pendientes.length ? 1 : 0;

  const renderActiva = () => {
    if (!solicitudEnEsperaData && !ordenActiva.length) {
      return (
        <EmptyState
          icon={ClipboardList}
          title="No tienes solicitudes en curso"
          message="Cuéntanos qué le pasa a tu carro y los talleres cercanos te mandan su precio."
          actionLabel="Pedir presupuesto"
          onAction={() => navigation.navigate('SolicitudServicio')}
        />
      );
    }
    return (
      <>
        {activas.length > 1 ? (
          <View style={{ marginBottom: space.m }}>
            <AppText variant="caption" color={colors.muted} style={{ marginBottom: space.xs }}>
              Tienes {activas.length} solicitudes en curso. Toca una para ver sus propuestas.
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activas.map(s => (
                <Chip
                  key={s.id}
                  label={s.codigo || sentenceCase(s.nombreSolicitud).slice(0, 24)}
                  selected={s.id === solicitudEnEsperaData?.id}
                  onPress={() => elegirSolicitud(s.id)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
        {solicitudEnEsperaData ? (
          <Card style={m.solicitud}>
            <View style={m.solicitudCabecera}>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" numberOfLines={2}>
                  {sentenceCase(solicitudEnEsperaData.nombreSolicitud)}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {[solicitudEnEsperaData.codigo, fechaCorta(solicitudEnEsperaData.fechaDate)].filter(Boolean).join(' · ')}
                </AppText>
              </View>
              {solicitudEnEsperaData.urgencia ? (
                <Tag
                  label={solicitudEnEsperaData.urgencia}
                  tone={solicitudEnEsperaData.urgencia === 'Emergencia' ? 'error' : solicitudEnEsperaData.urgencia === 'Urgente' ? 'warn' : 'neutral'}
                />
              ) : null}
            </View>
            <Progreso etapa={etapa} />
            {solicitudEnEsperaData.vehiculo ? (
              <View style={m.dato}>
                <Car size={16} color={colors.muted} strokeWidth={2.2} />
                <AppText variant="body" style={{ flex: 1 }}>
                  {solicitudEnEsperaData.vehiculo}
                </AppText>
              </View>
            ) : null}
            {solicitudEnEsperaData.descripcion ? (
              <AppText variant="body" color={colors.muted} numberOfLines={3} style={{ marginTop: space.xs }}>
                {solicitudEnEsperaData.descripcion}
              </AppText>
            ) : null}
            {solicitudEnEsperaData.fotos?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.s }}>
                {solicitudEnEsperaData.fotos.map((uri, i) => (
                  <Image key={`${uri}-${i}`} source={{ uri }} style={m.foto} />
                ))}
              </ScrollView>
            ) : null}
            {!pendientes.length && !hayElegida ? (
              <Banner
                tone="info"
                style={{ marginTop: space.m }}
                text="Esperando propuestas. Te avisamos cuando un taller responda. Si nadie responde en 3 días, la solicitud se cierra sola."
              />
            ) : null}
            <Button
              title="Cancelar solicitud"
              variant="ghost"
              size="m"
              icon={XCircle}
              loading={cancelando}
              onPress={() => cancelarSolicitud(solicitudEnEsperaData)}
              style={{ marginTop: space.s, alignSelf: 'flex-start' }}
            />
          </Card>
        ) : null}

        {errorPropuestas ? (
          <Banner
            tone="warn"
            text={errorPropuestas}
            actionLabel="Reintentar"
            onAction={loadSolicitudes}
            style={{ marginTop: space.m }}
          />
        ) : null}
        {ordenActiva.length ? (
          <View style={{ marginTop: space.l }}>
            <AppText variant="subtitle" accessibilityRole="header">
              {hayElegida ? 'Propuestas' : `Propuestas (${pendientes.length})`}
            </AppText>
            {pendientes.length > 1 && !hayElegida ? (
              <AppText variant="caption" color={colors.muted} style={{ marginTop: 2 }}>
                Ordenadas de menor a mayor precio.
              </AppText>
            ) : null}
            <View style={{ gap: space.m, marginTop: space.s }}>
              {ordenActiva.map(item => (
                <PropuestaCard
                  key={item.id}
                  item={item}
                  masBarata={item.id === idMasBarata}
                  bloqueada={hayElegida && item.estado !== 'aceptada'}
                  ocupada={accionEnCurso?.id === item.id ? accionEnCurso.accion : accionEnCurso ? 'otra' : null}
                  onElegir={() => elegirPropuesta(item)}
                  onRechazar={() => rechazarPropuesta(item)}
                  onVerTaller={() => verTaller(item.uid_taller)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderAceptadas = () =>
    solicitudes.length ? (
      <View style={{ gap: space.m }}>
        {solicitudes.map(item => (
          <Card key={item.id} style={m.propuesta}>
            <View style={m.solicitudCabecera}>
              <AppText variant="subtitle" style={{ flex: 1 }} numberOfLines={2}>
                {sentenceCase(item.nombreSolicitud)}
              </AppText>
              <Tag label="Aceptada" tone="ok" />
            </View>
            <AppText variant="caption" color={colors.muted}>
              {[item.codigo, item.vehiculo !== '—' ? item.vehiculo : ''].filter(Boolean).join(' · ')}
            </AppText>
            {item.nombre_taller ? (
              <View style={[m.dato, { marginTop: space.s }]}>
                <Store size={16} color={colors.muted} strokeWidth={2.2} />
                <AppText variant="body" style={{ flex: 1 }}>
                  {item.nombre_taller}
                </AppText>
                {precioPropuesta(item) != null ? (
                  <AppText variant="subtitle">{formatPrice(precioPropuesta(item))}</AppText>
                ) : null}
              </View>
            ) : null}
            {item.uid_taller ? (
              <Button
                title="Ver taller y contactar"
                variant="secondary"
                size="m"
                icon={Phone}
                onPress={() => verTaller(item.uid_taller)}
                style={{ marginTop: space.m }}
              />
            ) : null}
          </Card>
        ))}
      </View>
    ) : (
      <EmptyState
        icon={CheckCircle2}
        title="Aún no aceptaste ninguna propuesta"
        message="Cuando elijas un taller, la solicitud aparecerá aquí con sus datos de contacto."
      />
    );

  const renderCanceladas = () =>
    solicitudes.length ? (
      <View style={{ gap: space.m }}>
        {[...solicitudes]
          .sort((a, b) => (b.fechaDate?.getTime() || 0) - (a.fechaDate?.getTime() || 0))
          .map(item => (
            <Card key={item.id} style={m.propuesta}>
              <View style={m.solicitudCabecera}>
                <AppText variant="subtitle" style={{ flex: 1 }} numberOfLines={2}>
                  {sentenceCase(item.nombreSolicitud)}
                </AppText>
                <Tag label={item.estado === 'expirada' ? 'Vencida' : 'Cancelada'} tone="neutral" />
              </View>
              <AppText variant="caption" color={colors.muted}>
                {[item.codigo, fechaCorta(item.fechaDate)].filter(Boolean).join(' · ')}
              </AppText>
              {item.descripcion ? (
                <AppText variant="body" color={colors.muted} numberOfLines={3} style={{ marginTop: space.s }}>
                  {item.descripcion}
                </AppText>
              ) : null}
            </Card>
          ))}
      </View>
    ) : (
      <EmptyState
        icon={XCircle}
        title="No tienes solicitudes canceladas"
        message="Aquí aparecen las que canceles y las que se cierran solas porque ningún taller respondió en 3 días."
      />
    );

  return (
    <View style={m.pantalla}>
      <View style={[m.header, { paddingTop: insets.top + space.s }]}>
        <AppText variant="title" color={colors.onNavy} accessibilityRole="header">
          Mis solicitudes
        </AppText>
        <AppText variant="caption" color={colors.onNavyMuted}>
          Aquí ves las propuestas de los talleres y eliges una.
        </AppText>
        <Segmented options={VISTAS} value={vista} onChange={cambiarVista} style={{ marginTop: space.m }} />
      </View>

      <ScrollView
        contentContainerStyle={m.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.navy} />}>
        {error ? (
          <Banner
            tone="error"
            text={error}
            actionLabel="Reintentar"
            onAction={() => cargarVista(vista)}
            style={{ marginBottom: space.m }}
          />
        ) : null}
        {error && !solicitudes.length && !solicitudEnEsperaData ? null : loading && !solicitudes.length && !solicitudEnEsperaData ? (
          <View style={{ gap: space.m }}>
            <TallerCardSkeleton />
            <TallerCardSkeleton />
          </View>
        ) : vista === 'aceptadas' ? (
          renderAceptadas()
        ) : vista === 'canceladas' ? (
          renderCanceladas()
        ) : (
          renderActiva()
        )}
      </ScrollView>

      <BottomSheet visible={!!elegido} onClose={() => setElegido(null)} title={elegido?.esInspeccion ? '¡Revisión aceptada!' : '¡Taller elegido!'}>
        <View style={m.exitoIcono}>
          <CheckCircle2 size={36} color={colors.ok} strokeWidth={2.2} />
        </View>
        <AppText variant="subtitle" style={{ textAlign: 'center' }}>
          {elegido?.nombre_taller}
        </AppText>
        <AppText variant="body" color={colors.muted} style={{ textAlign: 'center', marginTop: space.xs }}>
          Ya le avisamos. Escríbele o llámalo para acordar el día y la hora
          {elegido?.esInspeccion ? ' de la revisión.' : '.'}
        </AppText>
        {elegido?.uid_taller ? (
          <Button
            title="Ver taller y contactar"
            variant="accent"
            icon={Phone}
            onPress={() => {
              const uid = elegido.uid_taller;
              setElegido(null);
              setTimeout(() => verTaller(uid), 150);
            }}
            style={{ marginTop: space.l }}
          />
        ) : null}
        <Button title="Cerrar" variant="ghost" onPress={() => setElegido(null)} style={{ marginTop: space.s }} />
      </BottomSheet>
    </View>
  );
};

const m = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: space.m,
    paddingBottom: space.m,
    borderBottomLeftRadius: radius.l,
    borderBottomRightRadius: radius.l,
  },
  lista: { padding: space.m, paddingBottom: space.xl * 3 },
  solicitud: { padding: space.m },
  solicitudCabecera: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s },
  progreso: { flexDirection: 'row', gap: space.xs, marginTop: space.m, marginBottom: space.s },
  progresoBarra: { height: 4, borderRadius: 2, backgroundColor: colors.border },
  progresoBarraOn: { backgroundColor: colors.yellow },
  dato: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: space.xs },
  foto: { width: 64, height: 64, borderRadius: radius.m, marginRight: space.s, backgroundColor: colors.bg },
  propuesta: { padding: space.m },
  propuestaElegida: { borderWidth: 2, borderColor: colors.ok },
  propuestaTaller: { flexDirection: 'row', alignItems: 'center', gap: space.s, minHeight: 44 },
  tallerIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginTop: space.s },
  precioFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.s },
  tiempo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  comentario: {
    marginTop: space.s,
    padding: space.s,
    borderRadius: radius.m,
    backgroundColor: colors.bg,
  },
  botones: { flexDirection: 'row', gap: space.s, marginTop: space.m },
  exitoIcono: { alignItems: 'center', marginBottom: space.s },
});

export default MisSolicitudesScreen;
