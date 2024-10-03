import {StyleSheet} from 'react-native';
import {windowHeight} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import appFonts from '../../../themes/appFonts';

const styles = StyleSheet.create({
  singUpView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(10),
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
  },
});

export default styles;
