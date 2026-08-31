import {StyleSheet} from 'react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes} from '../../../themes/appConstant';
const styles = StyleSheet.create({
  container: {
    ...commonStyles.titleText19,
    color: '#2D3261',
    fontSize: fontSizes.FONT17,
  },
});

export default styles;
