import {
  Animated,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import DatePicker from 'react-native-date-picker';
import styles from './style.css.js';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons5 from 'react-native-vector-icons/FontAwesome5';
import Geolocation from '@react-native-community/geolocation';
import notImageFound from '../../assets/noimageNew.png';

/** Convierte createdAt (Firestore timestamp, ISO string o número) a Date */
const parseCreatedAt = raw => {
  if (!raw) return null;
  if (typeof raw === 'object' && typeof raw._seconds === 'number')
    return new Date(raw._seconds * 1000);
  if (typeof raw === 'number')
    return new Date(raw > 1e12 ? raw : raw * 1000);
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = date => {
  if (!date) return null;
  const d = date.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});
  const t = date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
  return `${d} ${t}`;
};

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth() &&
    d1.getDate()     === d2.getDate()
  );
};

const toRad = v => (v * Math.PI) / 180;
const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      pos => resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude}),
      () => resolve(null),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  });
};

const STATUS_DOT = {
  Aprobado: { color: '#22C55E', label: 'Aprobado' },
  Pendiente: { color: '#F59E0B', label: 'Pendiente' },
  Rechazado: { color: '#EF4444', label: 'Rechazado' },
};

const TallerCard = ({item, onPress}) => {
  const statusDot = STATUS_DOT[item.status] || null;
  const hasImage = item.image_perfil && item.image_perfil !== '';
  const categoria = item.tipo || item.categoria || 'General';
  const km = item.km_distance != null ? (item.km_distance < 1 ? `${Math.round(item.km_distance * 1000)} m` : `${item.km_distance.toFixed(1)} km`) : null;
  const suscripcion = item.subscripcion_actual || null;
  const suscripcionActiva = suscripcion?.status === 'Aprobado';
  const createdDate = parseCreatedAt(item.createdAt);
  const createdLabel = formatDate(createdDate);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.88}>
      {/* Imagen */}
      <View style={styles.cardImageWrap}>
        <Image
          style={styles.cardImage}
          source={hasImage ? {uri: item.image_perfil} : notImageFound}
          resizeMode={hasImage ? 'cover' : 'contain'}
        />
      </View>

      {/* Contenido */}
      <View style={styles.cardBody}>
        {/* Fila badge + status */}
        <View style={styles.cardTopRow}>
          {!!item.estado && (
            <View style={styles.cardCategoriaBadge}>
              <Text style={styles.cardCategoriaText}>{item.estado}</Text>
            </View>
          )}
          {suscripcion?.nombre ? (
            <View style={[styles.cardPlanBadge, {backgroundColor: suscripcionActiva ? '#E3F2FD' : '#FEF9C3'}]}>
              <Text style={[styles.cardPlanText, {color: suscripcionActiva ? '#1565C0' : '#B45309'}]}>
                {suscripcion.nombre}{' '}
                <Text style={styles.cardPlanStatus}>({suscripcion.status})</Text>
              </Text>
            </View>
          ) : (
            <View style={[styles.cardPlanBadge, {backgroundColor: '#F1F3F9'}]}>
              <Text style={[styles.cardPlanText, {color: '#9BA6B8'}]}>Sin plan</Text>
            </View>
          )}
          {statusDot && (
            <View style={styles.cardStatusRow}>
              <View style={[styles.cardStatusDot, {backgroundColor: statusDot.color}]} />
              <Text style={[styles.cardStatusLabel, {color: statusDot.color}]}>{statusDot.label}</Text>
            </View>
          )}
        </View>

        {/* Nombre */}
        <Text style={styles.cardName} numberOfLines={1}>
          {item.nombre || 'Sin nombre'}
        </Text>

        {/* Teléfono */}
        {!!item.phone && (
          <View style={styles.cardInfoRow}>
            <Icons5 name="phone-alt" size={10} color="#9BA6B8" />
            <Text style={styles.cardInfoText} numberOfLines={1}>{item.phone}</Text>
          </View>
        )}

        {/* RIF */}
        {!!item.rif && (
          <View style={styles.cardInfoRow}>
            <Icons5 name="id-card" size={10} color="#9BA6B8" />
            <Text style={styles.cardInfoText} numberOfLines={1}>RIF: {item.rif}</Text>
          </View>
        )}

        {/* Distancia + Fecha */}
        <View style={styles.cardBottomRow}>
          {km && (
            <View style={styles.cardKmBadge}>
              <Icons5 name="route" size={9} color="#2D3261" />
              <Text style={styles.cardKmText}>{km}</Text>
            </View>
          )}
          {createdLabel && (
            <View style={styles.cardDateBadge}>
              <Icons5 name="calendar-alt" size={9} color="#9BA6B8" />
              <Text style={styles.cardDateText}>{createdLabel}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Flecha */}
      <View style={styles.cardArrow}>
        <Icons5 name="chevron-right" size={12} color="#2D3261" />
      </View>
    </TouchableOpacity>
  );
};

