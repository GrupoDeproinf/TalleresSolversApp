import {commonStyles} from '../../style/commonStyle.css';
import appColors from '../../themes/appColors';
import {windowHeight} from '../../themes/appConstant';
import appFonts from '../../themes/appFonts';

const {StyleSheet} = require('react-native');

const styles = StyleSheet.create({
  container: {
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(10),
    marginTop: windowHeight(10),
  },
  containerTwo: {
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(10),
  },
  subtitle: {
    ...commonStyles.subtitleText,
    color: appColors.titleText,
    fontFamily: appFonts.thin,
    marginTop: 10,
    lineHeight: 20,
  },
  img: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  commentCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  commentDateText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4CC',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  scoreChipText: {
    color: '#7A5A00',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2344',
  },
});
export {styles};
