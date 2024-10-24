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
import {useNavigation, useRoute} from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import {Picker} from '@react-native-picker/picker';
import Icons from 'react-native-vector-icons/FontAwesome'

import {RadioButton, Button} from 'react-native-paper';





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

          if (result.message == 'Usuario encontrado') {
            console.log(
              'Este es el usuario encontrado1234444',
              result.userData,
            ); // Aquí puedes manejar la respuesta


            setNameTaller(result.userData.nombre);

            setNombre(
              result.userData.nombre == undefined ? '' : result.userData.nombre,
            );


            if (result.userData.typeUser == "Taller"){
              let typeID = result.userData.rif.split("-")
              setcedula(
                typeID[1] == undefined ? '' : typeID[1],
              );

              setSelectedPrefix(typeID[0]+"-")

            } else if (result.userData.typeUser == "Cliente") {
              let typeID = result.userData.cedula.split("-")
              console.log("typeID[1]", typeID[1])
              setcedula(
                typeID[1] == undefined ? '' : typeID[1],
              );

              setSelectedPrefix(typeID[0]+"-")
            }


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

      // setinfoUser(user)
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

    console.log("Aquiiii")
    console.log(typeUser)

    setGetOtpDisabled(true);

    if(typeUser == "Cliente"){

      const isPhoneValid = validatePhone();

      if (
        isPhoneValid == true &&
        Nombre != '' &&
        cedula != 0 &&
        cedula != ''
      ) {
        const infoUserCreated = {
          Nombre: Nombre,
          cedula: selectedPrefix + "" + cedula,
          phone: phone,
          typeUser: 'Cliente',
          email: email,
          uid:uidprofile
        };

        console.log(infoUserCreated)
        try {
          // Hacer la solicitud POST
          const response = await fetch(
            'http://desarrollo-test.com/api/usuarios/UpdateClient',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(infoUserCreated), // Convertir los datos a JSON
            },
          );

          // Verificar la respuesta del servidor
          console.log(response);

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
            setSelectedPrefix('J-');

            showToast('Usuario actualizado exitosamente');
            setGetOtpDisabled(false);
            navigation.goBack('')

          } else {
            const errorText = await response.text(); // Obtener el texto de error si la respuesta no fue exitosa
            try {
              const errorJson = JSON.parse(errorText); // Intentar convertir el texto a JSON
              console.error('Error al guardar el usuario:', errorJson.message); // Acceder a la propiedad "message"
              setGetOtpDisabled(false);
              showToast(errorJson.message);
            } catch (e) {
              console.error('Error al procesar la respuesta de error:', e);
              console.error('Texto de error sin formato JSON:', errorText); // Mostrar el texto de error original si no se pudo parsear
            }
          }
        } catch (error) {
          console.error('Error en la solicitud:', error);
          setGetOtpDisabled(false);
        }
      } else {
        setGetOtpDisabled(false);
        showToast('Error al crear al usuario, por favor validar formulario');
      }


    } else if (typeUser == "Taller") {

      if (
        Nombre != '' &&
        cedula != 0
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
          // Hacer la solicitud POST
          const response = await fetch(
            'http://desarrollo-test.com/api/usuarios/UpdateTaller',
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
  
            showToast('Taller actualizado exitosamente');
            setGetOtpDisabled(false);
            navigation.goBack('')
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
            setGetOtpDisabled(false);
            console.error('Error en la solicitud:', response.statusText);
          }
        } catch (error) {
          setGetOtpDisabled(false);
          console.error('Error en la solicitud:', error);
        }
      } 
      else {
        setGetOtpDisabled(false);
        showToast('Error al actualizar el usuario, por favor validar formulario');
      }
    }


    // if (
    //   isEmailValid == true &&
    //   isPhoneValid == true &&
    //   Nombre != '' &&
    //   cedula != 0
    // ) {
    //   const infoUserCreated = {
    //     uid: '12345',
    //     nombre: Nombre,
    //     cedula: cedula,
    //     phone: phone,
    //     typeUser: 'Cliente',
    //     email: email,
    //   };
    //   try {
    //     const jsonValue = JSON.stringify(infoUserCreated);
    //     console.log(jsonValue);
    //     await AsyncStorage.setItem('@userInfo', jsonValue);
    //   } catch (e) {
    //     console.log(e);
    //   }

    //   showToast('Actualizado correctamente');
    //   navigation2.goBack('');
    // } else {
    //   showToast('Error al actualizar el usuario, por favor validar formulario');
    // }

  };



  const {bgFullStyle, textColorStyle, iconColorStyle, isDark, t, textRTLStyle} = useValues();

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

      {/* Formulario para editar un taller */}
      {typeUser == 'Taller' ? (
        <ScrollView style={{marginBottom: 15}}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
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
                onBlur={() => {}}
              />
            </View>

            {/* Registro de Información Fiscal (RIF) */}
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
                  style={{height: 50}} // Altura para el TextInput
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
                onBlur={() => {}}
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
              <TextInputs
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
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
              <Text style={{color: 'black'}}>Sí</Text>

              <RadioButton
                value="no"
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
              <TextInputs
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
              <TextInputs
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
                onBlur={() => {}}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
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
              <TextInputs
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
              <TextInputs
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
                onBlur={() => {}}
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
        <ScrollView style={{marginBottom: 15}}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
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
                onBlur={() => {}}
                icon={<Icons name="user" size={20} color="#9BA6B8" />}
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
                Cedula
              </Text>
            </View>

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
                  style={{height: 50}} // Altura para el TextInput
                />
              </View>
            </View>

            {/* Mensaje de error si el RIF es inválido */}
            {cedulaError !== '' && (
              <Text style={styles.errorStyle}>{cedulaError}</Text>
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}>
              <TextInputs
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
                onBlur={() => {}}
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
                icon={<Icons name="file" size={20} color="#9BA6B8" />}
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
            marginBottom:20
          }}>
          {/* <NavigationButton
            title="Guardar Cambios"
            color={buttonColor ? appColors.screenBg : appColors.subtitle}
            onPress={() => onHandleChange()}
            backgroundColor={'#4D66FF'}
          /> */}
          <NavigationButton
            title="Guardar Cambios"
            onPress={onHandleChange}
            disabled={isGetOtpDisabled}
            backgroundColor={isGetOtpDisabled ? '#D1D6DE' : '#4D66FF'}
            color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
          />
        </View>
      </View>
    </View>
  );
};

export default EditProfile;
