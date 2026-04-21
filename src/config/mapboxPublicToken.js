/**
 * Token Mapbox para WebView, @rnmapbox/maps y APIs (Directions).
 * Valor real en `mapboxPublicToken.local.js` (no debe contener secretos en commits).
 */
const raw = require('./mapboxPublicToken.local.js');
const resolved =
  raw && typeof raw === 'object' && 'default' in raw ? raw.default : raw;

export function getMapboxPublicToken() {
  return typeof resolved === 'string' ? resolved.trim() : '';
}
