import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  confirmPasswords,
  createYourAccount,
  dontHaveAccount,
  emailId,
  enterEmail,
  enterNumber,
  enterYouPassword,
  exploreyourLife,
  passwords,
  phoneNumber,
  reEnterPassword,
  signIn,
  signUp,
} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import {Call, Key} from '../../../utils/icon';
import {useValues} from '../../../../App';

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(true);
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isConfTyping, setConfPwdTyping] = useState(false);

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

  const validatePhone = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number');
      return false;
    } else {
      setPhoneError('');
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

  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  const onHandleChange = () => {
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    const isDisabled =
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid;

    setGetOtpDisabled(isDisabled);

    if (!isDisabled) {
      navigation.navigate('LoaderScreen');
    }
  };
  const {bgFullStyle, textColorStyle, t} = useValues();

  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title={t('transData.createYourAccount')}
        subtitle={t('transData.exploreyourLife')}
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
                <Email color={isEmailTyping ? '#051E47' : appColors.subtitle} />
              }
            />
            {emailError !== '' && (
              <Text style={styles.errorStyle}>{emailError}</Text>
            )}

            <TextInputs
              title={t('transData.phoneNumber')}
              placeHolder={t('transData.enterNumber')}
              onChangeText={text => {
                setPhone(text);
                setCallTyping(true);
                if (text.trim() === '') {
                  setPhoneError('Phone number is required');
                } else {
                  setPhoneError('');
                }
              }}
              onBlur={() => {
                validatePhone();
                setCallTyping(false);
              }}
              icon={
                <Call color={isCallTyping ? '#051E47' : appColors.subtitle} />
              }
            />

            {phoneError !== '' && (
              <Text style={styles.errorStyle}>{phoneError}</Text>
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
                <Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />
              }
            />
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}

            <TextInputs
              title={t('transData.confirmPasswords')}
              placeHolder={t('transData.reEnterPassword')}
              onChangeText={text => {
                setConfirmPassword(text);
                setConfPwdTyping(true);
                if (text !== password) {
                  setConfirmPasswordError('Passwords do not match');
                } else {
                  setConfirmPasswordError('');
                }
              }}
              onBlur={() => {
                validateConfirmPassword();
                setConfPwdTyping(false);
              }}
              icon={
                <Key color={isConfTyping ? '#051E47' : appColors.subtitle} />
              }
            />

            {confirmPasswordError !== '' && (
              <Text style={styles.errorStyle}>{confirmPasswordError}</Text>
            )}
          </View>
        }
      />
      <NavigationButton
        title={t('transData.signUp')}
        color={appColors.screenBg}
        onPress={onHandleChange}
        disabled={isGetOtpDisabled}
        backgroundColor={'#4D66FF'}
      />
      <View style={styles.singUpView}>
        <Text style={[commonStyles.subtitleText]}>
          {t('transData.dontHaveAccount')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ph_5,
              {color: textColorStyle},
            ]}>
            {t('transData.signIn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;
