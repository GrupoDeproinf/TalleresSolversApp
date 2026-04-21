import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';
import {windowHeight, windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
const styles = StyleSheet.create({
  plusICon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: windowHeight(80),
    right: windowHeight(10),
  },
  imgContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginHorizontal: windowHeight(3),
    marginTop: windowHeight(6),
    borderRadius: windowHeight(10),
    paddingVertical: 0,
    overflow: 'hidden',
  },
  img: {
    resizeMode: 'contain',
    height: windowHeight(74),
    width: '96%',
    borderRadius: windowHeight(8),
  },
  viewContainer: {
    marginHorizontal: windowHeight(6),
    borderRadius: 16,
    borderColor: appColors.bgLayout,
    marginBottom: windowHeight(8),
    padding: 1,
    shadowColor: appColors.shadowColor,
    overflow: 'hidden',
    elevation: 4,
    margin: 1,
    backgroundColor: '#F3F4F6',
  },
  ratingContainer: {
    ...commonStyles.titleText19,
    ...external.pt_5,
    ...external.mh_2,
    color: '#FB9927',
  },
  menuItemContent: {
    borderRadius: 16,
    width: '100%',
    shadowColor: appColors.shadowColor,
    paddingBottom: 1,
    backgroundColor: '#F3F4F6',
  },
  cardContentWrap: {
    minHeight: windowHeight(70),
    justifyContent: 'flex-start',
  },
  titleWrap: {
    minHeight: 19,
    justifyContent: 'flex-start',
  },
  subtitleWrap: {
    minHeight: 13,
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  titleFixed: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 1,
  },
  subtitleFixed: {
    fontSize: 11,
    lineHeight: 18,
  },
  priceFixed: {
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 1,
    gap: 6,
  },
  metaChipStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD60A',
    marginRight: 5,
  },
  metaChipStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD60A',
    lineHeight: 14,
  },
  metaChipKm: {
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipKmText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD60A',
    lineHeight: 14,
  },
  arrowChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowChipText: {
    color: '#FFD60A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: -1,
  },
});

export default styles;
