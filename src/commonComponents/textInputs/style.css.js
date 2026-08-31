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
    borderRadius: 14,
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
  },
  textInput: {
    paddingHorizontal: windowHeight(10),
    color: appColors.titleText,
  },
  withoutShow: {
    height: windowHeight(40),
    marginTop: windowHeight(4),
    borderRadius: 14,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  /** Campos planos (p. ej. Formulario servicio): mismo lenguaje que dropdowns */
  formCardFieldWrap: {
    marginTop: 14,
    width: '100%',
  },
  formCardLabelRow: {
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 8,
    rowGap: 4,
    marginBottom: 8,
  },
  formCardFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCardFieldLabelAlone: {
    marginBottom: 0,
    width: '100%',
  },
  formCardFieldLabelHint: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 16,
  },
  formCardFieldInner: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  formCardFieldInnerMultiline: {
    alignItems: 'stretch',
    minHeight: 140,
    paddingVertical: 10,
  },
  formCardIconWrap: {
    marginEnd: 10,
    justifyContent: 'center',
  },
  formCardTextInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 15,
    minHeight: 44,
  },
});

export default styles;
