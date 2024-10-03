import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {commonStyles} from '../../../../style/commonStyle.css';
import {external} from '../../../../style/external.css';
import {fontSizes} from '../../../../themes/appConstant';
import {keyFeature} from '../../../../data/productDetailBrand';
import {Right} from '../../../../utils/icon';
import appColors from '../../../../themes/appColors';
import {useValues} from '../../../../../App';

const KeyFeatures = () => {
  const {textColorStyle, t, viewRTLStyle, textRTLStyle, isRTL} = useValues();

  return (
    <View>
      <View>
        <Text
          style={[
            commonStyles.titleText19,
            external.mb_5,
            external.mt_15,
            {fontSize: fontSizes.FONT17, color: textColorStyle},
            {textAlign: textRTLStyle},
          ]}>
          Key Features :
        </Text>
        {keyFeature.map((item, index) => (
          <View style={[external.fd_row, {flexDirection: viewRTLStyle}]}>
            <View style={[external.mt_3, external.mh_2]}>
              <Right />
            </View>
            <Text
              style={[
                commonStyles.subtitleText,
                external.Pb_5,
                {color: textColorStyle, fontSize: fontSizes.FONT17},
                {textAlign: textRTLStyle},
              ]}>
              {t(item.title)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default KeyFeatures;
