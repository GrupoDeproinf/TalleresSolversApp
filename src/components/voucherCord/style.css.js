import {StyleSheet} from 'react-native';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import {commonStyles} from '../../style/commonStyle.css';
const styles = StyleSheet.create({
  container: {
    height: windowHeight(45),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applyNow: {
    ...commonStyles.subtitleText,
    fontSize: fontSizes.FONT18,
    color: '#2D3261',
    paddingHorizontal: windowHeight(13),
  },
});

export default styles;
