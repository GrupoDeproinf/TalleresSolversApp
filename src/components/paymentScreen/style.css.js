import {StyleSheet} from 'react-native';
import {fontSizes, windowHeight, windowWidth} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import appFonts from '../../themes/appFonts';
import {commonStyles} from '../../style/commonStyle.css';
const styles = StyleSheet.create({
  container: {
    marginVertical: windowHeight(8),
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: 'gray',
    padding: 1,
  },
  img: {
    width: windowWidth(54),
    height: windowHeight(35),
    resizeMode: 'contain',
  },
  titleText: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT17,
    lineHeight: 22,
    fontFamily: appFonts.semiBold,
  },
  menuItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    padding: windowHeight(10),
  },
});

export default styles;
