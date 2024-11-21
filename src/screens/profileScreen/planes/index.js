import {FlatList, Image, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import {orderHistoryData} from '../../../data/orderHistory';
import styles from './style.css';
import appFonts from '../../../themes/appFonts';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {windowHeight} from '../../../themes/appConstant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import {useNavigation} from '@react-navigation/native';

import planes from '../../../assets/planes.jpg';

const Planscreen = () => {
  const {
    isDark,
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    textRTLStyle,
    viewRTLStyle,
    t,
    currSymbol,
    currPrice,
    isRTL,
  } = useValues();
  const colors = isDark
    ? ['#808184', '#2E3036']
    : [appColors.screenBg, appColors.screenBg];

  const [dataPlanes, setdataPlanes] = useState([]);

  const [userLogged, setuserLogged] = useState([]);

  const navigationScreen = useNavigation();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    console.log('Buscar Planes');
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      setuserLogged(user);

      try {
        // Hacer la solicitud GET utilizando Axios
        const response = await api.get('/usuarios/getPlanes', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Verificar la respuesta del servidor
        if (response.status === 200) {
          const result = response.data;
          console.log('PLANESSS++++++++', result); // Aquí puedes manejar la respuesta

          setdataPlanes(result);
        } else {
          setdataPlanes([]);
        }
      } catch (error) {
        setdataPlanes([]);
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
      setdataPlanes([]);
      console.log(e);
    }
  };

  const goToReportPay = item => {
    navigationScreen.navigate('ReportarPago', {data: item});
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => goToReportPay(item)}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 1.0, y: 1.0}}
        colors={colors}
        style={[styles.contianer, {flexDirection: viewRTLStyle}]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[styles.menuItemContent, {flexDirection: viewRTLStyle}]}>
          <View
            style={[
              styles.grayBoxContainer,
              {
                backgroundColor: isDark
                  ? appColors.blackBg
                  : appColors.bgLayout,
              },
            ]}>
            <Image style={styles.img} source={planes} />
          </View>

          <View style={[external.mh_8]}>
            <View
              style={[
                external.fd_column, // Cambiar a columna
                external.ai_center,
                {flexDirection: viewRTLStyle},
              ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.titleContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t(item.nombre)}
              </Text>
              <Text
                style={[
                  commonStyles.H1Banner,
                  {color: textColorStyle, fontFamily: appFonts.semiBold},
                ]}>
                {currSymbol}
                {item.monto}
              </Text>
            </View>

            <View
              style={[
                external.fd_column, // Cambiar a columna
                external.ai_center,
                {flexDirection: viewRTLStyle},
              ]}>
              <Text
                style={[
                  styles.deliveryContainer,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {item.descripcion}
              </Text>

              <View
                style={[
                  styles.orderContainer,
                  {
                    borderTopEndRadius: isRTL ? windowHeight(5) : undefined,
                    marginRight: 6, // Margen derecho de 6px
                  },
                ]}>
                <Text style={styles.buyAgain}>
                  Cantidad de servicios: {item.cantidad_servicios}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value="Seleccione un plan" />
      <FlatList data={dataPlanes} renderItem={renderItem} />
    </View>
  );
};

export default Planscreen;
