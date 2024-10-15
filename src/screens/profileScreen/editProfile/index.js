import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  Image,
  ToastAndroid,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import {phoneMo, smithaWilliams, smithaWilliamsMail} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import images from '../../../utils/images';
import TextInputs from '../../../commonComponents/textInputs';
import appColors from '../../../themes/appColors';
import {Call, Edit, Profile, Key} from '../../../utils/icon';
import {Email} from '../../../assets/icons/email';
import NavigationButton from '../../../commonComponents/navigationButton';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';


const EditProfile = ({navigation}) => {
  const [nameValue, setNameValue] = useState(smithaWilliams);
  const [emailValue, setEmailValue] = useState(smithaWilliamsMail);
  const [phoneValue, setPhoneValue] = useState(phoneMo);
  const [buttonColor, setButtonColor] = useState('#d1d6de');

  //

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
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(true);
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [iscedulaTyping, setcedulaTyping] = useState(false);
  const [NombreTyping, setNombreTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isConfTyping, setConfPwdTyping] = useState(false);

  // *******************************************

  useEffect(() => {
    console.log("Aquiiii1234")
    getData()
  }, []);


  const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        console.log("valor del storage1234", user.cedula);
        
        setNombre(user.nombre)
        setcedula(user.cedula)
        setEmail(user.email)
        setPhone(user.phone)

        // setinfoUser(user)
    } catch(e) {
        // error reading value
        console.log(e)
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

  const validatePhone = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const onHandleChange = async () => {

    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    if (
      isEmailValid == true &&
      isPhoneValid == true &&
      Nombre != '' &&
      cedula != 0
    ) {
      const infoUserCreated = {
        uid: '12345',
        nombre: Nombre,
        cedula: cedula,
        phone: phone,
        typeUser: 'Cliente',
        email: email,
      };
      try {
        const jsonValue = JSON.stringify(infoUserCreated);
        console.log(jsonValue);
        await AsyncStorage.setItem('@userInfo', jsonValue);
      } catch (e) {
        console.log(e);
      }

      showToast('Actualizado correctamente');
      navigation.goBack('')
    } else {
      showToast('Error al actualizar el usuario, por favor validar formulario');
    }
  };

  const {bgFullStyle, textColorStyle, iconColorStyle, isDark, t} = useValues();

  // const showToast = (type, text1, position, visibilityTime, autoHide) => {
  //   Toast.show({
  //     type: type,
  //     text1: text1,
  //     position: position',
  //     visibilityTime: visibilityTime,
  //     autoHide: autoHide,
  //   });
  // };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  // Funciones para manejar los clics
  const handleClientePress = () => {
    console.log('Cliente Card Pressed23');
    settypeOfView('Cliente');
  };

  const handleTallerPress = () => {
    console.log('Taller Card Pressed1');
    settypeOfView('Taller');
  };

  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value="Mi cuenta" />
      <View style={[external.as_center]}>
        <ImageBackground
          resizeMode="contain"
          style={styles.imgStyle}
          source={images.user}>
          <View
            style={[
              styles.editIconStyle,
              {backgroundColor: '#F3F5FB'},
              {borderRadius: 100},
            ]}>
            <Edit />
          </View>
        </ImageBackground>
      </View>

      <ScrollView style={{marginBottom: 15}}>
        <View>
          <TextInputs
            title="Nombre y Apellido"
            placeHolder="Ingrese su nombre y apellido"
            value={Nombre}
            onChangeText={text => {
              console.log(text);
              setNombre(text);
              setNombreTyping(true);
              if (text.trim() === '') {
                setNombreError('Nombre es requerido');
              } else {
                setNombreError('');
              }
            }}
            onBlur={() => {
              setNombreTyping(false);
            }}
            icon={
              <Email color={NombreTyping ? '#051E47' : appColors.subtitle} />
            }
          />
          {NombreError !== '' && (
            <Text style={styles.errorStyle}>{NombreError}</Text>
          )}

          <TextInputs
            title="Cedula"
            value={cedula}
            placeHolder="Ingrese su cedula"
            onChangeText={text => {
              // Eliminar cualquier caracter que no sea un número
              const numericText = text.replace(/[^0-9]/g, '');
              setcedula(numericText);
              setcedulaTyping(true);
              if (numericText.trim() === '') {
                setcedulaError('Cedula es requerida');
              } else {
                setcedulaError('');
              }
            }}
            onBlur={() => {
              setcedulaTyping(false);
            }}
            keyboardType="numeric" // Establece el teclado numérico
            icon={
              <Email color={iscedulaTyping ? '#051E47' : appColors.subtitle} />
            }
          />

          {cedulaError !== '' && (
            <Text style={styles.errorStyle}>{cedulaError}</Text>
          )}

          <TextInputs
            title="Email"
            value={email}
            placeHolder="Ingrese su email"
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
              <Email color={isEmailTyping ? '#051E47' : appColors.subtitle} />
            }
          />
          {emailError !== '' && (
            <Text style={styles.errorStyle}>{emailError}</Text>
          )}

          <TextInputs
            title="Número Telefónico"
            value={phone}
            placeholder="Ingrese su número"
            keyboardType="numeric"
            onChangeText={text => {
              // Remove non-numeric characters using regex
              const numericText = text.replace(/[^0-9]/g, '');
              setPhone(numericText);
              setCallTyping(true);

              if (numericText.trim() === '') {
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
        </View>
      </ScrollView>

      {/* <TextInputs
        title={t('transData.name')}
        placeHolder={t('transData.smithaWilliams')}
        color={textColorStyle}
        icon={<Profile />}
        value={nameValue}
        onChangeText={handleNameChange}
      />
      <TextInputs
        title={t('transData.emailId')}
        placeHolder={t('transData.smithaWilliamsMail')}
        color={textColorStyle}
        icon={<Email color={iconColorStyle} />}
        value={emailValue}
        onChangeText={handleEmailChange}
        keyboardType={'email-address'}
      />
      <TextInputs
        title={t('transData.phoneNumber')}
        placeHolder={phoneMo}
        color={textColorStyle}
        icon={<Call color={iconColorStyle} />}
        value={phoneValue}
        onChangeText={handlePhoneChange}
        keyboardType={'decimal-pad'}
      /> */}

      <View style={[external.fx_1, external.js_end, external.Pb_30]}>
        <View
          style={{
            backgroundColor: buttonColor,
            borderRadius: windowHeight(20),
          }}>
          <NavigationButton
            title="Guardar Cambios"
            color={buttonColor ? appColors.screenBg : appColors.subtitle}
            onPress={() =>onHandleChange()}
            backgroundColor={'#4D66FF'}
          />
        </View>
      </View>
    </View>
  );
};

export default EditProfile;
