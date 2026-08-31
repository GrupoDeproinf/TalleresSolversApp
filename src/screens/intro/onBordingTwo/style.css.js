import {StyleSheet} from 'react-native';
import {windowHeight} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: windowHeight(160),
    marginVertical: windowHeight(7),
    bottom: windowHeight(23),
  },
  face: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  back: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  imgStyle: {
    height: windowHeight(140),
    width: windowHeight(140),
    resizeMode: 'contain',
  },
  rowStyle: {
    flexDirection: 'row',
    marginTop: '47%',
    marginHorizontal: 10,
  },
  VerticalLineView: {
    ...external.fd_row,
    ...external.ai_center,

    ...external.mh_15,
  },
  imageBg: {
    bottom: 0,
    height: '77%',
  },
  navigationBtnView: {
    ...external.mh_20,
    ...external.mb_20,
    bottom: '10%',
  },
  smallLogo: {
    width: 95,
    height: 45,
    marginBottom: '5%',
    marginTop: '6%',
    alignSelf: 'center',
  },
});
export {styles};
