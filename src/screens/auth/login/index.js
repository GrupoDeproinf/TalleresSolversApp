import {Text, TouchableOpacity, View, ToastAndroid } from 'react-native';
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

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [checkedData, setCheckedData] = useState(false);
  const [isSignInDisabled, setSignInDisabled] = useState(false);

  useEffect(() => {}, []);
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
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    setSignInDisabled(true);

    if (isEmailValid && isPasswordValid) {

      console.log(email)
      console.log(password)

      try {
        // Hacer la solicitud POST
        const response = await fetch('http://desarrollo-test.com/api/usuarios/authenticateUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({email:email}), // Convertir los datos a JSON
        });
  
        // Verificar la respuesta del servidor
        if (response.ok) {
          const result = await response.json();
          console.log("Este es el usuario nuevo ", result); // Aquí puedes manejar la respuesta

          if (result.message == "Usuario autenticado exitosamente"){
            try {
              const jsonValue = JSON.stringify(result.userData);
              console.log(jsonValue);
              await AsyncStorage.setItem('@userInfo', jsonValue);
            } catch (e) {
              console.log(e);
            }

            setSignInDisabled(true);
            setEmail("")
            setPassword("")
            setSignInDisabled(false);
            navigation.navigate('LoaderScreen');

          } else {
            setSignInDisabled(false);
            showToast('No se ha encontrado el usuario, por favor validar formulario');
          }
        } else {
          console.error('Error en la solicitud:', response.statusText);
          showToast('Error al encontrar al usuario, por favor validar formulario');
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
        setSignInDisabled(false);
        showToast('Usuario no encontrado, por favor validar formulario');
      }
    } else {
      setSignInDisabled(false);
    }
  };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  const {bgFullStyle, textColorStyle, t, iconColorStyle} = useValues();
  const valData = () => {
    setCheckedData(!checkedData);
  };
  const {linearColorStyleTwo, linearColorStyle} = useValues();
  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title="Bienvenido a Solvers"
        subtitle="Garantiza que tu vehículo funcione de manera eficiente y segura"
        value={
          <View>
            <TextInputs
              title="Email"
              value={email}
              placeHolder="Ingrese su Email"
              onChangeText={text => {
                setEmail(text);
                setEmailTyping(true);
                if (text.trim() === '') {
                  setEmailError('Email is requerido');
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
                  color={isEmailTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />
            {emailError !== '' && (
              <Text style={styles.errorStyle}>{emailError}</Text>
            )}
            <TextInputs
              title="Contraseña"
              value={password}
              placeHolder="Ingrese su contraseña"
              secureTextEntry={true} 
              onChangeText={text => {
                setPassword(text);
                setPwdTyping(true);
                if (text.length < 6) {
                  setPasswordError('Contraseña debe tener minimo 6 caracteres');
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
                  color={isPwdTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}
            <View style={[external.fd_row, external.ai_center, external.mt_3]}>
              <CheckBox onPress={valData} checked={checkedData} />
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ph_5,
                  external.fg_1,
                  {color: textColorStyle, fontSize: fontSizes.FONT16},
                ]}>
                Recuerdame
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgetPassword')}>
                <Text
                  style={[
                    commonStyles.subtitleText,
                    {color: '#4D66FF', fontSize: fontSizes.FONT16},
                  ]}>
                  Olvido la contraseña
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      <NavigationButton
        title="Ingresar"
        onPress={onHandleChange}
        disabled={isSignInDisabled}
        backgroundColor={isSignInDisabled ? '#D1D6DE' : '#4D66FF'}
        color={isSignInDisabled ? '#051E47' : appColors.screenBg}
      />

      <View style={styles.singUpView}>
        <Text style={[commonStyles.subtitleText]}>
          ¿No posee una cuenta?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ph_5,
              {color: textColorStyle},
            ]}>
            Registro
          </Text>
        </TouchableOpacity>
      </View>

      {/* <LinearBoderText />
      <View style={[external.fd_row, external.ai_center, external.mb_40]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <Google />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_2,
                {color: textColorStyle},
              ]}>
              {t('transData.google')}
            </Text>
          </LinearGradient>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <FaceBook />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_3,
                {color: textColorStyle},
              ]}>
              {facebook}
            </Text>
          </LinearGradient>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <Apple />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_2,
                {color: textColorStyle},
              ]}>
              {apple}
            </Text>
          </LinearGradient>
        </LinearGradient>
      </View> */}
    </View>
  );
};

export default SignIn;
