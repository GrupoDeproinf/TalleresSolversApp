/**
 * Misma lectura de getUserByUid que VehicleMaintenanceScreen (notificacionesVehiculos).
 */
const getUserDataFromGetUserResponse = responseData => {
  const data = responseData;
  const userData =
    data && typeof data === 'object' && !Array.isArray(data) && (data.data || data.user)
      ? data.data || data.user
      : data;
  return userData && typeof userData === 'object' ? userData : {};
};

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
  1000, 3000, 5000, 8000, 10000, 15000, 20000, 25000, 30000, 35000, 100000,
];

const toBool = value => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  return ['true', '1', 'si', 'sí', 'activo', 'activa', 'enabled'].includes(
    normalized,
  );
};

const parseDateFlexible = value => {
  const raw = String(value || '').trim();
  if (!raw || raw === '—' || raw === '--') return null;
  const normalized = raw.replace(/\s+/g, ' ').replace(/-/g, '/').trim();

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
  const exact = TIME_INTERVAL_PRESETS.find(
    p => inferDaysFromTimeInterval(p) === n,
  );
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
  const startNext = new Date(
    nextDue.getFullYear(),
    nextDue.getMonth(),
    nextDue.getDate(),
  );
  return Math.round((startNext - startToday) / (1000 * 60 * 60 * 24));
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

const getMaintenanceStatus = (dueInDays, lastReview) => {
  const normalizedLastReview = String(lastReview || '').trim();
  const noData =
    !normalizedLastReview ||
    normalizedLastReview === '—' ||
    normalizedLastReview === '--';
  if (noData) return {label: 'PENDIENTE DATA', color: '#6B7280'};
  const parsedLast = parseDateFlexible(lastReview);
  if (!parsedLast) return {label: 'PENDIENTE DATA', color: '#6B7280'};
  if (dueInDays < 0) return {label: 'VENCIDO', color: '#E53935'};
  if (dueInDays <= 5) return {label: 'POR VENCER', color: '#F9A825'};
  return {label: 'AL DIA', color: '#2E7D32'};
};

const mergeKmIntoMaintenanceStatus = (timeStatus, kmDelta) => {
  if (kmDelta == null || !Number.isFinite(kmDelta)) {
    return timeStatus;
  }
  if (kmDelta < 0) {
    return {label: 'VENCIDO', color: '#E53935'};
  }
  if (kmDelta >= 0 && kmDelta <= 3000) {
    if (timeStatus.label === 'VENCIDO') {
      return timeStatus;
    }
    return {label: 'POR VENCER', color: '#F9A825'};
  }
  return timeStatus;
};

const getEffectiveMaintenanceStatus = (dueInDays, lastReview, kmDeltaUntilNext) => {
  const timeStatus = getMaintenanceStatus(dueInDays, lastReview);
  return mergeKmIntoMaintenanceStatus(timeStatus, kmDeltaUntilNext);
};

const getVehicleId = v =>
  String(v?.id ?? v?.uid ?? v?.vehiculo_uid ?? '').trim();

const mapNotificationToMaintenanceItem = (item, index, vehicleOdometerKmResolved) => {
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
  let proximoKmNum = parseOdometerToInt(
    item?.proximoKM ??
      item?.proximokm ??
      item?.proximo_km ??
      item?.proximoKm,
  );
  if (proximoKmNum == null && apiUltimoKm != null && intervalKmNum > 0) {
    proximoKmNum = apiUltimoKm + intervalKmNum;
  }

  let kmUntilNextServiceText = '--';
  let kmDeltaUntilNext = null;
  if (vehicleOdometerKm == null) {
    kmUntilNextServiceText = 'Indica el KM del vehículo';
  } else if (proximoKmNum == null) {
    kmUntilNextServiceText = 'Sin hito en km';
  } else {
    const diff = proximoKmNum - vehicleOdometerKm;
    kmDeltaUntilNext = diff;
    if (diff > 0) {
      kmUntilNextServiceText = `Faltan ${diff.toLocaleString('es-ES')} km`;
    } else if (diff === 0) {
      kmUntilNextServiceText = 'Estás en el hito';
    } else {
      kmUntilNextServiceText = `Pasaste ${Math.abs(diff).toLocaleString('es-ES')} km`;
    }
  }

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
    ultimoKM: formatMaintenanceKmCell(apiUltimoKm),
    proximoKM: formatMaintenanceKmCell(proximoKmNum),
    kmUntilNextServiceText,
    kmDeltaUntilNext,
    raw: item,
  };
};

/**
 * Cuenta notificaciones activas por estado (misma lógica que VehicleMaintenanceScreen / modal inicio).
 */
