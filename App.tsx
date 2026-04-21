import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  LogBox,
  Platform,
  PermissionsAndroid,
  Alert,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  AppState,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MyStack from './src/navigation';
import { navigate } from './src/navigation';
import { external } from './src/style/external.css';
import {
  textRTLStyle,
  viewRTLStyle,
  imageRTLStyle,
  viewSelfRTLStyle,
} from './src/style/rtlStyle';
import {
  bgFullStyle,
  textColorStyle,
  iconColorStyle,
  linearColorStyle,
  subtitleColorStyle,
  imageContainer,
  linearColorStyleTwo,
} from './src/style/darkStyle';
import { useTranslation } from 'react-i18next';
import Spinner from 'react-native-loading-spinner-overlay';
import api, { setLoadingFunction } from './axiosInstance'; // Asegúrate de que la ruta sea correcta
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';


import { requestTrackingPermission, getTrackingStatus } from 'react-native-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';





// import * as Notifications from 'expo-notifications';

LogBox.ignoreLogs(['Your specific warning here']);

export const CommonContext = createContext();

const firebaseConfig = {
  apiKey: "AIzaSyB7JeVA4YZBzTblEOnZ-drNT-vwv085fgM",
  authDomain: "talleres-solvers-app.firebaseapp.com",
  projectId: "talleres-solvers-app",
  storageBucket: "talleres-solvers-app.firebasestorage.app",
  messagingSenderId: "144076824848",
  appId: "1:144076824848:web:cdaf60b28136561b338595",
  measurementId: "G-DXQ986SLJR"
};

/** Notificaciones de mantenimiento/vehículo: banner + tap / apertura → VehiclesScreen */
const VEHICLE_NOTIFICATION_BANNER_DEFAULTS: Record<string, string> = {
  UltimocambioAceite: 'Último cambio de aceite',
  KMCorreTiempo: 'Kilometraje y tiempo',
  UltimaAlineacionRuedas: 'Última alineación de ruedas',
  UltimoAbastecimientoCombustible: 'Último abastecimiento de combustible',
  UltimoCambioBujiasFiltro: 'Último cambio de bujías y filtro',
  UltimoLavado: 'Último lavado',
  UltimoMantenimientoSistemaInyeccion: 'Último mantenimiento sistema de inyección',
  certificado_medico_fecha_vencimiento: 'Vencimiento del certificado médico',
  licencia_fecha_vencimiento: 'Vencimiento de la licencia',
  ProximoKmSuperado: 'Próximo km superado',
  ProximoKmAdvertenciaHasta3000: 'Aviso de kilometraje (próximo servicio)',
};

const isVehicleBannerSecretCode = (code: unknown): code is string =>
  typeof code === 'string' && Object.prototype.hasOwnProperty.call(VEHICLE_NOTIFICATION_BANNER_DEFAULTS, code);

/** Misma forma que PlanesTaller / solicitudesTaller: unifica userData anidado de getUserByUid. */
const flattenUserDataFromGetUserResponse = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  let merged: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  const nest =
    (data as Record<string, unknown>).userData ??
    (data as Record<string, unknown>).data ??
    (data as Record<string, unknown>).user;
  if (nest && typeof nest === 'object' && !Array.isArray(nest)) {
    merged = { ...merged, ...(nest as Record<string, unknown>) };
    const inner = (nest as Record<string, unknown>).userData;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = { ...merged, ...(inner as Record<string, unknown>) };
    }
  }
  return merged;
};

