import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  Image,
  ToastAndroid,
  Button,
  KeyboardAvoidingView,
  Alert,
  Modal,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import AuthContainer from '../../../commonComponents/authContainer';
// import {
//   confirmPasswords,
//   createYourAccount,
//   dontHaveAccount,
//   emailId,
//   enterEmail,
//   enterNumber,
//   enterYouPassword,
//   exploreyourLife,
//   passwords,
//   phoneNumber,
//   reEnterPassword,
//   signIn,
//   signUp,
// } from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import { commonStyles } from '../../../style/commonStyle.css';
import { external } from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import { Email } from '../../../assets/icons/email';
import { Call, Key } from '../../../utils/icon';
import { useValues } from '../../../../App';

import UserImage from '../../../assets/newImage/user.png';
import KeyImage from '../../../assets/newImage/key.png';

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/Ionicons';
import Icons5 from 'react-native-vector-icons/AntDesign';

import Icons3 from 'react-native-vector-icons/Fontisto';
import Icons4 from 'react-native-vector-icons/Entypo';
import api from '../../../../axiosInstance';
import CheckBox from 'react-native-check-box';
import { RadioButton } from 'react-native-paper';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Buffer } from 'buffer';

import { WebView } from 'react-native-webview';
import messaging from '@react-native-firebase/messaging';

import Geolocation from '@react-native-community/geolocation';
import { Dropdown } from 'react-native-element-dropdown';



const MAPBOX_TOKEN = 'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

const buildLocationPickerHTML = (lat, lng) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,sans-serif;background:#1D1E56;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none!important;}
    #pin{position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);z-index:10;pointer-events:none;}
    #pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));}
    #bottom{position:absolute;bottom:0;left:0;right:0;background:#1D1E56;border-radius:22px 22px 0 0;padding:16px 20px 40px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);z-index:20;}
    #handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px;}
    #confirm-btn{width:100%;padding:17px 0;border:none;border-radius:16px;background:#FFD60A;font-size:16px;font-weight:900;color:#1D1E56;cursor:pointer;letter-spacing:0.2px;}
    #hint{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:rgba(29,30,86,0.82);border-radius:20px;padding:7px 16px;z-index:15;pointer-events:none;white-space:nowrap;}
    #hint span{font-size:12px;color:#FFFFFF;font-weight:600;}
    #locate-btn{position:absolute;top:16px;right:16px;width:46px;height:46px;border-radius:23px;background:#FFFFFF;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);z-index:15;transition:opacity 0.2s;}
    #locate-btn.loading{opacity:0.5;pointer-events:none;}
    @keyframes spin{to{transform:rotate(360deg);}}
    #locate-btn.loading svg{animation:spin 0.9s linear infinite;}
  </style>
</head>
<body>
<div id="map"></div>
<div id="pin">
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#E11D48"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
  </svg>
</div>
<div id="hint"><span>Mueve el mapa para ajustar el pin</span></div>
<button id="locate-btn" onclick="requestLocation()">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="#1D1E56" stroke-width="2.2"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1D1E56" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
</button>
<div id="bottom">
  <div id="handle"></div>
  <button id="confirm-btn" onclick="confirm()">Usar esta ubicación</button>
