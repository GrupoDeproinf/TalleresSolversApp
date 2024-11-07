import { Image, Text, TouchableOpacity, View, ToastAndroid } from 'react-native';
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


const ReportarPago = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addItem, setAddItem] = useState(null);

  const [PrecioPago, setPrecioPago] = useState(null);

  const [nombrePlan, setnombrePlan] = useState(null);
  const paymentDatas = index => {
    setSelectedItem(index === selectedItem ? null : index);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const closeSecondModel = () => {
    setAddItem(false);
  };

  const navigationScreen = useNavigation();
  const route = useRoute();


  useEffect(() => {
    const { data } = route.params;
    setPrecioPago(Number(data.monto))
    setnombrePlan(data.nombre)
    console.log(data)
  }, []);

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
              <TouchableOpacity onPress={() => {
                if (selectedItem == null){
                  showToast("Debe seleccionar un metodo de pago")
                } else{
                  setAddItem(true)
                }
                
              }}>
                <Text style={styles.addnewCard}>
                  Agregar datos
                </Text>
              </TouchableOpacity>
            </View>
            <SolidLine />
            {otherPaymentMode.map(
              (item, index) =>
                index < 3 && (
                  <View>
                    <View
                      style={[
                        external.fd_row,
                        external.p_10,
                        external.ai_center,
                        { flexDirection: viewRTLStyle },
                      ]}>
                      <Image style={styles.imgGround} source={item.img} />
                      <View style={[external.ph_10, external.fg_9]}>
                        <Text
                          style={[
                            commonStyles.subtitleText,
                            { color: textColorStyle, textAlign: textRTLStyle },
                          ]}
                        >
                          {t(item.title)}
                        </Text>

                        {item.title === "Transferencia" && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Cuenta : 0000 0000 0000 0000")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Titular : Evande Alvarado")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Cedula/RIF : 00000000")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Tipo : Corriente")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Banco : Banco Nacional de Credito")}
                            </Text>
                          </>
                        )}

                        {item.title === "Pago Movil" && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Número : 0000000000")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Cedula/RIF : 00000000")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Banco : Banco Nacional de Credito")}
                            </Text>
                          </>
                        )}

                        {item.title === "Zelle" && (
                          <>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Email : evanderjar@gmail.com")}
                            </Text>
                            <Text
                              style={[
                                commonStyles.subtitleText,
                                { textAlign: textRTLStyle },
                              ]}
                            >
                              {t("Codigo : 00000000")}
                            </Text>
                          </>
                        )}
                      </View>

                      <RadioButton
                        onPress={() => {
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
                if (selectedItem == null){
                  showToast("Debe seleccionar un metodo de pago")
                } else {
                  setModalVisible(true)
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
                onPress={() => navigation.navigate('OrderStatus')}
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
          <View>
            <View
              style={[external.fd_row, external.ai_center, external.js_space]}>
              <Text style={[commonStyles.titleText19, { color: textColorStyle }]}>
                Reportar Pago (Precio: ${PrecioPago})
              </Text>
              {/* <TouchableOpacity onPress={closeSecondModel}>
                <Cross />
              </TouchableOpacity> */}
            </View>
            <SolidLine />

            <TextInputs
              title={'Card Number'}
              placeHolder={'Enter card number'}
            />
            <TextInputs
              title={'Card Holder Name'}
              placeHolder={'Enter card number'}
            />
            <View style={[external.fd_row, { width: '50%' }]}>
              <View style={{ width: '95%' }}>
                <TextInputs title={'CVV'} placeHolder={'Enter cvv'} />
              </View>
              <View style={{ width: '95%', marginHorizontal: 15 }}>
                <TextInputs title={'Exp. Date'} placeHolder={'Enter date'} />
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
                  title={'Cancel'}
                  color={appColors.titleText}
                  borderWidth={0.3}
                  onPress={closeSecondModel}
                />
              </View>
              <View style={{ width: windowWidth(200) }}>
                <NavigationButton
                  backgroundColor={'#2D3261'}
                  title={'Add'}
                  color={appColors.screenBg}
                  onPress={closeSecondModel}
                />
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default ReportarPago;
