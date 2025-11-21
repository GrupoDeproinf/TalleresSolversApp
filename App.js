import React, { createContext, useContext, useEffect, useState } from 'react';
import { SafeAreaView, LogBox } from 'react-native';
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
