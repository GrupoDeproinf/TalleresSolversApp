import {ScrollView, View, Text, TextInput} from 'react-native';
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
// import Search from '../../components/icons/Search';
import {Search} from '../../assets/icons/search';
import {commonStyles, textRTLStyle} from '../../../src/style/commonStyle.css';
import appColors from '../../../src/themes/appColors';


const HomeScreen = () => {
  const {bgFullStyle, t} = useValues();
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [dataByCategory, setDataByCategory] = useState(null);
  const [dataByCategoryOriginal, setdataByCategoryOriginal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [originalCategory, setoriginalCategory] = useState([]);

  const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n');
  };  

  const handleSearchChange = (text) => {
    const normalizedText = normalizeString(text);
    setSearchText(text);
    if (normalizedText === '') {
      setData(originalData);
      getCategories()
    } else {
      const filteredData = originalData.filter(item => 
        normalizeString(item?.nombre_servicio || '').includes(normalizedText) ||
        normalizeString(item?.categoria || '').includes(normalizedText) ||
        normalizeString(item?.taller?.nombre || '').includes(normalizedText) ||
        normalizeString(item?.taller?.estado || '').includes(normalizedText)
      );
      setData(filteredData);

      // ahora es filtrada

      if(dataByCategoryOriginal != undefined && dataByCategoryOriginal != ''){ 
        const filteredDataFiltered = dataByCategoryOriginal.filter(item => 
          normalizeString(item?.nombre_servicio || '').includes(normalizedText) ||
          normalizeString(item?.categoria || '').includes(normalizedText) ||
          normalizeString(item?.taller?.nombre || '').includes(normalizedText) ||
          normalizeString(item?.taller?.estado || '').includes(normalizedText)
        );
        setDataByCategory(filteredDataFiltered);
      }


      updateCategories(filteredData);
    }
  };

  const updateCategories = (data) => {
    const uniqueCategories = [...new Set(data.map(item => item.categoria))];
    const updatedCategories = originalCategory.filter(category => 
      category.id === 'Todos' || uniqueCategories.includes(category.nombre)
    );
    setCategories(updatedCategories);
  };

  const getData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      // console.log('User info:', user);

      const response = await api.get('/home/getServices');

      console.log('API response:', response);

      if (response.status === 200) {
        setData(response.data);
        setOriginalData(response.data);
      } else {
        setData([]);
        setOriginalData([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setOriginalData([]);
      setCategories([]);
    }
  }, []);

  const getDataByCategories = useCallback(async category => {
    try {
      const response = await api.post('/home/getProductsByCategory', {
        uid_categoria: category,
      });

      // console.log('Category data response:', response);

      if (response.status === 200) {
        setDataByCategory(response.data);
        setdataByCategoryOriginal(response.data);
      } else {
        setDataByCategory([]);
        setdataByCategoryOriginal([]);
      }
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setDataByCategory([]);
      setdataByCategoryOriginal([]);
      setSelectedCategory(category);
    }
  }, []);

  const returnValues = useCallback(
    category => {
      console.log('Selected category:', category);


      if (category === 'Todos') {
        setDataByCategory(null);
        setSelectedCategory(null);
        getData();
      } else {
        getDataByCategories(category);
      }
    },
    [getDataByCategories],
  );

  useEffect(() => {
    getData();
    getCategories()
  }, [getData]);


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
          console.log('Categories:', result.categories);
          result.categories.unshift({id: 'Todos', nombre: 'Todos'});
          setCategories(result.categories);
          setoriginalCategory(result.categories)
        } else {
          console.warn(
            'La respuesta no contiene un array válido de categorías.',
          );
          setCategories([]);
          setoriginalCategory([])
        }
      } else {
        setCategories([]);
        setoriginalCategory([])
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
      <HeaderContainer  />

      <View style={{flexDirection: 'row', alignItems: 'center', margin: 10, padding: 8, borderWidth: 1, borderColor: '#2D3261', borderRadius: 10}}>
        <Search />
        <TextInput
          placeholder="Filtrar por servicio, taller, estado y categoria"
          placeholderTextColor={appColors.subtitle}
          style={[
            external.ph_5,
            commonStyles.subtitleText,
            {textAlign: textRTLStyle, flex: 1}
          ]}
          onChangeText={handleSearchChange}
          value={searchText}
        />
      </View>

      <BannerContainer />

      <ProductSwiper returnValues={returnValues} categories={categories.length == 0 ? [] : categories}/>

      {displayData.length === 0 && (
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
