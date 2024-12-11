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
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/FontAwesome5';

import notImageFound from '../../assets/noimageold.jpeg';
import { launchImageLibrary } from 'react-native-image-picker';
import { Buffer } from 'buffer';

const FormTaller = () => {
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

  const [seguro, setseguro] = useState('');
  const [seguroError, setseguroError] = useState('');
  const [seguroTyping, setseguroTyping] = useState(false);

  // *******************************************

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

  const [tipoAccion, settipoAccion] = useState('');
  const [uidTaller, setuidTaller] = useState('');

  // Nuevo

  const [caracteristicas, setcaracteristicas] = useState([]);
  const [caracteristicaSelected, setcaracteristicaSelected] = useState('');
  const [Subcaracteristicas, setSubcaracteristicas] = useState([]);
  const [SubcaracteristicaSelected, setSubcaracteristicaSelected] =
    useState('');
  const [NameServicio, setNameServicio] = useState('');
  const [precio, setprecio] = useState(0);
  const [setprecioError, setsetprecioError] = useState('');

  const [Description, setDescription] = useState(0);
  const [setDescriptionError, setsetDescriptionError] = useState('');

  const [Garantia, setGarantia] = useState(0);
  const [setGarantiaError, setsetGarantiaError] = useState('');

  const [checked, setChecked] = useState('no'); // Valor i

  const [isChecked, setisChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [uidService, setuidService] = useState(false);

  const [userStorage, setuserStorage] = useState(false);

  const [cantServices, setcantServices] = useState(0);

  const navigationScreen = useNavigation();

  const [publicOrigin, setpublicOrigin] = useState(false);

  const [imagePerfil, setimagePerfil] = useState("");
  const [base64, setBase64] = useState(null);
  
  const [imageFirts, setimageFirts] = useState("");


  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MyTabs'}],
    });
  };

  useEffect(() => {
    const {uid} = route.params;
    setModalVisible(false);
    getUserActive();
    getDataServiceActivos();

    if (uid != undefined && uid != '') {
      setuidTaller(uid);
      getData(uid);
    } else {
      setNameServicio('Nuevo Servicio');
      getCaracteristicas(true);
      setNombre('');
      setcaracteristicaSelected('');
      setSubcaracteristicaSelected('');
      setprecio(0);
      setDescription('');
      setGarantia('');
      setChecked('no');
      setuidService('');
      const inicial = [
        {
          id: '',
          nombre: 'Seleccione una subcategoría',
          descripcion: 'Seleccione una subcategoría',
          estatus: true,
        },
      ];
      setSubcaracteristicas(inicial);
    }
  }, []);

  const getUserActive = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
     
      setuserStorage(user);
    } catch (e) {
      // error reading value
    }
  };

  const getCaracteristicas = async loadData => {
    try {
      // Hacer la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const result = response.data;

        if (result.categories.length > 0) {
          if (loadData) {
            setcaracteristicaSelected('');
            // getSubcaracteristicas(result.categories[0].id, true);
          }
        }
        if (result.categories.length > 0) {
          result.categories.unshift({
            id: '',
            descripcion: 'Seleccione una categoría',
            fechaCreacion: '',
            logoUrl: '',
            nombreUser: '',
            uid: '',
            estatus: true,
            nombre: 'Seleccione una categoría',
          });
        }
        setcaracteristicas(result.categories);
      } else {
        setcaracteristicas([]);
      }
    } catch (error) {
      setcaracteristicas([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const getSubcaracteristicas = async (uid, loadData) => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post(
        '/usuarios/getSubcategoriesByCategoryUid',
        {
          uid_categoria: uid,
        },
      );

      // Verificar la respuesta del servidor
      const result = response.data;

      if (result.message === 'Subcategorías encontradas') {

        if (result.subcategories.length > 0) {
          console.log("aqui****************************************************** ", loadData)
          if (loadData) {
            console.log("entras aqui ?")
            setSubcaracteristicaSelected(result.subcategories[0].id)
          }

          const inicial = {
              id: '',
              nombre: 'Seleccione una subcategoría',
              descripcion: 'Seleccione una subcategoría',
              estatus: true,
            }
          
          console.log(result.subcategories)

          result.subcategories.unshift(inicial)
        }
        
        setSubcaracteristicas(result.subcategories);

      } else {
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const getData = async uid => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/getServiceByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;

      if (result.message === 'Servicio encontrado') {
        setNombre(result.service.nombre_servicio || '');

        setNameServicio(result.service.nombre_servicio);

        setcaracteristicaSelected(result.service.uid_categoria || '');
        setSubcaracteristicaSelected(result.service.uid_subcategoria || '');
        getCaracteristicas(false);
        getSubcaracteristicas(result.service.uid_categoria, false);

        setprecio(result.service.precio || 0);
        setDescription(result.service.descripcion || '');
        setGarantia(result.service.garantia || '');
        setChecked(result.service.estatus ? 'si' : 'no' || false);
        setuidService(result.service.id || '');

        setpublicOrigin(result.service.estatus);

        setimagePerfil(result.service.service_image || '')
        setimageFirts(result.service.service_image || '')

      } else {
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
    isDark,
    textRTLStyle,
    t,
  } = useValues();

  const onHandleChange = type => {

    if (checked == 'no') {
      settipoAccion(type);
      setModalVisible(true);
    } else {
      if (publicOrigin) {
        settipoAccion(type);
        setModalVisible(true);
      } else {
        if (Number(cantServices) == 0 || Number(cantServices) < 0) {
          setModalVisible2(true);
        } else {
          settipoAccion(type);
          setModalVisible(true);
        }
      }
    }
  };

  const onCancel = () => {
    setModalVisible(false);
  };

  const onCancel2 = () => {
    setModalVisible2(false);
  };
  
  const getImageName = (url) => url.split('/').pop();

  const onConfirm = async () => {
    if (
      Nombre != '' &&
      Nombre != undefined &&
      Nombre != undefined &&
      caracteristicaSelected != '' &&
      caracteristicaSelected != undefined &&
      caracteristicaSelected != undefined &&
      SubcaracteristicaSelected != '' &&
      SubcaracteristicaSelected != undefined &&
      precio != '' &&
      precio != undefined &&
      precio != undefined &&
      Description != '' &&
      Description != undefined &&
      Description != undefined &&
      Garantia != '' &&
      Garantia != undefined &&
      Garantia != undefined
    ) {
      const categoria =
        caracteristicas.find(c => c.id === caracteristicaSelected)?.nombre ||
        '';

      const subcategoria =
        Subcaracteristicas.find(c => c.id === SubcaracteristicaSelected)
          ?.nombre || '';

      const dataFinal = {
        id: uidService == undefined || uidService == '' ? '' : uidService,
        precio: precio,
        uid_servicio:
          uidService == undefined || uidService == '' ? '' : uidService,
        categoria: categoria,
        uid_categoria: caracteristicaSelected,
        taller: userStorage.nombre,
        uid_taller: userStorage.uid,
        nombre_servicio: Nombre,
        descripcion: Description,
        subcategoria: subcategoria,
        uid_subcategoria: SubcaracteristicaSelected,
        puntuacion: 4,
        garantia: Garantia,
        estatus: checked == 'si' ? true : false,
        publicOrigin: publicOrigin,
        base64:base64,
        imageTodelete: imageFirts != "" ? getImageName(imageFirts) : ""
      };

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post(
          '/usuarios/saveOrUpdateService',
          dataFinal,
        );
        // Verificar la respuesta del servidor
        const result = response.data;

        if (
          result.message === 'Servicio actualizado exitosamente' ||
          result.message === 'Servicio creado exitosamente'
        ) {
          showToast(result.message);
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
      showToast('Ingrese la información requerida');
    }
  };

  const getDataServiceActivos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });

        // Verificar la respuesta del servidor
        const result = response.data;

        if (result.message === 'Usuario encontrado') {
          
          setcantServices(
            result.userData.subscripcion_actual.cantidad_servicios,
          );
        } else {
        }
      } catch (error) {
        if (error.response) {
          console.error(
            'Error en la solicitud122222:',
            error.response.statusText,
          );
        } else {
          console.error('Error en la solicitud:12323423', error.message);
        }
      }
    } catch (e) {
    }
  };

  const gotoPlans = () => {
    navigationScreen.navigate('Planscreen');
  };

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
          {NameServicio}
        </Text>
      </View>

        
      <View style={[external.as_center]}>

        {imagePerfil == null || imagePerfil == "" ? (
          <TouchableOpacity onPress={selectImage}>
          <Image
            resizeMode="contain"
            style={[styles.imgStyle, { height: 130, width: 130 }]}
            source={notImageFound} // Reemplaza esto con la variable que contiene tu imagen
          />
          <View
            style={[
              styles.editIconStyle,
              { backgroundColor: '#F3F5FB' },
              { borderRadius: 100 },
              { position: 'absolute', top: 20, right: 0, margin: 0 },
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


      {/* <View style={[external.as_center]}>
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
      </View> */}

      <ScrollView style={{marginBottom: 15}}>
        <View style={{padding: 10}}>
          {/* Caracteristicas */}
          <Text
            style={[
              styles.headingContainer,
              {color: textColorStyle},
              {textAlign: textRTLStyle},
            ]}>
            Caracteristicas
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <Icons2 name="grip-vertical" size={20} color="#9BA6B8" />
            <Picker
              selectedValue={caracteristicaSelected}
              onValueChange={itemValue => {
                getSubcaracteristicas(itemValue, false);
                setcaracteristicaSelected(itemValue);
              }}
              style={{
                width: '100%',
                height: 0, // Altura para el Picker
                color: 'black',
              }}>
              {caracteristicas.map(option => (
                <Picker.Item
                  key={option.id}
                  label={option.nombre}
                  value={option.id}
                />
              ))}
            </Picker>
          </View>

          {/* Subcaracteristicas */}
          {/* Caracteristicas */}
          <Text
            style={[
              styles.headingContainer,
              {color: textColorStyle},
              {textAlign: textRTLStyle},
            ]}>
            Subcaracteristicas
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <Icons2 name="grip-horizontal" size={20} color="#9BA6B8" />
            <Picker
              selectedValue={SubcaracteristicaSelected}
              onValueChange={itemValue => {
                console.log("Estoy en el select")
                setSubcaracteristicaSelected(itemValue);
              }}
              style={{
                width: '100%',
                height: 0, // Altura para el Picker
                color: 'black',
              }}>
              {Subcaracteristicas.map(option => (
                <Picker.Item
                  key={option.id}
                  label={option.nombre}
                  value={option.id}
                />
              ))}
            </Picker>
          </View>

          {/* Nombre del servicio */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              marginTop: -5,
            }}>
            <TextInputs
              fullWidth={290}
              title="Nombre del servicio"
              value={Nombre}
              onChangeText={text => {
                setNombre(text);
                setNombreError(text.trim() === '' ? 'Nombre es requerido' : '');
              }}
              onBlur={() => {}}
              icon={<Icons name="gears" size={20} color="#9BA6B8" />}
            />
          </View>

          {/* precio del servicio */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <TextInputs
              fullWidth={290}
              title="Precio"
              value={precio}
              placeHolder="Precio del servicio"
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                setprecio(numericText);
                setsetprecioError(
                  numericText.trim() === '' ? 'Precio es requerido' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="money" size={20} color="#9BA6B8" />}
              keyboardType="numeric"
            />
          </View>

          {/*Descripcion del servicio  */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <TextInputs
              fullWidth={290}
              title="Descripción del servicio"
              value={Description}
              placeHolder="Descripción del servicio"
              multiline={true}
              numberOfLines={10}
              // minHeight= {600}
              height={150}
              // textAlignVertical= {'top'}
              onChangeText={text => {
                setDescription(text);
                setsetDescriptionError(
                  text.trim() === '' ? 'Descripción es requerida' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="file-text" size={20} color="#9BA6B8" />}
            />
          </View>

          {/* Garantia del servicio */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <TextInputs
              fullWidth={290}
              title="Garantía del servicio"
              value={Garantia}
              placeHolder="Garantía del servicio"
              multiline={true}
              numberOfLines={10}
              // minHeight= {600}
              height={150}
              // textAlignVertical= {'top'}
              onChangeText={text => {
                setGarantia(text);
                setsetGarantiaError(
                  text.trim() === '' ? 'Garantía es requerida' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="file-text-o" size={20} color="#9BA6B8" />}
            />
          </View>

          {/* Estado del servicio */}
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
              ¿Publicado?
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
            title="Guardar Cambios"
            onPress={() => onHandleChange('Aprobar')}
            backgroundColor={'#2D3261'}
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
              ¿Estás seguro de que quieres aplicar estos cambios?
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

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible2}
        onRequestClose={onCancel2}>
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>
              Usted ha alcanzado la cantidad máxima de servicios permitidos en
              su plan. Para crear nuevos servicios, debe actualizar su plan.
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity
                style={stylesModal.buttonYes}
                onPress={gotoPlans}>
                <Text style={stylesModal.buttonText}>Ir a planes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={stylesModal.buttonNo}
                onPress={onCancel2}>
                <Text style={stylesModal.buttonText}>Cancelar</Text>
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
