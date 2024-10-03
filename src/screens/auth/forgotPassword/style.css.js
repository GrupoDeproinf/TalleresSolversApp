import {StyleSheet} from 'react-native';
import appFonts from '../../../themes/appFonts';
import appColors from '../../../themes/appColors';
import {fontSizes, windowHeight} from '../../../themes/appConstant';

const styles = StyleSheet.create({
  headingContainer: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT17,
  },
});

export default styles;
