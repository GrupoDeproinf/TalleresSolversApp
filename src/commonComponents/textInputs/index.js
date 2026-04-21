import { Pressable, Text, TextInput, View, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import styles from './style.css';
import { external } from '../../style/external.css';
import appColors from '../../themes/appColors';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import { windowHeight } from '../../themes/appConstant';
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
  autoCapitalize,
  formCardMode,
  /** Texto breve junto al título (solo formCardMode), p. ej. ayuda al usuario */
  titleHint,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  /** Si es false, no se cierra el teclado al tocar el contenedor (solo login u otros casos). */
  dismissKeyboardOnPressOutside = true,
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
  const { isDark, textColorStyle, linearColorStyle, textRTLStyle, viewRTLStyle } =
    useValues();

  const colors = isDark
    ? ['#808184', '#2E3036']
    : [appColors.screenBg, appColors.screenBg];

  if (formCardMode) {
    const isMultiline = !!multiline;
    const formCardBody = (
        <View style={styles.formCardFieldWrap}>
          <View
            style={[
              styles.formCardLabelRow,
              { flexDirection: viewRTLStyle },
            ]}>
            <Text
              style={[
                styles.formCardFieldLabel,
                !titleHint && styles.formCardFieldLabelAlone,
                { color: textColorStyle },
                { textAlign: textRTLStyle },
              ]}>
              {title}
            </Text>
            {titleHint ? (
              <Text
                style={[
                  styles.formCardFieldLabelHint,
                  { textAlign: textRTLStyle },
                ]}
                numberOfLines={2}>
                {titleHint}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.formCardFieldInner,
              isMultiline && styles.formCardFieldInnerMultiline,
              { flexDirection: viewRTLStyle },
            ]}>
            <View
              style={[
                styles.formCardIconWrap,
                isMultiline && { alignSelf: 'flex-start', paddingTop: 8 },
              ]}>
              {icon}
            </View>
            <TextInput
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              multiline={multiline}
              numberOfLines={numberOfLines}
              textAlignVertical={
                textAlignVertical ?? (isMultiline ? 'top' : 'center')
              }
              value={value}
              editable={editable}
              style={[
                styles.formCardTextInput,
                {
                  width: width == undefined || width == '' ? '100%' : width,
                  height:
                    height == undefined || height == ''
                      ? isMultiline
                        ? undefined
                        : 44
                      : height,
                  color: textColorStyle,
                  textAlign: textRTLStyle,
                  minHeight: minHeight,
                  textDecorationLine:
                    textDecorationLine == undefined
                      ? 'none'
                      : textDecorationLine,
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
              onFocus={onFocusProp}
              onBlur={e => {
                onBlurProp?.(e);
                handleValidation();
              }}
            />
          </View>
          {error !== '' && (
            <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
          )}
        </View>
    );
    return dismissKeyboardOnPressOutside ? (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {formCardBody}
      </TouchableWithoutFeedback>
    ) : (
      formCardBody
    );
  }

  const defaultBody = (
      <View style={[external.mt_10]}>
        <View style={[external.mb_5]}>
          <Text
            style={[
              styles.headingContainer,
              { color: textColorStyle },
              { textAlign: textRTLStyle },
            ]}>
            {title}
          </Text>
          <View>
            <LinearGradient
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              colors={colors}
              style={[
                show ? styles.textInputView : styles.withoutShow,
                { shadowColor: appColors.shadowColor },
                { width: fullWidth || '100%' },
                { height: height },
                { flexDirection: 'row', alignItems: 'center' }, // Asegurar que el contenido esté en fila
              ]}>
              <LinearGradient
                start={{ x: 0.0, y: 0.0 }}
                end={{ x: 0.0, y: 1.0 }}
                colors={linearColorStyle}
                style={[
                  styles.menuItemContent,
                  { shadowColor: appColors.shadowColor },
                  { flexDirection: viewRTLStyle },
                  { width: fullWidthTwo || '100%' },
                  { paddingHorizontal: paddingHorizontalTwo || windowHeight(8) },
                  { flex: 1 }, // Asegurar que tome el espacio disponible
                ]}>
                <View style={{ marginLeft: 5 }}>{icon}</View>

                <TextInput
                  autoCapitalize={autoCapitalize}
                  keyboardType={keyboardType}
                  secureTextEntry={secureTextEntry}
                  multiline={multiline}
                  numberOfLines={numberOfLines}
                  textAlignVertical={multiline ? "top" : "center"}
                  value={value}
                  editable={editable}
                  style={[
                    styles.textInput,
                    { width: width == undefined || width == "" ? '100%' : width },
                    { height: height == undefined || height == "" ? 60 : height },
                    { color: textColorStyle },
                    { textAlign: textRTLStyle },
                    { minHeight: minHeight },
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
                  onFocus={onFocusProp}
                  onBlur={e => {
                    onBlurProp?.(e);
                    handleValidation();
                  }}
                />

                {show && <Pressable style={[external.mh_10]}>{value}</Pressable>}
              </LinearGradient>

              {showPass == true ? (
                <TouchableOpacity
                  onPress={changePassValue}
                  style={{ marginRight: 10 }}>
                  <View>
                    <Icons name="eye" size={23} color="#2D3261" />
                  </View>
                </TouchableOpacity>
              ) : null}
            </LinearGradient>
          </View>

          {error !== '' && (
            <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
          )}
        </View>
      </View>
  );
  return dismissKeyboardOnPressOutside ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {defaultBody}
    </TouchableWithoutFeedback>
  ) : (
    defaultBody
  );
};

export default TextInputs;
