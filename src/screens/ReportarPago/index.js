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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {successfullyReset} from '../../constant';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import {commonStyles} from '../../style/commonStyle.css';
import {fontSizes, windowWidth} from '../../themes/appConstant';
import SolidLine from '../../commonComponents/solidLine';
import {otherPaymentMode, paymentData} from '../../data/paymentData';
import DashedBorderComponent from '../../commonComponents/dashBorder';
import BottomContainer from '../../commonComponents/bottomContainer';
import {Cross, SendMoney} from '../../utils/icon';
import RadioButton from '../../commonComponents/radioButton';
import {styles} from './style.css';
import CommonModal from '../../commonComponents/commonModel';
import images from '../../utils/images';
import NavigationButton from '../../commonComponents/navigationButton';
import TextInputs from '../../commonComponents/textInputs';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';

import Icons from 'react-native-vector-icons/FontAwesome';
import Icons3 from 'react-native-vector-icons/FontAwesome5';

import Icons4 from 'react-native-vector-icons/FontAwesome6';

import {launchImageLibrary} from 'react-native-image-picker';
import {Buffer} from 'buffer';

import DatePicker from 'react-native-date-picker';

import {windowHeight} from '../../themes/appConstant';

const ReportarPago = ({navigation}) => {
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

  const [imageUri, setImageUri] = useState(null);
  const [base64, setBase64] = useState('');

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [buttonColor, setButtonColor] = useState('#848688');

  const bancos = [
    {value: '', label: '--- SELECCIONE UN BANCO ---'},
    {value: '0102', label: 'BANCO DE VENEZUELA'},
    {value: '0156', label: '100% BANCO'},
    {value: '0172', label: 'BANCAMIGA BANCO MICROFINANCIERO C A'},
    {value: '0114', label: 'BANCARIBE'},
    {value: '0171', label: 'BANCO ACTIVO'},
    {value: '0166', label: 'BANCO AGRICOLA DE VENEZUELA'},
    {value: '0175', label: 'BANCO BICENTENARIO DEL PUEBLO'},
    {value: '0128', label: 'BANCO CARONI'},
    {value: '0163', label: 'BANCO DEL TESORO'},
    {value: '0115', label: 'BANCO EXTERIOR'},
    {value: '0151', label: 'BANCO FONDO COMUN'},
    {value: '0173', label: 'BANCO INTERNACIONAL DE DESARROLLO'},
    {value: '0105', label: 'BANCO MERCANTIL'},
    {value: '0191', label: 'BANCO NACIONAL DE CREDITO'},
    {value: '0138', label: 'BANCO PLAZA'},
    {value: '0137', label: 'BANCO SOFITASA'},
    {value: '0104', label: 'BANCO VENEZOLANO DE CREDITO'},
    {value: '0168', label: 'BANCRECER'},
    {value: '0134', label: 'BANESCO'},
    {value: '0177', label: 'BANFANB'},
    {value: '0146', label: 'BANGENTE'},
    {value: '0174', label: 'BANPLUS'},
    {value: '0108', label: 'BBVA PROVINCIAL'},
    {value: '0157', label: 'DELSUR BANCO UNIVERSAL'},
    {value: '0169', label: 'MI BANCO'},
    {value: '0178', label: 'N58 BANCO DIGITAL BANCO MICROFINANCIERO S A'},
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

    setAddItem(false);
  };

  const navigationScreen = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const {data} = route.params;
    setdataPlan(data);
    setPrecioPago(Number(data.monto));
    setnombrePlan(data.nombre);
    getData();
  }, []);

  const getData = async () => {
    console.log('Buscar metodos de pago');
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
          console.log('Metodos++++++++', result); // Aquí puedes manejar la respuesta

          setdataMetodos(result);
        } else {
          setdataMetodos([]);
        }
      } catch (error) {
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
      setdataMetodos([]);
      console.log(e);
    }
  };

  const ReportarPagoData = () => {
    console.log(metodoSelected);
    console.log(monto);

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
        console.log(emailZelle);
        console.log(cod_ref);

        console.log(dataPlan);
        console.log(userLogged);

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
          montoPago: monto,
        };

        console.log('objeto final', dataFinal);
        SendInfo(dataFinal)
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
          montoPago: monto,
        };
        console.log('objeto final', dataFinal);
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
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: 'Pago Móvil',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,

          SelectedBanco: SelectedBanco,
          SelectedBancoDestino: SelectedBancoDestino,
          date: date,
          montoPago: monto,
        };

        console.log('objeto final', dataFinal);
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
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: 'Efectivo',
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
          date: date,
          montoPago: monto,
        };

        console.log('objeto final', dataFinal);
        SendInfo(dataFinal)
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
      console.log(response); // Mostrar la respuesta completa

      const result = response.data; // Los datos vienen directamente de response.data
      console.log(result); // Aquí puedes manejar la respuesta

      closeSecondModel();
      setModalVisible(true);
      // navigation.navigate('Login');
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
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.assets[0].uri};
        setImageUri(source);
        const base64String = response.assets[0].base64;
        setBase64(base64String);
      }
    });
  };

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <HeaderContainer value="Reportar Pago" />
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={colors}
          style={[
            styles.viewContainer,
            {shadowColor: appColors.shadowColor, borderradius: 6},
          ]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[
              styles.menuItemContent,
              {shadowColor: appColors.shadowColor},
            ]}>
            <View
              style={[
                external.fd_row,
                external.js_space,
                {flexDirection: viewRTLStyle},
              ]}>
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.mh_15,
                  external.mt_10,
                  {color: textColorStyle, fontSize: fontSizes.FONT19},
                ]}>
                Seleccione tipo de Pago
              </Text>
            </View>
            <SolidLine />
            {dataMetodos.map(
              (item, index) =>
                index < 4 && (
                  <View>
                    <View
                      style={[
                        external.fd_row,
                        external.p_10,
                        external.ai_center,
                        {flexDirection: viewRTLStyle},
                      ]}>
                      {/* <Image style={styles.imgGround} source={item.img} /> */}

                      {item.tipo_pago === 'Transferencia' && (
                        <Icons4
                          name="money-bill-transfer"
                          size={30}
                          color="#2D3261"
                        />
                      )}

                      {item.tipo_pago === 'Zelle' && (
                        <Icons4
                          name="dollar-sign"
                          size={30}
                          color="#2D3261"
                          style={{marginRight: 16}}
                        />
                      )}

                      {item.tipo_pago === 'Pago Móvil' && (
                        <Icons4
                          name="square-phone"
                          size={30}
                          color="#2D3261"
                          style={{marginRight: 12}}
                        />
                      )}

                      {item.tipo_pago === 'Efectivo' && (
                        <Icons4
                          name="money-bill"
                          size={30}
                          color="#2D3261"
                          style={{marginRight: 0}}
                        />
                      )}

                      <View style={[external.ph_10, external.fg_9]}>
                        <Text
                          style={[
                            commonStyles.subtitleText,
                            {color: textColorStyle, textAlign: textRTLStyle},
                          ]}>
                          {t(item.tipo_pago)}
                        </Text>

                        {item.tipo_pago === 'Transferencia' && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Cuenta: ' + item.cuenta)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Titular: ' + item.titular)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Cedula/RIF: ' + item.cedula_rif)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Tipo: ' + item.tipo_cuenta)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Banco: ' + item.banco)}
                            </Text>
                          </>
                        )}

                        {item.tipo_pago === 'Pago Móvil' && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Número: ' + item.telefono)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Cedula/RIF: ' + item.cedula_rif)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Banco: ' + item.banco)}
                            </Text>
                          </>
                        )}

                        {item.tipo_pago === 'Zelle' && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Email: ' + item.email)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Codigo: ' + item.num_ref)}
                            </Text>
                          </>
                        )}

                        {/* {item.tipo_pago === 'Efectivo' && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Email: ' + item.email)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                {textAlign: textRTLStyle},
                              ]}>
                              {t('Codigo: ' + item.num_ref)}
                            </Text>
                          </>
                        )} */}
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
                ),
            )}
          </LinearGradient>
        </LinearGradient>
        {/* {otherPaymentMode.map(
          (item, index) =>
            index >= 2 && (
              <LinearGradient
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 0.0, y: 1.0 }}
                colors={colors}
                style={[
                  styles.otherPaymentModeText,
                  { shadowColor: appColors.shadowColor, borderradius: 6 },
                  { flexDirection: viewRTLStyle },
                ]}>
                <LinearGradient
                  start={{ x: 0.0, y: 0.0 }}
                  end={{ x: 0.0, y: 1.0 }}
                  colors={linearColorStyle}
                  style={[
                    styles.menuItemContentTwo,
                    { shadowColor: appColors.shadowColor },
                    { flexDirection: viewRTLStyle },
                  ]}>
                  <Image style={styles.imgContainer} source={item.img} />
                  <Text
                    style={[
                      styles.titleBooks,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    {t(item.title)}
                  </Text>
                  <RadioButton
                    onPress={() => {
                      paymentDatas(index);
                    }}
                    checked={index === selectedItem}
                  />
                </LinearGradient>
              </LinearGradient>
            ),
        )} */}
      </View>
      <View style={[external.fx_1, external.js_end]}>
        <BottomContainer
          leftValue={
            <Text style={[styles.priceText, {color: textColorStyle}]}>
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
        closeModal={closeModal}
        title={successfullyReset}
        subtitle={
          'Se ha cargado su reporte de pago. Ahora debe esperar a que el administrador apruebe su ingreso.'
        }
        value={
          <View>
            <TouchableOpacity style={[external.as_end]} onPress={closeModal}>
              <Cross />
            </TouchableOpacity>
            <Image
              style={styles.imgStyle}
              source={isDark ? images.Successfull : images.successfull}
            />
            <Text
              style={[
                commonStyles.hederH2,
                external.ti_center,
                {color: textColorStyle},
              ]}>
              {'Felicitaciones !!'}
            </Text>
            <Text
              style={[
                commonStyles.subtitleText,
                external.ti_center,
                {fontSize: fontSizes.FONT19},
              ]}>
              {
                'Se ha cargado su reporte de pago. Ahora debe esperar a que el administrador apruebe su ingreso.'
              }
            </Text>
            <View style={[external.mt_20]}>
              <NavigationButton
                backgroundColor={'#2D3261'}
                title="Ir al inicio"
                onPress={() => navigation.navigate('DrawerScreen')}
                color={appColors.screenBg}
              />
              {/* <View style={[external.mt_15]}>
                <NavigationButton
                  backgroundColor={appColors.screenBg}
                  title="Continue Shopping"
                  onPress={() => navigation.navigate('DrawerScreen')}
                  color={textColorStyle}
                  borderWidth={0.3}
                />
              </View> */}
            </View>
          </View>
        }
      />

      <Modal visible={addItem} transparent={false} animationType={'slide'}>
        <View style={styles.container}>
          {metodoSelected === 'Zelle' ? (
            <View style={{marginTop: 20}}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                ]}>
                <Text
                  style={[commonStyles.titleText19, {color: textColorStyle}]}>
                  Reportar Pago (Precio: ${PrecioPago})
                </Text>
              </View>
              <SolidLine />

              <TextInputs
                title={'Email'}
                placeHolder={'Ingrese email'}
                onChangeText={text => setEmailZelle(text)}
              />
              <TextInputs
                title={'Monto'}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setmonto(numericText);
                }}
                keyboardType="numeric"
                placeHolder={'Ingrese el monto'}
              />

              <Text
                style={[
                  styles.headingContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                  {marginTop: 10}, // Agregar marginTop de 10
                ]}>
                Fecha del Pago
              </Text>

              <DatePicker
                maximumDate={new Date()}
                date={date}
                onDateChange={setDate}
                theme="light"
                title="Fecha del Pago"
              />

              <View style={{marginTop: 50}}>
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
          ) : metodoSelected === 'Transferencia' ? (
            <View>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                ]}>
                <Text
                  style={[commonStyles.titleText19, {color: textColorStyle}]}>
                  Reportar Pago (Precio: ${PrecioPago})
                </Text>
              </View>
              <SolidLine />

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

                <View style={{marginTop: 5}}>
                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    Banco de origen
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        overflow: 'hidden',
                        height: 50,
                        marginRight: 5,
                      }}>
                      <Picker
                        selectedValue={SelectedBanco}
                        onValueChange={itemValue => setSelectedBanco(itemValue)}
                        style={{
                          width: 400,
                          height: 50, // Altura para el Picker
                          color: 'black',
                        }}>
                        {bancos.map(banco => (
                          <Picker.Item
                            key={banco.label}
                            label={banco.label}
                            value={banco.label}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={{marginTop: 5}}>
                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    Banco Destino
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        overflow: 'hidden',
                        height: 50,
                        marginRight: 5,
                      }}>
                      <Picker
                        selectedValue={SelectedBancoDestino}
                        onValueChange={itemValue =>
                          setSelectedBancoDestino(itemValue)
                        }
                        style={{
                          width: 500,
                          height: 50, // Altura para el Picker
                          color: 'black',
                        }}>
                        {bancos.map(banco => (
                          <Picker.Item
                            key={banco.label}
                            label={banco.label}
                            value={banco.label}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={{marginTop: 0}}>
                  <TextInputs
                    title={'Monto'}
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setmonto(numericText);
                    }}
                    keyboardType="numeric"
                    placeHolder={'Ingrese el monto'}
                  />

                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                      {marginTop: 10}, // Agregar marginTop de 10
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
                      style={{height: 150}} // Ajustar el tamaño
                    />
                  </View>
                </View>

                <View style={{marginBottom: 20}}>
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
          ) : metodoSelected === 'Pago Móvil' ? (
            <View>
              <ScrollView style={{marginBottom: 5}}>
              <View>
                <View
                  style={[
                    external.fd_row,
                    external.ai_center,
                    external.js_space,
                  ]}>
                  <Text
                    style={[commonStyles.titleText19, {color: textColorStyle}]}>
                    Reportar Pago (Precio: ${PrecioPago})
                  </Text>
                </View>
                <SolidLine />

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
                  title={'Numero telefonico'}
                  onChangeText={text => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    settelefono(numericText);
                  }}
                  keyboardType="numeric"
                  placeHolder={'Ingrese su telefono'}
                />

                <View style={{marginTop: 5}}>
                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    Banco de origen
                  </Text>

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        overflow: 'hidden',
                        height: 50,
                        marginRight: 5,
                      }}>
                      <Picker
                        selectedValue={SelectedBanco}
                        onValueChange={itemValue => setSelectedBanco(itemValue)}
                        style={{
                          width: 400,
                          height: 50, // Altura para el Picker
                          color: 'black',
                        }}>
                        {bancos.map(banco => (
                          <Picker.Item
                            key={banco.label}
                            label={banco.label}
                            value={banco.label}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={{marginTop: 5}}>
                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    Banco Destino
                  </Text>

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View
                      style={{
                        overflow: 'hidden',
                        height: 50,
                        marginRight: 5,
                      }}>
                      <Picker
                        selectedValue={SelectedBancoDestino}
                        onValueChange={itemValue =>
                          setSelectedBancoDestino(itemValue)
                        }
                        style={{
                          width: 500,
                          height: 50, // Altura para el Picker
                          color: 'black',
                        }}>
                        {bancos.map(banco => (
                          <Picker.Item
                            key={banco.label}
                            label={banco.label}
                            value={banco.label}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={{marginTop: 5}}>
                  <TextInputs
                    title={'Monto'}
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setmonto(numericText);
                    }}
                    keyboardType="numeric"
                    placeHolder={'Ingrese el monto'}
                  />

                  <Text
                    style={[
                      styles.headingContainer,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                      {marginTop: 10}, // Agregar marginTop de 10
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
                      style={{height: 65}} // Ajustar el tamaño
                    />
                  </View>
                </View>

              </View>
              </ScrollView>

                <View style={{marginBottom: 70}}>
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

          ) : metodoSelected === 'Efectivo' ? (
            <View style={{marginTop: 20}}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                ]}>
                <Text
                  style={[commonStyles.titleText19, {color: textColorStyle}]}>
                  Reportar Pago (Precio: ${PrecioPago})
                </Text>
              </View>
              <SolidLine />

              <TextInputs
                title={'Numero telefonico'}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  settelefono(numericText);
                }}
                keyboardType="numeric"
                placeHolder={'Ingrese un numero de contacto'}
              />

              <TextInputs
                title={'Monto'}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setmonto(numericText);
                }}
                keyboardType="numeric"
                placeHolder={'Ingrese el monto'}
              />

              <Text
                style={[
                  styles.headingContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                  {marginTop: 10}, // Agregar marginTop de 10
                ]}>
                Fecha del Pago
              </Text>

              <DatePicker
                maximumDate={new Date()}
                date={date}
                onDateChange={setDate}
                theme="light"
                title="Fecha del Pago"
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
              <View style={{marginTop: 50}}>
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
      </Modal>

      {/* <CommonModal
                animationType={'fade'}
                isVisible={addItem}
                closeModal={closeModal}
                title={successfullyReset}
                subtitle={
                  'Your order is accepted. Your items are on the way and should arrive shortly.'
                }
                value={
                  metodoSelected === 'Zelle' ? (
        
                        <View>

                          <View
                            style={[
                              external.fd_row,
                              external.ai_center,
                              external.js_space,
                            ]}>
                            <Text
                              style={[
                                commonStyles.titleText19,
                                {color: textColorStyle},
                              ]}>
                              Reportar Pago (Precio: ${PrecioPago})
                            </Text>
                          </View>
                          <SolidLine />

                          <TextInputs
                            title={'Email'}
                            placeHolder={'Ingrese email'}
                            onChangeText={text => setEmailZelle(text)}
                          />
                          <TextInputs
                            title={'Monto'}
                            onChangeText={text => {
                              const numericText = text.replace(/[^0-9]/g, '');
                              setmonto(numericText);
                            }}
                            keyboardType="numeric"
                            placeHolder={'Ingrese el monto'}
                          />

                          <Text
                            style={[
                              styles.headingContainer,
                              {color: textColorStyle},
                              {textAlign: textRTLStyle},
                              {marginTop: 10}, // Agregar marginTop de 10
                            ]}>
                            Fecha del Pago
                          </Text>

                          <DatePicker
                            maximumDate={new Date()}
                            date={date}
                            onDateChange={setDate}
                            theme="light"
                            title="Fecha del Pago"
                          />

                          <View
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
                          </View>
                        </View>
                  ) : metodoSelected === 'Transferencia' ? (
                    <View style={{paddingTop: 20}}>
                      <View
                        style={[
                          external.fd_row,
                          external.ai_center,
                          external.js_space,
                        ]}>
                        <Text
                          style={[
                            commonStyles.titleText19,
                            {color: textColorStyle},
                          ]}>
                          Reportar Pago (Precio: ${PrecioPago})
                        </Text>
                      </View>
                      <SolidLine />

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

                        <View style={{marginTop: 5}}>
                          <Text
                            style={[
                              styles.headingContainer,
                              {color: textColorStyle},
                              {textAlign: textRTLStyle},
                            ]}>
                            Banco de origen
                          </Text>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                overflow: 'hidden',
                                height: 50,
                                marginRight: 5,
                              }}>
                              <Picker
                                selectedValue={SelectedBanco}
                                onValueChange={itemValue =>
                                  setSelectedBanco(itemValue)
                                }
                                style={{
                                  width: 400,
                                  height: 50, // Altura para el Picker
                                  color: 'black',
                                }}>
                                {bancos.map(banco => (
                                  <Picker.Item
                                    key={banco.label}
                                    label={banco.label}
                                    value={banco.label}
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        </View>

                        <View style={{marginTop: 5}}>
                          <Text
                            style={[
                              styles.headingContainer,
                              {color: textColorStyle},
                              {textAlign: textRTLStyle},
                            ]}>
                            Banco Destino
                          </Text>

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                overflow: 'hidden',
                                height: 50,
                                marginRight: 5,
                              }}>
                              <Picker
                                selectedValue={SelectedBancoDestino}
                                onValueChange={itemValue =>
                                  setSelectedBancoDestino(itemValue)
                                }
                                style={{
                                  width: 500,
                                  height: 50, // Altura para el Picker
                                  color: 'black',
                                }}>
                                {bancos.map(banco => (
                                  <Picker.Item
                                    key={banco.label}
                                    label={banco.label}
                                    value={banco.label}
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        </View>

                        <View style={{marginTop: 5}}>
                          <TextInputs
                            title={'Monto'}
                            onChangeText={text => {
                              const numericText = text.replace(/[^0-9]/g, '');
                              setmonto(numericText);
                            }}
                            keyboardType="numeric"
                            placeHolder={'Ingrese el monto'}
                          />

                          <Text
                            style={[
                              styles.headingContainer,
                              {color: textColorStyle},
                              {textAlign: textRTLStyle},
                              {marginTop: 10}, // Agregar marginTop de 10
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
                              style={{height: 150}} // Ajustar el tamaño
                            />
                          </View>
                        </View>

                        <View
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
                        </View>
                      </View>
                    </View>
                  ) : metodoSelected === 'Pago Móvil' ? (
                    <View>
                      <View
                        style={[
                          external.fd_row,
                          external.ai_center,
                          external.js_space,
                        ]}>
                        <Text
                          style={[
                            commonStyles.titleText19,
                            {color: textColorStyle},
                          ]}>
                          Reportar Pago (Precio: ${PrecioPago})
                        </Text>
                      </View>
                      <SolidLine />

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
                        title={'Numero telefonico'}
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          settelefono(numericText);
                        }}
                        keyboardType="numeric"
                        placeHolder={'Ingrese su telefono'}
                      />

                      <View style={{marginTop: 5}}>
                        <Text
                          style={[
                            styles.headingContainer,
                            {color: textColorStyle},
                            {textAlign: textRTLStyle},
                          ]}>
                          Banco de origen
                        </Text>

                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <View
                            style={{
                              overflow: 'hidden',
                              height: 50,
                              marginRight: 5,
                            }}>
                            <Picker
                              selectedValue={SelectedBanco}
                              onValueChange={itemValue =>
                                setSelectedBanco(itemValue)
                              }
                              style={{
                                width: 400,
                                height: 50, // Altura para el Picker
                                color: 'black',
                              }}>
                              {bancos.map(banco => (
                                <Picker.Item
                                  key={banco.label}
                                  label={banco.label}
                                  value={banco.label}
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>

                      <View style={{marginTop: 5}}>
                        <Text
                          style={[
                            styles.headingContainer,
                            {color: textColorStyle},
                            {textAlign: textRTLStyle},
                          ]}>
                          Banco Destino
                        </Text>

                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <View
                            style={{
                              overflow: 'hidden',
                              height: 50,
                              marginRight: 5,
                            }}>
                            <Picker
                              selectedValue={SelectedBancoDestino}
                              onValueChange={itemValue =>
                                setSelectedBancoDestino(itemValue)
                              }
                              style={{
                                width: 500,
                                height: 50, // Altura para el Picker
                                color: 'black',
                              }}>
                              {bancos.map(banco => (
                                <Picker.Item
                                  key={banco.label}
                                  label={banco.label}
                                  value={banco.label}
                                />
                              ))}
                            </Picker>
                          </View>
                        </View>
                      </View>

                      <View style={{marginTop: 5}}>
                        <TextInputs
                          title={'Monto'}
                          onChangeText={text => {
                            const numericText = text.replace(/[^0-9]/g, '');
                            setmonto(numericText);
                          }}
                          keyboardType="numeric"
                          placeHolder={'Ingrese el monto'}
                        />

                        <Text
                          style={[
                            styles.headingContainer,
                            {color: textColorStyle},
                            {textAlign: textRTLStyle},
                            {marginTop: 10}, // Agregar marginTop de 10
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
                            style={{height: 80}} // Ajustar el tamaño
                          />
                        </View>
                      </View>

                      <View
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
                      </View>
                    </View>
                  ) : metodoSelected === 'Efectivo' ? (
                    <View>
                      <View
                        style={[
                          external.fd_row,
                          external.ai_center,
                          external.js_space,
                        ]}>
                        <Text
                          style={[
                            commonStyles.titleText19,
                            {color: textColorStyle},
                          ]}>
                          Reportar Pago (Precio: ${PrecioPago})
                        </Text>
                      </View>
                      <SolidLine />

                      <TextInputs
                        title={'Numero telefonico'}
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          settelefono(numericText);
                        }}
                        keyboardType="numeric"
                        placeHolder={'Ingrese un numero de contacto'}
                      />

                      <TextInputs
                        title={'Monto'}
                        onChangeText={text => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          setmonto(numericText);
                        }}
                        keyboardType="numeric"
                        placeHolder={'Ingrese el monto'}
                      />

                      <Text
                        style={[
                          styles.headingContainer,
                          {color: textColorStyle},
                          {textAlign: textRTLStyle},
                          {marginTop: 10}, // Agregar marginTop de 10
                        ]}>
                        Fecha del Pago
                      </Text>

                      <DatePicker
                        maximumDate={new Date()}
                        date={date}
                        onDateChange={setDate}
                        theme="light"
                        title="Fecha del Pago"
                      />

                      <View
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
                      </View>
                    </View>
                  ) : null
                }
              /> */}
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

export default ReportarPago;
