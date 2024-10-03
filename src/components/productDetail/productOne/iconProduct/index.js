import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Bus, Refresh} from '../../../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../../../themes/appColors';

const IconProduct = () => {
  const {textColorStyle, linearColorStyle, isDark} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <LinearGradient
      start={{x: 0.0, y: 0.0}}
      end={{x: 0.0, y: 1.0}}
      colors={colors}
      style={[
        styles.refreshIcon,
        {shadowColor: appColors.shadowColor, borderradius: 6},
      ]}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyle}
        style={[styles.menuItemContent, {shadowColor: appColors.shadowColor}]}>
        <IconBackground value={<Refresh />} />
        <Text style={[styles.upTofive, {color: textColorStyle}]}>
          Up to 7 days returnable
        </Text>
        <View style={styles.verticalLine} />
        <IconBackground value={<Bus />} />
        <Text style={[styles.deliveryIn, {color: textColorStyle}]}>
          Delivery in 3 days
        </Text>
      </LinearGradient>
    </LinearGradient>
  );
};

export default IconProduct;
