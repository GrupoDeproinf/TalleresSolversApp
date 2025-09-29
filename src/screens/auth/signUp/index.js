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
  Alert
} from 'react-native';
import React, { useState, useEffect } from 'react';
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
import Icons2 from 'react-native-vector-icons/FontAwesome5';

import Icons3 from 'react-native-vector-icons/Fontisto';
import Icons4 from 'react-native-vector-icons/Entypo';
import api from '../../../../axiosInstance';
import CheckBox from 'react-native-check-box';
import { RadioButton } from 'react-native-paper';

import { launchImageLibrary } from 'react-native-image-picker';
import { Buffer } from 'buffer';

import MapComponent from '../../map';
import messaging from '@react-native-firebase/messaging';

import Geolocation from '@react-native-community/geolocation';
import { Dropdown } from 'react-native-element-dropdown';



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

  // Estados para el sistema de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(6);

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

  // Funciones para navegación entre pasos
  const nextStep = () => {
    if (currentStep < totalSteps) {
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
        return Nombre?.trim() !== '' && cedula !== '' && email?.trim() !== '' && validateEmail();
      case 2: // Ubicación - REQUERIDO
        return estadoSelected !== '' && Direccion?.trim() !== '';
      case 3: // Contacto - REQUERIDO
        return phone && phone !== '' && whats && whats !== '' && validatePhone();
      case 4: // Información del taller - OPCIONAL
        return true; // Siempre permite continuar
      case 5: // Redes sociales y seguro - OPCIONAL
        return true; // Siempre permite continuar
      case 6: // Contraseñas - REQUERIDO
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



  const onHandleChange = async () => {
    console.log(typeOfView);
    console.log('Aquiiiiiiiiiiiiiii');

    try {

      // Registra el dispositivo para mensajes remotos
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      console.log("FCM Token123:", token);
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

        console.log('Taller');

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
                estado: estadoSelected,
                base64: base64 == null || base64 == undefined || base64 == '' ? "" : base64,
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

                showToast('Usuario creado exitosamente');
                setGetOtpDisabled(false);
                navigation.navigate('Login');
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
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#e9ecef',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#e9ecef',
    },
    stepDotActive: {
      backgroundColor: '#2D3261',
      borderColor: '#2D3261',
    },
    stepDotCompleted: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
    },
    stepNumber: {
      color: '#6c757d',
      fontSize: 12,
      fontWeight: 'bold',
    },
    stepNumberActive: {
      color: '#ffffff',
    },
    stepNumberCompleted: {
      color: '#ffffff',
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
      color: '#28a745',
      fontWeight: 'bold',
    },
    stepContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
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
      { number: 4, title: 'Taller' },
      { number: 5, title: 'Redes' },
      { number: 6, title: 'Seguridad' },
    ];

    return (
      <View style={stepStyles.progressContainer}>
        <View style={stepStyles.progressBar}>
          <View 
            style={[
              stepStyles.progressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
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
            onPress={onHandleChange}
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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Información Básica</Text>
        <Text style={stepStyles.stepSubtitle}>
          Comencemos con los datos básicos de tu taller
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          {imageUri && (
            <View style={stylesImage.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={{ width: 200, height: 200 }}
              />
              <TouchableOpacity
                style={stylesImage.closeButton}
                onPress={clearImage}>
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
                borderRadius: 5,
                backgroundColor: '#FFF',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                marginTop: 10,
              },
            ]}
            onPress={selectImage}>
            <Icons name="user" size={15} color="#2D3261" />
            <Text
              style={[
                stylesImage.buttonText,
                { marginLeft: 10, color: '#2D3261' },
              ]}>
              Foto de perfil
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInputs
        keyboardType="default"
        autoCapitalize="words"
        title="Nombre del Taller"
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
      />
      {NombreError !== '' && (
        <Text style={styles.errorStyle}>{NombreError}</Text>
      )}

      <View style={{marginTop: 5}}>
              {/* Texto "RIF" arriba de los inputs */}
              <Text
                style={[
                  styles.headingContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                Registro de Información Fiscal (RIF)
              </Text>

              {/* Contenedor para el Picker y el TextInput */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* Select para elegir "J-" o "G-" */}
                <View
                  style={{
                    width: 80, // Más angosto
                    marginTop: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    elevation: 3,
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    marginRight: 55,
                    height: 50,
                    justifyContent: 'center',
                    paddingHorizontal: 0,
                  }}>
                  <Dropdown
                    style={{
                      height: 50,
                      backgroundColor: 'transparent',
                      width: '100%',
                      paddingLeft: 15,
                    }}
                    data={prefixOptions}
                    labelField="label"
                    valueField="value"
                    value={selectedPrefix}
                    onChange={item => setSelectedPrefix(item.value)}
                    placeholder="Pref."
                    maxHeight={250}
                    itemTextStyle={{color: 'black'}}
                    selectedTextStyle={{color: 'black'}}
                    containerStyle={{borderRadius: 10, width: 80}}
                    dropdownPosition="auto"
                    showsVerticalScrollIndicator={false}
                    autoScroll={false}
                  />
                </View>

                {/* TextInput para el número de RIF */}
                <View style={{flex: 1, marginTop: -22, marginLeft: -50}}>
                  <TextInputs
                    title=""
                    value={cedula}
                    placeHolder="Ingrese el número de RIF"
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      if (numericText.length <= 10) {
                        // Limitar a 10 caracteres
                        setcedula(numericText);
                        setcedulaTyping(true);
                        if (numericText.trim() === '') {
                          setcedulaError('RIF es requerido');
                        } else {
                          setcedulaError('');
                        }
                      }
                    }}
                    onBlur={() => {
                      setcedulaTyping(false);
                    }}
                    keyboardType="numeric"
                    icon={<Icons name="id-card-o" size={20} color="#9BA6B8" />}
                    style={{height: 50, color: "black"}} // Altura para el TextInput
                  />
                </View>
              </View>

              {/* Mensaje de error si el RIF es inválido */}
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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Ubicación</Text>
        <Text style={stepStyles.stepSubtitle}>
          Selecciona el estado y la ubicación exacta de tu taller
        </Text>
      </View>

      <View style={{ marginTop: 5 }}>
        <Text
          style={[
            styles.headingContainer,
            { color: textColorStyle },
            { textAlign: textRTLStyle },
          ]}>
          Estado
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 30, alignItems: 'center' }}>
          <View style={{
            width: '100%',
            paddingRight: 0,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            backgroundColor: '#fff',
            height: 50,
            justifyContent: 'center',
          }}>
            <Dropdown
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                paddingHorizontal: 10,
                backgroundColor: '#fff',
                height: 50,
              }}
              placeholderStyle={{
                color: 'gray',
                fontSize: 14,
              }}
              selectedTextStyle={{
                color: 'black',
                fontSize: 14,
              }}
              itemTextStyle={{color: 'black', fontSize: 14}}
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
      </View>

      <View
        style={[stylesMap.container, { marginTop: 5, marginBottom: 15 }]}>
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
      </View>

      <TextInputs
        title="Dirección del Taller"
        placeHolder="Ingrese su direccion"
        value={Direccion}
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
      />
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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Información de Contacto</Text>
        <Text style={stepStyles.stepSubtitle}>
          Proporciona tus números de teléfono para que los clientes puedan contactarte
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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Información del Taller</Text>
        <Text style={stepStyles.stepSubtitle}>
          Cuéntanos más sobre tu taller y tu experiencia
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
        icon={<Icons name="id-card" size={20} color="#9BA6B8" />}
      />
      {RegComercialError !== '' && (
        <Text style={styles.errorStyle}>{RegComercialError}</Text>
      )}

      <Text style={{ marginBottom: 10, color: 'black', marginTop: 15 }}>
        ¿Es un Agente Autorizado?
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 15,
        }}>
        <RadioButton
          value="si"
          status={checked === 'si' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('si')}
        />
        <Text style={{ color: 'black' }}>Sí</Text>

        <RadioButton
          value="no"
          status={checked === 'no' ? 'checked' : 'unchecked'}
          onPress={() => setChecked('no')}
        />
        <Text style={{ color: 'black' }}>No</Text>
      </View>

      <TextInputs
        title="Caracteristicas del taller"
        value={Caracteristicas}
        placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Redes Sociales y Seguro</Text>
        <Text style={stepStyles.stepSubtitle}>
          Conecta tus redes sociales y proporciona información sobre tu seguro
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
        icon={<Icons2 name="tiktok" size={20} color="#9BA6B8" />}
      />
      {LinkTiktokError !== '' && (
        <Text style={styles.errorStyle}>{LinkTiktokError}</Text>
      )}

      <TextInputs
        title="Seguro del taller"
        placeHolder="Ingrese su seguro"
        value={seguro}
        height={150}
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
      />
      {seguroError !== '' && (
        <Text style={styles.errorStyle}>{seguroError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

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
      <View style={stepStyles.stepHeader}>
        <Text style={stepStyles.stepTitle}>Seguridad</Text>
        <Text style={stepStyles.stepSubtitle}>
          Crea una contraseña segura para proteger tu cuenta
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

  const [isMounted, setIsMounted] = useState(true);
  const [ModalOpened, setModalOpened] = useState(false);

  const GetCoordenadas = location => {

    setlat(location.latitude);
    setlng(location.longitude);
    setModalOpened(true);
    setIsMounted(false); // Desmonta el componente
    setTimeout(() => setIsMounted(true), 100);
  };

  const prefixOptions = [
    {label: 'C-', value: 'C-'},
    {label: 'E-', value: 'E-'},
    {label: 'G-', value: 'G-'},
    {label: 'J-', value: 'J-'},
    {label: 'P-', value: 'P-'},
    {label: 'V-', value: 'V-'},
  ];

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



  return (
    <View
      style={[styles.container, { backgroundColor: bgFullStyle, padding: 30 }]}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 15,
          color: 'black',
        }}>
        Regístrate ahora {typeOfView != '' ? '(' + typeOfView + ')' : null}
      </Text>
      <Text style={{ fontSize: 13, color: 'gray', marginBottom: 10 }}>
        Regístrate ya sea como cliente o taller
      </Text>

      {typeOfView === 'Cliente' ? (
        // ****************************** FOMRULARIO PARA CLIENTES ***********************************************
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          <ScrollView style={{ marginBottom: 65 }}>
            <View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                {imageUri && (
                  <View style={stylesImage.imageContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={{ width: 200, height: 200 }}
                    />
                    <TouchableOpacity
                      style={stylesImage.closeButton}
                      onPress={clearImage}>
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
                      borderStyle: 'dotted', // Establecer el borde como interlineal
                      borderRadius: 5, // Opcional: Añadir esquinas redondeadas
                      backgroundColor: '#FFF',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      marginTop: 10,
                    },
                  ]}
                  onPress={selectImage}>
                  <Icons name="user" size={15} color="#2D3261" />
                  <Text
                    style={[
                      stylesImage.buttonText,
                      { marginLeft: 10, color: '#2D3261' },
                    ]}>
                    Foto de perfil
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInputs
                keyboardType="default"
                autoCapitalize="words"
                title="Nombre y Apellido"
                placeHolder="Ingrese su nombre y apellido"
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
              />
              {NombreError !== '' && (
                <Text style={styles.errorStyle}>{NombreError}</Text>
              )}

              <View style={{ marginTop: 5 }}>
                <Text
                  style={[
                    styles.headingContainer,
                    { color: textColorStyle },
                    { textAlign: textRTLStyle },
                  ]}>
                  Documento de Identidad
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
                  <View style={{
                    width: '25%',
                    paddingRight: 0,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 5,
                    backgroundColor: '#fff',
                    height: 50,
                    justifyContent: 'center',
                  }}>
                    <Dropdown
                      style={{
                        width: '100%', // Usa todo el ancho disponible en el contenedor
                        borderWidth: 1, // Borde alrededor del Dropdown
                        borderColor: '#ccc', // Color del borde
                        borderRadius: 5, // Bordes redondeados
                        paddingHorizontal: 10, // Espaciado interno
                        backgroundColor: '#fff', // Fondo blanco
                        height: 50, // Altura del Dropdown
                      }}
                      placeholderStyle={{
                        color: 'gray', // Color del texto del placeholder
                        fontSize: 14, // Tamaño del texto del placeholder
                      }}
                      selectedTextStyle={{
                        color: 'black', // Color del texto seleccionado
                        fontSize: 14, // Tamaño del texto seleccionado
                      }}
                      data={[
                        { label: 'C-', value: 'C-' },
                        { label: 'E-', value: 'E-' },
                        { label: 'G-', value: 'G-' },
                        { label: 'J-', value: 'J-' },
                        { label: 'P-', value: 'P-' },
                        { label: 'V-', value: 'V-' },
                      ]} // Datos para el Dropdown
                      labelField="label" // Campo que se mostrará como etiqueta
                      valueField="value" // Campo que se usará como valor
                      placeholder="Seleccione un prefijo" // Placeholder del Dropdown
                      value={selectedPrefix} // Valor seleccionado
                      onChange={item => setSelectedPrefix(item.value)} // Maneja el cambio de selección
                    />

                  </View>

                  <View style={{ width: '100%', paddingLeft: 0, marginTop: -40 }}>
                    <TextInputs
                      title=""
                      value={cedula}
                      placeHolder="Ingrese el número de cédula"
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText.length <= 10) {
                          // Limitar a 10 caracteres
                          setcedula(numericText);
                          setcedulaTyping(true);
                          if (numericText?.trim() === '') {
                            setcedulaError('Documento es requerido');
                          } else {
                            setcedulaError('');
                          }
                        }
                      }}
                      onBlur={() => {
                        setcedulaTyping(false);
                      }}
                      keyboardType="numeric"
                      icon={<Icons name="id-card-o" size={20} color="#9BA6B8" />}
                      style={{
                        height: 50, // Altura para el TextInput
                        borderWidth: 1, // Borde alrededor del TextInput
                        borderColor: '#ccc', // Color del borde
                        borderRadius: 5, // Bordes redondeados
                        paddingHorizontal: 10, // Espaciado interno
                        backgroundColor: '#fff', // Fondo blanco
                        width: '100%',
                      }}
                    />

                    {/* TextInput para el número de cédula */}
                    {cedulaError !== '' && (
                      <Text style={styles.errorStyle}>{cedulaError}</Text>
                    )}
                  </View>
                </View>

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
              />
              {emailError !== '' && (
                <Text style={styles.errorStyle}>{emailError}</Text>
              )}

              <View style={{marginTop: 5}}>
                              {/* Texto "RIF" arriba de los inputs */}
                              <Text
                                style={[
                                  styles.headingContainer,
                                  {color: textColorStyle},
                                  {textAlign: textRTLStyle},
                                ]}>
                                Estado
                              </Text>
              
                              {/* Contenedor para el Picker y el TextInput */}
                              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Icons4
                                  name="location"
                                  size={20}
                                  color="#9BA6B8"
                                  style={{marginRight: 10, marginLeft: 10}}
                                />
                                <View style={{flex: 1}}>
                                  <Dropdown
                                    style={{
                                      height: 50,
                                      backgroundColor: '#fff',
                                      borderColor: '#ddd',
                                      borderWidth: 1,
                                      borderRadius: 10,
                                      paddingLeft: 15,
                                      paddingRight: 10,
                                      justifyContent: 'center',
                                    }}
                                    data={estadosVenezuela}
                                    labelField="label"
                                    valueField="value"
                                    value={estadoSelected}
                                    onChange={item => setestadoSelected(item.value)}
                                    placeholder="Seleccione un estado"
                                    maxHeight={250}
                                    itemTextStyle={{color: 'black'}}
                                    selectedTextStyle={{color: 'black'}}
                                    containerStyle={{borderRadius: 10}}
                                    dropdownPosition="auto"
                                    showsVerticalScrollIndicator={false}
                                    autoScroll={false}
                                  />
                                </View>
                              </View>
                            </View>

              <TextInputs
                title="Número Telefónico"
                value={phone}
                placeHolder="Ejem (414) 261-79-66"
                keyboardType="numeric"
                onChangeText={text => {
                  let numericText = text.replace(/[^0-9]/g, '').slice(0, 10); // Limitar a 10 dígitos

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

                  formattedText = `${formattedText}`;

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
                icon={
                  <Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />
                }
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
                icon={
                  <Key color={isConfTyping ? '#051E47' : appColors.subtitle} />
                }
              />

              {confirmPasswordError !== '' && (
                <Text style={styles.errorStyle}>{confirmPasswordError}</Text>
              )}
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
        <View style={{ flex: 1, marginTop: '5%' }}>
          <TouchableOpacity
            onPress={() => handleClientePress()}
            style={stylesCard.boxContainer}>
            <Image source={UserImage} style={stylesCard.iconImage} />
            <Text
              style={[
                commonStyles.titleText19,
                external.ph_5,
                { color: textColorStyle },
              ]}>
              Cliente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTallerPress()}
            style={stylesCard.boxContainer}>
            <Image source={KeyImage} style={stylesCard.iconImage} />
            <Text
              style={[
                commonStyles.titleText19,
                external.ph_5,
                { color: textColorStyle },
              ]}>
              Taller
            </Text>
          </TouchableOpacity>
        </View>

      ) : null}

      {typeOfView != '' && typeOfView != 'Taller' ? (
        <NavigationButton
          title="Registrarse"
          onPress={onHandleChange}
          disabled={isGetOtpDisabled}
          backgroundColor={isGetOtpDisabled ? '#848688' : '#2D3261'}
          color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
        />
      ) : null}

      <View style={styles.singUpView}>
        <Text style={[commonStyles.subtitleText]}>
          ¿Ya se encuentra registrado?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ph_5,
              { color: textColorStyle },
            ]}>
            Ingresar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;

const stylesMap = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

const stylesCard = StyleSheet.create({
  containerBox: {
    marginTop: '100px !important',
  },
  boxContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0', // Fondo para cada caja
    borderWidth: 1,
    borderColor: '#ddd', // Color del borde
    marginBottom: 20, // Espaciado entre las cajas
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain', // Ajusta el tamaño de la imagen para que quepa bien
    marginBottom: 10, // Espacio entre la imagen y el texto
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
