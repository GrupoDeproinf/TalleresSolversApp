import React, {memo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {external} from '../../style/external.css';
import {CheckMark, UncheckMark} from '../../utils/icon';

const CheckBox = ({onPress, checked}) => {
  return (
    <View>
      <TouchableOpacity style={[external.fd_row]} onPress={onPress}>
        {checked ? <UncheckMark /> : <CheckMark />}
      </TouchableOpacity>
    </View>
  );
};

export default memo(CheckBox);
