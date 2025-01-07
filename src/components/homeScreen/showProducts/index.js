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

    navigation.navigate('ProductDetailOne', {uid: item.uid_servicio});
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
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={item.img ? item.img : 'notImageFound'}
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
              {t(item?.taller?.nombre || 'Nombre no disponible')}
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
              {t(item?.taller?.estado || 'Nombre no disponible')}
            </Text>
                {/* <StarRatingDisplay
                  rating={4.5}
                  starSize={15} // Reduced star size
                  starStyle={{marginHorizontal: -1}} // Reduced spacing between stars
                /> */}
              </View>
              {/* Status icons and Snackbar code remains the same */}
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
          <H3HeadingCategory value={value} seeall={t('transData.seeAll')} />
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
