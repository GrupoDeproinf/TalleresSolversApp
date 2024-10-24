import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../../themes/appConstant';
import {commonStyles} from '../../../../src/style/commonStyle.css';

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
});

export default styles;
