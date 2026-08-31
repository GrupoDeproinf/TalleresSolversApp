import {TouchableOpacity} from 'react-native';
import React from 'react';
import styles from './style.css';
import {windowHeight} from '../../themes/appConstant';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../../App';

const IconBackground = ({onPress, value, height}) => {
  const {linearColorStyle, linearColorStyleTwo} = useValues();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[{height: height || windowHeight(30)}]}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyleTwo}
        style={[styles.container]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={styles.menuItemContent}>
          {value}
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default IconBackground;