const DISTANCIA_OPTS = [
  {key: 'asc',  label: 'Más cercanos', icon: 'sort-amount-up-alt'},
  {key: 'desc', label: 'Más lejanos',  icon: 'sort-amount-down-alt'},
];

const PLAN_OPTS = [
  {key: 'con_plan',  label: 'Con plan'},
  {key: 'sin_plan',  label: 'Sin plan'},
];

const FECHA_OPTS = [
  {key: 'nuevo', label: 'Más nuevo'},
  {key: 'viejo', label: 'Más viejo'},
];


const TalleresContainer = ({navigation}) => {
  const {bgFullStyle} = useValues();

  const [dataTalleres, setdataTalleres] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Drafts del modal
  const [draftEstados, setDraftEstados]     = useState([]);     // string[]
  const [draftStatus, setDraftStatus]       = useState([]);     // string[]
  const [draftPlan, setDraftPlan]           = useState(null);   // null | 'con_plan' | 'sin_plan'
  const [draftDistancia, setDraftDistancia] = useState('asc');  // 'asc' | 'desc'
  const [draftFecha, setDraftFecha]         = useState(null);   // null | 'nuevo' | 'viejo'
  const [draftFechaDia, setDraftFechaDia]   = useState(null);   // Date | null

  // Filtros aplicados
  const [filterNombre, setFilterNombre]       = useState('');
  const [filterEstados, setFilterEstados]     = useState([]);   // string[]
  const [filterStatus, setFilterStatus]       = useState([]);   // string[]
  const [filterPlan, setFilterPlan]           = useState(null);
  const [filterDistancia, setFilterDistancia] = useState('asc');
  const [filterFecha, setFilterFecha]         = useState(null);
  const [filterFechaDia, setFilterFechaDia]   = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const spin = spinAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']});

  const triggerRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    Animated.loop(
      Animated.timing(spinAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
    ).start();
    await getData();
    spinAnim.stopAnimation();
    spinAnim.setValue(0);
    setRefreshing(false);
  };

  /** Estados únicos disponibles en la data cargada */
  const estadosDisponibles = useMemo(() => {
    const set = new Set();
    dataTalleres.forEach(t => { if (t.estado) set.add(t.estado); });
    return Array.from(set).sort();
  }, [dataTalleres]);

  const STATUS_COLOR = {
    Aprobado:  {color: '#22C55E', bg: '#F0FDF4'},
    Pendiente: {color: '#F59E0B', bg: '#FFFBEB'},
    Rechazado: {color: '#EF4444', bg: '#FEF2F2'},
  };

  /** Status únicos disponibles en la data cargada */
  const statusDisponibles = useMemo(() => {
    const set = new Set();
    dataTalleres.forEach(t => { if (t.status) set.add(t.status); });
    return Array.from(set).sort();
  }, [dataTalleres]);

  const navigationScreen = useNavigation();

  // Re-aplica los filtros automáticamente cada vez que cambia la data o cualquier filtro activo
  useEffect(() => {
    applyFilters(
      dataTalleres,
      filterNombre,
      filterEstados,
      filterStatus,
      filterPlan,
      filterDistancia,
      filterFecha,
      filterFechaDia,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTalleres, filterNombre, filterEstados, filterStatus, filterPlan, filterDistancia, filterFecha, filterFechaDia]);

  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getData();
    });
    return unsubscribe;
  }, [navigationScreen]);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      try {
        const response = await api.post(
          '/usuarios/getTalleres',
          {estado: user.estado},
          {headers: {'Content-Type': 'application/json'}},
        );
        if (response.status === 200) {
          const location = await getCurrentLocation();
          const withDistance = response.data.map(item => {
            const lat = Number(item?.ubicacion?.lat);
            const lng = Number(item?.ubicacion?.lng);
            let km_distance = null;
            if (
              location &&
              Number.isFinite(location.latitude) &&
              Number.isFinite(location.longitude) &&
              Number.isFinite(lat) &&
              Number.isFinite(lng)
            ) {
              km_distance = calcularDistanciaKm(location.latitude, location.longitude, lat, lng);
            }
            return {...item, km_distance};
          });
          const sorted = [...withDistance].sort((a, b) => {
            const dA = a.km_distance != null ? a.km_distance : Infinity;
            const dB = b.km_distance != null ? b.km_distance : Infinity;
            return dA - dB;
          });
          setdataTalleres(sorted); // el useEffect reactivo re-aplica los filtros activos
        } else {
          setdataTalleres([]);
          setFilteredData([]);
        }
      } catch {
        setdataTalleres([]);
        setFilteredData([]);
      }
    } catch {
      setdataTalleres([]);
      setFilteredData([]);
    }
  };

  const applyFilters = (source, nombre, estados, status, plan, distancia, fecha, fechaDia) => {
    let result = [...source];

    if (nombre.trim()) {
      const q = nombre.toLowerCase();
      result = result.filter(t => t.nombre?.toLowerCase().includes(q));
    }
    if (estados && estados.length > 0) {
      result = result.filter(t => estados.includes(t.estado));
    }
    if (status && status.length > 0) {
      result = result.filter(t => status.includes(t.status));
    }
    if (plan === 'con_plan') {
      result = result.filter(t => !!t.subscripcion_actual?.nombre);
    } else if (plan === 'sin_plan') {
      result = result.filter(t => !t.subscripcion_actual?.nombre);
    }

    // Filtro por día específico
    if (fechaDia) {
      result = result.filter(t => isSameDay(parseCreatedAt(t.createdAt), fechaDia));
    }

    // Ordenamiento: fecha tiene prioridad sobre distancia cuando está activo
    if (fecha === 'nuevo') {
      result.sort((a, b) => {
        const tA = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
        const tB = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
        return tB - tA;
      });
    } else if (fecha === 'viejo') {
      result.sort((a, b) => {
        const tA = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
        const tB = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
        return tA - tB;
      });
    } else {
      result.sort((a, b) => {
        const dA = a.km_distance != null ? a.km_distance : Infinity;
        const dB = b.km_distance != null ? b.km_distance : Infinity;
        return distancia === 'asc' ? dA - dB : dB - dA;
      });
    }

    setFilteredData(result);
  };

  const handleSearchChange = text => {
    setFilterNombre(text);
    // el useEffect reactivo re-aplica los filtros al cambiar filterNombre
  };

  const toggleDraftEstado = est => {
    setDraftEstados(prev =>
      prev.includes(est) ? prev.filter(e => e !== est) : [...prev, est],
    );
  };

  const toggleDraftStatus = st => {
    setDraftStatus(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st],
    );
  };

  const handleApply = () => {
    setFilterEstados(draftEstados);
    setFilterStatus(draftStatus);
    setFilterPlan(draftPlan);
    setFilterDistancia(draftDistancia);
    setFilterFecha(draftFecha);
    setFilterFechaDia(draftFechaDia);
    setShowFilterModal(false);
    // el useEffect reactivo re-aplica los filtros al cambiar los filterX states
  };

  const handleClear = () => {
    setDraftEstados([]);
    setDraftStatus([]);
    setDraftPlan(null);
    setDraftDistancia('asc');
    setDraftFecha(null);
    setDraftFechaDia(null);
    setFilterEstados([]);
    setFilterStatus([]);
    setFilterPlan(null);
    setFilterDistancia('asc');
    setFilterFecha(null);
    setFilterFechaDia(null);
    setShowFilterModal(false);
    // el useEffect reactivo re-aplica los filtros al resetear los filterX states
  };

  const openModal = () => {
    setDraftEstados(filterEstados);
    setDraftStatus(filterStatus);
    setDraftPlan(filterPlan);
    setDraftDistancia(filterDistancia);
    setDraftFecha(filterFecha);
    setDraftFechaDia(filterFechaDia);
    setShowFilterModal(true);
  };

  const handleCardPress = item => {
    navigationScreen.navigate('FormTaller', {uid: item.uid});
  };

  const modalActiveCount = [
    ...filterEstados,
    ...filterStatus,
    filterPlan,
    filterDistancia !== 'asc' ? filterDistancia : null,
    filterFecha,
    filterFechaDia ? 'dia' : null,
  ].filter(Boolean).length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1D1E56" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerLogoutBtn} onPress={async () => {
            try { await AsyncStorage.removeItem('@userInfo'); } catch {}
            try { await AsyncStorage.removeItem('userToken'); navigationScreen.replace('Login'); } catch {}
          }} activeOpacity={0.8}>
            <Icons name="sign-out" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Negocios</Text>
            <Text style={styles.headerSubtitle}>¡Encuentra el negocio perfecto para ti!</Text>
          </View>
          <TouchableOpacity
            style={styles.headerRefreshBtn}
            onPress={triggerRefresh}
            activeOpacity={0.8}>
            <Animated.View style={{transform: [{rotate: spin}]}}>
              <Icons5 name="sync-alt" size={16} color="#FFFFFF" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Icons5 name="search" size={14} color="#9BA6B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#9BA6B8"
            value={filterNombre}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {filterNombre.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Icons name="times-circle" size={16} color="#C7CBEF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.searchFilterBtn, modalActiveCount > 0 && styles.searchFilterBtnActive]} onPress={openModal} activeOpacity={0.8}>
          <Icons5 name="sliders-h" size={16} color={modalActiveCount > 0 ? '#FFFFFF' : '#2D3261'} />
          {modalActiveCount > 0 && (
            <View style={styles.searchFilterBadge}>
              <Text style={styles.searchFilterBadgeText}>{modalActiveCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── LIST ── */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, idx) => String(item.uid || item.id || idx)}
        renderItem={({item}) => <TallerCard item={item} onPress={handleCardPress} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icons5 name="store-slash" size={40} color="#C7CBEF" />
            <Text style={styles.emptyText}>No se encontraron negocios</Text>
          </View>
        }
      />

      {/* ── FILTER MODAL ── */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {/* Handle */}
                  <View style={styles.modalHandle} />

                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalTitle}>Filtrar negocios</Text>
                      <Text style={styles.modalSubtitle}>
                        {modalActiveCount > 0 ? `${modalActiveCount} filtro${modalActiveCount > 1 ? 's' : ''} activo${modalActiveCount > 1 ? 's' : ''}` : 'Personaliza tu búsqueda'}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowFilterModal(false)}>
                      <Icons name="times" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* ── Sección: Estado / Ciudad ── */}
                    {estadosDisponibles.length > 0 && (
                      <>
                        <Text style={[styles.modalSectionLabel, {marginTop: 4}]}>
                          <Icons5 name="map-marker-alt" size={11} color="#1D1E56" />{'  '}Estado / Ciudad
                        </Text>
                        <View style={styles.modalChipRowWrap}>
                          {estadosDisponibles.map(est => {
                            const active = draftEstados.includes(est);
                            return (
                              <TouchableOpacity
                                key={est}
                                style={[styles.modalChipWrap, active && styles.modalChipActive]}
                                onPress={() => toggleDraftEstado(est)}
                                activeOpacity={0.8}>
                                {active && <Icons5 name="check" size={9} color="#FFD60A" style={{marginRight: 4}} />}
                                <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                                  {est}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </>
                    )}

                    {/* ── Sección: Status (comentada — API devuelve un solo status) ── */}
                    {/* {statusDisponibles.length > 0 && (
                      <>
                        <Text style={[styles.modalSectionLabel, {marginTop: 20}]}>
                          <Icons5 name="toggle-on" size={11} color="#1D1E56" />{'  '}Estado del negocio
                        </Text>
                        <View style={styles.modalChipRowWrap}>
                          {statusDisponibles.map(st => {
                            const active = draftStatus.includes(st);
                            const palette = STATUS_COLOR[st] || {color: '#6B7280', bg: '#F4F6FB'};
                            return (
                              <TouchableOpacity
                                key={st}
                                style={[
                                  styles.modalChipWrap,
                                  active
                                    ? {backgroundColor: palette.bg, borderColor: palette.color}
                                    : null,
                                ]}
                                onPress={() => toggleDraftStatus(st)}
                                activeOpacity={0.8}>
                                <View style={[styles.modalStatusDot, {backgroundColor: palette.color}]} />
                                <Text style={[
                                  styles.modalChipText,
                                  active && {color: palette.color, fontWeight: '800'},
                                ]}>
                                  {'  '}{st}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </>
                    )} */}

                    {/* ── Sección: Fecha de registro ── */}
                    <Text style={[styles.modalSectionLabel, {marginTop: 20}]}>
                      <Icons5 name="calendar-alt" size={11} color="#1D1E56" />{'  '}Fecha de registro
                    </Text>
                    <View style={styles.modalChipRow}>
                      {FECHA_OPTS.map(opt => {
                        const active = draftFecha === opt.key;
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            style={[styles.modalChip, active && styles.modalChipActive]}
                            onPress={() => setDraftFecha(active ? null : opt.key)}
                            activeOpacity={0.8}>
                            <Icons5
                              name={opt.key === 'nuevo' ? 'sort-amount-down' : 'sort-amount-up'}
                              size={11}
                              color={active ? '#FFD60A' : '#6B7280'}
                            />
                            <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                              {'  '}{opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Día específico */}
                    <TouchableOpacity
                      style={[styles.modalDateBtn, draftFechaDia && styles.modalDateBtnActive]}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.8}>
                      <Icons5 name="calendar-day" size={11} color={draftFechaDia ? '#FFD60A' : '#6B7280'} />
                      <Text style={[styles.modalDateBtnText, draftFechaDia && styles.modalDateBtnTextActive]}>
                        {'  '}{draftFechaDia ? formatDate(draftFechaDia) : 'Día específico'}
                      </Text>
                      {draftFechaDia && (
                        <TouchableOpacity
                          onPress={() => setDraftFechaDia(null)}
                          style={styles.modalDateBtnClear}
                          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                          <Icons name="times" size={10} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>

                    {/* ── Sección: Plan ── */}
                    <Text style={[styles.modalSectionLabel, {marginTop: 20}]}>
                      <Icons5 name="crown" size={11} color="#1D1E56" />{'  '}Plan de suscripción
                    </Text>
                    <View style={styles.modalChipRow}>
                      {PLAN_OPTS.map(opt => {
                        const active = draftPlan === opt.key;
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            style={[styles.modalChip, active && styles.modalChipActive]}
                            onPress={() => setDraftPlan(active ? null : opt.key)}
                            activeOpacity={0.8}>
                            <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* ── Sección: Distancia ── */}
                    <Text style={[styles.modalSectionLabel, {marginTop: 20}]}>
                      <Icons5 name="route" size={11} color="#1D1E56" />{'  '}Ordenar por distancia
                    </Text>
                    <View style={styles.modalChipRow}>
                      {DISTANCIA_OPTS.map(opt => {
                        const active = draftDistancia === opt.key;
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            style={[styles.modalChip, active && styles.modalChipActive]}
                            onPress={() => setDraftDistancia(opt.key)}
                            activeOpacity={0.8}>
                            <Icons5 name={opt.icon} size={11} color={active ? '#FFFFFF' : '#6B7280'} />
                            <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                              {'  '}{opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* ── Botones ── */}
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity style={styles.modalBtnClear} onPress={handleClear}>
                        <Text style={styles.modalBtnClearText}>Limpiar todo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalBtnApply} onPress={handleApply}>
                        <Icons5 name="check" size={13} color="#FFFFFF" />
                        <Text style={styles.modalBtnApplyText}>{'  '}Aplicar</Text>
                      </TouchableOpacity>
                    </View>

                  </ScrollView>

                  <DatePicker
                    modal
                    open={showDatePicker}
                    date={draftFechaDia || new Date()}
                    mode="date"
                    locale="es"
                    title="Seleccionar día"
                    confirmText="Confirmar"
                    cancelText="Cancelar"
                    onConfirm={date => {
                      setShowDatePicker(false);
                      setDraftFechaDia(date);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default TalleresContainer;
