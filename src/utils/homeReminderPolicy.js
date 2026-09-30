import AsyncStorage from '@react-native-async-storage/async-storage';

// Frecuencia maxima de cada aviso del inicio, en dias (km = actualizar kilometraje, maint = mantenimiento vencido)
const MIN_DAYS = { km: 7, maint: 3 };
// Dias sin volver a pedir el km despues de que el usuario lo actualiza
const KM_UPDATE_QUIET_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

const keyFor = (type, uid) => `@homeReminder:${type}:${uid || 'anon'}`;

async function readState(type, uid) {
  try { const raw = await AsyncStorage.getItem(keyFor(type, uid)); return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
}
async function writeState(type, uid, patch) {
  try { const cur = await readState(type, uid); await AsyncStorage.setItem(keyFor(type, uid), JSON.stringify({ ...cur, ...patch })); } catch (_) {}
}

export async function shouldShowReminder(type, uid) {
  const s = await readState(type, uid);
  const now = Date.now();
  if (s.snoozedUntil && s.snoozedUntil > now) return false;
  const minMs = (MIN_DAYS[type] ?? 1) * DAY;
  if (s.lastShownAt && now - s.lastShownAt < minMs) return false;
  if (type === 'km' && s.lastKmUpdateAt && now - s.lastKmUpdateAt < KM_UPDATE_QUIET_DAYS * DAY) return false;
  return true;
}

export async function markReminderShown(type, uid) {
  await writeState(type, uid, { lastShownAt: Date.now() });
}

export async function snoozeReminder(type, uid, days) {
  const d = Math.max(Number(days) || 0, MIN_DAYS[type] ?? 1);
  await writeState(type, uid, { snoozedUntil: Date.now() + d * DAY });
}

export async function markKmUpdated(uid) {
  const now = Date.now();
  await writeState('km', uid, { lastKmUpdateAt: now, snoozedUntil: now + KM_UPDATE_QUIET_DAYS * DAY });
}
