import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../../axiosInstance';
import DatePicker from 'react-native-date-picker';
const TIME_INTERVAL_PRESETS = [
  '7 dias',
  '15 dias',
  '1 mes',
  '2 meses',
  '3 meses',
  '5 meses',
  '10 meses',
  '18 meses',
  '25 meses',
  '30 meses',
];
const KM_INTERVAL_PRESETS = [
  1000,
  3000,
  5000,
  8000,
  10000,
  15000,
  20000,
  25000,
  30000,
  35000,
  100000,
];

const STATUS_FILTER_OPTIONS = [
  { key: 'PENDIENTE DATA', label: 'Pendiente data', color: '#6B7280' },
  { key: 'VENCIDO', label: 'Vencido', color: '#E53935' },
  { key: 'POR VENCER', label: 'Por vencer', color: '#F9A825' },
  { key: 'AL DIA', label: 'Al dia', color: '#2E7D32' },
];

const defaultStatusFilterSelection = () =>
  STATUS_FILTER_OPTIONS.reduce((acc, { key }) => ({ ...acc, [key]: true }), {});

const EXPIRED_BORDER = '#E53935';

const DEFAULTS_BY_SECRET_CODE = {
  UltimocambioAceite:                  { km: 500,  dias: 7  },
  KMCorreTiempo:                       { km: 1000, dias: 15 },
  UltimoMantenimientoSistemaInyeccion: { km: 500,  dias: 15 },
  UltimaAlineacionRuedas:              { km: 300,  dias: 7  },
  UltimoAbastecimientoCombustible:     { km: 100,  dias: 3  },
  UltimoLavado:                        { km: 100,  dias: 3  },
  UltimoCambioBujiasFiltro:            { km: 500,  dias: 15 },
};

/** Card de lista con borde que pulsa si el mantenimiento está vencido. */
const MaintenanceListCard = React.memo(function MaintenanceListCard({
  item,
  status,
  isOverdue,
  cardBorderStyle,
  onOpen,
  styles: S,
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOverdue) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isOverdue, pulse]);

  const animatedBorderWidth = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [2.2, 4.2],
  });
  const animatedShadowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.38],
  });

  const inner = (
    <>
      <View style={S.maintenanceTopRow}>
        <View style={S.maintenanceTitleWrap}>
          <View style={S.maintenanceTitleIcon}>
            <Icons name="wrench" size={12} color="#FFD60A" />
          </View>
          <Text style={S.maintenanceTitle}>{String(item.title || '').toUpperCase()}</Text>
        </View>
        <View style={[S.maintenanceBadge, { backgroundColor: status.color }]}>
          <Text style={S.maintenanceBadgeText}>{status.label}</Text>
        </View>
      </View>
      <Text style={S.maintenanceSubtitle}>{item.subtitle}</Text>
      <View style={S.reviewGridRow}>
        <View style={[S.reviewBox, S.reviewBoxLeft]}>
          <Text style={S.reviewLabel}>ULTIMA REVISION</Text>
          <Text style={S.reviewDateValue}>{item?.lastReview || '--'}</Text>
          <View style={S.reviewKmBlock}>
            {/* <Text style={S.reviewKmSubLabel}>Último KM</Text> */}
            <Text style={S.reviewKmSubValue}>{item?.ultimoKM ?? '--'}</Text>
          </View>
        </View>
        <View style={S.reviewBox}>
          <Text style={S.reviewLabel}>PROXIMA REVISION</Text>
          <Text style={S.reviewDateValue}>{item?.nextReview || '--'}</Text>
          <View style={S.reviewKmBlock}>
            {/* <Text style={S.reviewKmSubLabel}>Próximo KM</Text> */}
            <Text style={S.reviewKmSubValue}> A los: {item?.proximoKM ?? '--'}</Text>
          </View>
        </View>
      </View>
      <View style={S.maintenanceBottomRow}>
        <View style={[S.maintenanceMetaChip, S.maintenanceMetaChipKm]}>
          <Icons name="tachometer-alt" size={12} color="#2D3261" />
          <View style={S.maintenanceKmStack}>
            <Text style={[S.reviewLabel, S.maintenanceKmLabelFirst]}>
              HASTA PRÓX. SERVICIO
            </Text>
            <Text style={S.maintenanceKmIntervalValue}>{item.kmUntilNextServiceText ?? '--'}</Text>
          </View>
        </View>
        <View style={[S.maintenanceMetaChipAlt, S.maintenanceMetaChipAltShrink]}>
          <Icons name="check-circle" size={11} color="#2D3261" />
          <Text style={S.maintenanceMetaChipAltText}>
            {item?.dueInDays < 0
              ? `Atrasado ${Math.abs(item?.dueInDays)} dias`
              : `${item?.dueInDays} dias`}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={() => onOpen(item)}>
      {isOverdue ? (
        <Animated.View
          style={[
            S.maintenanceCard,
            {
              borderColor: EXPIRED_BORDER,
              borderWidth: animatedBorderWidth,
              shadowColor: EXPIRED_BORDER,
              shadowOpacity: animatedShadowOpacity,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            },
          ]}>
          {inner}
        </Animated.View>
      ) : (
        <View style={[S.maintenanceCard, cardBorderStyle]}>{inner}</View>
      )}
    </TouchableOpacity>
  );
});

const VehicleMaintenanceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paramsVehicleData = route?.params?.vehicleData ?? null;
  const [vehicleData, setVehicleData] = useState(paramsVehicleData);
  const vehicleId = route?.params?.vehicleId ? String(route.params.vehicleId) : '';
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [loadingMaintenances, setLoadingMaintenances] = useState(true);
  const [missingDataModalVisible, setMissingDataModalVisible] = useState(false);
  const [missingDataCount, setMissingDataCount] = useState(0);
  const [savingDetailChanges, setSavingDetailChanges] = useState(false);
  const [saveSuccessModalVisible, setSaveSuccessModalVisible] = useState(false);
  const [lastReviewPickerVisible, setLastReviewPickerVisible] = useState(false);
  const [lastReviewPickerDate, setLastReviewPickerDate] = useState(new Date());
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [statusFilterSelection, setStatusFilterSelection] = useState(defaultStatusFilterSelection);
  const [kmModalVisible, setKmModalVisible] = useState(false);
  const [kmEditDraft, setKmEditDraft] = useState('');
  const [savingVehicleKm, setSavingVehicleKm] = useState(false);
  const [kmSuccessModalVisible, setKmSuccessModalVisible] = useState(false);
  const [kmSuccessFormatted, setKmSuccessFormatted] = useState('');

  useEffect(() => {
    setVehicleData(paramsVehicleData);
  }, [paramsVehicleData]);

  const vehicleTitle = useMemo(() => {
    const placa = String(vehicleData?.vehiculo_placa || '').trim();
    const marca = String(vehicleData?.vehiculo_marca || '').trim();
    const modelo = String(vehicleData?.vehiculo_modelo || '').trim();
    if (placa) return placa.toUpperCase();
    if (marca || modelo) return `${marca} ${modelo}`.trim();
    return 'Tu vehículo';
  }, [vehicleData]);

  const vehicleSummary = useMemo(() => {
    const placa = String(vehicleData?.vehiculo_placa || '').trim();
    const marca = String(vehicleData?.vehiculo_marca || '').trim();
    const modelo = String(vehicleData?.vehiculo_modelo || '').trim();
    const anio = String(vehicleData?.vehiculo_anio || vehicleData?.vehiculo_ano || '').trim();
    const color = String(vehicleData?.vehiculo_color || '').trim();
    const tipo = String(vehicleData?.tipo_vehiculo || '').trim();
    const km = String(vehicleData?.KM ?? vehicleData?.km_actual ?? '').trim();
    const kmDigits = km.replace(/\D/g, '');
    const kmParsed = kmDigits ? Number(kmDigits) : NaN;

    return {
      placa: placa ? placa.toUpperCase() : '--',
      marcaModelo: `${marca} ${modelo}`.trim() || '--',
      tags: [
        { label: `Año ${anio || '--'}` },
        { label: `Color ${color || '--'}` },
        { label: `Tipo ${tipo || '--'}` },
      ],
      kmDisplay: Number.isFinite(kmParsed) ? `${kmParsed.toLocaleString('es-ES')} km` : null,
      kmRawDigits: kmDigits,
      details: [],
      list: [
        { label: 'Placa', value: placa ? placa.toUpperCase() : '--' },
        { label: 'Marca/Modelo', value: `${marca} ${modelo}`.trim() || '--' },
        { label: 'Año', value: anio || '--' },
        { label: 'Color', value: color || '--' },
        { label: 'Tipo', value: tipo || '--' },
        { label: 'Kilometraje', value: km ? `${km} km` : '--' },
      ],
    };
  }, [vehicleData]);

  const toBool = value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value || '').trim().toLowerCase();
    return ['true', '1', 'si', 'sí', 'activo', 'activa', 'enabled'].includes(normalized);
  };

  const getMaintenanceStatus = (dueInDays, lastReview, warningThresholdDays = 5) => {
    const normalizedLastReview = String(lastReview || '').trim();
    const noData =
      !normalizedLastReview ||
      normalizedLastReview === '—' ||
      normalizedLastReview === '--';
    if (noData) return { label: 'PENDIENTE DATA', color: '#6B7280' };
    const parsedLast = parseDateFlexible(lastReview);
    if (!parsedLast) return { label: 'PENDIENTE DATA', color: '#6B7280' };
    if (dueInDays < 0) return { label: 'VENCIDO', color: '#E53935' };
    if (dueInDays <= warningThresholdDays) return { label: 'POR VENCER', color: '#F9A825' };
    return { label: 'AL DIA', color: '#2E7D32' };
  };

  /**
   * Combina el estado por fecha (getMaintenanceStatus) con el delta km hasta el hito
   * (vehículo vs próximo km). No reemplaza la lógica de tiempo: la extiende.
   */
  const mergeKmIntoMaintenanceStatus = (timeStatus, kmDelta, warningThresholdKm = 3000) => {
    if (kmDelta == null || !Number.isFinite(kmDelta)) {
      return timeStatus;
    }
    if (kmDelta < 0) {
      return { label: 'VENCIDO', color: '#E53935' };
    }
    if (kmDelta >= 0 && kmDelta <= warningThresholdKm) {
      if (timeStatus.label === 'VENCIDO') {
        return timeStatus;
      }
      return { label: 'POR VENCER', color: '#F9A825' };
    }
    return timeStatus;
  };

  const getEffectiveMaintenanceStatus = (dueInDays, lastReview, kmDeltaUntilNext, warningThresholdDays = 5, warningThresholdKm = 3000) => {
    const timeStatus = getMaintenanceStatus(dueInDays, lastReview, warningThresholdDays);
    return mergeKmIntoMaintenanceStatus(timeStatus, kmDeltaUntilNext, warningThresholdKm);
  };

  const getStatusMeta = (dueInDays, lastReview, kmDeltaUntilNext) => {
    const status = getEffectiveMaintenanceStatus(dueInDays, lastReview, kmDeltaUntilNext);
    if (status.label === 'PENDIENTE DATA') {
      return {
        icon: 'info-circle',
        bg: 'rgba(107,114,128,0.16)',
        color: '#6B7280',
        status,
      };
    }
    if (status.label === 'AL DIA') {
      return { icon: 'check-circle', bg: 'rgba(46,125,50,0.16)', color: '#2E7D32', status };
    }
    if (status.label === 'POR VENCER') {
      return { icon: 'exclamation-triangle', bg: 'rgba(249,168,37,0.18)', color: '#F9A825', status };
    }
    return { icon: 'times-circle', bg: 'rgba(229,57,53,0.16)', color: '#E53935', status };
  };

  const handleOpenMaintenanceDetail = item => {
    setSelectedMaintenance(item);
    setDetailVisible(true);
  };

  const closeDetailSheet = () => {
    setLastReviewPickerVisible(false);
    setDetailVisible(false);
  };

  const formatKmInterval = km => `Cada ${km.toLocaleString('es-ES')} km`;

  const getTimePresetIndex = value => {
    const current = String(value || '').trim().toLowerCase();
    const index = TIME_INTERVAL_PRESETS.findIndex(item => item.toLowerCase() === current);
    return index >= 0 ? index : 2;
  };

  const getKmPresetIndex = value => {
    const digits = String(value || '').replace(/[^\d]/g, '');
    const parsed = Number(digits);
    const index = KM_INTERVAL_PRESETS.findIndex(item => item === parsed);
    return index >= 0 ? index : 2;
  };

  const normalizeKmText = value => {
    const digits = String(value || '').replace(/[^\d]/g, '');
    const parsed = Number(digits);
    if (!Number.isFinite(parsed) || parsed <= 0) return '—';
    return `${parsed.toLocaleString('es-ES')} km`;
  };

  const parseOdometerToInt = value => {
    if (value == null || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return Math.round(value);
    }
    const digits = String(value).replace(/[^\d]/g, '');
    if (digits === '') return null;
    const n = Number(digits);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  };

  const formatMaintenanceKmCell = n =>
    n != null && Number.isFinite(n) ? `${n.toLocaleString('es-ES')} km` : '--';

  const parseDateFlexible = value => {
    const raw = String(value || '').trim();
    if (!raw || raw === '—' || raw === '--') return null;
    const normalized = raw.replace(/\s+/g, ' ').replace(/-/g, '/').trim();

    // yyyy/mm/dd or dd/mm/yyyy
    const slashParts = normalized.split('/');
    if (slashParts.length === 3) {
      const a = Number(slashParts[0]);
      const b = Number(slashParts[1]);
      const c = Number(slashParts[2]);
      if (Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c)) {
        if (String(slashParts[0]).length === 4) {
          const d = new Date(a, b - 1, c);
          if (!Number.isNaN(d.getTime())) return d;
        }
        if (String(slashParts[2]).length === 4) {
          const d = new Date(c, b - 1, a);
          if (!Number.isNaN(d.getTime())) return d;
        }
      }
    }

    // dd mmm yyyy (es), ejemplo: 10 mar 2026
    const monthMap = {
      ene: 0,
      feb: 1,
      mar: 2,
      abr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      ago: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dic: 11,
    };
    const textParts = normalized.toLowerCase().split(' ');
    if (textParts.length === 3) {
      const day = Number(textParts[0]);
      const month = monthMap[textParts[1].slice(0, 3)];
      const year = Number(textParts[2]);
      if (Number.isFinite(day) && Number.isFinite(year) && Number.isFinite(month)) {
        const d = new Date(year, month, day);
        if (!Number.isNaN(d.getTime())) return d;
      }
    }

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return null;
  };

  const formatDateISO = date => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDDMMYYYY = dateValue => {
    const parsed = parseDateFlexible(dateValue);
    if (!parsed) return '';
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateHuman = date => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const inferDaysFromTimeInterval = value => {
    let raw = String(value || '').trim();
    if (!raw) return 0;
    if (raw.normalize) {
      raw = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    raw = raw.toLowerCase();
    const amountMatch = raw.match(/(\d+)/);
    const amount = amountMatch ? Number(amountMatch[1]) : NaN;
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    if (/\d+\s*dias?\b/.test(raw)) return amount;
    if (/\d+\s*mes(es)?\b/.test(raw) || raw.includes('mes')) return amount * 30;
    return amount;
  };

  const mapIntervalodiasToPreset = days => {
    const n = Number(days);
    if (!Number.isFinite(n) || n <= 0) return TIME_INTERVAL_PRESETS[2];
    const exact = TIME_INTERVAL_PRESETS.find(p => inferDaysFromTimeInterval(p) === n);
    if (exact) return exact;
    let best = TIME_INTERVAL_PRESETS[2];
    let bestDiff = Infinity;
    for (const p of TIME_INTERVAL_PRESETS) {
      const d = inferDaysFromTimeInterval(p);
      const diff = Math.abs(d - n);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    }
    return best;
  };

  const computeNextReviewFromLastAndInterval = (lastReviewStr, timeIntervalStr) => {
    const days = inferDaysFromTimeInterval(timeIntervalStr);
    const base = parseDateFlexible(lastReviewStr);
    if (days <= 0 || !base) return null;
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return formatDateHuman(d);
  };

  /** Días desde hoy hasta la próxima revisión: última revisión (DD/MM/YYYY o texto parseable) + intervalo. */
  const computeDaysUntilNextDue = (lastReviewStr, timeIntervalStr) => {
    const intervalDays = inferDaysFromTimeInterval(timeIntervalStr);
    const lastParsed = parseDateFlexible(lastReviewStr);
    if (!lastParsed || intervalDays <= 0) return 0;
    const nextDue = new Date(
      lastParsed.getFullYear(),
      lastParsed.getMonth(),
      lastParsed.getDate(),
    );
    nextDue.setDate(nextDue.getDate() + intervalDays);
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startNext = new Date(nextDue.getFullYear(), nextDue.getMonth(), nextDue.getDate());
    return Math.round((startNext - startToday) / (1000 * 60 * 60 * 24));
  };

  const openLastReviewPickerInModal = () => {
    const parsed = parseDateFlexible(selectedMaintenance?.lastReview);
    setLastReviewPickerDate(parsed || new Date());
    setLastReviewPickerVisible(true);
  };

  const handleConfirmLastReviewInModal = selectedDate => {
    const formatted = formatDateHuman(selectedDate);
    if (!formatted || !selectedMaintenance?.id) {
      setLastReviewPickerVisible(false);
      return;
    }
    const targetId = String(selectedMaintenance.id);
    const nextHuman =
      computeNextReviewFromLastAndInterval(formatted, selectedMaintenance?.timeInterval) ??
      selectedMaintenance?.nextReview;
    const dueInDays = computeDaysUntilNextDue(formatted, selectedMaintenance?.timeInterval);
    setSelectedMaintenance(prev =>
      prev
        ? { ...prev, lastReview: formatted, nextReview: nextHuman || prev.nextReview, dueInDays }
        : prev,
    );
    setMaintenanceItems(prev =>
      prev.map(item =>
        String(item?.id) === targetId
          ? { ...item, lastReview: formatted, nextReview: nextHuman || item.nextReview, dueInDays }
          : item,
      ),
    );
    setLastReviewPickerVisible(false);
  };

  const refreshVehicleDataFromServer = useCallback(async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid ?? userInfo?.id ?? '';
      if (!uid || !vehicleId) return;
      const res = await api.post('usuarios/getVehiculosByUsuarioUid', {uid});
      const data = res?.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      const found = list.find(
        v => String(v?.id ?? v?.uid ?? v?.vehiculo_uid ?? '').trim() === vehicleId,
      );
      if (found && typeof found === 'object') {
        setVehicleData(prev => ({...(prev || {}), ...found}));
      }
    } catch (_) {
      /* silencioso: el KM optimista ya quedó en estado local */
    }
  }, [vehicleId]);

  const fetchVehicleMaintenances = useCallback(async (options = {}) => {
    const silent = Boolean(options?.silent);
    const skipMissingModal = Boolean(options?.skipMissingModal);
    const odometerOverride = options?.odometerKmOverride;
    try {
      if (!silent) {
        setLoadingMaintenances(true);
      }
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid ?? userInfo?.id ?? '';
      if (!uid || !vehicleId) {
        setMaintenanceItems([]);
        return;
      }

      const vehicleOdometerKmResolved =
        odometerOverride != null && Number.isFinite(Number(odometerOverride))
          ? Math.round(Number(odometerOverride))
          : parseOdometerToInt(vehicleData?.KM ?? vehicleData?.km_actual ?? '');

      const response = await api.post('usuarios/getUserByUid', { uid });
      const data = response?.data;
      const userData =
        data && typeof data === 'object' && !Array.isArray(data) && (data.data || data.user)
          ? data.data || data.user
          : data;

      const notificacionesVehiculos =
        userData?.notificacionesVehiculos ?? userData?.userData?.notificacionesVehiculos ?? [];

      const selectedVehicleNotifications = (Array.isArray(notificacionesVehiculos)
        ? notificacionesVehiculos
        : []
      ).find(item => String(item?.uidvehicle ?? '') === vehicleId);

      const activeMaintenances = (selectedVehicleNotifications?.notificaciones || [])
        .filter(item => toBool(item?.active))
        .map((item, index) => {
          const nextDate = item?.proximaRevision ?? item?.dateRecommended ?? '';
          const recommendedKm = normalizeKmText(item?.kmRecomended);
          const apiIntervalKm = normalizeKmText(item?.intervalokm);
          const lastReview = String(item?.ultimaRevision || '—');
          const timeInterval = mapIntervalodiasToPreset(
            item?.intervalodias ?? item?.intervaloDias ?? item?.raw?.intervalodias,
          );
          const vehicleOdometerKm = vehicleOdometerKmResolved;
          const vehicleUltimoKm = vehicleOdometerKm;
          const apiUltimoKm =
            parseOdometerToInt(
              item?.ultimoKM ??
              item?.ultimokm ??
              item?.ultimo_km ??
              item?.ultimoKm,
            ) ?? vehicleUltimoKm;
          const intervalKmNum =
            typeof item?.intervalokm === 'number' && Number.isFinite(item.intervalokm)
              ? Math.max(0, Math.round(item.intervalokm))
              : parseOdometerToInt(item?.intervalokm) ?? 0;

          // Siempre recalculamos en base a: intervalKm - (kmActual - ultimoKM)
          // Solo usamos proximoKM de la API como último recurso
          let proximoKmNum = null;
          if (apiUltimoKm != null && intervalKmNum > 0) {
            proximoKmNum = apiUltimoKm + intervalKmNum;
          } else {
            proximoKmNum = parseOdometerToInt(
              item?.proximoKM ??
              item?.proximokm ??
              item?.proximo_km ??
              item?.proximoKm,
            );
          }

          let kmUntilNextServiceText = '--';
          let kmDeltaUntilNext = null;
          if (vehicleOdometerKm == null) {
            kmUntilNextServiceText = 'Indica el KM del vehículo';
          } else if (proximoKmNum == null) {
            kmUntilNextServiceText = 'Sin hito en km';
          } else {
            const diff = intervalKmNum > 0 && apiUltimoKm != null
              ? intervalKmNum - (vehicleOdometerKm - apiUltimoKm)
              : proximoKmNum - vehicleOdometerKm;
            kmDeltaUntilNext = diff;
            if (diff > 0) {
              kmUntilNextServiceText = `Faltan ${diff.toLocaleString('es-ES')} km`;
            } else if (diff === 0) {
              kmUntilNextServiceText = 'Estás en el hito';
            } else {
              kmUntilNextServiceText = `Pasaste ${Math.abs(diff).toLocaleString('es-ES')} km`;
            }
          }

          const secretCodeDefaults = DEFAULTS_BY_SECRET_CODE[String(item?.secretCode ?? '')] ?? null;
          const effectiveIntervalDays =
            (item?.intervaloTiempoXVencer != null && Number.isFinite(Number(item.intervaloTiempoXVencer)) && Number(item.intervaloTiempoXVencer) > 0)
              ? Math.round(Number(item.intervaloTiempoXVencer))
              : secretCodeDefaults != null
                ? secretCodeDefaults.dias
                : Number(item?.intervalodias ?? item?.intervaloDias ?? 0) || 5;

          const effectiveIntervalKm =
            (item?.intervaloKMXVencer != null && Number.isFinite(Number(item.intervaloKMXVencer)) && Number(item.intervaloKMXVencer) > 0)
              ? Math.round(Number(item.intervaloKMXVencer))
              : secretCodeDefaults != null
                ? secretCodeDefaults.km
                : 3000;

          

          return {
            id: String(item?.id ?? item?.uid ?? item?.secretCode ?? index),
            title: String(item?.nombre ?? `Mantenimiento ${index + 1}`),
            subtitle: String(
              item?.descripcion ??
              'Mantén este mantenimiento al día para mejorar el desempeño de tu vehículo.',
            ),
            km: recommendedKm,
            lastReview,
            nextReview: String(nextDate || '—'),
            timeInterval,
            kmInterval:
              apiIntervalKm !== '—'
                ? `Cada ${apiIntervalKm}`
                : recommendedKm !== '—'
                  ? `Cada ${recommendedKm}`
                  : `Cada ${KM_INTERVAL_PRESETS[2].toLocaleString('es-ES')} km`,
            dueInDays: computeDaysUntilNextDue(lastReview, timeInterval),
            intervalDias: effectiveIntervalDays > 0 ? effectiveIntervalDays : 5,
            intervalKm: effectiveIntervalKm,
            ultimoKM: formatMaintenanceKmCell(apiUltimoKm),
            proximoKM: formatMaintenanceKmCell(proximoKmNum),
            kmUntilNextServiceText,
            kmDeltaUntilNext,
            raw: item,
          };
        });

      setMaintenanceItems(activeMaintenances);
      const noLastReviewCount = activeMaintenances.filter(item => {
        const last = String(item?.lastReview || '').trim();
        return !last || last === '—' || last === '--';
      }).length;
      setMissingDataCount(noLastReviewCount);
      if (!skipMissingModal) {
        setMissingDataModalVisible(noLastReviewCount > 0);
      }
    } catch (e) {
      setMaintenanceItems([]);
      setMissingDataCount(0);
      setMissingDataModalVisible(false);
    } finally {
      if (!silent) {
        setLoadingMaintenances(false);
      }
    }
  }, [vehicleId, vehicleData?.KM, vehicleData?.km_actual]);

  useEffect(() => {
    if (!detailVisible) {
      setLastReviewPickerVisible(false);
    }
  }, [detailVisible]);

  useEffect(() => {
    fetchVehicleMaintenances();
  }, [fetchVehicleMaintenances]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchVehicleMaintenances();
    });
    return unsubscribe;
  }, [navigation, fetchVehicleMaintenances]);

  const handleOpenKmModal = () => {
    const raw = String(vehicleData?.KM ?? vehicleData?.km_actual ?? '').replace(/\D/g, '');
    setKmEditDraft(raw);
    setKmModalVisible(true);
  };

  const handleSaveVehicleKm = async () => {
    const digits = kmEditDraft.replace(/\D/g, '');
    const kmNum = parseInt(digits, 10);
    if (!digits || !Number.isFinite(kmNum) || kmNum < 0) {
      Alert.alert('Kilometraje', 'Ingresa un kilometraje válido (solo números).');
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
    if (!uiduser || !vehicleId) {
      Alert.alert('Sesión', 'No se encontró tu usuario o el vehículo.');
      return;
    }

    setSavingVehicleKm(true);
    try {
      await api.post('usuarios/updateVehiculoKm', {
        uid_user: uiduser,
        uid_vehicle: vehicleId,
        km: kmNum,
      });
      const kmRounded = Math.round(kmNum);
      setVehicleData(prev =>
        prev ? {...prev, KM: kmRounded, km_actual: kmRounded} : prev,
      );
      setKmModalVisible(false);
      await refreshVehicleDataFromServer();
      await fetchVehicleMaintenances({
        silent: true,
        skipMissingModal: true,
        odometerKmOverride: kmRounded,
      });
      setKmSuccessFormatted(kmRounded.toLocaleString('es-ES'));
      setKmSuccessModalVisible(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'No se pudo guardar. Intenta de nuevo.';
      Alert.alert('Error', String(msg));
    } finally {
      setSavingVehicleKm(false);
    }
  };

  const handleIntervalChange = (field, sliderValue) => {
    const idx = Math.round(Number(sliderValue));
    setSelectedMaintenance(prev => {
      if (!prev) return prev;
      if (field === 'timeInterval') {
        const maxIdx = TIME_INTERVAL_PRESETS.length - 1;
        const safeIdx = Math.min(maxIdx, Math.max(0, idx));
        const nextInterval = TIME_INTERVAL_PRESETS[safeIdx] || TIME_INTERVAL_PRESETS[2];
        const nextReview =
          computeNextReviewFromLastAndInterval(prev.lastReview, nextInterval) ?? prev.nextReview;
        const dueInDays = computeDaysUntilNextDue(prev.lastReview, nextInterval);
        return {
          ...prev,
          timeInterval: nextInterval,
          nextReview,
          dueInDays,
        };
      }
      const maxKmIdx = KM_INTERVAL_PRESETS.length - 1;
      const safeKmIdx = Math.min(maxKmIdx, Math.max(0, idx));
      return {
        ...prev,
        kmInterval: formatKmInterval(KM_INTERVAL_PRESETS[safeKmIdx] || KM_INTERVAL_PRESETS[2]),
      };
    });
  };

  const handleSaveDetailChanges = async () => {
    if (!selectedMaintenance) return;
    try {
      setSavingDetailChanges(true);
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uiduser = String(userInfo?.uid ?? userInfo?.id ?? '').trim();
      const uidvehicle = String(vehicleId || '').trim();
      const intervalodiasFinal = inferDaysFromTimeInterval(selectedMaintenance?.timeInterval);
      const baseDate = parseDateFlexible(selectedMaintenance?.lastReview) || new Date();
      const computedNextDate = new Date(baseDate);
      if (intervalodiasFinal > 0) {
        computedNextDate.setDate(computedNextDate.getDate() + intervalodiasFinal);
      }
      const computedProximaRevision =
        intervalodiasFinal > 0
          ? formatDateISO(computedNextDate)
          : String(selectedMaintenance?.nextReview ?? '').trim();

      const intervalokmNum =
        KM_INTERVAL_PRESETS[getKmPresetIndex(selectedMaintenance?.kmInterval)] ?? 0;

      const vehicleKmDigits = String(
        vehicleData?.KM ?? vehicleData?.km_actual ?? '',
      ).replace(/[^\d]/g, '');
      const ultimoKM = Number(vehicleKmDigits);
      const ultimoKMSafe =
        Number.isFinite(ultimoKM) && ultimoKM >= 0 ? Math.round(ultimoKM) : 0;
      const proximoKMSafe = ultimoKMSafe + intervalokmNum;

      const newUltimaRevisionFmt = formatDateDDMMYYYY(selectedMaintenance?.lastReview);
      const prevUltimaRevisionFmt = formatDateDDMMYYYY(
        selectedMaintenance?.raw?.ultimaRevision ?? '',
      );
      const ultimaRevisionChanged = newUltimaRevisionFmt !== prevUltimaRevisionFmt;

      const previousIntervalokmNum =
        typeof selectedMaintenance?.raw?.intervalokm === 'number' &&
          Number.isFinite(selectedMaintenance.raw.intervalokm)
          ? Math.round(selectedMaintenance.raw.intervalokm)
          : parseOdometerToInt(selectedMaintenance?.raw?.intervalokm) ?? 0;
      const intervalokmChanged = intervalokmNum !== previousIntervalokmNum;

      const payload = {
        uiduser,
        uidvehicle,
        secretCode: String(selectedMaintenance?.raw?.secretCode ?? '').trim(),
        ultimaRevision: newUltimaRevisionFmt,
        proximaRevision: formatDateDDMMYYYY(computedProximaRevision),
        intervalodias: intervalodiasFinal,
        intervalokm: intervalokmNum,
        ...(ultimaRevisionChanged ? { ultimoKM: ultimoKMSafe } : {}),
        ...(intervalokmChanged ? { proximoKM: proximoKMSafe } : {}),
      };

      await api.post('usuarios/updateNotificationUser', payload);
      await fetchVehicleMaintenances({ silent: true, skipMissingModal: true });
      closeDetailSheet();
      setSaveSuccessModalVisible(true);
    } catch (e) {
      
    } finally {
      setSavingDetailChanges(false);
    }
  };

  const hasValidLastReview =
    !!String(selectedMaintenance?.lastReview || '').trim() &&
    String(selectedMaintenance?.lastReview || '').trim() !== '--' &&
    String(selectedMaintenance?.lastReview || '').trim() !== '—';

  const detailDueDays = useMemo(
    () =>
      selectedMaintenance
        ? computeDaysUntilNextDue(selectedMaintenance.lastReview, selectedMaintenance.timeInterval)
        : 0,
    [selectedMaintenance],
  );

  const detailStatusMeta = useMemo(() => {
    if (!selectedMaintenance) return null;
    return getStatusMeta(
      detailDueDays,
      selectedMaintenance.lastReview,
      selectedMaintenance.kmDeltaUntilNext,
    );
  }, [selectedMaintenance, detailDueDays]);

  const filteredMaintenanceItems = useMemo(() => {
    return maintenanceItems.filter(item => {
      const dueDays = Number(item?.dueInDays ?? 0);
      const status = getEffectiveMaintenanceStatus(
        dueDays,
        item?.lastReview,
        item?.kmDeltaUntilNext,
        item?.intervalDias ?? 5,
        item?.intervalKm ?? 3000,
      );
      return statusFilterSelection[status.label];
    });
  }, [maintenanceItems, statusFilterSelection]);

  const hasActiveStatusFilter = useMemo(
    () => STATUS_FILTER_OPTIONS.some(({ key }) => !statusFilterSelection[key]),
    [statusFilterSelection],
  );

  const toggleStatusFilter = key => {
    setStatusFilterSelection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetStatusFilters = () => {
    setStatusFilterSelection(defaultStatusFilterSelection());
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnCircle}
          activeOpacity={0.85}>
          <ArrowLeft size={20} color="#FFD60A" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mantenimientos</Text>
          <Text style={styles.headerSubtitle}>
            Revisa los cuidados recomendados para tu vehiculo y mantenlo siempre en su mejor estado.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Icons name="tools" size={18} color="#FFD60A" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>TU PLAN DE CUIDADOS DEL VEHICULO</Text>
            <Text style={styles.infoText}>
              Aquí podrás ver los mantenimientos que deberías realizar para alargar la vida útil del carro y prevenir fallas.
            </Text>
            <View style={styles.vehicleHeroRow}>
              <View style={styles.plateChip}>
                <Icons name="car-side" size={12} color="#FFD60A" style={styles.plateChipIcon} />
                <Text style={styles.plateChipText} numberOfLines={1}>
                  {vehicleSummary.placa}
                </Text>
              </View>
              <Text style={styles.vehicleHeroModel} numberOfLines={1}>
                {vehicleSummary.marcaModelo}
              </Text>
            </View>

            <View style={styles.vehicleTagRow}>
              {vehicleSummary.tags.map(tag => (
                <View key={tag.label} style={styles.vehicleTagChip}>
                  <Text style={styles.vehicleTagText} numberOfLines={1}>
                    {tag.label}
                  </Text>
                </View>
              ))}
            </View>



            {vehicleSummary.details.length > 0 ? (
              <View style={styles.vehicleSummaryWrap}>
                {vehicleSummary.details.map(item => (
                  <View key={item.label} style={styles.vehicleSummaryItem}>
                    <Text style={styles.vehicleSummaryLabel}>{item.label}</Text>
                    <Text style={styles.vehicleSummaryValue} numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.kmHeroOuter}>
          <TouchableOpacity
            style={styles.kmHeroTouchable}
            activeOpacity={0.88}
            onPress={handleOpenKmModal}
            accessibilityRole="button"
            accessibilityLabel="Editar kilometraje del vehículo">
            <View style={styles.kmHeroIconWrap}>
              <Icons name="tachometer-alt" size={22} color="#1F2344" />
            </View>
            <View style={styles.kmHeroTextCol}>
              <Text style={styles.kmHeroLabel}>KILOMETRAJE ACTUAL</Text>
              <Text style={styles.kmHeroValue}>
                {vehicleSummary.kmDisplay ?? 'Sin registrar — toca para cargar'}
              </Text>
              <Text style={styles.kmHeroHint}>Toca para actualizar el odómetro</Text>
            </View>
            <View style={styles.kmHeroChevron}>
              <Icons name="pen" size={14} color="#FFD60A" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.notificationsShortcut}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('VehicleNotificationsScreen', {
              vehicleId,
              vehicleData,
            })
          }>
          <View style={styles.notificationsIconWrap}>
            <Icons name="bell" size={16} color="#FFD60A" />
          </View>
          <View style={styles.notificationsTextWrap}>
            <Text style={styles.notificationsTitle}>CONFIGURAR RECORDATORIOS</Text>
            <Text style={styles.notificationsText}>Presiona aquí y personaliza tus notificaciones del vehículo.</Text>
          </View>
          <Icons name="chevron-right" size={14} color="#2D3261" />
        </TouchableOpacity>

        {loadingMaintenances ? (
          <View style={styles.loadingMaintenancesWrap}>
            <Text style={styles.loadingMaintenancesText}>Cargando mantenimientos...</Text>
          </View>
        ) : maintenanceItems.length === 0 ? (
          <View style={styles.emptyMaintenancesWrap}>
            <Text style={styles.emptyMaintenancesTitle}>Sin mantenimientos activos</Text>
            <Text style={styles.emptyMaintenancesText}>
              Cuando actives notificaciones del vehículo, aquí verás los mantenimientos disponibles.
            </Text>
          </View>
        ) : filteredMaintenanceItems.length === 0 ? (
          <View style={styles.emptyMaintenancesWrap}>
            <Text style={styles.emptyMaintenancesTitle}>Sin resultados con este filtro</Text>
            <Text style={styles.emptyMaintenancesText}>
              Activa al menos un estado en el filtro o restablece para ver todos los mantenimientos.
            </Text>
            <TouchableOpacity
              style={styles.filterEmptyBtn}
              activeOpacity={0.85}
              onPress={() => setFilterModalVisible(true)}>
              <Text style={styles.filterEmptyBtnText}>Abrir filtro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredMaintenanceItems.map(item => {
            const dueDays = Number(item?.dueInDays ?? 0);
            const kmDelta = item?.kmDeltaUntilNext;
            const status = getEffectiveMaintenanceStatus(dueDays, item?.lastReview, kmDelta, item?.intervalDias ?? 5, item?.intervalKm ?? 3000);
            const isKmOverdue =
              kmDelta != null && Number.isFinite(kmDelta) && kmDelta < 0;
            const isOverdue = dueDays < 0 || isKmOverdue;
            const isDueSoon = status.label === 'POR VENCER';
            const cardBorderStyle = isDueSoon
              ? {
                borderColor: '#F9A825',
                borderWidth: 2.2,
                shadowColor: '#F9A825',
                shadowOpacity: 0.14,
                shadowRadius: 8,
              }
              : {
                borderColor: status.color,
                borderWidth: 1.8,
                shadowColor: status.color,
                shadowOpacity: 0.1,
              };
            return (
              <MaintenanceListCard
                key={item.id}
                item={item}
                status={status}
                isOverdue={isOverdue}
                cardBorderStyle={cardBorderStyle}
                onOpen={handleOpenMaintenanceDetail}
                styles={styles}
              />
            );
          })
        )}
      </ScrollView>

      {!loadingMaintenances && maintenanceItems.length > 0 ? (
        <TouchableOpacity
          style={styles.filterFab}
          activeOpacity={0.88}
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel="Filtrar por estado">
          <Icons name="filter" size={20} color="#FFD60A" />
          {hasActiveStatusFilter ? <View style={styles.filterFabDot} /> : null}
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { }}
            style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtrar por estado</Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Icons name="times" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.filterModalHint}>Puedes activar varios estados a la vez.</Text>
            {STATUS_FILTER_OPTIONS.map(opt => {
              const on = statusFilterSelection[opt.key];
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.filterOptionRow}
                  activeOpacity={0.85}
                  onPress={() => toggleStatusFilter(opt.key)}>
                  <View
                    style={[
                      styles.filterCheckbox,
                      on && { backgroundColor: opt.color, borderColor: opt.color },
                      !on && { borderColor: opt.color },
                    ]}>
                    {on ? <Icons name="check" size={11} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={styles.filterOptionLabel}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={styles.filterModalActions}>
              <TouchableOpacity
                style={styles.filterResetBtn}
                activeOpacity={0.85}
                onPress={() => {
                  resetStatusFilters();
                }}>
                <Text style={styles.filterResetBtnText}>Restablecer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                activeOpacity={0.85}
                onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.filterApplyBtnText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeDetailSheet}>
        <View style={styles.detailOverlay}>
          <TouchableOpacity style={styles.detailBackdrop} activeOpacity={1} onPress={closeDetailSheet} />
          <View style={styles.detailSheet}>
            <TouchableOpacity
              style={styles.detailCloseBtn}
              activeOpacity={0.8}
              onPress={closeDetailSheet}>
              <Icons name="times" size={16} color="#2D3261" />
            </TouchableOpacity>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.detailSheetScrollContent}>
              {selectedMaintenance ? (
                <>
                  <View
                    style={[
                      styles.detailIconWrap,
                      { backgroundColor: detailStatusMeta?.bg ?? 'rgba(107,114,128,0.16)' },
                    ]}>
                    <Icons
                      name={detailStatusMeta?.icon ?? 'info-circle'}
                      size={28}
                      color={detailStatusMeta?.color ?? '#6B7280'}
                    />
                  </View>

                  <Text style={styles.detailTitle}>
                    {String(selectedMaintenance?.title || 'MANTENIMIENTO').toUpperCase()}
                  </Text>

                  <View style={styles.importantCard}>
                    <View style={styles.importantIconWrap}>
                      <Icons name="exclamation-circle" size={16} color="#FFD60A" />
                    </View>
                    <View style={styles.importantTextWrap}>
                      <Text style={styles.importantTitle}>ACTUALIZA ESTE MANTENIMIENTO</Text>
                      <Text style={styles.importantText}>
                        Mantener estos datos al día te ayuda a prevenir fallas y recibir alertas más precisas.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailReviewRow}>
                    <View style={[styles.detailReviewBox, styles.detailReviewBoxLeft]}>
                      <Text style={styles.detailReviewLabel}>ULTIMA REVISION</Text>
                      {selectedMaintenance?.lastReview &&
                        selectedMaintenance?.lastReview !== '—' &&
                        selectedMaintenance?.lastReview !== '--' ? (
                        <View style={styles.detailReviewValueRow}>
                          <Text style={[styles.detailReviewValue, styles.detailReviewValueFlex]} numberOfLines={3}>
                            {selectedMaintenance?.lastReview}
                          </Text>
                          <TouchableOpacity
                            style={styles.detailReviewEditBtn}
                            activeOpacity={0.85}
                            onPress={openLastReviewPickerInModal}
                            accessibilityLabel="Editar última revisión"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Icons name="edit" size={14} color="#2D3261" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.detailReviewActionBtn}
                          activeOpacity={0.85}
                          onPress={openLastReviewPickerInModal}>
                          <Icons name="calendar-alt" size={12} color="#2D3261" />
                          <Text style={styles.detailReviewActionText}>Seleccionar fecha</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.detailReviewBox}>
                      <Text style={styles.detailReviewLabel}>PROXIMA REVISION</Text>
                      <Text style={styles.detailReviewValue}>{selectedMaintenance?.nextReview || '--'}</Text>
                    </View>
                  </View>

                  <Text style={styles.frequencySectionTitle}>CONFIGURAR FRECUENCIA</Text>
                  <View style={styles.detailMetaWrap}>
                    <View style={[styles.detailMetaItem, styles.detailMetaItemLeft]}>
                      <Text style={styles.detailMetaLabel}>INTERVALO DE TIEMPO</Text>
                      <View style={styles.intervalValuePill}>
                        <Text style={styles.detailMetaValue}>{selectedMaintenance?.timeInterval || '--'}</Text>
                      </View>
                      <Slider
                        style={styles.intervalSlider}
                        minimumValue={0}
                        maximumValue={TIME_INTERVAL_PRESETS.length - 1}
                        step={1}
                        value={getTimePresetIndex(selectedMaintenance?.timeInterval)}
                        minimumTrackTintColor="#2D3261"
                        maximumTrackTintColor="#D6DDEE"
                        thumbTintColor="#FFD60A"
                        onValueChange={value => handleIntervalChange('timeInterval', value)}
                      />
                    </View>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>INTERVALO POR KM</Text>
                      <View style={styles.intervalValuePill}>
                        <Text style={styles.detailMetaValue}>{selectedMaintenance?.kmInterval || '--'}</Text>
                      </View>
                      <Slider
                        style={styles.intervalSlider}
                        minimumValue={0}
                        maximumValue={KM_INTERVAL_PRESETS.length - 1}
                        step={1}
                        value={getKmPresetIndex(selectedMaintenance?.kmInterval)}
                        minimumTrackTintColor="#2D3261"
                        maximumTrackTintColor="#D6DDEE"
                        thumbTintColor="#FFD60A"
                        onValueChange={value => handleIntervalChange('kmInterval', value)}
                      />
                    </View>
                  </View>
                  <View style={styles.detailFooter}>
                    <TouchableOpacity
                      style={[
                        styles.detailSaveBtn,
                        !hasValidLastReview ? styles.detailSaveBtnDisabled : null,
                      ]}
                      activeOpacity={0.85}
                      disabled={savingDetailChanges || !hasValidLastReview}
                      onPress={handleSaveDetailChanges}>
                      {savingDetailChanges ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Icons name="save" size={14} color="#FFFFFF" style={styles.detailSaveBtnIcon} />
                          <Text style={styles.detailSaveBtnText}>Guardar cambios</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={missingDataModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMissingDataModalVisible(false)}>
        <TouchableOpacity
          style={styles.missingDataOverlay}
          activeOpacity={1}
          onPress={() => setMissingDataModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { }}
            style={styles.missingDataCard}>
            <View style={styles.missingDataIconWrap}>
              <Icons name="info-circle" size={24} color="#FFD60A" />
            </View>
            <Text style={styles.missingDataTitle}>Te faltan algunos registros</Text>
            <Text style={styles.missingDataText}>
              {missingDataCount > 1
                ? `Tienes ${missingDataCount} mantenimientos sin ultima revision cargada. Completa esos datos para no perder el seguimiento de tu vehiculo.`
                : 'Tienes un mantenimiento sin ultima revision cargada. Completa ese dato para no perder el seguimiento de tu vehiculo.'}
            </Text>
            <TouchableOpacity
              style={styles.missingDataBtn}
              activeOpacity={0.85}
              onPress={() => setMissingDataModalVisible(false)}>
              <Text style={styles.missingDataBtnText}>Entendido</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={saveSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveSuccessModalVisible(false)}>
        <TouchableOpacity
          style={styles.saveSuccessOverlay}
          activeOpacity={1}
          onPress={() => setSaveSuccessModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { }}
            style={styles.saveSuccessCard}>
            <View style={styles.saveSuccessIconWrap}>
              <Icons name="check" size={22} color="#FFD60A" />
            </View>
            <Text style={styles.saveSuccessTitle}>¡Cambios guardados!</Text>
            <Text style={styles.saveSuccessText}>
              Se actualizaron tus datos de mantenimiento correctamente.
            </Text>
            <TouchableOpacity
              style={styles.saveSuccessBtn}
              activeOpacity={0.85}
              onPress={() => setSaveSuccessModalVisible(false)}>
              <Text style={styles.saveSuccessBtnText}>Perfecto</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={kmSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setKmSuccessModalVisible(false)}>
        <TouchableOpacity
          style={styles.kmSuccessOverlay}
          activeOpacity={1}
          onPress={() => setKmSuccessModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.kmSuccessCard}>
            <View style={styles.kmSuccessIconRing}>
              <Icons name="tachometer-alt" size={28} color="#FFD60A" />
            </View>
            <Text style={styles.kmSuccessTitle}>¡Kilometraje guardado!</Text>
            <Text style={styles.kmSuccessHighlight}>
              {kmSuccessFormatted ? `${kmSuccessFormatted} km` : 'Tu kilometraje'}
            </Text>
            <Text style={styles.kmSuccessMessage}>
              Así mantienes los datos de tu vehículo siempre actualizados y las notificaciones que
              usan el kilometraje pueden funcionar al 100%.
            </Text>
            <TouchableOpacity
              style={styles.kmSuccessBtn}
              activeOpacity={0.88}
              onPress={() => setKmSuccessModalVisible(false)}>
              <Text style={styles.kmSuccessBtnText}>Genial, gracias</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={kmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !savingVehicleKm && setKmModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.kmModalKeyboardRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.kmModalRoot}>
            <TouchableOpacity
              style={styles.kmModalBackdrop}
              activeOpacity={1}
              onPress={() => !savingVehicleKm && setKmModalVisible(false)}
            />
            <View style={styles.kmModalCard} pointerEvents="box-none">
              <View style={styles.kmModalHeader}>
                <View style={styles.kmModalHeaderIcon}>
                  <Icons name="road" size={20} color="#FFD60A" />
                </View>
                <Text style={styles.kmModalTitle}>Actualizar kilometraje</Text>
                <Text style={styles.kmModalSubtitle}>
                  Usamos este dato para calcular cuánto falta para cada mantenimiento por km.
                </Text>
              </View>
              <View style={styles.kmModalInputWrap}>
                <Text style={styles.kmModalInputLabel}>Odómetro (km)</Text>
                <TextInput
                  style={styles.kmModalInput}
                  value={kmEditDraft}
                  onChangeText={t => setKmEditDraft(t.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  placeholder="Ej. 45200"
                  placeholderTextColor="#94A3B8"
                  maxLength={9}
                  editable={!savingVehicleKm}
                />
              </View>
              <View style={styles.kmModalActions}>
                <TouchableOpacity
                  style={styles.kmModalBtnGhost}
                  activeOpacity={0.85}
                  disabled={savingVehicleKm}
                  onPress={() => setKmModalVisible(false)}>
                  <Text style={styles.kmModalBtnGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.kmModalBtnPrimary}
                  activeOpacity={0.88}
                  disabled={savingVehicleKm}
                  onPress={handleSaveVehicleKm}>
                  {savingVehicleKm ? (
                    <ActivityIndicator color="#1F2344" />
                  ) : (
                    <Text style={styles.kmModalBtnPrimaryText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DatePicker
        modal
        mode="date"
        open={lastReviewPickerVisible}
        date={lastReviewPickerDate}
        onConfirm={handleConfirmLastReviewInModal}
        onCancel={() => setLastReviewPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },
  header: {
    backgroundColor: '#1F2344',
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 7,
    borderBottomColor: '#FFD60A',
  },
  headerCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -34,
    right: -22,
  },
  headerCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 24,
    left: -14,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,214,10,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 16,
    top: 28,
    zIndex: 3,
  },
  headerTextWrap: { flex: 1, paddingHorizontal: 48, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFD60A', marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, opacity: 0.96, fontWeight: '600', textAlign: 'center' },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 96 },
  filterFab: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2344',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 40,
  },
  filterFabDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9,13,46,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  filterModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2344',
  },
  filterModalHint: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
    lineHeight: 17,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4FC',
  },
  filterCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  filterOptionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3261',
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
  },
  filterResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterResetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  filterApplyBtn: {
    backgroundColor: '#1F2344',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginLeft: 10,
  },
  filterApplyBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD60A',
  },
  filterEmptyBtn: {
    marginTop: 14,
    backgroundColor: '#1F2344',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  filterEmptyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD60A',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7FF',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#0A1840',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 18, fontWeight: '900', color: '#1F2344', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#5D668A', lineHeight: 19, fontWeight: '600' },
  vehicleHeroRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateChip: {
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    maxWidth: '48%',
  },
  plateChipIcon: { marginRight: 6 },
  plateChipText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  vehicleHeroModel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2344',
  },
  vehicleTagRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  vehicleTagChip: {
    marginHorizontal: 3,
    marginBottom: 6,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(45,50,97,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45,50,97,0.18)',
  },
  vehicleTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D3261',
  },
  kmHeroOuter: {
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  kmHeroTouchable: {
    width: '96%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2344',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#FFD60A',
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 8,
  },
  kmHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kmHeroTextCol: { flex: 1, minWidth: 0 },
  kmHeroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,214,10,0.95)',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  kmHeroValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  kmHeroHint: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
  },
  kmHeroChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,214,10,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmModalKeyboardRoot: { flex: 1 },
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 14,
    zIndex: 2,
  },
  kmModalHeader: { alignItems: 'center', marginBottom: 18 },
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
  kmModalInputWrap: { marginBottom: 20 },
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
  kmModalActions: { flexDirection: 'row' },
  kmModalBtnGhost: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmModalBtnGhostText: { fontSize: 15, fontWeight: '800', color: '#64748B' },
  kmModalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmModalBtnPrimaryText: { fontSize: 15, fontWeight: '900', color: '#1F2344' },
  vehicleSummaryWrap: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF8',
    paddingTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  vehicleSummaryItem: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  vehicleSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  vehicleSummaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2344',
  },
  notificationsShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: '#D9E3FB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0A1840',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  notificationsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notificationsTextWrap: { flex: 1, paddingRight: 8 },
  notificationsTitle: { fontSize: 16, fontWeight: '900', color: '#1F2344', marginBottom: 2 },
  notificationsText: { fontSize: 12, color: '#64748B', lineHeight: 17, fontWeight: '600' },
  loadingMaintenancesWrap: {
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMaintenancesText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  emptyMaintenancesWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  emptyMaintenancesTitle: {
    fontSize: 15,
    color: '#1F2344',
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyMaintenancesText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
  },
  maintenanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.6,
    borderColor: '#DDE7FF',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#0A1840',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  maintenanceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  maintenanceTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  maintenanceTitleIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  maintenanceTitle: { flex: 1, fontSize: 18, fontWeight: '900', color: '#1F2344' },
  maintenanceBadge: {
    backgroundColor: 'rgba(255,214,10,0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  maintenanceBadgeWarning: {
    backgroundColor: 'rgba(255,214,10,0.22)',
  },
  maintenanceBadgeDanger: {
    backgroundColor: 'rgba(255,107,107,0.2)',
  },
  maintenanceBadgeSoft: {
    backgroundColor: 'rgba(140,168,255,0.24)',
  },
  maintenanceBadgeText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },
  maintenanceSubtitle: { fontSize: 14, color: '#5D668A', lineHeight: 20, fontWeight: '600', marginBottom: 8 },
  reviewGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  reviewBox: {
    width: '49%',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DFE8FD',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 9,
    justifyContent: 'flex-start',
  },
  reviewBoxLeft: {
    paddingRight: 3,
  },
  reviewLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  reviewDateValue: {
    fontSize: 13,
    color: '#1F2344',
    fontWeight: '800',
    lineHeight: 17,
    marginBottom: 8,
  },
  reviewKmBlock: {
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C9D6F0',
  },
  reviewKmSubLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  reviewKmSubValue: {
    fontSize: 11,
    color: '#5D668A',
    fontWeight: '400',
    lineHeight: 14,
  },
  maintenanceBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  maintenanceMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6FF',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: '#DCE6FF',
  },
  maintenanceMetaChipKm: {
    flex: 1,
    alignItems: 'flex-start',
    borderRadius: 12,
    marginRight: 6,
    maxWidth: '64%',
  },
  maintenanceKmStack: { marginLeft: 6, flexShrink: 1 },
  maintenanceKmLabelFirst: { marginBottom: 1 },
  maintenanceKmIntervalLabel: { marginTop: 5, marginBottom: 1 },
  maintenanceKmIntervalValue: { fontSize: 12, color: '#2D3261', fontWeight: '800' },
  maintenanceMetaChipAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7D6',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FFE8A3',
  },
  maintenanceMetaChipAltShrink: { flexShrink: 0 },
  maintenanceMetaChipAltText: {
    fontSize: 11,
    color: '#2D3261',
    fontWeight: '900',
    marginLeft: 5,
  },
  detailOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  detailBackdrop: {
    flex: 1,
  },
  detailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 0,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderColor: '#E6ECFA',
    minHeight: '72%',
    maxHeight: '92%',
  },
  detailSheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  detailCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  detailIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  detailTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 12,
  },
  importantCard: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DDE7FF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  importantIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  importantTextWrap: {
    flex: 1,
  },
  importantTitle: {
    fontSize: 14,
    color: '#1F2344',
    fontWeight: '900',
    marginBottom: 2,
  },
  importantText: {
    fontSize: 13,
    color: '#5D668A',
    fontWeight: '600',
    lineHeight: 18,
  },
  detailReviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailReviewBox: {
    width: '49%',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DFE8FD',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    minHeight: 82,
    justifyContent: 'center',
  },
  detailReviewBoxLeft: {
    marginRight: 4,
  },
  detailReviewLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '800',
    marginBottom: 4,
  },
  detailReviewValue: {
    fontSize: 15,
    color: '#1F2344',
    fontWeight: '900',
  },
  detailReviewValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailReviewValueFlex: {
    flex: 1,
    minWidth: 0,
  },
  detailReviewEditBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EAF0FF',
  },
  detailReviewActionBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF0FF',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  detailReviewActionText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#2D3261',
    fontWeight: '800',
  },
  frequencySectionTitle: {
    fontSize: 14,
    color: '#1F2344',
    fontWeight: '900',
    marginBottom: 8,
  },
  detailMetaWrap: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDF8',
    paddingTop: 10,
    flexDirection: 'column',
  },
  detailMetaItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECFA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 9,
    marginBottom: 8,
  },
  detailMetaItemLeft: {
    marginRight: 0,
  },
  detailMetaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '800',
    marginBottom: 3,
  },
  detailMetaValue: {
    fontSize: 13,
    color: '#1F2344',
    fontWeight: '900',
    textAlign: 'center',
  },
  intervalValuePill: {
    width: '100%',
    minHeight: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE7FF',
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  intervalSlider: {
    width: '100%',
    height: 30,
    marginTop: 4,
  },
  detailFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF8',
  },
  detailSaveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  detailSaveBtnDisabled: {
    backgroundColor: '#B7C0D9',
  },
  detailSaveBtnIcon: {
    marginRight: 8,
  },
  detailSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  missingDataOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  missingDataCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  missingDataIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  missingDataTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 8,
    textAlign: 'center',
  },
  missingDataText: {
    fontSize: 14,
    color: '#5D668A',
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  missingDataBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingDataBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  saveSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  saveSuccessCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveSuccessIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveSuccessTitle: {
    fontSize: 20,
    color: '#1F2344',
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  saveSuccessText: {
    fontSize: 14,
    color: '#5D668A',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  saveSuccessBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  kmSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  kmSuccessCard: {
    width: '100%',
    maxWidth: 352,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFD60A',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#0A1840',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  kmSuccessIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#1F2344',
    borderWidth: 3,
    borderColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  kmSuccessTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1F2344',
    textAlign: 'center',
    marginBottom: 6,
  },
  kmSuccessHighlight: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
  },
  kmSuccessMessage: {
    fontSize: 15,
    color: '#5D668A',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  kmSuccessBtn: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  kmSuccessBtnText: {
    color: '#1F2344',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default VehicleMaintenanceScreen;
