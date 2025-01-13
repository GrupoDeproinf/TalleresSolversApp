import React, {useState} from 'react';
import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import styles from './styles.css';
import {windowHeight} from '../../../themes/appConstant';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';

// Note: Some imports and styles are omitted for brevity

export default function ShowProductsContainer({
  data,
  value,
  show,
  showPlus,
  marginTop,
}) {
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

    navigation.navigate('ProductDetailOne', { uid: item.uid_servicio || item.id });
  };

  const onLongPressHandler = (itemId, status) => {
    setVisibleHint(itemId); // Muestra el Snackbar para el ítem presionado
    setstatusLabel(status);
    setTimeout(() => {
      setVisibleHint(null); // Oculta el Snackbar después de un tiempo
    }, 1000);
  };

  const onDismissHint = () => {
    setVisibleHint(null); // Oculta el Snackbar cuando se presiona para cerrar
  };

  // console.log('---------------------------------------------123');
  // console.log('data:', data);

    const color = isDark ? appColors.blackBg : appColors.bgLayout;
  
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
          <View style={[styles.imageContainer, {backgroundColor: color}]}>
            <Image
              style={styles.image}
              source={{
                uri: Array.isArray(item?.service_image)
                  ? item?.service_image[0]
                  : item?.service_image,
              }}
            />
          </View>
          <View style={styles.textContainer}>
            <View
              style={[styles.ratingContainer, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  styles.title,
                  {color: textColorStyle, textAlign: textRTLStyle},
                ]}>
                {t(item.nombre_servicio)}
              </Text>
            </View>
            <Text
              style={[
                styles.datoSub,
                {textAlign: textRTLStyle, marginBottom: -10},
              ]}>
              {t(item?.taller?.nombre || item?.taller || 'Nombre no disponible')}
            </Text>
            <View
              style={[styles.priceContainer, {flexDirection: viewRTLStyle}]}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  {width: '50%'},
                  {flexDirection: viewRTLStyle},
                ]}>
                <Text
                  style={[
                    styles.datoSub,
                    {textAlign: textRTLStyle, marginBottom: -10},
                  ]}>
                  {t(item?.taller?.estado || '')}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.newArrivalContainer}>
        <View style={{marginTop: marginTop || windowHeight(14)}}>
        {show && (
          <H3HeadingCategory value={value} />
        )}
      </View>
        <FlatList
          data={data || []}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
        />
      </View>
    </>
  );
}