const App = () => {

  useEffect(() => {
    LogBox.ignoreAllLogs();

    // Inicializar Firebase
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }

    // Solicitar permisos de notificaciones push
    setTimeout(() => {
      requestUserPermission();
    }, 2000);

    // Escuchar notificaciones entrantes
    listenToNotifications();

    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      const secretCode = remoteMessage?.data?.secretCode;
      if (
        secretCode === 'NuevaSolicitud' ||
        secretCode === 'NuevaPropuesta' ||
        secretCode === 'PropuestaAceptada'
      ) {
        setTimeout(() => {
          navigate('DrawerScreen');
          setTimeout(() => {
            navigate('MisSolicitudes');
          }, 350);
        }, 250);
      } else if (secretCode === 'ActualizarKmVehiculos') {
        setTimeout(() => {
          navigate('DrawerScreen');
          setTimeout(() => {
            navigate('HomeScreen');
          }, 350);
        }, 250);
      } else if (isVehicleBannerSecretCode(secretCode)) {
        setTimeout(() => {
          navigate('DrawerScreen');
          setTimeout(() => {
            navigate('VehiclesScreen');
          }, 350);
        }, 250);
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        const secretCode = remoteMessage?.data?.secretCode;
        if (
          secretCode === 'NuevaSolicitud' ||
          secretCode === 'NuevaPropuesta' ||
          secretCode === 'PropuestaAceptada'
        ) {
          setTimeout(() => {
            navigate('DrawerScreen');
            setTimeout(() => {
              navigate('MisSolicitudes');
            }, 450);
          }, 400);
        } else if (secretCode === 'ActualizarKmVehiculos') {
          setTimeout(() => {
            navigate('DrawerScreen');
            setTimeout(() => {
              navigate('HomeScreen');
            }, 450);
          }, 400);
        } else if (isVehicleBannerSecretCode(secretCode)) {
          setTimeout(() => {
            navigate('DrawerScreen');
            setTimeout(() => {
              navigate('VehiclesScreen');
            }, 450);
          }, 400);
        }
      });

    return () => {
      unsubscribeOpenedApp();
    };
  }, []);

  const [loading, setLoading] = useState(false); // Estado para el loading

  // Establece la función de setLoading en el módulo de Axios
  useEffect(() => {

    console.log("ksdmlmsdlkfmlskdmflksmdflkmsdklf")


    setLoadingFunction(setLoading);
  }, []);

  const [isRTL, setIsRTL] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currSymbol, setCurrSymbol] = useState('$');
  const [currPrice, setCurrPrice] = useState(1);
  const { t } = useTranslation();

  const [showNuevaSolicitudBanner, setShowNuevaSolicitudBanner] =
    useState(false);
  const [nuevaSolicitudBannerData, setNuevaSolicitudBannerData] = useState({
    title: '',
    body: '',
  });
  const [bannerTargetScreen, setBannerTargetScreen] = useState('MisSolicitudes');
  const nuevaSolicitudTimeoutRef = useRef(null);
  const bannerTranslateY = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    if (!showNuevaSolicitudBanner) return;
    bannerTranslateY.setValue(-140);
    Animated.timing(bannerTranslateY, {
      toValue: 0,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [showNuevaSolicitudBanner, bannerTranslateY]);


  useEffect(() => {
    if (Platform.OS === 'ios') {
      requestTrackingPermissionFunction();
    }
  }, []);

  const requestTrackingPermissionFunction = async () => {
    try {
      // Verificar el estado actual del permiso
      const currentStatus = await getTrackingStatus();
      console.log('Tracking permission status:', currentStatus);
      
      // Si ya está autorizado o no está disponible (simulador), no hacer nada
      if (currentStatus === 'authorized' || currentStatus === 'unavailable') {
        return;
      }

      // Si está denegado o no determinado, mostrar modal explicativo
      if (currentStatus === 'denied' || currentStatus === 'not-determined') {
        // Mostrar modal explicativo
        Alert.alert(
          'Permiso de Seguimiento',
          'Esta aplicación utiliza el seguimiento para mejorar tu experiencia y mostrarte contenido personalizado. ¿Deseas permitir el seguimiento?',
          [
            {
              text: 'No, gracias',
              style: 'cancel',
              onPress: () => {
                console.log('Usuario rechazó el permiso de tracking');
              }
            },
            {
              text: 'Permitir',
              onPress: async () => {
                try {
                  // Intentar solicitar el permiso
                  const status = await requestTrackingPermission();
                  console.log('ATT status después de solicitar:', status);
                  
                  // Si el estado sigue siendo denegado, significa que el usuario lo rechazó
                  // En iOS, una vez rechazado, solo se puede cambiar desde Configuración
                  if (status === 'denied') {
                    // Opcional: mostrar otro alert explicando que debe ir a Configuración
                    // Pero no lo haremos para no ser intrusivos
                    console.log('Usuario rechazó el permiso. Debe ir a Configuración para cambiarlo.');
                  }
                } catch (error) {
                  console.error('Error requesting tracking permission:', error);
                }
              }
            }
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
    }
  }


  const contextValues = {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    linearColorStyleTwo: linearColorStyleTwo(isDark),
    imageContainer: imageContainer(isDark),
    subtitleColorStyle: subtitleColorStyle(isDark),
    linearColorStyle: linearColorStyle(isDark),
    textColorStyle: textColorStyle(isDark),
    iconColorStyle: iconColorStyle(isDark),
    bgFullStyle: bgFullStyle(isDark),
    textRTLStyle: textRTLStyle(isRTL),
    viewRTLStyle: viewRTLStyle(isRTL),
    imageRTLStyle: imageRTLStyle(isRTL),
    viewSelfRTLStyle: viewSelfRTLStyle(isRTL),
    t,
    currSymbol,
    setCurrSymbol,
    currPrice,
    setCurrPrice,
  };

  // Solicitar permisos al usuario para notificaciones push
  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission({
          alert: true,
          announcement: true,
          badge: true,
          carPlay: true,
          provisional: true,
          sound: true,
        });
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log('Permiso de notificaciones dado en iOS:', authStatus);
        } else {
          Alert.alert("Permiso requerido", "Por favor activa las notificaciones en ajustes.");
        }
      } else if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ requiere pedir permiso en tiempo de ejecución
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Permiso para notificaciones",
            message: "Esta app necesita permiso para mostrar notificaciones.",
            buttonPositive: "Aceptar",
            buttonNegative: "Cancelar",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de notificaciones concedido en Android');
        } else {
          Alert.alert("Permiso requerido", "Por favor activa las notificaciones en ajustes.");
        }
      }
    } catch (err) {
      console.log('Error solicitando permiso de notificaciones:', err);
    }
  };

  // let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);


  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', JSON.stringify(remoteMessage));
    // Aquí puedes manejar la notificación en segundo plano como desees
  });

  const handleForegroundNotification = async (remoteMessage) => {
    console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    // Aquí puedes manejar la notificación como desees


    console.log(remoteMessage.notification)

    console.log("remoteMessage", remoteMessage)

    console.log(remoteMessage.data.secretCode)
    if (remoteMessage.data.secretCode == "Aprovado Taller") {
      const alertData = alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Rechazo Taller") {
      const alertData = alert({
        type: DropdownAlertType.Error,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Usuario contacta a taller") {
      const alertData = alert({
        type: DropdownAlertType.Info,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "New Taller Created") {
      const alertData = alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "plantoexpire") {
      const alertData = alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Cambio de estado") {
      const alertData = alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Validar codigo") {
      const alertData = alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    }else if (remoteMessage.data.secretCode == "NuevaSolicitud") {
      const title = remoteMessage?.notification?.title ?? 'Nueva solicitud';
      const body = remoteMessage?.notification?.body ?? '';

      setNuevaSolicitudBannerData({ title, body });
      setBannerTargetScreen('MisSolicitudes');
      setShowNuevaSolicitudBanner(true);

      if (nuevaSolicitudTimeoutRef.current) {
        clearTimeout(nuevaSolicitudTimeoutRef.current);
      }
      nuevaSolicitudTimeoutRef.current = setTimeout(() => {
        setShowNuevaSolicitudBanner(false);
      }, 8000);
    } else if (remoteMessage.data.secretCode == "NuevaPropuesta") {
      const title = remoteMessage?.notification?.title ?? 'Nueva propuesta';
      const body = remoteMessage?.notification?.body ?? '';

      setNuevaSolicitudBannerData({ title, body });
      setBannerTargetScreen('MisSolicitudes');
      setShowNuevaSolicitudBanner(true);

      if (nuevaSolicitudTimeoutRef.current) {
        clearTimeout(nuevaSolicitudTimeoutRef.current);
      }
      nuevaSolicitudTimeoutRef.current = setTimeout(() => {
        setShowNuevaSolicitudBanner(false);
      }, 8000);
    } else if (remoteMessage.data.secretCode == "PropuestaAceptada") {
      const title = remoteMessage?.notification?.title ?? 'Propuesta aceptada';
      const body = remoteMessage?.notification?.body ?? '';

      setNuevaSolicitudBannerData({ title, body });
      setBannerTargetScreen('MisSolicitudes');
      setShowNuevaSolicitudBanner(true);

      if (nuevaSolicitudTimeoutRef.current) {
        clearTimeout(nuevaSolicitudTimeoutRef.current);
      }
      nuevaSolicitudTimeoutRef.current = setTimeout(() => {
        setShowNuevaSolicitudBanner(false);
      }, 8000);
    } else if (remoteMessage.data.secretCode == "ActualizarKmVehiculos") {
      const title =
        remoteMessage?.notification?.title ?? 'Actualiza el kilometraje';
      const body =
        remoteMessage?.notification?.body ??
        'Tener el km al día te ayuda a controlar tu vehículo y recibir mejores avisos. Entra al inicio para actualizarlo.';

      setNuevaSolicitudBannerData({ title, body });
      setBannerTargetScreen('HomeScreen');
      setShowNuevaSolicitudBanner(true);

      if (nuevaSolicitudTimeoutRef.current) {
        clearTimeout(nuevaSolicitudTimeoutRef.current);
      }
      nuevaSolicitudTimeoutRef.current = setTimeout(() => {
        setShowNuevaSolicitudBanner(false);
      }, 8000);
    } else if (isVehicleBannerSecretCode(remoteMessage.data.secretCode)) {
      const code = remoteMessage.data.secretCode;
      const title =
        remoteMessage?.notification?.title ?? VEHICLE_NOTIFICATION_BANNER_DEFAULTS[code];
      const body = remoteMessage?.notification?.body ?? '';

      setNuevaSolicitudBannerData({ title, body });
      setBannerTargetScreen('VehiclesScreen');
      setShowNuevaSolicitudBanner(true);

      if (nuevaSolicitudTimeoutRef.current) {
        clearTimeout(nuevaSolicitudTimeoutRef.current);
      }
      nuevaSolicitudTimeoutRef.current = setTimeout(() => {
        setShowNuevaSolicitudBanner(false);
      }, 8000);
    }


    




  };

  const listenToNotifications = () => {
    messaging().onMessage(async remoteMessage => {
      handleForegroundNotification(remoteMessage);
    });
  };

  const test = () => {
    console.log("51561jsdlghjksdhfjlksdhfjk")
  }

  const saveTokenToBackend = async (token: string, uid_usuario: string) => {
    try {
      if (!token) return;
      if (!uid_usuario) return;

      await api.post('usuarios/UpdateUsuariosAll', {
        uid: uid_usuario,
        token,
      });
    } catch (e) {
      console.error('saveTokenToBackend error:', e);
    }
  };

  const initFCM = async () => {
    try {
      console.log('initFCM');
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();

      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const session = jsonValue != null ? JSON.parse(jsonValue) : null;
      const uid = String(session?.uid ?? session?.id ?? '').trim();

      let user = session;
      if (uid) {
        try {
          const res = await api.post('usuarios/getUserByUid', { uid });
          const fresh = flattenUserDataFromGetUserResponse(res?.data ?? {});
          user =
            session && typeof session === 'object'
              ? { ...session, ...fresh }
              : fresh;
        } catch (getUserErr) {
          console.warn('initFCM getUserByUid:', getUserErr);
          user = session;
        }
      }

      console.log('user123123123123', user?.token, 'token', token);
      console.log('valor del storage123', user);

      if (user?.token == undefined || user?.token === '') {
        // await AsyncStorage.setItem('@userInfo', JSON.stringify({ ...user, token }));
        // await saveTokenToBackend(token);
      } else {
        console.log(
          'token ya existe y valido si no es el mismo que el storage se actualiza el usuario',
        );
        if (user?.token !== token) {
          await AsyncStorage.setItem('@userInfo', JSON.stringify({ ...user, token }));
          await saveTokenToBackend(token, uid);
        }
      }
    } catch (e) {
      console.error('initFCM error:', e);
    }
  };

  useEffect(() => {
    initFCM();

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        initFCM();
      }
    });

    const unsubscribeToken = messaging().onTokenRefresh(newToken => {
      console.log('Token actualizado:', newToken);
      void (async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@userInfo');
          const session = jsonValue != null ? JSON.parse(jsonValue) : null;
          const uid = String(session?.uid ?? session?.id ?? '').trim();
          await saveTokenToBackend(newToken, uid);
          await AsyncStorage.setItem('fcmToken', newToken);
        } catch (e) {
          console.error('onTokenRefresh:', e);
        }
      })();
    });

    return () => {
      appStateSub.remove();
      unsubscribeToken();
    };
  }, []);

  return (
    <CommonContext.Provider value={contextValues}>
      <SafeAreaView style={[external.fx_1]}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MyStack />
        </GestureHandlerRootView>

        {showNuevaSolicitudBanner && (
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => {
              setShowNuevaSolicitudBanner(false);
              if (nuevaSolicitudTimeoutRef.current) {
                clearTimeout(nuevaSolicitudTimeoutRef.current);
              }
              navigate('DrawerScreen');
              setTimeout(() => {
                navigate(bannerTargetScreen);
              }, 350);
            }}
            style={{
              position: 'absolute',
              top: 75,
              left: 14,
              right: 14,
              zIndex: 9999,
              transform: [{ translateY: bannerTranslateY }],
            }}
          >
            <View
              style={{
                borderRadius: 18,
                backgroundColor: '#1F2344',
                borderWidth: 1,
                borderColor: '#FFD60A',
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: '#FFD60A',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#1F2344', fontWeight: '900', fontSize: 18 }}>
                  !
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '900',
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {nuevaSolicitudBannerData.title}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 12,
                  }}
                  numberOfLines={2}
                >
                  {nuevaSolicitudBannerData.body}
                </Text>
              </View>

              <Text
                style={{
                  color: '#FFD60A',
                  fontWeight: '900',
                  fontSize: 13,
                  marginLeft: 10,
                }}
              >
                Ver
              </Text>
            </View>
          </TouchableOpacity>
        )}
        {/* <Spinner visible={loading} textContent={'Cargando...'} textStyle={{ color: '#FFF' }} /> */}


        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
            }}
          >
            <Image
              source={require('./src/assets/images/signUp/loadingSolversNew.gif')} // Ruta de la imagen
              style={{ width: 80, height: 80 }} // Tamaño de la imagen
            />
          </View>
        )}

      </SafeAreaView>

      <DropdownAlert
        alert={func => (alert = func)}
        containerStyle={{ backgroundColor: '#2D3261' }}
        titleStyle={{ color: '#FFF' }}
        messageStyle={{ color: '#FFF' }}
        onDismissPress={() => test()}
      />

    </CommonContext.Provider>
  );
};

export const useValues = () => useContext(CommonContext);

export default App;