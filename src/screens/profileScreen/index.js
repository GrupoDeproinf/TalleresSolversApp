import { Image, Pressable, Text, View, ImageBackground, Linking, Alert, ScrollView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { profileData, profileDataAdmin, profileDataTaller } from '../../data/profileData';
import styles from './style.css';
import { useNavigation } from '@react-navigation/native';
import { useValues } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import notImageFound from '../../assets/noimageold.jpeg';
import api from '../../../axiosInstance';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Icons2 from 'react-native-vector-icons/AntDesign';

const SOLVERS_WEB_SIGN_IN =
  'https://app.solversapp.com/sign-in?redirectUrl=/';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
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
    viewRTLStyle,
    textRTLStyle,
    imageRTLStyle,
    t,
  } = useValues();


  const removePropertyFromStorage = async (propertyName) => {
    try {
      await AsyncStorage.removeItem('@userInfo');
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleMainOptionPress = async (item) => {
    if (item.id === 2 && infoUser.typeUser === 'Taller') {
      try {
        await Linking.openURL(SOLVERS_WEB_SIGN_IN);
      } catch (e) {
        Alert.alert(
          'Solvers',
          'No se pudo abrir el enlace. Comprueba tu conexión e inténtalo de nuevo.',
        );
      }
      return;
    }

    if (item.id === 8) {
      Alert.alert(
        "Confirmación",
        "¿Estás seguro de que deseas eliminar tu cuenta?",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancelado"),
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              console.log("estoy en test");

              try {
                const jsonValue = await AsyncStorage.getItem('@userInfo');
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                console.log("valor del storage", user.uid);
                try {
                  const response = await api.post('/usuarios/deleteUserFromAuth', {
                    uid: user.uid,
                  });

                  const result = response.data;
                  console.log('esto es lo despues ', result);

                  removePropertyFromStorage();
                  handleLogout();

                } catch (error) {
                  if (error.response) {
                    console.log(error);
                  } else {
                    console.log("error mas abajo");
                  }
                }

              } catch (e) {
                console.log(e);
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
      return false;
    }

    if (item.id === 6) {
      removePropertyFromStorage();
      handleLogout();
    } else {
      if (infoUser.typeUser == "Taller") {
        if (item.screenName == "EditProfile") {
          console.log("aquiii");
          navigation.navigate('TallerEditProfileScreen');
          // navigation.navigate('EditProfile');
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
  };

  const handleAdminOptionPress = (item) => {
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
  };

  const renderMenuIcon = (item) => {
    let iconName = 'circle';

    if (item.id === 0) iconName = 'user-circle';
    else if (item.id === 2) iconName = 'heart';
    else if (item.id === 10) iconName = 'car-side';
    else if (item.id === 3) iconName = 'tags';
    else if (item.id === 5) iconName = 'key';
    else if (item.id === 7) iconName = 'life-ring';
    else if (item.id === 8) iconName = 'trash-alt';
    else if (item.id === 6) iconName = 'sign-out-alt';

    return <Icons name={iconName} size={18} color="#FFD60A" />;
  };

  const renderOptionCard = (item, index, onPressHandler) => (
    <Pressable
      key={index}
      onPress={() => onPressHandler(item)}
      style={({ pressed }) => [
        styles.optionCardOuter,
        pressed && styles.optionCardOuterPressed,
      ]}>
      <View
        style={styles.optionCardInner}>
        <View style={[styles.optionRow, { flexDirection: viewRTLStyle }]}>
          {infoUser.typeUser == "Taller"
            ? item.id === 2 ? <View style={styles.optionIconWrap}>
            <Icons2 name="dashboard" size={18} color="#FFD60A" />
          </View> : (
              
              <View style={styles.optionIconWrap}>
              {renderMenuIcon(item)}
            </View>
            )
            : (
              <View style={styles.optionIconWrap}>
                {renderMenuIcon(item)}
              </View>
            )
          }

          <View style={styles.optionTitleWrap}>
            <Text
              style={[
                styles.titleText,
                { textAlign: textRTLStyle },
              ]}
              numberOfLines={2}>
              {t(item.title)}
            </Text>
          </View>
          <View style={styles.optionArrowWrap}>
            <View style={{ transform: [{ scale: imageRTLStyle }] }}>
              <Icons name="chevron-right" size={14} color="#1F2344" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screenRoot}>
      <View style={styles.perimeterTopArea}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.perimeterHeaderBlock}>
          <Text style={styles.perimeterTitle}>Mi Perfil</Text>
          <Text style={styles.perimeterSubtitle}>
            Administra tu información y accesos de forma rápida.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.perimeterBottomSheet,
          {
            width: screenWidth,
            height: screenHeight * 0.69,
          },
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.perimeterScrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarFrameOuter}>
              <View style={styles.avatarFrameInner}>
                {imagePerfil == null || imagePerfil == "" ? (
                  <Image
                    resizeMode="cover"
                    style={styles.imgStyle}
                    source={notImageFound}
                  />
                ) : (
                  <ImageBackground
                    resizeMode="cover"
                    style={styles.imgStyle}
                    source={{ uri: imagePerfil }}
                  />
                )}
              </View>
            </View>
            <Text style={styles.nameText}>{infoUser.nombre || 'Usuario'}</Text>
            <Text style={styles.emailText}>{infoUser.email || 'Sin correo registrado'}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeBadgeText}>{infoUser.typeUser || 'Usuario'}</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            {infoUser.typeUser != "Taller" && infoUser.typeUser != "Cliente"
              ? profileDataAdmin.map((item, index) =>
                renderOptionCard(item, `admin-a-${index}`, handleAdminOptionPress),
              )
              : null}
            {infoUser.typeUser != "Taller" && infoUser.typeUser != "Cliente"
              ? profileDataAdmin
                .filter(item => item.id !== 3 || infoUser.typeUser === "Taller")
                .map((item, index) =>
                  renderOptionCard(item, `admin-b-${index}`, handleAdminOptionPress),
                )
              : null}
            {infoUser.typeUser == "Cliente"
              ? profileData
                .filter(item => item.id !== 3 || infoUser.typeUser === "Taller")
                .map((item, index) =>
                  renderOptionCard(item, `user-${index}`, handleMainOptionPress),
                )
              : null}

            {infoUser.typeUser == "Taller"
              ? profileDataTaller
                .filter(item => item.id !== 3 || infoUser.typeUser === "Taller")
                .map((item, index) =>
                  renderOptionCard(item, `user-${index}`, handleMainOptionPress),
                )
              : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ProfileScreen;
