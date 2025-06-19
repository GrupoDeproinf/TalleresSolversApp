import {FlatList, Image, Text, TouchableOpacity, View, TextInput} from 'react-native';
import React, {useEffect, useState} from 'react';
import styles from './style.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';
import {Search} from '../../../assets/icons/search';
import api from '../../../../axiosInstance';

const ProductContainer = () => {
  const {isDark, textColorStyle} = useValues();
  const navigation = useNavigation('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchText, setSearchText] = useState('');

  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;
        if (result) {
          setCategories(result.categories);
          setFilteredCategories(result.categories);
        } else {
          console.warn('La respuesta no contiene un array válido de categorías.');
          setCategories([]);
          setFilteredCategories([]);
        }
      } else {
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      setCategories([]);
      setFilteredCategories([]);
      if (error.response) {
        console.error('Error en la solicitud:', error.response.data?.message || error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleSearchChange = (text) => {
    setSearchText(text);
    const filtered = categories.filter(category =>
      category.nombre.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('CategoryDetail', {uid: item.id})}>
      <View style={styles.menuItemContent}>
        <Image
          style={styles.imgContainer}
          source={{uri: item.imageUrl}}
        />
      </View>
      <Text style={[styles.title, {color: textColorStyle}]}>
        {item.nombre}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#F8F9FA'}}>
      <View style={styles.searchContainer}>
        <Search />
        <TextInput
          placeholder="Filtrar por categoria"
          placeholderTextColor="#999"
          style={styles.searchInput}
          onChangeText={handleSearchChange}
          value={searchText}
        />
      </View>
      <FlatList
        key="single-column-list"
        numColumns={1}
        data={filteredCategories}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );
};

export default ProductContainer;
