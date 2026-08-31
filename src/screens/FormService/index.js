import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  Image,
  ToastAndroid,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import ErrorContainer from '../../commonComponents/errorContainer';

const SCREEN_WIDTH = Dimensions.get('window').width;

const capitalizeSentence = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

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
import styles from './style.css';
import TextInputs from '../../commonComponents/textInputs';
import { Email } from '../../assets/icons/email';
import { RadioButton } from 'react-native-paper';
import { windowHeight } from '../../themes/appConstant';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../../axiosInstance';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/FontAwesome5';

import notImageFound from '../../assets/noimageold.jpeg';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import IconsIon from 'react-native-vector-icons/Ionicons';
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

  const [tipoAccion, settipoAccion] = useState('');
  const [uidTaller, setuidTaller] = useState('');

  // uid_taller recibido desde FormTaller (agente cargando servicio para otro taller)
  const [uidTallerOverride, setUidTallerOverride] = useState('');
  const [nombreTallerOverride, setNombreTallerOverride] = useState('');

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

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState('');

  const [IsEdit, setIsEdit] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const registroCompletedRef = useRef(false);

  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MyTabs' }],
    });
  };

  // Cuando viene del flujo de registro, el back queda bloqueado hasta que el usuario guarde
  useEffect(() => {
    if (route.params?.fromRegistro !== true) return;
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (registroCompletedRef.current) return; // el usuario presionó Entendido, dejar pasar
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation, route.params?.fromRegistro]);

  useEffect(() => {
    const { uid, uid_taller, nombre_taller } = route.params;
    setModalVisible(false);
    getUserActive();
    getDataServiceActivos();

    // Si viene desde FormTaller (agente cargando servicio para un taller)
    if (uid_taller) {
      setUidTallerOverride(uid_taller);
    }
    if (nombre_taller) {
      setNombreTallerOverride(nombre_taller);
    }

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


        // Si viene desde FormTaller usa el uid/nombre del taller destino,
        // si no usa el del usuario logueado.
        const resolvedUidTaller = uidTallerOverride || userStorage.uid;
        const resolvedNombreTaller = uidTallerOverride
          ? (nombreTallerOverride || userStorage.nombre)
          : userStorage.nombre;

        const dataFinal = {
          id: uidService == undefined || uidService == '' ? '' : uidService,
          precio: precio.replace('$', ''),
          uid_servicio:
            uidService == undefined || uidService == '' ? '' : uidService,
          categoria: categoria,
          uid_categoria: caracteristicaSelected,
          taller: resolvedNombreTaller,
          uid_taller: resolvedUidTaller,
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

          const fromRegistro = route.params?.fromRegistro === true;
          if (
            result.message === 'Servicio actualizado exitosamente' ||
            result.message === 'Servicio creado exitosamente'
          ) {
            setModalVisible(false);
            setIsButtonDisabled(false);
            if (fromRegistro) {
              setShowRegistroModal(true);
            } else {
              showToast(result.message);
              navigation.goBack();
            }
          } else {
            showToast('Ha ocurrido un error');
            setIsButtonDisabled(false);
            setModalVisible(false);
            if (fromRegistro) {
              navigation.reset({ index: 0, routes: [{ name: 'DrawerScreen' }] });
            } else {
              navigation.goBack();
            }
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
    navigationScreen.navigate('PlanesRegistro', {fromPlanesTaller: true});
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };


  const fileToBase64 = uri =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });

  const applyPhotoResult = (target, uri, b64) => {
    if (target === 'imagen') {
      setImages(prev => [{ uri, base64: b64 }, ...prev]);
    }
  };

  const openPhotoOptions = target => {
    setPhotoModalTarget(target);
    setPhotoModalVisible(true);
  };

  const handlePickGallery = () => {
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary(
        { mediaType: 'photo', includeBase64: true, selectionLimit: 0 },
        response => {
          if (response.didCancel || response.error) return;
          response.assets.forEach(asset => {
            applyPhotoResult(photoModalTarget, asset.uri, asset.base64);
          });
        },
      );
    }, 400);
  };

  const handlePickCamera = async () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera(
        { mediaType: 'photo', includeBase64: true },
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64);
        },
      );
    }, 400);
  };

  const handlePickDocument = () => {
    setPhotoModalVisible(false);
    setTimeout(async () => {
      try {
        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
        const b64 = await fileToBase64(res.uri);
        applyPhotoResult(photoModalTarget, res.uri, b64);
      } catch (e) {
        if (!DocumentPicker.isCancel(e)) console.warn(e);
      }
    }, 400);
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

  const dropdownCommon = {
    placeholderStyle: { color: '#64748B', fontSize: 13 },
    selectedTextStyle: { color: '#1F2344', fontSize: 13, fontWeight: '600' },
    itemTextStyle: { fontSize: 13 },
  };

  return (
    <View
      style={[
        commonStyles.commonContainer,
        { flex: 1, backgroundColor: bgFullStyle },
      ]}>
      <View
        style={[
          styles.formHeaderWrapper,
          { paddingTop: insets.top + windowHeight(3.8) },
        ]}>
        <View style={styles.formHeaderCircle1} />
        <View style={styles.formHeaderCircle2} />
        {route.params?.fromRegistro !== true && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={[
              styles.formHeaderBackBtn,
              { top: insets.top + windowHeight(2) },
            ]}>
            <View style={{ transform: [{ scale: imageRTLStyle }] }}>
              <Icons name="angle-left" size={22} color="#FFD60A" />
            </View>
          </TouchableOpacity>
        )}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.formHeaderTitle} numberOfLines={2}>
            {route.params?.fromRegistro === true
              ? 'Registra tu primer servicio'
              : capitalizeSentence(NameServicio)}
          </Text>
          <Text style={styles.formHeaderSubtitle}>
            {capitalizeSentence('Completa la información de tu servicio')}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingBottom: 16,
            paddingTop: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.formPhotoHeroOuter,
              { width: SCREEN_WIDTH, marginHorizontal: -20 },
            ]}>
            <View style={styles.formPhotoHero}>
              <Text
                style={[
                  styles.formPhotoHeroTitle,
                  { textAlign: textRTLStyle },
                ]}>
                Galería del servicio
              </Text>
              <Text
                style={[
                  styles.formPhotoHeroHint,
                  { textAlign: textRTLStyle },
                ]}>
                Desliza el carrusel horizontal para ver todas · abajo puedes agregar más
              </Text>

              <View style={styles.formPhotoStripWrap}>
                {loading && images.length === 0 ? (
                  <View style={styles.formPhotoLoadingBox}>
                    <ActivityIndicator size="large" color="#2D3261" />
                    <Text style={styles.formPhotoLoadingText}>
                      Cargando imágenes…
                    </Text>
                  </View>
                ) : images.length === 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openPhotoOptions('imagen')}
                    style={styles.formPhotoPlaceholderSlide}>
                    <Image
                      source={require('../../assets/Imagen1.png')}
                      style={styles.formPhotoPlaceholderLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.formPhotoPlaceholderIconWrap}>
                      <Icons name="camera" size={36} color="#1F2344" />
                    </View>
                    <Text style={styles.formPhotoPlaceholderTitle}>
                      Aún no hay fotos
                    </Text>
                    <Text style={styles.formPhotoPlaceholderSub}>
                      Toca aquí para elegir imágenes desde tu galería
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.formPhotoStrip}
                    contentContainerStyle={[
                      styles.formPhotoStripContent,
                      { flexDirection: viewRTLStyle },
                    ]}>
                    {images.map((image, index) => (
                      <View
                        key={`${image.uri}-${index}`}
                        style={styles.formPhotoCell}>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.formPhotoCellImage}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          style={styles.formPhotoCellRemove}
                          activeOpacity={0.85}
                          hitSlop={{
                            top: 6,
                            bottom: 6,
                            left: 6,
                            right: 6,
                          }}>
                          <Icons name="trash-o" size={14} color="#FFD60A" />
                        </TouchableOpacity>
                        <View style={styles.formPhotoCellBadge}>
                          <Text style={styles.formPhotoCellBadgeText}>
                            {index + 1}/{images.length}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.formPhotoFormCard}>
              <TouchableOpacity
                style={[
                  styles.formPhotoAddBar,
                  { flexDirection: viewRTLStyle },
                ]}
                onPress={() => openPhotoOptions('imagen')}
                activeOpacity={0.88}>
                <View style={styles.formPhotoAddBarIcon}>
                  <Icons name="plus-circle" size={22} color="#1F2344" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.formPhotoAddBarTitle}>
                    Agregar o cambiar fotos
                  </Text>
                  <Text style={styles.formPhotoAddBarSub}>
                    JPG o PNG · varias a la vez
                  </Text>
                </View>
                <Icons name="chevron-right" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.formServiceFieldsCard}>
            <View
              style={[
                styles.formRowDropdowns,
                styles.formRowDropdownsInCard,
                { flexDirection: viewRTLStyle },
              ]}>
              <View style={styles.formDropdownCol}>
                <Text
                  style={[
                    styles.formDropdownLabel,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}>
                  {capitalizeSentence('categoría')}
                </Text>
                <View style={styles.formDropdownBox}>
                  <Dropdown
                    style={{ width: '100%', minHeight: 48 }}
                    {...dropdownCommon}
                    data={caracteristicas.map(option => ({
                      label: capitalizeSentence(option.nombre),
                      value: option.id,
                    }))}
                    labelField="label"
                    valueField="value"
                    placeholder={capitalizeSentence('categoría')}
                    value={caracteristicaSelected}
                    search
                    onChange={item => {
                      getSubcaracteristicas(item.value, false);
                      setcaracteristicaSelected(item.value);
                    }}
                    keyboardAvoiding
                  />
                </View>
              </View>
              <View style={styles.formDropdownCol}>
                <Text
                  style={[
                    styles.formDropdownLabel,
                    { color: textColorStyle, textAlign: textRTLStyle },
                  ]}>
                  {capitalizeSentence('subcategoría')}
                </Text>
                <View style={styles.formDropdownBox}>
                  <Dropdown
                    style={{ width: '100%', minHeight: 48 }}
                    {...dropdownCommon}
                    data={Subcaracteristicas.map(option => ({
                      label: capitalizeSentence(option.nombre),
                      value: option.id,
                    }))}
                    labelField="label"
                    valueField="value"
                    placeholder={capitalizeSentence('subcategoría')}
                    value={SubcaracteristicaSelected}
                    search
                    onChange={item => {
                      setSubcaracteristicaSelected(item.value);
                    }}
                    dropdownPosition="top"
                    keyboardAvoiding
                  />
                </View>
              </View>
            </View>

            <TextInputs
              formCardMode
              fullWidth={'100%'}
              title="Nombre del servicio"
              value={Nombre}
              placeHolder="Nombre del servicio"
              onChangeText={text => {
                setNombre(text);
                setNombreError(text.trim() === '' ? 'Nombre es requerido' : '');
              }}
              onBlur={() => {}}
              icon={<Icons name="gears" size={20} color="#64748B" />}
            />

            <TextInputs
              formCardMode
              fullWidth={'100%'}
              title="Precio"
              titleHint="Desde aquí partes al cotizar (Referencia minima)"
              value={precio}
              placeHolder="Precio del servicio"
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                const formattedText = numericText ? `$${numericText}` : '';
                setprecio(formattedText);
                setsetprecioError(
                  numericText.trim() === '' ? 'Precio es requerido' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="money" size={20} color="#64748B" />}
              keyboardType="numeric"
            />

            <TextInputs
              formCardMode
              fullWidth={'100%'}
              title="Descripción del servicio"
              value={Description}
              placeHolder="Describe brevemente tu servicio"
              multiline
              numberOfLines={5}
              height={128}
              onChangeText={text => {
                setDescription(text);
                setsetDescriptionError(
                  text.trim() === '' ? 'Descripción es requerida' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="file-text" size={20} color="#64748B" />}
            />

            <TextInputs
              formCardMode
              fullWidth={'100%'}
              title="Garantía del servicio"
              value={Garantia}
              placeHolder="Ej. 30 días, 1 año en repuestos…"
              onChangeText={text => {
                setGarantia(text);
                setsetGarantiaError(
                  text.trim() === '' ? 'Garantía es requerida' : '',
                );
              }}
              onBlur={() => {}}
              icon={<Icons name="file-text-o" size={20} color="#64748B" />}
            />

            {userStorage?.status == 'En espera por aprobación' ||
            userStorage?.subscripcion_actual?.status != 'Aprobado' ? null : (
              <View
                style={[
                  styles.formRadioBlock,
                  styles.formRadioBlockInCard,
                  styles.formPublishWrap,
                ]}>
                <View
                  style={[
                    styles.formPublishHeader,
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <View style={styles.formPublishIconCircle}>
                    <Icons name="eye" size={18} color="#1F2344" />
                  </View>
                  <View style={styles.formPublishHeaderText}>
                    <Text
                      style={[
                        styles.formPublishTitle,
                        { color: textColorStyle, textAlign: textRTLStyle },
                      ]}>
                      Visibilidad en el catálogo
                    </Text>
                    <Text
                      style={[
                        styles.formPublishHint,
                        { textAlign: textRTLStyle },
                      ]}>
                      Elige si los clientes pueden encontrar y ver este servicio
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.formPublishChipsRow,
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setChecked('si')}
                    style={[
                      styles.formPublishChip,
                      checked === 'si' && styles.formPublishChipSelected,
                    ]}>
                    <RadioButton
                      value="si"
                      status={checked === 'si' ? 'checked' : 'unchecked'}
                      onPress={() => setChecked('si')}
                      color="#1F2344"
                    />
                    <View style={styles.formPublishChipTextCol}>
                      <Text
                        style={[
                          styles.formPublishChipTitle,
                          { color: textColorStyle },
                        ]}>
                        Visible
                      </Text>
                      <Text style={styles.formPublishChipSub}>
                        Aparece en búsquedas
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setChecked('no')}
                    style={[
                      styles.formPublishChip,
                      checked === 'no' && styles.formPublishChipSelected,
                    ]}>
                    <RadioButton
                      value="no"
                      status={checked === 'no' ? 'checked' : 'unchecked'}
                      onPress={() => setChecked('no')}
                      color="#1F2344"
                    />
                    <View style={styles.formPublishChipTextCol}>
                      <Text
                        style={[
                          styles.formPublishChipTitle,
                          { color: textColorStyle },
                        ]}>
                        Oculto
                      </Text>
                      <Text style={styles.formPublishChipSub}>
                        Solo tú lo ves
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.formFooter,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: bgFullStyle,
          },
        ]}>
        <TouchableOpacity
          style={[styles.formFooterBtn, { opacity: isButtonDisabled ? 0.55 : 1 }]}
          onPress={() => onHandleChange('Aprobar')}
          activeOpacity={0.88}
          disabled={isButtonDisabled}>
          <Icons name="save" size={20} color="#FFD60A" />
          <Text style={styles.formFooterBtnText}>Guardar cambios</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={onCancel}>
        <View style={stylesModal.overlay}>
          <View style={stylesModal.modalView}>
            <View style={stylesModal.headerChip}>
              <Text style={stylesModal.headerChipText}>CONFIRMACIÓN</Text>
            </View>
            <View style={stylesModal.modalIconCircle}>
              <Icons name="save" size={24} color="#1F2344" />
            </View>
            <Text style={stylesModal.modalTitle}>¿Guardar cambios?</Text>
            <Text style={stylesModal.modalSubtitle}>
              ¿Estás seguro de que quieres aplicar estos cambios al servicio?
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity
                style={[
                  stylesModal.buttonSecondary,
                  { flex: 1 },
                ]}
                onPress={onCancel}
                activeOpacity={0.88}>
                <Text style={stylesModal.buttonTextSecondary}>No, volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesModal.buttonPrimary,
                  { flex: 1, opacity: isButtonDisabled ? 0.5 : 1 },
                ]}
                onPress={onConfirm}
                disabled={isButtonDisabled}
                activeOpacity={0.88}>
                <Icons name="check" size={18} color="#FFD60A" />
                <Text style={stylesModal.buttonTextPrimary}>Sí, guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible2}
        onRequestClose={onCancel2}>
        <View style={stylesModal.overlay}>
          <View style={stylesModal.modalView}>
            <View style={stylesModal.headerChip}>
              <Text style={stylesModal.headerChipText}>TU PLAN</Text>
            </View>
            <View style={stylesModal.modalIconCircle}>
              <Icons name="exclamation-triangle" size={24} color="#1F2344" />
            </View>
            <Text style={stylesModal.modalTitle}>Límite de servicios</Text>
            <Text style={stylesModal.modalBody}>
              Has alcanzado la cantidad máxima de servicios de tu plan actual.
              Para crear más servicios, actualiza tu plan.
            </Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity
                style={[stylesModal.buttonSecondary, { flex: 1 }]}
                onPress={onCancel2}
                activeOpacity={0.88}>
                <Text style={stylesModal.buttonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[stylesModal.buttonPrimary, { flex: 1 }]}
                onPress={gotoPlans}
                activeOpacity={0.88}>
                <Icons name="arrow-right" size={16} color="#FFD60A" />
                <Text style={stylesModal.buttonTextPrimary}>Ir a planes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal selector de foto ────────────────────────────────────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,68,0.55)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPhotoModalVisible(false)} />
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 22 }} />
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2344', textAlign: 'center', marginBottom: 6 }}>
              Adjuntar imagen o archivo
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              Seleccione una opción para capturar{'\n'}la imagen y comprobar el documento
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Documento', icon: 'document-attach-outline', onPress: handlePickDocument },
                { label: 'Galería',   icon: 'images-outline',          onPress: handlePickGallery },
                { label: 'Cámara',    icon: 'camera-outline',          onPress: handlePickCamera },
              ].map(({ label, icon, onPress }) => (
                <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.75}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20,
                    borderRadius: 18, backgroundColor: '#F0F1FA', borderWidth: 1.5, borderColor: '#2D3261' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#2D3261',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <IconsIon name={icon} size={26} color="#FFD60A" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)}
              style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: '#F0F1FA', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal post-registro: solo aparece al guardar el primer servicio del flujo de registro */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRegistroModal}
        onRequestClose={() => {}}>
        <View style={registroModalStyles.overlay}>
          <View style={registroModalStyles.card}>
            <Text style={registroModalStyles.emoji}>🏁</Text>
            <Text style={registroModalStyles.title}>¡Servicio guardado!</Text>
            <Text style={registroModalStyles.body}>
              Tu negocio ya está en lista de espera para aprobación.
            </Text>
            <View style={registroModalStyles.infoRow}>
              <Text style={registroModalStyles.infoEmoji}>📞</Text>
              <Text style={registroModalStyles.infoText}>
                Pronto te contactaremos para activar tu cuenta.
              </Text>
            </View>
            <View style={[registroModalStyles.infoRow, registroModalStyles.infoRowBlue]}>
              <Text style={registroModalStyles.infoEmoji}>➕</Text>
              <Text style={[registroModalStyles.infoText, { color: '#3730A3' }]}>
                ¡Adelanta trabajo! Usa el botón{' '}
                <Text style={{ fontWeight: 'bold' }}>+</Text> para seguir
                agregando servicios a tu catálogo.
              </Text>
            </View>
            <TouchableOpacity
              style={registroModalStyles.btn}
              activeOpacity={0.9}
              onPress={() => {
                registroCompletedRef.current = true;
                setShowRegistroModal(false);
                navigation.reset({ index: 0, routes: [{ name: 'DrawerScreen' }] });
              }}>
              <Text style={registroModalStyles.btnText}>¡Entendido!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const registroModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1E56',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7E6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  infoRowBlue: {
    backgroundColor: '#EEF2FF',
  },
  infoEmoji: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#1D1E56',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  btnText: {
    color: '#FFD60A',
    fontWeight: '800',
    fontSize: 15,
  },
});

const stylesModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9,13,46,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#D9E2F3',
    shadowColor: '#1F2344',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  headerChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  headerChipText: {
    color: '#FFD60A',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE6A8',
    marginBottom: 14,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '900',
    color: '#1F2344',
    lineHeight: 28,
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#5B6383',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  modalBody: {
    textAlign: 'center',
    color: '#5B6383',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
    paddingHorizontal: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F2344',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFD60A',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  buttonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonTextSecondary: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default FormTaller;
