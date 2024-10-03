import {StyleSheet} from 'react-native';
import {external} from '../../style/external.css';
import {windowHeight} from '../../themes/appConstant';
const styles = StyleSheet.create({
  customRatingBarStyle: {
    ...external.fd_row,
    ...external.js_center,
    ...external.ai_center,
    marginHorizontal: windowHeight(3),
  },
  touchableStar: {
    paddingHorizontal: windowHeight(1),
  },
});

export {styles};
