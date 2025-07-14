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
import { Call, Edit, Profile, Key } from '../../../utils/icon';
import { Email } from '../../../assets/icons/email';
import NavigationButton from '../../../commonComponents/navigationButton';
import { windowHeight } from '../../../themes/appConstant';
import { useValues } from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import { Picker } from '@react-native-picker/picker';
import Icons from 'react-native-vector-icons/FontAwesome'
import Icons2 from 'react-native-vector-icons/FontAwesome5'

import Icons3 from 'react-native-vector-icons/Fontisto'
import api from '../../../../axiosInstance';

import notImageFound from '../../../assets/noimageold.jpeg';
import Icons4 from 'react-native-vector-icons/Entypo';
import { Dropdown } from 'react-native-element-dropdown';

import {
  RadioButton,
  Button
} from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { Buffer } from 'buffer';

const EditProfile = ({ navigation }) => {
  const [nameValue, setNameValue] = useState(smithaWilliams);
  const [emailValue, setEmailValue] = useState(smithaWilliamsMail);
  const [phoneValue, setPhoneValue] = useState(phoneMo);
  const [buttonColor, setButtonColor] = useState('#848688');

  //

  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState(0);
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [cedulaError, setcedulaError] = useState('');
  const [NombreError, setNombreError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [iscedulaTyping, setcedulaTyping] = useState(false);
  const [NombreTyping, setNombreTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);

  const [NameTaller, setNameTaller] = useState('');
  const [isSelected, setSelection] = useState(false);

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

  const [checked, setChecked] = useState('no'); // Valor i

  const [disabledInput, setdisabledInput] = useState(false);

  const navigation2 = useNavigation();
  const route = useRoute();

  const [isCheckedName, setisCheckedName] = useState(false);
  const [isRif, setisRif] = useState(false);

  const [isCheckedDireccion, setisCheckedDireccion] = useState(false);
  const [isCheckedRegistroComercial, setisCheckedRegistroComercial] =
    useState(false);
  const [isCheckedTelefono, setisCheckedTelefono] = useState(false);
  const [isCheckedEmail, setisCheckedEmail] = useState(false);
  const [isCheckedCaracteristicas, setisCheckedCaracteristicas] =
    useState(false);
  const [isCheckedExperiencia, setisCheckedExperiencia] = useState(false);
  const [isCheckedFacebook, setisCheckedFacebook] = useState(false);
  const [isCheckedInstagram, setisCheckedInstagram] = useState(false);
  const [isCheckedTiktok, setisCheckedTiktok] = useState(false);
  const [isCheckedSeguro, setisCheckedSeguro] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [uidprofile, setuidprofile] = useState('');
  const [typeUser, settypeUser] = useState('');

  const [selectedPrefix, setSelectedPrefix] = useState('J-'); // Default value 'J'
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(false);

  // *******************************************

  const [imagePerfil, setimagePerfil] = useState("");
  const [base64, setBase64] = useState(null);

  const [imageFirts, setimageFirts] = useState("");

  const [estadoSelected, setestadoSelected] = useState(''); 

  
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

  const prefixOptions = [
    { label: 'C-', value: 'C-' },
    { label: 'E-', value: 'E-' },
    { label: 'G-', value: 'G-' },
    { label: 'J-', value: 'J-' },
    { label: 'P-', value: 'P-' },
    { label: 'V-', value: 'V-' },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('valor del storage1234', user.cedula);

      setuidprofile(user.uid);
      settypeUser(user.typeUser);

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });

        // Verificar la respuesta del servidor
        const result = response.data;

        if (result.message === 'Usuario encontrado') {
          console.log('Este es el usuario encontrado', result.userData);

          setNameTaller(result.userData.nombre);

          setNombre(result.userData.nombre || '');

          if (result.userData.typeUser === 'Taller') {
            let typeID = result.userData.rif.split('-');
            setcedula(typeID[1] || '');
            setSelectedPrefix(typeID[0] + '-');
          } else if (result.userData.typeUser === 'Cliente') {
            let typeID = result.userData.cedula.split('-');
            console.log('typeID[1]', typeID[1]);
            setcedula(typeID[1] || '');
            setSelectedPrefix(typeID[0] + '-');
          }

          setEmail(result.userData.email || '');
          setPhone(result.userData.phone || '');
          setDireccion(result.userData.Direccion || '');
          setRegComercial(result.userData.RegComercial || '');
          setCaracteristicas(result.userData.Caracteristicas || '');
          setTarifa(result.userData.Tarifa || '');
          setExperiencia(result.userData.Experiencia || '');
          setLinkFacebook(result.userData.LinkFacebook || '');
          setLinkInstagram(result.userData.LinkInstagram || '');
          setLinkTiktok(result.userData.LinkTiktok || '');
          setGarantia(result.userData.Garantia || '');
          setseguro(result.userData.seguro || '');

          setimagePerfil(result.userData.image_perfil || '');

          setimageFirts(result.userData.image_perfil || '')

          setestadoSelected(result.userData.estado || '')

        } else {
          console.warn('Usuario no encontrado');
        }
      } catch (error) {
        if (error.response) {
          console.error('Error en la solicitud:', error.response.statusText);
        } else {
          console.error('Error en la solicitud:', error.message);
        }
      }


      // setinfoUser(user)
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  const getImageName = (url) => url.split('/').pop();

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
    console.log("Aquiiii");
    console.log(typeUser);
  
    setGetOtpDisabled(true);
  
    if (typeUser == "Cliente") {
      const isPhoneValid = validatePhone();
  
      if (isPhoneValid == true && Nombre != '' && cedula != 0 && cedula != '') {
        try {
          // Validar si el número de teléfono ya existe en el servidor
          const phoneValidationResponse = await api.post('/home/validatePhone', {
            phone,
            uid: uidprofile,
          });
  
          const emailValidationResponse = await api.post('/home/validateEmail', {
            email,
            uid: uidprofile,
          });
  
          if (
            phoneValidationResponse.status === 200 &&
            phoneValidationResponse.data.valid === true &&
            emailValidationResponse.status === 200 &&
            emailValidationResponse.data.valid === true
          ) {
            const infoUserCreated = {
              Nombre: Nombre,
              cedula: selectedPrefix + "" + cedula,
              phone: phone,
              typeUser: 'Cliente',
              email: email,
              uid: uidprofile,
              estado: estadoSelected,
              base64: base64 == null || base64 == undefined || base64 == '' ? "" : base64,
              imageTodelete: imageFirts != "" && imageFirts != undefined ? base64 == null || base64 == undefined || base64 == '' ? "" : getImageName(imageFirts) : ""
            };
  
            console.log(infoUserCreated);
  
            try {
              // Hacer la solicitud POST utilizando Axios
              const response = await api.post('/usuarios/UpdateClient', infoUserCreated);
  
              // Verificar la respuesta del servidor
              console.log(response);
  
              if (response.status === 200) {
                const result = response.data;
                console.log(result);
  
                try {
                  const jsonValue = JSON.stringify(infoUserCreated);
                  console.log(jsonValue);
                  await AsyncStorage.setItem('@userInfo', jsonValue);
                } catch (e) {
                  console.error('Error al guardar en AsyncStorage:', e);
                }
  
                setNombre('');
                setcedula(0);
                setEmail('');
                setPhone(0);
                setSelectedPrefix('J-');
  
                showToast('Usuario actualizado exitosamente');
                setGetOtpDisabled(false);
                navigation.goBack('');
              } else {
                const errorText = response.data;
                console.error('Error al guardar el usuario:', errorText.message || errorText);
                setGetOtpDisabled(false);
                showToast(errorText.message || 'Error inesperado en la actualización');
              }
            } catch (error) {
              if (error.response) {
                console.error('Error en la solicitud:', error.response.data.message || error.response.statusText);
                setGetOtpDisabled(false);
                showToast(error.response.data.message || 'Error inesperado en la actualización');
              } else {
                console.error('Error en la solicitud:', error.message);
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
              error.response.data.message || error.response.statusText
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
    } else if (typeUser == "Taller") {
      if (Nombre != '' && cedula != 0) {
        try {
          // Validar si el número de teléfono ya existe en el servidor
          const phoneValidationResponse = await api.post('/home/validatePhone', {
            phone,
            uid: uidprofile,
          });
  
          const emailValidationResponse = await api.post('/home/validateEmail', {
            email,
            uid: uidprofile,
          });
  
          if (
            phoneValidationResponse.status === 200 &&
            phoneValidationResponse.data.valid === true &&
            emailValidationResponse.status === 200 &&
            emailValidationResponse.data.valid === true
          ) {
            const infoUserCreated = {
              uid: uidprofile,
              nombre: Nombre == undefined ? '' : Nombre,
              rif: cedula == undefined ? '' : selectedPrefix + '' + cedula,
              phone: phone == undefined ? '' : phone,
              typeUser: 'Taller',
              email: email == undefined ? '' : email,
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
              // Hacer la solicitud POST utilizando Axios
              const response = await api.post('/usuarios/UpdateTaller', infoUserCreated);
  
              if (response.status === 200) {
                const result = response.data;
                console.log(result);
  
                try {
                  const jsonValue = JSON.stringify(infoUserCreated);
                  console.log(jsonValue);
                  await AsyncStorage.setItem('@userInfo', jsonValue);
                } catch (e) {
                  console.error('Error al guardar en AsyncStorage:', e);
                }
  
                showToast('Taller actualizado exitosamente');
                setGetOtpDisabled(false);
                navigation.goBack('');
              } else {
                const errorText = response.data;
                console.error('Error al guardar el taller:', errorText.message || errorText);
                setGetOtpDisabled(false);
                showToast(errorText.message || 'Error inesperado en la actualización');
              }
            } catch (error) {
              setGetOtpDisabled(false);
              if (error.response) {
                console.error('Error en la solicitud:', error.response.data.message || error.response.statusText);
                showToast(error.response.data.message || 'Error inesperado en la actualización');
              } else {
                console.error('Error en la solicitud:', error.message);
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
              error.response.data.message || error.response.statusText
            );
            showToast(error.response.data.message || 'Error en la solicitud');
          } else {
            console.error('Error en la solicitud:', error.message);
            showToast('Error en la solicitud');
          }
        }
      } else {
        setGetOtpDisabled(false);
        showToast('Error al actualizar el usuario, por favor validar formulario');
      }
    }
  };



  const { bgFullStyle, textColorStyle, iconColorStyle, isDark, t, textRTLStyle } = useValues();

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


  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        { backgroundColor: bgFullStyle },
      ]}>
      <HeaderContainer value="Mi cuenta" />

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


      {/* Formulario para editar un taller */}
      {typeUser == 'Taller' ? (
        <ScrollView style={{ marginBottom: 15 }}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Nombre y Apellido"
                editable={true}
                value={Nombre}
                textDecorationLine={isCheckedName ? 'line-through' : 'none'}
                onChangeText={text => {
                  setNombre(text);
                  setNombreError(
                    text.trim() === '' ? 'Nombre es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="user" size={20} color="#9BA6B8" />}
              />
            </View>

            {/* Registro de Información Fiscal (RIF) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Select para elegir "J-" o "G-" */}
              <View
                style={{
                  width: 80,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: 5,
                  borderColor: '#ddd',
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  marginRight: 5,
                  height: 50,
                  justifyContent: 'center',
                  paddingHorizontal: 0,
                }}
              >
                <Dropdown
                  style={{height: 50, backgroundColor: 'transparent', width: '100%', paddingLeft: 15}}
                  data={prefixOptions}
                  labelField="label"
                  valueField="value"
                  value={selectedPrefix}
                  onChange={item => setSelectedPrefix(item.value)}
                  placeholder="Pref."
                  maxHeight={250}
                  itemTextStyle={{ color: 'black' }}
                  selectedTextStyle={{ color: 'black' }}
                  containerStyle={{ borderRadius: 10, width: 80 }}
                  dropdownPosition="auto"
                  showsVerticalScrollIndicator={false}
                  autoScroll={false}
                />
              </View>

              {/* TextInput para el número de RIF */}
              <View style={{ flex: 1, marginTop: -22, marginLeft: 0 }}>
                <TextInputs
                  title=""
                  value={cedula}
                  placeHolder="Ingrese su cedula"
                  onChangeText={text => {
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
                  keyboardType="numeric"
                  icon={<Icons name="id-card-o" size={20} color="#9BA6B8" />}
                  style={{ height: 50 }} // Altura para el TextInput
                />
              </View>
            </View>

            {/* Dirección del Taller */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Dirección del Taller"
                placeHolder="Ingrese su direccion"
                textDecorationLine={
                  isCheckedDireccion ? 'line-through' : 'none'
                }
                editable={true}
                value={Direccion}
                onChangeText={text => {
                  setDireccion(text);
                  setDireccionError(
                    text.trim() === '' ? 'Direccion es requerida' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="map-marker" size={20} color="#9BA6B8" />}
              />
              {DireccionError !== '' && (
                <Text style={styles.errorStyle}>{DireccionError}</Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Registro Comercial"
                value={RegComercial}
                textDecorationLine={
                  isCheckedRegistroComercial ? 'line-through' : 'none'
                }
                editable={true}
                placeHolder="Ingrese su Registro Comercial"
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setRegComercial(numericText);
                  setRegComercialError(
                    numericText.trim() === ''
                      ? 'Registro comercial es requerido'
                      : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="id-card" size={20} color="#9BA6B8" />}
                keyboardType="numeric"
              />
              {RegComercialError !== '' && (
                <Text style={styles.errorStyle}>{RegComercialError}</Text>
              )}
            </View>

            {/* Número Telefónico */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Número Telefónico"
                value={phone}
                textDecorationLine={isCheckedTelefono ? 'line-through' : 'none'}
                editable={true}
                placeholder="Ingrese su número"
                keyboardType="numeric"
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setPhone(numericText);
                  setPhoneError(
                    numericText.trim() === ''
                      ? 'Número telefónico requerido'
                      : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="phone" size={20} color="#9BA6B8" />}
              />
              {phoneError !== '' && (
                <Text style={styles.errorStyle}>{phoneError}</Text>
              )}
            </View>

            {/* Email */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Email"
                value={email}
                editable={false}
                textDecorationLine={isCheckedEmail ? 'line-through' : 'none'}
                placeHolder="Ingrese su email"
                onChangeText={text => {
                  setEmail(text);
                  setEmailError(text.trim() === '' ? 'Email es requerido' : '');
                }}
                onBlur={() => { }}
                icon={<Icons name="file" size={20} color="#9BA6B8" />}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Caracteristicas del taller"
                editable={true}
                textDecorationLine={
                  isCheckedCaracteristicas ? 'line-through' : 'none'
                }
                value={Caracteristicas}
                placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
                multiline={true}
                numberOfLines={4}
                onChangeText={text => {
                  setCaracteristicas(text);
                  setCaracteristicasError(
                    text.trim() === '' ? 'Caracteristicas es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="wrench" size={20} color="#9BA6B8" />}
              />
            </View>


            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
                marginTop: -15,
              }}>

              <Text
                style={{
                  marginBottom: 10,
                  color: 'black',
                  marginTop: 35,
                }}>
                ¿Es un Agente Autorizado?
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 25,
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
            </View>



            {/* Tiempo de experiencia */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Tiempo de experiencia"
                editable={true}
                textDecorationLine={
                  isCheckedExperiencia ? 'line-through' : 'none'
                }
                value={Experiencia}
                placeHolder="Ingrese su tiempo de experiencia"
                onChangeText={text => {
                  setExperiencia(text);
                  setExperienciaError(
                    text.trim() === '' ? 'Experiencia es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="star" size={20} color="#9BA6B8" />}
              />
            </View>

            {/* Enlaces a Redes Sociales */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Link de Facebook"
                textDecorationLine={isCheckedFacebook ? 'line-through' : 'none'}
                editable={true}
                value={LinkFacebook}
                placeHolder="Ingrese el enlace a su Facebook"
                onChangeText={text => {
                  setLinkFacebook(text);
                  setLinkFacebookError(
                    text.trim() === '' ? 'Link de Facebook es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="facebook-square" size={20} color="#9BA6B8" />}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Link de Instagram"
                editable={true}
                textDecorationLine={
                  isCheckedInstagram ? 'line-through' : 'none'
                }
                value={LinkInstagram}
                placeHolder="Ingrese el enlace a su Instagram"
                onChangeText={text => {
                  setLinkInstagram(text);
                  setLinkInstagramError(
                    text.trim() === '' ? 'Link de Instagram es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="instagram" size={20} color="#9BA6B8" />}
              />
              {LinkInstagramError !== '' && (
                <Text style={styles.errorStyle}>{LinkInstagramError}</Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Link de TikTok"
                editable={true}
                value={LinkTiktok}
                textDecorationLine={isCheckedTiktok ? 'line-through' : 'none'}
                placeHolder="Ingrese el enlace a su TikTok"
                onChangeText={text => {
                  setLinkTiktok(text);
                  setLinkTiktokError(
                    text.trim() === '' ? 'Link de TikTok es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons2 name="tiktok" size={20} color="#9BA6B8" />}
              />
            </View>

            {/* Seguro */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Seguro"
                editable={true}
                value={seguro}
                placeHolder="Ingrese su seguro"
                textDecorationLine={isCheckedSeguro ? 'line-through' : 'none'}
                onChangeText={text => {
                  setseguro(text);
                  setseguroError(
                    text.trim() === '' ? 'Seguro es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="heart" size={20} color="#9BA6B8" />}
              />
              {seguroError !== '' && (
                <Text style={styles.errorStyle}>{seguroError}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      ) : null}

      {/* Formulario para editar un cliente */}
      {typeUser == 'Cliente' ? (
        <ScrollView style={{ marginBottom: 15 }}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Nombre y Apellido"
                editable={true}
                value={Nombre}
                textDecorationLine={isCheckedName ? 'line-through' : 'none'}
                onChangeText={text => {
                  setNombre(text);
                  setNombreError(
                    text.trim() === '' ? 'Nombre es requerido' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="user" size={20} color="#9BA6B8" />}
              />
            </View>

            <View style={{ marginTop: 5 }}>
              {/* Texto "RIF" arriba de los inputs */}
              <Text
                style={[
                  styles.headingContainer,
                  { color: textColorStyle },
                  { textAlign: textRTLStyle },
                ]}>
                Cedula
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Select para elegir "J-" o "G-" */}
              <View
                style={{
                  width: 80,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: 5,
                  borderColor: '#ddd',
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  marginRight: 5,
                  height: 50,
                  justifyContent: 'center',
                  paddingHorizontal: 0,
                }}
              >
                <Dropdown
                  style={{height: 50, backgroundColor: 'transparent', width: '100%', paddingLeft: 15}}
                  data={prefixOptions}
                  labelField="label"
                  valueField="value"
                  value={selectedPrefix}
                  onChange={item => setSelectedPrefix(item.value)}
                  placeholder="Pref."
                  maxHeight={250}
                  itemTextStyle={{ color: 'black' }}
                  selectedTextStyle={{ color: 'black' }}
                  containerStyle={{ borderRadius: 10, width: 80 }}
                  dropdownPosition="auto"
                  showsVerticalScrollIndicator={false}
                  autoScroll={false}
                />
              </View>

              {/* TextInput para el número de RIF */}
              <View style={{ flex: 1, marginTop: -22, marginLeft: 0 }}>
                <TextInputs
                  fullWidth={350}
                  title=""
                  value={cedula}
                  placeHolder="Ingrese su cedula"
                  onChangeText={text => {
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
                  keyboardType="numeric"
                  icon={<Icons name="id-card-o" size={20} color="#9BA6B8" />}
                  style={{ height: 50 }} // Altura para el TextInput
                />
              </View>
            </View>

            {/* Mensaje de error si el RIF es inválido */}
            {cedulaError !== '' && (
              <Text style={styles.errorStyle}>{cedulaError}</Text>
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
                <Icons4 name="location" size={20} color="#9BA6B8" style={{ marginRight: 10, marginLeft: 10 }} />
                <View style={{ flex: 1 }}>
                  <Dropdown
                    style={{
                      height: 50,
                      backgroundColor: '#fff',
                      borderColor: '#ddd',
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingLeft: 15,
                      paddingRight: 10,
                      justifyContent: 'center',
                    }}
                    data={estadosVenezuela}
                    labelField="label"
                    valueField="value"
                    value={estadoSelected}
                    onChange={item => setestadoSelected(item.value)}
                    placeholder="Seleccione un estado"
                    maxHeight={250}
                    itemTextStyle={{ color: 'black' }}
                    selectedTextStyle={{ color: 'black' }}
                    containerStyle={{ borderRadius: 10 }}
                    dropdownPosition="auto"
                    showsVerticalScrollIndicator={false}
                    autoScroll={false}
                  />
                </View>
              </View>
            </View>


            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Número Telefónico"
                value={phone}
                textDecorationLine={isCheckedTelefono ? 'line-through' : 'none'}
                editable={true}
                placeholder="Ingrese su número"
                keyboardType="numeric"
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setPhone(numericText);
                  setPhoneError(
                    numericText.trim() === ''
                      ? 'Número telefónico requerido'
                      : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="phone" size={20} color="#9BA6B8" />}
              />
              {phoneError !== '' && (
                <Text style={styles.errorStyle}>{phoneError}</Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
                fullWidth={350}
                title="Email"
                value={email}
                editable={false}
                textDecorationLine={isCheckedEmail ? 'line-through' : 'none'}
                placeHolder="Ingrese su email"
                onChangeText={text => {
                  setEmail(text);
                  setEmailError(text.trim() === '' ? 'Email es requerido' : '');
                }}
                onBlur={() => { }}
                icon={<Icons3 name="email" size={20} color="#9BA6B8" />}
              />
            </View>
          </View>
        </ScrollView>
      ) : null}

      <View >
        <View
          style={{
            backgroundColor: buttonColor,
            borderRadius: windowHeight(20),
            marginBottom: 20
          }}>
          {/* <NavigationButton
            title="Guardar Cambios"
            color={buttonColor ? appColors.screenBg : appColors.subtitle}
            onPress={() => onHandleChange()}
            backgroundColor={'#2D3261'}
          /> */}
          <NavigationButton
            title="Guardar Cambios"
            onPress={onHandleChange}
            disabled={isGetOtpDisabled}
            backgroundColor={isGetOtpDisabled ? '#848688' : '#2D3261'}
            color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
          />
        </View>
      </View>
    </View>
  );
};

export default EditProfile;
