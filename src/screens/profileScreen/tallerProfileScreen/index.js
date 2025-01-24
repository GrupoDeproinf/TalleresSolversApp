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
import React, { useState, useEffect } from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import { phoneMo, smithaWilliams, smithaWilliamsMail } from '../../../constant';
import { commonStyles } from '../../../style/commonStyle.css';
import { external } from '../../../style/external.css';
import styles from './style.css';
import images from '../../../utils/images';
import TextInputs from '../../../commonComponents/textInputs';
import appColors from '../../../themes/appColors';
import { Call, Edit, Profile, Key, BackLeft } from '../../../utils/icon';
import { Email } from '../../../assets/icons/email';
import NavigationButton from '../../../commonComponents/navigationButton';
import { windowHeight } from '../../../themes/appConstant';
import { useValues } from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RadioButton, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import api from '../../../../axiosInstance';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/FontAwesome5';
import CheckBox from 'react-native-check-box';
import Icons4 from 'react-native-vector-icons/Entypo';

import { launchImageLibrary } from 'react-native-image-picker';
import { Buffer } from 'buffer';

import notImageFound from '../../../assets/noimageold.jpeg';

import MapComponent from '../../map'

const TallerProfileScreen = ({ navigation }) => {
  const [nameValue, setNameValue] = useState(smithaWilliams);
  const [emailValue, setEmailValue] = useState(smithaWilliamsMail);
  const [phoneValue, setPhoneValue] = useState(phoneMo);
  const [buttonColor, setButtonColor] = useState('#848688');

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

  const [selectedPrefix, setSelectedPrefix] = useState('J-'); // Default value 'J'

  const [whats, setwhats] = useState(0);
  const [whatsError, setwhatsError] = useState('');

  const [metodosPago, setMetodosPago] = useState([
    { label: 'Efectivo', value: 'efectivo', checked: false },
    { label: 'Pago Móvil', value: 'pagoMovil', checked: false },
    { label: 'Punto de venta', value: 'puntoVenta', checked: false },
    { label: 'Credito internacional', value: 'tarjetaCreditoI', checked: false },
    { label: 'Credito nacional', value: 'tarjetaCreditoN', checked: false },
    { label: 'Transferencia', value: 'transferencia', checked: false },
    { label: 'Zelle', value: 'zelle', checked: false },
    { label: 'Zinli', value: 'zinli', checked: false },
  ]);


  const [estadoSelected, setestadoSelected] = useState(''); // Default value 'J'

  const [imagePerfil, setimagePerfil] = useState("");
  const [base64, setBase64] = useState(null);
  
  const [imageFirts, setimageFirts] = useState("");

  const [lat, setlat] = useState('');
  const [lng, setlng] = useState('');



  const [estadosVenezuela, setEstadosVenezuela] = useState([
    { label: 'Seleccione un estado', value: '' },
    { label: 'Amazonas', value: 'Amazonas' },
    { label: 'Anzoátegui', value: 'Anzoátegui' },
    { label: 'Apure', value: 'Apure' },
    { label: 'Aragua', value: 'Aragua' },
    { label: 'Barinas', value: 'Barinas' },
    { label: 'Bolívar', value: 'Bolívar' },
    { label: 'Carabobo', value: 'Carabobo' },
    { label: 'Cojedes', value: 'Cojedes' },
    { label: 'Delta Amacuro', value: 'Delta Amacuro' },
    { label: 'Distrito Capital', value: 'Distrito Capital' },
    { label: 'Falcón', value: 'Falcón' },
    { label: 'Guárico', value: 'Guárico' },
    { label: 'Lara', value: 'Lara' },
    { label: 'Mérida', value: 'Mérida' },
    { label: 'Miranda', value: 'Miranda' },
    { label: 'Monagas', value: 'Monagas' },
    { label: 'Nueva Esparta', value: 'Nueva Esparta' },
    { label: 'Portuguesa', value: 'Portuguesa' },
    { label: 'Sucre', value: 'Sucre' },
    { label: 'Táchira', value: 'Táchira' },
    { label: 'Trujillo', value: 'Trujillo' },
    { label: 'Vargas', value: 'Vargas' },
    { label: 'Yaracuy', value: 'Yaracuy' },
    { label: 'Zulia', value: 'Zulia' }
  ]);


  useEffect(() => {
    getData();
  }, []);




  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      setuidUserConnected(user.uid);

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });

        // Verificar la respuesta del servidor
        if (response.status === 200) {
          const result = response.data;

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

          setwhats(result.userData.whatsapp);

          setimagePerfil(result.userData.image_perfil);

          setimageFirts(result.userData.image_perfil)

          setestadoSelected(result.userData.estado)

          if (result.userData.ubicacion != undefined){
            setlat(result.userData.ubicacion.lat)
            setlng(result.userData.ubicacion.lng)
          }

          const updatedMetodosPago = metodosPago.map(method => ({
            ...method,
            checked: result.userData.metodos_pago[method.value] || false,
          }));

          setMetodosPago(updatedMetodosPago);

          // Separar el prefijo del tipo de ID (rif) y asignarlo a los estados correspondientes
          const typeID = result.userData.rif.split('-');
          setcedula(typeID[1] || '');
          setSelectedPrefix(`${typeID[0]}-`);
        } else {
          console.error('Error en la solicitud:', response.statusText);
        }
      } catch (error) {
        if (error.response) {
          console.error(
            'Error en la solicitud:',
            error.response.data.message || error.response.statusText,
          );
        } else {
          console.error('Error en la solicitud:', error.message);
        }
      }

      try {
        // Realizar la solicitud GET utilizando Axios
        const responseUsers = await api.get('/usuarios/GetUsers', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        // Verificar que la respuesta del servidor sea exitosa
        if (responseUsers.status === 200) {
          const result2 = responseUsers.data;
          // Filtrar solo los usuarios con typeUser "Certificador"
          const certificadores = result2.filter(user => user.typeUser === "Certificador");
          console.log(certificadores);
        }
      } catch (error) {
        console.log(error);
      } 

    } catch (e) {
      // error reading value
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


  const getImageName = (url) => url.split('/').pop();

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

    setdisabledInput(true);

    if (
      isEmailValid == true &&
      isPhoneValid == true &&
      Nombre != '' &&
      cedula != 0 && estadoSelected != ''
    ) {
      const newFormatMP = metodosPago.reduce((acc, method) => {
        acc[method.value] = method.checked;
        return acc;
      }, {});

      const infoUserCreated = {
        uid: uidUserConnected,
        nombre: Nombre == undefined ? '' : Nombre,
        rif: cedula == undefined ? '' : selectedPrefix + '' + cedula,
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
        agenteAutorizado: checked == undefined ? false : checked,
        whatsapp: whats,
        metodos_pago: newFormatMP,
        estado: estadoSelected,
        base64: base64 == null || base64 == undefined || base64 == ''  ? "" : base64,
        imageTodelete: imageFirts != ""  && imageFirts != undefined ? base64 == null || base64 == undefined || base64 == ''  ? "" : getImageName(imageFirts) : "",
        ubicacion: {
          lat:lat,
          lng:lng
        }
      };

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post(
          '/usuarios/SaveTallerAll',
          infoUserCreated,
        );

        // Verificar la respuesta del servidor
        if (response.status === 201) {
          const result = response.data;

          try {
            // Realizar la solicitud GET utilizando Axios
            const responseUsers = await api.get('/usuarios/GetUsers', {
              headers: {
                'Content-Type': 'application/json',
              },
            });
      
            // Verificar que la respuesta del servidor sea exitosa
            if (responseUsers.status === 200) {
              const result2 = responseUsers.data;
              // Filtrar solo los usuarios con typeUser "Certificador"
              const certificadores = result2.filter(user => user.typeUser === "Certificador");

              // Enviar notificaciones a los certificadores que tienen token
              for (const certificador of certificadores) {
                if (certificador.token) {
                  console.log("Se debe enviar la notificacion")
                  try {
                    await api.post('/usuarios/sendNotification', {
                      token: certificador.token,
                      title: 'Notificación de Registro de Nuevo Taller',
                      body: "¡Hola! El taller " + Nombre + " ha sido registrado con éxito. Te invitamos a certificarlo y verificar si cumple con los requerimientos. ¡Gracias por tu colaboración!",
                      secretCode: "New Taller Created",
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            }
          } catch (error) {
            console.log(error);
          }

          try {
            const jsonValue = JSON.stringify(infoUserCreated);
            await AsyncStorage.setItem('@userInfo', jsonValue);
          } catch (e) {
          }

          showToast('Actualizado correctamente');
          setdisabledInput(false);
          ChangeView();
        } else {
          const errorText = response.data
            ? response.data.message
            : 'Error desconocido';
          console.error('Error al guardar el usuario:', errorText);
          setGetOtpDisabled(false);
          showToast(errorText);
        }
      } catch (error) {
        setdisabledInput(false);
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
      setdisabledInput(false);
      showToast('Error al actualizar el usuario, por favor validar formulario');
    }
  };


  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setimagePerfil(source.uri);
        setBase64(base64Data);
      }
    });
  };

  const toggleCheckBox = index => {
    const updatedMetodos = [...metodosPago];
    updatedMetodos[index].checked = !updatedMetodos[index].checked;
    setMetodosPago(updatedMetodos);
  };

  const {
    imageRTLStyle,
    viewRTLStyle,
    bgFullStyle,
    textColorStyle,
    iconColorStyle,
    isDark,
    t,
    textRTLStyle,
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
    settypeOfView('Cliente');
  };

  const handleTallerPress = () => {
    settypeOfView('Taller');
  };

  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const darkmode = isDark ? images.darkBag : images.beg;

  const ChangeView = () => {
    setshowForm(!showForm);
    setdisabledInput(false);
  };

  const CloseSesion = async () => {
    try {
      await AsyncStorage.removeItem('@userInfo');
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

  const GetCoordenadas = (location) => {
    setlat(location.latitude)
    setlng(location.longitude)
  }

  if (showForm) {
    return (
      <View
        style={[
          commonStyles.commonContainer,
          external.ph_20,
          { backgroundColor: bgFullStyle },
        ]}>
        {/* <HeaderContainer value="Perfil" /> */}

        <View
          style={[
            external.fd_row,
            external.ai_center,
            external.pt_15,
            { justifyContent: 'space-between' },
            { flexDirection: viewRTLStyle },
          ]}>
          <TouchableOpacity
            onPress={() => ChangeView()}
            style={[external.fg_half, { flexDirection: viewRTLStyle }]}>
            <View style={{ transform: [{ scale: imageRTLStyle }] }}>
              <BackLeft />
            </View>
          </TouchableOpacity>
          <Text
            style={[
              commonStyles.hederH2,
              external.as_center,
              { color: textColorStyle },
            ]}>
            {/* Perfil */}
          </Text>
        </View>

        {/* imagePerfil */}

        <View style={[external.as_center]}>

          {imagePerfil == null || imagePerfil == "" ? (
            <TouchableOpacity onPress={selectImage}>
            <Image
              resizeMode="contain"
              style={styles.imgStyle}
              source={notImageFound} // Reemplaza esto con la variable que contiene tu imagen
            />
            <View
              style={[
                styles.editIconStyle,
                { backgroundColor: '#F3F5FB' },
                { borderRadius: 100 },
                { position: 'absolute', top: 0, right: 20, margin: 0 },
              ]}
            >
              <Edit />
            </View>
          </TouchableOpacity>
          
          ) : (
            <TouchableOpacity onPress={selectImage}>
              <ImageBackground
                resizeMode="contain"
                style={[styles.imgStyle, { height: 150, width: 150 }]} // Ajusta los valores según tus necesidades
                source={{ uri: imagePerfil }} // Cambia esto a tu enlace de imagen
              >
                <View
                  style={[
                    styles.editIconStyle,
                    {
                      backgroundColor: '#F3F5FB',
                      borderRadius: 100,
                      position: 'absolute', // Posicionar absolutamente
                      top: 0, // Ajustar al fondo
                      right: 20, // Ajustar a la derecha
                      margin: 0 // Agregar margen si es necesario
                    },
                  ]}
                >
                  <Edit />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}





        </View>

        <ScrollView style={{ marginBottom: 15 }}>
          <View>
            <TextInputs
              title="Nombre y Apellido"
              placeHolder="Ingrese su nombre y apellido"
              value={Nombre}
              onChangeText={text => {
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

            <View style={{ marginTop: 5 }}>
              <Text
                style={[
                  styles.headingContainer,
                  { color: textColorStyle },
                  { textAlign: textRTLStyle },
                ]}>
                Registro de Información Fiscal (RIF)
              </Text>

              {/* Contenedor para el Picker y el TextInput */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                <View style={{ flex: 1, marginTop: -22, marginLeft: -50 }}>
                  <TextInputs
                    title=""
                    value={cedula}
                    placeHolder="Ingrese el número de RIF"
                    onChangeText={text => {
                      const numericText = text
                        .replace(/[^0-9]/g, '')
                        .slice(0, 10); // Limitar a 10 caracteres
                      if (numericText.length <= 10) {
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
                    style={{ height: 50 }} // Altura para el TextInput
                  />
                </View>
              </View>

              {cedulaError !== '' && (
                <Text style={styles.errorStyle}>{cedulaError}</Text>
              )}
            </View>

            {cedulaError !== '' && (
              <Text style={styles.errorStyle}>{cedulaError}</Text>
            )}

            <TextInputs
              title="Dirección del Taller"
              placeHolder="Ingrese su direccion"
              value={Direccion}
              onChangeText={text => {
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
              icon={<Icons name="map-marker" size={20} color="#9BA6B8" />}
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
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
                if (numericText.length <= 10) {
                  setRegComercial(numericText);
                  setRegComercialTyping(true);
                  if (numericText.trim() === '') {
                    setRegComercialError('Registro comercial es requerido');
                  } else {
                    setRegComercialError('');
                  }
                }
              }}
              onBlur={() => {
                setRegComercialTyping(false);
              }}
              keyboardType="numeric" // Establece el teclado numérico
              icon={<Icons name="id-card" size={20} color="#9BA6B8" />}
            />

            {RegComercialError !== '' && (
              <Text style={styles.errorStyle}>{RegComercialError}</Text>
            )}

            <View style={{ marginTop: 5 }}>
              {/* Texto "RIF" arriba de los inputs */}
              <Text
                style={[
                  styles.headingContainer,
                  { color: textColorStyle },
                  { textAlign: textRTLStyle },
                ]}>
                Estado
              </Text>

              {/* Contenedor para el Picker y el TextInput */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Icono al lado del Picker */}
                <Icons4 name="location" size={20} color="#9BA6B8" style={{ marginRight: 5, marginLeft: 10 }} />
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
                    }}
                  >
                    {estadosVenezuela.map((estado) => (
                      <Picker.Item key={estado.value} label={estado.label} value={estado.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={[stylesMap.container, { marginTop: 5, marginBottom:15 }]}>
            <MapComponent initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.015, longitudeDelta: 0.015 }} edit={true} 
              returnFunction = {GetCoordenadas} useThisCoo = {true} /> 
            </View>


            <TextInputs
              title="Número Telefónico"
              value={phone}
              placeholder="Ingrese su número"
              keyboardType="numeric"
              onChangeText={text => {
                // Remove non-numeric characters using regex
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 10) {
                  setPhone(numericText);
                  setCallTyping(true);

                  if (numericText.trim() === '') {
                    setPhoneError('Número telefónico requerido');
                  } else {
                    setPhoneError('');
                  }
                }
              }}
              onBlur={() => {
                validatePhone();
                setCallTyping(false);
              }}
              icon={<Icons name="phone" size={20} color="#9BA6B8" />}
            />

            {phoneError !== '' && (
              <Text style={styles.errorStyle}>{phoneError}</Text>
            )}

            <TextInputs
              title="Whatsapp"
              value={whats}
              placeHolder="Ingrese su número(4142617966)"
              keyboardType="numeric"
              onChangeText={text => {
                // Remove non-numeric characters using regex
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 10) {
                  setwhats(numericText);
                  setCallTyping(true);

                  if (numericText.trim() === '') {
                    setwhatsError('Número telefónico requerido');
                  } else {
                    setwhatsError('');
                  }
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

            <View style={{ marginTop: 5 }}>
              {/* Texto "RIF" arriba de los inputs */}
              <Text
                style={[
                  styles.headingContainer,
                  { color: textColorStyle },
                  { textAlign: textRTLStyle },
                ]}>
                Metodos de Pago
              </Text>

              <View style={{ padding: 10 }}>
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
                      <Text style={{ marginLeft: 10, color: 'black' }}>
                        {method.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

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

          <Text style={{ marginBottom: 10, color: 'black', marginTop: 15 }}>
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
            <Text style={{ color: 'black' }}>Sí</Text>

            <RadioButton
              value="no"
              status={checked === 'no' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('no')}
            />
            <Text style={{ color: 'black' }}>No</Text>
          </View>

          <TextInputs
            title="Caracteristicas del taller"
            value={Caracteristicas}
            placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
            multiline={true}
            numberOfLines={4}
            height={150}
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
            icon={<Icons name="wrench" size={20} color="#9BA6B8" />}
          />
          {CaracteristicasError !== '' && (
            <Text style={styles.errorStyle}>{CaracteristicasError}</Text>
          )}

          {/* <TextInputs
            title="Tarifa de Pago de acuerdo al tipo de Servicio Prestado***"
            placeHolder="Tarifa"
            value={Tarifa}
            onChangeText={text => {
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
            icon={<Icons name="star" size={20} color="#9BA6B8" />}
          />
          {ExperienciaError !== '' && (
            <Text style={styles.errorStyle}>{ExperienciaError}</Text>
          )}

          <TextInputs
            title="Link de Facebook"
            placeHolder="https://www.facebook.com/"
            value={LinkFacebook}
            onChangeText={text => {
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
            icon={<Icons name="facebook-square" size={20} color="#9BA6B8" />}
          />
          {LinkFacebookError !== '' && (
            <Text style={styles.errorStyle}>{LinkFacebookError}</Text>
          )}

          <TextInputs
            title="Link de Instagram"
            placeHolder="https://www.instagram.com/"
            value={LinkInstagram}
            onChangeText={text => {
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
            icon={<Icons name="instagram" size={20} color="#9BA6B8" />}
          />
          {LinkInstagramError !== '' && (
            <Text style={styles.errorStyle}>{LinkInstagramError}</Text>
          )}

          <TextInputs
            title="Link de TikTok"
            placeHolder="https://www.instagram.com/"
            value={LinkTiktok}
            onChangeText={text => {
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
            icon={<Icons2 name="tiktok" size={20} color="#9BA6B8" />}
          />
          {LinkTiktokError !== '' && (
            <Text style={styles.errorStyle}>{LinkTiktokError}</Text>
          )}

          {/* <TextInputs
            title="Garantía del Servicio***"
            placeHolder="Ingrese su garantia"
            value={Garantia}
            onChangeText={text => {
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
            title="Seguro del taller"
            placeHolder="Ingrese su seguro"
            value={seguro}
            height={150}
            onChangeText={text => {
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
            icon={<Icons name="heart" size={20} color="#9BA6B8" />}
          />
          {seguroError !== '' && (
            <Text style={styles.errorStyle}>{seguroError}</Text>
          )}

        </ScrollView>

        <View>
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
              backgroundColor={disabledInput ? '#848688' : '#2D3261'}
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
        style={[
          commonStyles.commonContainer,
          { backgroundColor: bgFullStyle, flex: 1 },
        ]}>
        {/* <View style={[styles.container, {flex: 1}]}>
          <View
            style={[
              external.ai_center,
              external.js_center,
              external.as_center,
              {flex: 1, justifyContent: 'center', alignItems: 'center'},
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
        </View> */}

        <View
          style={[
            styles.flexView,
            { flex: 1, justifyContent: 'center', alignItems: 'center' },
          ]}>
          <View
            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Image
              source={require('../../../assets/solverslogo.png')} // Asegúrate de que la ruta sea correcta
              style={{ width: 100, height: 100, marginBottom: 20 }} // Aumentar el tamaño de la imagen y agregar marginBottom
              resizeMode="contain" // Esto asegura que la imagen mantenga sus proporciones
            />

            <Text
              style={[
                styles.bagIsEmptyText,
                { color: textColorStyle, textAlign: 'center' },
              ]}>
              Su taller ha sido registrado parcialmente.
            </Text>

            <Text style={[styles.bagisEmptySomething, { textAlign: 'center' }]}>
              ¡Ya casi está! Solo completa tu perfil y pronto te visitaremos
              para darte el visto bueno.
            </Text>
          </View>

          <View style={{ width: '100%' }}>
            <NavigationButton
              title="Continuar Registro"
              backgroundColor={'#2D3261'}
              color={appColors.screenBg}
              onPress={() => ChangeView()}
            />
          </View>

          <View style={{ width: '100%', marginBottom: 25, marginTop: 10 }}>
            <NavigationButton
              title="Cerrar Sesión"
              backgroundColor={'#848688'}
              color={'#051E47'}
              onPress={() => CloseSesion()}
            />
          </View>
        </View>
      </View>
    );
  }
};


const stylesMap = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', },});

export default TallerProfileScreen;
