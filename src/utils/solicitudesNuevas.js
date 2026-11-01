// Solicitudes de servicio que el taller aún no ha visto.
//
// "Nueva" = está en espera y el taller todavía no abrió la pestaña Solicitudes
// desde que llegó. Las ids vistas se guardan en el teléfono: al abrir la
// pestaña se marcan todas las que aparecen en la lista.
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../axiosInstance';

const CLAVE = '@solicitudesVistas';
const MAXIMO_GUARDADAS = 300;
export const RADIO_SOLICITUDES_KM = 10;
const ESTADO_EN_ESPERA = 'En espera por aprobación';

const aRad = v => (v * Math.PI) / 180;
export const distanciaKm = (lat1, lon1, lat2, lon2) => {
  const [a1, o1, a2, o2] = [lat1, lon1, lat2, lon2].map(v => parseFloat(v));
  if (![a1, o1, a2, o2].every(Number.isFinite)) return null;
  const dLat = aRad(a2 - a1);
  const dLon = aRad(o2 - o1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aRad(a1)) * Math.cos(aRad(a2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const leerVistas = async () => {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    const lista = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(lista) ? lista.map(String) : []);
  } catch (e) {
    return new Set();
  }
};

/**
 * Cuenta las solicitudes no vistas (función pura).
 * @param {Array<{id?: string, latitude?: number, longitude?: number}>} lista
 * @param {Set<string>} vistas
 * @param {{lat?: number, lng?: number}|null} ubicacion del taller (opcional)
 */
export const contarNoVistas = (lista, vistas, ubicacion) =>
  (Array.isArray(lista) ? lista : []).filter(s => {
    if (!s || !s.id || vistas.has(String(s.id))) return false;
    if (!ubicacion) return true;
    const d = distanciaKm(ubicacion.lat, ubicacion.lng, s.latitude, s.longitude);
    // Sin coordenadas en la solicitud no se puede descartar: se cuenta.
    return d == null || d <= RADIO_SOLICITUDES_KM;
  }).length;

/** Cuántas solicitudes nuevas tiene el taller. Nunca lanza: 0 si falla. */
export const contarSolicitudesNuevas = async usuario => {
  const uid = String(usuario?.uid || usuario?.id || '');
  if (!uid) return 0;
  try {
    const [{data}, vistas] = await Promise.all([
      api.post('usuarios/getSolicitudesByUsuarioAndStatus', {uid_taller: uid, status: ESTADO_EN_ESPERA}, {timeout: 20000}),
      leerVistas(),
    ]);
    const u = usuario?.ubicacion;
    const ubicacion = u && Number.isFinite(Number(u.lat)) && Number.isFinite(Number(u.lng)) ? u : null;
    return contarNoVistas(Array.isArray(data) ? data : [], vistas, ubicacion);
  } catch (e) {
    return 0;
  }
};

/** Marca como vistas las solicitudes que el taller tiene en pantalla. */
export const marcarSolicitudesVistas = async ids => {
  const nuevas = (Array.isArray(ids) ? ids : []).filter(Boolean).map(String);
  publicarSolicitudesNuevas(0);
  if (!nuevas.length) return;
  const vistas = await leerVistas();
  nuevas.forEach(id => vistas.add(id));
  const lista = [...vistas].slice(-MAXIMO_GUARDADAS);
  await AsyncStorage.setItem(CLAVE, JSON.stringify(lista)).catch(() => {});
};

// ── Conteo compartido (punto rojo en la pestaña Solicitudes) ─────────────
// Lo publica el inicio del taller al contar y la pestaña al marcarlas vistas.
let conteoActual = 0;
const oyentes = new Set();

export const publicarSolicitudesNuevas = n => {
  conteoActual = Math.max(0, Number(n) || 0);
  oyentes.forEach(fn => fn(conteoActual));
};

export const useConteoSolicitudesNuevas = () => {
  const [n, setN] = useState(conteoActual);
  useEffect(() => {
    oyentes.add(setN);
    setN(conteoActual);
    return () => {
      oyentes.delete(setN);
    };
  }, []);
  return n;
};
