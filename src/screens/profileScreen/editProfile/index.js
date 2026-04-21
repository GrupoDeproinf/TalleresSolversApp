import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { phoneMo, smithaWilliams, smithaWilliamsMail } from '../../../constant';
import { commonStyles } from '../../../style/commonStyle.css';
import { external } from '../../../style/external.css';
import styles from './style.css';
import TextInputs from '../../../commonComponents/textInputs';
import appColors from '../../../themes/appColors';
import { Call } from '../../../utils/icon';
import { Email } from '../../../assets/icons/email';
import { windowHeight } from '../../../themes/appConstant';
import { useValues } from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/FontAwesome';
import api from '../../../../axiosInstance';

import { launchImageLibrary } from 'react-native-image-picker';
import { Dropdown } from 'react-native-element-dropdown';

const DARK_BLUE = '#1F2344';
const YELLOW = '#FFD60A';

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
  const insets = useSafeAreaInsets();

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
    { label: 'La Guaira', value: 'La Guaira' },
    { label: 'Mérida', value: 'Mérida' },
    { label: 'Miranda', value: 'Miranda' },
    { label: 'Monagas', value: 'Monagas' },
    { label: 'Nueva Esparta', value: 'Nueva Esparta' },
    { label: 'Portuguesa', value: 'Portuguesa' },
    { label: 'Sucre', value: 'Sucre' },
    { label: 'Táchira', value: 'Táchira' },
    { label: 'Trujillo', value: 'Trujillo' },
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
      if (!user?.uid) {
        return;
      }
      console.log('valor del storage1234', user.cedula);

      setuidprofile(user.uid);
      settypeUser(user.typeUser);

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          // uid: "U4pZah0wgbMuuGBU5dVCdiolNmr2",
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

          setestadoSelected(result.userData.estado || '');

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
      setEmailError('Dirección de correo incorrecta');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhone = () => {
    const phoneStr = phone == null ? '' : String(phone);
    if (!phoneStr || phoneStr === '') {
      setPhoneError('Teléfono es requerido');
      return false;
    }
    const numericPhone = phoneStr.replace(/[^0-9]/g, '');
    if (numericPhone.length > 0 && numericPhone[0] === '0') {
      setPhoneError('El número no puede empezar con 0');
      return false;
    }
    if (!/^\d{10}$/.test(numericPhone)) {
      setPhoneError('Teléfono debe contener exactamente 10 dígitos');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const onHandleChange = async () => {
    console.log("Aquiiii");
    console.log(typeUser);

    setGetOtpDisabled(true);

    if (typeUser == "Cliente") {
      const isPhoneValid = validatePhone();
      const isEmailValid = validateEmail();

      if (
        isPhoneValid === true &&
        isEmailValid === true &&
        Nombre != '' &&
        cedula != 0 &&
        cedula != '' &&
        estadoSelected !== ''
      ) {
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
              phone: phone?.replace(/\s+/g, ""),
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
                  const existing = await AsyncStorage.getItem('@userInfo');
                  const prev = existing ? JSON.parse(existing) : {};
                  const merged = {
                    ...prev,
                    ...infoUserCreated,
                    uid: uidprofile,
                    typeUser: 'Cliente',
                  };
                  await AsyncStorage.setItem(
                    '@userInfo',
                    JSON.stringify(merged),
                  );
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
    } else {
      setGetOtpDisabled(false);
    }
  };

  const { bgFullStyle, textColorStyle, iconColorStyle, isDark, t, textRTLStyle } = useValues();



  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
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

  const clearImage = () => {
    setimagePerfil('');
    setBase64(null);
  };

  const isCliente = typeUser === 'Cliente';
  const showEditForm = isCliente;

  const totalStepsClienteEdit = 6;
  let completedStepsCliente = 0;
  if (imagePerfil) completedStepsCliente += 1;
  if ((Nombre || '').trim() !== '') completedStepsCliente += 1;
  if (
    (String(cedula) || '').trim() !== '' &&
    cedula !== 0 &&
    cedula !== ''
  ) {
    completedStepsCliente += 1;
  }
  if ((email || '').trim() !== '') completedStepsCliente += 1;
  if ((estadoSelected || '').trim() !== '') completedStepsCliente += 1;
  if ((phone || '').toString().trim() !== '' && phone !== 0) {
    completedStepsCliente += 1;
  }
  const progressCliente = Math.round(
    (completedStepsCliente / totalStepsClienteEdit) * 100,
  );

  let progressClienteText = 'Comienza completando tus datos básicos.';
  if (progressCliente >= 30 && progressCliente < 60) {
    progressClienteText = '¡Vas muy bien! Sigue completando tu registro.';
  } else if (progressCliente >= 60 && progressCliente < 90) {
    progressClienteText = '¡Ya casi terminas! Solo faltan algunos campos.';
  } else if (progressCliente >= 90) {
    progressClienteText = '¡Excelente! Tu perfil está casi completo.';
  }

  return (
    <View
      style={[styles.signUpLikeRoot, { backgroundColor: bgFullStyle, padding: 30 }]}>
      <View
        style={{
          marginHorizontal: -30,
          marginTop: -30,
          marginBottom: 16,
          backgroundColor: DARK_BLUE,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          overflow: 'hidden',
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 30,
          alignItems: 'center',
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderLeftColor: YELLOW,
          borderRightColor: YELLOW,
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top + 8,
            paddingBottom: 8,
            paddingHorizontal: 0,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={styles.signUpLikeHeaderBackBtn}
            accessibilityRole="button"
            accessibilityLabel="Volver">
            <Icons name="angle-left" size={22} color={YELLOW} />
          </TouchableOpacity>
          <View style={styles.signUpLikeHeaderTitleSlot} pointerEvents="box-none">
            <Text
              style={styles.signUpLikeHeaderTitleText}
              numberOfLines={2}>
              Mi cuenta
              <Text style={styles.signUpLikeHeaderTitleType}>
                {' '}
                ({typeUser || '…'})
              </Text>
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
        <Text
          style={{
            fontSize: 20,
            color: '#E5E7EB',
            lineHeight: 28,
            marginBottom: 12,
            marginTop: 4,
            textAlign: 'center',
            paddingHorizontal: 8,
          }}>
          Actualiza tus datos cuando lo necesites.
        </Text>
        {isCliente ? (
          <View
            style={{
              width: '100%',
              marginHorizontal: -30,
              height: 10,
              backgroundColor: DARK_BLUE,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${progressCliente}%`,
                height: '100%',
                backgroundColor: YELLOW,
              }}
            />
          </View>
        ) : null}
      </View>

      {showEditForm && isCliente ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 0,
              marginTop: 0,
              paddingHorizontal: 4,
            }}>
            <Text style={{ fontSize: 13, color: DARK_BLUE }}>
              {progressClienteText}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: DARK_BLUE }}>
              {progressCliente}%
            </Text>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 8) + 72,
            }}>
            <View style={{ paddingHorizontal: 4, paddingBottom: 0 }}>
              <View
                style={[styles.signUpLikeCard, styles.signUpLikeCardFirst]}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 4,
                  }}>
                  Tu identidad
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                  Actualiza tu foto y datos básicos.
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                    
                    {imagePerfil != null && String(imagePerfil).trim() !== '' ? (
                      <View style={stylesImage.imageContainer}>
                        <Image
                          source={{ uri: imagePerfil }}
                          style={{ width: 90, height: 90, borderRadius: 45 }}
                        />
                        <TouchableOpacity
                          style={stylesImage.closeButton}
                          onPress={clearImage}>
                          <Text style={stylesImage.closeButtonText}>X</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 45,
                          backgroundColor: '#EEF2FF',
                          borderWidth: 1,
                          borderColor: 'rgba(45, 50, 97, 0.25)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icons name="user" size={34} color="#2D3261" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 2 }}>
                    <TouchableOpacity
                      style={[
                        stylesImage.button,
                        {
                          borderWidth: 1,
                          borderColor: '#2D3261',
                          borderStyle: 'dotted',
                          borderRadius: 999,
                          backgroundColor: '#FFF',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                        },
                      ]}
                      onPress={selectImage}>
                      <Icons name="camera" size={16} color="#2D3261" />
                      <Text
                        style={[
                          stylesImage.buttonText,
                          {
                            marginLeft: 8,
                            color: '#2D3261',
                            fontSize: 13,
                            fontWeight: '600',
                          },
                        ]}>
                        Subir foto de perfil
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: '#9CA3AF',
                      }}>
                      JPG o PNG, máximo 5MB.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.signUpLikeCard}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 4,
                  }}>
                  Datos personales
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                  Información básica de tu cuenta.
                </Text>
                <TextInputs
                  keyboardType="default"
                  autoCapitalize="words"
                  title="Nombre y Apellido"
                  placeHolder="Ingrese su nombre y apellido"
                  value={Nombre}
                  textDecorationLine={isCheckedName ? 'line-through' : 'none'}
                  onChangeText={text => {
                    setNombre(text);
                    setNombreError(
                      text.trim() === '' ? 'Nombre es requerido' : '',
                    );
                  }}
                  onBlur={() => {}}
                  icon={<Icons name="user" size={20} color="#9BA6B8" />}
                />
                {NombreError !== '' && (
                  <Text style={styles.errorStyle}>{NombreError}</Text>
                )}

                <View style={{ marginTop: 10 }}>
                  <Text
                    style={[
                      styles.headingContainer,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    Documento de Identidad
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 0,
                      marginBottom: 0,
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: '26%',
                        paddingRight: 6,
                      }}>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          backgroundColor: '#F9FAFB',
                          height: 50,
                          justifyContent: 'center',
                          paddingHorizontal: 6,
                        }}>
                        <Dropdown
                          style={{
                            width: '100%',
                            borderWidth: 0,
                            paddingHorizontal: 4,
                            backgroundColor: 'transparent',
                            height: 42,
                          }}
                          placeholderStyle={{
                            color: '#6B7280',
                            fontSize: 13,
                          }}
                          selectedTextStyle={{
                            color: '#111827',
                            fontSize: 13,
                          }}
                          data={[
                            { label: 'C-', value: 'C-' },
                            { label: 'E-', value: 'E-' },
                            { label: 'G-', value: 'G-' },
                            { label: 'J-', value: 'J-' },
                            { label: 'P-', value: 'P-' },
                            { label: 'V-', value: 'V-' },
                          ]}
                          labelField="label"
                          valueField="value"
                          placeholder="Prefijo"
                          value={selectedPrefix}
                          onChange={item => setSelectedPrefix(item.value)}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1, marginTop: -40 }}>
                      <TextInputs
                        title=""
                        value={cedula}
                        placeHolder="Ingrese el número de cédula"
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          if (numericText.length <= 10) {
                            setcedula(numericText);
                            setcedulaTyping(true);
                            if (numericText.trim() === '') {
                              setcedulaError('Documento es requerido');
                            } else {
                              setcedulaError('');
                            }
                          }
                        }}
                        onBlur={() => setcedulaTyping(false)}
                        keyboardType="numeric"
                        icon={
                          <Icons name="id-card-o" size={20} color="#9BA6B8" />
                        }
                        style={{
                          height: 50,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          backgroundColor: '#FFFFFF',
                          width: '100%',
                        }}
                      />
                      {cedulaError !== '' && (
                        <Text style={styles.errorStyle}>{cedulaError}</Text>
                      )}
                    </View>
                  </View>
                </View>

                <TextInputs
                  title="Correo Electrónico"
                  keyboardType={'email-address'}
                  value={email}
                  editable={false}
                  textDecorationLine={isCheckedEmail ? 'line-through' : 'none'}
                  placeHolder="Ingrese su email"
                  onChangeText={text => {
                    setEmail(text);
                    setEmailTyping(true);
                    setEmailError(text.trim() === '' ? 'Email es requerido' : '');
                  }}
                  onBlur={() => setEmailTyping(false)}
                  icon={
                    <Email
                      color={isEmailTyping ? '#051E47' : appColors.subtitle}
                    />
                  }
                />

                <View style={{ marginTop: 8 }}>
                  <Text
                    style={[
                      styles.headingContainer,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    Estado
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 10,
                      marginBottom: 10,
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 10,
                        backgroundColor: '#F9FAFB',
                        height: 50,
                        justifyContent: 'center',
                        paddingHorizontal: 8,
                      }}>
                      <Dropdown
                        style={{
                          width: '100%',
                          borderWidth: 0,
                          paddingHorizontal: 4,
                          backgroundColor: 'transparent',
                          height: 42,
                        }}
                        placeholderStyle={{
                          color: '#6B7280',
                          fontSize: 13,
                        }}
                        selectedTextStyle={{
                          color: '#111827',
                          fontSize: 13,
                        }}
                        data={estadosVenezuela}
                        labelField="label"
                        valueField="value"
                        placeholder="Seleccione un estado"
                        value={estadoSelected}
                        search={true}
                        onChange={item => setestadoSelected(item.value)}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={[styles.signUpLikeCard, styles.signUpLikeCardSoft]}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 4,
                  }}>
                  Contacto
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 12,
                  }}>
                  Número al que podamos contactarte.
                </Text>
                <TextInputs
                  title="Número Telefónico"
                  value={phone}
                  placeholder="Ejem 414 261 79 66"
                  textDecorationLine={isCheckedTelefono ? 'line-through' : 'none'}
                  editable={true}
                  keyboardType="numeric"
                  onChangeText={text => {
                    let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
                    if (numericText.length > 0 && numericText[0] === '0') {
                      setPhoneError('El número no puede empezar con 0');
                      setPhone('');
                      return;
                    }
                    let formattedText = '';
                    if (numericText.length > 0 && numericText.length <= 3) {
                      formattedText = `${numericText}`;
                    } else if (numericText.length > 3 && numericText.length <= 6) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
                    } else if (numericText.length > 6 && numericText.length <= 8) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
                    } else if (numericText.length > 8) {
                      formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
                    }
                    setPhone(formattedText);
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
                    <Call
                      color={isCallTyping ? '#051E47' : appColors.subtitle}
                    />
                  }
                />
                {phoneError !== '' && (
                  <Text style={styles.errorStyle}>{phoneError}</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      {showEditForm ? (
        <View
          style={[
            styles.saveFooterCliente,
            {paddingBottom: insets.bottom + 4, backgroundColor: bgFullStyle},
          ]}>
          <TouchableOpacity
            activeOpacity={0.88}
            disabled={isGetOtpDisabled}
            onPress={onHandleChange}
            style={[
              styles.saveFooterBtn,
              isGetOtpDisabled && styles.saveFooterBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Guardar cambios">
            <Icons
              name="floppy-o"
              size={18}
              color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
            />
            <Text
              style={[
                styles.saveFooterBtnText,
                isGetOtpDisabled && styles.saveFooterBtnTextDisabled,
              ]}>
              Guardar cambios
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default EditProfile;

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
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const stylesMap = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
