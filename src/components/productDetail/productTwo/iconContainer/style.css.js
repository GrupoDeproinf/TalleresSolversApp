import {StyleSheet} from 'react-native';
import {external} from '../../../../style/external.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../themes/appConstant';
import {commonStyles} from '../../../../style/commonStyle.css';
import appColors from '../../../../themes/appColors';

const styles = StyleSheet.create({
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    marginTop: windowHeight(10),
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
    backgroundColor: '#EEF0F3',
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  verticalLine: {
    height: '90%',
    width: 2,
    backgroundColor: appColors.subtitle,
  },
  deliveryIn: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: windowHeight(8),
    lineHeight: windowHeight(17),
  },
});

export default styles;
