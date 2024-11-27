import {StyleSheet} from 'react-native';
import appFonts from '../../../themes/appFonts';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2, // Para sombreado en Android
  },
  button: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Sombra en Android
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Si necesitas un fondo tenue
  },
  listItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 1,
  },
  button: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
  buttonClose: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  phone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  container: {
    padding: 10,
    marginTop: 20,
    backgroundColor: '#2196F3', // Fondo visible
    borderRadius: 10,
    alignItems: 'center',
  },
  welcome: {
    color: '#fff', // Contraste con el fondo
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  icon: {
    marginLeft: 10,
  },
  copyIcon: {
    marginRight: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '80%',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
    width: windowWidth(205),
    backgroundColor: '#E8EAEE',
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
  buyNowText: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT21,
    paddingHorizontal: windowHeight(3),
  },
  addToBeg: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT21,
    color: appColors.titleText,
  },
  bottomContainerView: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  priceContainer: {
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: appFonts.semiBold,
    lineHeight: 30,
  },
  percentageOff: {
    backgroundColor: '#FDDBDB',
    width: windowWidth(90),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    borderWidth: 1,
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(8),
    marginTop: windowHeight(10),
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
    elevation: 0.5,
    backgroundColor: appColors.screenBg,
  },
  verticalLine: {
    height: '70%',
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
  minus: {
    borderWidth: 1,
    width: windowWidth(165),
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: windowHeight(34),
    elevation: 1,
    backgroundColor: appColors.screenBg,
  },
  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  viewContainer: {
    backgroundColor: '#2D3261',
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight(8),
    marginHorizontal: windowHeight(3),
    width: windowWidth(78),
    height: windowHeight(48),
  },
  writeYourReview: {
    ...commonStyles.titleText19,
    ...external.ph_20,
    ...external.mt_5,
    color: '#2D3261',
    fontSize: fontSizes.FONT17,
  },
  outOfFive: {
    ...commonStyles.subtitleText,
    color: appColors.screenBg,
    lineHeight: 15,
    top: windowHeight(3),
  },
  fourPointOne: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontFamily: appFonts.semiBold,
    lineHeight: windowHeight(17),
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  titleView: {
    ...commonStyles.subtitleText,
    width: 75,
    color: appColors.titleText,
  },
  ratingScreen: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mh_10,
    marginVertical: 3,
  },
});

export default styles;
