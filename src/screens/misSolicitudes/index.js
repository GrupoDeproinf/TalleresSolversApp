import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import appColors from '../../themes/appColors';
import styles from './style.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import Icons2 from 'react-native-vector-icons/FontAwesome';

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'cotizadas', label: 'Cotizadas' },
  { key: 'inspeccion_previa', label: 'Inspección' },
  { key: 'aceptadas', label: 'Aceptadas' },
  { key: 'rechazadas', label: 'Rechazadas' },
  { key: 'vencidas', label: 'Vencidas' },
];

const mapBackendStatusToInternal = statusText => {
  if (!statusText) {
    return 'enviada';
  }

  const normalized = statusText.toLowerCase();

  if (normalized.includes('espera') && (normalized.includes('aprobación') || normalized.includes('aprobacion'))) {
    return 'enviada';
  }
  if (normalized.includes('respuesta')) {
    return 'con_respuestas';
  }
  if (normalized.includes('cotiz')) {
    return 'cotizada';
  }
  if (normalized.includes('inspecc')) {
    return 'inspeccion_previa';
  }
  if (normalized.includes('aceptad')) {
    return 'aceptada';
  }
  if (normalized.includes('rechaz')) {
    return 'rechazada';
  }
  if (normalized.includes('cancel')) {
    return 'cancelada';
  }
  if (normalized.includes('expir')) {
    return 'expirada';
  }

  return 'enviada';
};

