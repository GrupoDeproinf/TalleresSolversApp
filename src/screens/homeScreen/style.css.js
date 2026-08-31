import {StyleSheet} from 'react-native';
import {windowHeight, windowWidth} from '../../themes/appConstant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingBottom: windowHeight(14),
    paddingTop: windowHeight(24),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: -20,
    marginBottom: -5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#2D3261',
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    shadowColor: '#1F2344',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarFocused: {
    shadowOpacity: 0.14,
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginLeft: 6,
  },
  searchClearText: {
    color: '#9BA6B8',
    fontSize: 13,
    paddingHorizontal: 2,
  },
});

export default styles;
