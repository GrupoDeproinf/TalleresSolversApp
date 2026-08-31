/**
 * useLocationPermission
 *
 * Valida permiso de ubicación + GPS activo antes de abrir el mapa.
 * Compatible con Android e iOS sin librerías extra.
 *
 * Uso:
 *   const { checkAndOpenMap, locModalVisible, setLocModalVisible, locModalType } =
 *     useLocationPermission();
 *
 *   // En el botón del mapa:
 *   onPress={() => checkAndOpenMap(() => setShowMap(true))}
 *
 *   // En el JSX:
 *   <LocationPermissionModal
 *     visible={locModalVisible}
 *     type={locModalType}
 *     onClose={() => setLocModalVisible(false)}
 *   />
 */

import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const useLocationPermission = () => {
  const [locModalVisible, setLocModalVisible] = useState(false);
  // 'permission' → permiso no concedido
  // 'gps'        → GPS/Servicios de ubicación desactivados
  const [locModalType, setLocModalType] = useState('permission');

  /**
   * Solicita permiso (si es necesario) y verifica que el GPS esté encendido.
   * Si todo está OK llama a onGranted(); si no, muestra el modal adecuado.
   */
  const checkAndOpenMap = useCallback(async (onGranted) => {
    // ─── Android: solicitar permiso de ubicación ────────────────────────────
    if (Platform.OS === 'android') {
      const already = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (!already) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message:
              'SolversApp necesita acceder a tu ubicación para mostrarte la ruta hasta el taller.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Cancelar',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          // DENIED o NEVER_ASK_AGAIN → modal de permisos
          setLocModalType('permission');
          setLocModalVisible(true);
          return;
        }
      }
    }

    // ─── Verificar GPS activo (ambas plataformas) ───────────────────────────
    Geolocation.getCurrentPosition(
      () => {
        // Todo OK → abrir mapa
        onGranted();
      },
      err => {
        if (err.code === 1) {
          // Permiso denegado (principalmente iOS primera vez o settings revocados)
          setLocModalType('permission');
          setLocModalVisible(true);
        } else if (err.code === 2) {
          // Servicios de ubicación / GPS desactivados
          setLocModalType('gps');
          setLocModalVisible(true);
        } else {
          // Timeout u otro error no crítico → intentar igual
          onGranted();
        }
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60000 },
    );
  }, []);

  return { checkAndOpenMap, locModalVisible, setLocModalVisible, locModalType };
};

export default useLocationPermission;
