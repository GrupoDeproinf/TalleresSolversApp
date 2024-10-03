import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../themes/appConstant';
import appColors from '../../../../themes/appColors';
import appFonts from '../../../../themes/appFonts';
import {commonStyles} from '../../../../style/commonStyle.css';

const styles = StyleSheet.create({
  priceContainer: {
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: appFonts.semiBold,
    lineHeight: 30,
  },
  percentageOff: {
    backgroundColor: '#FDDBDB',
    width: windowWidth(90),
    borderRadius: windowHeight(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  imgBackground: {
    height: windowHeight(205),
    width: '100%',
    marginTop: windowHeight(9),
  },
  tenPercentage: {
    ...commonStyles.titleText19,
    color: appColors.red,
    fontSize: fontSizes.FONT17,
    paddingTop: windowHeight(3),
  },
});

export default styles;
