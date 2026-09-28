// Teléfonos con país (1.4.0).
//
// Formato guardado (compatible con todo lo que ya existe):
// - Venezuela: 10 dígitos sin el 0 ni el +58 → "4121234567". Es el formato
//   histórico: así lo guardan las cuentas existentes, lo compara
//   /home/validatePhone para detectar duplicados y lo leen el panel y la web.
// - Otros países: internacional con + → "+573001234567".
//
// En pantalla siempre se muestra el país aparte (bandera + código) y el número
// nacional agrupado.

export const PAISES = [
  {iso: 'VE', nombre: 'Venezuela', codigo: '58', bandera: '🇻🇪', min: 10, max: 10, ejemplo: '412 123 4567'},
  {iso: 'CO', nombre: 'Colombia', codigo: '57', bandera: '🇨🇴', min: 10, max: 10, ejemplo: '300 123 4567'},
  {iso: 'PE', nombre: 'Perú', codigo: '51', bandera: '🇵🇪', min: 9, max: 9, ejemplo: '912 345 678'},
  {iso: 'EC', nombre: 'Ecuador', codigo: '593', bandera: '🇪🇨', min: 9, max: 9, ejemplo: '99 123 4567'},
  {iso: 'CL', nombre: 'Chile', codigo: '56', bandera: '🇨🇱', min: 9, max: 9, ejemplo: '9 1234 5678'},
  {iso: 'AR', nombre: 'Argentina', codigo: '54', bandera: '🇦🇷', min: 10, max: 11, ejemplo: '9 11 1234 5678'},
  {iso: 'BR', nombre: 'Brasil', codigo: '55', bandera: '🇧🇷', min: 10, max: 11, ejemplo: '11 91234 5678'},
  {iso: 'MX', nombre: 'México', codigo: '52', bandera: '🇲🇽', min: 10, max: 10, ejemplo: '55 1234 5678'},
  {iso: 'PA', nombre: 'Panamá', codigo: '507', bandera: '🇵🇦', min: 8, max: 8, ejemplo: '6123 4567'},
  {iso: 'CR', nombre: 'Costa Rica', codigo: '506', bandera: '🇨🇷', min: 8, max: 8, ejemplo: '8312 3456'},
  {iso: 'DO', nombre: 'República Dominicana', codigo: '1', area: ['809', '829', '849'], bandera: '🇩🇴', min: 10, max: 10, ejemplo: '809 123 4567'},
  {iso: 'PR', nombre: 'Puerto Rico', codigo: '1', area: ['787', '939'], bandera: '🇵🇷', min: 10, max: 10, ejemplo: '787 123 4567'},
  {iso: 'US', nombre: 'Estados Unidos', codigo: '1', bandera: '🇺🇸', min: 10, max: 10, ejemplo: '305 123 4567'},
  {iso: 'CA', nombre: 'Canadá', codigo: '1', bandera: '🇨🇦', min: 10, max: 10, ejemplo: '416 123 4567'},
  {iso: 'CU', nombre: 'Cuba', codigo: '53', bandera: '🇨🇺', min: 8, max: 8, ejemplo: '5123 4567'},
  {iso: 'UY', nombre: 'Uruguay', codigo: '598', bandera: '🇺🇾', min: 8, max: 9, ejemplo: '94 123 456'},
  {iso: 'PY', nombre: 'Paraguay', codigo: '595', bandera: '🇵🇾', min: 9, max: 9, ejemplo: '961 456 789'},
  {iso: 'BO', nombre: 'Bolivia', codigo: '591', bandera: '🇧🇴', min: 8, max: 8, ejemplo: '7123 4567'},
  {iso: 'GT', nombre: 'Guatemala', codigo: '502', bandera: '🇬🇹', min: 8, max: 8, ejemplo: '5123 4567'},
  {iso: 'HN', nombre: 'Honduras', codigo: '504', bandera: '🇭🇳', min: 8, max: 8, ejemplo: '9123 4567'},
  {iso: 'SV', nombre: 'El Salvador', codigo: '503', bandera: '🇸🇻', min: 8, max: 8, ejemplo: '7012 3456'},
  {iso: 'NI', nombre: 'Nicaragua', codigo: '505', bandera: '🇳🇮', min: 8, max: 8, ejemplo: '8123 4567'},
  {iso: 'ES', nombre: 'España', codigo: '34', bandera: '🇪🇸', min: 9, max: 9, ejemplo: '612 34 56 78'},
  {iso: 'PT', nombre: 'Portugal', codigo: '351', bandera: '🇵🇹', min: 9, max: 9, ejemplo: '912 345 678'},
  {iso: 'IT', nombre: 'Italia', codigo: '39', bandera: '🇮🇹', min: 9, max: 10, ejemplo: '312 345 6789'},
  {iso: 'FR', nombre: 'Francia', codigo: '33', bandera: '🇫🇷', min: 9, max: 9, ejemplo: '6 12 34 56 78'},
  {iso: 'DE', nombre: 'Alemania', codigo: '49', bandera: '🇩🇪', min: 10, max: 11, ejemplo: '151 2345 6789'},
  {iso: 'GB', nombre: 'Reino Unido', codigo: '44', bandera: '🇬🇧', min: 10, max: 10, ejemplo: '7400 123456'},
];

