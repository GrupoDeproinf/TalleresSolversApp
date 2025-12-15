import {StyleSheet, Dimensions} from 'react-native';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  imgStyle: {
    width: width - 50,
    height: windowHeight(115),
    borderRadius: 12,
    overflow: 'hidden',
  },

  bannerWrapper: {
    paddingHorizontal: 8,
  },

  viewContainer: {
    ...external.ph_20,
    ...external.mt_10,
    ...external.fd_row,
    ...external.ai_center,
  },

  activeText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    letterSpacing: -1.2,
    color: '#1FC7EC',
  },

  seriesText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    ...external.pt_15,
    color: '#FE881A',
  },

  fullScreenText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    fontSize: fontSizes.FONT15,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#2D3261',
  },
});

export default styles;
