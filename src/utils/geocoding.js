// Dirección escrita a partir de un punto del mapa (geocodificación inversa de
// Mapbox). Usa la misma clave pública del selector de ubicación.
const MAPBOX_TOKEN =
  'pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ';

/**
 * @returns {Promise<string>} "Av. Francisco de Miranda, Chacao, Miranda" o ''
 * si no hay conexión o Mapbox no conoce la zona. Nunca lanza error.
 */
export const direccionDesdeCoordenadas = async (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${MAPBOX_TOKEN}&language=es&limit=1` +
    '&types=address,poi,neighborhood,locality,place';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {signal: ctrl.signal});
    clearTimeout(t);
    if (!res.ok) return '';
    const data = await res.json();
    const lugar = data?.features?.[0]?.place_name || '';
    // Mapbox agrega el país al final: sobra dentro de Venezuela.
    return lugar.replace(/,\s*Venezuela$/i, '').trim();
  } catch (_) {
    return '';
  }
};
