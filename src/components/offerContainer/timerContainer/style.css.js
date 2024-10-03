import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appFonts from '../../../themes/appFonts';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAEEFB',
    borderRadius: windowHeight(13),
    marginTop: windowHeight(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: windowHeight(10),
    paddingVertical: windowHeight(13),
  },
  buyText: {
    width: windowWidth(190),
    fontFamily: appFonts.sofiasansMedium,
    fontSize: fontSizes.FONT20,
    color: appColors.titleText,
    marginVertical: windowHeight(4),
    lineHeight: windowHeight(15),
  },
  timer: {
    backgroundColor: '#051E47',
    height: windowHeight(32),
    width: windowWidth(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: windowHeight(6),
  },
});

export default styles;
