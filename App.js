import React, {createContext, useContext, useEffect, useState} from 'react';
import {SafeAreaView, LogBox} from 'react-native';
import MyStack from './src/navigation';
import {external} from './src/style/external.css';
import {
  textRTLStyle,
  viewRTLStyle,
  imageRTLStyle,
  viewSelfRTLStyle,
} from './src/style/rtlStyle';
import {
  bgFullStyle,
  textColorStyle,
  iconColorStyle,
  linearColorStyle,
  subtitleColorStyle,
  imageContainer,
  linearColorStyleTwo,
} from './src/style/darkStyle';
import {useTranslation} from 'react-i18next';
LogBox.ignoreLogs(['Your specific warning here']);
export const CommonContext = createContext();
const App = () => {
  useEffect(() => {
    LogBox.ignoreAllLogs();
  }, []);
  const [isRTL, setIsRTL] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currSymbol, setCurrSymbol] = useState('$');
  const [currPrice, setCurrPrice] = useState(1);
  const {t} = useTranslation();

  const contextValues = {
    isRTL,
    setIsRTL,
    isDark,
    setIsDark,
    linearColorStyleTwo: linearColorStyleTwo(isDark),
    imageContainer: imageContainer(isDark),
    subtitleColorStyle: subtitleColorStyle(isDark),
    linearColorStyle: linearColorStyle(isDark),
    textColorStyle: textColorStyle(isDark),
    iconColorStyle: iconColorStyle(isDark),
    bgFullStyle: bgFullStyle(isDark),
    textRTLStyle: textRTLStyle(isRTL),
    viewRTLStyle: viewRTLStyle(isRTL),
    imageRTLStyle: imageRTLStyle(isRTL),
    viewSelfRTLStyle: viewSelfRTLStyle(isRTL),
    t,
    currSymbol,
    setCurrSymbol,
    currPrice,
    setCurrPrice,
  };
  return (
    <CommonContext.Provider value={contextValues}>
      <SafeAreaView style={[external.fx_1]}>
        <MyStack />
      </SafeAreaView>
    </CommonContext.Provider>
  );
};
export const useValues = () => useContext(CommonContext);

export default App;
