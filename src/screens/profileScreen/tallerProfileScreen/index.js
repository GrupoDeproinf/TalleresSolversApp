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
import {Call, Edit, Profile, Key, BackLeft} from '../../../utils/icon';
import {Email} from '../../../assets/icons/email';
import NavigationButton from '../../../commonComponents/navigationButton';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {RadioButton, Button} from 'react-native-paper';

const TallerProfileScreen = ({navigation}) => {
  const [nameValue, setNameValue] = useState(smithaWilliams);
  const [emailValue, setEmailValue] = useState(smithaWilliamsMail);
  const [phoneValue, setPhoneValue] = useState(phoneMo);
  const [buttonColor, setButtonColor] = useState('#d1d6de');

  const [showForm, setshowForm] = useState(false);
  const [uidUserConnected, setuidUserConnected] = useState(false);

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

  const [Direccion, setDireccion] = useState('');
  const [DireccionError, setDireccionError] = useState('');
  const [DireccionTyping, setDireccionTyping] = useState(false);

  const [RegComercial, setRegComercial] = useState('');
  const [RegComercialError, setRegComercialError] = useState('');
  const [RegComercialTyping, setRegComercialTyping] = useState(false);

  const [Caracteristicas, setCaracteristicas] = useState('');
  const [CaracteristicasError, setCaracteristicasError] = useState('');
  const [CaracteristicasTyping, setCaracteristicasTyping] = useState(false);

  const [Tarifa, setTarifa] = useState('');
  const [TarifaError, setTarifaError] = useState('');
  const [TarifaTyping, setTarifaTyping] = useState(false);

  const [Experiencia, setExperiencia] = useState('');
  const [ExperienciaError, setExperienciaError] = useState('');
  const [ExperienciaTyping, setExperienciaTyping] = useState(false);

  const [LinkFacebook, setLinkFacebook] = useState('');
  const [LinkFacebookError, setLinkFacebookError] = useState('');
  const [LinkFacebookTyping, setLinkFacebookTyping] = useState(false);

  const [LinkInstagram, setLinkInstagram] = useState('');
  const [LinkInstagramError, setLinkInstagramError] = useState('');
  const [LinkInstagramTyping, setLinkInstagramTyping] = useState(false);

  const [LinkTiktok, setLinkTiktok] = useState('');
  const [LinkTiktokError, setLinkTiktokError] = useState('');
  const [LinkTiktokTyping, setLinkTiktokTyping] = useState(false);

  const [Garantia, setGarantia] = useState('');
  const [GarantiaError, setGarantiaError] = useState('');
  const [GarantiaTyping, setGarantiaTyping] = useState(false);

  const [seguro, setseguro] = useState('');
  const [seguroError, setseguroError] = useState('');
  const [seguroTyping, setseguroTyping] = useState(false);

  // *******************************************

  const [checked, setChecked] = useState('no'); // Valor inicial
  const [disabledInput, setdisabledInput] = useState(false); 

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log('valor del storage12345555', user.uid);
      setuidUserConnected(user.uid);

      try {
        // Hacer la solicitud POST
        const response = await fetch(
          'http://desarrollo-test.com/api/usuarios/getUserByUid',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({uid: user.uid}), // Convertir los datos a JSON
          },
        );

        // Verificar la respuesta del servidor
        if (response.ok) {
          const result = await response.json();
          console.log('Emailllllll', result.userData.email); // Aquí puedes manejar la respuesta

          setNombre(result.userData.nombre);
          setcedula(result.userData.rif);
          setEmail(result.userData.email);
          setPhone(result.userData.phone);

          setDireccion(result.userData.Direccion);
          setRegComercial(result.userData.RegComercial);
          setCaracteristicas(result.userData.Caracteristicas);
          setTarifa(result.userData.Tarifa);
          setExperiencia(result.userData.Experiencia);
          setLinkFacebook(result.userData.LinkFacebook);
          setLinkInstagram(result.userData.LinkInstagram);
          setLinkTiktok(result.userData.LinkTiktok);
          setGarantia(result.userData.Garantia);
          setseguro(result.userData.seguro);
        } else {
          console.error('Error en la solicitud:', response.statusText);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error);
      }
    } catch (e) {
      // error reading value
      console.log(e);
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

    setdisabledInput(true)


    if (
      isEmailValid == true &&
      isPhoneValid == true &&
      Nombre != '' &&
      cedula != 0
    ) {
      const infoUserCreated = {
        uid: uidUserConnected,
        nombre: Nombre == undefined ? '' : Nombre,
        rif: cedula == undefined ? '' : cedula,
        phone: phone == undefined ? '' : phone,
        typeUser: 'Taller',
        email: email == undefined ? '' : email,
        status: 'En espera por aprobación',
        Direccion: Direccion == undefined ? '' : Direccion,
        RegComercial: RegComercial == undefined ? '' : RegComercial,
        Caracteristicas: Caracteristicas == undefined ? '' : Caracteristicas,
        Tarifa: Tarifa == undefined ? '' : Tarifa,
        Experiencia: Experiencia == undefined ? '' : Experiencia,
        LinkFacebook: LinkFacebook == undefined ? '' : LinkFacebook,
        LinkInstagram: LinkInstagram == undefined ? '' : LinkInstagram,
        LinkTiktok: LinkTiktok == undefined ? '' : LinkTiktok,
        Garantia: Garantia == undefined ? '' : Garantia,
        seguro: seguro == undefined ? '' : seguro,
        agenteAutorizado: checked == undefined ? false : checked
      };

      console.log(infoUserCreated);
      console.log('Aquiiii1234');

      try {
        // Hacer la solicitud POST
        const response = await fetch(
          'http://desarrollo-test.com/api/usuarios/SaveTallerAll',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(infoUserCreated), // Convertir los datos a JSON
          },
        );

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

          showToast('Actualizado correctamente');
          setdisabledInput(false)
          ChangeView();
          // navigation.goBack('');
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
          setdisabledInput(false)
          console.error('Error en la solicitud:', response.statusText);
        }
      } catch (error) {
        setdisabledInput(false)
        console.error('Error en la solicitud:', error);
      }
    } 
    else {
      setdisabledInput(false)
      showToast('Error al actualizar el usuario, por favor validar formulario');
    }
  };

  const {
    imageRTLStyle,
    viewRTLStyle,
    bgFullStyle,
    textColorStyle,
    iconColorStyle,
    isDark,
    t,
  } = useValues();

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

  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const darkmode = isDark ? images.darkBag : images.beg;

  const ChangeView = () => {
    setshowForm(!showForm);
    setdisabledInput(false)
  };

  const CloseSesion = async () => {
    try {
      await AsyncStorage.removeItem('@userInfo');
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }

    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (showForm) {
    return (
      <View
        style={[
          commonStyles.commonContainer,
          external.ph_20,
          {backgroundColor: bgFullStyle},
        ]}>
        {/* <HeaderContainer value="Perfil" /> */}

        <View
          style={[
            external.fd_row,
            external.ai_center,
            external.pt_15,
            {justifyContent: 'space-between'},
            {flexDirection: viewRTLStyle},
          ]}>
          <TouchableOpacity
            onPress={() => ChangeView()}
            style={[external.fg_half, {flexDirection: viewRTLStyle}]}>
            <View style={{transform: [{scale: imageRTLStyle}]}}>
              <BackLeft />
            </View>
          </TouchableOpacity>
          <Text
            style={[
              commonStyles.hederH2,
              external.as_center,
              {color: textColorStyle},
            ]}>
            {/* Perfil */}
          </Text>
        </View>

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
              title="Registro de Información Fiscal (RIF)"
              value={cedula}
              placeHolder="Ingrese su RIF"
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
              title="Dirección del Taller"
              placeHolder="Ingrese su direccion"
              value={Direccion}
              onChangeText={text => {
                console.log(text);
                setDireccion(text);
                setDireccionTyping(true);
                if (text.trim() === '') {
                  setDireccionError('Direccion es requerido');
                } else {
                  setDireccionError('');
                }
              }}
              onBlur={() => {
                setDireccionTyping(false);
              }}
              icon={
                <Email
                  color={DireccionTyping ? '#051E47' : appColors.subtitle}
                />
              }
            />
            {DireccionError !== '' && (
              <Text style={styles.errorStyle}>{DireccionError}</Text>
            )}

            <TextInputs
              title="Registro Comercial"
              value={RegComercial}
              placeHolder="Ingrese su Registro Comercial"
              onChangeText={text => {
                // Eliminar cualquier caracter que no sea un número
                const numericText = text.replace(/[^0-9]/g, '');
                setRegComercial(numericText);
                setRegComercialTyping(true);
                if (numericText.trim() === '') {
                  setRegComercialError('Registro comercial es requerido');
                } else {
                  setRegComercialError('');
                }
              }}
              onBlur={() => {
                setRegComercialTyping(false);
              }}
              keyboardType="numeric" // Establece el teclado numérico
              icon={
                <Email
                  color={RegComercialTyping ? '#051E47' : appColors.subtitle}
                />
              }
            />

            {RegComercialError !== '' && (
              <Text style={styles.errorStyle}>{RegComercialError}</Text>
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

            <TextInputs
              title="Email"
              value={email}
              editable={false}
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
          </View>

          <Text style={{marginBottom: 10, color: 'black', marginTop: 15}}>
            ¿Es un Agente Autorizado?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            }}>
            <RadioButton
              value="si"
              status={checked === 'si' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('si')}
            />
            <Text style={{color: 'black'}}>Sí</Text>

            <RadioButton
              value="no"
              status={checked === 'no' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('no')}
            />
            <Text style={{color: 'black'}}>No</Text>
          </View>

          <TextInputs
            title="Caracteristicas del taller"
            value={Caracteristicas}
            placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
            multiline={true}
            numberOfLines={4}
            height={1000}
            style={{height: 1000, marginBottom: 50}}
            onChangeText={text => {
              setCaracteristicas(text);
              setCaracteristicasTyping(true);
              if (text.trim() === '') {
                setCaracteristicasError('Caracteristicas es requerido');
              } else {
                setCaracteristicasError('');
              }
            }}
            onBlur={() => {
              validateCaracteristicas();
              setCaracteristicasTyping(false);
            }}
            icon={
              <Email
                color={CaracteristicasTyping ? '#051E47' : appColors.subtitle}
              />
            }
          />
          {CaracteristicasError !== '' && (
            <Text style={styles.errorStyle}>{CaracteristicasError}</Text>
          )}

          {/* <TextInputs
            title="Tarifa de Pago de acuerdo al tipo de Servicio Prestado***"
            placeHolder="Tarifa"
            value={Tarifa}
            onChangeText={text => {
              console.log(text);
              setTarifa(text);
              setTarifaTyping(true);
              if (text.trim() === '') {
                setTarifaError('Tarifa es requerida');
              } else {
                setTarifaError('');
              }
            }}
            onBlur={() => {
              setTarifaTyping(false);
            }}
            icon={
              <Email color={TarifaTyping ? '#051E47' : appColors.subtitle} />
            }
          />
          {TarifaError !== '' && (
            <Text style={styles.errorStyle}>{TarifaError}</Text>
          )} */}

          <TextInputs
            title="Tiempo de experiencia en el área."
            placeHolder="Tiempo de experiencia"
            value={Experiencia}
            onChangeText={text => {
              console.log(text);
              setExperiencia(text);
              setExperienciaTyping(true);
              if (text.trim() === '') {
                setExperienciaError('Experiencia es requerida');
              } else {
                setExperienciaError('');
              }
            }}
            onBlur={() => {
              setExperienciaTyping(false);
            }}
            icon={
              <Email
                color={ExperienciaTyping ? '#051E47' : appColors.subtitle}
              />
            }
          />
          {ExperienciaError !== '' && (
            <Text style={styles.errorStyle}>{ExperienciaError}</Text>
          )}

          <TextInputs
            title="Link de Facebook"
            placeHolder="https://www.facebook.com/"
            value={LinkFacebook}
            onChangeText={text => {
              console.log(text);
              setLinkFacebook(text);
              // setLinkFacebookTyping(true);
              // if (text.trim() === '') {
              //   setLinkFacebookError('LinkFacebook es requerida');
              // } else {
              //   setLinkFacebookError('');
              // }
            }}
            onBlur={() => {
              // setLinkFacebookTyping(false);
            }}
            icon={
              <Email
                color={LinkFacebookTyping ? '#051E47' : appColors.subtitle}
              />
            }
          />
          {LinkFacebookError !== '' && (
            <Text style={styles.errorStyle}>{LinkFacebookError}</Text>
          )}

          <TextInputs
            title="Link de Instagram"
            placeHolder="https://www.instagram.com/"
            value={LinkInstagram}
            onChangeText={text => {
              console.log(text);
              setLinkInstagram(text);
              // setLinkInstagramTyping(true);
              // if (text.trim() === '') {
              //   setLinkInstagramError('LinkInstagram es requerida');
              // } else {
              //   setLinkInstagramError('');
              // }
            }}
            onBlur={() => {
              // setLinkInstagramTyping(false);
            }}
            icon={
              <Email
                color={LinkInstagramTyping ? '#051E47' : appColors.subtitle}
              />
            }
          />
          {LinkInstagramError !== '' && (
            <Text style={styles.errorStyle}>{LinkInstagramError}</Text>
          )}

          <TextInputs
            title="Link de TikTok"
            placeHolder="https://www.instagram.com/"
            value={LinkTiktok}
            onChangeText={text => {
              console.log(text);
              setLinkTiktok(text);
              // setLinkTiktokTyping(true);
              // if (text.trim() === '') {
              //   setLinkTiktokError('LinkTiktok es requerida');
              // } else {
              //   setLinkTiktokError('');
              // }
            }}
            onBlur={() => {
              // setLinkTiktokTyping(false);
            }}
            icon={
              <Email
                color={LinkTiktokTyping ? '#051E47' : appColors.subtitle}
              />
            }
          />
          {LinkTiktokError !== '' && (
            <Text style={styles.errorStyle}>{LinkTiktokError}</Text>
          )}

          {/* <TextInputs
            title="Garantía del Servicio***"
            placeHolder="Ingrese su garantia"
            value={Garantia}
            onChangeText={text => {
              console.log(text);
              setGarantia(text);
              setGarantiaTyping(true);
              if (text.trim() === '') {
                setGarantiaError('Garantia es requerida');
              } else {
                setGarantiaError('');
              }
            }}
            onBlur={() => {
              setGarantiaTyping(false);
            }}
            icon={
              <Email color={GarantiaTyping ? '#051E47' : appColors.subtitle} />
            }
          />
          {GarantiaError !== '' && (
            <Text style={styles.errorStyle}>{GarantiaError}</Text>
          )} */}

          <TextInputs
            title="Seguro del taller**"
            placeHolder="Ingrese su seguro"
            value={seguro}
            onChangeText={text => {
              console.log(text);
              setseguro(text);
              setseguroTyping(true);
              if (text.trim() === '') {
                setseguroError('seguro es requerida');
              } else {
                setseguroError('');
              }
            }}
            onBlur={() => {
              setseguroTyping(false);
            }}
            icon={
              <Email color={seguroTyping ? '#051E47' : appColors.subtitle} />
            }
          />
          {seguroError !== '' && (
            <Text style={styles.errorStyle}>{seguroError}</Text>
          )}
        </ScrollView>

        <View style={[external.fx_1, external.js_end, external.Pb_30]}>
          <View
            style={{
              backgroundColor: buttonColor,
              borderRadius: windowHeight(20),
              marginBottom: 15,
            }}>
            <NavigationButton
              title="Guardar Cambios"
              onPress={() => onHandleChange()}
              disabled={disabledInput}
              backgroundColor={disabledInput ? '#D1D6DE' : '#4D66FF'}
              color={disabledInput ? '#051E47' : appColors.screenBg}
            />
          </View>
        </View>
      </View>
    );
  }

  if (!showForm) {
    return (
      <View
        style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
        <View style={[styles.container]}>
          <View
            style={[
              external.ai_center,
              external.js_center,
              external.as_center,
            ]}>
            <Text
              style={[
                commonStyles.titleText19,
                external.ti_center,
                {color: textColorStyle, marginLeft: '0%'},
              ]}>
              Perfil de Taller
            </Text>
          </View>
        </View>

        <View style={styles.flexView}>
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <Image
              source={require('../../../assets/solversLogo.png')} // Asegúrate de que la ruta sea correcta
              style={{width: 100, height: 100, marginBottom: 20}} // Aumentar el tamaño de la imagen y agregar marginBottom
              resizeMode="contain" // Esto asegura que la imagen mantenga sus proporciones
            />

            <Text
              style={[
                styles.bagIsEmptyText,
                {color: textColorStyle, textAlign: 'center'},
              ]}>
              Su taller ha sido registrado parcialmente.
            </Text>

            <Text style={[styles.bagisEmptySomething, {textAlign: 'center'}]}>
              ¡Ya casi está! Solo completa tu perfil y pronto te visitaremos
              para darte el visto bueno.
            </Text>
          </View>

          <View style={{width: '100%'}}>
            <NavigationButton
              title="Continuar Registro"
              backgroundColor={'#4D66FF'}
              color={appColors.screenBg}
              onPress={() => ChangeView()}
            />
          </View>

          <View style={{width: '100%', marginBottom:25, marginTop:10}}>
            <NavigationButton
              title="Cerrar Sesión"
              backgroundColor={'#D1D6DE'}
              color={'#051E47'}
              onPress={() => CloseSesion()}
            />
          </View>
        </View>
      </View>
    );
  }
};

export default TallerProfileScreen;
