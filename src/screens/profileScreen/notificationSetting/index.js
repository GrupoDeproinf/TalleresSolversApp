import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {styles} from './style.css';
import SwitchComponent from '../../../commonComponents/switchComponent';
import HeadingContainer from '../../../commonComponents/headingContainer';
import SolidLine from '../../../commonComponents/solidLine';
import {external} from '../../../style/external.css';
import {useValues} from '../../../../App';
import {languageData} from '../../../data/languageData';
import {useTranslation} from 'react-i18next';
import {currencyData} from '../../../data/currencyData';
import appColors from '../../../themes/appColors';
import {commonStyles} from '../../../style/commonStyle.css';
import RadioButton from '../../../commonComponents/radioButton';
import LinearGradient from 'react-native-linear-gradient';
import {setValue, getValue} from '../../../utils/helper/localStorage';

const Settings = ({navigation}) => {
  const {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    textRTLStyle,
    viewRTLStyle,
    t,
    setCurrSymbol,
    setCurrPrice,
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
  } = useValues();
  const [checkedData, setCheckedData] = useState('en'); // Default language
  const [checkCurrency, setCheckCurrency] = useState('$'); // Default currency

  useEffect(() => {
    getValues();
  }, []);

  const getValues = async () => {
    const currSymbol = await getValue('curr');
    if (currSymbol != null) {
      setCheckCurrency(currSymbol); // Set the saved currency as checked
    }
    const lang = await getValue('language');
    if (lang != null) {
      setCheckedData(lang); // Set the saved language as checked
    }
  };

  const valData = id => {
    setCheckedData(id);
    setValue('language', id); // Save selected language in local storage
  };

  const changeLan = language => {
    i18n.changeLanguage(language);
    if (language === 'ar') {
      setIsRTL(true);
    } else {
      setIsRTL(false);
    }
  };

  const currencyChecked = (symbol, price) => {
    setCheckCurrency(symbol); // Set selected currency as checked
    setCurrSymbol(symbol);
    setCurrPrice(price);
    setValue('curr', symbol); // Save selected currency in local storage
    setValue('currPrice', price.toString());
  };

  const [toggles, setToggles] = useState([
    {id: 'toggle1', title: 'transData.offersUpdate', value: false},
    {id: 'toggle2', title: 'transData.orderUpdate', value: false},
    {id: 'toggle3', title: 'transData.newProduct', value: false},
    {id: 'toggle4', title: 'darkLight', value: isDark},
    {id: 'toggle5', title: 'Toggle 5', value: isRTL},
  ]);

  const {i18n} = useTranslation();

  const handleToggle = toggleId => {
    if (toggleId === 'toggle4') {
      setIsDark(prevIsDark => !prevIsDark);
      const dark = isDark.toString();
      setValue('isDark', dark);
    }
    if (toggleId === 'toggle5') {
      setIsRTL(prevIsRTL => !prevIsRTL);
      const rtl = isRTL.toString();
      setValue('isRtl', rtl);
    }
    setToggles(prevToggles =>
      prevToggles.map(toggle =>
        toggle.id === toggleId ? {...toggle, value: !toggle.value} : toggle,
      ),
    );
  };

  const handleBack = () => {
    navigation.goBack('');
  };

  const textColor = isDark ? appColors.screenBg : appColors.titleText;
  const bgColor = isDark ? appColors.bgPlaceHolder : appColors.screenBg;
  const borderDark = isDark ? styles.darklinearStyle : styles.linearStyle;
  const darkBorder = isDark ? '#414348' : appColors.bgLayer;

  return (
    <View
      style={[
        external.ph_20,
        commonStyles.commonContainer,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeadingContainer value={t('transData.setting')} onPress={handleBack} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            borderDark,
            {backgroundColor: bgColor},
            {shadowColor: appColors.shadowColor},
          ]}>
          <View style={[external.mv_5]}>
            <Text
              style={[
                styles.titleText,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t('transData.notification')}
            </Text>
            <View>
              <SolidLine color={darkBorder} />
            </View>
          </View>
          <View style={styles.container}>
            {toggles.map((toggle, index) => (
              <View key={toggle.id}>
                {toggle.id !== 'toggle4' && toggle.id !== 'toggle5' && (
                  <View
                    style={[
                      styles.viewContainer,
                      {flexDirection: viewRTLStyle},
                    ]}>
                    <Text style={[styles.title, {color: textColor}]}>
                      {t(toggle.title)}
                    </Text>
                    <SwitchComponent
                      Enable={toggle.value}
                      onPress={() => handleToggle(toggle.id)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.themeView,
            {backgroundColor: bgColor},
            {shadowColor: appColors.shadowColor},
          ]}>
          <Text
            style={[
              styles.titleText,
              {color: textColor},
              {textAlign: textRTLStyle},
            ]}>
            {t('transData.theme')}
          </Text>
          <View>
            <SolidLine color={darkBorder} />
          </View>
          <View style={styles.container}>
            <View>
              <View
                style={[
                  styles.viewContainer,
                  external.mt_5,
                  {flexDirection: viewRTLStyle},
                ]}>
                <Text style={[styles.title, {color: textColor}]}>
                  {t('transData.dark')}
                </Text>
                <SwitchComponent
                  Enable={toggles[3].value}
                  onPress={() => handleToggle('toggle4')}
                />
              </View>
            </View>
          </View>
          <View style={styles.container}>
            <View>
              <View
                style={[styles.viewContainer, {flexDirection: viewRTLStyle}]}>
                <Text style={[styles.title, {color: textColor}]}>
                  {t('transData.rtl')}
                </Text>
                <SwitchComponent
                  Enable={toggles[4].value}
                  onPress={() => handleToggle('toggle5')}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[styles.linearStyle, {backgroundColor: bgColor}]}>
          <Text
            style={[
              styles.titleText,
              {color: textColor},
              {textAlign: textRTLStyle},
            ]}>
            {t('transData.language')}
          </Text>
          <View>
            <SolidLine color={darkBorder} />
          </View>
          {languageData.map((item, index) => (
            <View
              style={[
                external.fd_row,
                external.ai_center,
                external.js_space,
                external.mv_5,
                external.ph_10,
                {flexDirection: viewRTLStyle},
              ]}
              key={index}>
              <Text style={[styles.title, {color: textColor}]}>
                {t(item.title)}
              </Text>
              <RadioButton
                onPress={() => {
                  valData(item.code);
                  changeLan(item.code);
                }}
                checked={checkedData === item.code} // Compare correctly with checkedData
              />
            </View>
          ))}
        </LinearGradient>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.linearStyle,
            external.mb_10,
            {backgroundColor: bgColor},
          ]}>
          <Text
            style={[
              styles.titleText,
              {color: textColor},
              {textAlign: textRTLStyle},
            ]}>
            {t('transData.currency')}
          </Text>
          <View>
            <SolidLine color={darkBorder} />
          </View>
          {currencyData.map((item, index) => (
            <View
              style={[
                external.fd_row,
                external.ai_center,
                external.js_space,
                external.mv_5,
                external.ph_10,
                {flexDirection: viewRTLStyle},
              ]}
              key={index}>
              <Text style={[styles.title, {color: textColor}]}>
                {t(item.title)}
              </Text>
              <RadioButton
                onPress={() => {
                  currencyChecked(item.icon, item.value);
                }}
                checked={checkCurrency === item.icon}
              />
            </View>
          ))}
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default Settings;
