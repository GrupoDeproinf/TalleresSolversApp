// Servicios que el taller eligió en el registro (especialidades) y que aún no
// ha creado. Se muestran como "por completar": al tocarlos se abre el
// formulario con el nombre y la categoría ya llenos, y el taller agrega
// precio (o "por consultar"), descripción y foto.
//
// No se crean solos: el cliente decidió no publicar servicios sin precio ni
// foto (Req. 005).

const sinAcentos = v =>
  String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Especialidades sin servicio creado con ese nombre, en el orden en que las
 * eligió (la primera es la destacada). Función pura.
 * @param {Array<{grupo: string, servicio: string}>} especialidades
 * @param {Array<{nombre_servicio?: string}>} servicios
 */
export const serviciosPorCompletar = (especialidades, servicios) => {
  const creados = new Set((Array.isArray(servicios) ? servicios : []).map(s => sinAcentos(s && s.nombre_servicio)));
  const vistos = new Set();
  return (Array.isArray(especialidades) ? especialidades : []).filter(e => {
    const k = sinAcentos(e && e.servicio);
    if (!k || creados.has(k) || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
};

/** grupo del catálogo → uid de la categoría del panel (la primera que corresponda). */
export const categoriaPorGrupo = grupos => {
  const mapa = {};
  (Array.isArray(grupos) ? grupos : []).forEach(g => {
    const c = Array.isArray(g && g.categorias) ? g.categorias.find(x => x && x.uid) : null;
    if (g && g.id && c) mapa[g.id] = c.uid;
  });
  return mapa;
};
