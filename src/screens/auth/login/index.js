import {Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthContainer from '../../../commonComponents/authContainer';
import {apple, facebook} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import {Apple, FaceBook, Google, Key} from '../../../utils/icon';
import {useValues} from '../../../../App';
import LinearBoderText from '../../../commonComponents/linearBoderText';
import CheckBox from '../../../commonComponents/checkBox';
import {fontSizes} from '../../../themes/appConstant';
import LinearGradient from 'react-native-linear-gradient';

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [checkedData, setCheckedData] = useState(false);
  const [isSignInDisabled, setSignInDisabled] = useState(true);

  useEffect(() => {}, []);
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const onHandleChange = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      setSignInDisabled(false);
      navigation.navigate('LoaderScreen');
    } else {
      setSignInDisabled(true);
    }
  };

  const {bgFullStyle, textColorStyle, t, iconColorStyle} = useValues();
  const valData = () => {
    setCheckedData(!checkedData);
  };
  const {linearColorStyleTwo, linearColorStyle} = useValues();
  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title={t('transData.letYouIn')}
        subtitle={t('transData.heyMissed')}
        value={
          <View>
            <TextInputs
              title={t('transData.emailId')}
              placeHolder={t('transData.enterEmail')}
              onChangeText={text => {
                setEmail(text);
                setEmailTyping(true);
                if (text.trim() === '') {
                  setEmailError('Email is required');
                } else {
                  setEmailError('');
                }
              }}
              onBlur={() => {
                validateEmail();
                setEmailTyping(false);
              }}
              icon={
                <Email
                  color={isEmailTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />
            {emailError !== '' && (
              <Text style={styles.errorStyle}>{emailError}</Text>
            )}
            <TextInputs
              title={t('transData.passwords')}
              placeHolder={t('transData.enterYouPassword')}
              onChangeText={text => {
                setPassword(text);
                setPwdTyping(true);
                if (text.length < 6) {
                  setPasswordError('Password must be at least 6 characters');
                } else {
                  setPasswordError('');
                }
              }}
              onBlur={() => {
                validatePassword();
                setPwdTyping(false);
              }}
              icon={
                <Key
                  color={isPwdTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}
            <View style={[external.fd_row, external.ai_center, external.mt_3]}>
              <CheckBox onPress={valData} checked={checkedData} />
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ph_5,
                  external.fg_1,
                  {color: textColorStyle, fontSize: fontSizes.FONT16},
                ]}>
                {t('transData.rememberMe')}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgetPassword')}>
                <Text
                  style={[
                    commonStyles.subtitleText,
                    {color: '#4D66FF', fontSize: fontSizes.FONT16},
                  ]}>
                  {t('transData.forgetPassword')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      <NavigationButton
        title={t('transData.signIn')}
        color={appColors.screenBg}
        onPress={onHandleChange}
        disabled={isSignInDisabled}
        backgroundColor={'#4D66FF'}
      />

      <View style={styles.singUpView}>
        <Text style={[commonStyles.subtitleText]}>
          {t('transData.dontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ph_5,
              {color: textColorStyle},
            ]}>
            {t('transData.signUp')}
          </Text>
        </TouchableOpacity>
      </View>
      <LinearBoderText />
      <View style={[external.fd_row, external.ai_center, external.mb_40]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <Google />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_2,
                {color: textColorStyle},
              ]}>
              {t('transData.google')}
            </Text>
          </LinearGradient>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <FaceBook />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_3,
                {color: textColorStyle},
              ]}>
              {facebook}
            </Text>
          </LinearGradient>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.headingContainer]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            <Apple />
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_2,
                {color: textColorStyle},
              ]}>
              {apple}
            </Text>
          </LinearGradient>
        </LinearGradient>
      </View>
    </View>
  );
};

export default SignIn;
