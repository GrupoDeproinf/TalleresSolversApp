import {Text, View} from 'react-native';
import React from 'react';
import {commonStyles} from '../../../../style/commonStyle.css';
import {external} from '../../../../style/external.css';
import {fontSizes} from '../../../../themes/appConstant';
import {keyFeature} from '../../../../data/productDetailBrand';
import {Right} from '../../../../utils/icon';
import {useValues} from '../../../../../App';

const KeyFeatureContainer = () => {
  const {textColorStyle} = useValues();
  return (
    <View>
      <Text
        style={[
          commonStyles.titleText19,
          external.mb_5,
          external.mt_15,
          external.mh_20,
          {fontSize: fontSizes.FONT17, color: textColorStyle},
        ]}>
        - Key Features
      </Text>
      {keyFeature.map((item, index) => (
        <View style={[external.fd_row, external.mh_20]}>
          <View style={[external.mt_3]}>
            <Right />
          </View>
          <Text
            style={[
              commonStyles.subtitleText,
              external.Pb_5,
              {color: textColorStyle, fontSize: fontSizes.FONT17},
            ]}>
            {item.title}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default KeyFeatureContainer;
