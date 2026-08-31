import React, {useEffect, useRef} from 'react';
import {ImageBackground, View, Animated, Easing} from 'react-native';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import {useTranslation} from 'react-i18next';
import {useValues} from '../../../../App';
import {getValue} from '../../../utils/helper/localStorage';

const Splash = ({navigation}) => {
  const logoSize = useRef(new Animated.Value(1)).current;
  const logoHeight = logoSize.interpolate({
    inputRange: [0, 2],
    outputRange: [25, 90],
  });
  const logoWidth = logoSize.interpolate({
    inputRange: [0, 2],
    outputRange: [25, 90],
  });

  useEffect(() => {
    getValues();
    const animationTimeout = setTimeout(() => {
      Animated.timing(logoSize, {
        toValue: 2,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      const navigationTimeout = setTimeout(() => {
        navigation.replace('Onboarding');
      }, 2000);

      return () => clearTimeout(navigationTimeout);
    }, 500);

    return () => clearTimeout(animationTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);
  const {setCurrSymbol, setCurrPrice, setIsDark, setIsRTL} = useValues();
  const {i18n} = useTranslation();
  const getValues = async () => {
    const language = await getValue('language');
    const currSymbol = await getValue('curr');
    const currPrice = await getValue('currPrice');
    const dark = await getValue('isDark');
    const rtl = await getValue('isRtl');
    const darkVal = dark === 'true';
    const rtlVal = rtl === 'true';
    if (language != null) {
      i18n.changeLanguage(language);
    }
    if (currSymbol != null) {
      setCurrSymbol(currSymbol);
      setCurrPrice(parseFloat(currPrice));
    }
    if (dark != null) {
      setIsDark(!darkVal);
    }
    if (rtl != null) {
      setIsRTL(!rtlVal);
    }
  };
  return (
    <ImageBackground style={[external.fx_1]} source={images.splash}>
      <View style={[external.fx_1, external.js_center, external.ai_center]}>
        <Animated.Image
          source={images.logo}
          style={[
            external.rm_contain,
            {
              transform: [{scale: logoSize}],
              height: logoHeight,
              width: logoWidth,
            },
          ]}
        />
      </View>
    </ImageBackground>
  );
};

export default Splash;
