import React, {useEffect, useState} from 'react';
import {View, Text, ToastAndroid} from 'react-native';
import { toastMessage } from '../../../utils/showToast';
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
import {Email} from '../../../assets/icons/email';
import styles from './style.css';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance'; 


const ForgetPassword = ({navigation}) => {
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
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/restorePass', {
        email: email.toLowerCase(), // Convertir el email a minúsculas
      });
    
      // El backend responde 200 cuando el correo de restablecimiento se envió.
      // Por seguridad usa un mensaje genérico (no revela si el email existe).
      // Antes se comparaba un texto exacto que ya no coincide con el del
      // servidor, por lo que en caso de ÉXITO se mostraba un falso error
      // ("email no registrado") aunque el correo sí se enviaba. (APP-03)
      if (response.status === 200) {
        showToast(
          'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
        );
        setGetOtpDisabled(false);
        navigation.navigate('Login');
      } else {
        showToast('No se pudo procesar la solicitud. Intenta nuevamente.');
        setGetOtpDisabled(false);
      }
    } catch (error) {
      if (error.response) {
        // La solicitud se hizo y el servidor respondió con un código de estado
        console.error('Error en la solicitud:', error.response.statusText);
        showToast('No se pudo procesar la solicitud. Intenta nuevamente.');
        setGetOtpDisabled(false);
      } else {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('Error en la solicitud:', error);
        showToast('Error de conexión. Verifica tu internet e intenta de nuevo.');
        setGetOtpDisabled(false);
      }
    }
    


    // if (emailError === '') {
    //   navigation.navigate('Login');
    // }
  };

  const showToast = text => {
    toastMessage(text);
  };


  useEffect(() => {
    validateEmail();
    setGetOtpDisabled(emailError !== '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailError]);
  const {t, bgFullStyle, iconColorStyle} = useValues();
  return (
    <View style={[styles.headingContainer, {backgroundColor: bgFullStyle,}]}>
      <AuthContainer
        title="¿Olvido la contraseña?"
        subtitle="Ingrese su correo y restablezca su contraseña"
        AlignItemTitle = {"center"}
        showBack={true}
        value={
          <View>
            <TextInputs
              title="Email"
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
