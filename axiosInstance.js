// axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apisolvers.solversapp.com/api', // Cambia esto a la URL base de tu API
});

// Variable para almacenar la función setLoading
let setLoading = () => {};

// Interceptor de solicitud
api.interceptors.request.use(
  (config) => {
    console.log("Enviando solicitud", config.url);
    setLoading(true); // Activa el loading
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
    console.log("Error recibido", error);
    setLoading(false); // Desactiva el loading en caso de error
    return Promise.reject(error);
  }
);

// Función para establecer la función de setLoading
export const setLoadingFunction = (loadingFunction) => {
  setLoading = loadingFunction;
};

export default api;
