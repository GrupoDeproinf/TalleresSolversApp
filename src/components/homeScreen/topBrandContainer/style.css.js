import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';
import {windowHeight, windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
const styles = StyleSheet.create({
  container: {
    width: windowWidth(125),
    height: windowHeight(32),
    alignItems: 'center',
    ...external.mh_5,
    ...external.mt_5,
    justifyContent: 'center',
    borderRadius: windowHeight(5),
    padding: 1,
    overflow: 'hidden',
    elevation: 1.5,
    margin: 1,
  },
  menuItemContent: {
    borderRadius: windowHeight(5),
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
