import React, {memo} from 'react';
import {View} from 'react-native';
import SwitchToggle from 'react-native-switch-toggle';
import {styles} from './style.css';
import {useValues} from '../../../App';
import appColors from '../../themes/appColors';

const SwitchComponent = ({Enable, onPress}) => {
  const {isDark} = useValues();
  const backgroundColorOn = isDark
    ? appColors.darkPrimaryLight
    : appColors.primaryLight;
  const backgroundColorOff = isDark ? appColors.blackBg : appColors.bgLayer;
  return (
    <View>
      <SwitchToggle
        circleColorOff={'#76777A'}
        circleColorOn={'#2D3261'}
        backgroundColorOn={'#292D41'}
        backgroundColorOff={'#2F3137'}
        switchOn={Enable}
        onPress={onPress}
        circleStyle={styles.circle}
        containerStyle={styles.container}
      />
    </View>
  );
};

export default memo(SwitchComponent);
