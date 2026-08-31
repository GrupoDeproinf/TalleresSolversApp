import {StyleSheet} from 'react-native';
import appColors from '../../themes/appColors';
import {windowHeight} from '../../themes/appConstant';
import {external} from '../../style/external.css';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...external.js_end,
    ...external.ai_center,
    backgroundColor: appColors.modelBg,
  },
  valueBar: {
    backgroundColor: appColors.screenBg,
    width: '100%',
    paddingVertical: windowHeight(14),
    borderRadius: 10,
    paddingHorizontal: windowHeight(14),
  },
});

export {styles};
