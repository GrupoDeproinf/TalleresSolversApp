import React, { createContext, useContext, useEffect, useState } from 'react';
import { SafeAreaView, LogBox, AppState } from 'react-native';
import MyStack from './src/navigation';
import { external } from './src/style/external.css.js';
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
import CustomLoader from './src/commonComponents/customLoader';
import api, { setLoadingFunction } from './axiosInstance';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { toastConfig } from './src/utils/toastConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['Your specific warning here']);

/** Unifica userData anidado de getUserByUid (misma idea que PlanesTaller / solicitudesTaller). */
const flattenUserDataFromGetUserResponse = data => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  let merged = { ...data };
  const nest = data.userData ?? data.data ?? data.user;
  if (nest && typeof nest === 'object' && !Array.isArray(nest)) {
    merged = { ...merged, ...nest };
    const inner = nest.userData;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = { ...merged, ...inner };
    }
  }
  return merged;
};

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

// Inicializa Firebase ANTES de usar messaging()
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Configura el manejador de mensajes en segundo plano
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', JSON.stringify(remoteMessage));
});

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currSymbol, setCurrSymbol] = useState('$');
  const [currPrice, setCurrPrice] = useState(1);
  const { t } = useTranslation();

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

  useEffect(() => {
    LogBox.ignoreAllLogs();

    // 🔧 Inicializa el estado global del loader
    setLoadingFunction(setLoading);

    // 🔔 Solicita permisos para notificaciones
    requestUserPermission();

    // 🔔 Escucha notificaciones en primer plano
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      handleForegroundNotification(remoteMessage);
    });

    return unsubscribe;
  }, []);

  const saveTokenToBackend = async (token, uid_usuario) => {
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

      if (user?.token == undefined || user?.token === '') {
        // Sin token persistido aún: no forzar sync (misma lógica que migración)
      } else if (user?.token !== token) {
        await AsyncStorage.setItem('@userInfo', JSON.stringify({ ...user, token }));
        await saveTokenToBackend(token, uid);
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

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  };

  const handleForegroundNotification = async (remoteMessage) => {
    console.log('Foreground message:', JSON.stringify(remoteMessage));
    const { title, body } = remoteMessage.notification || {};
    const { secretCode } = remoteMessage.data || {};
    let type = 'info';

    switch (secretCode) {
      case 'Aprovado Taller':
      case 'New Taller Created':
        type = 'success';
        break;
      case 'Rechazo Taller':
        type = 'error';
        break;
      default:
        type = 'info';
    }

    Toast.show({
      type,
      text1: title || 'Notificación',
      text2: body || '',
      visibilityTime: 8000,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CommonContext.Provider value={contextValues}>
        <SafeAreaView style={[external.fx_1]}>
          <MyStack />
          <CustomLoader visible={loading} />
        </SafeAreaView>
        <Toast config={toastConfig} />
      </CommonContext.Provider>
    </GestureHandlerRootView>
  );
};

export const useValues = () => useContext(CommonContext);
export default App;
