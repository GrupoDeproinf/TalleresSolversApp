import {StyleSheet} from 'react-native';
import appColors from '../../themes/appColors';
import {fontSizes, windowHeight, windowWidth} from '../../themes/appConstant';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import appFonts from '../../themes/appFonts';
const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  menuColumn: {
    flexDirection: 'column',
    bottom: windowHeight(1),
    marginTop: windowHeight(10),
  },
  menuItem: {
    width: windowHeight(90),
    height: windowHeight(50),
    justifyContent: 'center',
    alignItems: 'center',
    left: windowHeight(10),
    top: windowHeight(2),
  },
  selectedMenuItem: {
    backgroundColor: appColors.screenBg,
    elevation: 5,
    left: windowHeight(10),
    borderTopLeftRadius: windowHeight(10),
    borderBottomLeftRadius: 10,
    top: windowHeight(2),
  },
  menuItemText: {
    ...commonStyles.titleText19,
    alignSelf: 'flex-start',
    ...external.mh_10,
    color: appColors.subtitle,
  },
  menuItemTextSelect: {
    ...commonStyles.titleText19,
  },
  rightSideTextColor: {
    fontFamily: appFonts.Regular,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT20,
    fontWeight: '500',
    ...external.as_center,
  },
  price: {
    fontFamily: appFonts.large,
    color: appColors.primary,
    fontSize: fontSizes.FONT23,
    fontWeight: '500',
    ...external.as_center,
  },
  leftsideStyle: {
    width: windowWidth(200),
    height: windowHeight(42),
    ...external.ai_center,
    ...external.js_center,
    backgroundColor: appColors.layoutBg,
    borderRadius: windowHeight(8),
    ...external.mh_20,
  },
  rightsideStyle: {
    width: windowWidth(200),
    height: windowHeight(42),
    ...external.js_center,
    ...external.ai_center,
    ...external.js_center,
    backgroundColor: appColors.primary,
    borderRadius: windowHeight(8),
    ...external.mh_20,
  },
  settingsColumn: {
    marginTop: windowHeight(17),
    ...external.mh_20,
  },
});

export {styles};
