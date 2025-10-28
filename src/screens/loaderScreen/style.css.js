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
    width: windowHeight(100), // Reducido de 150 a 100
    height: windowHeight(100), // Reducido de 150 a 100
  },
  imgStyleload: {
    width: windowHeight(100), // Reducido de 150 a 100
    height: windowHeight(100), // Reducido de 150 a 100
  },
});

export default styles;
