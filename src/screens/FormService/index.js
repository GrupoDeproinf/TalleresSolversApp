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
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ErrorContainer from '../../commonComponents/errorContainer';
import {
  addNow,
  myWishlist,
  whishlistEmpty,
  whishlistEmptyDesc,
} from '../../constant';
import images from '../../utils/images';
import { commonStyles } from '../../style/commonStyle.css';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useValues } from '../../../App';
import HeaderContainer from '../../commonComponents/headingContainer';
import CheckBox from 'react-native-check-box';

import { external } from '../../style/external.css';
import { Call, Edit, Profile, Key, BackLeft } from '../../utils/icon';
import styles from './style.css';
import TextInputs from '../../commonComponents/textInputs';
import { Email } from '../../assets/icons/email';
import appColors from '../../themes/appColors';
import { RadioButton, Button } from 'react-native-paper';
import { windowHeight } from '../../themes/appConstant';
import NavigationButton from '../../commonComponents/navigationButton';
import api from '../../../axiosInstance';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/FontAwesome5';

import notImageFound from '../../assets/noimageold.jpeg';
import { launchImageLibrary } from 'react-native-image-picker';
import { Buffer } from 'buffer';
import { Dropdown } from 'react-native-element-dropdown';

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

  const [images, setImages] = useState([]); // Lista de imágenes

  const [IsEdit, setIsEdit] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MyTabs' }],
    });
  };

  useEffect(() => {
    const { uid } = route.params;
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

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });
  
        // Verificar la respuesta del servidor
        const result = response.data;
        console.log("Este es el usuario encontrado", result);
  
        if (result.message === "Usuario encontrado") {
            setuserStorage(result.userData);
            if(result.userData.status == "En espera por aprobación" && result.userData.scheduled_visit != undefined){
              setChecked('no')
            }
        } 
      } catch (error) {
        // Manejo de errores
        if (error.response) {
          console.error('Error en la solicitud:', error.response.statusText);
        } else {
          console.error('Error en la solicitud:', error.message);
        }
        
      }

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

  const [loading, setLoading] = useState(false);

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

        // setimagePerfil(result.service.service_image || '')
        // setimageFirts(result.service.service_image || '')

        if (result.service.service_image?.length > 0) {
          setLoading(true)

          const dataFinal = [];

          await Promise.all(result.service.service_image.map(async (x) => {
            const base64 = await convertUrlToBase64(x);
            const data = {
              uri: x,
              base64: base64,
            };
            dataFinal.push(data);
          }));

          console.log("ya esta aqui la data")

          setImages(dataFinal);
          setLoading(false)

        }
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
    setIsButtonDisabled(true); // Disable the button
    try {
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

        let newImages = [];
        if (images.length > 0) {
          newImages = images.map(x => x.base64);
        }


        const dataFinal = {
          id: uidService == undefined || uidService == '' ? '' : uidService,
          precio: precio.replace('$', ''),
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
          images: newImages.length == 0 ? "" : newImages,
          edit: IsEdit
        };

        try {
          const response = await api.post(
            '/usuarios/saveOrUpdateService',
            dataFinal,
          );
          const result = response.data;

          if (
            result.message === 'Servicio actualizado exitosamente' ||
            result.message === 'Servicio creado exitosamente'
          ) {
            showToast(result.message);
            setModalVisible(false);
            setIsButtonDisabled(false);
            navigation.goBack();
          } else {
            showToast('Ha ocurrido un error');
            setIsButtonDisabled(false);
            setModalVisible(false);
            navigation.goBack();
          }
        } catch (error) {
          if (error.response) {
            setIsButtonDisabled(false);
            console.error(
              'Error en la solicitud:',
              error.response.data.message || error.response.statusText,
            );
          } else {
            console.error('Error en la solicitud:', error.message);
          }
          showToast('Ha ocurrido un error');
          setModalVisible(false);
          setIsButtonDisabled(false);
          navigation.goBack();
        }
      } else {
        showToast('Ingrese la información requerida');
        setIsButtonDisabled(false);
      }
    } finally {
      setIsButtonDisabled(false); // Re-enable the button
    }
  };

  const convertUrlToBase64 = async (imageUrl) => {
    try {
      const response = await api.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return base64;
    } catch (error) {
      console.error('Error convirtiendo la URL a base64:', error);
      throw error;
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
    setModalVisible2(false);
    navigationScreen.navigate('Planscreen');
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };


  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        selectionLimit: 0, // 0 para permitir seleccionar múltiples imágenes
      },
      response => {
        if (response.didCancel) {
          // Manejar cancelación
        } else if (response.error) {
          // Manejar error
        } else {
          const newImages = response.assets.map(asset => ({
            uri: asset.uri,
            base64: asset.base64,
          }));

          // if (uidService != '') {
          //   setIsEdit(true)
          // }

          setImages([...newImages, ...images]); // Añadir nuevas imágenes al inicio de la lista
        }
      },
    );
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  return (

    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        { backgroundColor: bgFullStyle },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Ajusta según tu header
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} // paddingBottom asegura que último campo quede visible
          keyboardShouldPersistTaps="handled"
        >
    
          <View
            style={[
              external.fd_row,
              external.ai_center,
              external.pt_15,
              { justifyContent: 'center' },
              { flexDirection: viewRTLStyle },
            ]}
          >
            {/* Botón de retroceso */}
            <TouchableOpacity
              onPress={() => navigation.goBack('')}
              style={{ position: 'absolute', left: 0 }}
            >
              <View style={{ transform: [{ scale: imageRTLStyle }] }}>
                <BackLeft />
              </View>
            </TouchableOpacity>
    
            {/* Nombre del taller centrado */}
            <Text
              style={[
                commonStyles.hederH2,
                external.as_center,
                { color: textColorStyle },
              ]}
            >
              {NameServicio}
            </Text>
          </View>
    
          <View style={[external.as_center, { flexDirection: 'row' }]}>
            <ScrollView horizontal={true} style={{ width: '100%', maxHeight: 150 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                <View style={{ alignItems: 'center', marginRight: 10 }}>
                  <TouchableOpacity
                    onPress={selectImage}
                    style={{
                      height: 60,
                      width: 60,
                      borderColor: '#2D3261',
                      borderWidth: 2,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icons name="plus" size={30} color="#2D3261" />
                  </TouchableOpacity>
                  <Text style={{ marginBottom: 5, color: '#2D3261', fontSize: 13 }}>
                    Agregar imagen
                  </Text>
                </View>
                {images.length === 0 && loading ? (
                  <View style={[styles.loadingContainer, { marginLeft: 50 }]}>
                    <ActivityIndicator size="large" color="#2D3261" />
                  </View>
                ) : (
                  images.map((image, index) => (
                    <View key={index} style={{ position: 'relative', marginRight: 5 }}>
                      <ImageBackground
                        resizeMode="contain"
                        style={{ height: 130, width: 130 }}
                        source={{ uri: image.uri }}
                      >
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: [{ translateX: -15 }],
                            backgroundColor: '#2D3261',
                            borderRadius: 50,
                            padding: 5,
                          }}
                        >
                          <Icons name="times" size={15} color="#fff" />
                        </TouchableOpacity>
                      </ImageBackground>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
    
          <View style={{ padding: 10 }}>
            {/* Caracteristicas */}
            <Text
              style={[
                styles.headingContainer,
                { color: textColorStyle },
                { textAlign: textRTLStyle },
              ]}>
              Caracteristicas
            </Text>
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
                width: '100%',
                paddingRight: 0,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                backgroundColor: '#fff',
                height: 50,
                justifyContent: 'center',
              }}>
              <Dropdown
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  backgroundColor: '#fff',
                  height: 50,
                }}
                placeholderStyle={{
                  color: 'gray',
                  fontSize: 14,
                }}
                selectedTextStyle={{
                  color: 'black',
                  fontSize: 14,
                }}
                data={caracteristicas.map(option => ({
                  label: option.nombre,
                  value: option.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Seleccione una característica"
                value={caracteristicaSelected}
                search={true}
                onChange={item => {
                  getSubcaracteristicas(item.value, false);
                  setcaracteristicaSelected(item.value);
                }}
                keyboardAvoiding={true}
              />
            </View>
    
            {/* Subcaracteristicas */}
            <Text
              style={[
                styles.headingContainer,
                { color: textColorStyle },
                { textAlign: textRTLStyle },
              ]}>
              Subcaracteristicas
            </Text>
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
                width: '100%',
                paddingRight: 0,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                backgroundColor: '#fff',
                height: 50,
                justifyContent: 'center',
              }}>
              <Dropdown
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  backgroundColor: '#fff',
                  height: 50,
                }}
                placeholderStyle={{
                  color: 'gray',
                  fontSize: 14,
                }}
                selectedTextStyle={{
                  color: 'black',
                  fontSize: 14,
                }}
                data={Subcaracteristicas.map(option => ({
                  label: option.nombre,
                  value: option.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Seleccione una subcaracterística"
                value={SubcaracteristicaSelected}
                search={true}
                onChange={item => {
                  console.log("Estoy en el select");
                  setSubcaracteristicaSelected(item.value);
                }}
                dropdownPosition="top"
                keyboardAvoiding={true}
              />
            </View>
    
            {/* Nombre del servicio */}
           
              <TextInputs
                fullWidth={"100%"}
                title="Nombre del servicio"
                value={Nombre}
                placeHolder="Nombre del servicio"
                onChangeText={text => {
                  setNombre(text);
                  setNombreError(text.trim() === '' ? 'Nombre es requerido' : '');
                }}
                onBlur={() => { }}
                icon={<Icons name="gears" size={20} color="#9BA6B8" />}
              />
    
            {/* precio del servicio */}
              <TextInputs
                fullWidth={"100%"}
                title="Precio"
                value={precio}
                placeHolder="Precio del servicio"
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  const formattedText = numericText ? `$${numericText}` : '';
                  setprecio(formattedText);
                  setsetprecioError(
                    numericText.trim() === '' ? 'Precio es requerido' : ''
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="money" size={20} color="#9BA6B8" />}
                keyboardType="numeric"
              />
            
    
            {/*Descripcion del servicio  */}
            
              <TextInputs
                fullWidth={"100%"}
                title="Descripción del servicio"
                value={Description}
                placeHolder="Descripción del servicio"
                // multiline={true}
                // numberOfLines={10}
                // height={150}
                onChangeText={text => {
                  setDescription(text);
                  setsetDescriptionError(
                    text.trim() === '' ? 'Descripción es requerida' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="file-text" size={20} color="#9BA6B8" />}
              />
    
            {/* Garantia del servicio */}
            
              <TextInputs
                fullWidth={"100%"}
                title="Garantía del servicio"
                value={Garantia}
                placeHolder="Garantía del servicio"
                // multiline={true}
                // numberOfLines={10}
                // height={150}
                onChangeText={text => {
                  setGarantia(text);
                  setsetGarantiaError(
                    text.trim() === '' ? 'Garantía es requerida' : '',
                  );
                }}
                onBlur={() => { }}
                icon={<Icons name="file-text-o" size={20} color="#9BA6B8" />}
              />
    
            {/* Estado del servicio */}

            {
              userStorage?.status == "En espera por aprobación" || userStorage?.subscripcion_actual?.status != 'Aprobado' ? null : (
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
                    <Text style={{ color: 'black' }}>Sí</Text>
        
                    <RadioButton
                      value="no"
                      status={checked === 'no' ? 'checked' : 'unchecked'}
                      onPress={() => setChecked('no')}
                    />
                    <Text style={{ color: 'black' }}>No</Text>
                  </View>
                </View>
              )
            }


            
          </View>
    
          <View style={{ marginBottom: 15 }}>
            <View
              style={{
                backgroundColor: buttonColor,
                borderRadius: windowHeight(20),
                marginBottom: 15,
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
                    style={[
                      stylesModal.buttonYes,
                      { opacity: isButtonDisabled ? 0.5 : 1 },
                    ]}
                    onPress={onConfirm}
                    disabled={isButtonDisabled}
                  >
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
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#2D3261', // Color del botón "Sí"
    borderRadius: 5,
    padding: 10,
    width: '48%', // Ajustar ancho para espacio entre botones
    alignItems: 'center',
  },
  buttonNo: {
    backgroundColor: '#bdbdbd', // Color del botón "No"
    borderRadius: 5,
    color: '#2D3261',
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
