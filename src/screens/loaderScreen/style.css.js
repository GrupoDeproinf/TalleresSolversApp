import {StyleSheet} from 'react-native';
import {windowHeight} from '../../themes/appConstant';
import appColors from '../../themes/appColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.screenBg,
  },
  imgStyle: {
    width: windowHeight(100),
    height: windowHeight(100),
    borderRadius: windowHeight(100),
  },
  imgStyleDark: {
    width: windowHeight(200),
    height: windowHeight(200),
    borderRadius: windowHeight(200),
  },
});

export default styles;
