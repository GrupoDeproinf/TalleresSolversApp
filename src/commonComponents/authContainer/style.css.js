import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../themes/appConstant';
import {external} from '../../style/external.css';

const DARK_BLUE = '#1F2344';
const YELLOW = '#FFD60A';

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
