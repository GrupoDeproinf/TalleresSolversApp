// axiosInstance.js
import axios from 'axios';
import {tokenDeSesion} from './src/utils/sesionSegura';

const api = axios.create({
  baseURL: 'https://apisolvers.solversapp.com/api', timeout: 20000, // Cambia esto a la URL base de tu API
});

// Variable para almacenar la función setLoading
let setLoading = () => {};

// Interceptor de solicitud
api.interceptors.request.use(
  async (config) => {
    setLoading(true); // Activa el loading
    // Sesión verificable: el servidor comprueba quién llama (middlewares/auth.js).
    const token = await tokenDeSesion();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setLoading(false); // Desactiva el loading en caso de error
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    console.log("Respuesta recibida");
    setLoading(false); // Desactiva el loading en respuesta exitosa
    return response;
  },
  (error) => {
    setLoading(false); // Desactiva el loading en caso de error
    // Con la seguridad activa (AUTH_MODE=enforce), una sesión vencida o vieja
    // (de antes de la 1.4.0) devuelve 401 SIN_SESION: se pide entrar de nuevo.
    if (error?.response?.status === 401 && error?.response?.data?.codigo === 'SIN_SESION') {
      pedirInicioDeSesion();
    }
    return Promise.reject(error);
  }
);

let pidiendoLogin = false;
const pedirInicioDeSesion = async () => {
  if (pidiendoLogin) return;
  pidiendoLogin = true;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const {Alert} = require('react-native');
    const {navigationRef} = require('./src/navigation');
    await AsyncStorage.removeItem('@userInfo');
    if (navigationRef.isReady()) navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
    Alert.alert('Solvers', 'Por seguridad, vuelve a iniciar sesión.');
  } catch (_) {
  } finally {
    setTimeout(() => (pidiendoLogin = false), 5000);
  }
};

// Función para establecer la función de setLoading
export const setLoadingFunction = (loadingFunction) => {
  setLoading = loadingFunction;
};

export default api;
