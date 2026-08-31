import {StyleSheet} from 'react-native';
import {external} from '../../style/external.css';
import {windowHeight, windowWidth} from '../../themes/appConstant';
const styles = StyleSheet.create({
  circle: {
    width: windowWidth(22),
    height: windowHeight(13),
    borderRadius: windowHeight(17),
  },
  container: {
    width: windowWidth(57),
    height: windowHeight(20),
    borderRadius: windowHeight(14),
    ...external.p_5,
  },
});
export {styles};
