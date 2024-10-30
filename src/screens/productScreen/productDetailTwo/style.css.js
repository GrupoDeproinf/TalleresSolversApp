import {StyleSheet} from 'react-native';
import appFonts from '../../../themes/appFonts';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
const styles = StyleSheet.create({
  textContext: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: appFonts.semiBold,
    textAlign: 'center',
    marginTop: windowHeight(9),
  },
  progressBar: {
    width: windowWidth(205),
    backgroundColor: '#E8EAEE',
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    ...external.mh_5,
  },
  progressBarPrimary: {
    backgroundColor: appColors.primary,
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    position: 'absolute',
    alignSelf: 'flex-start',
    width: windowWidth(150),
  },
  buyNowText: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT21,
    paddingHorizontal: windowHeight(3),
  },
  addToBeg: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT21,
    color: appColors.titleText,
  },
  bottomContainerView: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },

  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    marginTop: windowHeight(10),
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
    backgroundColor: '#EEF0F3',
  },
  minus: {
    borderWidth: 1,
    width: windowWidth(165),
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: windowHeight(34),
    elevation: 1,
    backgroundColor: appColors.screenBg,
  },
  viewContainer: {
    backgroundColor: '#2D3261',
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight(8),
    marginHorizontal: windowHeight(3),
    width: windowWidth(78),
    height: windowHeight(48),
  },
  writeYourReview: {
    ...commonStyles.titleText19,
    ...external.ph_20,
    ...external.mt_5,
    color: '#2D3261',
    fontSize: fontSizes.FONT17,
  },
  outOfFive: {
    ...commonStyles.subtitleText,
    color: appColors.screenBg,
    lineHeight: 15,
    top: windowHeight(3),
  },
  fourPointOne: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontFamily: appFonts.semiBold,
    lineHeight: windowHeight(17),
  },

  titleView: {
    ...commonStyles.subtitleText,
    width: 75,
    color: appColors.titleText,
  },
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 30,
  },
  headText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  text: {
    margin: 6,
    fontSize: 16,

    textAlign: 'center',
    color: appColors.subtitle,
    fontFamily: appFonts.medium,
  },
  textTwo: {
    margin: 6,
    fontSize: 16,

    textAlign: 'center',
    color: appColors.screenBg,
    fontFamily: appFonts.medium,
  },
  row: {
    width: 350,
  },
  textStyleFirst: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: appColors.subtitle,
  },
  tableStyle: {
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default styles;
