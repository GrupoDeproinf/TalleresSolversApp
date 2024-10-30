import {StyleSheet} from 'react-native';
import {windowHeight} from '../../themes/appConstant';

const styles = StyleSheet.create({
  verticalLine: {
    height: '100%',
    width: 5,
    backgroundColor: '#2D3261',
    marginHorizontal: windowHeight(5),
    borderRadius: 10,
  },
});
export {styles};
