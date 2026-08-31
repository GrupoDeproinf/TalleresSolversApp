import {StyleSheet} from 'react-native';
import {external} from '../../style/external.css';
import {fontSizes} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';
const styles = StyleSheet.create({
  container: {
    ...external.ai_center,
  },
  valueText: {
    fontSize: fontSizes.FONT21,
    fontWeight: '600',
    color: appColors.titleText,
    fontFamily: appFonts.bold,
  },
  seeAllText: {
    color: appColors.primary,
    fontSize: fontSizes.FONT17,
    fontFamily: appFonts.medium,
  },
});

export default styles;
