import {StyleSheet} from 'react-native';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
const styles = StyleSheet.create({
  linearGradient: {
    borderRadius: windowHeight(35),
    height: windowHeight(40),
    ...external.js_center,
    backgroundColor: appColors.subtitle,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#848688',
    ...external.ti_center,
    height: windowHeight(19),
    fontSize: fontSizes.FONT20,
  },
  buttonTextLarge: {
    ...commonStyles.titleText19,
    ...external.ti_center,
  },
  icon: {
    ...external.fd_row,
    ...external.as_center,
  },
  cardContainer: {
    borderRadius: windowHeight(35),
    height: windowHeight(40),
    ...external.js_center,
    backgroundColor: appColors.subtitle,
    width: '100%',
    alignItems: 'center',
    margin: 1,
  },
  menuItemContent: {
    borderRadius: windowHeight(35),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
    height: windowHeight(40),
  },
});

export default styles;
