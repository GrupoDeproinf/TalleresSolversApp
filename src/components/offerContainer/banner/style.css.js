import {StyleSheet} from 'react-native';
import appFonts from '../../../themes/appFonts';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';

const styles = StyleSheet.create({
  container: {
    height: windowHeight(114),
    width: '100%',
    marginHorizontal: windowWidth(18),
    paddingHorizontal: windowHeight(12),
    paddingTop: windowHeight(14),
    marginTop: windowHeight(10),
  },
  title: {
    fontFamily: appFonts.LargeButtonMedium,
    color: appColors.screenBg,
    fontWeight: '600',
    fontSize: fontSizes.FONT21,
  },
  subtitle: {
    fontFamily: appFonts.medium,
    color: appColors.screenBg,
    fontWeight: '600',
    fontSize: fontSizes.FONT17,
  },
  description: {
    fontFamily: appFonts.Regular,
    color: appColors.screenBg,
    fontWeight: '400',
    fontSize: fontSizes.FONT15,
  },
  actionText: {
    fontFamily: appFonts.Regular,
    color: appColors.screenBg,
    fontWeight: '500',
    fontSize: fontSizes.FONT19,
    textDecorationLine: 'underline',
    paddingTop: windowHeight(10),
  },
});
export {styles};
