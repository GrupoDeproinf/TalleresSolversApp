import {ScrollView, Text, View, useFocusEffect} from 'react-native';
import React, { useEffect, useState } from 'react';
import FullHeader from '../../commonComponents/fullHeader';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import NewArrivalContainer from '../../components/homeScreen/newArrivalContainer';
import {newArrivalData} from '../../data/homeScreen/newArrivalData';
import styles from './style.css';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import api from '../../../axiosInstance';



const TalleresContainer = ({navigation}) => {

  const {bgFullStyle, t} = useValues();

  const [dataTalleres, setdataTalleres] = useState([]);

  const navigationScreen = useNavigation();

  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getData();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen]);

  const fetchData = () => {
    // Aquí va tu lógica para cargar datos
    console.log('Cargando datos...');
  };

  


  const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;

        console.log("Userrrr12344444", user)

        try {
          // Hacer la solicitud GET utilizando Axios
          const response = await api.get('/usuarios/getTalleres', {
              headers: {
                  'Content-Type': 'application/json',
              },
          });
      
          // Verificar la respuesta del servidor
          if (response.status === 200) {
              const result = response.data;
              console.log("usuarios de resultados", result); // Aquí puedes manejar la respuesta
      
              setdataTalleres(result);
          } else {
              setdataTalleres([]);
          }
      } catch (error) {
          setdataTalleres([]);
          if (error.response) {
              console.error('Error en la solicitud:', error.response.data.message || error.response.statusText);
          } else {
              console.error('Error en la solicitud:', error.message);
          }
      }
      

    } catch(e) {
        setdataTalleres([])
        console.log(e)
    }
};

  return (
    <View
    style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>

      <View style={[external.mh_20]}>
        <FullHeader
          showArrow={false}
          show={true}
          showClose={true}
          title="Talleres"
          text={
            <Text style={styles.container}>Filtrar</Text>
          }
          onpressBack={() => navigation.goBack('')}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_80]}>
        <NewArrivalContainer
          data={dataTalleres}
          show={false}
          showPlus={true}
        />
      </ScrollView>
    </View>
  );
};

export default TalleresContainer;
