import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import styles from './style.css';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

const NavigationButton = ({
  title,
  onPress,
  gray,
  value,
  color,
  backgroundColor,
  borderWidth,
  borderColor,
}) => {
  const {isDark, linearColorStyleTwo, linearColorStyle} = useValues();
  return (
    <View>
      {isDark ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={[
            styles.linearGradient,
            {
              backgroundColor: backgroundColor,
              borderWidth: borderWidth,
              borderColor: borderColor,
            },
          ]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={isDark ? linearColorStyleTwo : ['white', 'white']}
            style={[styles.cardContainer]}>
            <LinearGradient
              start={{x: 0.0, y: 0.0}}
              end={{x: 0.0, y: 1.0}}
              colors={linearColorStyle}
              style={[styles.menuItemContent]}>
              <View style={[gray ? styles.icon : null]}>
                {gray && (
                  <View style={[external.mh_5, external.mt_2]}>{value}</View>
                )}
                <Text style={[commonStyles.titleText19, {color: color}]}>
                  {title}
                </Text>
              </View>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={[
            styles.linearGradient,
            {
              backgroundColor: backgroundColor,
              borderWidth: borderWidth,
              borderColor: borderColor,
            },
          ]}>
          <View style={[gray ? styles.icon : null]}>
            {gray && (
              <View style={[external.mh_5, external.mt_2]}>{value}</View>
            )}
            <Text style={[commonStyles.titleText19, {color: color}]}>
              {title}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NavigationButton;
