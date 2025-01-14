import {ScrollView, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import FullHeader from '../../../commonComponents/fullHeader';
import {external} from '../../../style/external.css';
import {Notification} from '../../../utils/icon';
import SearchContainer from '../../../components/homeScreen/searchContainer';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {categoryDetailData} from '../../../data/homeScreenTwo/newArrivalData';
import SortContainer from '../../../components/categoryContainer/sortContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';
import NewCategoriesDetail from '../../../components/homeScreenTwo/newCategoriesDetail';
import { useRoute } from '@react-navigation/native';

const CategoryDetail = ({navigation}) => {
  const {linearColorStyle, isDark, bgFullStyle} = useValues();
  const [dataByCategory, setDataByCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState('');

  const route = useRoute();

  const {uid} = route.params;

  const getDataByCategories = useCallback(async category => {
    try {
      const response = await api.post('/home/getProductsByCategory', {
        uid_categoria: category,
      });

      console.log('Category data response:', response.data);

      if (response.status === 200) {
        setDataByCategory(response.data);
      } else {
        setDataByCategory([]);
      }
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setDataByCategory([]);
      setSelectedCategory(category);
    }
  }, []);

  const getCategoryById = async id => {
    try {
      // Validar que se pase un ID válido
      if (!id) {
        console.error('El ID proporcionado no es válido.');
        return;
      }

      // Realizar la solicitud GET utilizando Axios
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar que la respuesta del servidor sea exitosa
      if (response.status === 200) {
        const result = response.data;

        if (result.categories) {
          // Filtrar la categoría correspondiente al ID
          const filteredCategory = result.categories.find(
            category => category.id === id,
          );

          if (filteredCategory) {
            setCategories(filteredCategory); // Almacenar como un array con un solo elemento
          } else {
            console.warn(
              'No se encontró una categoría con el ID proporcionado.',
            );
            setCategories([]);
          }
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
    console.log('**************************************34')
    console.log('CategoryDetail useEffect:', uid);
    console.log('**************************************34')
    
    getDataByCategories(uid);
    getCategoryById(uid);
  }, []);

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <FullHeader
          value={''}
          title={categories?.nombre}
          onpressBack={() => navigation.goBack('')}
          
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_30]}>
        <SearchContainer />
        {/* <SortContainer /> */}
        <NewCategoriesDetail
          data={dataByCategory}
          horizontal={false}
          numColumns={2}
          width={windowWidth(210)}
        />
      </ScrollView>
    </View>
  );
};

export default CategoryDetail;
