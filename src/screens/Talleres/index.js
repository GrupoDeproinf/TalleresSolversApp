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
          // Hacer la solicitud POST
          const response = await fetch('http://desarrollo-test.com/api/usuarios/getTalleres', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify({uid:user.uid}), // Convertir los datos a JSON
          });
    
          // Verificar la respuesta del servidor
          if (response.ok) {
            const result = await response.json();
            console.log("usuarios de resultados21234565156", result); // Aquí puedes manejar la respuesta
            
            setdataTalleres(result)

            // if (result.message == "Usuario encontrado"){
            //   try {
            //     const jsonValue = JSON.stringify(result.userData);
            //     console.log(jsonValue);
            //     await AsyncStorage.setItem('@userInfo', jsonValue);

            //     goToProfile(result.userData.typeUser, result.userData.status)

            //   } catch (e) {
            //     console.log(e);
            //   }
            //   navigation.navigate('LoaderScreen');
            // } else {

            //   // showToast('No se ha encontrado el usuario, por favor validar formulario');
            //   navigation.replace('Login');
            // }
          } else {

            setdataTalleres([])
            // console.error('Error en la solicitud:', response.statusText);
            // navigation.replace('Login');
          }
        } catch (error) {
            setdataTalleres([])
        //   console.error('Error en la solicitud:', error);
        //   navigation.replace('Login');
        }

    } catch(e) {
        // error reading value
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
