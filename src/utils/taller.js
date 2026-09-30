// Utilidades de presentación de talleres y servicios, compartidas por el
// inicio del conductor, los resultados y la ficha del taller.

const KEYS_BY_JS_DOW = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

export const normalizeDayKey = dayKey =>
  String(dayKey ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const timeStrToMinutes = s => {
  if (!s || typeof s !== 'string') return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};

/** Acepta `horarios_atencion` como objeto o como JSON en texto. */
export const parseHorarios = raw => {
  let h = raw;
  if (typeof h === 'string' && h.trim()) {
    try {
      h = JSON.parse(h);
    } catch {
      return null;
    }
  }
  if (!h || typeof h !== 'object' || Array.isArray(h)) return null;
  return Object.entries(h).reduce((acc, [k, v]) => {
    acc[normalizeDayKey(k)] = v;
    return acc;
  }, {});
};

/**
 * Estado de apertura según `horarios_atencion`.
 * @returns {'open'|'closed'|'unknown'}
 * 'unknown' cuando el taller no cargó un horario estructurado: no se le
 * castiga ocultándolo, solo no se afirma que esté abierto.
 */
export const openState = (horariosRaw, now = new Date()) => {
  const h = parseHorarios(horariosRaw);
  if (!h) return 'unknown';
  const anyDay = Object.values(h).some(v => v && v.enabled === true);
  if (!anyDay) return 'unknown';
  const slot = h[KEYS_BY_JS_DOW[now.getDay()]];
  if (!slot || slot.enabled !== true) return 'closed';
  const openM = timeStrToMinutes(slot.open);
  const closeM = timeStrToMinutes(slot.close);
  if (openM == null || closeM == null) return 'unknown';
  const cur = now.getHours() * 60 + now.getMinutes();
  const inside =
    closeM >= openM ? cur >= openM && cur <= closeM : cur >= openM || cur <= closeM;
  return inside ? 'open' : 'closed';
};

export const isOpenNow = (horariosRaw, now) => openState(horariosRaw, now) === 'open';

/** "Cierra a las 17:00" / "Abre mañana a las 8:00" para la ficha. */
export const openHint = (horariosRaw, now = new Date()) => {
  const h = parseHorarios(horariosRaw);
  if (!h) return '';
  const today = h[KEYS_BY_JS_DOW[now.getDay()]];
  const state = openState(horariosRaw, now);
  if (state === 'open' && today?.close) return `Cierra a las ${hora12(today.close)}`;
  if (state !== 'closed') return '';
  const cur = now.getHours() * 60 + now.getMinutes();
  if (today?.enabled && timeStrToMinutes(today.open) > cur) {
    return `Abre hoy a las ${hora12(today.open)}`;
  }
  for (let i = 1; i <= 7; i += 1) {
    const d = h[KEYS_BY_JS_DOW[(now.getDay() + i) % 7]];
    if (d?.enabled && d.open) {
      return i === 1 ? `Abre mañana a las ${hora12(d.open)}` : `Abre el ${DAY_NAME[(now.getDay() + i) % 7]} a las ${hora12(d.open)}`;
    }
  }
  return '';
};

/**
 * Hora convencional (12 h) para mostrar. Se guarda siempre "HH:mm" (24 h),
 * que es lo que usan el servidor, el panel y el cálculo de abierto/cerrado.
 * "08:00" → "8:00 a. m." · "17:30" → "5:30 p. m." · corto: "8 a. m."
 */
export const hora12 = (hhmm, {corto = false} = {}) => {
  const m = String(hhmm ?? '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return String(hhmm ?? '');
  const h = parseInt(m[1], 10) % 24;
  const min = m[2];
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return corto && min === '00' ? `${h12} ${sufijo}` : `${h12}:${min} ${sufijo}`;
};

/** Opciones de los selectores de hora: valor 24 h, etiqueta 12 h. */
export const OPCIONES_HORA = Array.from({length: 24}, (_, h) => {
  const value = `${String(h).padStart(2, '0')}:00`;
  return {label: hora12(value), value};
});

const DAY_NAME = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const toRad = v => (v * Math.PI) / 180;

export const distanceKm = (from, lat, lng) => {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (!from || !Number.isFinite(la) || !Number.isFinite(ln)) return null;
  const R = 6371;
  const dLat = toRad(la - from.latitude);
  const dLon = toRad(ln - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(la)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Distancia de un servicio: la que calculó el servidor o, si falta, la local. */
export const serviceDistanceKm = (item, userLocation) => {
  const d = Number(item?._distanceKm);
  if (Number.isFinite(d)) return d;
  const u = item?.taller?.ubicacion;
  return distanceKm(userLocation, u?.lat, u?.lng);
};

/** 0,8 km · 1,2 km · 12 km (formato venezolano, coma decimal). */
export const formatKm = km => {
  if (km == null || !Number.isFinite(km)) return '';
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
};

export const ratingValue = item => {
  const n = Number(String(item?.puntuacion ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const formatRating = n =>
  n == null ? '' : n.toFixed(1).replace('.', ',');

export const priceValue = item => {
  const n = Number(
    String(item?.precio ?? '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, ''),
  );
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const formatPrice = n =>
  n == null ? '' : `$${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')}`;

export const sentenceCase = value => {
  const lower = String(value || '').trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const firstImage = val => {
  if (!val) return null;
  if (Array.isArray(val)) return val.length ? String(val[0]).trim() || null : null;
  const s = String(val).trim();
  return s || null;
};

/**
 * Teléfono venezolano a formato internacional para WhatsApp (wa.me).
 * 0414-123.45.67 → 584141234567 · 4141234567 → 584141234567
 */
export const toWhatsAppNumber = raw => {
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('58')) return d;
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return `58${d}`;
  return d;
};

export const tallerPhone = t => t?.phone || t?.telefono || '';
export const tallerWhatsApp = t => t?.whatsapp || t?.phone || t?.telefono || '';
export const tallerName = t =>
  t?.nombre_taller || t?.nombre || t?.razon_social || 'Taller';
export const tallerCoords = t => {
  const lat = parseFloat(t?.ubicacion?.lat);
  const lng = parseFloat(t?.ubicacion?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? {lat, lng} : null;
};
