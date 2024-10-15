import React, {useEffect, useState} from 'react';
import {View, Text, ToastAndroid} from 'react-native';
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
    console.log("Aquiii")

    try {
      // Hacer la solicitud POST
      const response = await fetch('http://desarrollo-test.com/api/usuarios/restorePass', {
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

        if (result.message == "Correo de restablecimiento enviado."){
          showToast('Correo de restablecimiento enviado!!');
          setGetOtpDisabled(false)
          navigation.navigate('Login');
        } else {
          showToast('El email dado no se encuentra registrado');
          setGetOtpDisabled(false)
        }
      } else {
        console.error('Error en la solicitud:', response);
        showToast('El email dado no se encuentra registrado');
        setGetOtpDisabled(false)
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      showToast('El email dado no se encuentra registrado');
      setGetOtpDisabled(false)
    }


    // if (emailError === '') {
    //   navigation.navigate('Login');
    // }
  };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };


  useEffect(() => {
    validateEmail();
    setGetOtpDisabled(emailError !== '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailError]);
  const {t, bgFullStyle, iconColorStyle} = useValues();
  return (
    <View style={[styles.headingContainer, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title="¿Olvido la contraseña?"
        subtitle="Ingrese su correo y restablezca su contraseña"
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
        backgroundColor={isGetOtpDisabled ? '#D1D6DE' : '#4D66FF'}
        color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
      />
    </View>
  );
};

export default ForgetPassword;
