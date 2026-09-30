// Sesión verificable con el servidor (seguridad de la API).
//
// Al iniciar sesión el servidor devuelve un `customToken`. Con él se abre una
// sesión de Firebase Auth en el teléfono; Firebase la guarda y renueva el
// ID token sola. axiosInstance manda ese ID token en cada llamada
// (Authorization: Bearer) y el servidor lo verifica (middlewares/auth.js).
//
// Nada de esto bloquea el uso de la app: si Firebase falla, la app sigue como
// antes y el servidor (en modo "report") solo lo registra.
import auth from '@react-native-firebase/auth';

export const abrirSesionFirebase = async customToken => {
  if (!customToken) return false;
  try {
    await auth().signInWithCustomToken(customToken);
    return true;
  } catch (e) {
    console.warn('[sesion] no se pudo abrir la sesión de Firebase:', e?.code || e?.message);
    return false;
  }
};

export const cerrarSesionFirebase = async () => {
  try {
    if (auth().currentUser) await auth().signOut();
  } catch (_) {}
};

/** ID token vigente o null (Firebase lo renueva si está por vencer). */
export const tokenDeSesion = async () => {
  try {
    const u = auth().currentUser;
    return u ? await u.getIdToken() : null;
  } catch (_) {
    return null;
  }
};
