import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  confirmPasswords,
  createYourAccount,
  dontHaveAccount,
  emailId,
  enterEmail,
  enterNumber,
  enterYouPassword,
  exploreyourLife,
  passwords,
  phoneNumber,
  reEnterPassword,
  signIn,
  signUp,
} from '../../../constant';
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
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { Icon } from 'react-native-elements';

import Icon from 'react-native-vector-icons/FontAwesome'; // Para íconos como "user"
// import Icon from 'react-native-vector-icons/MaterialIcons';

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState('');
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState('');
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

  const [typeOfView, settypeOfView] = useState('');

  // Variables para el tab

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'Cliente', title: 'Cliente'},
    {key: 'Taller', title: 'Taller'},
  ]);

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

  const onHandleChange = () => {
    console.log(index);

    // const isEmailValid = validateEmail();
    // const isPhoneValid = validatePhone();
    // const isPasswordValid = validatePassword();
    // const isConfirmPasswordValid = validateConfirmPassword();

    // const isDisabled =
    //   !isEmailValid ||
    //   !isPhoneValid ||
    //   !isPasswordValid ||
    //   !isConfirmPasswordValid;

    // setGetOtpDisabled(isDisabled);

    // if (!isDisabled) {
    //   navigation.navigate('LoaderScreen');
    // }
  };
  const {bgFullStyle, textColorStyle, t} = useValues();

  // Tabs

  const ClienteRoute = () => (
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
          icon={<Email color={NombreTyping ? '#051E47' : appColors.subtitle} />}
        />
        {NombreError !== '' && (
          <Text style={styles.errorStyle}>{NombreError}</Text>
        )}

        <TextInputs
          title="Cedula"
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
          title="Numero Telefonico"
          placeHolder="Ingrese su numero"
          onChangeText={text => {
            setPhone(text);
            setCallTyping(true);
            if (text.trim() === '') {
              setPhoneError('Numero telefonico requerido');
            } else {
              setPhoneError('');
            }
          }}
          onBlur={() => {
            validatePhone();
            setCallTyping(false);
          }}
          icon={<Call color={isCallTyping ? '#051E47' : appColors.subtitle} />}
        />

        {phoneError !== '' && (
          <Text style={styles.errorStyle}>{phoneError}</Text>
        )}

        <TextInputs
          title="Contraseña"
          placeHolder="Ingrese su contraseña"
          onChangeText={text => {
            setPassword(text);
            setPwdTyping(true);
            if (text.length < 6) {
              setPasswordError('Contraseña debe tener minimo 6 digitos');
            } else {
              setPasswordError('');
            }
          }}
          onBlur={() => {
            validatePassword();
            setPwdTyping(false);
          }}
          icon={<Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />}
        />
        {passwordError !== '' && (
          <Text style={styles.errorStyle}>{passwordError}</Text>
        )}

        <TextInputs
          title="Confirmar Contraseña"
          placeHolder="Ingrese otra vez la contraseña"
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
          icon={<Key color={isConfTyping ? '#051E47' : appColors.subtitle} />}
        />

        {confirmPasswordError !== '' && (
          <Text style={styles.errorStyle}>{confirmPasswordError}</Text>
        )}
      </View>
    </ScrollView>
  );

  const TallerRoute = () => (
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
          icon={<Email color={NombreTyping ? '#051E47' : appColors.subtitle} />}
        />
        {NombreError !== '' && (
          <Text style={styles.errorStyle}>{NombreError}</Text>
        )}

        <TextInputs
          title="Rif"
          placeHolder="Ingrese rif"
          onChangeText={text => {
            // Eliminar cualquier caracter que no sea un número
            // const numericText = text.replace(/[^0-9]/g, '');
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
          // keyboardType="numeric" // Establece el teclado numérico
          icon={
            <Email color={iscedulaTyping ? '#051E47' : appColors.subtitle} />
          }
        />

        {cedulaError !== '' && (
          <Text style={styles.errorStyle}>{cedulaError}</Text>
        )}

        <TextInputs
          title="Email"
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
          title="Numero Telefonico"
          placeHolder="Ingrese su numero"
          onChangeText={text => {
            setPhone(text);
            setCallTyping(true);
            if (text.trim() === '') {
              setPhoneError('Numero telefonico requerido');
            } else {
              setPhoneError('');
            }
          }}
          onBlur={() => {
            validatePhone();
            setCallTyping(false);
          }}
          icon={<Call color={isCallTyping ? '#051E47' : appColors.subtitle} />}
        />

        {phoneError !== '' && (
          <Text style={styles.errorStyle}>{phoneError}</Text>
        )}

        <TextInputs
          title="Contraseña"
          placeHolder="Ingrese su contraseña"
          onChangeText={text => {
            setPassword(text);
            setPwdTyping(true);
            if (text.length < 6) {
              setPasswordError('Contraseña debe tener minimo 6 digitos');
            } else {
              setPasswordError('');
            }
          }}
          onBlur={() => {
            validatePassword();
            setPwdTyping(false);
          }}
          icon={<Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />}
        />
        {passwordError !== '' && (
          <Text style={styles.errorStyle}>{passwordError}</Text>
        )}

        <TextInputs
          title="Confirmar Contraseña"
          placeHolder="Ingrese otra vez la contraseña"
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
          icon={<Key color={isConfTyping ? '#051E47' : appColors.subtitle} />}
        />

        {confirmPasswordError !== '' && (
          <Text style={styles.errorStyle}>{confirmPasswordError}</Text>
        )}
      </View>
    </ScrollView>
  );

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
        Regístrate ahora
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
              title="Numero Telefonico"
              placeHolder="Ingrese su numero"
              onChangeText={text => {
                setPhone(text);
                setCallTyping(true);
                if (text.trim() === '') {
                  setPhoneError('Numero telefonico requerido');
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
              placeHolder="Ingrese su contraseña"
              onChangeText={text => {
                setPassword(text);
                setPwdTyping(true);
                if (text.length < 6) {
                  setPasswordError('Contraseña debe tener minimo 6 digitos');
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
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}

            <TextInputs
              title="Confirmar Contraseña"
              placeHolder="Ingrese otra vez la contraseña"
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
              title="Rif"
              placeHolder="Ingrese rif"
              onChangeText={text => {
                // Eliminar cualquier caracter que no sea un número
                // const numericText = text.replace(/[^0-9]/g, '');
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
              // keyboardType="numeric" // Establece el teclado numérico
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
              title="Numero Telefonico"
              placeHolder="Ingrese su numero"
              onChangeText={text => {
                setPhone(text);
                setCallTyping(true);
                if (text.trim() === '') {
                  setPhoneError('Numero telefonico requerido');
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
              placeHolder="Ingrese su contraseña"
              onChangeText={text => {
                setPassword(text);
                setPwdTyping(true);
                if (text.length < 6) {
                  setPasswordError('Contraseña debe tener minimo 6 digitos');
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
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}

            <TextInputs
              title="Confirmar Contraseña"
              placeHolder="Ingrese otra vez la contraseña"
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
          color={appColors.screenBg}
          onPress={onHandleChange}
          disabled={isGetOtpDisabled}
          backgroundColor={'#4D66FF'}
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
