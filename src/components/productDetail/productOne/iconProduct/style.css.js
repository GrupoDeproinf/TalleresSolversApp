import {StyleSheet} from 'react-native';
import {commonStyles} from '../../../../style/commonStyle.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../themes/appConstant';
import appColors from '../../../../themes/appColors';
import appFonts from '../../../../themes/appFonts';
import {external} from '../../../../style/external.css';
const styles = StyleSheet.create({
  textTitle: {
    color: '#263238',
    marginTop: windowHeight(10),
    marginBottom: windowHeight(0),
    // backgroundColor: 'red',
    fontWeight: '800',
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: windowHeight(10),
    borderRadius: windowHeight(7),
    marginBottom: windowHeight(10),
    backgroundColor: '#F8F8FF',
  },
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    borderRadius: windowHeight(8),
    elevation: 0.5,
    marginTop: windowHeight(10),
    padding: 1,
  },
  verticalLine: {
    height: '70%',
    width: 2,
    backgroundColor: appColors.subtitle,
  },
  deliveryIn: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: windowHeight(8),
    lineHeight: windowHeight(17),
  },

  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  viewContainer: {
    backgroundColor: '#2D3261',
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight(0),
    marginHorizontal: windowHeight(3),
    width: windowWidth(78),
    height: windowHeight(48),
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    width: '100%',
    flex: 1,
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
  },
});

export default styles;
