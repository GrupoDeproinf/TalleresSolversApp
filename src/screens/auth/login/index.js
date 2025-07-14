import {
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthContainer from '../../../commonComponents/authContainer';
import {apple, facebook} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import {Apple, FaceBook, Google, Key} from '../../../utils/icon';
import {useValues} from '../../../../App';
import LinearBoderText from '../../../commonComponents/linearBoderText';
import CheckBox from '../../../commonComponents/checkBox';
import {fontSizes} from '../../../themes/appConstant';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import DeviceInfo from 'react-native-device-info';

import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import { ScrollView } from 'react-native-gesture-handler';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyB7JeVA4YZBzTblEOnZ-drNT-vwv085fgM',
  authDomain: 'talleres-solvers-app.firebaseapp.com',
  projectId: 'talleres-solvers-app',
  storageBucket: 'talleres-solvers-app.firebasestorage.app',
  messagingSenderId: '144076824848',
  appId: '1:144076824848:web:cdaf60b28136561b338595',
  measurementId: 'G-DXQ986SLJR',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [checkedData, setCheckedData] = useState(false);
  const [isSignInDisabled, setSignInDisabled] = useState(false);

  const [showPass, setshowPass] = useState(true);

  useEffect(() => {
    setSignInDisabled(false);
    setEmail('');
    setPassword('');
  }, []);

  useEffect(() => {
    checkAndRequestNotificationPermission();
  }, []);

  const checkAndRequestNotificationPermission = async () => {
    console.log(Platform.Version);
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permiso de notificaciones',
          message:
            'Esta aplicación necesita acceso para enviarte notificaciones',
          buttonNeutral: 'Pregúntame más tarde',
          buttonNegative: 'Cancelar',
          buttonPositive: 'OK',
        },
      );
      console.log(granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso de notificaciones concedido');
      } else {
        console.log('Permiso de notificaciones denegado');
      }
    } else {
      console.log(
        'No se requiere permiso de notificaciones en esta versión de Android',
      );
    }
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
      return false;
    } else {
      setEmailError('');
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

  const onHandleChange = async () => {
    console.log('Aquiiiii');

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    setSignInDisabled(true);

    if (isEmailValid && isPasswordValid) {
      console.log(email);
      console.log(password);
      console.log(JSON.stringify({email: email}));

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/authenticateUser', {
          email: email.toLowerCase(),
          password: password.toLowerCase(),
        });

        // Verificar la respuesta del servidor
        const result = response.data; // Los datos vienen directamente de response.data
        console.log('Este es el usuario nuevo ', result); // Aquí puedes manejar la respuesta

        if (
          result.message === 'Usuario autenticado exitosamente' ||
          result.message === 'Usuario autenticado exitosamente como Admin'
        ) {
          try {
            if (result.userData.typeUser == 'Certificador') {
              if (
                result?.userData?.token == undefined ||
                result?.userData?.token == ''
              ) {
                try {
                  const token = await messaging().getToken();
                  console.log('FCM token certificador:', token);
                  try {
                    const response2 = await api.post(
                      '/usuarios/UpdateUsuariosAll',
                      {
                        uid: result?.userData?.uid,
                        token: token,
                      },
                    );

                    console.log('Este es el usuario nuevo ', response2);
                  } catch (error) {
                    console.error('Error en actualizar el usuario:', error);
                  }
                } catch (error) {
                  console.error('Error getting FCM token:', error);
                }
              }
            }
            const jsonValue = JSON.stringify(result.userData);
            console.log(jsonValue);
            await AsyncStorage.setItem('@userInfo', jsonValue);
          } catch (e) {
            console.log(e);
          }

          setSignInDisabled(true);
          setEmail('');
          setPassword('');
          setSignInDisabled(false);
          navigation.navigate('LoaderScreen');
        } else {
          setSignInDisabled(false);
          showToast(
            'No se ha encontrado el usuario, por favor validar formulario',
          );
        }
      } catch (error) {
        if (error.response) {
          // La solicitud se hizo y el servidor respondió con un código de estado
          console.error('Error en la solicitud:', error.response.statusText);
          setSignInDisabled(false);
          showToast(
            'Error al encontrar al usuario, por favor validar formulario',
          );
        } else {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error en la solicitud:', error);
          setSignInDisabled(false);
          showToast('Usuario no encontrado, por favor validar formulario');
        }
      }
    } else {
      setSignInDisabled(false);
    }
  };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  const appVersion = DeviceInfo.getVersion(); // Versión como "1.0.0"
  const buildNumber = DeviceInfo.getBuildNumber();

  const {bgFullStyle, textColorStyle, t, iconColorStyle} = useValues();
  const valData = () => {
    setCheckedData(!checkedData);
  };
  const {linearColorStyleTwo, linearColorStyle} = useValues();

  const changePassValue = () => {
    setshowPass(!showPass);
  };

  const stylesVersion = StyleSheet.create({
    text: {fontSize: 12, color: '#333'},
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 40,
          backgroundColor: bgFullStyle,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        <AuthContainer
        style={{ flex: 1, marginBottom: 20 }}
          title="Bienvenido a Solvers"
          subtitle="Garantiza que tu vehículo funcione de manera eficiente y segura"
          AlignItemTitle={'center'}
          value={
            <View>
              {/* EMAIL */}
              <TextInputs
                title="Email"
                value={email}
                placeHolder="Ingrese su Email"
                onChangeText={text => {
                  setEmail(text);
                  setEmailTyping(true);
                  if (text.trim() === '') {
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
                  <Email
                    color={
                      isEmailTyping ? iconColorStyle : appColors.subtitle
                    }
                  />
                }
              />
              {emailError !== '' && (
                <Text style={styles.errorStyle}>{emailError}</Text>
              )}

              {/* PASSWORD */}
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
                    setPasswordError(
                      'Contraseña debe tener mínimo 6 caracteres'
                    );
                  } else {
                    setPasswordError('');
                  }
                }}
                onBlur={() => {
                  validatePassword();
                  setPwdTyping(false);
                }}
                icon={
                  <Key
                    color={
                      isPwdTyping ? iconColorStyle : appColors.subtitle
                    }
                  />
                }
              />
              {passwordError !== '' && (
                <Text style={styles.errorStyle}>{passwordError}</Text>
              )}

              {/* RECORDAR Y OLVIDO */}
              <View
                style={[external.fd_row, external.ai_center, external.mt_3]}>
                <CheckBox onPress={valData} checked={checkedData} />
                <Text
                  style={[
                    commonStyles.subtitleText,
                    external.ph_5,
                    external.fg_1,
                    {
                      color: textColorStyle,
                      fontSize: fontSizes.FONT16,
                    },
                  ]}>
                  Recuérdame
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgetPassword')}>
                  <Text
                    style={[
                      commonStyles.subtitleText,
                      { color: '#2D3261', fontSize: fontSizes.FONT16 },
                    ]}>
                    ¿Olvidó la contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />

        {/* BOTÓN INGRESAR */}
        <NavigationButton
          title="Ingresar"
          onPress={onHandleChange}
          disabled={isSignInDisabled}
          backgroundColor={isSignInDisabled ? '#848688' : '#2D3261'}
          color={isSignInDisabled ? '#051E47' : appColors.screenBg}
        />

        {/* REGISTRO Y VERSIÓN */}
        <View style={styles.singUpView}>
          <Text style={[commonStyles.subtitleText]}>
            ¿No posee una cuenta?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text
              style={[
                commonStyles.titleText19,
                external.ph_5,
                { color: textColorStyle },
              ]}>
              Registro
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.singUpView}>
          <Text style={[commonStyles.subtitleText]}>
            Versión de la App: {DeviceInfo.getVersion()}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
