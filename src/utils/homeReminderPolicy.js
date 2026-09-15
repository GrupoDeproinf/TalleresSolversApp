// Frecuencia de los avisos del inicio (kilometraje y mantenimientos).
// Reglas: máximo un aviso por día; "Cerrar" pospone 1 día; actualizar el
// kilometraje apaga el aviso de km por 7 días. Se guarda por usuario en el
// teléfono, así que funciona sin cambios en el servidor. (APP-UX-1)
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAY = 24 * 60 * 60 * 1000;
const SHOW_MIN_INTERVAL_MS = DAY;
const CLOSE_SNOOZE_DAYS = 1;
const KM_UPDATE_QUIET_DAYS = 7;

const key = (type, uid) => `@homeReminder:${type}:${uid || 'anon'}`;

const read = async (type, uid) => {
  try {
    const j = await AsyncStorage.getItem(key(type, uid));
    return j ? JSON.parse(j) : {};
  } catch (_) {
    return {};
  }
};

const write = async (type, uid, patch) => {
  const cur = await read(type, uid);
  try {
    await AsyncStorage.setItem(key(type, uid), JSON.stringify({...cur, ...patch}));
  } catch (_) {}
};

/** type: 'km' | 'maint' */
export const shouldShowReminder = async (type, uid) => {
  const s = await read(type, uid);
  const now = Date.now();
  if (s.snoozedUntil && now < s.snoozedUntil) return false;
  if (s.lastShownAt && now - s.lastShownAt < SHOW_MIN_INTERVAL_MS) return false;
  if (type === 'km' && s.lastKmUpdateAt && now - s.lastKmUpdateAt < KM_UPDATE_QUIET_DAYS * DAY) return false;
  return true;
};

export const markReminderShown = (type, uid) => write(type, uid, {lastShownAt: Date.now()});

export const snoozeReminder = (type, uid, days = CLOSE_SNOOZE_DAYS) =>
  write(type, uid, {snoozedUntil: Date.now() + days * DAY});

export const markKmUpdated = uid =>
  write('km', uid, {lastKmUpdateAt: Date.now(), snoozedUntil: Date.now() + KM_UPDATE_QUIET_DAYS * DAY});
