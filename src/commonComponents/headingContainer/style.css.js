import {StyleSheet} from 'react-native';
import {external} from '../../style/external.css';
import {fontSizes} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';
const styles = StyleSheet.create({
  decorOuter: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    paddingBottom: 4,
  },
  decorCircle1: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(45, 50, 97, 0.09)',
    top: -28,
    right: -18,
  },
  decorCircle2: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
    top: 14,
    left: -14,
  },
  rowElevated: {
    zIndex: 1,
  },
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
