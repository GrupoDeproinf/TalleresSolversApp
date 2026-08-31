import React from 'react';
import {View} from 'react-native';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';

const SolidLine = props => {
  const {width, height, color, marginVertical} = props;

  return (
    <View
      style={{
        width: width || [external.width_100],
        height: height || 1,
        backgroundColor: color || appColors.bgLayout,
        marginVertical: marginVertical || 5,
      }}
    />
  );
};

export default SolidLine;
