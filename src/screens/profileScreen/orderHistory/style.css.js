import {StyleSheet, Platform} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import {commonStyles} from '../../../style/commonStyle.css';
import appFonts from '../../../themes/appFonts';

const styles = StyleSheet.create({
  headerBlock: {
    marginHorizontal: 0,
    backgroundColor: '#1D1E56',
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -32,
    right: -22,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -22,
    left: -18,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topNavBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,214,10,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: '#EEF2F7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: {
    color: '#1F2344',
    fontSize: 11,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  headerAccent: {
    color: '#FFD60A',
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: windowHeight(8),
    paddingBottom: windowHeight(28),
  },
  cardWrap: {
    marginBottom: windowHeight(14),
    borderRadius: windowHeight(18),
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: windowHeight(18),
    paddingVertical: windowHeight(11),
    paddingHorizontal: windowHeight(12),
    borderWidth: 1,
    borderStartWidth: 4,
    overflow: 'hidden',
  },
  imageOuter: {
    marginRight: windowHeight(12),
  },
  imageRing: {
    padding: 2,
    borderRadius: windowHeight(12),
  },
  imageContainer: {
    width: windowWidth(82),
    height: windowHeight(64),
    borderRadius: windowHeight(10),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT17,
    fontWeight: '700',
    marginBottom: windowHeight(4),
  },
  tallerBox: {
    alignSelf: 'stretch',
    marginTop: windowHeight(2),
    marginBottom: windowHeight(6),
    paddingVertical: windowHeight(6),
    paddingHorizontal: windowHeight(10),
    borderRadius: windowHeight(8),
    borderWidth: 1,
    borderColor: 'rgba(31, 35, 68, 0.28)',
    backgroundColor: 'transparent',
  },
  tallerBoxDark: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tallerRow: {
    alignItems: 'center',
    width: '100%',
  },
  tallerNameOnly: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSizes.FONT14,
    fontWeight: '600',
    lineHeight: windowHeight(18),
    paddingEnd: windowHeight(6),
  },
  tallerChevron: {
    flexShrink: 0,
  },
  tallerNameStatic: {
    flex: 0,
    paddingEnd: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowHeight(10),
    flexWrap: 'wrap',
  },
  dateBadge: {
    paddingHorizontal: windowHeight(8),
    paddingVertical: windowHeight(4),
    borderRadius: windowHeight(20),
    marginRight: windowHeight(8),
    borderWidth: 1,
  },
  dateText: {
    fontSize: fontSizes.FONT13,
    fontWeight: '600',
  },
  priceRow: {
    flexShrink: 1,
    fontSize: fontSizes.FONT17,
    lineHeight: windowHeight(24),
  },
  priceDesdeLabel: {
    fontSize: fontSizes.FONT17,
    fontWeight: '600',
  },
  priceAmount: {
    fontSize: fontSizes.FONT17,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  verPill: {
    paddingVertical: windowHeight(8),
    paddingHorizontal: windowHeight(18),
    borderRadius: windowHeight(22),
    borderWidth: 1,
  },
  verPillText: {
    color: '#FFFFFF',
    fontSize: fontSizes.FONT15,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: windowHeight(48),
    paddingHorizontal: windowHeight(20),
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: windowHeight(12),
  },
  emptyTitle: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: windowHeight(8),
  },
  emptySub: {
    ...commonStyles.subtitleText,
    textAlign: 'center',
    lineHeight: windowHeight(22),
  },
});

export default styles;
