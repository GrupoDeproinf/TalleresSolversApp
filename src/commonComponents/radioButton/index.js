import React, {memo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {external} from '../../style/external.css';
import {RadioBox, RadioBoxPrimary} from '../../utils/icon';

const RadioButton = ({onPress, checked}) => {
  return (
    <View>
      <TouchableOpacity style={[external.fd_row]} onPress={onPress}>
        {checked ? <RadioBoxPrimary /> : <RadioBox />}
      </TouchableOpacity>
    </View>
  );
};

export default memo(RadioButton);
