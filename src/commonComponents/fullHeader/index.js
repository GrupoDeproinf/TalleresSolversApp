import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {BackLeft} from '../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
const FullHeader = ({onpressBack, modelPress, value, title, show, text}) => {
  const {
    linearColorStyle,
    textColorStyle,
    linearColorStyleTwo,
    viewRTLStyle,
    imageRTLStyle,
  } = useValues();

  return (
    <View style={[styles.container, {flexDirection: viewRTLStyle}]}>
      <TouchableOpacity
        onPress={onpressBack}
        style={{transform: [{scale: imageRTLStyle}]}}>
        <BackLeft />
      </TouchableOpacity>
      <Text style={[styles.titleText, {color: textColorStyle}]}>{title}</Text>
      {show ? (
        <View>{text}</View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={modelPress}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyleTwo}
            style={[styles.cardContainer]}>
            <LinearGradient
              start={{x: 0.0, y: 0.0}}
              end={{x: 0.0, y: 1.0}}
              colors={linearColorStyle}
              style={[styles.menuItemContent]}>
              {value}
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FullHeader;
