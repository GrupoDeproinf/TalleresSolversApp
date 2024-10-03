import {Text, View} from 'react-native';
import React from 'react';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {useValues} from '../../../App';

const JsSpaceContainer = ({title, price, color}) => {
  const {textColorStyle, viewRTLStyle} = useValues();

  return (
    <View
      style={[
        external.fd_row,
        external.ai_center,
        external.js_space,
        external.ph_10,
        {flexDirection: viewRTLStyle},
      ]}>
      <View>
        <Text style={[commonStyles.subtitleText]}>{title}</Text>
      </View>
      <View>
        <Text
          style={[commonStyles.titleText19, {color: color || textColorStyle}]}>
          {price}
        </Text>
      </View>
    </View>
  );
};

export default JsSpaceContainer;
