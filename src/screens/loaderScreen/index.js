import { Image, ImageBackground, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '../../utils/images';
import styles from './style.css';
import { useValues } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import { sanitizeUserInfo } from '../../utils/sanitizeUserInfo';

const LoaderScreen = ({ navigation }) => {

  const [ValidTaller, setValidTaller] = useState(false);

  useEffect(() => {
    getData()
  }, []);


  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      console.log("Userrrr", user)

      if (user) {
        // navigation.replace('DrawerScreen');

        if (user.typeUser == "Admin") {
          goToProfile(user.typeUser, '')
        } else if (user.typeUser == "Certificador") {
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
                const jsonValue = JSON.stringify(sanitizeUserInfo(result.userData));
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
            // Solo se pide iniciar sesión si la cuenta ya no existe (404).
            // Sin señal o con el servidor caído se entra con lo guardado en
            // el teléfono: antes se mandaba al login a quien ya tenía sesión.
            const status = error?.response?.status;
            if (status === 404 || status === 401 || !user?.typeUser) {
              navigation.replace('Login');
            } else {
              goToProfile(user.typeUser, user.status);
            }
          }

        }
      } else {
        navigation.replace('Login');
      }

    } catch (e) {
      // Datos guardados ilegibles: se pide iniciar sesión en vez de quedarse
      // en la pantalla de carga para siempre.
      await AsyncStorage.removeItem('@userInfo').catch(() => {});
      navigation.replace('Login');
    }
  };



  // Navega sin esperas artificiales y siempre tiene una salida: un tipo de
  // cuenta desconocido o vacío ya no deja la pantalla de carga para siempre.
  const goToProfile = (typeUser, status) => {
    switch (typeUser) {
      case 'Cliente':
      case 'Admin':
        navigation.replace('DrawerScreen');
        break;
      case 'Taller':
        navigation.replace(status === 'Pendiente' ? 'TallerProfileScreen' : 'DrawerScreen');
        break;
      case 'Certificador':
        navigation.replace('TalleresContainer');
        break;
      default:
        AsyncStorage.removeItem('@userInfo')
          .catch(() => {})
          .finally(() => navigation.replace('Login'));
    }
  };


  const { isDark } = useValues();
  const imageBg = isDark ? images.loaderBgDark : images.loaderBg;
  const loader = isDark ? images.loading : images.loading;
  return (
    <ImageBackground
      style={[styles.container, { width: '100%' }]} // Agregando más ancho al contenedor
      source={imageBg}
    >
      <Image
        style={isDark ? styles.imgStyleDark : styles.imgStyleload}
        source={loader}
      />
    </ImageBackground>
  );
};

export default LoaderScreen;
