import React, { useEffect, useState } from 'react';
import { View, Text, ToastAndroid, Alert } from 'react-native';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  emailId,
  enterEmail,
  forgetPassword,
  forgetPasswordText,
  getOtp,
} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import appColors from '../../../themes/appColors';
import { Email } from '../../../assets/icons/email';
import styles from './style.css';
import { useValues } from '../../../../App';
import api from '../../../../axiosInstance';
import auth from '@react-native-firebase/auth';


const ForgetPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(true);
  const [isButtonPressed, setButtonPressed] = useState(false);
  const [isEmailTyping, setEmailTyping] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Formato de email incorrecto');
    } else {
      setEmailError('');
      setGetOtpDisabled(false)
    }
  };
  const onEmailChange = text => {
    setEmail(text);
    if (isButtonPressed) {
      setEmailError('');
    }
    if (!isEmailTyping) {
      setEmailTyping(true);
    }
  };
  const onHandleChange = async () => {
    setButtonPressed(true);
    setGetOtpDisabled(true)

    console.log(email)
    console.log("Aquiii++++++++++++++++++++++")

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('¡Listo!', 'Revisa tu correo para recuperar tu contraseña.');
      setGetOtpDisabled(false);
      navigation.navigate('Login');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No existe una cuenta con ese correo.');
        setGetOtpDisabled(false);
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error34', 'El correo no es válido.');
        setGetOtpDisabled(false);
      } else {
        Alert.alert('Error56', error.message);
        setGetOtpDisabled(false);
      }
    }

  };


  useEffect(() => {
    validateEmail();
    setGetOtpDisabled(emailError !== '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailError]);
  const { t, bgFullStyle, iconColorStyle } = useValues();
  return (
    <View style={[styles.headingContainer, { backgroundColor: bgFullStyle, }]}>
      <AuthContainer
        title="¿Olvido la contraseña?"
        subtitle="Ingrese su correo y restablezca su contraseña"
        AlignItemTitle={"center"}
        showBack={true}
        value={
          <View>
            <TextInputs
              title="Correo Electrónico"
              keyboardType={'email-address'}
              placeHolder="Ingrese su correo (email@email.com)"
              onChangeText={onEmailChange}
              onBlur={validateEmail}
              icon={
                <Email
                  color={isEmailTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />

            {isButtonPressed && emailError !== '' && (
              <Text style={styles.errorStyle}>{emailError}</Text>
            )}
          </View>
        }
      />
      <NavigationButton
        title="Recuperar Clave"
        onPress={onHandleChange}
        disabled={isGetOtpDisabled}
        backgroundColor={isGetOtpDisabled ? '#848688' : '#2D3261'}
        color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
      />
    </View>
  );
};

export default ForgetPassword;
