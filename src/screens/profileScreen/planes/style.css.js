import {StyleSheet} from 'react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';

const styles = StyleSheet.create({
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default styles;
