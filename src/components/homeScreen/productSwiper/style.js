import {StyleSheet} from 'react-native';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#EEF2F7',
  },
  menuItemText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedMenuItemText: {
    color: '#FFD60A',
    fontSize: 13,
    fontWeight: '800',
  },

  selectedMenuItem: {
    backgroundColor: '#1F2344',
    borderRadius: 14,
  },
});

export default styles;
