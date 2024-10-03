import {SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {BackLeft} from '../../utils/icon';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import styles from './style.css';
import {useValues} from '../../../App';
import {useNavigation} from '@react-navigation/native';

const AuthContainer = ({subtitle, title, value, onPress}) => {
  const {bgFullStyle, textColorStyle, textRTLStyle, imageRTLStyle} =
    useValues();
  const navigation = useNavigation('');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <TouchableOpacity
        onPress={() => navigation.goBack('')}
        style={{transform: [{scale: imageRTLStyle}]}}>
        <BackLeft />
      </TouchableOpacity>
      <Text
        style={[
          commonStyles.container,
          external.mt_20,
          {color: textColorStyle},
          {textAlign: textRTLStyle},
        ]}>
        {title}
      </Text>
      <Text style={[styles.subtitleText, {textAlign: textRTLStyle}]}>
        {subtitle}
      </Text>
      <View>{value}</View>
    </SafeAreaView>
  );
};

export default AuthContainer;
