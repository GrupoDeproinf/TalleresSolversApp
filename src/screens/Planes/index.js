import {ScrollView, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import FullHeader from '../../commonComponents/fullHeader';
import {commonStyles} from '../../style/commonStyle.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';
import {useValues} from '../../../App';
import {textColorStyle} from '../../style/darkStyle';
import styles from './style.css';

const PlanesContainer = () => {
  const {bgFullStyle, t} = useValues();
  const [dataTalleres, setDataTalleres] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getData();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigation]);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log('User info:', user);

      try {
        // const response = await api.get('/usuarios/getTalleres', {
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        // });

        // if (response.status === 200) {
        //   const result = response.data;
        //   setDataTalleres(result); // Actualiza el estado con los datos
        // } else {
        //   setDataTalleres([]);
        // }
      } catch (error) {
        // setDataTalleres([]);
        // console.error('Error en la solicitud:', error.response?.data || error.message);
      }
    } catch (e) {
      setDataTalleres([]);
      console.log(e);
    }
  };

  return (
    <View style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <Text style={[styles.headerText, {color: textColorStyle}]}>Planes Disponibles</Text>
      
      <ScrollView contentContainerStyle={styles.scrollView}>
        {dataTalleres.length > 0 ? (
          dataTalleres.map((taller, index) => (
            <TouchableOpacity
              key={index}
              style={styles.planCard}
              onPress={() => console.log('Seleccionaste:', taller.nombre)}>
              <Text style={[styles.planTitle, {color: textColorStyle}]}>
                {taller.nombre}
              </Text>
              <Text style={[styles.planDescription]}>
                {taller.descripcion || 'Descripción no disponible'}
              </Text>
              <Text style={styles.planPrice}>Precio: {taller.precio} USD</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.noDataText, {color: textColorStyle}]}>
            No hay planes disponibles
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default PlanesContainer;