export function countActiveMaintenanceByAlertLevel(vehicle, notificationsBlock) {
  const odometer = parseOdometerToInt(vehicle?.KM ?? vehicle?.km_actual ?? '');
  const list = Array.isArray(notificationsBlock?.notificaciones)
    ? notificationsBlock.notificaciones
    : [];
  let vencidos = 0;
  let porVencer = 0;
  let alDia = 0;
  let totalActive = 0;
  list.forEach((n, idx) => {
    if (!toBool(n?.active)) return;
    totalActive += 1;
    const m = mapNotificationToMaintenanceItem(n, idx, odometer);
    const eff = getEffectiveMaintenanceStatus(
      m.dueInDays,
      m.lastReview,
      m.kmDeltaUntilNext,
    );
    if (eff.label === 'VENCIDO') vencidos += 1;
    else if (eff.label === 'POR VENCER') porVencer += 1;
    else if (eff.label === 'AL DIA') alDia += 1;
  });
  return {vencidos, porVencer, alDia, totalActive};
}

/** `showMaintenancePopup` true (o ausente) = mostrar aviso; false = no mostrar. */
export const shouldShowMaintenancePopupModal = ud => {
  const v = ud?.showMaintenancePopup;
  if (v === undefined || v === null) return true;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (s === 'false' || s === '0') return false;
  if (s === 'true' || s === '1') return true;
  return true;
};

/**
 * Endpoints: getUserByUid + getVehiculosByUsuarioUid (misma fuente que VehicleMaintenanceScreen).
 * Estado amarillo/rojo: getEffectiveMaintenanceStatus → solo VENCIDO y POR VENCER en la lista.
 *
 * @param {object} getUserResponseData - opcional: body ya devuelto por getUserByUid (evita segunda llamada).
 */
export async function fetchHomeDueMaintenanceAlerts(
  api,
  uid,
  getUserResponseData,
) {
  const uidStr = String(uid ?? '').trim();
  if (!uidStr) return [];

  try {
    const userPayload =
      getUserResponseData !== undefined && getUserResponseData !== null
        ? getUserResponseData
        : (await api.post('usuarios/getUserByUid', {uid: uidStr}))?.data;

    const userData = getUserDataFromGetUserResponse(userPayload ?? {});
    const notificacionesVehiculos =
      userData?.notificacionesVehiculos ??
      userData?.userData?.notificacionesVehiculos ??
      [];

    const list = Array.isArray(notificacionesVehiculos)
      ? notificacionesVehiculos
      : [];

    const vehRes = await api.post('usuarios/getVehiculosByUsuarioUid', {
      uid: uidStr,
    });
    const vehData = vehRes?.data;
    const vehicles = Array.isArray(vehData) ? vehData : vehData?.data ?? [];
    if (!Array.isArray(vehicles) || vehicles.length === 0) return [];

    const rows = [];
    for (const vehicle of vehicles) {
      const vehicleId = getVehicleId(vehicle);
      if (!vehicleId) continue;

      const vehicleOdometerKmResolved = parseOdometerToInt(
        vehicle?.KM ?? vehicle?.km_actual ?? '',
      );

      const placa = String(vehicle?.vehiculo_placa || '').toUpperCase();
      const mm = [vehicle?.vehiculo_marca, vehicle?.vehiculo_modelo]
        .filter(Boolean)
        .join(' ');

      const block = list.find(
        item => String(item?.uidvehicle ?? '') === vehicleId,
      );
      const activeMaintenances = (block?.notificaciones || [])
        .filter(n => toBool(n?.active))
        .map((n, idx) =>
          mapNotificationToMaintenanceItem(n, idx, vehicleOdometerKmResolved),
        );

      for (const m of activeMaintenances) {
        const eff = getEffectiveMaintenanceStatus(
          m.dueInDays,
          m.lastReview,
          m.kmDeltaUntilNext,
        );
        if (eff.label !== 'VENCIDO' && eff.label !== 'POR VENCER') continue;
        rows.push({
          key: `${vehicleId}-${m.id}`,
          vehicleId,
          vehiclePlaca: placa || '—',
          vehicleMarcaModelo: mm || 'Vehículo',
          title: m.title,
          subtitle: m.subtitle,
          nextReview: m.nextReview,
          dueInDays: Number(m.dueInDays ?? 0),
          kmUntilNextServiceText: m.kmUntilNextServiceText,
          statusLabel: eff.label,
          statusColor: eff.color,
        });
      }
    }
    return rows;
  } catch (_) {
    return [];
  }
}
