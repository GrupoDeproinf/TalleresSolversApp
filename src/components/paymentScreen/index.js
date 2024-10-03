import {Image, Text, View} from 'react-native';
import React from 'react';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {ThreeDot} from '../../assets/icons/threeDot';
import styles from './style.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../themes/appColors';

const PaymentScreenContainer = ({data}) => {
  const {
    isDark,
    textColorStyle,
    linearColorStyle,
    textRTLStyle,
    viewRTLStyle,
    t,
  } = useValues();
  const colors = isDark
    ? ['#808184', '#2E3036']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <View>
      {data.map((item, index) => (
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={colors}
          style={[styles.container, {flexDirection: viewRTLStyle}]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent, {flexDirection: viewRTLStyle}]}>
            <Image style={styles.img} source={item.img} />
            <View style={[external.mh_10, external.fg_1]}>
              <Text
                style={[
                  styles.titleText,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t(item.title)}
              </Text>
              <Text
                style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
                {t(item.subtitle)}
              </Text>
            </View>
            <ThreeDot />
          </LinearGradient>
        </LinearGradient>
      ))}
    </View>
  );
};

export default PaymentScreenContainer;
