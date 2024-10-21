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
  Modal
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

  const [buttonColor, setButtonColor] = useState('#d1d6de');
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

  const [modalVisible, setModalVisible] = useState(false);

  const [tipoAccion, settipoAccion] = useState('');
  const [uidTaller, setuidTaller] = useState('');

  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MyTabs'}],
    });
  };

  useEffect(() => {
    const {uid} = route.params;
    setModalVisible(false)
    setuidTaller(uid)
    getData(uid);
  }, []);

  const getData = async uid => {
    try {
      // Hacer la solicitud POST
      const response = await fetch(
        'http://desarrollo-test.com/api/usuarios/getUserByUid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({uid: uid}), // Convertir los datos a JSON
        },
      );

      // Verificar la respuesta del servidor
      if (response.ok) {
        const result = await response.json();

        if (result.message == 'Usuario encontrado') {
          console.log('Este es el usuario encontrado1234444', result.userData); // Aquí puedes manejar la respuesta
          setNameTaller(result.userData.nombre);

          setNombre(
            result.userData.nombre == undefined ? '' : result.userData.nombre,
          );
          setcedula(
            result.userData.rif == undefined ? '' : result.userData.rif,
          );
          setEmail(
            result.userData.email == undefined ? '' : result.userData.email,
          );
          setPhone(
            result.userData.phone == undefined ? '' : result.userData.phone,
          );

          setDireccion(
            result.userData.Direccion == undefined
              ? ''
              : result.userData.Direccion,
          );
          setRegComercial(
            result.userData.RegComercial == undefined
              ? ''
              : result.userData.RegComercial,
          );
          setCaracteristicas(
            result.userData.Caracteristicas == undefined
              ? ''
              : result.userData.Caracteristicas,
          );
          setTarifa(
            result.userData.Tarifa == undefined ? '' : result.userData.Tarifa,
          );
          setExperiencia(
            result.userData.Experiencia == undefined
              ? ''
              : result.userData.Experiencia,
          );
          setLinkFacebook(
            result.userData.LinkFacebook == undefined
              ? ''
              : result.userData.LinkFacebook,
          );
          setLinkInstagram(
            result.userData.LinkInstagram == undefined
              ? ''
              : result.userData.LinkInstagram,
          );
          setLinkTiktok(
            result.userData.LinkTiktok == undefined
              ? ''
              : result.userData.LinkTiktok,
          );
          setGarantia(
            result.userData.Garantia == undefined
              ? ''
              : result.userData.Garantia,
          );
          setseguro(
            result.userData.seguro == undefined ? '' : result.userData.seguro,
          );
        } else {
        }
      } else {
        console.error('Error en la solicitud:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
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

  const onHandleChange = (type) => {
    settipoAccion(type)
    setModalVisible(true)
  }

  const onCancel = () =>{
    setModalVisible(false)
  }

  const onConfirm = async () =>{
    console.log(tipoAccion)
    console.log(uidTaller)
    if (tipoAccion == "Aprobar"){
      console.log("Aprobar")
      

      try {
        // Hacer la solicitud POST
        const response = await fetch('http://desarrollo-test.com/api/usuarios/actualizarStatusUsuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({uid:uidTaller, nuevoStatus:'Aprobado'}), // Convertir los datos a JSON
        });
  
        // Verificar la respuesta del servidor
        if (response.ok) {
          const result = await response.json();
          console.log("Este es el usuario nuevo ", result); // Aquí puedes manejar la respuesta
  
          if (result.message == "El estado del usuario ha sido actualizado exitosamente"){
            showToast('Se ha aprobado el taller exitosamente');
            setModalVisible(false)
            navigation.goBack('')
          } else {
            showToast('Ha ocurrido un error');
            setModalVisible(false)
            navigation.goBack('')
          }
        } else {
          console.error('Error en la solicitud:', response);
          showToast('Ha ocurrido un error');
          setModalVisible(false)
          navigation.goBack('')
        }
      } catch (error) {
        showToast('Ha ocurrido un error');
        setModalVisible(false)
        navigation.goBack('')
      }
    } else {
      try {
        // Hacer la solicitud POST
        const response = await fetch('http://desarrollo-test.com/api/usuarios/actualizarStatusUsuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({uid:uidTaller, nuevoStatus:'Rechazado'}), // Convertir los datos a JSON
        });
  
        // Verificar la respuesta del servidor
        if (response.ok) {
          const result = await response.json();
          console.log("Este es el usuario nuevo ", result); // Aquí puedes manejar la respuesta
  
          if (result.message == "El estado del usuario ha sido actualizado exitosamente"){
            showToast('Se ha rechazado el taller');
            setModalVisible(false)
            navigation.goBack('')
          } else {
            showToast('Ha ocurrido un error');
            setModalVisible(false)
            navigation.goBack('')
          }
        } else {
          console.error('Error en la solicitud:', response);
          showToast('Ha ocurrido un error');
          setModalVisible(false)
          navigation.goBack('')
        }
      } catch (error) {
        showToast('Ha ocurrido un error');
        setModalVisible(false)
        navigation.goBack('')
      }
    }
  }

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

      <View style={[external.as_center]}>
        <ImageBackground
          resizeMode="contain"
          style={styles.imgStyle}
          source={images.user}>
          {/* <View
            style={[
              styles.editIconStyle,
              {backgroundColor: '#F3F5FB'},
              {borderRadius: 100},
            ]}>
            <Edit />
          </View> */}
        </ImageBackground>
      </View>

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
                color: '#4D66FF',
                marginRight: 10,
                marginRight: 10,
              }}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedName(!isCheckedName);
              }}
            />

            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisRif(!isRif);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedDireccion(!isCheckedDireccion);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedRegistroComercial(!isCheckedRegistroComercial);
              }}
            />
            <TextInputs
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

          {/* Número Telefónico */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedTelefono}
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedTelefono(!isCheckedTelefono);
              }}
            />
            <TextInputs
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

          {/* Email */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <CheckBox
              isChecked={isCheckedEmail}
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedEmail(!isCheckedEmail);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedCaracteristicas(!isCheckedCaracteristicas);
              }}
            />
            <TextInputs
              title="Caracteristicas del taller"
              editable={false}
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
              onBlur={() => {}}
            />
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedExperiencia(!isCheckedExperiencia);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedFacebook(!isCheckedFacebook);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedInstagram(!isCheckedInstagram);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedTiktok(!isCheckedTiktok);
              }}
            />
            <TextInputs
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
              style={{marginTop: 30, color: '#4D66FF', marginRight: 10}}
              checkedCheckBoxColor="#4D66FF"
              onClick={() => {
                setisCheckedSeguro(!isCheckedSeguro);
              }}
            />
            <TextInputs
              title="Seguro"
              editable={false}
              value={seguro}
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
            backgroundColor={'#28a745'}
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
            backgroundColor={'#D32F2F'}
            color={appColors.screenBg}
          />
        </View>
      </View>

      <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={onCancel}
    >
      <View style={stylesModal.container}>
        <View style={stylesModal.modalView}>
          <Text style={stylesModal.modalText}>
            ¿Estás seguro de que quieres {tipoAccion} este taller?
          </Text>
          <View style={stylesModal.buttonContainer}>
            <TouchableOpacity style={stylesModal.buttonYes} onPress={onConfirm}>
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

const stylesModal = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
    fontSize: 16,
    fontWeight: "bold"
  },
  buttonYes: {
    backgroundColor: "green", // Color del botón "Sí"
    borderRadius: 5,
    padding: 10,
    width: "48%", // Ajustar ancho para espacio entre botones
    alignItems: "center"
  },
  buttonNo: {
    backgroundColor: "red", // Color del botón "No"
    borderRadius: 5,
    padding: 10,
    width: "48%", // Ajustar ancho para espacio entre botones
    alignItems: "center"
  },
  buttonText: {
    color: "white", // Color del texto del botón
    fontWeight: "bold"
  }
});



export default FormTaller;
