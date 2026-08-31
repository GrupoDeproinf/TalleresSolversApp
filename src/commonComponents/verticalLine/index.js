import {View} from 'react-native';
import React from 'react';
import {styles} from './styles.css';

const VerticalLine = ({dynamicHeight}) => {
  return (
    <View style={[styles.verticalLine, {height: dynamicHeight || '100%'}]} />
  );
};

export default VerticalLine;
