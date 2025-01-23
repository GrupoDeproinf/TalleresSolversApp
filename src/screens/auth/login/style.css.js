import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appFonts from '../../../themes/appFonts';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
const styles = StyleSheet.create({
  headingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: appColors.screenBg,
    width: windowWidth(130),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 1,
    marginHorizontal: 10,
    borderTopColor: appColors.bgLayout,
    padding: 1,
  },

  flexView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: windowHeight(20),
  },
  singUpView: {
    // flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(10),
    alignItems: 'center',
    marginBottom:30
  },
  container: {
    ...commonStyles.commonContainer,
    paddingHorizontal: windowHeight(14),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT17,
  },
  rememberText: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    ...external.fg_1,
    color: appColors.titleText,
    fontSize: fontSizes.FONT16,
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
    paddingVertical: windowHeight(12),
  },
  textTech: {
    ...commonStyles.subtitleText,
    fontSize: fontSizes.FONT12,
  }
});

export default styles;
