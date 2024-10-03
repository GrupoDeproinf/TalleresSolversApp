import {View} from 'react-native';
import React from 'react';
import styles from './style.css';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

const BottomContainer = ({value, leftValue}) => {
  const {isDark, linearColorStyle} = useValues('');
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[styles.container]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <View>{leftValue}</View>
          <View style={styles.valueContainer}>{value}</View>
        </LinearGradient>
      </LinearGradient>
    </>
  );
};

export default BottomContainer;
