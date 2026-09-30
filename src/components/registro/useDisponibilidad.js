// Verifica mientras se escribe si un correo o teléfono ya tiene cuenta, sin
// esperar al botón Continuar. Usa los mismos endpoints del registro:
// 409 = ya existe, 200 = libre.
import {useEffect, useRef, useState} from 'react';
import api from '../../../axiosInstance';

const ESPERA_MS = 600;

/**
 * @param tipo 'email' | 'phone'
 * @param valor valor ya normalizado (correo en minúsculas / teléfono guardado)
 * @param valido true solo cuando el formato está completo y correcto
 * @returns 'idle' | 'checking' | 'ok' | 'taken' | 'error'
 */
export default function useDisponibilidad(tipo, valor, valido) {
  const [estado, setEstado] = useState('idle');
  const cache = useRef(new Map());

  useEffect(() => {
    if (!valido || !valor) {
      setEstado('idle');
      return;
    }
    const clave = `${tipo}:${valor}`;
    if (cache.current.has(clave)) {
      setEstado(cache.current.get(clave));
      return;
    }
    setEstado('checking');
    let vigente = true;
    const t = setTimeout(async () => {
      let r;
      try {
        await api.post(
          tipo === 'email' ? '/home/validateEmail' : '/home/validatePhone',
          tipo === 'email' ? {email: valor} : {phone: valor},
          {timeout: 10000},
        );
        r = 'ok';
      } catch (e) {
        r = e?.response?.status === 409 ? 'taken' : 'error';
      }
      if (r !== 'error') cache.current.set(clave, r);
      if (vigente) setEstado(r);
    }, ESPERA_MS);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [tipo, valor, valido]);

  return estado;
}

export const MSG_CORREO_EXISTE = 'Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.';
export const MSG_TELEFONO_EXISTE = 'Este teléfono ya está registrado con otra cuenta.';
