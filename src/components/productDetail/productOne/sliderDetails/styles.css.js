import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../themes/appConstant';

export const sliderStyles = StyleSheet.create({
  container: {
    marginTop:60,
    backgroundColor: '#FFFFFF', // Fondo limpio y moderno
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Efecto de sombra en Android
  },
  productImage: {
    alignSelf: 'center',
    height: windowHeight(200), // Tamaño más destacado
    width: windowHeight(200),
    resizeMode: 'contain',
    marginVertical: 16, // Espaciado con las miniaturas
  },
  sliderItemSelected: {
    backgroundColor: '#E3E6EB', // Fondo gris claro para destacar selección
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3B82F6', // Borde azul para destacar la imagen seleccionada
    marginHorizontal: 5,
    elevation: 3,
  },
  sliderItemUnselected: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5FB', // Fondo gris claro
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 1,
  },
  sliderImage: {
    height: 45, // Ajustado para mejor escala en miniaturas
    width: 45,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  sliderImageSelected: {
    opacity: 1, // Imagen completamente visible cuando está seleccionada
  },
  sliderImageUnselected: {
    opacity: 0.7, // Imagen atenuada cuando no está seleccionada
  },
  itemSeparator: {
    width: 10, // Separación más estrecha para un diseño compacto
  },
});
