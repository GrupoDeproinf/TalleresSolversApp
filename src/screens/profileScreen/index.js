import { Image, Pressable, Text, View, ImageBackground, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { external } from '../../style/external.css';
import { commonStyles } from '../../style/commonStyle.css';
import images from '../../utils/images';
import { profileData, profileDataAdmin } from '../../data/profileData';
import { RightArrow } from '../../assets/icons/rightArrow';
import styles from './style.css';
import { useNavigation } from '@react-navigation/native';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../themes/appColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

import notImageFound from '../../assets/noimageold.jpeg';
import api from '../../../axiosInstance';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [infoUser, setinfoUser] = useState(
    {
      uid: "",
      nombre: "",
      cedula: "",
      phone: "",
      typeUser: ""
    }
  );

  const [imagePerfil, setimagePerfil] = useState("");

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  const navigationScreen = useNavigation();

  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getData();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen]);



  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("valor del storage", user);

      try {
        // Hacer la solicitud POST utilizando Axios
        const response = await api.post('/usuarios/getUserByUid', {
          uid: user.uid,
        });

        // Verificar la respuesta del servidor
        if (response.status === 200) {
          const result = response.data;


          console.log("result.userData", result.userData)

          setinfoUser(result.userData)

          setimagePerfil(result.userData.image_perfil);
        } else {
          console.error('Error en la solicitud:', response.statusText);
        }
      } catch (error) {
        if (error.response) {
          console.error(
            'Error en la solicitud:',
            error.response.data.message || error.response.statusText,
          );
        } else {
          console.error('Error en la solicitud:', error.message);
        }
      }

    } catch (e) {
      // error reading value
      console.log(e)
    }
  };

  const {
    textColorStyle,
    linearColorStyle,
    bgFullStyle,
    isDark,
    viewRTLStyle,
    textRTLStyle,
    imageRTLStyle,
    t,
  } = useValues();

  const colors = isDark
    ? ['#43454A', '#24262C']
    : [appColors.screenBg, appColors.screenBg];


  const removePropertyFromStorage = async (propertyName) => {
    try {
      await AsyncStorage.removeItem('@userInfo');
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <View style={[styles.viewContainer, { backgroundColor: bgFullStyle }]}>
      <Text
        style={[
          external.ti_center,
          commonStyles.hederH2,
          { color: textColorStyle },
        ]}>
        Mi Perfil
      </Text>
      <View style={[external.as_center, { marginTop: 10 }]}>

        {imagePerfil == null || imagePerfil == "" ? (
          <Image
            resizeMode="contain"
            style={styles.imgStyle}
            source={notImageFound} // Reemplaza esto con la variable que contiene tu imagen
          />

        ) : (
          <ImageBackground
            resizeMode="contain"
            style={[styles.imgStyle, { height: 150, width: 150 }]} // Ajusta los valores según tus necesidades
            source={{ uri: imagePerfil }} // Cambia esto a tu enlace de imagen
          >
          </ImageBackground>
        )}
        <Text style={[styles.nameText, { color: textColorStyle }]}>
          {infoUser.nombre}
        </Text>
        <Text style={[commonStyles.subtitleText, external.ti_center]}>
          {infoUser.email}
        </Text>
      </View>
      <View style={[external.mt_10]}>
        {
          infoUser.typeUser != "Taller" && infoUser.typeUser != "Cliente" ? (
            profileDataAdmin.map((item, index) => (
              <Pressable
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  if (item.id === 6) {
                    removePropertyFromStorage();
                    handleLogout();
                  } else {
                    if (infoUser.typeUser == "Taller") {
                      if (item.screenName == "EditProfile") {
                        console.log("aquiii");
                        navigation.navigate('TallerEditProfileScreen');
                      } else {
                        navigation.navigate(item.screenName);
                      }
                    } else {
                      navigation.navigate(item.screenName);
                    }
                  }
                }}>
                <LinearGradient
                  start={{ x: 0.0, y: 0.0 }}
                  end={{ x: 0.0, y: 1.0 }}
                  colors={colors}
                  style={styles.container}>
                  <LinearGradient
                    start={{ x: 0.0, y: 0.0 }}
                    end={{ x: 0.0, y: 1.0 }}
                    colors={linearColorStyle}
                    style={styles.menuItemContent}>
                    <View
                      style={[
                        external.fd_row,
                        external.ai_center,
                        { flexDirection: viewRTLStyle },
                      ]}>
                      {item.icon}
                      <View style={{ width: '86%' }}>
                        <Text
                          style={[
                            styles.titleText,
                            { color: textColorStyle },
                            { textAlign: textRTLStyle },
                          ]}>
                          {t(item.title)}
                        </Text>
                      </View>
                      <View style={{ transform: [{ scale: imageRTLStyle }] }}>
                        <RightArrow />
                      </View>
                    </View>
                  </LinearGradient>
                </LinearGradient>
              </Pressable>
            ))
          ) : null
        }


