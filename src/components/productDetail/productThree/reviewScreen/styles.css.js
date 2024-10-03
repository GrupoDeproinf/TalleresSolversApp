import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../../../themes/appConstant';
import {external} from '../../../../style/external.css';
import appColors from '../../../../themes/appColors';
import {commonStyles} from '../../../../style/commonStyle.css';

const styles = StyleSheet.create({
  progressBar: {
    width: windowWidth(325),
    backgroundColor: '#E8EAEE',
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    ...external.mh_5,
  },
  progressBarPrimary: {
    backgroundColor: appColors.primary,
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    position: 'absolute',
    alignSelf: 'flex-start',
    width: windowWidth(150),
  },
  titleText: {
    ...commonStyles.subtitleText,
    width: windowWidth(90),
    color: appColors.titleText,
  },
});

export default styles;
