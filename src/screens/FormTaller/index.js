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
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ErrorContainer from '../../commonComponents/errorContainer';
import {
  addNow,
  myWishlist,
  whishlistEmpty,
  whishlistEmptyDesc,
} from '../../constant';
import images from '../../utils/images';
import {commonStyles} from '../../style/commonStyle.css';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useValues} from '../../../App';
import HeaderContainer from '../../commonComponents/headingContainer';
import CheckBox from 'react-native-check-box';

import {external} from '../../style/external.css';
import {Call, Edit, Profile, Key, BackLeft} from '../../utils/icon';
import styles from './style.css';
import TextInputs from '../../commonComponents/textInputs';
import {Email} from '../../assets/icons/email';
import appColors from '../../themes/appColors';
import {RadioButton, Button} from 'react-native-paper';
import {windowHeight} from '../../themes/appConstant';
import NavigationButton from '../../commonComponents/navigationButton';
import api from '../../../axiosInstance';

import notImageFound from '../../assets/noimageold.jpeg';

const FormTaller = () => {
  const [NameTaller, setNameTaller] = useState('');
  const [isSelected, setSelection] = useState(false);
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

  const [checked, setChecked] = useState('no'); // Valor i

  const [buttonColor, setButtonColor] = useState('#848688');
  const [disabledInput, setdisabledInput] = useState(false);

  const navigation = useNavigation();
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

  const [isCheckedAgente, setisCheckedAgente] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [tipoAccion, settipoAccion] = useState('');
  const [uidTaller, setuidTaller] = useState('');

  const [isCheckedWhats, setisCheckedWhats] = useState(false);

  const [whats, setwhats] = useState(0);
  const [whatsError, setwhatsError] = useState('');

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

  const [isEstado, setisEstado] = useState(false);
  const [imagePerfil, setimagePerfil] = useState('');

  const [estadoSelected, setestadoSelected] = useState(''); // Default value 'J'

  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MyTabs'}],
    });
  };

  useEffect(() => {
    const {uid} = route.params;
    setModalVisible(false);
    setuidTaller(uid);
    getData(uid);
  }, []);

  const getData = async uid => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/getUserByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;

      if (result.message === 'Usuario encontrado') {
        console.log('Este es el usuario encontrado:', result.userData);

        setNameTaller(result.userData.nombre);
        setChecked(result.userData.agenteAutorizado);

        // Manejar y asignar los valores con validación de undefined
        setNombre(result.userData.nombre || '');
        setcedula(result.userData.rif || '');
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
        setestadoSelected(result.userData.estado || '');

        setimagePerfil(result.userData.image_perfil);

        setwhats(result.userData.whatsapp);

        const updatedMetodosPago = metodosPago.map(method => ({
          ...method,
          checked: result.userData.metodos_pago[method.value] || false,
        }));

        setMetodosPago(updatedMetodosPago);
      } else {
        console.log('Usuario no encontrado');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const {
    imageRTLStyle,
    viewRTLStyle,
    bgFullStyle,
    textColorStyle,
    iconColorStyle,
    textRTLStyle,
    isDark,
    t,
  } = useValues();

  const onHandleChange = type => {
    settipoAccion(type);
    setModalVisible(true);
  };

  const onCancel = () => {
    setModalVisible(false);
  };

  const onConfirm = async () => {
    console.log(tipoAccion);
    console.log(uidTaller);
    if (tipoAccion == 'Aprobar') {
      console.log('Aprobar');

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/actualizarStatusUsuario', {
          uid: uidTaller,
          nuevoStatus: 'Aprobado',
        });

        // Verificar la respuesta del servidor
        const result = response.data;

        if (
          result.message ===
          'El estado del usuario ha sido actualizado exitosamente'
        ) {
          showToast('Se ha aprobado el taller exitosamente');
          setModalVisible(false);
          navigation.goBack();
        } else {
          showToast('Ha ocurrido un error');
          setModalVisible(false);
          navigation.goBack();
        }
      } catch (error) {
        // Manejo de errores
        if (error.response) {
          console.error('Error en la solicitud:', error.response.statusText);
        } else {
          console.error('Error en la solicitud:', error.message);
        }
        showToast('Ha ocurrido un error');
        setModalVisible(false);
        navigation.goBack();
      }
    } else {
      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/actualizarStatusUsuario', {
          uid: uidTaller,
          nuevoStatus: 'Rechazado',
        });

        // Verificar la respuesta del servidor
        const result = response.data;

        if (
          result.message ===
          'El estado del usuario ha sido actualizado exitosamente'
        ) {
          showToast('Se ha rechazado el taller');
          setModalVisible(false);
          navigation.goBack();
        } else {
          showToast('Ha ocurrido un error');
          setModalVisible(false);
          navigation.goBack();
        }
      } catch (error) {
        // Manejo de errores
        if (error.response) {
          console.error('Error en la solicitud:', error.response.statusText);
        } else {
          console.error('Error en la solicitud:', error.message);
        }
        showToast('Ha ocurrido un error');
        setModalVisible(false);
        navigation.goBack();
      }
    }
  };

  const showToast = text => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

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
          {justifyContent: 'center'}, // Cambiado a 'center' para centrar el contenido
          {flexDirection: viewRTLStyle},
        ]}>
        {/* Botón de retroceso */}
        <TouchableOpacity
          onPress={() => navigation.goBack('')}
          style={{position: 'absolute', left: 0}} // Posiciona el botón de retroceso en la esquina izquierda
        >
          <View style={{transform: [{scale: imageRTLStyle}]}}>
            <BackLeft />
          </View>
        </TouchableOpacity>

        {/* Nombre del taller centrado */}
        <Text
          style={[
            commonStyles.hederH2,
            external.as_center,
            {color: textColorStyle},
          ]}>
          {NameTaller}
        </Text>
      </View>

      {imagePerfil == '' ? (

        <View style={[stylesImage.imageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={notImageFound}
          style={{ width: 100, height: 100 }}
        />
        </View>
      ) : (
        <View style={[stylesImage.imageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={{ uri: imagePerfil }}
          style={{ width: 100, height: 100 }}
        />
      </View>

      )}

      <ScrollView style={{marginBottom: 15}}>
        <View>
          {/* Nombre y Apellido */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedName}
              style={{
                marginTop: 30,
                color: '#2D3261',
                marginRight: 10,
                marginRight: 10,
              }}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedName(!isCheckedName);
              }}
            />

            <TextInputs
              fullWidth={270}
              title="Nombre y Apellido"
              editable={false}
              value={Nombre}
              textDecorationLine={isCheckedName ? 'line-through' : 'none'}
              onChangeText={text => {
                setNombre(text);
                setNombreError(text.trim() === '' ? 'Nombre es requerido' : '');
              }}
              onBlur={() => {}}
            />
          </View>

          {/* Registro de Información Fiscal (RIF) */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isRif}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisRif(!isRif);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Registro de Información Fiscal (RIF)"
              value={cedula}
              editable={false}
              textDecorationLine={isRif ? 'line-through' : 'none'}
              placeHolder="Ingrese su RIF"
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                setcedula(numericText);
                setcedulaError(
                  numericText.trim() === '' ? 'Cedula es requerida' : '',
                );
              }}
              onBlur={() => {}}
              keyboardType="numeric"
            />
          </View>

          {/* Dirección del Taller */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedDireccion}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedDireccion(!isCheckedDireccion);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Dirección del Taller"
              placeHolder="Ingrese su direccion"
              textDecorationLine={isCheckedDireccion ? 'line-through' : 'none'}
              editable={false}
              value={Direccion}
              onChangeText={text => {
                setDireccion(text);
                setDireccionError(
                  text.trim() === '' ? 'Direccion es requerida' : '',
                );
              }}
              onBlur={() => {}}
            />
            {DireccionError !== '' && (
              <Text style={styles.errorStyle}>{DireccionError}</Text>
            )}
          </View>

          {/* Registro Comercial */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedRegistroComercial}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedRegistroComercial(!isCheckedRegistroComercial);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Registro Comercial"
              value={RegComercial}
              textDecorationLine={
                isCheckedRegistroComercial ? 'line-through' : 'none'
              }
              editable={false}
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
              onBlur={() => {}}
              keyboardType="numeric"
            />
            {RegComercialError !== '' && (
              <Text style={styles.errorStyle}>{RegComercialError}</Text>
            )}
          </View>

          {/* Estado */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isEstado}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                console.log('Aquiii');
                setisEstado(!isEstado);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Estado"
              value={estadoSelected}
              textDecorationLine={isEstado ? 'line-through' : 'none'}
              editable={false}
              keyboardType="string"
              onBlur={() => {}}
            />
          </View>

          {/* Número Telefónico */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedTelefono}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedTelefono(!isCheckedTelefono);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Número Telefónico"
              value={phone}
              textDecorationLine={isCheckedTelefono ? 'line-through' : 'none'}
              editable={false}
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
              onBlur={() => {}}
            />
            {phoneError !== '' && (
              <Text style={styles.errorStyle}>{phoneError}</Text>
            )}
          </View>

          {/* whatsapp */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedWhats}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedWhats(!isCheckedWhats);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Whatsapp"
              value={whats}
              textDecorationLine={isCheckedWhats ? 'line-through' : 'none'}
              editable={false}
              placeholder="Ingrese su número"
              keyboardType="numeric"
              onBlur={() => {}}
            />
          </View>

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
                      disabled={true}
                    />
                    <Text style={{marginLeft: 10, color: 'black'}}>
                      {method.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Email */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedEmail}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedEmail(!isCheckedEmail);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Email"
              value={email}
              editable={false}
              textDecorationLine={isCheckedEmail ? 'line-through' : 'none'}
              placeHolder="Ingrese su email"
              onChangeText={text => {
                setEmail(text);
                setEmailError(text.trim() === '' ? 'Email es requerido' : '');
              }}
              onBlur={() => {}}
            />
          </View>

          {/* Caracteristicas del Taller */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedCaracteristicas}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedCaracteristicas(!isCheckedCaracteristicas);
              }}
            />

            <TextInputs
              fullWidth={270}
              title="Caracteristicas del taller"
              editable={false}
              textDecorationLine={
                isCheckedCaracteristicas ? 'line-through' : 'none'
              }
              value={Caracteristicas}
              placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
              multiline={true}
              numberOfLines={4}
              height={150}
              onChangeText={text => {
                setCaracteristicas(text);
                setCaracteristicasError(
                  text.trim() === '' ? 'Caracteristicas es requerido' : '',
                );
              }}
              onBlur={() => {}}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              marginTop: -15,
            }}>
            <CheckBox
              isChecked={isCheckedAgente}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedAgente(!isCheckedAgente);
              }}
            />

            <Text
              style={{
                marginBottom: 10,
                color: 'black',
                marginTop: 35,
                textDecorationLine: isCheckedAgente ? 'line-through' : 'none',
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
                disabled={true}
                status={checked === 'si' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('si')}
              />
              <Text style={{color: 'black'}}>Sí</Text>

              <RadioButton
                value="no"
                disabled={true}
                status={checked === 'no' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('no')}
              />
              <Text style={{color: 'black'}}>No</Text>
            </View>
          </View>

          {/* Tiempo de experiencia */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedExperiencia}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedExperiencia(!isCheckedExperiencia);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Tiempo de experiencia"
              editable={false}
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
              onBlur={() => {}}
            />
          </View>

          {/* Enlaces a Redes Sociales */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedFacebook}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedFacebook(!isCheckedFacebook);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Link de Facebook"
              textDecorationLine={isCheckedFacebook ? 'line-through' : 'none'}
              editable={false}
              value={LinkFacebook}
              placeHolder="Ingrese el enlace a su Facebook"
              onChangeText={text => {
                setLinkFacebook(text);
                setLinkFacebookError(
                  text.trim() === '' ? 'Link de Facebook es requerido' : '',
                );
              }}
              onBlur={() => {}}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedInstagram}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedInstagram(!isCheckedInstagram);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Link de Instagram"
              editable={false}
              textDecorationLine={isCheckedInstagram ? 'line-through' : 'none'}
              value={LinkInstagram}
              placeHolder="Ingrese el enlace a su Instagram"
              onChangeText={text => {
                setLinkInstagram(text);
                setLinkInstagramError(
                  text.trim() === '' ? 'Link de Instagram es requerido' : '',
                );
              }}
              onBlur={() => {}}
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
            <CheckBox
              isChecked={isCheckedTiktok}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedTiktok(!isCheckedTiktok);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Link de TikTok"
              editable={false}
              value={LinkTiktok}
              textDecorationLine={isCheckedTiktok ? 'line-through' : 'none'}
              placeHolder="Ingrese el enlace a su TikTok"
              onChangeText={text => {
                setLinkTiktok(text);
                setLinkTiktokError(
                  text.trim() === '' ? 'Link de TikTok es requerido' : '',
                );
              }}
              onBlur={() => {}}
            />
          </View>

          {/* Seguro */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedSeguro}
              style={{marginTop: 30, color: '#2D3261', marginRight: 10}}
              checkedCheckBoxColor="#2D3261"
              onClick={() => {
                setisCheckedSeguro(!isCheckedSeguro);
              }}
            />
            <TextInputs
              fullWidth={270}
              title="Seguro"
              editable={false}
              value={seguro}
              height={150}
              placeHolder="Ingrese su seguro"
              textDecorationLine={isCheckedSeguro ? 'line-through' : 'none'}
              onChangeText={text => {
                setseguro(text);
                setseguroError(text.trim() === '' ? 'Seguro es requerido' : '');
              }}
              onBlur={() => {}}
            />
            {seguroError !== '' && (
              <Text style={styles.errorStyle}>{seguroError}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{marginBottom: 15}}>
        <View
          style={{
            backgroundColor: buttonColor,
            borderRadius: windowHeight(20),
            marginBottom: 15, // Margen entre los botones
          }}>
          <NavigationButton
            title="Aprobar solicitud"
            onPress={() => onHandleChange('Aprobar')}
            backgroundColor={'#2D3261'}
            color={appColors.screenBg}
          />
        </View>

        <View
          style={{
            backgroundColor: buttonColor,
            borderRadius: windowHeight(20),
          }}>
          <NavigationButton
            title="Rechazar solicitud"
            onPress={() => onHandleChange('Rechazar')}
            backgroundColor={'#848688'}
            color={appColors.screenBg}
          />
        </View>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={onCancel}>
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>
              ¿Estás seguro de que quieres {tipoAccion} este taller?
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity
                style={stylesModal.buttonYes}
                onPress={onConfirm}>
                <Text style={stylesModal.buttonText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={onCancel}>
                <Text style={stylesModal.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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

const stylesModal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonYes: {
    backgroundColor: 'green', // Color del botón "Sí"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: 'red', // Color del botón "No"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonText: {
    color: 'white', // Color del texto del botón
    fontWeight: 'bold',
  },
});

export default FormTaller;
