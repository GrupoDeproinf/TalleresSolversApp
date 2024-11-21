import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import {commonStyles} from '../../../style/commonStyle.css';
const styles = StyleSheet.create({
  contianer: {
    borderRadius: 10,
    marginTop: windowHeight(10),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '99.5%',
    padding: 1,
    elevation: 1,
    margin: 1,
  },
  grayBoxContainer: {
    width: windowWidth(108),
    height: windowHeight(70),
    backgroundColor: appColors.bgLayer,
    borderRadius: windowHeight(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderContainer: {
    backgroundColor: '#2D3261',
    top: windowHeight(15),
    height: windowHeight(36),
    // alignItems: 'center',
    // justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius:10,
    marginHorizontal: 2,
    width:80
  },
  img: {
    width: windowWidth(75),
    height: windowHeight(46),
    resizeMode: 'contain',
  },
  titleContainer: {
    ...commonStyles.subtitleText,
    color: appColors.titleText,
    width: '45%',
    fontSize: fontSizes.FONT19,
    flexGrow: 0.54,
  },
  deliveryContainer: {
    ...commonStyles.subtitleText,
    color: appColors.titleText,
    width: '57%',
  },
  buyAgain: {
    ...commonStyles.titleText19,
    paddingHorizontal: windowHeight(5),
    color: 'white',
    fontSize: fontSizes.FONT14,
  },
  menuItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: windowHeight(9),
    paddingHorizontal: windowHeight(9),
    borderRadius: windowHeight(9),
  },
});

export default styles;
