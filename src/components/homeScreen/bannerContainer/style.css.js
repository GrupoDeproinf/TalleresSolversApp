import {StyleSheet} from 'react-native';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';
const styles = StyleSheet.create({
  imgStyle: {
    width: '100%',
    height: windowHeight(145),
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,13,46,0.42)',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  bannerChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,214,10,0.95)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  bannerChipText: {
    color: '#1F2344',
    fontSize: 11,
    fontWeight: '800',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  bannerSubtitle: {
    marginTop: 2,
    color: '#E8ECF7',
    fontSize: 12,
    lineHeight: 16,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 7,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BFC8DC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFD60A',
    width: 22,
  },
});

export default styles;
