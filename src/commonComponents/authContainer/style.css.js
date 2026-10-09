import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../themes/appConstant';
import {external} from '../../style/external.css';

// Colores de la línea gráfica (ui/tokens.js > brand).
const DARK_BLUE = '#151D61';
const YELLOW = '#FCC800';

const styles = StyleSheet.create({
  container: {
    ...external.fx_1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    width: '100%',
    alignSelf: 'stretch',
    paddingBottom: windowHeight(35),
    paddingHorizontal: 0,
    backgroundColor: DARK_BLUE,
    alignItems: 'center',
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    borderBottomWidth: 10,
    borderBottomColor: YELLOW,
    overflow: 'hidden',
  },
  huellaArriba: {
    position: 'absolute',
    top: -18,
    right: -150,
    width: 420,
    height: 128,
    opacity: 0.22,
    transform: [{rotate: '180deg'}],
  },
  huellaAbajo: {
    position: 'absolute',
    bottom: 6,
    left: -170,
    width: 420,
    height: 128,
    opacity: 0.18,
  },
  heroTitleMarca: {
    fontFamily: 'Poppins-BlackItalic',
    fontWeight: undefined,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: 0.4,
    color: YELLOW,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  subtitleMarca: {
    fontFamily: 'Poppins-Italic',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  heroInner: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: 8,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 4,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: windowHeight(16),
    marginBottom: 15,
  },
  subtitleText: {
    fontSize: 20,
    color: '#E5E7EB',
    lineHeight: 35,
  },
  formZone: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
});

export default styles;
