import {Pressable, Text, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import styles from './style.css';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {windowHeight} from '../../themes/appConstant';

const TextInputs = ({
  title,
  placeHolder,
  show,
  value,
  onChangeText,
  color,
  width,
  validation,
  icon,
  keyboardType,
  fullWidth,
  fullWidthTwo,
  paddingHorizontalTwo,
}) => {
  const [error, setError] = useState('');

  const handleValidation = () => {
    if (validation && typeof validation === 'function') {
      const validationResult = validation();
      if (validationResult !== true) {
        setError(validationResult);
      } else {
        setError('');
      }
    }
  };
  const {isDark, textColorStyle, linearColorStyle, textRTLStyle, viewRTLStyle} =
    useValues();

  const colors = isDark
    ? ['#808184', '#2E3036']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <View style={[external.mt_10]}>
      <View style={[external.mb_5]}>
        <Text
          style={[
            styles.headingContainer,
            {color: textColorStyle},
            {textAlign: textRTLStyle},
          ]}>
          {title}
        </Text>
        <View>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 1.0, y: 1.0}}
            colors={colors}
            style={[
              show ? styles.textInputView : styles.withoutShow,
              {shadowColor: appColors.shadowColor},
              {width: fullWidth || '100%'},
            ]}>
            <LinearGradient
              start={{x: 0.0, y: 0.0}}
              end={{x: 0.0, y: 1.0}}
              colors={linearColorStyle}
              style={[
                styles.menuItemContent,
                {shadowColor: appColors.shadowColor},
                {flexDirection: viewRTLStyle},
                {width: fullWidthTwo || '100%'},
                {paddingHorizontal: paddingHorizontalTwo || windowHeight(8)},
              ]}>
              {icon}
              <TextInput
                keyboardType={keyboardType}
                value={value}
                style={[
                  styles.textInput,
                  {width: width},
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}
                placeholder={placeHolder}
                placeholderTextColor={color || appColors.subtitle}
                onChangeText={text => {
                  onChangeText(text);
                  if (text !== false) {
                    setError('');
                  }
                }}
                onBlur={handleValidation}
              />

              {show && <Pressable style={[external.mh_10]}>{value}</Pressable>}
            </LinearGradient>
          </LinearGradient>
        </View>
        {error !== '' && (
          <Text style={{color: 'red', marginTop: 5}}>{error}</Text>
        )}
      </View>
    </View>
  );
};

export default TextInputs;
