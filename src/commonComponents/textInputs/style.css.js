import {StyleSheet} from 'react-native';
import appColors from '../../themes/appColors';
import {windowHeight} from '../../themes/appConstant';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
  textInputView: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginTop: windowHeight(6),
    borderRadius: windowHeight(5),
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 0.5,
  },
  textInput: {
    paddingHorizontal: windowHeight(10),
    color: appColors.titleText,
  },
  withoutShow: {
    height: windowHeight(40),
    marginTop: windowHeight(4),
    borderRadius: windowHeight(5),
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default styles;
