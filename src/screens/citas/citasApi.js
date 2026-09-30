// Citas: llamadas al servidor (/api/citas) y formato de fechas.
// Fecha "YYYY-MM-DD" y hora "HH:mm" siempre en hora de Venezuela.
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import {hora12} from '../../utils/taller';

export const usuarioActual = async () => {
  try {
    const j = await AsyncStorage.getItem('@userInfo');
    return j ? JSON.parse(j) : null;
  } catch (_) {
    return null;
  }
};

// Mientras el servidor esté en modo "report" se manda también el uid; con
// sesión verificada el servidor usa el suyo e ignora este.
export const citasApi = {
  disponibilidad: (uid_taller, fecha, excluir) =>
    api.post('/citas/disponibilidad', {uid_taller, fecha, excluir}).then(r => r.data),
  crear: async datos => {
    const u = await usuarioActual();
    return api.post('/citas/crear', {...datos, uid_usuario: u?.uid}).then(r => r.data);
  },
  misCitas: async () => {
    const u = await usuarioActual();
    return api.post('/citas/misCitas', {uid_usuario: u?.uid}).then(r => r.data?.citas || []);
  },
  agendaTaller: async () => {
    const u = await usuarioActual();
    return api.post('/citas/agendaTaller', {uid_taller: u?.uid}).then(r => r.data?.citas || []);
  },
  actualizar: async (id, accion, extra = {}) => {
    const u = await usuarioActual();
    return api.post('/citas/actualizar', {id, accion, uid: u?.uid, ...extra}).then(r => r.data);
  },
};

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const partes = fecha => {
  const [y, m, d] = String(fecha).split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return {y, m, d, dow};
};

/** Hoy en Venezuela (UTC-4). */
export const hoyVE = () => new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 10);
const mananaVE = () => new Date(Date.now() + 20 * 3600 * 1000).toISOString().slice(0, 10);

/** Para los chips: {dia: 'Mar', num: 7, mes: 'oct'} */
export const chipFecha = fecha => {
  const {d, m, dow} = partes(fecha);
  return {dia: DIAS[dow], num: d, mes: MESES[m - 1]};
};

/** "Hoy", "Mañana" o "martes 7 oct". */
export const fechaAmigable = fecha => {
  if (fecha === hoyVE()) return 'Hoy';
  if (fecha === mananaVE()) return 'Mañana';
  const {d, m, dow} = partes(fecha);
  return `${DIAS_LARGO[dow]} ${d} ${MESES[m - 1]}`;
};

export const cuandoCita = c => `${fechaAmigable(c.fecha)} · ${hora12(c.hora)}`;

export const ESTADOS = {
  pendiente: {label: 'Por confirmar', tone: 'warn'},
  confirmada: {label: 'Confirmada', tone: 'ok'},
  completada: {label: 'Completada', tone: 'info'},
  cancelada: {label: 'Cancelada', tone: 'neutral'},
  rechazada: {label: 'No aceptada', tone: 'error'},
};

export const esActiva = c => c && ['pendiente', 'confirmada'].includes(c.estado);
export const esFutura = c => c && `${c.fecha} ${c.hora}` >= `${hoyVE()} 00:00`;

/** La cita activa más cercana (para la tarjeta del inicio). */
export const proximaCita = citas =>
  (citas || []).filter(c => esActiva(c) && esFutura(c)).sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))[0] ||
  null;

export const vehiculoTexto = v =>
  [v?.marca || v?.vehiculo_marca, v?.modelo || v?.vehiculo_modelo].filter(Boolean).join(' ') +
  ((v?.placa || v?.vehiculo_placa) ? ` · ${String(v.placa || v.vehiculo_placa).toUpperCase()}` : '');
