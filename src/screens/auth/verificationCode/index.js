import {Text, View} from 'react-native';
import React, {useState} from 'react';
import AuthContainer from '../../../commonComponents/authContainer';
import {
  getOtp,
  ifYouNtReceived,
  otp,
  resendCode,
  verificationCode,
  verificationTitle,
} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import NavigationButton from '../../../commonComponents/navigationButton';
import {windowHeight} from '../../../themes/appConstant';
import OtpInputs from 'react-native-otp-inputs';
import appColors from '../../../themes/appColors';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import {useValues} from '../../../../App';

const OtpVerification = ({navigation}) => {
  const [otpValue, setOtpValue] = useState('');

  const onHandleChange = code => {
    setOtpValue(code);
  };

  const onPressNavigationButton = () => {
    if (otpValue.length === 5) {
      navigation.navigate('ResetPassword');
    } else {
    }
  };
  const {bgFullStyle, textColorStyle, t, linearColorStyle, isDark} =
    useValues();
  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <AuthContainer
        title={t('transData.verificationCode')}
        subtitle={t('transData.verificationTitle')}
        value={
          <View>
            <Text
              style={[
                commonStyles.titleText19,
                {paddingTop: windowHeight(20)},
                {color: textColorStyle},
              ]}>
              {t('transData.otp')}
            </Text>
            <View style={styles.viewOtp}>
              <LinearGradient
                colors={linearColorStyle}
                style={[styles.gradient, {borderRadius: 30}]}>
                <OtpInputs
                  handleChange={onHandleChange}
                  numberOfInputs={5}
                  inputStyles={[
                    styles.otpTextInput,
                    {backgroundColor: bgFullStyle},
                    {color: textColorStyle},
                    {borderColor: isDark ? '#47484D' : '#4D66FF1A'},
                  ]}
                  containerStyle={[external.as_center]}
                  selectionColor={textColorStyle}
                />
              </LinearGradient>
            </View>
            <View style={styles.singUpView}>
              <Text style={[commonStyles.subtitleText]}>
                {t('transData.ifYouNtReceived')}
              </Text>
              <Text
                style={[
                  commonStyles.titleText19,
                  external.ph_5,
                  {color: textColorStyle},
                ]}>
                {t('transData.resendCode')}
              </Text>
            </View>
          </View>
        }
      />
      <NavigationButton
        title={getOtp}
        color={otpValue.length === 5 ? appColors.screenBg : '#051E47'}
        onPress={onPressNavigationButton}
        backgroundColor={otpValue.length === 5 ? '#4D66FF' : '#D1D6DE'}
      />
    </View>
  );
};

export default OtpVerification;
