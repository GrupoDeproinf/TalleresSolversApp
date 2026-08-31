import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../../themes/appConstant';

const styles = StyleSheet.create({
  headerShell: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerCard: {
    backgroundColor: '#1F2344',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  headerCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -34,
    right: -22,
  },
  headerCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 22,
    left: -14,
  },
  headerCardInner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 1,
  },
  leftBlock: {
    flex: 1,
    paddingRight: 12,
  },
  overlineText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  helloText: {
    color: '#FFD60A',
    fontSize: 29,
    fontWeight: '800',
  },
  logoWrap: {
    backgroundColor: '#1F2344',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  mapButtonWrap: {
    width: 82,
    height: 78,
    alignSelf: 'flex-end',
    position: 'relative',
    overflow: 'visible',
    marginTop: 10,
  },
  mapBtnCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0A0E1A',
    borderWidth: 2,
    borderColor: '#FFD60A',
    zIndex: 1,
    /** Sombra más clara (amarillo suave) para que el halo se note mejor */
    shadowColor: '#FFE9A3',
    shadowOffset: {width: 0, height: 0},
    /** Valores base; shadowOpacity y shadowRadius los anima el componente */
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'visible',
  },
  mapBtnTouchableInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBadgeDot: {
    position: 'absolute',
    /** Sobre la esquina superior derecha del borde del círculo */
    top: -5,
    right: -5,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFD60A',
    borderWidth: 2,
    borderColor: '#0A0E1A',
    zIndex: 2,
  },
  img: {
    width: windowWidth(32),
    height: windowHeight(22),
    resizeMode: 'contain',
  },
});

export default styles;
