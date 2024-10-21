import {StyleSheet} from 'react-native';
import {windowHeight} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import appFonts from '../../../themes/appFonts';
import {commonStyles} from '../../../../src/style/commonStyle.css';


const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
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
