import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import appColors from '../../../themes/appColors';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {YellowStar} from '../../../assets/icons/yellowStar';
import PlusIcon from '../../../commonComponents/plusIcon';
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

  console.log('Data:', data);

  const renderItem = ({item}) => (
    <TouchableOpacity
      // activeOpacity={0.9}
      onPress={() => {
        navigation.navigate('ProductDetailOne', {
          uid: item.uid_servicio === '' ? item.id : item.uid_servicio,
        });
      }}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyleTwo}
        style={[
          styles.viewContainer,
          {backgroundColor: bgFullStyle},
          {width: width || windowWidth(200)},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={styles.menuItemContent}>
          <View style={[styles.imgContainer, {backgroundColor: color}]}>
            <Image
              style={styles.img}
              source={{
                uri: Array.isArray(item?.service_image)
                  ? item?.service_image[0]
                  : item?.service_image,
              }}
            />
          </View>

          <View style={[external.ph_10, external.pt_10]}>
            <Text
              style={[
                commonStyles.titleText19,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t(item.nombre_servicio)}
            </Text>
            <Text
              style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
              {t(item.taller)}
            </Text>
            <View
              style={[
                external.fd_row,
                external.ai_center,
                {flexDirection: viewRTLStyle},
              ]}>
              <View style={[external.fg_1]}>
                <Text
                  style={[
                    commonStyles.H1Banner,
                    {color: textColorStyle},
                    {textAlign: textRTLStyle},
                  ]}>
                  {currSymbol}
                  {(currPrice * item.precio).toFixed(2)}
                </Text>
              </View>
              {/* <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  {flexDirection: viewRTLStyle},
                ]}>
                <YellowStar />
                <Text style={styles.ratingContainer}>{item.rating}</Text>
              </View> */}
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
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
