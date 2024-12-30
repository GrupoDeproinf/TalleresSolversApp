import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import SolidLine from '../../../commonComponents/solidLine';
import {commonStyles} from '../../../style/commonStyle.css';
import {homeProductData} from '../../../data/homeProductData';
import {external} from '../../../style/external.css';
import styles from './style';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';

const ProductSwiper = () => {
  const [selectedItem, setSelectedItem] = useState(0);
  const {isRTL, t} = useValues();
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

        if (Array.isArray(result.categories)) {
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
      style={[
        styles.container,
        item.id === selectedItem ? styles.selectedMenuItem : null,
      ]}
      onPress={() => setSelectedItem(item.id)}>
      <Text
        style={[
          commonStyles.subtitleText,
          item.id === selectedItem ? styles.selectedMenuItemText : null,
        ]}>
        {t(item.nombre)}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={[external.mh_20, external.mt_15]}>
      <SolidLine />
      <FlatList
        renderItem={renderItem}
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        inverted={isRTL ? true : false}
      />
      <SolidLine />
    </View>
  );
};

export default ProductSwiper;
