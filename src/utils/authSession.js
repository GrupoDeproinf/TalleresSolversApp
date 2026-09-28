// Inicia sesión justo después de registrarse, para que el usuario no tenga
// que volver a escribir correo y contraseña en el Login.
// Usa el mismo endpoint y el mismo guardado local que la pantalla de Login.
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import api from '../../axiosInstance';
import {sanitizeUserInfo} from './sanitizeUserInfo';
import {abrirSesionFirebase} from './sesionSegura';

export const obtenerTokenPushSeguro = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (e) {
    console.warn('registerDeviceForRemoteMessages:', e);
  }
  try {
    return (await messaging().getToken()) || '';
  } catch (e) {
    console.warn('getToken:', e);
    return '';
  }
};

/**
 * Autentica y deja la sesión guardada (sin contraseña).
 * Devuelve el userData o lanza el error de red/servidor.
 */
export const iniciarSesionTrasRegistro = async (email, password) => {
  const response = await api.post('/usuarios/authenticateUser', {
    email: String(email).trim().toLowerCase(),
    password,
  });
  const userData = response?.data?.userData;
  if (!userData || !userData.uid) {
    throw new Error('Respuesta de inicio de sesión sin usuario');
  }
  await abrirSesionFirebase(response?.data?.customToken);
  await AsyncStorage.setItem('@userInfo', JSON.stringify(sanitizeUserInfo(userData)));
  return userData;
};

export default iniciarSesionTrasRegistro;
