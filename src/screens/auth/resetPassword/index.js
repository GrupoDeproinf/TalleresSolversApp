import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  newPassword,
  newResetYourPassword,
  passwordReset,
  reEnterPassword,
  resetPassword,
  resetYourPassword,
  successfullyReset,
} from '../../../constant';
import TextInputs from '../../../commonComponents/textInputs';
import NavigationButton from '../../../commonComponents/navigationButton';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import styles from './style.css';
import {Cross, Key} from '../../../utils/icon';
import {external} from '../../../style/external.css';
import {fontSizes} from '../../../themes/appConstant';
import images from '../../../utils/images';
import CommonModal from '../../../commonComponents/commonModel';
import {useValues} from '../../../../App';
import {CommonActions} from '@react-navigation/native';

const ResetPassword = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonPressed, setButtonPressed] = useState(false);
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(true);
  const [isValidationSuccess, setValidationSuccess] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const onPasswordChange = text => {
    setPassword(text);
    if (isButtonPressed) {
      validatePasswords();
    }
  };

  const onConfirmPasswordChange = text => {
    setConfirmPassword(text);
    if (isButtonPressed) {
      validatePasswords();
    }
  };

  const validatePasswords = () => {
    const confirmPasswordError =
      password !== confirmPassword
        ? 'Passwords do not match.'
        : password.length < 6
        ? 'Password must be at least 6 characters.'
        : '';

    setPasswordError(confirmPasswordError);
  };

  const onHandleChange = () => {
    setButtonPressed(true);
    validatePasswords();

    if (password === confirmPassword && passwordError === '') {
      setValidationSuccess(true);

      setModalVisible(true);
    } else {
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const stackClear = navigation => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Login'}],
      }),
    );
  };

  useEffect(() => {
    validatePasswords();
    setGetOtpDisabled(passwordError !== '' || password !== confirmPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirmPassword, passwordError]);
  const {bgFullStyle, textColorStyle, t} = useValues();

  return (
    <View style={[styles.headingContainer, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title={t('transData.resetYourPassword')}
        subtitle={t('transData.newResetYourPassword')}
        value={
          <View>
            <TextInputs
              title={t('transData.newPassword')}
              placeHolder={t('transData.newPassword')}
              onChangeText={onPasswordChange}
              icon={
                <Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />
              }
            />
            <TextInputs
              title={t('transData.reEnterPassword')}
              placeHolder={t('transData.reEnterPassword')}
              onChangeText={onConfirmPasswordChange}
              icon={
                <Key color={isPwdTyping ? '#051E47' : appColors.subtitle} />
              }
            />
            {passwordError !== '' && (
              <Text style={styles.errorStyle}>{passwordError}</Text>
            )}
          </View>
        }
      />
      <NavigationButton
        title={t('transData.resetPassword')}
        color={isGetOtpDisabled ? '#051E47' : appColors.screenBg}
        onPress={onHandleChange}
        disabled={isGetOtpDisabled}
        backgroundColor={isGetOtpDisabled ? '#848688' : '#2D3261'}
      />

      <CommonModal
        isVisible={isModalVisible}
        closeModal={closeModal}
        title={successfullyReset}
        subtitle={passwordReset}
        value={
          <View>
            <TouchableOpacity style={[external.as_end]} onPress={closeModal}>
              <Cross />
            </TouchableOpacity>
            <Image style={styles.succesFullImg} source={images.successfull} />
            <Text style={[commonStyles.hederH2, external.ti_center]}>
              {'Successfully Reset !'}
            </Text>
            <Text
              style={[
                commonStyles.subtitleText,
                external.ti_center,
                {fontSize: fontSizes.FONT19},
              ]}>
              {'Wohhoo !! Your password has been successully reset.'}
            </Text>
            <View style={[external.mt_20]}>
              <NavigationButton
                backgroundColor={'#2D3261'}
                title="Go to home"
                onPress={() => stackClear(navigation)}
                color={appColors.screenBg}
              />
            </View>
          </View>
        }
      />
    </View>
  );
};

export default ResetPassword;
