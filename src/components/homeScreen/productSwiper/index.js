import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import SolidLine from '../../../commonComponents/solidLine';
import {commonStyles} from '../../../style/commonStyle.css';
import {homeProductData} from '../../../data/homeProductData';
import {external} from '../../../style/external.css';
import styles from './style';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';

const ProductSwiper = ({returnValues}) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const {isRTL, t} = useValues();
  const [categories, setCategories] = useState('');

  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;

        if (Array.isArray(result.categories)) {
          setCategories(result.categories);
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
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
      onPress={() => {
        setSelectedItem(item.id);
        returnValues(item.id); // Ahora sí funcionará correctamente
      }}>
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
