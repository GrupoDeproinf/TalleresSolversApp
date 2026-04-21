import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import appColors from '../../../themes/appColors';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import styles from './style.css';
import {windowWidth} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
const NewCategoriesDetail = ({
  data,
  width,
  value,
  horizontal,
  numColumns,
  valueTwo,
  show,
}) => {
  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    linearColorStyleTwo,
    isDark,
    isRTL,
    textRTLStyle,
    viewRTLStyle,
    t,
    currSymbol,
    currPrice,
  } = useValues();
  const color = isDark ? appColors.blackBg : appColors.bgLayout;
  const navigation = useNavigation();

  console.log('Data123123:', data);

  const renderItem = ({item}) => {
    const imageUri = Array.isArray(item?.service_image)
      ? item?.service_image[0]
      : item?.service_image;
    const serviceUid = item?.uid_servicio === '' ? item?.id : item?.uid_servicio;
    const precioFinal = Number(currPrice * Number(item?.precio || 0)).toFixed(2);
    const toSentenceCase = value => {
      const lower = String(value || '').toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        navigation.navigate('ProductDetailOne', {
          uid: serviceUid,
        });
      }}>
      <View
        style={[
          styles.viewContainer,
          {backgroundColor: bgFullStyle},
          {width: width || windowWidth(200)},
        ]}>
        <View style={styles.menuItemContent}>
          <View style={styles.imgContainer}>
            <Image
              style={styles.img}
              source={
                imageUri
                  ? {uri: imageUri}
                  : require('../../../assets/noimageNew.png')
              }
            />
          </View>

          <View style={[external.ph_10, {paddingTop: 8}, styles.cardContentWrap]}>
            <View style={styles.titleWrap}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  commonStyles.titleText19,
                  styles.titleFixed,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {String(t(item?.nombre_servicio || '')).toUpperCase()}
              </Text>
            </View>
            <View style={styles.subtitleWrap}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  commonStyles.subtitleText,
                  styles.subtitleFixed,
                  {textAlign: textRTLStyle},
                ]}>
                {toSentenceCase(t(item?.taller?.nombre || ''))}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaChipStatus}>
                <View style={styles.metaChipStatusDot} />
                <Text style={styles.metaChipStatusText}>
                  {toSentenceCase(item?.taller?.estado || '')}
                </Text>
              </View>
              <View style={styles.metaChipKm}>
                <Text style={styles.metaChipKmText}>
                  {item?.km_distance != null && Number.isFinite(Number(item.km_distance))
                    ? `${Number(item.km_distance).toFixed(2)} km`
                    : '— km'}
                </Text>
              </View>
            </View>
            <View
              style={[
                external.fd_row,
                external.ai_center,
                {marginTop: 5},
                {flexDirection: viewRTLStyle},
              ]}>
              <View style={[external.fg_1]}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    commonStyles.H1Banner,
                    styles.priceFixed,
                    {color: textColorStyle},
                    {textAlign: textRTLStyle},
                  ]}>
                  {currSymbol}
                  {precioFinal}
                </Text>
              </View>
              <View style={styles.arrowChip}>
                <Text style={styles.arrowChipText}>›</Text>
              </View>
            </View>
          </View>
        </View>
        </View>
    </TouchableOpacity>
    );
  };
  return (
    <View>
      {show && (
        <View style={[external.mh_20, external.mt_15]}>
          <H3HeadingCategory
            value={value}
            seeall={valueTwo || t('transData.seeAll')}
          />
        </View>
      )}
      <FlatList
        numColumns={numColumns}
        horizontal={horizontal}
        data={data}
        renderItem={renderItem}
        contentContainerStyle={[external.mt_10]}
        showsHorizontalScrollIndicator={false}
        inverted={isRTL ? true : false}
      />
    </View>
  );
};

export default NewCategoriesDetail;
