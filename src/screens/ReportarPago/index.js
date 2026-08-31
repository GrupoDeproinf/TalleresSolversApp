import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Modal,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { successfullyReset } from '../../constant';
import { external } from '../../style/external.css';
import appColors from '../../themes/appColors';
import { commonStyles } from '../../style/commonStyle.css';
import { fontSizes, windowWidth } from '../../themes/appConstant';
import SolidLine from '../../commonComponents/solidLine';
import { otherPaymentMode, paymentData } from '../../data/paymentData';
import DashedBorderComponent from '../../commonComponents/dashBorder';
import BottomContainer from '../../commonComponents/bottomContainer';
import { BackLeft, Cross, SendMoney } from '../../utils/icon';
import RadioButton from '../../commonComponents/radioButton';
import { styles } from './style.css';
import CommonModal from '../../commonComponents/commonModel';
import images from '../../utils/images';
import NavigationButton from '../../commonComponents/navigationButton';
import TextInputs from '../../commonComponents/textInputs';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons3 from 'react-native-vector-icons/FontAwesome5';

import Icons4 from 'react-native-vector-icons/FontAwesome6';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Icons2 from 'react-native-vector-icons/Ionicons';
import { Buffer } from 'buffer';

import DatePicker from 'react-native-date-picker';

import { windowHeight } from '../../themes/appConstant';

import { Dropdown } from 'react-native-element-dropdown';



