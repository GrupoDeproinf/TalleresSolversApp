import {StyleSheet} from 'react-native';
import {fontSizes, windowHeight} from '../themes/appConstant';
import appColors from '../themes/appColors';
import appFonts from '../themes/appFonts';
import {external} from './external.css';
const commonStyles = StyleSheet.create({
  container: {
    fontWeight: '500',
    fontSize: fontSizes.FONT27,
    lineHeight: windowHeight(23),
    color: appColors.titleText,
    fontFamily: appFonts.LargeButtonMedium,
  },
  subtitleText: {
    fontWeight: '400',
    fontSize: fontSizes.FONT17,
    lineHeight: windowHeight(18),
    color: '#9BA6B8',
    fontFamily: appFonts.Regular,
  },
  titleText19: {
    fontWeight: '500',
    fontSize: fontSizes.FONT19,
    lineHeight: windowHeight(21),
    color: appColors.titleText,
    fontFamily: appFonts.medium,
  },
  H1Banner: {
    fontWeight: '600',
    fontSize: fontSizes.FONT21,
    lineHeight: windowHeight(21),
    color: appColors.screenBg,
    fontFamily: appFonts.medium,
  },
  hederH2: {
    fontWeight: '500',
    fontSize: fontSizes.FONT21,
    lineHeight: windowHeight(21),
    color: appColors.titleText,
    fontFamily: appFonts.medium,
  },
  commonContainer: {
    ...external.fx_1,
    backgroundColor: '#FDFDFD',
  },
});
export {commonStyles};
