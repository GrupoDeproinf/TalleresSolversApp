import { StyleSheet } from 'react-native';
import { windowHeight, windowWidth } from '../../../themes/appConstant';
import { commonStyles } from '../../../../src/style/commonStyle.css';
import appColors from '../../../themes/appColors';
import appFonts from '../../../themes/appFonts';

const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
  imgStyle: {
    width: windowWidth(90),
    height: windowHeight(54),
    marginTop: windowHeight(24),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  editIconStyle: {
    backgroundColor: '#F3F5FB',
    width: windowHeight(24),
    height: windowHeight(24),
    borderRadius: windowHeight(24),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    top: '55%',
  },
  errorStyle: {
    color: 'red',
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
    marginLeft: 10
  },
});

export default styles;
