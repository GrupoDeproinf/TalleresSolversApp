import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
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

const NewArrivalContainer = ({data, value, show, showPlus, marginTop}) => {
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
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetailOne')}
      activeOpacity={0.9}>
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
          <View
            style={[styles.imageContainer, {backgroundColor: imageContainer}]}>
            <Image style={styles.image} source={item.img} />
          </View>
          <View style={styles.textContainer}>
            <View
              style={[styles.ratingContainer, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  styles.title,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t(item.title)}
              </Text>
              {showPlus && (
                <TouchableOpacity style={styles.ratingContainer}>
                  <YellowStar />
                  <Text style={[styles.ratingText]}>{item.rating}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.subtitle, {textAlign: textRTLStyle}]}>
              {t(item.subtitle)}
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
                <Text style={[styles.price, {color: textColorStyle}]}>
                  {currSymbol}
                  {(currPrice * item.price).toFixed(2)}
                </Text>
                <Text style={[styles.underlinePrice]}>
                  {currSymbol}
                  {(currPrice * item.underlinePrice).toFixed(2)}
                </Text>
              </View>
              {showPlus ? (
                <LinearGradient
                  start={{x: 0.0, y: 5.0}}
                  end={{x: 5.0, y: 0.0}}
                  style={styles.linearBorderStyle}
                  colors={['#5385FC', '#355FE9']}>
                  <Plus />
                </LinearGradient>
              ) : (
                <LinearGradient
                  start={{x: 0.0, y: 5.0}}
                  end={{x: 5.0, y: 0.0}}
                  colors={linearColorStyleTwo}
                  style={styles.showLinear}>
                  <PlusRadial />
                  <Text
                    style={[
                      commonStyles.titleText19,
                      {fontFamily: appFonts.semiBold},
                      {color: textColorStyle},
                    ]}>
                    1
                  </Text>
                  <MinusIcon />
                </LinearGradient>
              )}
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

export default NewArrivalContainer;
