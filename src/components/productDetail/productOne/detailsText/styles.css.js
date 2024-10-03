import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../themes/appConstant';
import appColors from '../../../../themes/appColors';
import appFonts from '../../../../themes/appFonts';
import {commonStyles} from '../../../../style/commonStyle.css';
import {external} from '../../../../style/external.css';
const styles = StyleSheet.create({
  priceContainer: {
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: appFonts.semiBold,
    lineHeight: 30,
  },
  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  percentageOff: {
    backgroundColor: '#FDDBDB',
    width: windowWidth(90),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    ...commonStyles.titleText19,
    color: appColors.red,
    fontSize: fontSizes.FONT17,
    paddingTop: windowHeight(3),
  },
  viewStyle: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    ...external.mt_10,
  },
});

export default styles;
