import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../../style/external.css';
import {fontSizes} from '../../../../themes/appConstant';
import appColors from '../../../../themes/appColors';
import {commonStyles} from '../../../../style/commonStyle.css';
import {useValues} from '../../../../../App';

const DetailText = () => {
  const {textColorStyle} = useValues();
  return (
    <View>
      <View style={[external.mt_10, external.mh_20]}>
        <Text
          style={[
            commonStyles.titleText19,
            {fontSize: fontSizes.FONT17, color: textColorStyle},
          ]}>
          Details :
        </Text>
        <Text
          style={[
            commonStyles.subtitleText,
            external.pt_5,
            {color: textColorStyle, fontSize: fontSizes.FONT18},
          ]}>
          Zebronics soloheadphones are made to be an upgrade from the white ear
          buds that come with your device. More durability, better sound, and a
          chance to do real justice to your music. If you have an Apple device
          and demand excellent quality...Read more
        </Text>
      </View>
    </View>
  );
};

export default DetailText;
