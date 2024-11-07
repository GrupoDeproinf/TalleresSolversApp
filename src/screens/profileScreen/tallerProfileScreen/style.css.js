
import {StyleSheet} from 'react-native';
import {external} from '../../../style/external.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import {commonStyles} from '../../../style/commonStyle.css';


const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
  container: {
    ...external.fd_row,
    ...external.pt_10,
    ...external.as_center,
  },
  flexView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: windowHeight(14),
  },
  imgStyle1: {
    width: windowWidth(330),
    height: windowHeight(220),
    alignSelf: 'center',
  },
  bagIsEmptyText: {
    ...commonStyles.titleText19,
    ...external.ti_center,
    fontSize: fontSizes.FONT23,
  },
  bagisEmptySomething: {
    ...commonStyles.subtitleText,
    ...external.ti_center,
    ...external.mt_3,
    ...external.mb_20,
    fontSize: fontSizes.FONT19,
    marginTop:20
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
});

export default styles;

