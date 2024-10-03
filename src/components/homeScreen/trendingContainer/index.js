import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import {whatsTrendingData} from '../../../data/homeScreen/whatsTrendingData';
import {commonStyles} from '../../../style/commonStyle.css';
import styles from './style.css';
import {windowWidth} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import appColors from '../../../themes/appColors';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
const TrendingContainer = () => {
  const {linearColorStyle, textColorStyle, isDark, t, currSymbol, currPrice} =
    useValues();
  const navigation = useNavigation();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const renderItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetailOne')}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
          {shadowColor: appColors.shadowColor, borderradius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <View style={[styles.viewContainer, {backgroundColor: item.bgColor}]}>
            <Image style={styles.imgContainerView} source={item.img} />
          </View>
          <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
            {t(item.title)}
          </Text>
          <Text style={[commonStyles.subtitleText]}>{t(item.subtitle)}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, {color: textColorStyle}]}>
              {currSymbol}
              {(currPrice * item.price).toFixed(2)}
            </Text>
            <Text style={styles.underlinePrice}>
              {currSymbol}
              {(currPrice * item.underlinePrice).toFixed(2)}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
  return (
    <View>
      <View style={[external.mt_23, external.mh_20]}>
        <H3HeadingCategory
          value={t('transData.whatsTrending')}
          seeall={t('transData.seeAll')}
        />
      </View>
      <FlatList
        horizontal={true}
        data={whatsTrendingData}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{width: windowWidth(20)}} />}
        contentContainerStyle={[external.ph_10]}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default TrendingContainer;
