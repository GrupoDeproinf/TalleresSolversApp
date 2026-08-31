import {Text, View} from 'react-native';
import React from 'react';
import {commonStyles} from '../../../style/commonStyle.css';
import styles from './styles.css';

const ClockTimer = ({price}) => {
  return (
    <View style={styles.timer}>
      <Text style={[commonStyles.H1Banner]}>{price}</Text>
    </View>
  );
};

export default ClockTimer;
