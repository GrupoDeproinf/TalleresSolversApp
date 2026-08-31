import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
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

  const { bgFullStyle, iconColorStyle } = useValues();

  const forgotStyles = StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: bgFullStyle,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 32,
    },
    formCard: {
      backgroundColor: appColors.screenBg,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 24,
      marginTop: 16,
    },
    btnWrap: {
      marginTop: 28,
      paddingHorizontal: 20,
    },
    backLink: {
      marginTop: 24,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    backLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: appColors.primary,
    },
  });

  return (
    <View style={[styles.headingContainer, forgotStyles.wrap]}>
      <AuthContainer
        title="Recuperar contraseña"
        subtitle="Ingresa tu correo y te enviaremos un enlace para restablecerla."
        AlignItemTitle="center"
        showBack={true}
        value={
          <View style={forgotStyles.formCard}>
            <TextInputs
              title="Correo electrónico"
              keyboardType="email-address"
              value={email}
              placeHolder="Ej. tu@correo.com"
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
      <View style={forgotStyles.btnWrap}>
        <NavigationButton
          title="Enviar enlace de recuperación"
          onPress={onHandleChange}
          disabled={isGetOtpDisabled}
          backgroundColor={isGetOtpDisabled ? appColors.lightButton : appColors.primary}
          color={isGetOtpDisabled ? appColors.titleText : appColors.screenBg}
        />
      </View>
      <TouchableOpacity
        style={forgotStyles.backLink}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}>
        <Text style={forgotStyles.backLinkText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgetPassword;
