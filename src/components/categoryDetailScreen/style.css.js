import {StyleSheet} from 'react-native';
import appColors from '../../themes/appColors';
import {windowHeight} from '../../themes/appConstant';

export const styles = StyleSheet.create({
  container: {
    height: '95%',
    borderWidth: 1,
    width: 222,
    marginTop: windowHeight(11),
    borderLeftColor: appColors.screenBg,
    borderTopColor: appColors.bgLayer,
    borderRightColor: appColors.bgLayer,
    borderBottomColor: appColors.bgLayer,
    paddingTop: 15,
    elevation: 3,
    shadowColor: appColors.shadowColor,
  },
  linearGradient: {
    width: 56,
    height: 56,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 5,
    borderRadius: 6,
    shadowColor: appColors.shadowColor,
  },
});
