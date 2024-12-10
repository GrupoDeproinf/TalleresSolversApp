import {Pressable, Text, TextInput, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import styles from './style.css';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {windowHeight} from '../../themes/appConstant';
import Icons from 'react-native-vector-icons/Entypo';

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
  secureTextEntry,
  multiline,
  numberOfLines,
  height,
  editable,
  textDecorationLine,
  minHeight,
  textAlignVertical,
  showPass,
  changePassValue,
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
              {height: height},
              {flexDirection: 'row', alignItems: 'center'}, // Asegurar que el contenido esté en fila
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
                {flex: 1}, // Asegurar que tome el espacio disponible
              ]}>
              <View style={{marginLeft: 5}}>{icon}</View>

              <TextInput
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={numberOfLines}
                value={value}
                editable={editable}
                style={[
                  styles.textInput,
                  {width: width},
                  {height: height},
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                  {minHeight: minHeight},
                  {
                    textDecorationLine:
                      textDecorationLine == undefined
                        ? 'none'
                        : textDecorationLine, // Línea en el centro
                  },
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

            {showPass == true ? (
              <TouchableOpacity
                onPress={changePassValue}
                style={{marginRight: 10}}>
                <View>
                  <Icons name="eye" size={23} color="#2D3261" />
                </View>
              </TouchableOpacity>
            ) : null}
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
