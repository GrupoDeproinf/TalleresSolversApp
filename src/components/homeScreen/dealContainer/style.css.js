import {StyleSheet} from 'react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import appFonts from '../../../themes/appFonts';
const styles = StyleSheet.create({
  imgStyle: {
    width: windowWidth(210),
    height: windowHeight(140),
    marginTop: windowHeight(5),
  },
  textStyle: {
    ...commonStyles.subtitleText,
    textAlign: 'center',
    paddingTop: windowHeight(10),
  },
  priceContainer: {
    ...commonStyles.H1Banner,
    textAlign: 'center',
  },
  textTwoStyle: {
    textAlign: 'center',
    paddingTop: windowHeight(14),
    color: appColors.screenBg,
    fontFamily: appFonts.sofiasansMedium,
    alignSelf: 'center',
    lineHeight: windowHeight(13),
    fontSize: fontSizes.FONT16,
    width: '80%',
  },
  priceContainerTwo: {
    fontSize: fontSizes.FONT17,
  },
});

export default styles;
