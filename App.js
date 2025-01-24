import React, { createContext, useContext, useEffect, useState } from 'react';
import { SafeAreaView, LogBox } from 'react-native';
import MyStack from './src/navigation';
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
import { firebase } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';

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
    requestUserPermission();

    // Escuchar notificaciones entrantes
    listenToNotifications();
  }, []);

  const [loading, setLoading] = useState(false); // Estado para el loading

  // Establece la función de setLoading en el módulo de Axios
  useEffect(() => {
    setLoadingFunction(setLoading);
  }, []);

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

  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      if (enabled) {
        console.log('Authorization status1234:', authStatus);
      } else {
        console.log('Permission denied55');
      }
    } catch (error) {
      console.error('Error requesting permission68:', error);
    }
  };

  let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);

  
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', JSON.stringify(remoteMessage));
    // Aquí puedes manejar la notificación en segundo plano como desees
  });

  const handleForegroundNotification = async (remoteMessage) => {
    console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    // Aquí puedes manejar la notificación como desees


    console.log(remoteMessage.notification)

    console.log(remoteMessage.data.secretCode)
    if (remoteMessage.data.secretCode == "Aprovado Taller"){
      const alertData = await alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Rechazo Taller"){
      const alertData = await alert({
        type: DropdownAlertType.Error,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "Usuario contacta a taller"){
      const alertData = await alert({
        type: DropdownAlertType.Info,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    } else if (remoteMessage.data.secretCode == "New Taller Created"){
      const alertData = await alert({
        type: DropdownAlertType.Success,
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        interval: 8000,
        onDismissPress: () => {
          console.log("Foreground notification dismissed");
        }
      });
    }



  };

  const listenToNotifications = () => {
    messaging().onMessage(async remoteMessage => {
      handleForegroundNotification(remoteMessage);
    });
  };

  const test = () =>{
    console.log("51561jsdlghjksdhfjlksdhfjk")
  }

  return (
    <CommonContext.Provider value={contextValues}>
      <SafeAreaView style={[external.fx_1]}>
        <MyStack />
        <Spinner visible={loading} textContent={'Cargando...'} textStyle={{ color: '#FFF' }} />
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
