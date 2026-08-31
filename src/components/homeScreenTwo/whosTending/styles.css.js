import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';

const styles = StyleSheet.create({
  container: {
    borderRadius: windowHeight(9),
    marginTop: windowHeight(10),
    elevation: 1.5,
    margin: 1,
    shadowColor: appColors.shadowColor,
    padding: 1,
  },
  menuItemContent: {
    borderRadius: 6,
    width: '100%',
    flex: 1,
    shadowColor: appColors.shadowColor,
    padding: 12,
  },
  subtitle: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    width: '70%',
  },
  img: {
    height: windowHeight(41),
    width: windowWidth(67),
    marginVertical: windowHeight(8),
  },
  price: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    textDecorationLine: 'line-through',
  },
  titleText: {
    ...commonStyles.titleText19,
    ...external.ph_5,
    width: '73%',
  },
});

export default styles;
