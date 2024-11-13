import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState} from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {seeAll} from '../../../constant';
import {YellowStar} from '../../../assets/icons/yellowStar';
import styles from './styles.css';
import LinearGradient from 'react-native-linear-gradient';
import {MinusIcon, Plus, PlusRadial} from '../../../utils/icon';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import appFonts from '../../../themes/appFonts';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import appColors from '../../../themes/appColors';
import {useNavigation} from '@react-navigation/native';
import Icons from 'react-native-vector-icons/FontAwesome';
import {Snackbar} from 'react-native-paper';

import notImageFound from '../../../assets/noimageold.jpeg';

const ShowProductsContainer = ({data, value, show, showPlus, marginTop}) => {
  const {
    linearColorStyle,
    textColorStyle,
    isDark,
    imageContainer,
    textRTLStyle,
    viewRTLStyle,
    t,
    linearColorStyleTwo,
    currSymbol,
    currPrice,
  } = useValues();
  const navigation = useNavigation();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  const [visibleHint, setVisibleHint] = useState(false);
  const [statusLabel, setstatusLabel] = useState(false);



  const goToDetail = item => {
    console.log(item);

    navigation.navigate('FormTaller', {uid: item.uid});
  };

  const onLongPressHandler = (itemId, status) => {
    setVisibleHint(itemId); // Muestra el Snackbar para el ítem presionado
    setstatusLabel(status)
    setTimeout(() => {
      setVisibleHint(null); // Oculta el Snackbar después de un tiempo
    }, 1000);
  };

  const onDismissHint = () => {
    setVisibleHint(null); // Oculta el Snackbar cuando se presiona para cerrar
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => goToDetail(item)} activeOpacity={0.9}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
          {shadowColor: appColors.shadowColor},
          {flexDirection: viewRTLStyle},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
            {flexDirection: viewRTLStyle},
          ]}>
          {/* <View
            style={[styles.imageContainer, {backgroundColor: imageContainer}]}>
            {item.img == null ? (
              <Image style={styles.image} source={notImageFound} />
            ) : (
              <Image style={styles.image} source={item?.img} />
            )}
          </View> */}
          <View style={styles.textContainer}>
            <View
              style={[styles.ratingContainer, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  styles.title,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t(item.nombre)}
              </Text>
              {showPlus && (
                <TouchableOpacity style={styles.ratingContainer}>
                  <YellowStar />
                  <Text style={[styles.ratingText]}>5</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={[
                styles.datoSub,
                {textAlign: textRTLStyle, marginBottom: -10},
              ]}>
              Rif: {t(item.taller.rif)}
            </Text>
            <View
              style={[styles.priceContainer, {flexDirection: viewRTLStyle}]}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  {width: '75%'},
                  {flexDirection: viewRTLStyle},
                ]}>
                <Text style={[styles.status, {color: textColorStyle}]}>
                  Telefono: {t(item.phone)}
                </Text>
              </View>

              {/* {
                item.status === "Pendiente" ? (
                  <TouchableOpacity
                    onPress={() => onLongPressHandler(item.uid, item.status)}>
                    <Icons name="times-circle-o" size={23} color="#e5be01" />
                  </TouchableOpacity>
                ) : null
              }


              {
                item.status == "En espera por aprobación" ? (
                  <TouchableOpacity
                    onPress={() => onLongPressHandler(item.uid, item.status)}>
                    <Icons name="warning" size={23} color="#e5be01" />
                  </TouchableOpacity>
                ) : null
              }


{
                item.status === "Aprobado" ? (
                  <TouchableOpacity
                    onPress={() => onLongPressHandler(item.uid, item.status)}>
                    <Icons name="check-circle-o" size={23} color="green" />
                  </TouchableOpacity>
                ) : null
              }


              {
                item.status == "Rechazado" ? (
                  <TouchableOpacity
                    onPress={() => onLongPressHandler(item.uid, item.status)}>
                    <Icons name="ban" size={23} color="red" />
                  </TouchableOpacity>
                ) : null
              } */}



              {/* Mostrar el hint (Snackbar) solo para el item actual */}
              {/* <Snackbar
                visible={visibleHint === item.uid}
                onDismiss={onDismissHint}
                duration={900}>
                {statusLabel}
              </Snackbar> */}
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.newArrivalContainer}>
      <View style={{marginTop: marginTop || windowHeight(14)}}>
        {show && (
          <H3HeadingCategory value={value} seeall={t('transData.seeAll')} />
        )}
      </View>
      <FlatList data={data} renderItem={renderItem} />
    </View>
  );
};

export default ShowProductsContainer;
