import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import HeaderContainer from '../headingContainer';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import {fontSizes, windowHeight, windowWidth} from '../../themes/appConstant';
import NavigationButton from '../navigationButton';
import {useValues} from '../../../App';

const ErrorContainer = ({
  Buttontitle,
  Desc,
  title,
  img,
  headerTitle,
  onPress,
}) => {
  const {
    linearColorStyle,
    isDark,
    bgFullStyle,
    textColorStyle,
    imageContainer,
  } = useValues();
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value={headerTitle} />
      <View style={[external.ai_center, external.js_center, external.fx_1]}>
        <Image
          style={{width: windowWidth(330), height: windowHeight(250)}}
          source={img}
        />
        <Text
          style={[
            commonStyles.hederH2,
            {color: textColorStyle, fontSize: fontSizes.FONT23},
          ]}>
          {title}
        </Text>
        <Text
          style={[
            commonStyles.subtitleText,
            external.ti_center,
            external.Pb_30,
            external.pt_8,
            {fontSize: fontSizes.FONT18},
          ]}>
          {Desc}
        </Text>
        <View style={{width: '100%'}}>
          <NavigationButton
            title={Buttontitle}
            backgroundColor={'#4D66FF'}
            color={appColors.screenBg}
            onPress={onPress}
          />
        </View>
      </View>
    </View>
  );
};

export default ErrorContainer;
