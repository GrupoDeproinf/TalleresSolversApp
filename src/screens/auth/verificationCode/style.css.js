import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  singUpView: {
    flexDirection: 'row',
    marginTop: windowHeight(24),
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  otpTextInput: {
    backgroundColor: appColors.screenBg,
    borderColor: '#2D32611A',
    borderWidth: 0.5,
    borderRadius: 6,
    width: windowWidth(70),
    height: windowHeight(38),
    borderBottomWidth: 0.5,
    color: appColors.blackBg,
    textAlign: 'center',
    fontSize: fontSizes.FONT22,
  },
  viewOtp: {
    marginTop: windowHeight(25),
    width: '21%',
  },
});

export default styles;
