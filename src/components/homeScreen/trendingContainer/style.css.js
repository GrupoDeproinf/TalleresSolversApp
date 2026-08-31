import {StyleSheet} from 'react-native';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appFonts from '../../../themes/appFonts';

const styles = StyleSheet.create({
  priceContainer: {
    ...external.mt_5,
  },
  price: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT21,
    fontFamily: appFonts.semiBold,
    fontWeight: '600',
  },
  underlinePrice: {
    ...commonStyles.subtitleText,
    ...external.mh_2,
    textDecorationLine: 'line-through',
  },
  container: {
    width: windowWidth(190),
    marginTop: windowHeight(10),
    borderRadius: windowHeight(9),
    padding: 1,
    overflow: 'hidden',
    elevation: 1.5,
    margin: 1,
  },
  viewContainer: {
    borderRadius: windowHeight(7),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: windowHeight(6),
    marginBottom: windowHeight(5),
  },
  imgContainerView: {
    width: windowWidth(95),
    height: windowHeight(42),
  },
  menuItemContent: {
    borderRadius: windowHeight(9),
    width: '100%',
    flex: 1,

    paddingHorizontal: windowHeight(8),
    paddingBottom: windowHeight(5),
    paddingTop: windowHeight(8),
  },
});

export default styles;
