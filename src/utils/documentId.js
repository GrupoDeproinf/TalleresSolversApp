/**
 * Requerimiento 001 - puntos 1 y 2.
 *
 * Punto 1: el SENIAT emite el RIF con digito verificador tras un segundo
 * guion ("J-12345678-9"). El codigo hacia rif.split('-') y tomaba el indice
 * [1], o sea "12345678": perdia el digito verificador.
 *
 * splitDocumentId parte SOLO en el primer guion, asi que [1] conserva el
 * resto completo. Devuelve un array, por eso es reemplazo directo de
 * .split('-') y el typeID[0] / typeID[1] de alrededor no cambia.
 *
 * Punto 2: esPdf detecta PDF por la ruta, tolerando querystring
 * (?alt=media de Firebase Storage) y fragmento (#page=1).
 */

const PREFIJOS_VALIDOS = /^[VECGJP]$/i;

export function splitDocumentId(valor) {
  const bruto = String(valor == null ? '' : valor).trim();
  if (!bruto) {
    return ['', ''];
  }
  const i = bruto.indexOf('-');
  if (i === -1) {
    const pegado = bruto.match(/^([VECGJP])(\d.*)$/i);
    if (pegado) {
      return [pegado[1].toUpperCase(), pegado[2]];
    }
    return ['', bruto];
  }
  const prefijo = bruto.slice(0, i);
  return [
    PREFIJOS_VALIDOS.test(prefijo) ? prefijo.toUpperCase() : prefijo,
    bruto.slice(i + 1),
  ];
}

export function parseDocumentId(valor) {
  const [prefijo, numero] = splitDocumentId(valor);
  return {prefijo, numero};
}

export function formatDocumentId(prefijo, numero) {
  const p = String(prefijo == null ? '' : prefijo).replace(/-+$/, '');
  const n = String(numero == null ? '' : numero);
  return p ? `${p}-${n}` : n;
}

export function esPdf(ruta) {
  if (!ruta) {
    return false;
  }
  return /\.pdf$/i.test(String(ruta).split('#')[0].split('?')[0]);
}