{
  infoUser.typeUser != "Taller" && infoUser.typeUser != "Cliente" ? (
    profileDataAdmin
      .filter(item => item.id !== 3 || infoUser.typeUser === "Taller") // Filtrar si el ID es 3 y el usuario no es Taller
      .map((item, index) => (
        <Pressable
          key={index}
          activeOpacity={0.9}
          onPress={() => {
            if (item.id === 6) {
              removePropertyFromStorage();
              handleLogout();
            } else {
              if (infoUser.typeUser == "Taller") {
                if (item.screenName == "EditProfile") {
                  console.log("aquiii");
                  navigation.navigate('TallerEditProfileScreen');
                } else {
                  navigation.navigate(item.screenName);
                }
              } else {
                navigation.navigate(item.screenName);
              }
            }
          }}>
          <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
            colors={colors}
            style={styles.container}>
            <LinearGradient
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.0, y: 1.0 }}
              colors={linearColorStyle}
              style={styles.menuItemContent}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  { flexDirection: viewRTLStyle },
                ]}>
                {item.icon}
                <View style={{ width: '86%' }}>
                  <Text
                    style={[
                      styles.titleText,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    {t(item.title)}
                  </Text>
                </View>
                <View style={{ transform: [{ scale: imageRTLStyle }] }}>
                  <RightArrow />
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>
        </Pressable>
      ))
  ) : null
}

{
  infoUser.typeUser == "Taller" || infoUser.typeUser == "Cliente" ? (
    profileData
      .filter(item => item.id !== 3 || infoUser.typeUser === "Taller") // Filtrar si el ID es 3 y el usuario no es Taller
      .map((item, index) => (
        <Pressable
          key={index}
          activeOpacity={0.9}
          onPress={() => {
            if (item.id === 6) {
              removePropertyFromStorage();
              handleLogout();
            } else {
              if (infoUser.typeUser == "Taller") {
                if (item.screenName == "EditProfile") {
                  console.log("aquiii");
                  navigation.navigate('TallerEditProfileScreen');
                } else {
                  navigation.navigate(item.screenName);
                }
              } else {
                navigation.navigate(item.screenName);
              }
            }

            if (item.id === 7) {
              Linking.openURL(item.screenName);
            }
          }}>
          <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
            colors={colors}
            style={styles.container}>
            <LinearGradient
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.0, y: 1.0 }}
              colors={linearColorStyle}
              style={styles.menuItemContent}>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  { flexDirection: viewRTLStyle },
                ]}>
                {item.icon}
                <View style={{ width: '86%' }}>
                  <Text
                    style={[
                      styles.titleText,
                      { color: textColorStyle },
                      { textAlign: textRTLStyle },
                    ]}>
                    {t(item.title)}
                  </Text>
                </View>
                <View style={{ transform: [{ scale: imageRTLStyle }] }}>
                  <RightArrow />
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>
        </Pressable>
      ))
  ) : null
}

      </View>
    </View>
  );
};

export default ProfileScreen;
