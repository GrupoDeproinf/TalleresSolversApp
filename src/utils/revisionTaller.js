// Lo que el certificador revisa antes de aprobar un taller. Lo usan la lista
// de negocios (tarjeta con progreso y «Falta:») y la ficha del taller
// («Revisión»), para que las dos cuenten exactamente lo mismo.

/** Estatus que esperan una decisión del certificador. */
export const ESTADOS_POR_REVISAR = ['En espera por aprobación', 'En espera de documentos'];

const lleno = v => (typeof v === 'string' ? v.trim() !== '' : v != null && v !== false);

/**
 * Puntos de la revisión.
 * @param r.rif, r.docRif, r.frente, r.interior, r.ubicacion: booleanos
 * @param r.servicios: número de servicios cargados, o null si no se sabe
 *        (la lista no los trae: entonces ese punto no se cuenta).
 */
export const puntosRevision = ({rif, docRif, frente, interior, ubicacion, servicios = null}) => [
  {key: 'rif', label: 'Número de RIF', corto: 'número de RIF', ok: !!rif},
  {key: 'docRif', label: 'Foto del RIF', corto: 'foto del RIF', ok: !!docRif},
  {key: 'frente', label: 'Foto del frente', corto: 'foto del frente', ok: !!frente},
  {key: 'interior', label: 'Foto del interior', corto: 'foto del interior', ok: !!interior},
  {key: 'ubicacion', label: 'Ubicación en el mapa', corto: 'ubicación', ok: !!ubicacion},
  ...(servicios == null
    ? []
    : [{key: 'servicios', label: 'Al menos un servicio', corto: 'un servicio', ok: servicios > 0}]),
];

/** Puntos de revisión a partir del documento del taller tal como llega de la API. */
export const revisionDeFicha = t => {
  const lat = Number(t?.ubicacion?.lat);
  const lng = Number(t?.ubicacion?.lng);
  return puntosRevision({
    rif: lleno(t?.rif),
    docRif: lleno(t?.rifIdFiscal),
    frente: lleno(t?.fotoFrenteTaller),
    interior: lleno(t?.fotoInternaTaller),
    ubicacion: Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0),
  });
};

/** {listos, total, faltan: [puntos]} */
export const resumenRevision = puntos => {
  const faltan = puntos.filter(p => !p.ok);
  return {listos: puntos.length - faltan.length, total: puntos.length, faltan};
};

/** «Falta: foto del interior y ubicación». */
export const textoFalta = faltan => {
  const n = faltan.map(p => p.corto);
  if (!n.length) return '';
  if (n.length === 1) return `Falta: ${n[0]}`;
  return `Falta: ${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
};

/** Días completos desde una fecha (0 = hoy). */
export const diasDesde = fecha => {
  if (!fecha) return null;
  const d = Math.floor((Date.now() - fecha.getTime()) / 86400000);
  return d < 0 ? 0 : d;
};

/** «Espera hoy», «Espera 1 día», «Espera 6 días». */
export const textoEspera = dias => {
  if (dias == null) return '';
  if (dias === 0) return 'Llegó hoy';
  return `Espera ${dias} ${dias === 1 ? 'día' : 'días'}`;
};
