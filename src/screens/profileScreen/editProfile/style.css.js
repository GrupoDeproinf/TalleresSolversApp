import { StyleSheet } from 'react-native';
import { windowHeight, windowWidth } from '../../../themes/appConstant';
import { commonStyles } from '../../../../src/style/commonStyle.css';
import appColors from '../../../themes/appColors';
import appFonts from '../../../themes/appFonts';

const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
  imgStyle: {
    width: windowWidth(90),
    height: windowHeight(54),
    marginTop: windowHeight(24),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  editIconStyle: {
    backgroundColor: '#F3F5FB',
    width: windowHeight(24),
    height: windowHeight(24),
    borderRadius: windowHeight(24),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    top: '55%',
  },
  errorStyle: {
    color: 'red',
    marginBottom: windowHeight(4),
    fontFamily: appFonts.bold,
    marginLeft: 10
  },
  /** Raíz alineada a SignUp (padding / flex) */
  signUpLikeRoot: {
    flex: 1,
  },
  /** Tarjetas alineadas al registro (SignUp) */
  signUpLikeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  signUpLikeCardFirst: {
    marginTop: 10,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  signUpLikeCardSoft: {
    borderColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  signUpLikeHeaderBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 214, 10, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLikeHeaderTitleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  signUpLikeHeaderTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  signUpLikeHeaderTitleType: {
    fontWeight: '600',
    opacity: 0.9,
  },
  /** Footer fijo: mismo margen lateral (16) y por encima del scroll para que el botón reciba toques. */
  saveFooterCliente: {
    width: '100%',
    alignSelf: 'stretch',
    paddingTop: 12,
    /** Mismo hueco lateral que el contenido del ScrollView (`paddingHorizontal: 4` en la pantalla). */
    paddingHorizontal: 4,
    zIndex: 20,
    elevation: 20,
  },
  saveFooterBtn: {
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#2D3261',
  },
  saveFooterBtnDisabled: {
    backgroundColor: '#848688',
    opacity: 0.92,
  },
  saveFooterBtnText: {
    marginLeft: windowWidth(8),
    fontSize: 16,
    fontWeight: '700',
    color: appColors.screenBg,
  },
  saveFooterBtnTextDisabled: {
    color: '#051E47',
  },
});

export default styles;
