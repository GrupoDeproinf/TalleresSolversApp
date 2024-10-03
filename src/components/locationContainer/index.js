import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Location} from '../../utils/icon';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import styles from './style.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../themes/appColors';

const LocationContainer = ({
  backgroundColor,
  locationBg,
  value,
  borderRadius,
  navigation,
}) => {
  const {
    linearColorStyle,
    isDark,
    t,
    textColorStyle,
    viewRTLStyle,
    textRTLStyle,
  } = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[styles.container, {backgroundColor: backgroundColor}]}>
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
            style={[
              styles.locationIcon,
              {backgroundColor: locationBg},
              {borderRadius: borderRadius},
            ]}>
            <Location />
          </View>
          <View style={[external.mh_8, external.fg_1]}>
            <Text
              style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
              {t('transData.yourDeliveryAddress')}
            </Text>
            <Text
              style={[
                commonStyles.titleText19,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t('transData.jodgeHawaii')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChangeAddressScreen')}
            style={[external.ai_center]}>
            {value}
          </TouchableOpacity>
        </LinearGradient>
      </LinearGradient>
    </>
  );
};

export default LocationContainer;
