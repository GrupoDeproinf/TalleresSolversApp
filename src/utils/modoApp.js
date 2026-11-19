// Modo de uso de una cuenta de taller (COT-0111).
//
// Un taller puede usar Solvers como conductor con su misma cuenta, sin cerrar
// sesión. El modo elegido se guarda en el teléfono ('@modoApp') y se recuerda
// al abrir la app.
//
// Cómo funciona: en modo conductor, la sesión guardada ('@userInfo') lleva
// typeUser 'Cliente' y cuentaTaller: true. Así todas las pantallas que ya
// deciden por typeUser muestran la experiencia de conductor sin tocarlas. En
// el servidor la cuenta sigue siendo de taller (el rol sale de la base de
// datos, no de la app), y el servidor impide que el taller reciba o cotice sus
// propias solicitudes.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_MODO = '@modoApp';
export const MODO_TALLER = 'taller';
export const MODO_CONDUCTOR = 'conductor';

/** true si la cuenta es de un taller (en cualquiera de los dos modos). */
export const esCuentaTaller = user =>
  !!user && (user.cuentaTaller === true || user.typeUser === 'Taller');

/** true si es un taller usando la app como conductor. */
export const enModoConductor = user =>
  !!user && user.cuentaTaller === true && user.typeUser === 'Cliente';

/**
 * Sesión con el modo aplicado. Recibe los datos tal como vienen del servidor
 * (o de la sesión guardada) y devuelve lo que se guarda en '@userInfo'.
 */
export const aplicarModo = (user, modo) => {
  if (!esCuentaTaller(user)) return user;
  const base = {...user, typeUser: 'Taller', cuentaTaller: true};
  return modo === MODO_CONDUCTOR ? {...base, typeUser: 'Cliente'} : base;
};

export const leerModo = async () => {
  try {
    const m = await AsyncStorage.getItem(CLAVE_MODO);
    return m === MODO_CONDUCTOR ? MODO_CONDUCTOR : MODO_TALLER;
  } catch (e) {
    return MODO_TALLER;
  }
};

/** Aplica el modo recordado a datos frescos del servidor. */
export const conModoRecordado = async user => aplicarModo(user, await leerModo());

/**
 * Cambia de modo: guarda la elección y reescribe la sesión. Devuelve la sesión
 * nueva, o null si no hay una cuenta de taller.
 */
export const cambiarModo = async modo => {
  const json = await AsyncStorage.getItem('@userInfo');
  const user = json ? JSON.parse(json) : null;
  if (!esCuentaTaller(user)) return null;
  const nuevo = aplicarModo(user, modo);
  await AsyncStorage.multiSet([
    [CLAVE_MODO, modo === MODO_CONDUCTOR ? MODO_CONDUCTOR : MODO_TALLER],
    ['@userInfo', JSON.stringify(nuevo)],
  ]);
  return nuevo;
};

/** Al cerrar sesión o entrar con otra cuenta se vuelve al modo taller. */
export const olvidarModo = () => AsyncStorage.removeItem(CLAVE_MODO).catch(() => {});

// Avisos que pertenecen a cada modo: al tocarlos, la app cambia sola.
const AVISOS_TALLER = new Set([
  'NuevaSolicitud',
  'Aprovado Taller',
  'Rechazo Taller',
  'Usuario contacta a taller',
  'plantoexpire',
]);
const AVISOS_CONDUCTOR = new Set(['NuevaPropuesta', 'PropuestaAceptada', 'ActualizarKmVehiculos']);

/** Modo que necesita un aviso, o null si sirve en cualquiera. */
export const modoDelAviso = (secretCode, esAvisoDeVehiculo = false) => {
  if (AVISOS_TALLER.has(secretCode)) return MODO_TALLER;
  if (AVISOS_CONDUCTOR.has(secretCode) || esAvisoDeVehiculo) return MODO_CONDUCTOR;
  return null;
};

/**
 * Si el aviso es del otro modo, cambia de modo. Devuelve true si cambió (la
 * pantalla principal debe volver a armarse).
 */
export const asegurarModoParaAviso = async (secretCode, esAvisoDeVehiculo = false) => {
  try {
    const necesario = modoDelAviso(secretCode, esAvisoDeVehiculo);
    if (!necesario) return false;
    const json = await AsyncStorage.getItem('@userInfo');
    const user = json ? JSON.parse(json) : null;
    if (!esCuentaTaller(user)) return false;
    const actual = enModoConductor(user) ? MODO_CONDUCTOR : MODO_TALLER;
    if (actual === necesario) return false;
    await cambiarModo(necesario);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Mezcla datos nuevos del servidor con la sesión guardada sin perder el modo
 * (los datos del servidor siempre traen typeUser 'Taller').
 */
export const mezclarConModo = (local, nuevos) =>
  aplicarModo({...(local || {}), ...(nuevos || {})}, enModoConductor(local) ? MODO_CONDUCTOR : MODO_TALLER);
