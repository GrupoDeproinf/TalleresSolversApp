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
} from 'react-native';
import React, {useState, useEffect} from 'react';
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
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import {Call, Key} from '../../../utils/icon';
import {useValues} from '../../../../App';

import UserImage from '../../../assets/newImage/user.png';
import KeyImage from '../../../assets/newImage/key.png';

import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = ({navigation}) => {
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

  // Variables para el tab

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'Cliente', title: 'Cliente'},
    {key: 'Taller', title: 'Taller'},
  ]);


  useEffect(() => {
  }, [isGetOtpDisabled]);

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
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Telefono debe contener 9 caracteres');
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

  const onHandleChange = async () => {
    console.log(typeOfView);
    console.log("Aquiiiiiiiiiiiiiii")

    setGetOtpDisabled(true)
    

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
        cedula != 0  && cedula != '' 
      ) {
        const infoUserCreated = {
          Nombre: Nombre,
          cedula: cedula,
          phone: phone,
          typeUser: 'Cliente',
          email: email,
        };

        try {
          // Hacer la solicitud POST
          const response = await fetch('http://desarrollo-test.com/api/usuarios/SaveClient', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(infoUserCreated), // Convertir los datos a JSON
          });
    
          // Verificar la respuesta del servidor
          console.log(response)

          if (response.ok) {
            const result = await response.json();
            console.log(result); // Aquí puedes manejar la respuesta

            try {
              const jsonValue = JSON.stringify(infoUserCreated);
              console.log(jsonValue);
              await AsyncStorage.setItem('@userInfo', jsonValue);
            } catch (e) {
              console.log(e);
            }
            setNombre('');
            setcedula(0);
            setEmail('');
            setPhone(0);
            setPassword('');
            setConfirmPassword('');
            settypeOfView("")
    
            showToast('Usuario creado exitosamente');
            setGetOtpDisabled(false)
            navigation.navigate('Login');

          } else {
            const errorText = await response.text(); // Obtener el texto de error si la respuesta no fue exitosa
            try {
              const errorJson = JSON.parse(errorText); // Intentar convertir el texto a JSON
              console.error('Error al guardar el usuario:', errorJson.message); // Acceder a la propiedad "message"
              setGetOtpDisabled(false)
              showToast(errorJson.message);
          } catch (e) {
              console.error('Error al procesar la respuesta de error:', e);
              console.error('Texto de error sin formato JSON:', errorText); // Mostrar el texto de error original si no se pudo parsear
            }
          }
        } catch (error) {
          console.error('Error en la solicitud:', error);
          setGetOtpDisabled(false)
        }
      } else {
        setGetOtpDisabled(false)
        showToast('Error al crear al usuario, por favor validar formulario');
      }
    } else {
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
        cedula != 0 && cedula != ''
      ) {
        const infoUserCreated = {
          Nombre: Nombre,
          rif: cedula,
          phone: phone,
          typeUser: 'Taller',
          email: email,
        };  

        console.log(infoUserCreated)

        try {
          // Hacer la solicitud POST
          const response = await fetch('http://desarrollo-test.com/api/usuarios/SaveTaller', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(infoUserCreated), // Convertir los datos a JSON
          });
    
          // Verificar la respuesta del servidor
          if (response.ok) {
            const result = await response.json();
            console.log(result); // Aquí puedes manejar la respuesta

            try {
              const jsonValue = JSON.stringify(infoUserCreated);
              console.log(jsonValue);
              await AsyncStorage.setItem('@userInfo', jsonValue);
            } catch (e) {
              console.log(e);
            }
            setNombre('');
            setcedula(0);
            setEmail('');
            setPhone(0);
            setPassword('');
            setConfirmPassword('');
            settypeOfView("")
    
            showToast('Usuario creado exitosamente');
            setGetOtpDisabled(false)
            navigation.navigate('Login');

          } else {
            const errorText = await response.text(); // Obtener el texto de error si la respuesta no fue exitosa
            try {
              const errorJson = JSON.parse(errorText); // Intentar convertir el texto a JSON
              console.error('Error al guardar el usuario:', errorJson.message); // Acceder a la propiedad "message"
              setGetOtpDisabled(false)
              showToast(errorJson.message);
          } catch (e) {
              console.error('Error al procesar la respuesta de error:', e);
              console.error('Texto de error sin formato JSON:', errorText); // Mostrar el texto de error original si no se pudo parsear
            }
          }
        } catch (error) {

          console.error('Error en la solicitud:', error);
          setGetOtpDisabled(false)
          showToast('Error al crear al usuario, por favor validar formulario');
        }
      } else {
        showToast('Error al crear al usuario, por favor validar formulario');
        setGetOtpDisabled(false)
      }
    }
  };
  const {bgFullStyle, textColorStyle, t} = useValues();

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
    console.log('Cliente Card Pressed2');
    settypeOfView('Cliente');
  };

  const handleTallerPress = () => {
    console.log('Taller Card Pressed1');
    settypeOfView('Taller');
  };

  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 15,
          color: 'black',
        }}>
        Regístrate ahora {typeOfView != '' ? '(' + typeOfView + ')' : null}
      </Text>
      <Text style={{fontSize: 13, color: 'gray', marginBottom: 10}}>
        Regístrate ya sea como cliente o taller
      </Text>

      {typeOfView === 'Cliente' ? (
        // ****************************** FOMRULARIO PARA CLIENTES ***********************************************
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
                <Email
                  color={iscedulaTyping ? '#051E47' : appColors.subtitle}
                />
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
              placeHolder="Ejem (4142617966)"
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

            <TextInputs
              title="Contraseña"
              value={password}
              placeHolder="Ingrese su contraseña"
              secureTextEntry={true} // Make it a password field
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
              secureTextEntry={true}
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
      ) : typeOfView === 'Taller' ? (
        // ****************************** FOMRULARIO PARA TALLERES ***********************************************
        <ScrollView style={{marginBottom: 15}}>
          <View>
            <TextInputs
              title="Nombre del Taller"
              placeHolder="Ingrese el nombre"
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
              title="Registro de Información Fiscal (RIF)"
              value={cedula}
              placeHolder="Ingrese el numero de RIF"
              onChangeText={text => {
                // Eliminar cualquier caracter que no sea un número
                const numericText = text.replace(/[^0-9]/g, '');
                setcedula(numericText);
                setcedulaTyping(true);
                if (numericText.trim() === '') {
                  setcedulaError('RIF es requerido');
                } else {
                  setcedulaError('');
                }
              }}
              onBlur={() => {
                setcedulaTyping(false);
              }}
              keyboardType="numeric" // Establece el teclado numérico
              icon={
                <Email
                  color={iscedulaTyping ? '#051E47' : appColors.subtitle}
                />
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
              placeHolder="Ingrese su número(4142617966)"
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

            <TextInputs
              title="Contraseña"
              value={password}
              placeHolder="Ingrese su contraseña"
              secureTextEntry={true} // Make it a password field
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
              secureTextEntry={true}
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
      ) : null}

      {typeOfView == '' ? (
        <View style={{flex: 1, marginTop: '5%'}}>
          <TouchableOpacity
            onPress={() => handleClientePress()}
            style={stylesCard.boxContainer}>
            <Image source={UserImage} style={stylesCard.iconImage} />
            <Text
              style={[
                commonStyles.titleText19,
                external.ph_5,
                {color: textColorStyle},
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
                {color: textColorStyle},
              ]}>
              Taller
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {typeOfView != '' ? (
        <NavigationButton
          title="Registrarse"
          onPress={onHandleChange}
          disabled={isGetOtpDisabled}
          backgroundColor={isGetOtpDisabled ? '#D1D6DE' : '#4D66FF'}
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
              {color: textColorStyle},
            ]}>
            Ingresar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;

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
    shadowOffset: {width: 0, height: 2},
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
