import {StyleSheet} from 'react-native';
import {fontSizes, windowHeight, windowWidth} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
const styles = StyleSheet.create({
  headerBlock: {
    marginHorizontal: 0,
    backgroundColor: '#1D1E56',
    paddingHorizontal: 16,
    paddingTop: 16,
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
    lineHeight: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para el modal
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white', // Fondo del modal
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Sombra para Android
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: '#2196F3', // Azul para el botón de cierre
  },
  textStyle: {
    color: 'white', // Color blanco para el texto del botón
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18, // Aumentar tamaño de texto
    fontWeight: 'bold', // Hacer el texto más visible
    color: '#000', // Texto negro para contraste
  },
  textContext: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: appFonts.semiBold,
    textAlign: 'center',
    marginTop: windowHeight(9),
  },
  progressBar: {
    width: windowWidth(245),
    backgroundColor: appColors.bgLayer,
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    ...external.mh_5,
  },
  progressBarPrimary: {
    backgroundColor: appColors.primary,
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    position: 'absolute',
    alignSelf: 'flex-start',
    width: windowWidth(150),
  },
  allReview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: appColors.bgLayer,
    paddingHorizontal: 10,
    borderRadius: windowHeight(4),
    paddingVertical: 5,
  },
  allReviewMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: appColors.bgLayer,
    paddingHorizontal: 10,
    borderRadius: windowHeight(4),
  },
  viewText: {
    ...external.mt_5,
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,
  },
  writeReview: {
    ...commonStyles.titleText19,
    color: '#2D3261',
    textDecorationLine: 'underline',
    marginTop: windowHeight(8),
    fontSize: fontSizes.FONT17,
  },
  summaryCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DEE5EE',
    padding: 14,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: '#1F2344',
    fontSize: 16,
    fontWeight: '800',
  },
  summaryCountChip: {
    backgroundColor: '#EEF2F7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryCountChipText: {
    color: '#2D3261',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryScoreRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryScoreValue: {
    color: '#1F2344',
    fontSize: 34,
    fontWeight: '900',
    marginRight: 12,
  },
  summaryStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summarySubtitle: {
    marginTop: 8,
    color: '#5C6485',
    fontSize: 13,
    fontWeight: '600',
  },
  writeReviewBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#FFD60A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7BF00',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  writeReviewBtnText: {
    color: '#1F2344',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#1F2344',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
  titleText: {
    ...commonStyles.subtitleText,
    width: windowWidth(95),
    color: appColors.titleText,
  },
  ratingScreenView: {
    borderRadius: 10,
    borderColor: appColors.bgLayer,
    elevation: 1,
    margin: 1,
  },
  menuItemContent: {
    borderRadius: 10,
    marginTop: 20,
    borderColor: appColors.bgLayer,
    elevation: 1,
  },
  mapView: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mh_20,
    ...external.pt_10,
  },
});

export default styles;
