import { useLoading } from './LoadingContext'; // Asegúrate de que la ruta sea correcta
import api from './api';
import { useEffect, useState } from 'react';

const useSetupInterceptors = () => {
    //   const { setLoading } = useLoading(); // Usa useLoading en lugar de LoadingProvider

    const [loading, setLoading]
        = useState(false);

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            config => {
                console.log("Enviando Algo") // Muestra el loading
                setLoading(true);
                return config;
            },
            error => {
                setLoading(false); // Oculta el loading en caso de error
                return Promise.reject(error);
            }
        );

        const responseInterceptor = api.interceptors.response.use(
            response => {
                console.log("recibio algo") // Muestra el loading
                setLoading(false); // Oculta el loading cuando se recibe una respuesta
                return response;
            },
            error => {
                console.log("recibio algo") // Muestra el loading
                setLoading(false); // Oculta el loading en caso de error
                return Promise.reject(error);
            }
        );

        // Limpieza de interceptores al desmontar el componente
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [setLoading]); // Dependencia de setLoading
};

export default useSetupInterceptors;