</div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[${lng},${lat}],zoom:15,attributionControl:false});
var currentLng=${lng},currentLat=${lat};
map.on('move',function(){var c=map.getCenter();currentLng=+c.lng.toFixed(6);currentLat=+c.lat.toFixed(6);});
setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);
function confirm(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'confirm',lat:currentLat,lng:currentLng}));}
function requestLocation(){var btn=document.getElementById('locate-btn');if(btn)btn.classList.add('loading');window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'requestLocation'}));}
window.flyToLocation=function(lat,lng){currentLat=lat;currentLng=lng;map.flyTo({center:[lng,lat],zoom:16,duration:800,essential:true});var btn=document.getElementById('locate-btn');if(btn)btn.classList.remove('loading');};
<\/script>
</body>
</html>`;

const BUSINESS_DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label: value, value };
});

const buildDefaultBusinessHours = () =>
  BUSINESS_DAYS.reduce((acc, day) => {
    acc[day.key] = { enabled: false, open: '08:00', close: '17:00' };
    return acc;
  }, {});

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState(0);
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cedulaError, setcedulaError] = useState('');
  const [NombreError, setNombreError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(false);
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [iscedulaTyping, setcedulaTyping] = useState(false);
  const [NombreTyping, setNombreTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isConfTyping, setConfPwdTyping] = useState(false);

  const [typeOfView, settypeOfView] = useState('');
  const [termsVisible, setTermsVisible] = useState(false);

  const [selectedPrefix, setSelectedPrefix] = useState('J-'); // Default value 'J'

  const [MetodosPagoSelected, setMetodosPagoSelected] = useState([]);

  const [whats, setwhats] = useState(0);
  const [whatsError, setwhatsError] = useState('');

  const [lat, setlat] = useState(37.7749);
  const [lng, setlng] = useState(-122.4194);

  // Nuevos campos para el formulario de taller
  const [Direccion, setDireccion] = useState('');
  const [DireccionError, setDireccionError] = useState('');
  const [DireccionTyping, setDireccionTyping] = useState(false);

  const [RegComercial, setRegComercial] = useState('');
  const [RegComercialError, setRegComercialError] = useState('');
  const [RegComercialTyping, setRegComercialTyping] = useState(false);

  const [checked, setChecked] = useState('no'); // Para agente autorizado

  const [Caracteristicas, setCaracteristicas] = useState('');
  const [CaracteristicasError, setCaracteristicasError] = useState('');
  const [CaracteristicasTyping, setCaracteristicasTyping] = useState(false);

  const [Experiencia, setExperiencia] = useState('');
  const [ExperienciaError, setExperienciaError] = useState('');
  const [ExperienciaTyping, setExperienciaTyping] = useState(false);

  const [LinkFacebook, setLinkFacebook] = useState('');
  const [LinkFacebookError, setLinkFacebookError] = useState('');

  const [LinkInstagram, setLinkInstagram] = useState('');
  const [LinkInstagramError, setLinkInstagramError] = useState('');

  const [LinkTiktok, setLinkTiktok] = useState('');
  const [LinkTiktokError, setLinkTiktokError] = useState('');

  const [seguro, setseguro] = useState('');
  const [seguroError, setseguroError] = useState('');
  const [seguroTyping, setseguroTyping] = useState(false);

  // Estados de error para documentos requeridos
  const [rifIdFiscalError, setRifIdFiscalError] = useState('');
  const [fotoFrenteTallerError, setFotoFrenteTallerError] = useState('');
  const [fotoInternaTallerError, setFotoInternaTallerError] = useState('');

  // Modal selector de foto (galería / cámara / documento)
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget,  setPhotoModalTarget]  = useState(null); // 'frente' | 'interna'

  // Estados para el sistema de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(8);

  const [showMapboxTestModal, setShowMapboxTestModal] = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);
  const [locationManuallyModified, setLocationManuallyModified] = useState(false);
  const locationPickerRef = useRef(null);

  const [metodosPago, setMetodosPago] = useState([
    { label: 'Efectivo', value: 'efectivo', checked: false },
    { label: 'Pago Móvil', value: 'pagoMovil', checked: false },
    { label: 'Punto de venta', value: 'puntoVenta', checked: false },
    { label: 'Credito internacional', value: 'tarjetaCreditoI', checked: false },
    { label: 'Credito nacional', value: 'tarjetaCreditoN', checked: false },
    { label: 'Transferencia', value: 'transferencia', checked: false },
    { label: 'Zelle', value: 'zelle', checked: false },
    { label: 'Zinli', value: 'zinli', checked: false },
  ]);

  const [estadoSelected, setestadoSelected] = useState(''); // Default value 'J'

  const [estadosVenezuela, setEstadosVenezuela] = useState([
    { label: 'Seleccione un estado', value: '' },
    { label: 'Amazonas', value: 'Amazonas' },
    { label: 'Anzoátegui', value: 'Anzoátegui' },
    { label: 'Apure', value: 'Apure' },
    { label: 'Aragua', value: 'Aragua' },
    { label: 'Barinas', value: 'Barinas' },
    { label: 'Bolívar', value: 'Bolívar' },
    { label: 'Carabobo', value: 'Carabobo' },
    { label: 'Cojedes', value: 'Cojedes' },
    { label: 'Delta Amacuro', value: 'Delta Amacuro' },
    { label: 'Distrito Capital', value: 'Distrito Capital' },
    { label: 'Falcón', value: 'Falcón' },
    { label: 'Guárico', value: 'Guárico' },
    { label: 'Lara', value: 'Lara' },
    { label: 'La Guaira', value: 'La Guaira' },
    { label: 'Mérida', value: 'Mérida' },
    { label: 'Miranda', value: 'Miranda' },
    { label: 'Monagas', value: 'Monagas' },
    { label: 'Nueva Esparta', value: 'Nueva Esparta' },
    { label: 'Portuguesa', value: 'Portuguesa' },
    { label: 'Sucre', value: 'Sucre' },
    { label: 'Táchira', value: 'Táchira' },
    { label: 'Trujillo', value: 'Trujillo' },
    { label: 'Yaracuy', value: 'Yaracuy' },
    { label: 'Zulia', value: 'Zulia' },
  ]);

  const [businessHours, setBusinessHours] = useState(buildDefaultBusinessHours);
  const [businessHoursError, setBusinessHoursError] = useState('');

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'Cliente', title: 'Cliente' },
    { key: 'Taller', title: 'Taller' },
  ]);

  useEffect(() => { }, [isGetOtpDisabled]);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Direccion de correo incorrecta');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePhone = () => {
    // Verificar que phone no sea undefined o null
    if (!phone || phone === '') {
      setPhoneError('Teléfono es requerido');
      return false;
    }
    
    // Eliminar la máscara para validar solo los números
    const numericPhone = phone.replace(/[^0-9]/g, ''); // Remueve paréntesis, espacios y guiones
    
    // Validar que no empiece con 0
    if (numericPhone.length > 0 && numericPhone[0] === '0') {
      setPhoneError('El número no puede empezar con 0');
      return false;
    }
    
    const phoneRegex = /^\d{10}$/; // Validar exactamente 10 dígitos

    if (!phoneRegex.test(numericPhone)) {
      setPhoneError('Teléfono debe contener exactamente 10 dígitos');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };


  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  const validateDireccion = () => {
    if (Direccion?.trim() === '') {
      setDireccionError('Dirección es requerida');
      return false;
    } else {
      setDireccionError('');
      return true;
    }
  };

  const validateRegComercial = () => {
    if (RegComercial?.trim() === '') {
      setRegComercialError('Registro comercial es requerido');
      return false;
    } else {
      setRegComercialError('');
      return true;
    }
  };

  const validateCaracteristicas = () => {
    if (Caracteristicas?.trim() === '') {
      setCaracteristicasError('Características es requerido');
      return false;
    } else {
      setCaracteristicasError('');
      return true;
    }
  };

  const validateExperiencia = () => {
    if (Experiencia?.trim() === '') {
      setExperienciaError('Experiencia es requerida');
      return false;
    } else {
      setExperienciaError('');
      return true;
    }
  };

  const validateSeguro = () => {
    if (seguro?.trim() === '') {
      setseguroError('Seguro es requerido');
      return false;
    } else {
      setseguroError('');
      return true;
    }
  };

  const validateBusinessHours = () => {
    const hasSelectedDay = BUSINESS_DAYS.some(day => businessHours[day.key]?.enabled);
    if (!hasSelectedDay) {
      setBusinessHoursError('Debes seleccionar al menos un día de atención');
      return false;
    }

    const invalidDay = BUSINESS_DAYS.find(day => {
      const item = businessHours[day.key];
      if (!item?.enabled) {
        return false;
      }
      return !item.open || !item.close || item.open >= item.close;
    });

    if (invalidDay) {
      setBusinessHoursError(
        'Verifica que la hora de cierre sea mayor a la de apertura',
      );
      return false;
    }

    setBusinessHoursError('');
    return true;
  };

  // Funciones para navegación entre pasos
  const nextStep = () => {
    // Ejecutar validación antes de avanzar
    const isValid = validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Función para validar el paso actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Información básica - REQUERIDO
        return Nombre?.trim() !== '' && 
               selectedPrefix !== '' && 
               cedula !== '' && 
               cedula !== 0 && 
               email?.trim() !== '' && 
               validateEmail();
      case 2: // Ubicación - REQUERIDO
        return estadoSelected !== '' && Direccion?.trim() !== '';
      case 3: // Contacto - REQUERIDO
        return phone && phone !== '' && whats && whats !== '' && validatePhone();
      case 4: // Información del taller - OPCIONAL
        return true; // Siempre permite continuar
      case 5: // Redes sociales y seguro - OPCIONAL
        return true; // Siempre permite continuar
      case 6: // Documentos - REQUERIDO
        // Validar y establecer errores
        if (!rifIdFiscalUri || rifIdFiscalUri === '') {
          setRifIdFiscalError('RIF/ID Fiscal es requerido');
        } else {
          setRifIdFiscalError('');
        }
        
        if (!fotoFrenteTallerUri || fotoFrenteTallerUri === '') {
          setFotoFrenteTallerError('Foto del Frente del Negocio es requerida');
        } else {
          setFotoFrenteTallerError('');
        }
        
        if (!fotoInternaTallerUri || fotoInternaTallerUri === '') {
          setFotoInternaTallerError('Foto Interna del Negocio es requerida');
        } else {
          setFotoInternaTallerError('');
        }
        
        return rifIdFiscalUri !== null && 
               rifIdFiscalUri !== '' && 
               fotoFrenteTallerUri !== null && 
               fotoFrenteTallerUri !== '' && 
               fotoInternaTallerUri !== null && 
               fotoInternaTallerUri !== '';
      case 7: // Horarios - REQUERIDO
        return validateBusinessHours();
      case 8: // Contraseñas - REQUERIDO
        return password?.trim() !== '' && confirmPassword?.trim() !== '' && validatePassword() && validateConfirmPassword();
      default:
        return false;
    }
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    } else {
      console.error('El usuario no otorgó permisos de notificaciones.');
    }
  }

  useEffect(() => {
    requestUserPermission();
    getCurrentLocation();
  }, []);

  // useEffect(() => {
  //   getFCMToken();
  // }, []);

  // const getFCMToken = async () => {
  //   // Registra el dispositivo para mensajes remotos
  //   await messaging().registerDeviceForRemoteMessages();

  //   const token = await messaging().getToken();
  //   console.log("FCM el token 1:", token);
  // }





  const onHandleChange = async () => {
    console.log(typeOfView);
    console.log('Aquiiiiiiiiiiiiiii');

    try {

      // Registra el dispositivo para mensajes remotos
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      console.log("FCM el token 1:", token);
      // setGetOtpDisabled(true);

      if (typeOfView == 'Cliente') {
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (
          isEmailValid == true &&
          isPhoneValid == true &&
          isPasswordValid == true &&
          isConfirmPasswordValid == true &&
          Nombre != '' &&
          cedula != 0 &&
          cedula != '' &&
          estadoSelected != ''
        ) {
          try {
            const phoneValidationResponse = await api.post('/home/validatePhone', {
              phone,
            });

            const emailValidationResponse = await api.post('/home/validateEmail', {
              email,
            });

            console.log('phoneValidationResponse', phoneValidationResponse)
            console.log("emailValidationResponse", emailValidationResponse)

            if (
              phoneValidationResponse.status === 200 &&
              phoneValidationResponse.data.valid === true &&
              emailValidationResponse.status === 200 &&
              emailValidationResponse.data.valid === true
            ) {
              const infoUserCreated = {
                Nombre: Nombre,
                cedula: selectedPrefix + '' + cedula,
                phone: phone?.replace(/\s+/g, ""),
                typeUser: 'Cliente',
                email: email.toLowerCase(),
                password: password,
                estado: estadoSelected,
                base64: base64,
                token: token
              };

              console.log('infoUserCreated', infoUserCreated);

              try {
                // Hacer la solicitud POST utilizando Axios
                const response = await api.post(
                  '/usuarios/SaveClient',
                  infoUserCreated,
                );

                // Verificar la respuesta del servidor
                console.log(response); // Mostrar la respuesta completa

                const result = response.data; // Los datos vienen directamente de response.data
                console.log(result); // Aquí puedes manejar la respuesta

                try {
                  const jsonValue = JSON.stringify(infoUserCreated);
                  console.log(jsonValue);
                  await AsyncStorage.setItem('@userInfo', jsonValue);
                } catch (e) {
                  console.log(e);
                }

                // Limpiar los campos del formulario
                setNombre('');
                setcedula(0);
                setEmail('');
                setPhone(0);
                setPassword('');
                setConfirmPassword('');
                settypeOfView('');
                setSelectedPrefix('J-');

                showToast('Usuario creado exitosamente');
                setGetOtpDisabled(false);
                navigation.navigate('Login');
              } catch (error) {
                if (error.response) {
                  // La solicitud se hizo y el servidor respondió con un código de estado
                  console.error(
                    'Error al guardar el usuario:',
                    error?.response?.data?.message,
                  );
                  setGetOtpDisabled(false);
                  console.log(error.response)
                  showToast(error?.response?.data?.message == undefined ? error?.response?.data : error?.response?.data?.message); // Mostrar el mensaje de error del servidor
                } else {
                  // La solicitud fue hecha pero no se recibió respuesta
                  console.error('Error en la solicitud:', error);
                  setGetOtpDisabled(false);
                }
              }
            } else {
              setGetOtpDisabled(false);
              showToast('El número de teléfono o el correo electrónico ya está registrado.');
            }
          } catch (error) {
            setGetOtpDisabled(false);
            if (error.response) {
              console.error(
                'Error en la solicitud:',
                error.response.data.message || error.response.statusText,
              );
              showToast(error.response.data.message || 'Error en la solicitud');
            } else {
              console.error('Error en la solicitud:', error.message);
              showToast('Error en la solicitud');
            }
          }
        } else {
          setGetOtpDisabled(false);
          showToast('Error al crear al usuario, por favor validar formulario');
        }
      } else {


        if (lng == -122.406417 && lat == 37.785834 && ModalOpened == false) {
          showToast('Error al crear al usuario, debe seleccionar una ubicación en el mapa');
          setGetOtpDisabled(false);
          return;
        }

  

        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        const isDireccionValid = validateDireccion();
        const isRegComercialValid = validateRegComercial();
        const isCaracteristicasValid = validateCaracteristicas();
        const isExperienciaValid = validateExperiencia();
        const isSeguroValid = validateSeguro();

        // Solo validar campos requeridos (pasos 1, 2, 3 y 6)
        if (
          isEmailValid == true &&
          isPhoneValid == true &&
          isPasswordValid == true &&
          isConfirmPasswordValid == true &&
          isDireccionValid == true &&
          Nombre != '' &&
          cedula != 0 &&
          cedula != '' &&
          whats != '' &&
          whats != 0 &&
          estadoSelected != ''
        ) {
          try {
            const phoneValidationResponse = await api.post('/home/validatePhone', {
              phone,
            });

            const emailValidationResponse = await api.post('/home/validateEmail', {
              email,
            });

            if (
              phoneValidationResponse.status === 200 &&
              phoneValidationResponse.data.valid === true &&
              emailValidationResponse.status === 200 &&
              emailValidationResponse.data.valid === true
            ) {
              const newFormatMP = metodosPago.reduce((acc, method) => {
                acc[method.value] = method.checked;
                return acc;
              }, {});

              const infoUserCreated = {
                nombre: Nombre == undefined ? '' : Nombre,
                rif: cedula == undefined ? '' : selectedPrefix + '' + cedula,
                phone: phone == undefined ? '' : phone?.replace(/\s+/g, ""),
                typeUser: 'Taller',
                email: email == undefined ? '' : email.toLowerCase(),
                password: password,
                status: 'En espera por aprobación',
                Direccion: Direccion == undefined ? '' : Direccion,
                RegComercial: RegComercial == undefined ? '' : RegComercial,
                Caracteristicas: Caracteristicas == undefined ? '' : Caracteristicas,
                Experiencia: Experiencia == undefined ? '' : Experiencia,
                LinkFacebook: LinkFacebook == undefined ? '' : LinkFacebook,
                LinkInstagram: LinkInstagram == undefined ? '' : LinkInstagram,
                LinkTiktok: LinkTiktok == undefined ? '' : LinkTiktok,
                seguro: seguro == undefined ? '' : seguro,
                agenteAutorizado: checked == undefined ? false : checked,
                whatsapp: whats?.replace(/\s+/g, ""),
                metodos_pago: newFormatMP,
                horarios_atencion: businessHours,
                estado: estadoSelected,
                base64: base64 == null || base64 == undefined || base64 == '' ? "" : base64,
                rifIdFiscal: rifIdFiscalBase64 == null || rifIdFiscalBase64 == undefined || rifIdFiscalBase64 == '' ? "" : rifIdFiscalBase64,
                permisoOperacion: permisoOperacionBase64 == null || permisoOperacionBase64 == undefined || permisoOperacionBase64 == '' ? "" : permisoOperacionBase64,
                logotipoNegocio: logotipoNegocioBase64 == null || logotipoNegocioBase64 == undefined || logotipoNegocioBase64 == '' ? "" : logotipoNegocioBase64,
                fotoFrenteTaller: fotoFrenteTallerBase64 == null || fotoFrenteTallerBase64 == undefined || fotoFrenteTallerBase64 == '' ? "" : fotoFrenteTallerBase64,
                fotoInternaTaller: fotoInternaTallerBase64 == null || fotoInternaTallerBase64 == undefined || fotoInternaTallerBase64 == '' ? "" : fotoInternaTallerBase64,
                ubicacion: {
                  lat: lat,
                  lng: lng
                },
                lat: lat,
                lng: lng,
                token: token
              };

              console.log(infoUserCreated);
              console.log('Aquiiiiiiiiiiiii123');

              try {
                // Hacer la solicitud POST utilizando Axios
                const response = await api.post(
                  '/usuarios/SaveTallerExtended',
                  infoUserCreated,
                );

                // Verificar la respuesta del servidor
                console.log(response); // Mostrar la respuesta completa

                const result = response.data; // Los datos vienen directamente de response.data
                console.log("Este es el resultado de la respuesta", result); // Aquí puedes manejar la respuesta

                infoUserCreated.uid = result.uid;

                try {
                  const jsonValue = JSON.stringify(infoUserCreated);
                  console.log(jsonValue);
                  await AsyncStorage.setItem('@userInfo', jsonValue);
                } catch (e) {
                  console.log(e);
                }

                // Limpiar los campos del formulario
                setNombre('');
                setcedula(0);
                setEmail('');
                setPhone(0);
                setPassword('');
                setConfirmPassword('');
                settypeOfView('');
                setSelectedPrefix('J-');
                setDireccion('');
                setRegComercial('');
                setChecked('no');
                setCaracteristicas('');
                setExperiencia('');
                setLinkFacebook('');
                setLinkInstagram('');
                setLinkTiktok('');
                setseguro('');
                setwhats(0);
                setImageUri(null);
                setBase64(null);
                setRifIdFiscalUri(null);
                setRifIdFiscalBase64(null);
                setPermisoOperacionUri(null);
                setPermisoOperacionBase64(null);
                setLogotipoNegocioUri(null);
                setLogotipoNegocioBase64(null);
                setFotoFrenteTallerUri(null);
                setFotoFrenteTallerBase64(null);
                setFotoInternaTallerUri(null);
                setFotoInternaTallerBase64(null);
                setBusinessHours(buildDefaultBusinessHours());
                setBusinessHoursError('');



                showToast('Negocio registrado exitosamente');
                setCurrentStep(1)
                setGetOtpDisabled(false);
                navigation.navigate('PlanesRegistro');

                


                


              } catch (error) {
                if (error.response) {
                  // La solicitud se hizo y el servidor respondió con un código de estado
                  const errorMessage =
                    error.response.data.message || 'Error al crear el usuario.';
                  console.error('Error al guardar el usuario:', errorMessage);
                  setGetOtpDisabled(false);
                  showToast(errorMessage); // Mostrar el mensaje de error del servidor
                } else {
                  // La solicitud fue hecha pero no se recibió respuesta
                  console.error('Error en la solicitud:', error);
                  setGetOtpDisabled(false);
                  showToast(
                    'Error al crear al usuario, por favor validar formulario',
                  );
                }
              }
            } else {
              setGetOtpDisabled(false);
              showToast('El número de teléfono o el correo electrónico ya está registrado.');
            }
          } catch (error) {
            setGetOtpDisabled(false);
            if (error.response) {
              console.error(
                'Error en la solicitud:',
                error.response.data.message || error.response.statusText,
              );
              showToast(error.response.data.message || 'Error en la solicitud');
            } else {
              console.error('Error en la solicitud:', error.message);
              showToast('Error en la solicitud');
            }
          }
        } else {
          showToast('Error al crear al usuario, por favor validar formulario');
          setGetOtpDisabled(false);
        }
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }

  };


  const { bgFullStyle, textColorStyle, t, textRTLStyle } = useValues();

  // Estilos para el sistema de pasos
  const stepStyles = StyleSheet.create({
    progressContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#f8f9fa',
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
    },
    progressBar: {
      height: 4,
      backgroundColor: '#e9ecef',
      borderRadius: 2,
      marginBottom: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2D3261',
      borderRadius: 2,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stepDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#e9ecef',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#e9ecef',
    },
    stepDotActive: {
      backgroundColor: '#FFD60A',
      borderColor: '#FFD60A',
    },
    stepDotCompleted: {
      backgroundColor: '#FFD60A',
      borderColor: '#FFD60A',
    },
    stepNumber: {
      color: '#6c757d',
      fontSize: 11,
      fontWeight: 'bold',
    },
    stepNumberActive: {
      color: '#1F2344',
    },
    stepNumberCompleted: {
      color: '#1F2344',
    },
    stepTitle: {
      fontSize: 10,
      color: '#6c757d',
      textAlign: 'center',
      marginTop: 5,
      fontWeight: '500',
    },
    stepTitleActive: {
      color: '#2D3261',
      fontWeight: 'bold',
    },
    stepTitleCompleted: {
      color: '#FFD60A',
      fontWeight: 'bold',
    },
    stepContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      marginTop: 8,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: 1,
      borderColor: 'rgba(15,23,42,0.05)',
    },
    stepHeader: {
      marginBottom: 20,
      alignItems: 'center',
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2D3261',
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: '#6c757d',
      textAlign: 'center',
      lineHeight: 22,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e9ecef',
    },
    navButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    navButtonSecondary: {
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#dee2e6',
    },
    navButtonPrimary: {
      backgroundColor: '#2D3261',
    },
    navButtonDisabled: {
      backgroundColor: '#e9ecef',
      opacity: 0.6,
    },
    navButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    navButtonTextSecondary: {
      color: '#6c757d',
    },
    navButtonTextPrimary: {
      color: '#ffffff',
    },
    navButtonTextDisabled: {
      color: '#adb5bd',
    },
  });


  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  // Componente del indicador de progreso
  const ProgressIndicator = () => {
    const steps = [
      { number: 1, title: 'Básico' },
      { number: 2, title: 'Ubicación' },
      { number: 3, title: 'Contacto' },
      { number: 4, title: 'Negocio' },
      { number: 5, title: 'Redes' },
      { number: 6, title: 'Documentos' },
      { number: 7, title: 'Horarios' },
      { number: 8, title: 'Seguridad' },
    ];

    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const currentStepConfig = steps.find(s => s.number === currentStep);
    let motivationalText = 'Completa cada paso para registrar tu negocio.';
    if (progressPercent >= 25 && progressPercent < 50) {
      motivationalText = '¡Buen comienzo! Sigue avanzando con los siguientes datos.';
    } else if (progressPercent >= 50 && progressPercent < 75) {
      motivationalText = '¡Vas a mitad de camino! Cada paso te acerca a más clientes.';
    } else if (progressPercent >= 75 && progressPercent < 100) {
      motivationalText = '¡Ya casi terminas! Revisa y completa los últimos detalles.';
    } else if (progressPercent === 100) {
      motivationalText = '¡Excelente! Tu registro está listo para enviarse.';
    }

    return (
      <View
        style={[
          stepStyles.progressContainer,
          typeOfView === 'Taller' && {
            paddingVertical: 4,
            paddingHorizontal: 12,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          },
        ]}>
        {typeOfView !== 'Taller' && (
          <View style={stepStyles.progressBar}>
            <View
              style={[
                stepStyles.progressFill,
                { width: `${(currentStep / totalSteps) * 100}%` },
              ]}
            />
          </View>
        )}
        <View style={stepStyles.stepIndicator}>
          {steps.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            
            return (
              <View
                key={step.number}
                style={[
                  stepStyles.stepDot,
                  isActive && stepStyles.stepDotActive,
                  isCompleted && stepStyles.stepDotCompleted,
                ]}
              >
                <Text
                  style={[
                    stepStyles.stepNumber,
                    isActive && stepStyles.stepNumberActive,
                    isCompleted && stepStyles.stepNumberCompleted,
                  ]}
                >
                  {isCompleted ? '✓' : step.number}
                </Text>
              </View>
            );
          })}
        </View>
        {/* Progreso de campos requeridos */}
        {(() => {
          const required = [
            (Nombre || '').trim() !== '',
            String(cedula || '').trim() !== '' && cedula !== 0,
            (email || '').trim() !== '',
            (estadoSelected || '').trim() !== '',
            (Direccion || '').trim() !== '',
            (phone || '').trim() !== '',
            (whats || '').trim() !== '',
            !!rifIdFiscalUri,
            !!fotoFrenteTallerUri,
            !!fotoInternaTallerUri,
            BUSINESS_DAYS.some(d => businessHours[d.key]?.enabled),
            (password || '').trim().length >= 6,
            (confirmPassword || '').trim() !== '' && confirmPassword === password,
          ];
          const filled = required.filter(Boolean).length;
          const total  = required.length;
          const pct    = Math.round((filled / total) * 100);
          const barColor = pct < 40 ? '#F59E0B' : pct < 80 ? '#3B82F6' : '#22C55E';
          return (
            <View style={{ marginTop: 6, paddingHorizontal: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 10, color: appColors.subtitle, textAlign: 'center', flex: 2 }}>
                  Paso {currentStep} de {totalSteps}{currentStepConfig ? ` · ${currentStepConfig.title}` : ''}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: barColor }}>
                    {pct}%
                  </Text>
                </View>
              </View>
              <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }}>
                <View style={{ height: 4, width: `${pct}%`, backgroundColor: barColor, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 10, color: appColors.primary, textAlign: 'center', marginTop: 3 }}>
                {filled} de {total} campos requeridos completados
              </Text>
            </View>
          );
        })()}
      </View>
    );
  };

  // Componente de navegación
  const StepNavigation = () => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;
    const canProceed = validateCurrentStep();

    return (
      <View style={stepStyles.navigationContainer}>
        <TouchableOpacity
          style={[
            stepStyles.navButton,
            stepStyles.navButtonSecondary,
            isFirstStep && stepStyles.navButtonDisabled,
          ]}
          onPress={prevStep}
          disabled={isFirstStep}
        >
          <Text
            style={[
              stepStyles.navButtonText,
              stepStyles.navButtonTextSecondary,
              isFirstStep && stepStyles.navButtonTextDisabled,
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        {isLastStep ? (
          <TouchableOpacity
            style={[
              stepStyles.navButton,
              stepStyles.navButtonPrimary,
              !canProceed && stepStyles.navButtonDisabled,
            ]}
            onPress={() => setTermsVisible(true)}
            disabled={!canProceed}
          >
            <Text
              style={[
                stepStyles.navButtonText,
                stepStyles.navButtonTextPrimary,
                !canProceed && stepStyles.navButtonTextDisabled,
              ]}
            >
              Finalizar
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              stepStyles.navButton,
              stepStyles.navButtonPrimary,
              !canProceed && stepStyles.navButtonDisabled,
            ]}
            onPress={nextStep}
            disabled={!canProceed}
          >
            <Text
              style={[
                stepStyles.navButtonText,
                stepStyles.navButtonTextPrimary,
                !canProceed && stepStyles.navButtonTextDisabled,
              ]}
            >
              Siguiente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Componentes para cada paso
  const renderStep1 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 200 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información básica del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Empecemos con el nombre y los datos fiscales principales de tu negocio.
        </Text>
      </View>

      <View
        style={{
          marginTop: 0,
          marginBottom: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginRight: 10,
            }}>
            {imageUri ? (
              <View style={stylesImage.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 90, height: 90, borderRadius: 18 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearImage}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 18,
                  backgroundColor: '#EEF2FF',
                  borderWidth: 1,
                  borderColor: 'rgba(45, 50, 97, 0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icons name="image" size={32} color="#2D3261" />
              </View>
            )}
          </View>
          <View style={{ flex: 2 }}>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('logo')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  {
                    marginLeft: 8,
                    color: '#2D3261',
                    fontSize: 13,
                    fontWeight: '600',
                  },
                ]}>
                Subir logo del negocio
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 6,
                fontSize: 10,
                color: '#9CA3AF',
              }}>
              JPG o PNG, máximo 5MB.
            </Text>
          </View>
        </View>
      </View>

      <TextInputs
        keyboardType="default"
        autoCapitalize="words"
        title="Nombre del Negocio"
        placeHolder="Ingrese el nombre"
        value={Nombre}
        onChangeText={text => {
          console.log(text);
          setNombre(text);
          setNombreTyping(true);
          if (text?.trim() === '') {
            setNombreError('Nombre es requerido');
          } else {
            setNombreError('');
          }
        }}
        onBlur={() => {
          setNombreTyping(false);
        }}
        icon={<Icons name="user" size={20} color="#9BA6B8" />}
        style={{
          backgroundColor: '#F3F4F6',
          borderRadius: 10,
        }}
        formCardMode={true}
      />
      {NombreError !== '' && (
        <Text style={styles.errorStyle}>{NombreError}</Text>
      )}

      <View style={{ marginTop: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: textColorStyle, marginBottom: 8 }}>
          Registro de Información Fiscal (RIF)
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Prefijo */}
          <View style={{
            width: 76,
            borderWidth: 1,
            borderColor: '#CBD5E1',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            height: 52,
            justifyContent: 'center',
          }}>
            <Dropdown
              style={{ borderWidth: 0, paddingHorizontal: 6, backgroundColor: 'transparent', height: 52 }}
              placeholderStyle={{ color: 'gray', fontSize: 14 }}
              selectedTextStyle={{ color: '#111827', fontSize: 14, fontWeight: '600' }}
              data={[
                { label: 'C-', value: 'C-' },
                { label: 'E-', value: 'E-' },
                { label: 'G-', value: 'G-' },
                { label: 'J-', value: 'J-' },
                { label: 'P-', value: 'P-' },
                { label: 'V-', value: 'V-' },
              ]}
              labelField="label"
              valueField="value"
              placeholder="J-"
              value={selectedPrefix}
              onChange={item => setSelectedPrefix(item.value)}
            />
          </View>

          {/* Número */}
          <View style={{
            flex: 1,
            marginLeft: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#CBD5E1',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            height: 52,
            paddingHorizontal: 12,
          }}>
            <Icons name="id-card-o" size={20} color="#9BA6B8" />
            <TextInput
              value={cedula}
              placeholder="Número de RIF"
              placeholderTextColor="#9BA6B8"
              keyboardType="numeric"
              style={{ flex: 1, marginLeft: 10, color: '#111827', fontSize: 15 }}
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 10) {
                  setcedula(numericText);
                  setcedulaTyping(true);
                  if (numericText?.trim() === '') {
                    setcedulaError('Documento es requerido');
                  } else {
                    setcedulaError('');
                  }
                }
              }}
              onBlur={() => setcedulaTyping(false)}
            />
          </View>
        </View>
        {cedulaError !== '' && (
          <Text style={styles.errorStyle}>{cedulaError}</Text>
        )}
      </View>

      <TextInputs
        title="Correo Electrónico"
        keyboardType={'email-address'}
        value={email}
        placeHolder="Ingrese su email"
        onChangeText={text => {
          setEmail(text);
          setEmailTyping(true);
          if (text?.trim() === '') {
            setEmailError('Email es requerido');
          } else {
            setEmailError('');
          }
        }}
        onBlur={() => {
          validateEmail();
          setEmailTyping(false);
        }}
        icon={
          <Email color={isEmailTyping ? '#051E47' : appColors.subtitle} />
        }
        style={{
          backgroundColor: '#F3F4F6',
          borderRadius: 10,
        }}
        formCardMode={true}
      />
      {emailError !== '' && (
        <Text style={styles.errorStyle}>{emailError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Ubicación del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Selecciona el estado y marca en el mapa dónde se encuentra tu negocio.
        </Text>
      </View>

      <View
        style={{
          marginTop: 8,
          marginBottom: 16,
        }}>
        <Text
          style={[
            styles.headingContainer,
            {
              color: textColorStyle,
              textAlign: 'left',
              marginBottom: 8,
            },
          ]}>
          Estado
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 10,
            backgroundColor: '#F3F4F6',
            height: 50,
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}>
          <Dropdown
            style={{
              width: '100%',
              borderWidth: 0,
              paddingHorizontal: 4,
              backgroundColor: 'transparent',
              height: 42,
            }}
            placeholderStyle={{
              color: 'gray',
              fontSize: 13,
            }}
            selectedTextStyle={{
              color: '#111827',
              fontSize: 13,
            }}
            data={estadosVenezuela}
            labelField="label"
            valueField="value"
            placeholder="Seleccione un estado"
            value={estadoSelected}
            onChange={item => setestadoSelected(item.value)}
            search={true}
          />
        </View>
      </View>

      {/* <View
        style={[
          stylesMap.container,
          {
            marginTop: 0,
            marginBottom: 12,
            borderRadius: 18,
            overflow: 'hidden',
          },
        ]}>
        {isMounted && (
          <MapComponent
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            edit={true}
            returnFunction={GetCoordenadas}
            useThisCoo={true}
          />
        )}
      </View> */}

      {/* Tarjeta de ubicación — mismo estilo que TallerEditStepper */}
      <View
        style={{
          marginBottom: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: locationPicked ? '#22C55E' : 'rgba(15,23,42,0.08)',
          backgroundColor: locationPicked ? '#F0FDF4' : '#F9FAFB',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: locationPicked ? '#DCFCE7' : '#EEF2FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icons2
            name={locationPicked ? 'location' : 'location-outline'}
            size={22}
            color={locationPicked ? '#16A34A' : '#2D3261'}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
            Ubicación del negocio
          </Text>
          {locationPicked && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: locationManuallyModified ? '#DBEAFE' : '#DCFCE7',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginTop: 3,
              }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: locationManuallyModified ? '#1D4ED8' : '#16A34A',
              }}>
                {locationManuallyModified ? 'Modificada' : 'Guardada'}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            {locationManuallyModified
              ? 'Ubicación actualizada correctamente'
              : locationPicked
              ? 'Ubicación guardada'
              : 'Aún no has seleccionado una ubicación'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowMapboxTestModal(true)}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#1D1E56',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}>
          <Text style={{ color: '#FFD60A', fontSize: 12, fontWeight: '700' }}>
            {locationPicked ? 'Cambiar' : 'Seleccionar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 4,
        }}>
        <TextInputs
          title="Dirección del Negocio"
          placeHolder="Describe la dirección lo más claro posible"
          value={Direccion}
          multiline={true}
          numberOfLines={4}
          height={120}
          onChangeText={text => {
            setDireccion(text);
            setDireccionTyping(true);
            if (text?.trim() === '') {
              setDireccionError('Direccion es requerido');
            } else {
              setDireccionError('');
            }
          }}
          onBlur={() => {
            setDireccionTyping(false);
          }}
          icon={<Icons name="map-marker" size={20} color="#9BA6B8" />}
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 10,
          }}
          formCardMode={true}
        />
      </View>
      {DireccionError !== '' && (
        <Text style={styles.errorStyle}>{DireccionError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información de contacto
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Agrega los números de teléfono y WhatsApp para que puedan comunicarse contigo.
        </Text>
      </View>

      <TextInputs
        title="Número Telefónico"
        value={phone}
        placeHolder="Ejem (414) 261-79-66"
        keyboardType="numeric"
        onChangeText={text => {
          let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

          console.log('numericText', numericText)

          // Validar que no empiece con 0
          if (numericText.length > 0 && numericText[0] == '0') {
            setPhoneError('El número no puede empezar con 0');
            setPhone('');
            return;
          }

          let formattedText = '';
          if (numericText.length > 0 && numericText.length <= 3) {
            formattedText = `${numericText}`;
          } else if (numericText.length > 3 && numericText.length <= 6) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
          } else if (numericText.length > 6 && numericText.length <= 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
          } else if (numericText.length > 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
          }
          setPhone(formattedText);
          setCallTyping(true);
          if (numericText?.trim() === '') {
            setPhoneError('Número telefónico requerido');
          } else {
            setPhoneError('');
          }
        }}
        onBlur={() => {
          validatePhone();
          setCallTyping(false);
        }}
        icon={
          <Call color={isCallTyping ? '#051E47' : appColors.subtitle} />
        }
        formCardMode={true}
      />
      {phoneError !== '' && (
        <Text style={styles.errorStyle}>{phoneError}</Text>
      )}

      <TextInputs
        title="Whatsapp"
        value={whats}
        placeHolder="Ejem (414) 261-79-66"
        keyboardType="numeric"
        onChangeText={text => {
          let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

          // Validar que no empiece con 0
          if (numericText.length > 0 && numericText[0] === '0') {
            setwhatsError('El número no puede empezar con 0');
            setwhats('');
            return;
          }

          let formattedText = '';
          if (numericText.length > 0 && numericText.length <= 3) {
            formattedText = `${numericText}`;
          } else if (numericText.length > 3 && numericText.length <= 6) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
          } else if (numericText.length > 6 && numericText.length <= 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
          } else if (numericText.length > 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
          }
          setwhats(formattedText);
          setCallTyping(true);
          if (numericText?.trim() === '') {
            setwhatsError('Número telefónico requerido');
          } else {
            setwhatsError('');
          }
        }}
        onBlur={() => {
          setCallTyping(false);
        }}
        icon={<Icons name="whatsapp" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {whatsError !== '' && (
        <Text style={styles.errorStyle}>{whatsError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep4 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Cuéntanos sobre tu experiencia, registro comercial y métodos de pago disponibles.
        </Text>
      </View>

      <TextInputs
        title="Registro Comercial"
        value={RegComercial}
        placeHolder="Ingrese su Registro Comercial"
        onChangeText={text => {
          const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
          if (numericText.length <= 10) {
            setRegComercial(numericText);
            setRegComercialTyping(true);
            if (numericText?.trim() === '') {
              setRegComercialError('Registro comercial es requerido');
            } else {
              setRegComercialError('');
            }
          }
        }}
        onBlur={() => {
          setRegComercialTyping(false);
        }}
        keyboardType="numeric"
        icon={<Icons name="id-card" size={20} color="#9BA6B8"/>}
        formCardMode={true}
      />
      {RegComercialError !== '' && (
        <Text style={styles.errorStyle}>{RegComercialError}</Text>
      )}

      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344', marginTop: 16, marginBottom: 10 }}>
        ¿Es un Agente Autorizado?
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {[
          { value: 'si', label: 'Sí',  icon: 'checkmark-circle-outline' },
          { value: 'no', label: 'No',  icon: 'close-circle-outline' },
        ].map(opt => {
          const isSelected = checked === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setChecked(opt.value)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: isSelected ? '#2D3261' : '#D1D5DB',
                backgroundColor: isSelected ? '#2D3261' : '#F9FAFB',
                gap: 8,
              }}>
              <Icons2
                name={opt.icon}
                size={20}
                color={isSelected ? '#FFD60A' : '#9CA3AF'}
              />
              <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#FFD60A' : '#4B5563' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInputs
        title="Caracteristicas del negocio"
        value={Caracteristicas}
        placeHolder="Característica del negocio (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
        multiline={true}
        numberOfLines={4}
        height={150}
        onChangeText={text => {
          setCaracteristicas(text);
          setCaracteristicasTyping(true);
          if (text?.trim() === '') {
            setCaracteristicasError('Caracteristicas es requerido');
          } else {
            setCaracteristicasError('');
          }
        }}
        onBlur={() => {
          validateCaracteristicas();
          setCaracteristicasTyping(false);
        }}
        icon={<Icons name="wrench" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {CaracteristicasError !== '' && (
        <Text style={styles.errorStyle}>{CaracteristicasError}</Text>
      )}

      <TextInputs
        title="Tiempo de experiencia en el área."
        placeHolder="Tiempo de experiencia"
        value={Experiencia}
        onChangeText={text => {
          setExperiencia(text);
          setExperienciaTyping(true);
          if (text?.trim() === '') {
            setExperienciaError('Experiencia es requerida');
          } else {
            setExperienciaError('');
          }
        }}
        onBlur={() => {
          setExperienciaTyping(false);
        }}
        icon={<Icons name="star" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {ExperienciaError !== '' && (
        <Text style={styles.errorStyle}>{ExperienciaError}</Text>
      )}

      <View style={{ marginTop: 5 }}>
        <Text
          style={[
            styles.headingContainer,
            { color: textColorStyle },
            { textAlign: textRTLStyle },
          ]}>
          Metodos de Pago
        </Text>

        <View style={{ padding: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            {metodosPago.map((method, index) => (
              <View
                key={method.value}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 5,
                  width: '45%',
                }}>
                <CheckBox
                  isChecked={method.checked}
                  onClick={() => toggleCheckBox(index)}
                  checkBoxColor="#2D3261"
                />
                <Text style={{ marginLeft: 10, color: 'black' }}>
                  {method.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep5 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Redes y seguro
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Conecta tus redes sociales y agrega la información del seguro de tu negocio.
        </Text>
      </View>

      <TextInputs
        title="Link de Facebook"
        placeHolder="https://www.facebook.com/"
        value={LinkFacebook}
        onChangeText={text => {
          setLinkFacebook(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="facebook-square" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {LinkFacebookError !== '' && (
        <Text style={styles.errorStyle}>{LinkFacebookError}</Text>
      )}

      <TextInputs
        title="Link de Instagram"
        placeHolder="https://www.instagram.com/"
        value={LinkInstagram}
        onChangeText={text => {
          setLinkInstagram(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="instagram" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {LinkInstagramError !== '' && (
        <Text style={styles.errorStyle}>{LinkInstagramError}</Text>
      )}

      <TextInputs
        title="Link de TikTok"
        placeHolder="https://www.tiktok.com/"
        value={LinkTiktok}
        onChangeText={text => {
          setLinkTiktok(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="rss-square" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {LinkTiktokError !== '' && (
        <Text style={styles.errorStyle}>{LinkTiktokError}</Text>
      )}

      <TextInputs
        title="Seguro del negocio"
        placeHolder="Ingrese su seguro"
        value={seguro}
        onChangeText={text => {
          setseguro(text);
          setseguroTyping(true);
          if (text?.trim() === '') {
            setseguroError('seguro es requerida');
          } else {
            setseguroError('');
          }
        }}
        onBlur={() => {
          setseguroTyping(false);
        }}
        icon={<Icons name="heart" size={20} color="#9BA6B8" />}
        formCardMode={true}
      />
      {seguroError !== '' && (
        <Text style={styles.errorStyle}>{seguroError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── Selector multi-origen (galería / cámara / documento) ──────────────────

  /** Convierte un URI local o content:// a base64 */
  const fileToBase64 = uri =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror   = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

  /** Aplica el resultado al campo correcto según el target */
  const applyPhotoResult = (target, uri, base64) => {
    if (target === 'frente') {
      setFotoFrenteTallerUri(uri);
      setFotoFrenteTallerBase64(base64);
      setFotoFrenteTallerError('');
    } else if (target === 'interna') {
      setFotoInternaTallerUri(uri);
      setFotoInternaTallerBase64(base64);
      setFotoInternaTallerError('');
    } else if (target === 'logo') {
      setImageUri(uri);
      setBase64(base64);
    } else if (target === 'rifIdFiscal') {
      setRifIdFiscalUri(uri);
      setRifIdFiscalBase64(base64);
      setRifIdFiscalError('');
    } else if (target === 'permisoOperacion') {
      setPermisoOperacionUri(uri);
      setPermisoOperacionBase64(base64);
    } else if (target === 'logotipoNegocio') {
      setLogotipoNegocioUri(uri);
      setLogotipoNegocioBase64(base64);
    }
  };

  const openPhotoOptions = target => {
    setPhotoModalTarget(target);
    setPhotoModalVisible(true);
  };

  const handlePickGallery = () => {
    const target = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) applyPhotoResult(target, asset.uri, asset.base64);
      });
    }, 400);
  };

  const handlePickCamera = async () => {
    const target = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          { title: 'Permiso de cámara', message: 'La app necesita acceso a tu cámara.' },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera({ mediaType: 'photo', includeBase64: true }, response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) applyPhotoResult(target, asset.uri, asset.base64);
      });
    }, 400);
  };

  const handlePickDocument = () => {
    const target = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
        const uri = result.uri;
        let base64 = null;
        try { base64 = await fileToBase64(uri); } catch (_) {}
        applyPhotoResult(target, uri, base64);
      } catch (e) {
        if (!DocumentPicker.isCancel(e)) {
          console.warn('[DocumentPicker] error:', e);
        }
      }
    }, 400);
  };

  const renderStep6 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
          <View
            style={{
              marginBottom: 18,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFF',
              borderWidth: 1,
              borderColor: 'rgba(37, 99, 235, 0.16)',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                textAlign: 'left',
                marginBottom: 6,
              }}>
              Documentos del servicio
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#4B5563',
                lineHeight: 18,
              }}>
              Sube los documentos necesarios para validar y proteger tu negocio.
            </Text>
          </View>

          {/* RIF/ID Fiscal */}
          <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              RIF / ID Fiscal
            </Text>
            {rifIdFiscalUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  source={{ uri: rifIdFiscalUri }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearRifIdFiscal}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: rifIdFiscalError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('rifIdFiscal')}>
              <Icons name="file-text-o" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar RIF/ID Fiscal
              </Text>
            </TouchableOpacity>
            {rifIdFiscalError !== '' && (
              <Text style={styles.errorStyle}>{rifIdFiscalError}</Text>
            )}
          </View>

          {/* Permiso de Operación */}
          {/* <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              Permiso de Operación
            </Text>
            {permisoOperacionUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  source={{ uri: permisoOperacionUri }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearPermisoOperacion}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('permisoOperacion')}>
              <Icons name="file-text-o" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar Permiso de Operación
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Logotipo del Negocio (Opcional) */}
          {/* <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 4,
              }}>
              Logotipo del Negocio
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
              Opcional
            </Text>
            {logotipoNegocioUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  source={{ uri: logotipoNegocioUri }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearLogotipoNegocio}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('logotipoNegocio')}>
              <Icons name="image" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar logotipo
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Foto del Frente del Negocio */}
          <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              Foto del Frente del Negocio
            </Text>
            {fotoFrenteTallerUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  source={{ uri: fotoFrenteTallerUri }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearFotoFrenteTaller}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: fotoFrenteTallerError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('frente')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar foto del frente del negocio
              </Text>
            </TouchableOpacity>
            {fotoFrenteTallerError !== '' && (
              <Text style={styles.errorStyle}>{fotoFrenteTallerError}</Text>
            )}
          </View>

          {/* Foto Interna del Negocio */}
          <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              Foto Interna del Negocio
            </Text>
            {fotoInternaTallerUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  source={{ uri: fotoInternaTallerUri }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearFotoInternaTaller}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: fotoInternaTallerError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('interna')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar foto interna
              </Text>
            </TouchableOpacity>
            {fotoInternaTallerError !== '' && (
              <Text style={styles.errorStyle}>{fotoInternaTallerError}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep7 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
          <View
            style={{
              marginBottom: 18,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFF',
              borderWidth: 1,
              borderColor: 'rgba(37, 99, 235, 0.16)',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                textAlign: 'left',
                marginBottom: 6,
              }}>
              Horarios de atención
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#4B5563',
                lineHeight: 18,
              }}>
              Selecciona los días que atiendes y define tu hora de apertura y
              cierre para cada uno.
            </Text>
          </View>

          {BUSINESS_DAYS.map(day => {
            const dayData = businessHours[day.key] || {};
            return (
              <View
                key={day.key}
                style={{
                  marginBottom: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(15,23,42,0.08)',
                  backgroundColor: '#FFFFFF',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: dayData.enabled ? 10 : 0,
                  }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                    {day.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setBusinessHours(prev => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          enabled: !prev[day.key]?.enabled,
                        },
                      }));
                      setBusinessHoursError('');
                    }}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: dayData.enabled ? '#DCFCE7' : '#F3F4F6',
                      borderColor: dayData.enabled ? '#22C55E' : '#D1D5DB',
                      borderWidth: 1,
                      borderRadius: 999,
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                    }}>
                    <Text
                      style={{
                        color: dayData.enabled ? '#166534' : '#4B5563',
                        fontSize: 12,
                        fontWeight: '700',
                      }}>
                      {dayData.enabled ? 'Activo' : 'Inactivo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {dayData.enabled ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                          marginBottom: 6,
                          fontWeight: '600',
                        }}>
                        Apertura
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          backgroundColor: '#F9FAFB',
                          height: 44,
                          justifyContent: 'center',
                          paddingHorizontal: 8,
                        }}>
                        <Dropdown
                          style={{
                            width: '100%',
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                            height: 38,
                          }}
                          placeholderStyle={{ color: '#6B7280', fontSize: 13 }}
                          selectedTextStyle={{ color: '#111827', fontSize: 13 }}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.open}
                          onChange={item => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {
                                ...prev[day.key],
                                open: item.value,
                              },
                            }));
                            setBusinessHoursError('');
                          }}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                          marginBottom: 6,
                          fontWeight: '600',
                        }}>
                        Cierre
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          backgroundColor: '#F9FAFB',
                          height: 44,
                          justifyContent: 'center',
                          paddingHorizontal: 8,
                        }}>
                        <Dropdown
                          style={{
                            width: '100%',
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                            height: 38,
                          }}
                          placeholderStyle={{ color: '#6B7280', fontSize: 13 }}
                          selectedTextStyle={{ color: '#111827', fontSize: 13 }}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.close}
                          onChange={item => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {
                                ...prev[day.key],
                                close: item.value,
                              },
                            }));
                            setBusinessHoursError('');
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}

          {businessHoursError ? (
            <Text style={styles.errorStyle}>{businessHoursError}</Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep8 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Seguridad de la cuenta
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Crea una contraseña segura para proteger el acceso a tu taller.
        </Text>
      </View>

      <TextInputs
        title="Contraseña"
        value={password}
        placeHolder="Ingrese su contraseña"
        secureTextEntry={showPass3}
        showPass={true}
        changePassValue={changePassValue3}
        onChangeText={text => {
          setPassword(text);
          setPwdTyping(true);
          if (text.length < 6) {
            setPasswordError('Contraseña debe tener mínimo 6 dígitos');
          } else {
            setPasswordError('');
          }
        }}
        onBlur={() => {
          validatePassword();
          setPwdTyping(false);
        }}
        icon={
          <Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />
        }
        formCardMode={true}
      />

      <TextInputs
        title="Confirmar Contraseña"
        value={confirmPassword}
        placeHolder="Ingrese otra vez la contraseña"
        secureTextEntry={showPass4}
        showPass={true}
        changePassValue={changePassValue4}
        onChangeText={text => {
          setConfirmPassword(text);
          setConfPwdTyping(true);
          if (text !== password) {
            setConfirmPasswordError('Contraseña no coincide');
          } else {
            setConfirmPasswordError('');
          }
        }}
        onBlur={() => {
          validateConfirmPassword();
          setConfPwdTyping(false);
        }}
        icon={
          <Key color={isConfTyping ? '#051E47' : appColors.subtitle} />
        }
        formCardMode={true}
      />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Función para renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      default:
        return renderStep1();
    }
  };

  // Funciones para manejar los clics
  const handleClientePress = () => {
    console.log('Cliente Card Pressed2');
    setSelectedPrefix('V-');
    settypeOfView('Cliente');
  };

  const handleTallerPress = () => {
    console.log('Taller Card Pressed1');
    setSelectedPrefix('J-');
    settypeOfView('Taller');
  };

  const toggleCheckBox = index => {
    const updatedMetodos = [...metodosPago];
    updatedMetodos[index].checked = !updatedMetodos[index].checked;
    setMetodosPago(updatedMetodos);
  };

  const [imageUri, setImageUri] = useState(null);
  const [base64, setBase64] = useState(null);

  // Estados para los 5 nuevos inputs de archivo
  const [rifIdFiscalUri, setRifIdFiscalUri] = useState(null);
  const [rifIdFiscalBase64, setRifIdFiscalBase64] = useState(null);
  
  const [permisoOperacionUri, setPermisoOperacionUri] = useState(null);
  const [permisoOperacionBase64, setPermisoOperacionBase64] = useState(null);
  
  const [logotipoNegocioUri, setLogotipoNegocioUri] = useState(null);
  const [logotipoNegocioBase64, setLogotipoNegocioBase64] = useState(null);
  
  const [fotoFrenteTallerUri, setFotoFrenteTallerUri] = useState(null);
  const [fotoFrenteTallerBase64, setFotoFrenteTallerBase64] = useState(null);
  
  const [fotoInternaTallerUri, setFotoInternaTallerUri] = useState(null);
  const [fotoInternaTallerBase64, setFotoInternaTallerBase64] = useState(null);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;

        // Calcular el tamaño del archivo base64 en bytes
        const base64Length =
          base64Data.length * (3 / 4) -
          (base64Data.slice(-2) === '=='
            ? 2
            : base64Data.slice(-1) === '='
              ? 1
              : 0);
        const sizeInKB = base64Length / 1024;
        const sizeInMB = sizeInKB / 1024;

        console.log(`Size in KB: ${sizeInKB.toFixed(2)} KB`);
        console.log(`Size in MB: ${sizeInMB.toFixed(2)} MB`);

        setImageUri(source.uri);
        setBase64(base64Data);
      }
    });
  };

  const clearImage = () => {
    setImageUri(null);
    setBase64(null);
  };

  // Funciones para manejar los 5 nuevos inputs de archivo
  const selectRifIdFiscal = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setRifIdFiscalUri(source.uri);
        setRifIdFiscalBase64(base64Data);
        setRifIdFiscalError(''); // Limpiar error al seleccionar imagen
      }
    });
  };

  const clearRifIdFiscal = () => {
    setRifIdFiscalUri(null);
    setRifIdFiscalBase64(null);
    if (currentStep === 6) {
      setRifIdFiscalError('RIF/ID Fiscal es requerido');
    }
  };

  const selectPermisoOperacion = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setPermisoOperacionUri(source.uri);
        setPermisoOperacionBase64(base64Data);
      }
    });
  };

  const clearPermisoOperacion = () => {
    setPermisoOperacionUri(null);
    setPermisoOperacionBase64(null);
  };

  const selectLogotipoNegocio = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setLogotipoNegocioUri(source.uri);
        setLogotipoNegocioBase64(base64Data);
      }
    });
  };

  const clearLogotipoNegocio = () => {
    setLogotipoNegocioUri(null);
    setLogotipoNegocioBase64(null);
  };

  // Progreso visual para el registro de Cliente
  const totalStepsCliente = 8;
  let completedStepsCliente = 0;
  if (imageUri) completedStepsCliente += 1;
  if ((Nombre || '').trim() !== '') completedStepsCliente += 1;
  if ((String(cedula) || '').trim() !== '') completedStepsCliente += 1;
  if ((email || '').trim() !== '') completedStepsCliente += 1;
  if ((estadoSelected || '').trim() !== '') completedStepsCliente += 1;
  if ((phone || '').trim() !== '') completedStepsCliente += 1;
  if ((password || '').trim() !== '') completedStepsCliente += 1;
  if ((confirmPassword || '').trim() !== '') completedStepsCliente += 1;
  const progressCliente = Math.round(
    (completedStepsCliente / totalStepsCliente) * 100,
  );
  const progressTaller = Math.round((currentStep / totalSteps) * 100);
  let progressClienteText = 'Comienza completando tus datos básicos.';
  if (progressCliente >= 30 && progressCliente < 60) {
    progressClienteText = '¡Vas muy bien! Sigue completando tu registro.';
  } else if (progressCliente >= 60 && progressCliente < 90) {
    progressClienteText = '¡Ya casi terminas! Solo faltan algunos campos.';
  } else if (progressCliente >= 90) {
    progressClienteText = '¡Excelente! Tu registro está casi completo.';
  }

  const selectFotoFrenteTaller = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setFotoFrenteTallerUri(source.uri);
        setFotoFrenteTallerBase64(base64Data);
        setFotoFrenteTallerError(''); // Limpiar error al seleccionar imagen
      }
    });
  };

  const clearFotoFrenteTaller = () => {
    setFotoFrenteTallerUri(null);
    setFotoFrenteTallerBase64(null);
    if (currentStep === 6) {
      setFotoFrenteTallerError('Foto del Frente del Negocio es requerida');
    }
  };

  const selectFotoInternaTaller = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setFotoInternaTallerUri(source.uri);
        setFotoInternaTallerBase64(base64Data);
        setFotoInternaTallerError(''); // Limpiar error al seleccionar imagen
      }
    });
  };

  const clearFotoInternaTaller = () => {
    setFotoInternaTallerUri(null);
    setFotoInternaTallerBase64(null);
    if (currentStep === 6) {
      setFotoInternaTallerError('Foto Interna del Negocio es requerida');
    }
  };

  const [isMounted, setIsMounted] = useState(true);
  const [ModalOpened, setModalOpened] = useState(false);

  const GetCoordenadas = location => {
    setlat(location.latitude);
    setlng(location.longitude);
    setModalOpened(true);
    setIsMounted(false);
    setTimeout(() => setIsMounted(true), 100);
  };

  const handleLocationPickerMessage = event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'confirm') {
        setlat(msg.lat);
        setlng(msg.lng);
        setLocationPicked(true);
        setLocationManuallyModified(true);
        setShowMapboxTestModal(false);
      } else if (msg.type === 'requestLocation') {
        const removeLoading = () => {
          locationPickerRef.current?.injectJavaScript(
            `var b=document.getElementById('locate-btn');if(b)b.classList.remove('loading'); true;`
          );
        };
        const doGetLocation = () => {
          Geolocation.getCurrentPosition(
            pos => {
              locationPickerRef.current?.injectJavaScript(
                `window.flyToLocation(${pos.coords.latitude}, ${pos.coords.longitude}); true;`
              );
            },
            () => removeLoading(),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
          );
        };
        if (Platform.OS === 'android') {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(granted => {
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              doGetLocation();
            } else {
              removeLoading();
            }
          });
        } else {
          Geolocation.requestAuthorization();
          doGetLocation();
        }
      }
    } catch (_) {}
  };

  const [showPass, setshowPass] = useState(true);
  const changePassValue = () => {
    setshowPass(!showPass);
  };

  const [showPass2, setshowPass2] = useState(true);
  const changePassValue2 = () => {
    setshowPass2(!showPass2);
  };

  const [showPass3, setshowPass3] = useState(true);
  const changePassValue3 = () => {
    setshowPass3(!showPass3);
  };

  const [showPass4, setshowPass4] = useState(true);
  const changePassValue4 = () => {
    setshowPass4(!showPass4);
  };

  const getCurrentLocation = () => {
    try {
      console.log('Aqui estoy :>');
      Geolocation.getCurrentPosition(
        info => {
          const { latitude, longitude } = info.coords;
          setlat(latitude);
          setlng(longitude);

          console.log('Se agregó :>');
        },
        error => {
          console.log('Error al obtener la ubicación:', error);
        },
      );
    } catch (error) {
      console.error('Error al intentar obtener la ubicación actual:', error);
    }
  };



  const DARK_BLUE = '#1F2344';
  const YELLOW = '#FFD60A';

  return (
    <View
      style={[styles.container, { backgroundColor: bgFullStyle, padding: 30 }]}>
      {typeOfView === '' ? (
        <View
          style={{
            marginHorizontal: -30,
            marginTop: -30,
            marginBottom: 16,
            backgroundColor: DARK_BLUE,
            borderBottomLeftRadius: 100,
            borderBottomRightRadius: 100,
            borderBottomWidth: 10,
            borderBottomColor: YELLOW,
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderLeftColor: YELLOW,
            borderRightColor: YELLOW,
            overflow: 'hidden',
            paddingTop: 44,
            paddingBottom: 52,
            paddingHorizontal: 30,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: 0.3,
              marginBottom: 10,
              textAlign: 'center',
            }}>
            ¡Bienvenido!
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: '#E5E7EB',
              lineHeight: 28,
              marginBottom: 4,
              textAlign: 'center',
            }}>
            Selecciona la opción que mejor te describa: uso personal o para tu negocio.
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginHorizontal: -30,
            marginTop: -30,
            marginBottom: 16,
            backgroundColor: DARK_BLUE,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            overflow: 'hidden',
            paddingTop: 44,
            paddingBottom: typeOfView === 'Cliente' || typeOfView === 'Taller' ? 0 : 36,
            paddingHorizontal: 30,
            alignItems: 'center',
            borderLeftWidth: 2,
            borderRightWidth: 2,
            borderLeftColor: YELLOW,
            borderRightColor: YELLOW,
            ...(typeOfView !== 'Cliente' &&
              typeOfView !== 'Taller' && {
              borderBottomWidth: 10,
              borderBottomColor: YELLOW,
            }),
          }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: '#FFFFFF',
              letterSpacing: 0.3,
              marginBottom: 8,
              textAlign: 'center',
            }}>
            Completa tu registro
            <Text style={{ fontWeight: '600', opacity: 0.9 }}> ({typeOfView == 'Taller' ? 'Negocio' : 'Cliente'})</Text>
          </Text>
          <Text
            style={{
              fontSize: 20,
              color: '#E5E7EB',
              lineHeight: 28,
              marginBottom:
                typeOfView === 'Cliente' || typeOfView === 'Taller' ? 12 : 4,
              textAlign: 'center',
            }}>
            Un último paso y estarás listo.
          </Text>
          {typeOfView === 'Cliente' && (
            <View
              style={{
                width: '100%',
                marginHorizontal: -30,
                height: 10,
                backgroundColor: DARK_BLUE,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  width: `${progressCliente}%`,
                  height: '100%',
                  backgroundColor: YELLOW,
                }}
              />
            </View>
          )}

          {typeOfView === 'Taller' && (
            <View
              style={{
                width: '100%',
                marginHorizontal: -30,
                height: 10,
                backgroundColor: DARK_BLUE,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  width: `${progressTaller}%`,
                  height: '100%',
                  backgroundColor: YELLOW,
                }}
              />
            </View>
          )}
        </View>
      )}

      {typeOfView === 'Cliente' ? (
        // ****************************** FORMULARIO PARA CLIENTES ***********************************************
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 0,
              marginTop: 0,
              paddingHorizontal: 4,
            }}>
            <Text style={{ fontSize: 13, color: DARK_BLUE }}>
              {/* Progreso del registro */}
              {progressClienteText}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: DARK_BLUE }}>
              {progressCliente}%
            </Text>
          </View>

          <ScrollView style={{ marginBottom: 60 }}>
            <View
              style={{
                paddingHorizontal: 4,
                paddingBottom: 16,
              }}>
              {/* Bloque: foto de perfil */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  marginTop: 10,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 4,
                  }}>
                  Tu identidad
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                  Agrega una foto y tus datos básicos para personalizar tu experiencia.
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                    {imageUri ? (
                      <View style={stylesImage.imageContainer}>
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: 90, height: 90, borderRadius: 45 }}
                        />
                        <TouchableOpacity
                          style={stylesImage.closeButton}
                          onPress={clearImage}>
                          <Text style={stylesImage.closeButtonText}>X</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 45,
                          backgroundColor: '#EEF2FF',
                          borderWidth: 1,
                          borderColor: 'rgba(45, 50, 97, 0.25)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icons name="user" size={34} color="#2D3261" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 2 }}>
                    <TouchableOpacity
                      style={[
                        stylesImage.button,
                        {
                          borderWidth: 1,
                          borderColor: '#2D3261',
                          borderStyle: 'dotted',
                          borderRadius: 999,
                          backgroundColor: '#FFF',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                        },
                      ]}
                      onPress={() => openPhotoOptions('logo')}>
                      <Icons name="camera" size={16} color="#2D3261" />
                      <Text
                        style={[
                          stylesImage.buttonText,
                          {
                            marginLeft: 8,
                            color: '#2D3261',
                            fontSize: 13,
                            fontWeight: '600',
                          },
                        ]}>
                        Subir foto de perfil
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: '#9CA3AF',
                      }}>
                      JPG o PNG, máximo 5MB.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bloque: datos personales */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(15, 23, 42, 0.06)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.06,
                  shadowRadius: 7,
                  elevation: 2,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 4,
                  }}>
                  Datos personales
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                  Completa tu información básica para poder crear tu cuenta.
                </Text>

                <TextInputs
                  keyboardType="default"
                  autoCapitalize="words"
                  title="Nombre y Apellido"
                  placeHolder="Ingrese su nombre y apellido"
                  value={Nombre}
                  onChangeText={text => {
                    setNombre(text);
                    setNombreTyping(true);
                    if (text?.trim() === '') {
                      setNombreError('Nombre es requerido');
                    } else {
                      setNombreError('');
                    }
                  }}
                  onBlur={() => setNombreTyping(false)}
                  icon={<Icons name="user" size={20} color="#9BA6B8" />}
                  formCardMode={true}
                />
                {NombreError !== '' && (
                  <Text style={styles.errorStyle}>{NombreError}</Text>
                )}

                {/* Documento de Identidad */}
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: textColorStyle, marginBottom: 8 }}>
                    Documento de Identidad
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {/* Prefijo */}
                    <View style={{
                      width: 76,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      height: 52,
                      justifyContent: 'center',
                    }}>
                      <Dropdown
                        style={{ borderWidth: 0, paddingHorizontal: 6, backgroundColor: 'transparent', height: 52 }}
                        placeholderStyle={{ color: 'gray', fontSize: 14 }}
                        selectedTextStyle={{ color: '#111827', fontSize: 14, fontWeight: '600' }}
                        data={[
                          { label: 'C-', value: 'C-' },
                          { label: 'E-', value: 'E-' },
                          { label: 'G-', value: 'G-' },
                          { label: 'J-', value: 'J-' },
                          { label: 'P-', value: 'P-' },
                          { label: 'V-', value: 'V-' },
                        ]}
                        labelField="label"
                        valueField="value"
                        placeholder="V-"
                        value={selectedPrefix}
                        onChange={item => setSelectedPrefix(item.value)}
                      />
                    </View>
                    {/* Número */}
                    <View style={{
                      flex: 1,
                      marginLeft: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      height: 52,
                      paddingHorizontal: 12,
                    }}>
                      <Icons name="id-card-o" size={20} color="#9BA6B8" />
                      <TextInput
                        value={cedula}
                        placeholder="Número de cédula"
                        placeholderTextColor="#9BA6B8"
                        keyboardType="numeric"
                        style={{ flex: 1, marginLeft: 10, color: '#111827', fontSize: 15 }}
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          if (numericText.length <= 10) {
                            setcedula(numericText);
                            setcedulaTyping(true);
                            if (numericText?.trim() === '') {
                              setcedulaError('Documento es requerido');
                            } else {
                              setcedulaError('');
                            }
                          }
                        }}
                        onBlur={() => setcedulaTyping(false)}
                      />
                    </View>
                  </View>
                  {cedulaError !== '' && (
                    <Text style={styles.errorStyle}>{cedulaError}</Text>
                  )}
                </View>

                <TextInputs
                  title="Correo Electrónico"
                  keyboardType={'email-address'}
                  value={email}
                  placeHolder="Ingrese su email"
                  onChangeText={text => {
                    setEmail(text);
                    setEmailTyping(true);
                    if (text?.trim() === '') {
                      setEmailError('Email es requerido');
                    } else {
                      setEmailError('');
                    }
                  }}
                  onBlur={() => {
                    validateEmail();
                    setEmailTyping(false);
                  }}
                  icon={<Email color={isEmailTyping ? '#051E47' : appColors.subtitle} />}
                  formCardMode={true}
                />
                {emailError !== '' && (
                  <Text style={styles.errorStyle}>{emailError}</Text>
                )}

                {/* Estado */}
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: textColorStyle, marginBottom: 8 }}>
                    Estado
                  </Text>
                  <View style={{
                    borderWidth: 1,
                    borderColor: '#CBD5E1',
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    height: 52,
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                  }}>
                    <Dropdown
                      style={{ borderWidth: 0, paddingHorizontal: 4, backgroundColor: 'transparent', height: 44 }}
                      placeholderStyle={{ color: '#6B7280', fontSize: 13 }}
                      selectedTextStyle={{ color: '#111827', fontSize: 13 }}
                      data={estadosVenezuela}
                      labelField="label"
                      valueField="value"
                      placeholder="Seleccione un estado"
                      value={estadoSelected}
                      search={true}
                      onChange={item => setestadoSelected(item.value)}
                    />
                  </View>
                </View>
              </View>

              {/* Bloque: contacto y seguridad */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 18,
                  paddingVertical: 18,
                  paddingHorizontal: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(15, 23, 42, 0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 1,
                }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                  Contacto y seguridad
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                  Usa un número al que tengas acceso y una contraseña segura.
                </Text>

                <TextInputs
                  title="Número Telefónico"
                  value={phone}
                  placeHolder="Ejem (414) 261-79-66"
                  keyboardType="numeric"
                  onChangeText={text => {
                    let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
                    let formattedText = '';
                    if (numericText.length > 0 && numericText.length <= 3) {
                      formattedText = `${numericText}`;
                    } else if (numericText.length > 3 && numericText.length <= 6) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
                    } else if (numericText.length > 6 && numericText.length <= 8) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
                    } else if (numericText.length > 8) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
                    }
                    setPhone(formattedText);
                    setCallTyping(true);
                    if (numericText?.trim() === '') {
                      setPhoneError('Número telefónico requerido');
                    } else {
                      setPhoneError('');
                    }
                  }}
                  onBlur={() => {
                    validatePhone();
                    setCallTyping(false);
                  }}
                  icon={<Call color={isCallTyping ? '#051E47' : appColors.subtitle} />}
                  formCardMode={true}
                />
                {phoneError !== '' && (
                  <Text style={styles.errorStyle}>{phoneError}</Text>
                )}

                <TextInputs
                  title="Contraseña"
                  value={password}
                  placeHolder="Ingrese su contraseña"
                  secureTextEntry={showPass}
                  showPass={true}
                  changePassValue={changePassValue}
                  onChangeText={text => {
                    setPassword(text);
                    setPwdTyping(true);
                    if (text.length < 6) {
                      setPasswordError('Contraseña debe tener mínimo 6 dígitos');
                    } else {
                      setPasswordError('');
                    }
                  }}
                  onBlur={() => {
                    validatePassword();
                    setPwdTyping(false);
                  }}
                  icon={<Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />}
                  formCardMode={true}
                />

                <TextInputs
                  title="Confirmar Contraseña"
                  value={confirmPassword}
                  placeHolder="Ingrese otra vez la contraseña"
                  secureTextEntry={showPass2}
                  showPass={true}
                  changePassValue={changePassValue2}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    setConfPwdTyping(true);
                    if (text !== password) {
                      setConfirmPasswordError('Contraseña no coincide');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  onBlur={() => {
                    validateConfirmPassword();
                    setConfPwdTyping(false);
                  }}
                  icon={<Key color={isConfTyping ? '#051E47' : appColors.subtitle} />}
                  formCardMode={true}
                />
                {confirmPasswordError !== '' && (
                  <Text style={styles.errorStyle}>{confirmPasswordError}</Text>
                )}
              </View>
            </View>
          </ScrollView>

        </KeyboardAvoidingView>


      ) : typeOfView === 'Taller' ? (
        // ****************************** FORMULARIO STEP BY STEP PARA TALLERES ***********************************************
        <View style={{ flex: 1 }}>
          <ProgressIndicator />
          {renderCurrentStep()}
          <StepNavigation />
        </View>

      ) : null}

      {typeOfView == '' ? (
        <ScrollView
          style={{ flex: 1, marginTop: '6%' }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={stylesCard.cardOuter}>
            <TouchableOpacity
              onPress={() => handleClientePress()}
              style={[stylesCard.boxContainer, stylesCard.boxContainerCliente]}
              activeOpacity={0.82}>
              <View style={stylesCard.cardIconWrap}>
                <Image source={UserImage} style={stylesCard.iconImage} />
              </View>
              <Text style={stylesCard.cardLabel}>USO PERSONAL</Text>
              <Text style={stylesCard.cardTitle}>Soy cliente</Text>
              <Text style={stylesCard.cardSubtitle}>
                Solicita servicios, agenda citas y lleva el control de tus vehículos desde un solo lugar.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={stylesCard.cardOuter}>
            <TouchableOpacity
              onPress={() => handleTallerPress()}
              style={[stylesCard.boxContainer, stylesCard.boxContainerNegocio]}
              activeOpacity={0.82}>
              <View style={stylesCard.cardIconWrap}>
                <Image source={KeyImage} style={stylesCard.iconImage} />
              </View>
              <Text style={stylesCard.cardLabel}>PARA TU NEGOCIO</Text>
              <Text style={stylesCard.cardTitle}>Tengo un negocio</Text>
              <Text style={stylesCard.cardSubtitle}>
                Registra tu negocio y comienza a ofrecer tus servicios a más clientes.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      ) : null}

      {typeOfView != '' && typeOfView != 'Taller' ? (
        <NavigationButton
          title="Registrarse"
          onPress={() => setTermsVisible(true)}
          disabled={isGetOtpDisabled}
          backgroundColor={isGetOtpDisabled ? '#848688' : '#2D3261'}
          color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
        />
      ) : null}

      <View style={[styles.singUpView, { marginTop: 15, marginBottom: 0 }]}>
        <Text
          style={{
            fontSize: 14,
            color: appColors.subtitle || '#9BA6B8',
            marginRight: 6,
          }}>
          ¿Ya tienes cuenta?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: appColors.primaryLight || '#EFEAff',
            borderWidth: 1,
            borderColor: 'rgba(45, 50, 97, 0.15)',
          }}
          activeOpacity={0.8}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: appColors.primary || '#2D3261',
            }}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>


      <Modal
        visible={showMapboxTestModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapboxTestModal(false)}>
        <View style={{ flex: 1, backgroundColor: '#1D1E56' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1D1E56',
              paddingTop: Platform.OS === 'ios' ? 54 : 20,
              paddingBottom: 14,
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity
              onPress={() => setShowMapboxTestModal(false)}
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icons2 name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: '#FFD60A',
                fontSize: 16,
                fontWeight: '800',
              }}>
              Selecciona la ubicación
            </Text>
            <View style={{ width: 36 }} />
          </View>
          {/* WebView */}
          <WebView
            ref={locationPickerRef}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            source={{ html: buildLocationPickerHTML(lat, lng) }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleLocationPickerMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D1E56' }}>
                <ActivityIndicator size="large" color="#FFD60A" />
              </View>
            )}
          />
        </View>
      </Modal>


      {/* ─── Términos y Condiciones Modal ─── */}
      <Modal
        visible={termsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={termsStyles.overlay}>
          <View style={termsStyles.sheet}>
            {/* Header */}
            <View style={termsStyles.header}>
              <View style={termsStyles.headerAccent} />
              <Text style={termsStyles.headerTitle}>Términos y Condiciones</Text>
              <TouchableOpacity
                style={termsStyles.closeBtn}
                onPress={() => setTermsVisible(false)}
              >
                <Icons2 name="close" size={22} color="#1D1E56" />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={termsStyles.scroll}
              contentContainerStyle={termsStyles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={termsStyles.updated}>Última actualización: 29 de enero de 2025</Text>
              <Text style={termsStyles.body}>
                En SOLVERS, valoramos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política de privacidad describe cómo recopilamos, usamos, compartimos y protegemos la información que obtenemos de ti al utilizar nuestra aplicación.
              </Text>

              <Text style={termsStyles.sectionTitle}>1. Información que recopilamos</Text>
              <Text style={termsStyles.body}>
                Cuando utilizas SOLVERS, podemos recopilar la siguiente información:
              </Text>
              <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Información personal:</Text> Nombre, dirección de correo electrónico, número de teléfono y cualquier otra información que decidas proporcionarnos al registrarte o utilizar nuestros servicios.</Text>
              <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Información de ubicación:</Text> Para ofrecerte una mejor experiencia, podemos acceder a tu ubicación a través de Google Maps para mostrarte los talleres mecánicos más cercanos.</Text>
              <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Datos de uso:</Text> Información sobre cómo utilizas la aplicación, incluyendo las funciones que utilizas y el tiempo que pasas en la app.</Text>

              <Text style={termsStyles.sectionTitle}>2. Cómo utilizamos tu información</Text>
              <Text style={termsStyles.body}>Utilizamos la información que recopilamos para:</Text>
              <Text style={termsStyles.bullet}>– Proporcionar y mejorar nuestros servicios.</Text>
              <Text style={termsStyles.bullet}>– Facilitar la búsqueda y gestión de talleres mecánicos.</Text>
              <Text style={termsStyles.bullet}>– Enviar notificaciones sobre promociones, actualizaciones y novedades relacionadas con la app.</Text>
              <Text style={termsStyles.bullet}>– Responder a tus consultas y brindar soporte al cliente.</Text>

              <Text style={termsStyles.sectionTitle}>3. Compartir tu información</Text>
              <Text style={termsStyles.body}>No compartimos tu información personal con terceros, excepto en las siguientes circunstancias:</Text>
              <Text style={termsStyles.bullet}>– Con tu consentimiento.</Text>
              <Text style={termsStyles.bullet}>– Con proveedores de servicios que nos ayudan a operar la app y que están obligados a proteger tu información.</Text>
              <Text style={termsStyles.bullet}>– Cuando sea requerido por la ley o para proteger nuestros derechos.</Text>

              <Text style={termsStyles.sectionTitle}>4. Seguridad de la información</Text>
              <Text style={termsStyles.body}>
                Implementamos medidas de seguridad adecuadas para proteger tu información personal contra el acceso no autorizado, la divulgación, la alteración o la destrucción. Sin embargo, ten en cuenta que ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
              </Text>

              <Text style={termsStyles.sectionTitle}>5. Tus derechos</Text>
              <Text style={termsStyles.body}>
                Tienes derecho a acceder, corregir o eliminar tu información personal. Si deseas ejercer estos derechos, por favor contáctanos a través de solverstalleres@gmail.com.
              </Text>

              <Text style={termsStyles.sectionTitle}>6. Cambios a esta política de privacidad</Text>
              <Text style={termsStyles.body}>
                Podemos actualizar esta política de privacidad de vez en cuando. Te notificaremos sobre cualquier cambio publicando la nueva política en la app. Te recomendamos revisar esta política periódicamente para estar al tanto de cómo protegemos tu información.
              </Text>

              <Text style={termsStyles.sectionTitle}>7. Contacto</Text>
              <Text style={termsStyles.body}>
                Si tienes preguntas o inquietudes sobre esta política de privacidad, no dudes en contactarnos a través de solverstalleres@gmail.com.
              </Text>
            </ScrollView>

            {/* Footer buttons */}
            <View style={termsStyles.footer}>
              <TouchableOpacity
                style={termsStyles.declineBtn}
                onPress={() => setTermsVisible(false)}
              >
                <Text style={termsStyles.declineBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={termsStyles.acceptBtn}
                onPress={() => {
                  setTermsVisible(false);
                  onHandleChange();
                }}
              >
                <Icons2 name="checkmark-circle-outline" size={18} color="#1D1E56" style={{ marginRight: 6 }} />
                <Text style={termsStyles.acceptBtnText}>Acepto y continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal selector de foto (galería / cámara / documento) ────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,68,0.55)' }}>
          {/* Toque fuera cierra */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPhotoModalVisible(false)} />

          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}>
            {/* Pill decorativo */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 22 }} />

            {/* Títulos */}
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2344', textAlign: 'center', marginBottom: 6 }}>
              Adjuntar imagen o archivo
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              Seleccione una opción para capturar{'\n'}la imagen y comprobar el documento
            </Text>

            {/* 3 tarjetas en fila */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>

              {/* Documento */}
              <TouchableOpacity
                onPress={handlePickDocument}
                activeOpacity={0.75}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 20, borderRadius: 18,
                  backgroundColor: '#F0F1FA',
                  borderWidth: 1.5, borderColor: '#2D3261',
                }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: '#2D3261',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icons2 name="document-attach-outline" size={26} color="#FFD60A" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>
                  Documento
                </Text>
              </TouchableOpacity>

              {/* Galería */}
              <TouchableOpacity
                onPress={handlePickGallery}
                activeOpacity={0.75}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 20, borderRadius: 18,
                  backgroundColor: '#F0F1FA',
                  borderWidth: 1.5, borderColor: '#2D3261',
                }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: '#2D3261',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icons2 name="images-outline" size={26} color="#FFD60A" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>
                  Galería
                </Text>
              </TouchableOpacity>

              {/* Cámara */}
              <TouchableOpacity
                onPress={handlePickCamera}
                activeOpacity={0.75}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 20, borderRadius: 18,
                  backgroundColor: '#F0F1FA',
                  borderWidth: 1.5, borderColor: '#2D3261',
                }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: '#2D3261',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <Icons2 name="camera-outline" size={26} color="#FFD60A" />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>
                  Cámara
                </Text>
              </TouchableOpacity>

            </View>

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => setPhotoModalVisible(false)}
              style={{
                paddingVertical: 14, borderRadius: 16,
                backgroundColor: '#F0F1FA',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default SignUp;

const stylesMap = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

const PRIMARY = appColors.primary || '#2D3261';
const PRIMARY_LIGHT = appColors.primaryLight || '#EFEAff';
const BG_LAYER = appColors.bgLayer || '#F5F6F8';
const SUBTITLE = appColors.subtitle || '#9BA6B8';

const stylesCard = StyleSheet.create({
  containerBox: {
    marginTop: '100px !important',
  },
  cardOuter: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#1A1D26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  boxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(45, 50, 97, 0.06)',
    backgroundColor: '#FFFFFF',
  },
  boxContainerCliente: {
    borderLeftWidth: 12,
    borderLeftColor: PRIMARY,
  },
  boxContainerNegocio: {
    borderLeftWidth: 12,
    borderLeftColor: PRIMARY,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 50, 97, 0.1)',
  },
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: SUBTITLE,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 16,
    color: SUBTITLE,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});

const stylesImage = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const termsStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,14,45,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#1D1E56',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F8',
    backgroundColor: '#FFFFFF',
  },
  headerAccent: {
    width: 4,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FFD60A',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1E56',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  updated: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(29,30,86,0.45)',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1E56',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 21,
    color: 'rgba(29,30,86,0.72)',
  },
  bullet: {
    fontSize: 13.5,
    lineHeight: 21,
    color: 'rgba(29,30,86,0.72)',
    marginTop: 4,
    paddingLeft: 4,
  },
  bulletBold: {
    fontWeight: '700',
    color: '#1D1E56',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F8',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  declineBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(29,30,86,0.55)',
  },
  acceptBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1E56',
  },
});
