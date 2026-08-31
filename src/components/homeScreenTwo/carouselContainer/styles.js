import {StyleSheet} from 'react-native';
import {fontSizes} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  mt_20: {
    marginTop: 20,
  },
  mh_20: {
    marginHorizontal: 20,
  },
  imageBackground: {
    width: '105%',
    height: 180,
  },
  shopNow: {
    color: appColors.screenBg,
    textDecorationLine: 'underline',
    fontSize: fontSizes.FONT17,
  },
  paginationContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  activeDot: {
    marginHorizontal: 5,
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: appColors.screenBg,
    top: -30,
  },
  inactiveDot: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: appColors.subtitle,
  },
});

export default styles;
