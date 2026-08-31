import {StyleSheet} from 'react-native';
import appFonts from '../../../themes/appFonts';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';

const styles = StyleSheet.create({
  headingContainer: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: windowHeight(14),
    paddingBottom: windowHeight(35),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT17,
  },
  succesFullImg: {
    width: windowWidth(310),
    height: windowHeight(200),
    alignSelf: 'center',
  },
});

export default styles;
