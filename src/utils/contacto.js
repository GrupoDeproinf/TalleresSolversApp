// Abrir llamada, WhatsApp y rutas externas con mensajes claros cuando algo
// no está disponible (en vez de fallar en silencio).
import {Linking, Platform} from 'react-native';
import showToast from './showToast';
import {toWhatsAppNumber} from './taller';

export const puedeLlamar = phone => String(phone || '').replace(/\D/g, '').length >= 7;

export const llamar = async phone => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!puedeLlamar(digits)) {
    showToast('Este taller no tiene teléfono registrado.');
    return false;
  }
  try {
    await Linking.openURL(`tel:${digits}`);
    return true;
  } catch (_) {
    showToast('Tu teléfono no pudo abrir la llamada.');
    return false;
  }
};

export const puedeWhatsApp = raw => {
  const n = toWhatsAppNumber(raw);
  // Solo móviles venezolanos (58 4xx) o números internacionales largos.
  return n.length >= 11 && !(n.startsWith('582'));
};

/**
 * Abre WhatsApp con un mensaje inicial. Usa wa.me, que funciona tenga o no la
 * app instalada (si no la tiene, abre el navegador).
 */
export const abrirWhatsApp = async (raw, mensaje = '') => {
  const n = toWhatsAppNumber(raw);
  if (!puedeWhatsApp(raw)) {
    showToast('Este taller no tiene WhatsApp registrado.');
    return false;
  }
  const q = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  try {
    await Linking.openURL(`https://wa.me/${n}${q}`);
    return true;
  } catch (_) {
    showToast('No pudimos abrir WhatsApp. Intenta de nuevo.');
    return false;
  }
};

/** Ruta en la app de mapas del teléfono (respaldo si la navegación interna falla). */
export const abrirRutaExterna = async ({lat, lng}, nombre = '') => {
  const label = encodeURIComponent(nombre || 'Taller');
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${lat},${lng}&q=${label}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch (_) {
    showToast('No pudimos abrir el mapa.');
    return false;
  }
};
