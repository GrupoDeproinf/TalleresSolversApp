import {StyleSheet} from 'react-native';
import {fontSizes} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    backgroundColor: 'white',
    height: 280,
    width: '100%',
    elevation: 2,
  },
  title: {
    fontSize: fontSizes.FONT26,
    color: '#051E47',
    textAlign: 'center',
    marginTop: 30,
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  skipText: {
    fontSize: fontSizes.FONT22,
    right: -50,
  },
  nextButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    color: appColors.screenBg,
    fontSize: fontSizes.FONT20,
    marginHorizontal: 5,
  },
  dotStyle: {
    backgroundColor: '#D2D8FC',
    width: 12,
    height: 4,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
    bottom: '80%',
  },
  activeDotStyle: {
    backgroundColor: '#4D66FF',
    width: 12,
    height: 4,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
    bottom: '80%',
  },
  imgContainer: {
    height: 151,
    width: 105,
    marginTop: '20%',
  },
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgSourceContainer: {
    height: 198,
    width: 198,
    marginTop: '20%',
  },
});

export default styles;
