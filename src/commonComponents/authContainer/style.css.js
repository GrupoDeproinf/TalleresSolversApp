import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../themes/appConstant';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
const styles = StyleSheet.create({
  container: {
    ...external.fx_1,
    backgroundColor: appColors.lightScreenBg,
    paddingTop: windowHeight(20),
  },
  transformLine: {
    transform: [{rotate: '-90deg'}],
    height: windowHeight(50),
    width: windowWidth(120),
    left: -windowHeight(50),
    backgroundColor: 'red',
    position: 'absolute',
    top: 80,
  },
  subtitleText: {
    ...commonStyles.subtitleText,
    ...external.pt_5,
    lineHeight: windowHeight(13),
  },
});

export default styles;
