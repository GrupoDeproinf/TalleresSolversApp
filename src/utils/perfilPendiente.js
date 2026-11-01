// Qué le falta al perfil del negocio (observación 1.4.6, pantallas Inicio y
// Perfil). Ninguno de estos datos es obligatorio para registrarse, pero sin
// ellos el conductor ve un perfil a medias: se piden después del registro.
import {parseHorarios} from './taller';

const texto = v => String(v || '').trim();
const urlDe = v => (typeof v === 'string' ? v.trim() : v && typeof v === 'object' ? texto(v.url || v.uri) : '');

/** Lleva los datos del usuario guardado a la forma que usa `pendientesDelPerfil`. */
export const datosPerfilDesdeUsuario = u => {
  const h = parseHorarios(u?.horarios_atencion) || {};
  const lat = u?.ubicacion?.lat ?? u?.lat;
  return {
    descripcion: texto(u?.Caracteristicas),
    diasAbiertos: Object.values(h).filter(d => d && d.enabled === true).length,
    metodos: Object.values(u?.metodos_pago || {}).some(v => v === true),
    redes: [u?.LinkInstagram, u?.LinkFacebook, u?.LinkTiktok].some(v => texto(v)),
    ubicacion: lat != null && lat !== '' && Number.isFinite(Number(lat)),
    logo: !!urlDe(u?.logotipoNegocio),
  };
};

export const CAMPOS_PERFIL = [
  {key: 'horario', label: 'Horario de atención', corto: 'horario', falta: d => !d.diasAbiertos},
  {key: 'metodos', label: 'Métodos de pago', corto: 'métodos de pago', falta: d => !d.metodos},
  {key: 'descripcion', label: 'Descripción del negocio', corto: 'descripción', falta: d => d.descripcion.length < 10},
  {key: 'redes', label: 'Redes sociales', corto: 'redes sociales', falta: d => !d.redes},
  {key: 'ubicacion', label: 'Ubicación en el mapa', corto: 'ubicación', falta: d => !d.ubicacion},
  {key: 'logo', label: 'Logo del negocio', corto: 'logo', falta: d => !d.logo},
];

/** Campos del perfil que faltan, en orden de importancia. Función pura. */
export const pendientesDelPerfil = datos => {
  const d = {descripcion: '', diasAbiertos: 0, metodos: false, redes: false, ubicacion: false, logo: false, ...(datos || {})};
  d.descripcion = texto(d.descripcion);
  return CAMPOS_PERFIL.filter(c => c.falta(d));
};

/** "horario, métodos de pago y redes sociales" */
export const listaLegible = campos => {
  const n = (campos || []).map(c => c.corto);
  if (n.length <= 1) return n.join('');
  return `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
};
