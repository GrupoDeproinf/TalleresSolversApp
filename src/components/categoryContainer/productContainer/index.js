import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {external} from '../../../style/external.css';
import {categoryData} from '../../../data/categoryData';
import styles from './style.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../../themes/appColors';
import api from '../../../../axiosInstance';
const ProductContainer = () => {
  const {isDark, textColorStyle, linearColorStyle, t} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const navigation = useNavigation('');
  const [categories, setCategories] = useState('');

  const getCategories = async () => {
    try {
      // Realizar la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar que la respuesta del servidor sea exitosa
      if (response.status === 200) {
        const result = response.data;

        console.log(
          '=================================================================================',
        );
        console.log('response.data', result);
        console.log(
          '=================================================================================',
        );

        if (result) {
          setCategories(result.categories);
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
        }
      } else {
        // Respuesta inesperada, establecer un array vacío
        setCategories([]);
      }
    } catch (error) {
      // Manejar errores en la solicitud
      setCategories([]);
      if (error.response) {
        console.error(
          'Error en la solicitud:',
          error.response.data?.message || error.response.statusText,
        );
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  useEffect(() => {
    getCategories();
  }, []);
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CategoryDetail', {uid: item.id})
      }>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
          {shadowColor: appColors.shadowColor, borderradius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <Image
            style={styles.imgContainer}
            source={{uri: item.imageUrl}} // Asegúrate de envolver imageUrl en un objeto con 'uri'
          />
        </LinearGradient>
      </LinearGradient>
      <Text style={[styles.title, {color: textColorStyle}]}>
        {t(item.nombre)}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View>
      <FlatList
        numColumns={4}
        data={categories}
        renderItem={renderItem}
        contentContainerStyle={[external.mt_10, external.mh_20]}
      />
    </View>
  );
};

export default ProductContainer;