const formatFechaSolicitud = fecha_solicitud => {
  if (!fecha_solicitud || typeof fecha_solicitud._seconds !== 'number') {
    return { fechaTexto: '', fechaDate: null };
  }

  const fechaDate = new Date(fecha_solicitud._seconds * 1000);
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

const formatPrecioDisplay = value => {
  if (value == null || value === '') return '—';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '—';
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getStatusStyle = estado => {
  switch (estado) {
    case 'enviada':
      return {
        chip: { backgroundColor: '#FEF3C7' },
        text: { color: '#B45309' },
        label: 'Enviada',
      };
    case 'con_respuestas':
      return {
        chip: { backgroundColor: '#E0F2FE' },
        text: { color: '#0369A1' },
        label: 'Con respuestas',
      };
    case 'cotizada':
      return {
        chip: { backgroundColor: '#E0F2FE' },
        text: { color: '#0369A1' },
        label: 'Cotizada',
      };
    case 'inspeccion_previa':
      return {
        chip: { backgroundColor: '#FEF3C7' },
        text: { color: '#B45309' },
        label: 'Inspección',
      };
    case 'rechazada':
      return {
        chip: { backgroundColor: '#FEE2E2' },
        text: { color: '#B91C1C' },
        label: 'Rechazada',
      };
    case 'aceptada':
      return {
        chip: { backgroundColor: '#DCFCE7' },
        text: { color: '#15803D' },
        label: 'Aceptada',
      };
    case 'cancelada':
      return {
        chip: { backgroundColor: '#F3F4F6' },
        text: { color: '#4B5563' },
        label: 'Cancelada',
      };
    case 'expirada':
      return {
        chip: { backgroundColor: '#DCFCE7' },
        text: { color: '#15803D' },
        label: 'Expirada',
      };
    default:
      return {
        chip: { backgroundColor: '#F3F4F6' },
        text: { color: '#4B5563' },
        label: estado || '—',
      };
  }
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

/** Texto del aviso de inspección previa (lista y modal). */
const inspeccionPreviaMensaje = nombreTaller => {
  const n = String(nombreTaller ?? '').trim();
  if (n) {
    return { tipo: 'con_nombre', nombre: n };
  }
  return { tipo: 'sin_nombre' };
};

const mapPropuestaToCard = (p, solicitudEnEspera) => {
  const fechaRaw = p.fecha_propuesta || p.fecha_solicitud || p.fecha;
  const { fechaTexto, fechaDate } = fechaRaw && typeof fechaRaw._seconds === 'number'
    ? formatFechaSolicitud(fechaRaw)
    : { fechaTexto: p.fecha_texto || '', fechaDate: null };
  const vehiculo = p.vehiculo || solicitudEnEspera?.vehiculo || '';
  const vehiculoStr = typeof vehiculo === 'string'
    ? vehiculo
    : (vehiculo.vehiculo_marca || '') + ' ' + (vehiculo.vehiculo_modelo || '') + (vehiculo.vehiculo_anio ? ` (${vehiculo.vehiculo_anio})` : '');
  return {
    id: p.id || p.uid || String(Math.random()),
    nombreSolicitud: p.nombre_servicio || p.nombre_solicitud || solicitudEnEspera?.nombreSolicitud || 'Propuesta',
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

const MisSolicitudesScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('todas');
  const [solicitudEnEsperaData, setSolicitudEnEsperaData] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [cardDetailVisible, setCardDetailVisible] = useState(false);
  const [cardDetailItem, setCardDetailItem] = useState(null);
  const [loadingPropuestaAction, setLoadingPropuestaAction] = useState(false);
  const [rejectingPropuestaId, setRejectingPropuestaId] = useState(null);
  const [loadingCancelSolicitud, setLoadingCancelSolicitud] = useState(false);
  const [successAceptadaVisible, setSuccessAceptadaVisible] = useState(false);
  const [successAceptadaData, setSuccessAceptadaData] = useState({
    nombre_taller: '',
    uid_taller: null,
  });
  const successAnim = useState(new Animated.Value(0))[0];

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid;

      if (!uid) {
        setSolicitudEnEsperaData(null);
        setSolicitudes([]);
        setError('No se encontró el usuario para cargar las solicitudes.');
        return;
      }

      const response = await api.post('usuarios/getSolicitudesByUsuario', {
        uid_usuario: uid,
        solo_ultima: true,
        status: 'En espera por aprobación',
      });

      const raw = response.data;
      const singleItem = raw && typeof raw === 'object' && !Array.isArray(raw) && raw.id
        ? raw
        : Array.isArray(raw) && raw.length > 0
        ? raw[0]
        : null;

      let uid_solicitud = singleItem?.id ?? null;
      if (singleItem) {
        const mappedTop = mapItemToSolicitud(singleItem);
        setSolicitudEnEsperaData(mappedTop);
      } else {
        setSolicitudEnEsperaData(null);
        // Sin solicitud "en espera": intentar obtener última solicitud para cargar propuestas en los filtros
        try {
          const listRes = await api.post('usuarios/getSolicitudesByUsuario', {
            uid_usuario: uid,
            solo_ultima: false,
          });
          const list = Array.isArray(listRes.data) ? listRes.data : listRes.data && listRes.data.length > 0 ? listRes.data : [];
          const ultima = list.length > 0 ? list[0] : null;
          uid_solicitud = ultima?.id ?? null;
        } catch (_) {
          uid_solicitud = null;
        }
      }

      // Llenar los filtros (Todas, Cotizadas, Inspección) con usuarios/getPropuestasBySolicitud
      if (uid_solicitud) {
        try {
          const propuestasRes = await api.post('usuarios/getPropuestasBySolicitud', {
            uid_solicitud,
          });

          console.log("propuestasRes", propuestasRes.data);
          const propuestasList = Array.isArray(propuestasRes.data) ? propuestasRes.data : [];
          const mappedTop = singleItem ? mapItemToSolicitud(singleItem) : null;
          const mappedPropuestas = propuestasList.map(p => mapPropuestaToCard(p, mappedTop));
          setSolicitudes(mappedPropuestas);
        } catch (_e) {
          setSolicitudes([]);
        }
      } else {
        setSolicitudes([]);
      }
    } catch (e) {
      setSolicitudEnEsperaData(null);
      setSolicitudes([]);
      setError('Ocurrió un error al cargar tus solicitudes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAceptadas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid;

      if (!uid) {
        setSolicitudes([]);
        setError(
          'No se encontró el usuario para cargar las solicitudes aceptadas.',
        );
        return;
      }

      const response = await api.post('usuarios/getSolicitudesByUsuario', {
        uid_usuario: uid,
        status: 'Aceptada',
      });

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data && data.length > 0
        ? data
        : [];

      const mapped = list.map(p => mapPropuestaToCard(p, null));
      setSolicitudes(mapped);
    } catch (e) {
      setSolicitudes([]);
      setError(
        'Ocurrió un error al cargar las solicitudes aceptadas. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVencidas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid;

      if (!uid) {
        setSolicitudes([]);
        setError(
          'No se encontró el usuario para cargar las solicitudes vencidas.',
        );
        return;
      }

      const response = await api.post('usuarios/getSolicitudesByUsuario', {
        uid_usuario: uid,
        status: 'Cancelado',
      });

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && data.id
        ? [data]
        : [];

      const mapped = list.map(item => ({
        ...mapItemToSolicitud(item),
        esCardVencida: true,
      }));
      setSolicitudes(mapped);
    } catch (e) {
      setSolicitudes([]);
      setError(
        'Ocurrió un error al cargar las solicitudes canceladas. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setActiveTab('todas');
    loadSolicitudes();
  }, [loadSolicitudes]);

  useEffect(() => {
    loadSolicitudes();
  }, [loadSolicitudes]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'aceptadas') {
        loadAceptadas();
      } else if (activeTab === 'vencidas') {
        loadVencidas();
      } else {
        loadSolicitudes();
      }
    }, [activeTab, loadAceptadas, loadVencidas, loadSolicitudes]),
  );

  const openCancelModal = useCallback(item => {
    setSolicitudSeleccionada(item);
    setCancelModalVisible(true);
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModalVisible(false);
    setSolicitudSeleccionada(null);
  }, []);

  const openCardDetail = useCallback(item => {
    setCardDetailItem(item);
    setCardDetailVisible(true);
  }, []);

  const closeCardDetail = useCallback(() => {
    setCardDetailVisible(false);
    setCardDetailItem(null);
    setLoadingPropuestaAction(false);
  }, []);

  const openTallerInfo = useCallback(() => {
    if (!cardDetailItem?.uid_taller) return;
    setCardDetailVisible(false);
    setTimeout(() => {
      navigation.navigate('TallerDetail', { tallerId: cardDetailItem.uid_taller });
    }, 150);
  }, [cardDetailItem, navigation]);

  const openTallerInfoByUid = useCallback(
    uid => {
      if (!uid) return;
      setSuccessAceptadaVisible(false);
      setTimeout(() => {
        navigation.navigate('TallerDetail', { tallerId: uid });
      }, 130);
    },
    [navigation],
  );

  useEffect(() => {
    if (!successAceptadaVisible) {
      successAnim.setValue(0);
      return;
    }
    Animated.spring(successAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 13,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [successAceptadaVisible, successAnim]);

  const handleAceptarTaller = useCallback(async () => {
    if (!cardDetailItem?.id || loadingPropuestaAction) return;
    try {
      setLoadingPropuestaAction(true);
      console.log('cardDetailItem', cardDetailItem);
      await api.post('usuarios/updatePropuesta', {
        uid_propuesta: cardDetailItem.id,
        status: 'aceptada',
      });
      setSuccessAceptadaData({
        nombre_taller: cardDetailItem?.nombre_taller || 'el taller seleccionado',
        uid_taller: cardDetailItem?.uid_taller || null,
      });
      closeCardDetail();
      loadSolicitudes();
      setTimeout(() => {
        setSuccessAceptadaVisible(true);
      }, 180);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo aceptar el taller.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingPropuestaAction(false);
    }
  }, [closeCardDetail, loadSolicitudes, cardDetailItem, loadingPropuestaAction]);

  const handleRechazarTaller = useCallback(async () => {
    if (!cardDetailItem?.id || loadingPropuestaAction) return;
    try {
      setLoadingPropuestaAction(true);
      console.log('cardDetailItem', cardDetailItem);
      await api.post('usuarios/updatePropuesta', {
        uid_propuesta: cardDetailItem.id,
        status: 'rechazada',
      });
      closeCardDetail();
      loadSolicitudes();
      Alert.alert('Listo', 'Has rechazado este taller.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'No se pudo rechazar el taller.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingPropuestaAction(false);
    }
  }, [closeCardDetail, loadSolicitudes, cardDetailItem, loadingPropuestaAction]);

  const onPressAceptarTaller = useCallback(() => {
    Alert.alert(
      'Aceptar taller',
      '¿Deseas aceptar este taller para tu solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, aceptar', onPress: handleAceptarTaller },
      ]
    );
  }, [handleAceptarTaller]);

  const onPressRechazarTaller = useCallback(() => {
    Alert.alert(
      'Rechazar taller',
      '¿Deseas rechazar este taller?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, rechazar', onPress: handleRechazarTaller },
      ]
    );
  }, [handleRechazarTaller]);

  const onPressRechazarPropuestaFromCard = useCallback((item) => {
    if (!item?.id) return;
    Alert.alert(
      'Rechazar propuesta',
      '¿Deseas rechazar esta propuesta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, rechazar',
          onPress: async () => {
            try {
              setRejectingPropuestaId(item.id);
              await api.post('usuarios/updatePropuesta', {
                uid_propuesta: item.id,
                status: 'rechazada',
              });
              loadSolicitudes();
              Alert.alert('Listo', 'Has rechazado esta propuesta.');
            } catch (e) {
              const msg = e?.response?.data?.message || e?.message || 'No se pudo rechazar la propuesta.';
              Alert.alert('Error', msg);
            } finally {
              setRejectingPropuestaId(null);
            }
          },
        },
      ]
    );
  }, [loadSolicitudes]);

  const confirmCancelSolicitud = useCallback(async () => {
    if (!solicitudSeleccionada) {
      return;
    }

    try {
      setLoadingCancelSolicitud(true);
      await api.post('usuarios/updateSolicitudStatus', {
        uid_solicitud: solicitudSeleccionada.id,
        status: 'Cancelado',
      });

      if (solicitudEnEsperaData && solicitudEnEsperaData.id === solicitudSeleccionada.id) {
        setSolicitudEnEsperaData(null);
      } else {
        setSolicitudes(prev =>
          prev.map(s =>
            s.id === solicitudSeleccionada.id ? { ...s, estado: 'cancelada' } : s,
          ),
        );
      }

      closeCancelModal();
      loadSolicitudes();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo cancelar la solicitud. Intenta nuevamente.';
      Alert.alert('Error', msg);
    } finally {
      setLoadingCancelSolicitud(false);
    }
  }, [closeCancelModal, loadSolicitudes, solicitudSeleccionada, solicitudEnEsperaData]);

  const detailInspeccionMsg = useMemo(
    () => inspeccionPreviaMensaje(cardDetailItem?.nombre_taller),
    [cardDetailItem?.nombre_taller],
  );

  const filteredSolicitudes = useMemo(() => {
    let base = solicitudes;

    if (activeTab === 'cotizadas') {
      base = solicitudes.filter(s => s.estado === 'cotizada');
    } else if (activeTab === 'inspeccion_previa') {
      base = solicitudes.filter(s => s.estado === 'inspeccion_previa');
    } else if (activeTab === 'rechazadas') {
      base = solicitudes.filter(s => s.estado === 'rechazada');
    } else if (activeTab === 'aceptadas') {
      base = solicitudes.filter(s => s.estado === 'aceptada');
    } else if (activeTab === 'vencidas') {
      base = solicitudes.filter(s => s.estado === 'cancelada');
    }
    // activeTab === 'todas' → mostrar todas

    return [...base].sort((a, b) => {
      const timeA = a.fechaDate ? a.fechaDate.getTime() : 0;
      const timeB = b.fechaDate ? b.fechaDate.getTime() : 0;
      return timeB - timeA;
    });
  }, [activeTab, solicitudes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Mis solicitudes</Text>
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
        </View>
        <Text style={styles.headerSubtitle}>
          Consulta el estado de los servicios que has solicitado.
        </Text>
      </View>

      {/* Mitad superior: solicitud en espera de aprobación */}
      <View style={styles.topHalf}>
        <Text style={styles.topHalfTitle}>
          Enviada y en espera por respuesta de talleres
        </Text>
        {loading && !solicitudEnEsperaData ? (
          <View style={styles.enEsperaEmpty}>
            <ActivityIndicator size="small" color={appColors.primary} />
            <Text style={[styles.enEsperaEmptyText, { marginTop: 4 }]}>
              Cargando tu última solicitud enviada...
            </Text>
          </View>
        ) : solicitudEnEsperaData ? (
          <View style={styles.enEsperaCard}>
            <View style={styles.enEsperaHeaderRow}>
              <View style={styles.enEsperaBadge}>
                <Text style={styles.enEsperaBadgeText}>Enviada</Text>
              </View>
              <TouchableOpacity
                style={styles.cancelTopBtn}
                activeOpacity={0.85}
                onPress={() => openCancelModal(solicitudEnEsperaData)}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={16}
                  color={appColors.red || '#EF4444'}
                />
                <Text style={styles.cancelTopBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.enEsperaServiceName} numberOfLines={1}>
              {solicitudEnEsperaData.nombreSolicitud}
            </Text>
            {(solicitudEnEsperaData.fotos && solicitudEnEsperaData.fotos.length > 0) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.enEsperaFotosScroll}
                contentContainerStyle={styles.enEsperaFotosContent}>
                {solicitudEnEsperaData.fotos.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.enEsperaFoto}
                  />
                ))}
              </ScrollView>
            )}
            <Text style={styles.enEsperaMetaText}>{solicitudEnEsperaData.fecha}</Text>
            <Text style={styles.enEsperaVehicleText}>{solicitudEnEsperaData.vehiculo}</Text>
            <Text style={styles.enEsperaDescText} numberOfLines={2}>
              {solicitudEnEsperaData.descripcion}
            </Text>
          </View>
        ) : (
          <View style={styles.enEsperaEmpty}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={32}
              color={appColors.subtitle}
            />
            <Text style={[styles.enEsperaEmptyText, { marginTop: 4 }]}>
              No tienes solicitudes en espera de aprobación.
            </Text>
          </View>
        )}
      </View>

      {/* Mitad inferior: tabs + listado */}
      <View style={styles.bottomHalf}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsRowScroll}
          contentContainerStyle={styles.tabsRowContent}
          nestedScrollEnabled>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'aceptadas') {
                    loadAceptadas();
                  } else if (tab.key === 'vencidas') {
                    loadVencidas();
                  } else {
                    loadSolicitudes();
                  }
                }}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.tabChipLabel,
                    isActive && styles.tabChipLabelActive,
                  ]}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredSolicitudes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={56}
              color={appColors.subtitle}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'vencidas'
                ? 'No tienes solicitudes canceladas'
                : 'Aún no tienes propuestas'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'vencidas'
                ? 'Las solicitudes que canceles o que expiren aparecerán aquí.'
                : 'Cuando crees una solicitud de servicio, aqui apareceran las propuestas de los talleres '}
            </Text>
          </View>
        ) : (
          filteredSolicitudes.map(item => {
            const statusStyle = getStatusStyle(item.estado);
            const mostrarCancelar = item.estado === 'inspeccion_previa' || item.estado === 'cotizada';
            const inspeccionMsg = inspeccionPreviaMensaje(item.nombre_taller);
            const chipVencida = getStatusStyle('cancelada');

            if (activeTab === 'vencidas' || item.esCardVencida) {
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => openCardDetail(item)}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.cardStatusPill, chipVencida.chip]}>
                      <Text style={[styles.cardStatusPillText, chipVencida.text]}>Vencida</Text>
                    </View>
                  </View>
                  <View style={styles.cardInfoBlock}>
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="file-document-outline" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Nombre solicitud</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={2}>
                        {item.nombre_solicitud || item.nombreSolicitud || '—'}
                      </Text>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="calendar-outline" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Fecha solicitud</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={1}>
                        {item.fecha_solicitud || item.fecha || '—'}
                      </Text>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Fecha vencido</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={1}>
                        {item.fecha_vencido || '—'}
                      </Text>
                    </View>
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="text-box-outline" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Descripción</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={4}>
                        {(item.descripcion || '').trim() || '—'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => openCardDetail(item)}>
                {item.estado !== 'inspeccion_previa' || item.tiempo_estimado ? (
                  <View style={styles.cardTopRow}>
                    {item.estado !== 'inspeccion_previa' ? (
                      <View style={[styles.cardStatusPill, statusStyle.chip]}>
                        <Text style={[styles.cardStatusPillText, statusStyle.text]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                    {item.tiempo_estimado ? (
                      <View style={styles.cardTiempoEstimadoCaja}>
                        <Text style={styles.cardTiempoEstimado}>{item.tiempo_estimado}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {item.estado === 'inspeccion_previa' ? (
                  <View style={styles.cardInspeccionBanner}>
                    <MaterialCommunityIcons
                      name="clipboard-search-outline"
                      size={20}
                      color="#D97706"
                      style={styles.cardInspeccionBannerIcon}
                    />
                    {inspeccionMsg.tipo === 'con_nombre' ? (
                      <Text style={styles.cardInspeccionBannerText}>
                        El taller{' '}
                        <Text style={styles.cardInspeccionBannerName}>
                          {inspeccionMsg.nombre}
                        </Text>{' '}
                        ha solicitado una inspección previa.
                      </Text>
                    ) : (
                      <Text style={styles.cardInspeccionBannerText}>
                        Un taller ha solicitado una inspección previa para esta
                        propuesta.
                      </Text>
                    )}
                  </View>
                ) : null}

                <View style={styles.cardInfoBlock}>
                  <View style={styles.cardInfoItem}>
                    <MaterialCommunityIcons name="calendar-outline" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                    <Text style={styles.cardInfoLabel}>Fecha</Text>
                    <Text style={styles.cardInfoValue} numberOfLines={1}>{item.fecha || '—'}</Text>
                  </View>
                  {item.nombre_taller ? (
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="storefront-outline" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Taller</Text>
                      <Text style={styles.cardInfoValue} numberOfLines={1}>{item.nombre_taller}</Text>
                    </View>
                  ) : null}
                  {item.precio_estimado != null && item.precio_estimado !== '' ? (
                    <View style={styles.cardInfoItem}>
                      <MaterialCommunityIcons name="cash" size={18} color={appColors.primary} style={styles.cardInfoIcon} />
                      <Text style={styles.cardInfoLabel}>Precio estimado</Text>
                      <Text style={styles.cardInfoValuePrecio}>${formatPrecioDisplay(item.precio_estimado)}</Text>
                    </View>
                  ) : null}
                </View>

                {item.comentario ? (
                  <View style={styles.cardComentarioBox}>
                    <MaterialCommunityIcons name="comment-text-outline" size={14} color={appColors.subtitle} style={styles.cardComentarioIcon} />
                    <View style={styles.cardComentarioContent}>
                      <Text style={styles.cardComentarioLabel}>Comentario del taller</Text>
                      <Text style={styles.cardComentarioText} numberOfLines={3}>{item.comentario}</Text>
                    </View>
                  </View>
                ) : null}

                {mostrarCancelar && (
                  <TouchableOpacity
                    style={styles.cancelCardBtn}
                    activeOpacity={0.85}
                    disabled={rejectingPropuestaId === item.id}
                    onPress={() => onPressRechazarPropuestaFromCard(item)}>
                    {rejectingPropuestaId === item.id ? (
                      <ActivityIndicator size="small" color={appColors.red || '#EF4444'} />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="close-circle-outline"
                          size={18}
                          color={appColors.red || '#EF4444'}
                        />
                        <Text style={styles.cancelCardBtnText}>Rechazar propuesta</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
        </ScrollView>
      </View>

      {/* Modal detalle del card: información + Aceptar taller / Rechazar */}
      <Modal
        visible={cardDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCardDetail}>
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModalCard}>
            <Text style={styles.detailModalTitle}>
              {cardDetailItem?.esCardVencida ? 'Detalle de la solicitud' : 'Detalle de la propuesta'}
            </Text>
            {cardDetailItem && (
              <ScrollView style={styles.detailModalScroll} showsVerticalScrollIndicator={false}>
                {cardDetailItem.esCardVencida ? (
                  <>
                    <View style={[styles.detailModalPill, getStatusStyle('cancelada').chip]}>
                      <Text style={[styles.detailModalPillText, getStatusStyle('cancelada').text]}>
                        Vencida
                      </Text>
                    </View>
                    <View style={styles.detailModalRow}>
                      <Text style={styles.detailModalLabel}>Nombre solicitud</Text>
                      <Text style={styles.detailModalValue}>
                        {cardDetailItem.nombre_solicitud || cardDetailItem.nombreSolicitud || '—'}
                      </Text>
                    </View>
                    <View style={styles.detailModalRow}>
                      <Text style={styles.detailModalLabel}>Fecha solicitud</Text>
                      <Text style={styles.detailModalValue}>
                        {cardDetailItem.fecha_solicitud || cardDetailItem.fecha || '—'}
                      </Text>
                    </View>
                    <View style={styles.detailModalRow}>
                      <Text style={styles.detailModalLabel}>Fecha vencido</Text>
                      <Text style={styles.detailModalValue}>
                        {cardDetailItem.fecha_vencido || '—'}
                      </Text>
                    </View>
                    <View style={styles.detailModalComentarioBox}>
                      <Text style={styles.detailModalComentarioLabel}>Descripción</Text>
                      <Text style={styles.detailModalComentarioText}>
                        {(cardDetailItem.descripcion || '').trim() || '—'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                {cardDetailItem.estado !== 'inspeccion_previa' ? (
                  <View style={[styles.detailModalPill, getStatusStyle(cardDetailItem.estado).chip]}>
                    <Text style={[styles.detailModalPillText, getStatusStyle(cardDetailItem.estado).text]}>
                      {getStatusStyle(cardDetailItem.estado).label}
                    </Text>
                  </View>
                ) : null}
                {cardDetailItem.estado === 'inspeccion_previa' ? (
                  <View style={styles.detailModalInspeccionBanner}>
                    <MaterialCommunityIcons
                      name="clipboard-search-outline"
                      size={22}
                      color="#D97706"
                      style={styles.detailModalInspeccionBannerIcon}
                    />
                    {detailInspeccionMsg.tipo === 'con_nombre' ? (
                      <Text style={styles.detailModalInspeccionBannerText}>
                        El taller{' '}
                        <Text style={styles.detailModalInspeccionBannerName}>
                          {detailInspeccionMsg.nombre}
                        </Text>{' '}
                        ha solicitado una inspección previa.
                      </Text>
                    ) : (
                      <Text style={styles.detailModalInspeccionBannerText}>
                        Un taller ha solicitado una inspección previa para esta
                        propuesta.
                      </Text>
                    )}
                  </View>
                ) : null}
                <View style={styles.detailModalRow}>
                  <Text style={styles.detailModalLabel}>Fecha</Text>
                  <Text style={styles.detailModalValue}>{cardDetailItem.fecha || '—'}</Text>
                </View>
                {cardDetailItem.nombre_taller ? (
                  <View style={styles.detailModalRow}>
                    <Text style={styles.detailModalLabel}>Taller</Text>
                      <Text style={styles.detailModalValue}>{cardDetailItem.nombre_taller}</Text>
                  </View>
                ) : null}
                {cardDetailItem.precio_estimado != null && cardDetailItem.precio_estimado !== '' ? (
                  <View style={styles.detailModalRow}>
                    <Text style={styles.detailModalLabel}>Precio estimado</Text>
                    <Text style={styles.detailModalValuePrecio}>${formatPrecioDisplay(cardDetailItem.precio_estimado)}</Text>
                  </View>
                ) : null}
                {cardDetailItem.tiempo_estimado ? (
                  <View style={styles.detailModalRow}>
                    <Text style={styles.detailModalLabel}>Tiempo estimado</Text>
                    <Text style={styles.detailModalValue}>{cardDetailItem.tiempo_estimado}</Text>
                  </View>
                ) : null}
                {cardDetailItem.comentario ? (
                  <View style={styles.detailModalComentarioBox}>
                    <Text style={styles.detailModalComentarioLabel}>Revisión</Text>
                    <Text style={styles.detailModalComentarioText}>{cardDetailItem.comentario}</Text>
                  </View>
                ) : null}
                  </>
                )}
              </ScrollView>
            )}
            {(cardDetailItem?.estado === 'cotizada' || cardDetailItem?.estado === 'inspeccion_previa') && (
              <View style={styles.detailModalButtonsRow}>
                {loadingPropuestaAction ? (
                  <View style={styles.detailModalLoadingWrap}>
                    <ActivityIndicator size="small" color={appColors.primary} />
                    <Text style={styles.detailModalLoadingText}>Procesando...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.detailModalBtnRechazar}
                      activeOpacity={0.85}
                      onPress={onPressRechazarTaller}>
                      <Text style={styles.detailModalBtnRechazarText}>Rechazar taller</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.detailModalBtnAceptar}
                      activeOpacity={0.9}
                      onPress={onPressAceptarTaller}>
                      <Text style={styles.detailModalBtnAceptarText}>Aceptar taller</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            {(cardDetailItem?.estado === 'aceptada' ||
              cardDetailItem?.estado === 'cotizada' ||
              cardDetailItem?.estado === 'inspeccion_previa') &&
            cardDetailItem?.uid_taller ? (
              <TouchableOpacity
                style={styles.detailModalTallerProfileBtn}
                activeOpacity={0.9}
                onPress={openTallerInfo}>
                <View style={styles.detailModalTallerProfileIconWrap}>
                  <MaterialCommunityIcons name="storefront-outline" size={18} color="#1F2344" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailModalTallerProfileTitle}>Ver perfil del taller</Text>
                  <Text style={styles.detailModalTallerProfileSubtitle}>
                    {cardDetailItem?.estado === 'aceptada'
                      ? `Comunícate con ${cardDetailItem?.nombre_taller || 'este taller'} para coordinar la visita.`
                      : `Revisa el perfil de ${cardDetailItem?.nombre_taller || 'este taller'} para coordinar la solicitud.`}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#1F2344" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.detailModalCerrarLink} onPress={closeCardDetail} activeOpacity={0.8}>
              <Text style={styles.detailModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}>
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalCard}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={40}
              color={appColors.red || '#EF4444'}
            />
            <Text style={styles.cancelModalTitle}>Cancelar solicitud</Text>
            <Text style={styles.cancelModalSubtitle}>
              ¿Estás seguro de que deseas cancelar esta solicitud?
            </Text>
            {solicitudSeleccionada && (
              <Text style={styles.cancelModalServiceName} numberOfLines={2}>
                {solicitudSeleccionada.nombreSolicitud}
              </Text>
            )}
            <View style={styles.cancelModalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelModalSecondaryBtn}
                activeOpacity={0.85}
                disabled={loadingCancelSolicitud}
                onPress={closeCancelModal}>
                <Text style={styles.cancelModalSecondaryText}>No, volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelModalPrimaryBtn}
                activeOpacity={0.9}
                disabled={loadingCancelSolicitud}
                onPress={confirmCancelSolicitud}>
                {loadingCancelSolicitud ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.cancelModalPrimaryText}>Sí, cancelar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successAceptadaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessAceptadaVisible(false)}>
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.88, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.successIconWrap}>
              <MaterialCommunityIcons name="check-bold" size={24} color="#1F2344" />
            </View>
            <Text style={styles.successTitle}>¡Taller aceptado con éxito!</Text>
            <Text style={styles.successMainText} numberOfLines={2}>
              {successAceptadaData?.nombre_taller || 'Taller seleccionado'}
            </Text>
            <Text style={styles.successSubText}>
              Ya puedes revisar el perfil del taller, conocer todos sus detalles y comunicarte directamente para coordinar la visita, aclarar cualquier duda y avanzar con tu solicitud de forma segura.
            </Text>

            <TouchableOpacity
              style={styles.successPrimaryBtn}
              activeOpacity={0.9}
              onPress={() => openTallerInfoByUid(successAceptadaData?.uid_taller)}>
              <MaterialCommunityIcons name="storefront-outline" size={18} color="#1F2344" />
              <Text style={styles.successPrimaryBtnText}>Ver perfil del taller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successSecondaryBtn}
              activeOpacity={0.85}
              onPress={() => setSuccessAceptadaVisible(false)}>
              <Text style={styles.successSecondaryBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default MisSolicitudesScreen;

