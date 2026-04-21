import {StyleSheet} from 'react-native';
const styles = StyleSheet.create({
  paymentCard: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: '#1F2344',
    borderRadius: 20,
    padding: 16,
  },
  textTitle: {
    color: '#FFD60A',
    fontWeight: '800',
    fontSize: 21,
    marginBottom: 14,
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2E56',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  deliveryIn: {
    marginTop: 7,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
