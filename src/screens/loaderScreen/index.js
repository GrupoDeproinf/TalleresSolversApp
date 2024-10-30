import {Image, ImageBackground} from 'react-native';
import React, {useEffect, useState} from 'react';
import images from '../../utils/images';
import styles from './style.css';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance'; 

const LoaderScreen = ({navigation}) => {

  const [ValidTaller, setValidTaller] = useState(false);

  useEffect(() => {
    getData()
  }, []);


  const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;

        console.log("Userrrr", user)

        if (user.typeUser == "Admin"){
          goToProfile(user.typeUser, '')
        } else if (user.typeUser == "Certificador"){
          goToProfile(user.typeUser, '')
        } 
        else {
          try {
            // Hacer la solicitud POST utilizando Axios
            const response = await api.post('/usuarios/getUserByUid', {
              uid: user.uid,
            });
          
            // Verificar la respuesta del servidor
            const result = response.data;
            console.log("Este es el usuario encontrado", result);
          
            if (result.message === "Usuario encontrado") {
              try {
                const jsonValue = JSON.stringify(result.userData);
                console.log(jsonValue);
                await AsyncStorage.setItem('@userInfo', jsonValue);
          
                goToProfile(result.userData.typeUser, result.userData.status);
              } catch (e) {
                console.error(e);
                navigation.navigate('LoaderScreen');
              }
            } else {
              navigation.replace('Login');
            }
          } catch (error) {
            // Manejo de errores
            if (error.response) {
              console.error('Error en la solicitud:', error.response.statusText);
            } else {
              console.error('Error en la solicitud:', error.message);
            }
            navigation.replace('Login');
          }
          
        }


    } catch(e) {
        // error reading value
        console.log(e)
    }
};



const goToProfile = (typeUser, status) => {
  if(typeUser == "Cliente"){
    console.log("**************************************")
    console.log("Es Cliente")
    console.log("*************************************")
    const timer = setTimeout(() => {
      navigation.replace('DrawerScreen');
    }, 1000);
    return () => clearTimeout(timer);

  } else if (typeUser == "Taller") {
    console.log("**************************************")
    console.log("Es Taller")
    console.log("*************************************")
    if (status == 'Pendiente' || status == 'En espera por aprobación'){
      const timer = setTimeout(() => {
        navigation.replace('TallerProfileScreen');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        navigation.replace('DrawerScreen');
      }, 1000);
      return () => clearTimeout(timer);
    }
  } else if(typeUser == "Admin"){
    console.log("**************************************")
    console.log("Es Admin")
    console.log("*************************************")
    const timer = setTimeout(() => {
      navigation.replace('DrawerScreen');
    }, 1000);
    return () => clearTimeout(timer);

  } else if(typeUser == "Certificador"){
    console.log("**************************************")
    console.log("Es Certificador")
    console.log("*************************************")
    const timer = setTimeout(() => {
      navigation.replace('TalleresContainer');
    }, 1000);
    return () => clearTimeout(timer);

  }
}


  const {isDark} = useValues();
  const imageBg = isDark ? images.loaderBgDark : images.loaderBg;
  const loader = isDark ? images.loading : images.loaderGIF;
  return (
    <ImageBackground style={styles.container} source={imageBg}>
      <Image
        style={isDark ? styles.imgStyleDark : styles.imgStyle}
        source={loader}
      />
    </ImageBackground>
  );
};

export default LoaderScreen;
