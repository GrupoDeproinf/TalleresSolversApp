import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../themes/appConstant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingBottom: windowHeight(14),
    paddingTop: windowHeight(24),
  },
});

export default styles;
