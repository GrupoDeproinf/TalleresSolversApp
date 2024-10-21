import {Image, ImageBackground} from 'react-native';
import React, {useEffect, useState} from 'react';
import images from '../../utils/images';
import styles from './style.css';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        } else {
          try {
            // Hacer la solicitud POST
            const response = await fetch('http://desarrollo-test.com/api/usuarios/getUserByUid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({uid:user.uid}), // Convertir los datos a JSON
            });
      
            // Verificar la respuesta del servidor
            if (response.ok) {
              const result = await response.json();
              console.clear()
              console.log("Este es el usuario encontrado", result); // Aquí puedes manejar la respuesta
    
              if (result.message == "Usuario encontrado"){
                try {
                  const jsonValue = JSON.stringify(result.userData);
                  console.log(jsonValue);
                  await AsyncStorage.setItem('@userInfo', jsonValue);
  
                  goToProfile(result.userData.typeUser, result.userData.status)
  
                } catch (e) {
                  console.log(e);
                }
                navigation.navigate('LoaderScreen');
              } else {
  
                // showToast('No se ha encontrado el usuario, por favor validar formulario');
                navigation.replace('Login');
              }
            } else {
              console.error('Error en la solicitud:', response.statusText);
              navigation.replace('Login');
            }
          } catch (error) {
            console.error('Error en la solicitud:', error);
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
