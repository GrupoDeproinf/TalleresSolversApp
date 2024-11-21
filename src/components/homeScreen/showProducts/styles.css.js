import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import appFonts from '../../../themes/appFonts';
import {commonStyles} from '../../../style/commonStyle.css';
const styles = StyleSheet.create({
  container: {
    marginTop: windowHeight(13),
    flexDirection: 'row',
    padding: windowHeight(1),
    borderRadius: windowHeight(10),
    overflow: 'hidden',
    elevation: 1.5,
    margin: 1,
  },
  imageContainer: {
    height: windowHeight(70),
    width: windowWidth(108),
    backgroundColor: '#F3F5FB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: windowWidth(76),
    height: windowHeight(45),
    resizeMode: 'contain',
  },
  textContainer: {
    ...external.mh_8,
  },
  title: {
    width: '75%',
    color: appColors.titleText,
    fontSize: fontSizes.FONT19,
    fontFamily: appFonts.semiBold,
    fontWeight: '600',
  },
  ratingContainer: {
    ...external.fd_row,
    ...external.ai_center,
  },
  ratingText: {
    ...commonStyles.subtitleText,
    ...external.mh_2,
    ...external.mt_3,
    color: '#FB9927',
    fontFamily: appFonts.bold,
  },
  subtitle: {
    ...commonStyles.subtitleText,
  },
  datoSub: {
    fontWeight: '400',
    fontSize: fontSizes.FONT13,
    lineHeight: windowHeight(18),
    color: '#9BA6B8',
    fontFamily: appFonts.Regular,
  }, 
  priceContainer: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mt_5,
  },
  price: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT21,
    fontFamily: appFonts.semiBold,
    fontWeight: '600',
  },
  status: {
    ...commonStyles.titleText10,
    fontSize: fontSizes.FONT15,
    // fontFamily: appFonts.semiBold,
    // fontWeight: '600',
  },
  underlinePrice: {
    ...commonStyles.subtitleText,
    ...external.mh_2,
    textDecorationLine: 'line-through',
  },
  newArrivalContainer: {
    ...external.ph_20,
  },
  linearBorderStyle: {
    width: windowHeight(25),
    height: windowHeight(25),
    borderRadius: windowHeight(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  showLinear: {
    width: 40,
    backgroundColor: appColors.bgLayer,
    position: 'absolute',
    right: 0,
    bottom: -20,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 5,
  },
  menuItemContent: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: windowHeight(10),
    paddingVertical: windowHeight(10),
    borderRadius: windowHeight(10),
  },
  starsContainer: {
    width: '50%',
  }
});

export default styles;
