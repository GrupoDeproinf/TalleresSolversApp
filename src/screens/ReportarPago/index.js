import { Image, Text, TouchableOpacity, View, ToastAndroid, Button } from 'react-native';
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
import { Buffer } from 'buffer'

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


  const [dataPlan, setdataPlan] = useState();

  const [imageUri, setImageUri] = useState(null);
  const [base64, setBase64] = useState('');



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

    setAddItem(false);
  };

  const navigationScreen = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const { data } = route.params;
    setdataPlan(data)
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
    if (metodoSelected == 'Zelle') {
      if (emailZelle == '' || cod_ref == '') {
        showToast('No puede dejar campos vacíos');
      } else {
        console.log(emailZelle);
        console.log(cod_ref);

        console.log(dataPlan)
        console.log(userLogged)

        const dataFinal = {
          uid: userLogged.uid,
          emailZelle: emailZelle,
          cod_ref: cod_ref,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: "Zelle",
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
        }

        console.log("objeto final", dataFinal)
        SendInfo(dataFinal)
      }
    } else if (metodoSelected == 'Transferencia') {
      if (nro_referencia == '' || bancoTranfe == '' || identificacion == '') {
        showToast('No puede dejar campos vacíos');
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: "Transferencia",
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
        }
        console.log("objeto final", dataFinal)
        SendInfo(dataFinal)
      }
    } else if (metodoSelected == 'Pago Móvil') {
      if (nro_referencia == '' || bancoTranfe == '' || telefono == '') {
        showToast('No puede dejar campos vacíos');
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: "Pago Móvil",
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
        }

        console.log("objeto final", dataFinal)
        SendInfo(dataFinal)

      }
    } else if (metodoSelected == 'Efectivo') {
      if (telefono == '') {
        showToast('No puede dejar campos vacíos');
      } else {
        const dataFinal = {
          uid: userLogged.uid,
          emailZelle: emailZelle,
          cod_ref: nro_referencia,
          bancoTranfe: bancoTranfe,
          identificacion: identificacion,
          telefono: telefono,
          amount: Number(dataPlan.monto),
          paymentMethod: "Efectivo",
          nombre: dataPlan.nombre,
          vigencia: dataPlan.vigencia,
          cant_services: dataPlan.cantidad_servicios,
        }

        console.log("objeto final", dataFinal)
        SendInfo(dataFinal)

      }
    }
  };

  const SendInfo = async (infoUserCreated) => {
    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/ReportarPagoData', infoUserCreated);

      // Verificar la respuesta del servidor
      console.log(response); // Mostrar la respuesta completa

      const result = response.data; // Los datos vienen directamente de response.data
      console.log(result); // Aquí puedes manejar la respuesta

      closeSecondModel()
      setModalVisible(true)
      // navigation.navigate('Login');
    } catch (error) {
      if (error.response) {
        // La solicitud se hizo y el servidor respondió con un código de estado
        console.error('Error al guardar el usuario:', error.response.data.message);
        showToast(error.response.data.message); // Mostrar el mensaje de error del servidor
        closeSecondModel()
      } else {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('Error en la solicitud:', error);
        closeSecondModel()
      }
    }
  }

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
        const source = { uri: response.assets[0].uri };
        setImageUri(source);
        const base64String = response.assets[0].base64;
        setBase64(base64String);
      }
    });
  };


  return (
    <View
      style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      <View style={[external.mh_20]}>
        <HeaderContainer value="Reportar Pago" />
        <LinearGradient
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
            ]}>
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

              {/* <TouchableOpacity
                onPress={() => {
                  if (selectedItem == null) {
                    showToast('Debe seleccionar un metodo de pago');
                  } else {
                    setAddItem(true);
                  }
                }}>
                <Text style={styles.addnewCard}>Agregar datos</Text>
              </TouchableOpacity> */}
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
                        { flexDirection: viewRTLStyle },
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
                          style={{ marginRight: 16 }}
                        />
                      )}

                      {item.tipo_pago === 'Pago Móvil' && (
                        <Icons4
                          name="square-phone"
                          size={30}
                          color="#2D3261"
                          style={{ marginRight: 12 }}
                        />
                      )}

                      {item.tipo_pago === 'Efectivo' && (
                        <Icons4
                          name="money-bill"
                          size={30}
                          color="#2D3261"
                          style={{ marginRight: 0 }}
                        />
                      )}

                      <View style={[external.ph_10, external.fg_9]}>
                        <Text
                          style={[
                            commonStyles.subtitleText,
                            { color: textColorStyle, textAlign: textRTLStyle },
                          ]}>
                          {t(item.tipo_pago)}
                        </Text>

                        {item.tipo_pago === 'Transferencia' && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Cuenta: ' + item.cuenta)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Titular: ' + item.titular)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Cedula/RIF: ' + item.cedula_rif)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Tipo: ' + item.tipo_cuenta)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
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
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Número: ' + item.telefono)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Cedula/RIF: ' + item.cedula_rif)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
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
                                { textAlign: textRTLStyle },
                              ]}>
                              {t('Email: ' + item.email)}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
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
      <CommonModal
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
                  style={[commonStyles.titleText19, { color: textColorStyle }]}>
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
                title={'Codigo de referencia'}
                onChangeText={text => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setcod_ref(numericText);
                }}
                placeHolder={'00000000'}
                keyboardType="numeric"
              />

                {/* <Button title="Select Image" onPress={selectImage} />
                {imageUri && (
                  <Image source={imageUri} style={{ width: 200, height: 200 }} />
                )}
                {base64 ? (
                  <Text>{base64.substring(0, 100)}...</Text> // Muestra una parte del base64
                ) : (
                  <Text>No image selected</Text>
                )} */}


              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                  external.mt_30,
                ]}>
                <View style={{ width: windowWidth(200) }}>
                  <NavigationButton
                    backgroundColor={appColors.screenBg}
                    title={'Cancelar'}
                    color={appColors.titleText}
                    borderWidth={0.3}
                    onPress={closeSecondModel}
                  />
                </View>
                <View style={{ width: windowWidth(200) }}>
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
                title={'Banco'}
                onChangeText={text => setbancoTranfe(text)}
                placeHolder={'Ingrese su banco'}
              />

              <View style={{ marginTop: 5 }}>
                <Text
                  style={[
                    styles.headingContainer,
                    { color: textColorStyle },
                    { textAlign: textRTLStyle },
                  ]}>
                  Identificación
                </Text>

                {/* Contenedor para el Picker y el TextInput */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                  <View style={{ flex: 1, marginTop: -22, marginLeft: -50 }}>
                    <TextInputs
                      title=""
                      value={identificacion}
                      placeHolder="Ingrese el número de cedula"
                      onChangeText={text => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        setidentificacion(numericText);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                  external.mt_30,
                ]}>
                <View style={{ width: windowWidth(200) }}>
                  <NavigationButton
                    backgroundColor={appColors.screenBg}
                    title={'Cancelar'}
                    color={appColors.titleText}
                    borderWidth={0.3}
                    onPress={closeSecondModel}
                  />
                </View>
                <View style={{ width: windowWidth(200) }}>
                  <NavigationButton
                    backgroundColor={'#2D3261'}
                    title={'Reportar Pago'}
                    color={appColors.screenBg}
                    onPress={ReportarPagoData}
                  />
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
                  style={[commonStyles.titleText19, { color: textColorStyle }]}>
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
                title={'Banco'}
                onChangeText={text => setbancoTranfe(text)}
                placeHolder={'Ingrese su banco'}
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

              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                  external.mt_30,
                ]}>
                <View style={{ width: windowWidth(200) }}>
                  <NavigationButton
                    backgroundColor={appColors.screenBg}
                    title={'Cancelar'}
                    color={appColors.titleText}
                    borderWidth={0.3}
                    onPress={closeSecondModel}
                  />
                </View>
                <View style={{ width: windowWidth(200) }}>
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
                  style={[commonStyles.titleText19, { color: textColorStyle }]}>
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

              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                  external.mt_30,
                ]}>
                <View style={{ width: windowWidth(200) }}>
                  <NavigationButton
                    backgroundColor={appColors.screenBg}
                    title={'Cancelar'}
                    color={appColors.titleText}
                    borderWidth={0.3}
                    onPress={closeSecondModel}
                  />
                </View>
                <View style={{ width: windowWidth(200) }}>
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
      />
    </View>
  );
};

export default ReportarPago;
