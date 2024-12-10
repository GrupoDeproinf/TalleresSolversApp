import {FlatList, Image, Text, View} from 'react-native';
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
import api from '../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const OrderHistory = () => {
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

  const [dataService, setDataService] = useState();
  const [dataUser, setDataUser] = useState();

  const navigate = useNavigation()

  const getDataServices = async () => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;
    console.log('-----------------------------------------------------');
    console.log('user', user);
    console.log('-----------------------------------------------------');
    setDataUser(user);
  
    try {
      const response = await api.get('/home/getContactService');
      const result = response.data;
  
      // Filtrar los datos por `uid`
      if (user && user.uid) {
        const filteredData = result.filter(item => item.usuario.id === user.uid);
        setDataService(filteredData);
        console.log('-----------------------------------------------------');
        console.log('Filtered result', filteredData);
        console.log('-----------------------------------------------------');
      } else {
        console.warn('UID del usuario no encontrado. Mostrando datos completos.');
        setDataService(result);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };
  

  useEffect(() => {
    getDataServices();
  }, []);

  const renderItem = ({item}) => (
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
            {backgroundColor: isDark ? appColors.blackBg : appColors.bgLayout},
          ]}>
          <Image style={styles.img} source={item.img} />
        </View>
        <View style={[external.mh_8]}>
          <View
            style={[
              external.fd_row,
              external.ai_center,
              {flexDirection: viewRTLStyle},
            ]}>
            <Text
              numberOfLines={2}
              style={[
                styles.titleContainer,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t(item.nombre_servicio)}
            </Text>
            
            <Text
              style={[
                commonStyles.H1Banner,
                {color: textColorStyle, fontFamily: appFonts.semiBold},
              ]}>
              {currSymbol}
              {(currPrice * item.precio).toFixed(2)}
            </Text>
          </View>
          {/* <Text style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
            {t('transData.colorBlue')}
          </Text> */}
          <View
            style={[
              external.fd_row,
              external.ai_center,
              {flexDirection: viewRTLStyle},
            ]}>
              
            <Text
              style={[
                styles.deliveryContainer,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {/* {t('transData.deliverd')} */}
              Fecha: {moment(item.date).format('DD/MM/YYYY')}
            </Text>
            <View
              style={[
                styles.orderContainer,
                {borderTopEndRadius: isRTL ? windowHeight(9) : undefined},
              ]}>
              <Text style={styles.buyAgain} onPress={() => (navigate.navigate('ProductDetailOne', {uid: item.uid_servicio}))}>Ver</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value="Mis Intereses" />
      <FlatList data={dataService} renderItem={renderItem} />
    </View>
  );
};

export default OrderHistory;
