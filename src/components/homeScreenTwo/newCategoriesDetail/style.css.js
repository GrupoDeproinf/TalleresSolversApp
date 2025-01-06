import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';
import {windowHeight, windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
const styles = StyleSheet.create({
  plusICon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: windowHeight(80),
    right: windowHeight(10),
  },
  imgContainer: {
    backgroundColor: appColors.bgLayout,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: windowHeight(14),
    marginHorizontal: windowHeight(10),
    marginTop: windowHeight(8),
    borderRadius: windowHeight(7),
    paddingVertical: windowHeight(14),
  },
  img: {
    resizeMode: 'contain',
    height: windowHeight(62),
    width: windowWidth(140),
  },
  viewContainer: {
    marginHorizontal: windowHeight(6),
    borderRadius: 10,
    borderColor: appColors.bgLayout,
    marginBottom: windowHeight(8),
    padding: 1,
    shadowColor: appColors.shadowColor,
    overflow: 'hidden',
    elevation: 1.5,
    margin: 1,
  },
  ratingContainer: {
    ...commonStyles.titleText19,
    ...external.pt_5,
    ...external.mh_2,
    color: '#FB9927',
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',

    shadowColor: appColors.shadowColor,
  },
});

export default styles;
