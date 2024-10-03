import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  emailId,
  enterEmail,
  forgetPassword,
  forgetPasswordText,
  getOtp,
} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import appColors from '../../../themes/appColors';
import {Email} from '../../../assets/icons/email';
import styles from './style.css';
import {useValues} from '../../../../App';

const ForgetPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(true);
  const [isButtonPressed, setButtonPressed] = useState(false);
  const [isEmailTyping, setEmailTyping] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };
  const onEmailChange = text => {
    setEmail(text);
    if (isButtonPressed) {
      setEmailError('');
    }
    if (!isEmailTyping) {
      setEmailTyping(true);
    }
  };
  const onHandleChange = () => {
    setButtonPressed(true);
    if (emailError === '') {
      navigation.navigate('OtpVerfication');
    }
  };
  useEffect(() => {
    validateEmail();
    setGetOtpDisabled(emailError !== '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailError]);
  const {t, bgFullStyle, iconColorStyle} = useValues();
  return (
    <View style={[styles.headingContainer, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title={t('transData.forgetPassword')}
        subtitle={t('transData.forgetPasswordText')}
        value={
          <View>
            <TextInputs
              title={t('transData.emailId')}
              placeHolder={t('transData.enterEmail')}
              onChangeText={onEmailChange}
              onBlur={validateEmail}
              icon={
                <Email
                  color={isEmailTyping ? iconColorStyle : appColors.subtitle}
                />
              }
            />

            {isButtonPressed && emailError !== '' && (
              <Text style={styles.errorStyle}>{emailError}</Text>
            )}
          </View>
        }
      />
      <NavigationButton
        title={t('transData.getOtp')}
        onPress={onHandleChange}
        disabled={isGetOtpDisabled}
        backgroundColor={isGetOtpDisabled ? '#D1D6DE' : '#4D66FF'}
        color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
      />
    </View>
  );
};

export default ForgetPassword;