const ReportarPago = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addItem, setAddItem] = useState(false);

  const [PrecioPago, setPrecioPago] = useState(null);

  const [nombrePlan, setnombrePlan] = useState(null);
  const [userLogged, setuserLogged] = useState([]);

  const [dataMetodos, setdataMetodos] = useState([]);

  const [metodoSelected, setmetodoSelected] = useState([]);

  // Zelle
  const [emailZelle, setEmailZelle] = useState('');
  const [cod_ref, setcod_ref] = useState('');

  // Tranferencia y pago movil
  const [nro_referencia, setnro_referencia] = useState('');
  const [bancoTranfe, setbancoTranfe] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('V-');
  const [identificacion, setidentificacion] = useState(0);

  const [telefono, settelefono] = useState(0);

  const [monto, setmonto] = useState(0);

  const [dataPlan, setdataPlan] = useState();

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const formattedPaymentDate = date
    ? date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const bancos = [
    { value: '', label: '--- SELECCIONE UN BANCO ---' },
    { value: '0102', label: 'BANCO DE VENEZUELA' },
    { value: '0156', label: '100% BANCO' },
    { value: '0172', label: 'BANCAMIGA BANCO MICROFINANCIERO C A' },
    { value: '0114', label: 'BANCARIBE' },
    { value: '0171', label: 'BANCO ACTIVO' },
    { value: '0166', label: 'BANCO AGRICOLA DE VENEZUELA' },
    { value: '0175', label: 'BANCO BICENTENARIO DEL PUEBLO' },
    { value: '0128', label: 'BANCO CARONI' },
    { value: '0163', label: 'BANCO DEL TESORO' },
    { value: '0115', label: 'BANCO EXTERIOR' },
    { value: '0151', label: 'BANCO FONDO COMUN' },
    { value: '0173', label: 'BANCO INTERNACIONAL DE DESARROLLO' },
    { value: '0105', label: 'BANCO MERCANTIL' },
    { value: '0191', label: 'BANCO NACIONAL DE CREDITO' },
    { value: '0138', label: 'BANCO PLAZA' },
    { value: '0137', label: 'BANCO SOFITASA' },
    { value: '0104', label: 'BANCO VENEZOLANO DE CREDITO' },
    { value: '0168', label: 'BANCRECER' },
    { value: '0134', label: 'BANESCO' },
    { value: '0177', label: 'BANFANB' },
    { value: '0146', label: 'BANGENTE' },
    { value: '0174', label: 'BANPLUS' },
    { value: '0108', label: 'BBVA PROVINCIAL' },
    { value: '0157', label: 'DELSUR BANCO UNIVERSAL' },
    { value: '0169', label: 'R4 - MI BANCO' },
    { value: '0178', label: 'N58 BANCO DIGITAL BANCO MICROFINANCIERO S A' },
    { value: '0178', label: 'N58 BANCO DIGITAL BANCO MICROFINANCIERO S A' },
  ];

  const [SelectedBanco, setSelectedBanco] = useState('');

  const [SelectedBancoDestino, setSelectedBancoDestino] = useState('');

  const paymentDatas = index => {
    setSelectedItem(index === selectedItem ? null : index);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const closeSecondModel = () => {
    setEmailZelle('');
    setcod_ref('');

    setnro_referencia('');
    setbancoTranfe('');
    setSelectedPrefix('V-');
    setidentificacion(0);
    settelefono(0);

    setSelectedBanco('');
    setSelectedBancoDestino('');

    setDate(new Date());
    setmonto(0);

    clearImage();

    setAddItem(false);
  };

  const navigationScreen = useNavigation();
  const route = useRoute();
  /** true si se llegó desde PlanesRegistro con param enviado desde Mis planes. */
  const fromPlanesTaller = route.params?.fromPlanesTaller === true;

  useEffect(() => {
    const { data } = route.params;
    setdataPlan(data);
    setPrecioPago(Number(data.monto));
    setnombrePlan(data.nombre);
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      setuserLogged(user);

      try {
        // Hacer la solicitud GET utilizando Axios
        const response = await api.get('/usuarios/getMetodosPago', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Verificar la respuesta del servidor
        if (response.status === 200) {
          const result = response.data;

          console.log('Metodos de pago:', result);
          console.log(typeof result); // Muestra el tipo de dato de `result`


          setdataMetodos(result);
        } else {
          console.log("No hay data")
          setdataMetodos([]);
        }
      } catch (error) {
        console.log("No hay data otra vez")
        setdataMetodos([]);
        if (error.response) {
          console.error(
            'Error en la solicitud:',
            error.response.data.message || error.response.statusText,
          );
        } else {
          console.error('Error en la solicitud:', error.message);
        }
      }
    } catch (e) {
      console.log("No hay data final")
      setdataMetodos([]);
    }
  };

  const ReportarPagoData = () => {
    if (metodoSelected == 'Zelle') {
      if (
        emailZelle == '' ||
        monto == '' ||
        monto == 0 ||
        date == '' ||
        date == undefined
      ) {
        showToast(
          'No puede dejar campos vacíos y el monto no puede ser igual a 0',
        );
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          nombre_taller: userLogged.nombre,
          emailZelle: emailZelle,
          cod_ref: cod_ref,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: 'Zelle',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
          date: date,
          montoPago: monto.replace('$', ''),
          base64: base64 == null || base64 == '' ? '' : base64,
        };
        console.log('dataFinal', dataFinal);

        SendInfo(dataFinal);
      }
    } else if (metodoSelected == 'Transferencia') {
      if (
        nro_referencia == '' ||
        SelectedBanco == '' ||
        SelectedBancoDestino == '' ||
        monto == '' ||
        monto == 0 ||
        date == '' ||
        date == undefined
      ) {
        showToast(
          'No puede dejar campos vacíos y el monto no puede ser igual a 0',
        );
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          nombre_taller: userLogged.nombre,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: 'Transferencia',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
          SelectedBanco: SelectedBanco,
          SelectedBancoDestino: SelectedBancoDestino,
          date: date,
          montoPago: monto.replace('$', ''),
          base64: base64 == null || base64 == '' ? '' : base64,
        };
        SendInfo(dataFinal);
      }
    } else if (metodoSelected == 'Pago Móvil') {
      if (
        nro_referencia == '' ||
        telefono == '' ||
        SelectedBanco == '' ||
        SelectedBancoDestino == '' ||
        monto == '' ||
        monto == 0 ||
        date == '' ||
        date == undefined
      ) {
        showToast(
          'No puede dejar campos vacíos y el monto no puede ser igual a 0',
        );
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          nombre_taller: userLogged.nombre,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono.replace(/\s+/g, ""),
          amount: Number(dataPlan.monto),
          paymentMethod: 'Pago Móvil',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,

          SelectedBanco: SelectedBanco,
          SelectedBancoDestino: SelectedBancoDestino,
          date: date,
          montoPago: monto.replace('$', ''),
          base64: base64 == null || base64 == '' ? '' : base64,
        };

        SendInfo(dataFinal);
      }
    } else if (metodoSelected == 'Efectivo') {
      if (
        telefono == '' ||
        date == '' ||
        date == undefined ||
        monto == '' ||
        monto == 0
      ) {
        showToast(
          'No puede dejar campos vacíos y el monto no puede ser igual a 0',
        );
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          nombre_taller: userLogged.nombre,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono.replace(/\s+/g, ""),
          amount: Number(dataPlan.monto),
          paymentMethod: 'Efectivo',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
          date: date,
          montoPago: monto.replace('$', '')
        };

        SendInfo(dataFinal);
      }
    }
  };

  const SendInfo = async infoUserCreated => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post(
        '/usuarios/ReportarPagoData',
        infoUserCreated,
      );

      // Verificar la respuesta del servidor

      const result = response.data; // Los datos vienen directamente de response.data

      closeSecondModel();
      setModalVisible(true);
      // navigation.navigate('DrawerScreen');
    } catch (error) {
      if (error.response) {
        // La solicitud se hizo y el servidor respondió con un código de estado
        console.error(
          'Error al guardar el usuario:',
          error.response.data.message,
        );
        showToast(error.response.data.message); // Mostrar el mensaje de error del servidor
        closeSecondModel();
      } else {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('Error en la solicitud:', error);
        closeSecondModel();
      }
    }
  };

  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    isDark,
    t,
    viewRTLStyle,
    textRTLStyle,
  } = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  const [imageUri, setImageUri] = useState(null);
  const [base64, setBase64] = useState(null);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState('');

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
    if (target === 'comprobante') {
      setImageUri(uri);
      setBase64(b64);
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
        { mediaType: 'photo', includeBase64: true, selectionLimit: 1 },
        response => {
          if (response.didCancel || response.error) return;
          const asset = response.assets?.[0];
          if (asset) applyPhotoResult(photoModalTarget, asset.uri, asset.base64);
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
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;

        // Calcular el tamaño del archivo base64 en bytes
        const base64Length =
          base64Data.length * (3 / 4) -
          (base64Data.slice(-2) === '=='
            ? 2
            : base64Data.slice(-1) === '='
              ? 1
              : 0);
        const sizeInKB = base64Length / 1024;
        const sizeInMB = sizeInKB / 1024;

        setImageUri(source.uri);
        setBase64(base64Data);
      }
    });
  };

  const clearImage = () => {
    setImageUri(null);
    setBase64(null);
  };

  const frutas = ['Manzana', 'Banana', 'Naranja'];


  const goToServices = async () => {

    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      try {
        const response = await api.post('/usuarios/AsociarPlan', {
          uid: user.uid,
          plan_uid: 'gratis'
        });


        try {
          // Hacer la solicitud POST utilizando Axios
          const response = await api.post('/usuarios/authenticateUser', {
            email: user.email.toLowerCase(),
            password: user.password,
          });

          // Verificar la respuesta del servidor
          const result = response.data; // Los datos vienen directamente de response.data

          if (
            result.message === 'Usuario autenticado exitosamente' ||
            result.message === 'Usuario autenticado exitosamente como Admin'
          ) {
            try {
              const jsonValue = JSON.stringify(result.userData);
              console.log(jsonValue);
              await AsyncStorage.setItem('@userInfo', jsonValue);
            } catch (e) {
              console.log(e);
            }

            navigationScreen.navigate('FormService', { uid: '', fromRegistro: true });
          } else {

            showToast(
              'No se ha encontrado el usuario, por favor validar formulario',
            );
          }
        } catch (error) {
          if (error.response) {
            if (error?.response?.data?.error == "Firebase: Error (auth/invalid-credential).") {
              showToast(
                'Credenciales incorrectas, por favor validar formulario',
              );
            } else if (error?.response?.data?.error == "Firebase: Error (auth/user-not-found).") {
              showToast(
                'Usuario no encontrado, por favor validar formulario',
              );
            } else if (error?.response?.data?.error == "Firebase: Error (auth/wrong-password).") {
              showToast(
                'Contraseña incorrecta, por favor validar formulario',
              );
            }
          } else {
            // La solicitud fue hecha pero no se recibió respuesta
            console.error('Error en la solicitud:', error);
            showToast('Usuario no encontrado, por favor validar formulario');
          }
        }
      } catch (error) {
        console.error('Error en la solicitud:', error.message);
      }

    } catch (e) {
      // error reading value
      console.log(e);
    }





  }

  return (
    <>
    <View
      style={[commonStyles.commonContainer, { backgroundColor: '#F5F6F8' }]}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            marginBottom: 12,
            backgroundColor: '#1F2344',
            paddingTop: 24,
            paddingBottom: 22,
            paddingHorizontal: 12,
            borderBottomWidth: 8,
            borderBottomColor: '#FFD60A',
            borderBottomLeftRadius: 60,
            borderBottomRightRadius: 60,
            marginHorizontal: -12,
          }}>
          <View
            style={[
              external.fd_row,
              external.ai_center,
              {
                flexDirection: viewRTLStyle,
                justifyContent: 'center',
                minHeight: 44,
              },
            ]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 38,
                height: 38,
                position: 'absolute',
                left: 8,
                zIndex: 2,
                borderRadius: 19,
                backgroundColor: '#2D3261',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icons name="chevron-left" size={16} color="#FFD60A" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                color: '#FFD60A',
                textAlign: 'center',
              }}>
              Métodos de Pago
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#FFFFFF',
              opacity: 0.95,
              textAlign: 'center',
              lineHeight: 18,
              fontWeight: '600',
              marginBottom: 6,
              marginTop: 6,
            }}>
            Selecciona el medio por el cual realizaste tu transacción.
          </Text>
        </View>
        {/* <SolidLine /> */}


        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 140 }}>
          {
            dataMetodos.length != 0 ? (
              dataMetodos.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => {
                      setmetodoSelected(item.tipo_pago);
                      paymentDatas(index);
                    }}
                    style={{ width: '100%' }}>
                    <LinearGradient
                      colors={['#1F2344', '#151939']}
                      style={[
                        styles.paymentCard,
                        item.tipo_pago === 'Efectivo' && { minHeight: 120 },
                        // El borde amarillo se pinta con overlay interno (sin afectar layout)
                        index === selectedItem && styles.paymentCardSelected,
                      ]}>
                      {index === selectedItem && (
                        <View style={styles.paymentCardSelectedOverlay} />
                      )}
                      <View style={styles.paymentCardHeader}>
                        <View style={styles.paymentHeaderLeft}>
                          <View
                            style={[
                              styles.paymentIconCircle,
                              item.tipo_pago === 'Efectivo'
                                ? styles.paymentIconCash
                                : styles.paymentIconDefault,
                            ]}>
                            {item.tipo_pago === 'Efectivo' ? (
                              <Icons3
                                name="money-bill"
                                size={24}
                                color="#1F2344"
                              />
                            ) : item.tipo_pago === 'Pago Móvil' ? (
                              <Icons name="mobile" size={30} color="#1F2344" />
                            ) : item.tipo_pago === 'Transferencia' ? (
                              <Icons name="exchange" size={24} color="#1F2344" />
                            ) : (
                              <Icons name="credit-card" size={24} color="#1F2344" />
                            )}
                          </View>

                          <View>
                            <Text style={styles.paymentTitles}>
                              {t(item.tipo_pago)}
                            </Text>
                            <Text style={styles.paymentSubtitle}>
                              {item.tipo_pago === 'Efectivo'
                                ? 'Pago presencial'
                                : item.tipo_pago === 'Pago Móvil'
                                  ? 'Transacción digital'
                                  : item.tipo_pago === 'Transferencia'
                                    ? 'Cuentas nacionales'
                                    : 'Pago'}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.radioOuter,
                            index === selectedItem && styles.radioOuterSelected,
                          ]}>
                          <View
                            style={[
                              styles.radioInnerDot,
                              index === selectedItem
                                ? styles.radioInnerDotVisible
                                : styles.radioInnerDotHidden,
                            ]}
                          />
                        </View>
                      </View>

                      {(item.tipo_pago === 'Pago Móvil' ||
                        item.tipo_pago === 'Transferencia' ||
                        item.tipo_pago === 'Zelle') && (
                        <View style={styles.paymentDetailsWrap}>
                          <View
                            style={[
                              item.tipo_pago === 'Transferencia' && {
                                marginBottom: 10,
                              },
                            ]}>
                            {item.tipo_pago === 'Pago Móvil' && (
                              <>
                                <View style={styles.detailsGridRow}>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>Número</Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.telefono}
                                    </Text>
                                  </View>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>
                                      Cédula / RIF
                                    </Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.cedula_rif}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ marginTop: 0 }}>
                                  <Text style={styles.detailsLabel}>Banco</Text>
                                  <Text style={styles.detailsValueSmall}>
                                    {item.banco}
                                  </Text>
                                </View>
                              </>
                            )}

                            {item.tipo_pago === 'Transferencia' && (
                              <>
                                <View style={styles.detailsGridRow}>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>
                                      Número de Cuenta
                                    </Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.cuenta}
                                    </Text>
                                  </View>
                                </View>

                                <View style={styles.detailsGridRow}>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>Titular</Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.titular}
                                    </Text>
                                  </View>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>Tipo</Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.tipo_cuenta?.toUpperCase?.() ||
                                        item.tipo_cuenta}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ marginTop: 0 }}>
                                  <Text style={styles.detailsLabel}>Banco</Text>
                                  <Text style={styles.detailsValueSmall}>
                                    {item.banco}
                                  </Text>
                                </View>
                              </>
                            )}

                            {item.tipo_pago === 'Zelle' && (
                              <>
                                <View style={styles.detailsGridRow}>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>Email</Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.email}
                                    </Text>
                                  </View>
                                  <View style={styles.detailsCol}>
                                    <Text style={styles.detailsLabel}>Código</Text>
                                    <Text style={styles.detailsValueSmall}>
                                      {item.num_ref}
                                    </Text>
                                  </View>
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text>no carga</Text>
            )
          }
        </ScrollView>

      </View>

      

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: 24,
          paddingTop: 8,
          paddingHorizontal: 12,
          backgroundColor: '#F5F6F8',
        }}>
        <BottomContainer
          backgroundColors={['#F5F6F8', '#F5F6F8']}
          contentColors={['#F5F6F8', '#F5F6F8']}
          leftValue={
            <View style={styles.footerLeftContainer}>
              <Text style={styles.footerTotalText}>Total a Pagar</Text>
              <View style={styles.footerPriceRow}>
                <Text style={styles.footerAmountText}>${PrecioPago}</Text>
                <View style={styles.footerPlanBadge}>
                  <Text style={styles.footerPlanBadgeText}>
                    ({nombrePlan})
                  </Text>
                </View>
              </View>
            </View>
          }
          valueContainerStyle={styles.footerValueContainer}
          value={
            <TouchableOpacity
              onPress={() => {
                if (selectedItem == null) {
                  showToast('Debe seleccionar un metodo de pago');
                } else {
                  // setModalVisible(true);
                  setAddItem(true);
                  clearImage();
                }
              }}
              style={[external.fd_row, external.ai_center, styles.footerReportButton]}>
              <Icons name="send" size={16} color="#1F2344" />
              <Text style={styles.payNowText}>Reportar</Text>
            </TouchableOpacity>
          }
        />
      </View>

    </View>



      <CommonModal
        animationType={'fade'}
        isVisible={isModalVisible}
        onRequestClose={() => { }} // Esto previene que se cierre tocando fuera
        value={
          <View>
            <Icons3
              name="check-circle"
              size={80}
              color="#28a745"
              style={{ alignSelf: 'center', marginBottom: 20 }}
            />
            <Text
              style={[
                commonStyles.hederH2,
                external.ti_center,
                { color: textColorStyle },
              ]}>
              {'Felicitaciones !!'}
            </Text>
            <Text
              style={[
                commonStyles.subtitleText,
                external.ti_center,
                { fontSize: fontSizes.FONT19 },
              ]}>
              {
                'Estamos verificando su pago en breve podra iniciar la publicacion de sus servicios.'
              }
            </Text>
            <View style={[external.mt_20]}>
              <NavigationButton
                backgroundColor={'#2D3261'}
                title="Ir al inicio"
                onPress={() => {
                  closeModal();
                  if (fromPlanesTaller) {
                    navigation.navigate('Planes');
                  } else if (dataPlan.flag == 'from-plan') {
                    goToServices();
                  } else {
                    navigation.navigate('DrawerScreen');
                  }
                }}
                color={appColors.screenBg}
              />
            </View>
          </View>
        }
      />

      <Modal visible={addItem} transparent={false} animationType={'slide'}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {metodoSelected === 'Zelle' ? (
                <ScrollView
                  style={styles.modalBodyTop}
                  contentContainerStyle={styles.modalScrollContent}>
                  <View>
                    <LinearGradient
                      colors={['#1F2344', '#2D3261']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 1}}
                      style={styles.modalHeroCard}>
                      <View style={styles.modalHeroTopRow}>
                        <Text style={styles.modalHeroEyebrow}>Reportar pago</Text>
                        <View style={styles.modalHeroTypeBadge}>
                          <Text style={styles.modalHeroTypeBadgeText}>{nombrePlan}</Text>
                        </View>
                      </View>
                      <Text style={styles.modalHeroTitle}>
                        Total: ${PrecioPago}
                      </Text>
                      <Text style={styles.modalHeroSubtitle}>
                        Sube tu comprobante y completa los datos para validar tu
                        pago por Zelle.
                      </Text>
                    </LinearGradient>
                    <SolidLine />

                    <View style={styles.modalUploadCard}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.uploadPreviewImage}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[stylesImage.button, styles.uploadButton]}
                        onPress={() => openPhotoOptions('comprobante')}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text style={[stylesImage.buttonText, styles.uploadButtonText]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.uploadHelperText}>
                        Formatos recomendados: JPG o PNG
                      </Text>
                    </View>

                    <TextInputs
                      title="Correo Electrónico"
                      keyboardType={'email-address'}
                      placeHolder={'Ingrese email'}
                      onChangeText={text => setEmailZelle(text)}
                    />
                    <TextInputs
                      title={'Monto'}
                      value={monto}
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                        console.log('numericText', numericText);
                        if (numericText == "") {
                          setmonto('');
                        } else {
                          setmonto(`${numericText}`); // Agregar el símbolo $ al inicio
                        }
                      }}
                      keyboardType="numeric"
                      placeHolder={'Ingrese el monto'}
                    />

                    <Text
                      style={[
                        styles.headingContainer,
                        { color: textColorStyle },
                        { textAlign: textRTLStyle },
                        { marginTop: 10 }, // Agregar marginTop de 10
                      ]}>
                      Fecha del Pago
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.dateInputTrigger}
                      onPress={() => setOpen(true)}>
                      <Text style={styles.dateInputText}>{formattedPaymentDate}</Text>
                    </TouchableOpacity>

                  </View>
                </ScrollView>
              ) : metodoSelected === 'Transferencia' ? (
                <ScrollView
                  style={styles.modalBodyTop}
                  contentContainerStyle={styles.modalScrollContent}>
                  <View>
                  <View style={styles.modalHeroCard} backgroundColor='#1F2344'>
                      <View style={styles.modalHeroTopRow}>
                        <Text style={styles.modalHeroEyebrow}>Reportar pago</Text>
                        <View style={styles.modalHeroTypeBadge}>
                          <Text style={styles.modalHeroTypeBadgeText}>{nombrePlan}</Text>
                        </View>
                      </View>
                      <Text style={styles.modalHeroTitle}>
                        Total: ${PrecioPago}
                      </Text>
                      <Text style={styles.modalHeroSubtitle}>
                        Ingresa la referencia y los datos bancarios para reportar tu
                        transferencia.
                      </Text>
                      </View>

                    <View style={styles.modalUploadCard}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.uploadPreviewImage}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[stylesImage.button, styles.uploadButton]}
                        onPress={() => openPhotoOptions('comprobante')}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text style={[stylesImage.buttonText, styles.uploadButtonText]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.uploadHelperText}>
                        Formatos recomendados: JPG o PNG
                      </Text>
                    </View>

                    <View>
                      <TextInputs
                        title={'Nro de referencia'}
                        placeHolder={'000000000'}
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          setnro_referencia(numericText);
                        }}
                        keyboardType="numeric"
                      />

                      <View style={{ marginTop: 5 }}>
                        <Text
                          style={[
                            styles.headingContainer,
                            { color: textColorStyle },
                            { textAlign: textRTLStyle },
                          ]}>
                          Banco de origen
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10, marginBottom: 10
                          }}>
                          <View
                            style={{
                              width: '100%',
                              paddingRight: 0,
                              borderWidth: 1,
                              borderColor: '#ccc',
                              borderRadius: 5,
                              backgroundColor: '#fff',
                              height: 50, // para que el borde envuelva el Picker apropiadamente
                              justifyContent: 'center', // centra el Picker verticalmente
                            }}>
                            <Dropdown
                              keyboardAvoiding={true}
                              style={{
                                width: '100%', // Usa todo el ancho disponible en el contenedor
                                borderWidth: 1, // Borde alrededor del Dropdown
                                borderColor: '#ccc', // Color del borde
                                borderRadius: 5, // Bordes redondeados
                                paddingHorizontal: 10, // Espaciado interno
                                backgroundColor: '#fff', // Fondo blanco
                                height: 50, // Altura del Dropdown
                              }}
                              placeholderStyle={{
                                color: 'gray', // Color del texto del placeholder
                                fontSize: 14, // Tamaño del texto del placeholder
                              }}
                              selectedTextStyle={{
                                color: 'black', // Color del texto seleccionado
                                fontSize: 14, // Tamaño del texto seleccionado
                              }}
                              data={bancos.map(banco => ({
                                label: banco.label,
                                value: banco.label,
                              }))} // Datos para el Dropdown
                              labelField="label" // Campo que se mostrará como etiqueta
                              valueField="value" // Campo que se usará como valor
                              placeholder="Seleccione un banco" // Placeholder del Dropdown
                              value={SelectedBanco} // Valor seleccionado
                              search={true} // Habilitar búsqueda
                              onChange={item => setSelectedBanco(item.value)} // Maneja el cambio de selección
                            />
                          </View>
                        </View>
                      </View>

                      <View style={{ marginTop: 5 }}>
                        <Text
                          style={[
                            styles.headingContainer,
                            { color: textColorStyle },
                            { textAlign: textRTLStyle },
                          ]}>
                          Banco Destino
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10, marginBottom: 10
                          }}>
                          <View
                            style={{
                              width: '100%',
                              paddingRight: 0,
                              borderWidth: 1,
                              borderColor: '#ccc',
                              borderRadius: 5,
                              backgroundColor: '#fff',
                              height: 50, // para que el borde envuelva el Picker apropiadamente
                              justifyContent: 'center', // centra el Picker verticalmente
                            }}>
                            <Dropdown
                              dropdownPosition="top"
                              keyboardAvoiding={true}
                              style={{
                                width: '100%', // Usa todo el ancho disponible en el contenedor
                                borderWidth: 1, // Borde alrededor del Dropdown
                                borderColor: '#ccc', // Color del borde
                                borderRadius: 5, // Bordes redondeados
                                paddingHorizontal: 10, // Espaciado interno
                                backgroundColor: '#fff', // Fondo blanco
                                height: 50, // Altura del Dropdown
                              }}
                              placeholderStyle={{
                                color: 'gray', // Color del texto del placeholder
                                fontSize: 14, // Tamaño del texto del placeholder
                              }}
                              selectedTextStyle={{
                                color: 'black', // Color del texto seleccionado
                                fontSize: 14, // Tamaño del texto seleccionado
                              }}
                              data={bancos.map(banco => ({
                                label: banco.label,
                                value: banco.label,
                              }))} // Datos para el Dropdown
                              labelField="label" // Campo que se mostrará como etiqueta
                              valueField="value" // Campo que se usará como valor
                              placeholder="Seleccione un banco destino" // Placeholder del Dropdown
                              value={SelectedBancoDestino} // Valor seleccionado
                              search={true} // Habilitar búsqueda
                              onChange={item => setSelectedBancoDestino(item.value)} // Maneja el cambio de selección
                            />
                          </View>
                        </View>
                      </View>

                      <View style={[styles.efectivoInputsRow, { marginTop: 0 }]}>
                        <View style={styles.efectivoInputCol}>
                          <TextInputs
                            title={'Monto'}
                            value={monto}
                            onChangeText={text => {
                              const numericText = text.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                              console.log('numericText', numericText);
                              if (numericText == '') {
                                setmonto('');
                              } else {
                                setmonto(`${numericText}`); // Agregar el símbolo $ al inicio
                              }
                            }}
                            keyboardType="numeric"
                            placeHolder={'Ingrese el monto'}
                          />
                        </View>

                        <View style={styles.efectivoInputCol}>
                          <Text
                            style={[
                              styles.headingContainer,
                              { color: textColorStyle },
                              { textAlign: textRTLStyle },
                              { marginTop: 10 },
                            ]}>
                            Fecha del Pago
                          </Text>

                          <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.dateInputTrigger}
                            onPress={() => setOpen(true)}>
                            <Text style={styles.dateInputText}>
                              {formattedPaymentDate}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                    </View>
                  </View>
                </ScrollView>
              ) : metodoSelected === 'Pago Móvil' ? (
                <ScrollView
                  style={styles.modalBodyTop}
                  contentContainerStyle={styles.modalScrollContent}>
                  <View>
                    <View style={styles.modalHeroCard} backgroundColor='#1F2344'>
                      <View style={styles.modalHeroTopRow}>
                        <Text style={styles.modalHeroEyebrow}>Reportar pago</Text>
                        <View style={styles.modalHeroTypeBadge}>
                          <Text style={styles.modalHeroTypeBadgeText}>{nombrePlan}</Text>
                        </View>
                      </View>
                      <Text style={styles.modalHeroTitle}>
                        Total: ${PrecioPago}
                      </Text>
                      <Text style={styles.modalHeroSubtitle}>
                        Completa la referencia, teléfono y bancos para registrar tu
                        pago móvil.
                      </Text>

                    </View>
                    <SolidLine />

                    <View style={styles.modalUploadCard}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.uploadPreviewImage}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[stylesImage.button, styles.uploadButton]}
                        onPress={() => openPhotoOptions('comprobante')}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text style={[stylesImage.buttonText, styles.uploadButtonText]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.uploadHelperText}>
                        Formatos recomendados: JPG o PNG
                      </Text>
                    </View>

                    <View style={styles.efectivoInputsRow}>
                      <View style={styles.efectivoInputCol}>
                        <TextInputs
                          title={'Nro de referencia'}
                          placeHolder={'000000000'}
                          onChangeText={text => {
                            const numericText = text.replace(/[^0-9]/g, '');
                            setnro_referencia(numericText);
                          }}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.efectivoInputCol}>
                        <TextInputs
                          title={'Número telefónico'}
                          keyboardType="numeric"
                          placeHolder="Ejem (414) 261-79-66"
                          value={telefono} // Para mantener el valor actualizado con la máscara
                          onChangeText={text => {
                            let numericText = text
                              .replace(/[^0-9]/g, '')
                              .slice(0, 10); // Limitar a 10 dígitos

                            let formattedText = '';
                            if (numericText.length > 0 && numericText.length <= 3) {
                              formattedText = `${numericText}`;
                            } else if (
                              numericText.length > 3 &&
                              numericText.length <= 6
                            ) {
                              formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
                            } else if (
                              numericText.length > 6 &&
                              numericText.length <= 8
                            ) {
                              formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
                            } else if (numericText.length > 8) {
                              formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
                            }

                            formattedText = `${formattedText}`;
                            settelefono(formattedText);
                          }}
                        />
                      </View>
                    </View>

                    <View style={{ marginTop: 5 }}>
                      <Text
                        style={[
                          styles.headingContainer,
                          { color: textColorStyle },
                          { textAlign: textRTLStyle },
                        ]}>
                        Banco de origen
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                        <View
                          style={{
                            width: '100%',
                            paddingRight: 0,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            backgroundColor: '#fff',
                            height: 50, // para que el borde envuelva el Picker apropiadamente
                            justifyContent: 'center', // centra el Picker verticalmente
                          }}>

                          <Dropdown
                            dropdownPosition="top"
                            keyboardAvoiding={true}
                            style={{
                              width: '100%', // Usa todo el ancho disponible en el contenedor
                              borderWidth: 1, // Borde alrededor del Dropdown
                              borderColor: '#ccc', // Color del borde
                              borderRadius: 5, // Bordes redondeados
                              paddingHorizontal: 10, // Espaciado interno
                              backgroundColor: '#fff', // Fondo blanco
                              height: 50, // Altura del Dropdown
                            }}
                            placeholderStyle={{
                              color: 'gray', // Color del texto del placeholder
                              fontSize: 14, // Tamaño del texto del placeholder
                            }}
                            selectedTextStyle={{
                              color: 'black', // Color del texto seleccionado
                              fontSize: 14, // Tamaño del texto seleccionado
                            }}
                            data={bancos.map(banco => ({
                              label: banco.label,
                              value: banco.label,
                            }))} // Datos para el Dropdown
                            labelField="label" // Campo que se mostrará como etiqueta
                            valueField="value" // Campo que se usará como valor
                            placeholder="Seleccione un banco" // Placeholder del Dropdown
                            value={SelectedBanco} // Valor seleccionado
                            search={true} // Desactiva la búsqueda
                            onChange={item => setSelectedBanco(item.value)} // Maneja el cambio de selección


                          />

                        </View>
                      </View>
                    </View>

                    <View style={{ marginTop: 5 }}>
                      <Text
                        style={[
                          styles.headingContainer,
                          { color: textColorStyle },
                          { textAlign: textRTLStyle },
                        ]}>
                        Banco Destino
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10, }}>
                        <View
                          style={{
                            width: '100%',
                            paddingRight: 0,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            backgroundColor: '#fff',
                            height: 50, // para que el borde envuelva el Picker apropiadamente
                            justifyContent: 'center', // centra el Picker verticalmente
                          }}>
                          <Dropdown
                            dropdownPosition="top"
                            keyboardAvoiding={true}
                            style={{
                              width: '100%', // Usa todo el ancho disponible en el contenedor
                              borderWidth: 1, // Borde alrededor del Dropdown
                              borderColor: '#ccc', // Color del borde
                              borderRadius: 5, // Bordes redondeados
                              paddingHorizontal: 10, // Espaciado interno
                              backgroundColor: '#fff', // Fondo blanco
                              height: 50, // Altura del Dropdown
                            }}
                            placeholderStyle={{
                              color: 'gray', // Color del texto del placeholder
                              fontSize: 14, // Tamaño del texto del placeholder
                            }}
                            selectedTextStyle={{
                              color: 'black', // Color del texto seleccionado
                              fontSize: 14, // Tamaño del texto seleccionado
                            }}
                            data={bancos.map(banco => ({
                              label: banco.label,
                              value: banco.label,
                            }))} // Datos para el Dropdown
                            labelField="label" // Campo que se mostrará como etiqueta
                            valueField="value" // Campo que se usará como valor
                            placeholder="Seleccione un banco destino" // Placeholder del Dropdown
                            value={SelectedBancoDestino} // Valor seleccionado
                            search={true} // Habilitar búsqueda
                            onChange={item => setSelectedBancoDestino(item.value)} // Maneja el cambio de selección
                          />
                        </View>
                      </View>
                    </View>

                    <View style={[styles.efectivoInputsRow, { marginTop: 5 }]}>
                      <View style={styles.efectivoInputCol}>
                        <TextInputs
                          title={'Monto'}
                          value={monto}
                          onChangeText={text => {
                            const numericText = text.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                            console.log('numericText', numericText);
                            if (numericText == '') {
                              setmonto('');
                            } else {
                              setmonto(`${numericText}`); // Agregar el símbolo $ al inicio
                            }
                          }}
                          keyboardType="numeric"
                          placeHolder={'Ingrese el monto'}
                        />
                      </View>

                      <View style={styles.efectivoInputCol}>
                        <Text
                          style={[
                            styles.headingContainer,
                            { color: textColorStyle },
                            { textAlign: textRTLStyle },
                            { marginTop: 10 },
                          ]}>
                          Fecha del Pago
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.dateInputTrigger}
                          onPress={() => setOpen(true)}>
                          <Text style={styles.dateInputText}>
                            {formattedPaymentDate}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : // </View>
                metodoSelected === 'Efectivo' ? (
                  <ScrollView
                    style={styles.modalBodyTop}
                    contentContainerStyle={styles.modalScrollContent}>
                    <View>
                    <View style={styles.modalHeroCard} backgroundColor='#1F2344'>
                        <View style={styles.modalHeroTopRow}>
                          <Text style={styles.modalHeroEyebrow}>Reportar pago</Text>
                          <View style={styles.modalHeroTypeBadge}>
                            <Text style={styles.modalHeroTypeBadgeText}>{nombrePlan}</Text>
                          </View>
                        </View>
                        <Text style={styles.modalHeroTitle}>
                          Total: ${PrecioPago}
                        </Text>
                        <Text style={styles.modalHeroSubtitle}>
                          Confirma los datos de contacto y registra el pago en
                          efectivo realizado.
                        </Text>
                    
                    </View>

                    <TextInputs
                      title={'Numero telefonico'}
                      keyboardType="numeric"
                      maxLength={10}
                      placeHolder="Ejem (414) 261-79-66"
                      value={telefono} // Para mantener el valor actualizado con la máscara
                      onChangeText={text => {
                        let numericText = text
                          .replace(/[^0-9]/g, '')
                          .slice(0, 10); // Limitar a 10 dígitos

                        let formattedText = '';
                        if (numericText.length > 0 && numericText.length <= 3) {
                          formattedText = `${numericText}`;
                        } else if (
                          numericText.length > 3 &&
                          numericText.length <= 6
                        ) {
                          formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
                        } else if (
                          numericText.length > 6 &&
                          numericText.length <= 8
                        ) {
                          formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
                        } else if (numericText.length > 8) {
                          formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
                        }

                        formattedText = `${formattedText}`;
                        settelefono(formattedText);
                      }}
                    />

                    <View style={styles.efectivoInputsRow}>
                      <View style={styles.efectivoInputCol}>
                        <TextInputs
                          title={'Monto'}
                          value={monto}
                          onChangeText={text => {
                            const numericText = text.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
                            console.log('numericText', numericText);
                            if (numericText == '') {
                              setmonto('');
                            } else {
                              setmonto(`${numericText}`); // Agregar el símbolo $ al inicio
                            }
                          }}
                          keyboardType="numeric"
                          placeHolder={'Ingrese el monto'}
                        />
                      </View>

                      <View style={styles.efectivoInputCol}>
                        <Text
                          style={[
                            styles.headingContainer,
                            { color: textColorStyle },
                            { textAlign: textRTLStyle },
                            { marginTop: 10 },
                          ]}>
                          Fecha del Pago
                        </Text>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.dateInputTrigger}
                          onPress={() => setOpen(true)}>
                          <Text style={styles.dateInputText}>
                            {formattedPaymentDate}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>


                    {/* <View
                    style={[
                      external.fd_row,
                      external.ai_center,
                      external.js_space,
                      external.mt_30,
                    ]}>
                    <View style={{width: windowWidth(200)}}>
                      <NavigationButton
                        backgroundColor={appColors.screenBg}
                        title={'Cancelar'}
                        color={appColors.titleText}
                        borderWidth={0.3}
                        onPress={closeSecondModel}
                      />
                    </View>
                    <View style={{width: windowWidth(200)}}>
                      <NavigationButton
                        backgroundColor={'#2D3261'}
                        title={'Reportar Pago'}
                        color={appColors.screenBg}
                        onPress={ReportarPagoData}
                      />
                    </View>
                  </View> */}
                    </View>
                  </ScrollView>
                ) : null}

              <DatePicker
                modal
                open={open}
                date={date}
                mode="date"
                maximumDate={new Date()}
                locale="es"
                title="Fecha del Pago"
                onConfirm={selectedDate => {
                  setOpen(false);
                  setDate(selectedDate);
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />

              <View style={styles.modalFixedFooter}>
                <View style={styles.modalFixedFooterRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.modalActionBtn, styles.modalActionBtnCancel]}
                    onPress={() => closeSecondModel()}>
                    <Text style={styles.modalActionBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.modalActionBtn, styles.modalActionBtnReport]}
                    onPress={() => ReportarPagoData()}>
                    <Icons
                      name="send"
                      size={16}
                      color="#1F2344"
                      style={styles.modalActionBtnIconSpacing}
                    />
                    <Text style={styles.modalActionBtnText}>Reportar Pago</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Inline photo-picker overlay (inside container) ── */}
              {photoModalVisible && (
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15,23,68,0.55)', justifyContent: 'flex-end',
                }}>
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
                            <Icons2 name={icon} size={26} color="#FFD60A" />
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
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const stylesKey = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  textInput: {
    height: 40,
    borderColor: '#000000',
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: 'white',
    marginTop: 12,
  },
});

const stylesImage = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1F2344',
    fontWeight: '700',
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8E1F0',
    backgroundColor: '#FFFFFF',
    padding: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1F2344',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFD60A',
    fontWeight: 'bold',
  },
});

export default ReportarPago;
