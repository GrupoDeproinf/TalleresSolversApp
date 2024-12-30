import {ScrollView, View, Text} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import HeaderContainer from '../../components/homeScreen/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import BannerContainer from '../../components/homeScreen/bannerContainer';
import NewArrivalContainer from '../../components/homeScreen/newArrivalContainer';
import styles from './style.css';
import {newArrivalSmallData} from '../../data/homeScreen/newArrivalData';
import {external} from '../../style/external.css';
import {useValues} from '../../../App';
import ProductSwiper from '../../components/homeScreen/productSwiper';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowProductsContainer from '../../components/homeScreen/showProducts';

const HomeScreen = () => {
  const {bgFullStyle, t} = useValues();
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [dataByCategory, setDataByCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const getData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log('User info:', user);

      const response = await api.get('/home/getServices');

      console.log('API response:', response);

      if (response.status === 200) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  }, []);

  const getDataByCategories = useCallback(async category => {
    try {
      const response = await api.post('/home/getProductsByCategory', {
        uid_categoria: category,
      });

      console.log('Category data response:', response);

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

  const returnValues = useCallback(
    category => {
      console.log('Selected category:', category);
      if (category === 'Todos') {
        setDataByCategory(null);
        setSelectedCategory(null);
      } else {
        getDataByCategories(category);
      }
    },
    [getDataByCategories],
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const displayData =
    dataByCategory !== null
      ? dataByCategory.length > 0
        ? dataByCategory
        : data
      : data;
  const displayTitle = selectedCategory
    ? dataByCategory && dataByCategory.length > 0
      ? `Servicios seleccionados`
      : 'Servicios'
    : 'Servicios';

  return (
    <ScrollView
      contentContainerStyle={[external.Pb_80]}
      style={[styles.container, {backgroundColor: bgFullStyle}]}
      showsVerticalScrollIndicator={false}>
      <HeaderContainer onPress={() => navigation.openDrawer()} />
      {/* <SearchContainer show={true} /> */}
      <BannerContainer />

      <ProductSwiper returnValues={returnValues} />

      {selectedCategory && dataByCategory && dataByCategory.length === 0 && (
        <View style={{padding: 20, alignItems: 'center'}}>
          <Text style={{fontSize: 16, color: '#666'}}>
            No se encontraron servicios para la categoría seleccionada.
          </Text>
        </View>
      )}

      <ShowProductsContainer
        data={displayData}
        value={displayTitle}
        show={true}
        showPlus={true}
      />
      {/* <NewArrivalContainer
        data={newArrivalSmallData}
        value={t('transData.topRating')}
        show={true}
        showPlus={true}
      /> */}
    </ScrollView>
  );
};

export default HomeScreen;
