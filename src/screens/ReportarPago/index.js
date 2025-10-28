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
  Alert
} from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import { successfullyReset } from '../../constant';
import { external } from '../../style/external.css';
import appColors from '../../themes/appColors';
import { commonStyles } from '../../style/commonStyle.css';
import { fontSizes, windowWidth } from '../../themes/appConstant';
import SolidLine from '../../commonComponents/solidLine';
import { otherPaymentMode, paymentData } from '../../data/paymentData';
import DashedBorderComponent from '../../commonComponents/dashBorder';
import BottomContainer from '../../commonComponents/bottomContainer';
import { Cross, SendMoney } from '../../utils/icon';
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

import { launchImageLibrary } from 'react-native-image-picker';
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

  const [buttonColor, setButtonColor] = useState('#848688');

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

            navigationScreen.navigate('LoaderScreen');
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
    <View
      style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      <View style={[external.mh_20]}>
        <HeaderContainer value="Reportar Pago" />
        {/* <LinearGradient
          start={{ x: 0.0, y: 0.0 }}
          end={{ x: 0.0, y: 1.0 }}
          colors={colors}
          style={[
            styles.viewContainer,
            { shadowColor: appColors.shadowColor, borderradius: 6 },
          ]}>
          <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
            colors={linearColorStyle}
            style={[
              styles.menuItemContent,
              { shadowColor: appColors.shadowColor },
            ]}
            > */}

        <View
          style={[
            external.fd_row,
            external.js_space,
            { flexDirection: viewRTLStyle },
          ]}>
          <Text
            style={[
              commonStyles.subtitleText,
              external.mh_15,
              external.mt_10,
              { color: textColorStyle, fontSize: fontSizes.FONT19 },
            ]}>
            Seleccione tipo de Pago
          </Text>
        </View>
        <SolidLine />


        {
          dataMetodos.length != 0 ? (


            dataMetodos.map((item, index) => {
              return (
                <View key={index}>
                  <View
                    style={[
                      external.fd_row,
                      external.p_10,
                      external.ai_center,
                      { flexDirection: viewRTLStyle },
                    ]}
                  >

                    <View style={[external.ph_10, external.fg_9]}>
                      <Text
                        style={[
                          commonStyles.subtitleText,
                          { color: textColorStyle, textAlign: textRTLStyle },
                        ]}
                      >
                        {t(item.tipo_pago)}
                      </Text>

                      {item.tipo_pago === 'Transferencia' && (
                        <>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Cuenta: ' + item.cuenta)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Titular: ' + item.titular)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Cedula/RIF: ' + item.cedula_rif)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Tipo: ' + item.tipo_cuenta)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Banco: ' + item.banco)}
                          </Text>
                        </>
                      )}

                      {item.tipo_pago === 'Pago Móvil' && (
                        <>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Número: ' + item.telefono)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Cedula/RIF: ' + item.cedula_rif)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Banco: ' + item.banco)}
                          </Text>
                        </>
                      )}

                      {item.tipo_pago === 'Zelle' && (
                        <>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Email: ' + item.email)}
                          </Text>
                          <Text
                            style={[
                              commonStyles.subtitleText,
                              { textAlign: textRTLStyle },
                            ]}
                          >
                            {t('Codigo: ' + item.num_ref)}
                          </Text>
                        </>
                      )}
                    </View>

                    <RadioButton
                      onPress={() => {
                        setmetodoSelected(item.tipo_pago);
                        paymentDatas(index);
                      }}
                      checked={index === selectedItem}
                    />
                  </View>
                  <DashedBorderComponent />
                </View>
              );
            })

          ) : (
            <Text
            >
              no carga
            </Text>
          )
        }


        {/* </LinearGradient>
        </LinearGradient> */}

      </View>

      <View style={[external.fx_1, external.js_end]}>
        <BottomContainer
          leftValue={
            <Text style={[styles.priceText, { color: textColorStyle }]}>
              ${PrecioPago}{' '}
              <Text style={[commonStyles.subtitleText]}>({nombrePlan})</Text>
            </Text>
          }
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
              style={[external.fd_row, external.ai_center, external.pt_4]}>
              <SendMoney />
              <Text style={styles.payNowText}>Reportar</Text>
            </TouchableOpacity>
          }
        />
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
                  if (dataPlan.flag == 'from-plan') {
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
                <ScrollView style={{ marginBottom: 15, marginTop: 70 }}>
                  <View>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        external.js_space,
                      ]}>
                      <Text
                        style={[commonStyles.titleText19, { color: textColorStyle }]}>
                        Reportar Pago (Precio: ${PrecioPago})
                      </Text>
                    </View>
                    <SolidLine />

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 200, height: 200 }}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          stylesImage.button,
                          {
                            borderWidth: 1,
                            borderColor: '#2D3261',
                            borderStyle: 'dotted', // Establecer el borde como interlineal
                            borderRadius: 5, // Opcional: Añadir esquinas redondeadas
                            backgroundColor: '#FFF',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            marginTop: 10,
                          },
                        ]}
                        onPress={selectImage}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text
                          style={[
                            stylesImage.buttonText,
                            { marginLeft: 10, color: '#2D3261' },
                          ]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
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

                    <DatePicker
                      maximumDate={new Date()}
                      date={date}
                      onDateChange={setDate}
                      theme="light"
                      mode="date"
                      title="Fecha del Pago"
                      locale="es"
                    />

                    <View style={{ marginTop: 10 }}>
                      <View
                        style={{
                          backgroundColor: buttonColor,
                          borderRadius: windowHeight(20),
                          marginBottom: 15, // Margen entre los botones
                        }}>
                        <NavigationButton
                          title="Reportar Pago"
                          onPress={() => ReportarPagoData()}
                          backgroundColor={'#2D3261'}
                          color={'white'}
                        />
                      </View>

                      <View
                        style={{
                          backgroundColor: buttonColor,
                          borderRadius: windowHeight(20),
                        }}>
                        <NavigationButton
                          title="Cancelar"
                          onPress={() => closeSecondModel()}
                          backgroundColor={'#848688'}
                          color={'white'}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : metodoSelected === 'Transferencia' ? (
                <ScrollView style={{ marginBottom: 15, marginTop: 70 }}>
                  <View>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        external.js_space,
                      ]}>
                      <Text
                        style={[commonStyles.titleText19, { color: textColorStyle }]}>
                        Reportar Pago (Precio: ${PrecioPago})
                      </Text>
                    </View>
                    <SolidLine />

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 200, height: 200 }}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          stylesImage.button,
                          {
                            borderWidth: 1,
                            borderColor: '#2D3261',
                            borderStyle: 'dotted', // Establecer el borde como interlineal
                            borderRadius: 5, // Opcional: Añadir esquinas redondeadas
                            backgroundColor: '#FFF',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            marginTop: 10,
                          },
                        ]}
                        onPress={selectImage}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text
                          style={[
                            stylesImage.buttonText,
                            { marginLeft: 10, color: '#2D3261' },
                          ]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
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

                      <View style={{ marginTop: 0 }}>
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

                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <DatePicker
                            maximumDate={new Date()}
                            date={date}
                            onDateChange={setDate}
                            theme="light"
                            mode="date"
                            title="Fecha del Pago"
                            style={{ height: 150 }} // Ajustar el tamaño
                            locale="es"
                          />
                        </View>
                      </View>

                      <View style={{ marginBottom: 20 }}>
                        <View
                          style={{
                            backgroundColor: buttonColor,
                            borderRadius: windowHeight(20),
                            marginBottom: 5, // Margen entre los botones
                          }}>
                          <NavigationButton
                            title="Reportar Pago"
                            onPress={() => ReportarPagoData()}
                            backgroundColor={'#2D3261'}
                            color={'white'}
                          />
                        </View>

                        <View
                          style={{
                            backgroundColor: buttonColor,
                            borderRadius: windowHeight(20),
                          }}>
                          <NavigationButton
                            title="Cancelar"
                            onPress={() => closeSecondModel()}
                            backgroundColor={'#848688'}
                            color={'white'}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : metodoSelected === 'Pago Móvil' ? (
                <ScrollView style={{ marginBottom: 15, marginTop: 70 }}>
                  <View>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        external.js_space,
                      ]}>
                      <Text
                        style={[commonStyles.titleText19, { color: textColorStyle }]}>
                        Reportar Pago (Precio: ${PrecioPago})
                      </Text>
                    </View>
                    <SolidLine />

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      {imageUri && (
                        <View style={stylesImage.imageContainer}>
                          <Image
                            source={{ uri: imageUri }}
                            style={{ width: 200, height: 200 }}
                          />
                          <TouchableOpacity
                            style={stylesImage.closeButton}
                            onPress={clearImage}>
                            <Text style={stylesImage.closeButtonText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[
                          stylesImage.button,
                          {
                            borderWidth: 1,
                            borderColor: '#2D3261',
                            borderStyle: 'dotted', // Establecer el borde como interlineal
                            borderRadius: 5, // Opcional: Añadir esquinas redondeadas
                            backgroundColor: '#FFF',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            marginTop: 10,
                          },
                        ]}
                        onPress={selectImage}>
                        <Icons3 name="money-bill" size={15} color="#2D3261" />
                        <Text
                          style={[
                            stylesImage.buttonText,
                            { marginLeft: 10, color: '#2D3261' },
                          ]}>
                          Comprobante de Pago
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TextInputs
                      title={'Nro de referencia'}
                      placeHolder={'000000000'}
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        setnro_referencia(numericText);
                      }}
                      keyboardType="numeric"
                    />

                    <TextInputs
                      title={'Número telefónico'}
                      // onChangeText={text => {
                      //   // Aplicar formato de máscara (XXX) XXX-XXXX
                      //   const numericText = text
                      //     .replace(/[^0-9]/g, '')
                      //     .slice(0, 10);

                      //   // Aplicar formato de máscara (XXX) XXX-XXXX
                      //   let formattedText = numericText;
                      //   if (numericText.length > 3 && numericText.length <= 6) {
                      //     formattedText = `(${numericText.slice(
                      //       0,
                      //       3,
                      //     )}) ${numericText.slice(3)}`;
                      //   } else if (numericText.length > 6) {
                      //     formattedText = `(${numericText.slice(
                      //       0,
                      //       3,
                      //     )}) ${numericText.slice(3, 6)}-${numericText.slice(6)}`;
                      //   }

                      //   settelefono(numericText);
                      // }}
                      keyboardType="numeric"
                      placeHolder="Ejem (414) 261-79-66"
                      value={telefono} // Para mantener el valor actualizado con la máscara
                      onChangeText={text => {
                        let numericText = text.replace(/[^0-9]/g, '').slice(0, 10); // Limitar a 10 dígitos

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

                        formattedText = `${formattedText}`;

                        settelefono(formattedText);
                      }}
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

                    <View style={{ marginTop: 5 }}>
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

                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <DatePicker
                          maximumDate={new Date()}
                          date={date}
                          onDateChange={setDate}
                          theme="light"
                          title="Fecha del Pago"
                          mode="date"
                          locale="es"
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{ marginBottom: 0, marginTop: 15 }}>
                    <View
                      style={{
                        backgroundColor: buttonColor,
                        borderRadius: windowHeight(20),
                        marginBottom: 5, // Margen entre los botones
                      }}>
                      <NavigationButton
                        title="Reportar Pago"
                        onPress={() => ReportarPagoData()}
                        backgroundColor={'#2D3261'}
                        color={'white'}
                      />
                    </View>

                    <View
                      style={{
                        backgroundColor: buttonColor,
                        borderRadius: windowHeight(20),
                      }}>
                      <NavigationButton
                        title="Cancelar"
                        onPress={() => closeSecondModel()}
                        backgroundColor={'#848688'}
                        color={'white'}
                      />
                    </View>
                  </View>
                </ScrollView>
              ) : // </View>
                metodoSelected === 'Efectivo' ? (
                  <View style={{ marginTop: 70 }}>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        external.js_space,
                      ]}>
                      <Text
                        style={[commonStyles.titleText19, { color: textColorStyle }]}>
                        Reportar Pago (Precio: ${PrecioPago})
                      </Text>
                    </View>
                    <SolidLine />

                    <TextInputs
                      title={'Numero telefonico'}
                      keyboardType="numeric"
                      maxLength={10}
                      placeHolder="Ejem (414) 261-79-66"
                      value={telefono} // Para mantener el valor actualizado con la máscara
                      onChangeText={text => {
                        let numericText = text.replace(/[^0-9]/g, '').slice(0, 10); // Limitar a 10 dígitos

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

                        formattedText = `${formattedText}`;

                        settelefono(formattedText);
                      }}
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


                    <DatePicker
                      maximumDate={new Date()}
                      style={{ width: 350 }}
                      date={date}
                      onDateChange={setDate}
                      theme="light"
                      mode="date"
                      title="Fecha del Pago"
                      locale="es"

                    />


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
                    <View style={{ marginTop: 50 }}>
                      <View
                        style={{
                          backgroundColor: buttonColor,
                          borderRadius: windowHeight(20),
                          marginBottom: 15, // Margen entre los botones
                        }}>
                        <NavigationButton
                          title="Reportar Pago"
                          onPress={() => ReportarPagoData()}
                          backgroundColor={'#2D3261'}
                          color={'white'}
                        />
                      </View>

                      <View
                        style={{
                          backgroundColor: buttonColor,
                          borderRadius: windowHeight(20),
                        }}>
                        <NavigationButton
                          title="Cancelar"
                          onPress={() => closeSecondModel()}
                          backgroundColor={'#848688'}
                          color={'white'}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>


    </View>
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

export default ReportarPago;