export const PAIS_POR_DEFECTO = PAISES[0]; // Venezuela

const soloDigitos = v => String(v ?? '').replace(/\D/g, '');

export const paisPorIso = iso => PAISES.find(p => p.iso === iso) || PAIS_POR_DEFECTO;

/** Separa un valor guardado en {pais, nacional}. */
export const leerTelefono = guardado => {
  const raw = String(guardado ?? '').trim();
  if (!raw.startsWith('+')) {
    // Formato histórico venezolano (con o sin 0, con o sin 58).
    let d = soloDigitos(raw);
    if (d.startsWith('58') && d.length === 12) d = d.slice(2);
    if (d.startsWith('0') && d.length === 11) d = d.slice(1);
    return {pais: PAIS_POR_DEFECTO, nacional: d};
  }
  const d = soloDigitos(raw);
  // Código más largo primero (593 antes que 59…); +1 se desambigua por área.
  const candidatos = [...PAISES].sort((a, b) => b.codigo.length - a.codigo.length);
  for (const p of candidatos) {
    if (!d.startsWith(p.codigo)) continue;
    const nacional = d.slice(p.codigo.length);
    if (p.codigo === '1') {
      const conArea = PAISES.find(x => x.codigo === '1' && x.area?.includes(nacional.slice(0, 3)));
      return {pais: conArea || paisPorIso('US'), nacional};
    }
    return {pais: p, nacional};
  }
  return {pais: PAIS_POR_DEFECTO, nacional: d};
};

/** Arma el valor a guardar desde el país y lo que escribió la persona. */
export const armarTelefono = (pais, nacionalEscrito) => {
  let d = soloDigitos(nacionalEscrito);
  if (pais.iso === 'VE') {
    if (d.startsWith('58') && d.length === 12) d = d.slice(2);
    if (d.startsWith('0')) d = d.slice(1);
    return d.slice(0, 10);
  }
  // El 0 troncal no se marca desde el exterior (salvo Italia).
  if (pais.iso !== 'IT' && d.startsWith('0')) d = d.slice(1);
  d = d.slice(0, pais.max);
  return d ? `+${pais.codigo}${d}` : '';
};

/** Agrupa el número nacional para leerlo mejor: 412 123 4567. */
export const formatearNacional = (pais, nacional) => {
  const d = soloDigitos(nacional);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
};

/** '' si está bien; si no, qué falta en lenguaje claro. */
export const validarTelefonoPais = guardado => {
  const {pais, nacional} = leerTelefono(guardado);
  if (!nacional) return 'Escribe tu número de teléfono.';
  if (pais.iso === 'VE') {
    if (nacional.length < 10) return `Faltan ${10 - nacional.length} dígito(s). Ej: 412 123 4567.`;
    if (nacional.length > 10) return 'Sobran dígitos. Escríbelo sin el 0 inicial: 412 123 4567.';
    if (!/^(2|4)/.test(nacional)) return 'Debe empezar por 4 (celular) o 2 (fijo). Ej: 412 123 4567.';
    return '';
  }
  if (nacional.length < pais.min) {
    return `Faltan ${pais.min - nacional.length} dígito(s) para ${pais.nombre}. Ej: ${pais.ejemplo}.`;
  }
  if (nacional.length > pais.max) return `Sobran dígitos para ${pais.nombre}. Ej: ${pais.ejemplo}.`;
  return '';
};

/** Texto para mostrar un teléfono guardado: "+58 412 123 4567". */
export const mostrarTelefono = guardado => {
  const {pais, nacional} = leerTelefono(guardado);
  if (!nacional) return '';
  return `+${pais.codigo} ${formatearNacional(pais, nacional)}`;
};
