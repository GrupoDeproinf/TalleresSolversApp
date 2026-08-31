import {Text, View} from 'react-native';
import React from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Battery, Ble, Minus, Plus, Wifi} from '../../../../utils/icon';
import appColors from '../../../../themes/appColors';
import {fontSizes} from '../../../../themes/appConstant';
import {external} from '../../../../style/external.css';
import {commonStyles} from '../../../../style/commonStyle.css';
import styles from './styles.css';
import {useValues} from '../../../../../App';
import LinearGradient from 'react-native-linear-gradient';

const DescriptionText = () => {
  const {
    viewRTLStyle,
    linearColorStyleTwo,
    iconColorStyle,
    textColorStyle,
    linearColorStyle,
  } = useValues();

  return (
    <View>
      <View
        style={[
          external.fd_row,
          external.js_space,
          external.mt_16,
          {flexDirection: viewRTLStyle},
        ]}>
        <View
          style={[
            external.fd_row,
            external.js_space,
            external.ai_center,
            {flexDirection: viewRTLStyle},
          ]}>
          <IconBackground
            backgroundColor={appColors.bgLayer}
            value={<Battery />}
          />
          <View style={[external.mh_20]}>
            <IconBackground
              backgroundColor={appColors.bgLayer}
              value={<Wifi />}
            />
          </View>
          <IconBackground backgroundColor={appColors.bgLayer} value={<Ble />} />
        </View>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          style={styles.cardContainer}
          colors={linearColorStyleTwo}>
          <LinearGradient
            colors={linearColorStyle}
            style={[
              styles.menuItemContent,
              {backgroundColor: linearColorStyleTwo},
            ]}>
            <Minus color={iconColorStyle} />
            <Text
              style={[
                commonStyles.subtitleText,
                {color: textColorStyle, fontSize: fontSizes.FONT21},
              ]}>
              1
            </Text>
            <Plus color={iconColorStyle} />
          </LinearGradient>
        </LinearGradient>
      </View>
    </View>
  );
};

export default DescriptionText;
