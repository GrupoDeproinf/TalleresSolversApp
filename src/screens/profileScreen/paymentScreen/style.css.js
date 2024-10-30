import {StyleSheet} from 'react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import {fontSizes} from '../../../themes/appConstant';
const styles = StyleSheet.create({
  text: {
    ...commonStyles.titleText19,
    textDecorationLine: 'underline',
    color: '#2D3261',
    fontSize: fontSizes.FONT17,
  },
});

export default styles;
