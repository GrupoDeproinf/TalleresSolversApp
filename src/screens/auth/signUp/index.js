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
import {Picker} from '@react-native-picker/picker';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/FontAwesome5';

import Icons3 from 'react-native-vector-icons/Fontisto';
import Icons4 from 'react-native-vector-icons/Entypo';
import api from '../../../../axiosInstance';
import CheckBox from 'react-native-check-box';

import {launchImageLibrary} from 'react-native-image-picker';
import {Buffer} from 'buffer';

import MapComponent from '../../map';
import messaging from '@react-native-firebase/messaging';

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

  const [selectedPrefix, setSelectedPrefix] = useState('J-'); // Default value 'J'

  const [MetodosPagoSelected, setMetodosPagoSelected] = useState([]);

  const [whats, setwhats] = useState(0);
  const [whatsError, setwhatsError] = useState('');

  const [lat, setlat] = useState('');
  const [lng, setlng] = useState('');

  const [metodosPago, setMetodosPago] = useState([
    {label: 'Efectivo', value: 'efectivo', checked: false},
    {label: 'Pago Móvil', value: 'pagoMovil', checked: false},
    {label: 'Punto de venta', value: 'puntoVenta', checked: false},
    {label: 'Credito internacional', value: 'tarjetaCreditoI', checked: false},
    {label: 'Credito nacional', value: 'tarjetaCreditoN', checked: false},
    {label: 'Transferencia', value: 'transferencia', checked: false},
    {label: 'Zelle', value: 'zelle', checked: false},
    {label: 'Zinli', value: 'zinli', checked: false},
  ]);

  const [estadoSelected, setestadoSelected] = useState(''); // Default value 'J'

  const [estadosVenezuela, setEstadosVenezuela] = useState([
    {label: 'Seleccione un estado', value: ''},
    {label: 'Amazonas', value: 'Amazonas'},
    {label: 'Anzoátegui', value: 'Anzoátegui'},
    {label: 'Apure', value: 'Apure'},
    {label: 'Aragua', value: 'Aragua'},
    {label: 'Barinas', value: 'Barinas'},
    {label: 'Bolívar', value: 'Bolívar'},
    {label: 'Carabobo', value: 'Carabobo'},
    {label: 'Cojedes', value: 'Cojedes'},
    {label: 'Delta Amacuro', value: 'Delta Amacuro'},
    {label: 'Distrito Capital', value: 'Distrito Capital'},
    {label: 'Falcón', value: 'Falcón'},
    {label: 'Guárico', value: 'Guárico'},
    {label: 'Lara', value: 'Lara'},
    {label: 'Mérida', value: 'Mérida'},
    {label: 'Miranda', value: 'Miranda'},
    {label: 'Monagas', value: 'Monagas'},
    {label: 'Nueva Esparta', value: 'Nueva Esparta'},
    {label: 'Portuguesa', value: 'Portuguesa'},
    {label: 'Sucre', value: 'Sucre'},
    {label: 'Táchira', value: 'Táchira'},
    {label: 'Trujillo', value: 'Trujillo'},
    {label: 'Vargas', value: 'Vargas'},
    {label: 'Yaracuy', value: 'Yaracuy'},
    {label: 'Zulia', value: 'Zulia'},
  ]);

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'Cliente', title: 'Cliente'},
    {key: 'Taller', title: 'Taller'},
  ]);

  useEffect(() => {}, [isGetOtpDisabled]);

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
    // Eliminar la máscara para validar solo los números
    const numericPhone = phone.replace(/[^0-9]/g, ''); // Remueve paréntesis, espacios y guiones
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

  const onHandleChange = async () => {
    console.log(typeOfView);
    console.log('Aquiiiiiiiiiiiiiii');

    try {
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
  
            if (
              phoneValidationResponse.status === 200 &&
              phoneValidationResponse.data.valid === true &&
              emailValidationResponse.status === 200 &&
              emailValidationResponse.data.valid === true
            ) {
              const infoUserCreated = {
                Nombre: Nombre,
                cedula: selectedPrefix + '' + cedula,
                phone: phone,
                typeUser: 'Cliente',
                email: email.toLowerCase(),
                password: password.toLowerCase(),
                estado: estadoSelected,
                base64: base64,
                token:token
              };
  
              console.log(infoUserCreated);
  
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
                    error.response.data.message,
                  );
                  setGetOtpDisabled(false);
                  showToast(error.response.data.message); // Mostrar el mensaje de error del servidor
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
                Nombre: Nombre,
                rif: selectedPrefix + '' + cedula,
                phone: phone,
                typeUser: 'Taller',
                email: email.toLowerCase(),
                password: password.toLowerCase(),
                whats: whats,
                metodos_pago: newFormatMP,
                estado: estadoSelected,
                base64: base64,
                lat: lat,
                lng: lng,
                token:token
              };
  
              console.log(infoUserCreated);
              console.log('Aquiiiiiiiiiiiii123');
  
              try {
                // Hacer la solicitud POST utilizando Axios
                const response = await api.post(
                  '/usuarios/SaveTaller',
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


  const {bgFullStyle, textColorStyle, t, textRTLStyle} = useValues();

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
    launchImageLibrary({mediaType: 'photo', includeBase64: true}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.assets[0].uri};
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

  const GetCoordenadas = location => {
    console.log(location);
    setlat(location.latitude);
    setlng(location.longitude);
  };

  return (
    <View
      style={[styles.container, {backgroundColor: bgFullStyle, padding: 30}]}>
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
                    source={{uri: imageUri}}
                    style={{width: 200, height: 200}}
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
                    {marginLeft: 10, color: '#2D3261'},
                  ]}>
                  Foto de perfil
                </Text>
              </TouchableOpacity>
            </View>

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
              icon={<Icons name="user" size={20} color="#9BA6B8" />}
            />
            {NombreError !== '' && (
              <Text style={styles.errorStyle}>{NombreError}</Text>
            )}

            <View style={{marginTop: 5}}>
              <Text
                style={[
                  styles.headingContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                Cedula
              </Text>

              {/* Contenedor para el Picker y el TextInput */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* Select para elegir "J-" o "G-" */}
                <View
                  style={{
                    overflow: 'hidden',
                    height: 50, // Asegurar que ambos tengan el mismo height
                    marginRight: 5, // Espaciado entre el Picker y el TextInput
                  }}>
                  <Picker
                    selectedValue={selectedPrefix}
                    onValueChange={itemValue => setSelectedPrefix(itemValue)}
                    style={{
                      width: 100,
                      height: 0, // Altura para el Picker
                      color: 'black',
                    }}>
                    <Picker.Item label="C-" value="C-" />
                    <Picker.Item label="E-" value="E-" />
                    <Picker.Item label="G-" value="G-" />
                    <Picker.Item label="J-" value="J-" />
                    <Picker.Item label="P-" value="P-" />
                    <Picker.Item label="V-" value="V-" />
                  </Picker>
                </View>

                {/* TextInput para el número de RIF */}
                <View style={{flex: 1, marginTop: -22, marginLeft: -50}}>
                  <TextInputs
                    title=""
                    value={cedula}
                    placeHolder="Ingrese el número de cedula"
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      if (numericText.length <= 10) {
                        // Limitar a 10 caracteres
                        setcedula(numericText);
                        setcedulaTyping(true);
                        if (numericText.trim() === '') {
                          setcedulaError('Cedula es requerida');
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
                    style={{height: 50}} // Altura para el TextInput
                  />
                </View>
              </View>

              {cedulaError !== '' && (
                <Text style={styles.errorStyle}>{cedulaError}</Text>
              )}
            </View>

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
                {/* Icono al lado del Picker */}
                <Icons4
                  name="location"
                  size={20}
                  color="#9BA6B8"
                  style={{marginRight: 5, marginLeft: 10}}
                />
                <View
                  style={{
                    overflow: 'hidden',
                    height: 50, // Asegurar que ambos tengan el mismo height
                  }}>
                  <Picker
                    selectedValue={estadoSelected}
                    onValueChange={itemValue => setestadoSelected(itemValue)}
                    style={{
                      width: 400,
                      height: 50, // Ajustar la altura para el Picker
                      color: 'black',
                    }}>
                    {estadosVenezuela.map(estado => (
                      <Picker.Item
                        key={estado.value}
                        label={estado.label}
                        value={estado.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <TextInputs
              title="Número Telefónico"
              value={phone}
              placeHolder="Ejem (414) 261-7966"
              keyboardType="numeric"
              onChangeText={text => {
                // Eliminar caracteres no numéricos
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

                // Aplicar formato de máscara (XXX) XXX-XXXX
                let formattedText = numericText;
                if (numericText.length > 3 && numericText.length <= 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3)}`;
                } else if (numericText.length > 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3, 6)}-${numericText.slice(6)}`;
                }

                // Actualizar el estado con el texto formateado
                setPhone(numericText);
                setCallTyping(true);

                // Validaciones
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
                    source={{uri: imageUri}}
                    style={{width: 200, height: 200}}
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
                    {marginLeft: 10, color: '#2D3261'},
                  ]}>
                  Foto de perfil
                </Text>
              </TouchableOpacity>
            </View>

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
                    overflow: 'hidden',
                    height: 50, // Asegurar que ambos tengan el mismo height
                    marginRight: 5, // Espaciado entre el Picker y el TextInput
                  }}>
                  <Picker
                    selectedValue={selectedPrefix}
                    onValueChange={itemValue => setSelectedPrefix(itemValue)}
                    style={{
                      width: 100,
                      height: 0, // Altura para el Picker
                      color: 'black',
                    }}>
                    <Picker.Item label="C-" value="C-" />
                    <Picker.Item label="E-" value="E-" />
                    <Picker.Item label="G-" value="G-" />
                    <Picker.Item label="J-" value="J-" />
                    <Picker.Item label="P-" value="P-" />
                    <Picker.Item label="V-" value="V-" />
                  </Picker>
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
                    style={{height: 50}} // Altura para el TextInput
                  />
                </View>
              </View>

              {/* Mensaje de error si el RIF es inválido */}
              {cedulaError !== '' && (
                <Text style={styles.errorStyle}>{cedulaError}</Text>
              )}
            </View>

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
                {/* Icono al lado del Picker */}
                <Icons4
                  name="location"
                  size={20}
                  color="#9BA6B8"
                  style={{marginRight: 5, marginLeft: 10}}
                />
                <View
                  style={{
                    overflow: 'hidden',
                    height: 50, // Asegurar que ambos tengan el mismo height
                  }}>
                  <Picker
                    selectedValue={estadoSelected}
                    onValueChange={itemValue => setestadoSelected(itemValue)}
                    style={{
                      width: 400,
                      height: 50, // Ajustar la altura para el Picker
                      color: 'black',
                    }}>
                    {estadosVenezuela.map(estado => (
                      <Picker.Item
                        key={estado.value}
                        label={estado.label}
                        value={estado.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View
              style={[stylesMap.container, {marginTop: 5, marginBottom: 15}]}>
              <MapComponent
                initialRegion={{
                  latitude: 37.7749,
                  longitude: -122.4194,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
                edit={true}
                returnFunction={GetCoordenadas}
                useThisCoo={false}
              />
            </View>

            <TextInputs
              title="Número Telefónico"
              value={phone}
              placeHolder="Ejem (414) 261-7966"
              keyboardType="numeric"
              onChangeText={text => {
                // Eliminar caracteres no numéricos
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

                // Aplicar formato de máscara (XXX) XXX-XXXX
                let formattedText = numericText;
                if (numericText.length > 3 && numericText.length <= 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3)}`;
                } else if (numericText.length > 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3, 6)}-${numericText.slice(6)}`;
                }

                // Actualizar el estado con el texto formateado
                setPhone(numericText);
                setCallTyping(true);

                // Validaciones
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
              title="Whatsapp"
              value={whats}
              placeHolder="Ejem (414) 261-7966"
              keyboardType="numeric"
              onChangeText={text => {
                // Eliminar caracteres no numéricos
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

                // Aplicar formato de máscara (XXX) XXX-XXXX
                let formattedText = numericText;
                if (numericText.length > 3 && numericText.length <= 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3)}`;
                } else if (numericText.length > 6) {
                  formattedText = `(${numericText.slice(
                    0,
                    3,
                  )}) ${numericText.slice(3, 6)}-${numericText.slice(6)}`;
                }

                // Actualizar el estado con el texto formateado
                setwhats(numericText);
                setCallTyping(true);

                // Validación: Si está vacío, muestra error
                if (numericText.trim() === '') {
                  setwhatsError('Número telefónico requerido');
                } else {
                  setwhatsError('');
                }
              }}
              onBlur={() => {
                validatewhats();
                setCallTyping(false);
              }}
              icon={<Icons name="whatsapp" size={20} color="#9BA6B8" />}
            />

            {whatsError !== '' && (
              <Text style={styles.errorStyle}>{whatsError}</Text>
            )}

            <View style={{marginTop: 5}}>
              {/* Texto "RIF" arriba de los inputs */}
              <Text
                style={[
                  styles.headingContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                Metodos de Pago
              </Text>

              <View style={{padding: 10}}>
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
                        width: '45%', // Ajusta el ancho para hacer columnas
                      }}>
                      <CheckBox
                        isChecked={method.checked}
                        onClick={() => toggleCheckBox(index)}
                        checkBoxColor="#2D3261"
                      />
                      <Text style={{marginLeft: 10, color: 'black'}}>
                        {method.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

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

const stylesMap = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
