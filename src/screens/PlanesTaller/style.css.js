import {StyleSheet} from 'react-native';
import appFonts from '../../themes/appFonts';
import { fontSizes, windowHeight, windowWidth } from '../../themes/appConstant';

const styles = StyleSheet.create({
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {

    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: '3%',
    borderColor: '#2D3261', borderWidth: 1,
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
    color: 'black'
  },
  planDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row', // Alinea elementos en una fila
    justifyContent: 'space-between', // Espaciado uniforme entre los elementos
    alignItems: 'center', // Alinea verticalmente
    marginTop: 5, // Espaciado opcional
  },
  
  planPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10, // Ajusta el margen si es necesario
  },
  
  datoSub: {
      fontWeight: '400',
      fontSize: fontSizes.FONT13,
      lineHeight: windowHeight(18),
      color: '#9BA6B8',
      fontFamily: appFonts.Regular,
    }, 
  planPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  aprobado: {
    width: windowWidth(90),
    backgroundColor: '#a5d6a7',
    color: '#1b5e20',
    borderRadius: windowHeight(3),
    padding: windowHeight(2),
    fontSize: 12,
    marginBottom: windowHeight(4),
    textAlign: 'center'
  },
  poraprobar: {
    width: windowWidth(90),
    backgroundColor: '#fff9c4',
    color: '#f57f17',
    borderRadius: windowHeight(3),
    padding: windowHeight(2),
    fontSize: 12,
    marginBottom: windowHeight(4),
    textAlign: 'center'
  },
  vencido: {
    width: windowWidth(90),
    backgroundColor: '#ffcdd2',
    color: '#c62828',
    borderRadius: windowHeight(3),
    padding: windowHeight(2),
    fontSize: 12,
    marginBottom: windowHeight(4),
    textAlign: 'center'
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default styles;
