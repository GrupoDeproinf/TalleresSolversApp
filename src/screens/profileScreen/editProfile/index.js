import {ImageBackground, View} from 'react-native';
import React, {useState} from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import {phoneMo, smithaWilliams, smithaWilliamsMail} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import styles from './style.css';
import images from '../../../utils/images';
import TextInputs from '../../../commonComponents/textInputs';
import appColors from '../../../themes/appColors';
import {Call, Edit, Profile} from '../../../utils/icon';
import {Email} from '../../../assets/icons/email';
import NavigationButton from '../../../commonComponents/navigationButton';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';

const EditProfile = ({navigation}) => {
  const [nameValue, setNameValue] = useState(smithaWilliams);
  const [emailValue, setEmailValue] = useState(smithaWilliamsMail);
  const [phoneValue, setPhoneValue] = useState(phoneMo);
  const [buttonColor, setButtonColor] = useState('#d1d6de');

  const handleNameChange = text => {
    setNameValue(text);
    updateButtonColor();
  };

  const handleEmailChange = text => {
    setEmailValue(text);
    updateButtonColor();
  };

  const handlePhoneChange = text => {
    setPhoneValue(text);
    updateButtonColor();
  };

  const updateButtonColor = () => {
    const isValid = validateInputs();
    const newButtonColor = isValid ? '#4D66FF' : '#d1d6de';
    setButtonColor(newButtonColor);
  };

  const validateInputs = () => {
    const isNameValid = nameValue.trim().length > 0;
    const isEmailValid = validateEmail(emailValue);
    const isPhoneValid = validatePhoneNumber(phoneValue);

    return isNameValid && isEmailValid && isPhoneValid;
  };

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // eslint-disable-next-line no-shadow
  const validatePhoneNumber = phoneNumber => {
    return phoneNumber.trim().length === 9 && !isNaN(phoneNumber);
  };

  const handleSaveChanges = () => {
    const isValid = validateInputs();
    if (isValid) {
      console.log('Changes saved!');
    } else {
    }
  };
  const {bgFullStyle, textColorStyle, iconColorStyle, isDark, t} = useValues();
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value={t('transData.myAccount')} />
      <View style={[external.as_center]}>
        <ImageBackground
          resizeMode="contain"
          style={styles.imgStyle}
          source={images.user}>
          <View
            style={[
              styles.editIconStyle,
              {backgroundColor: isDark ? '#1A1C22' : '#F3F5FB'},
              {borderRadius: 100},
            ]}>
            <Edit />
          </View>
        </ImageBackground>
      </View>
      <TextInputs
        title={t('transData.name')}
        placeHolder={t('transData.smithaWilliams')}
        color={textColorStyle}
        icon={<Profile />}
        value={nameValue}
        onChangeText={handleNameChange}
      />
      <TextInputs
        title={t('transData.emailId')}
        placeHolder={t('transData.smithaWilliamsMail')}
        color={textColorStyle}
        icon={<Email color={iconColorStyle} />}
        value={emailValue}
        onChangeText={handleEmailChange}
        keyboardType={'email-address'}
      />
      <TextInputs
        title={t('transData.phoneNumber')}
        placeHolder={phoneMo}
        color={textColorStyle}
        icon={<Call color={iconColorStyle} />}
        value={phoneValue}
        onChangeText={handlePhoneChange}
        keyboardType={'decimal-pad'}
      />
      <View style={[external.fx_1, external.js_end, external.Pb_30]}>
        <View
          style={{
            backgroundColor: buttonColor,
            borderRadius: windowHeight(20),
          }}>
          <NavigationButton
            title={t('transData.saveChanges')}
            color={buttonColor ? appColors.screenBg : appColors.subtitle}
            onPress={() => navigation.goBack('')}
            backgroundColor={'#4D66FF'}
          />
        </View>
      </View>
    </View>
  );
};

export default EditProfile;
