import React, {memo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './style.css';
import {external} from '../../style/external.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';

const H3HeadingCategory = ({value, seeall, show}) => {
  const navigation = useNavigation('');
  const {textColorStyle, viewRTLStyle} = useValues();
  return (
    <View
      style={[
        styles.container,
        external.fd_row,
        external.js_space,
        {flexDirection: viewRTLStyle},
      ]}>
      <Text style={[styles.valueText, {color: textColorStyle}]}>{value}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetailOne')}>
        {show ? <View /> : <Text style={[styles.seeAllText]}>{seeall}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default memo(H3HeadingCategory);
