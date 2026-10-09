import { Image, Pressable, Text, View, ImageBackground, Linking, Alert, ScrollView, Dimensions } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { profileData, profileDataAdmin, profileDataTaller } from '../../data/profileData';
import styles from './style.css';
import { useNavigation } from '@react-navigation/native';
import { useValues } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

import notImageFound from '../../assets/noimageold.jpeg';
import api from '../../../axiosInstance';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Icons2 from 'react-native-vector-icons/AntDesign';
import { Banner } from '../../ui';
import { cerrarSesionFirebase } from '../../utils/sesionSegura';

const SOLVERS_WEB_SIGN_IN =
  'https://app.solversapp.com/sign-in?redirectUrl=/';

const TIPOS_CON_PERFIL = ['Cliente', 'Taller'];

/** El servidor responde "No se encontró el usuario" cuando el uid no está en Usuarios. */
const esUsuarioNoEncontrado = error => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const msg = typeof data === 'string' ? data : data?.message || data?.error || '';
  return status === 404 || /no se encontr/i.test(String(msg));
};

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
  // null | 'no_encontrada' (la cuenta ya no existe) | 'sin_conexion'
  const [avisoPerfil, setAvisoPerfil] = useState(null);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await cerrarSesionFirebase();
      navigation.replace('Login');
    } catch (error) {
      console.warn('Error logging out:', error);
    }
  };


  const navigationScreen = useNavigation();

  const getData = useCallback(async () => {
    let user = null;
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      user = jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      user = null;
    }

    // Primero lo que ya está guardado en la sesión: el menú correcto aparece
    // al instante y también sin conexión.
    if (user && typeof user === 'object') {
      setinfoUser(prev => ({ ...prev, ...user }));
      if (user.image_perfil) setimagePerfil(user.image_perfil);
    }
    if (!user?.uid) return;

    try {
      const response = await api.post('/usuarios/getUserByUid', {
        uid: user.uid,
      });
      const userData = response?.data?.userData;
      if (response.status === 200 && userData) {
        setinfoUser(prev => ({ ...prev, ...userData }));
        setimagePerfil(userData.image_perfil || '');
        setAvisoPerfil(null);
      }
    } catch (error) {
      if (esUsuarioNoEncontrado(error)) {
        // Los administradores no viven en Usuarios: es lo esperado para ellos.
        // Para un conductor o un taller significa que la cuenta ya no existe.
        setAvisoPerfil(TIPOS_CON_PERFIL.includes(user?.typeUser) ? 'no_encontrada' : null);
      } else {
        setAvisoPerfil('sin_conexion');
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getData();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen, getData]);

  const {
    viewRTLStyle,
    textRTLStyle,
    imageRTLStyle,
    t,
  } = useValues();


  const removePropertyFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('@userInfo');
    } catch (error) {
      console.warn('Error removing item:', error);
    }
  };

  const cerrarSesion = () => {
    removePropertyFromStorage();
    handleLogout();
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
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              try {
                const jsonValue = await AsyncStorage.getItem('@userInfo');
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                try {
                  await api.post('/usuarios/deleteUserFromAuth', {
                    uid: user.uid,
                  });

                  removePropertyFromStorage();
                  handleLogout();

                } catch (error) {
                  Alert.alert(
                    'Solvers',
                    'No pudimos eliminar tu cuenta. Revisa tu conexión e inténtalo de nuevo.',
                  );
                }

              } catch (e) {
                console.warn(e);
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
      cerrarSesion();
    } else {
      if (infoUser.typeUser == "Taller") {
        if (item.screenName == "EditProfile") {
          // Perfil del negocio en una sola pantalla (antes: editor de 7 pasos).
          navigation.navigate('PerfilNegocio');
        } else if (item.screenName == "Dashboard") {
          // "Estadísticas" apuntaba a una pantalla que no existía. Los datos
          // del negocio están en el inicio del taller.
          navigation.navigate('HomeScreen');
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
      cerrarSesion();
    } else {
      navigation.navigate(item.screenName);
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
      accessibilityRole="button"
      accessibilityLabel={t(item.title)}
      style={({ pressed }) => [
        styles.optionCardOuter,
        pressed && styles.optionCardOuterPressed,
      ]}>
      <View
        style={styles.optionCardInner}>
        <View style={[styles.optionRow, { flexDirection: viewRTLStyle }]}>
          {infoUser.typeUser == "Taller" && item.id === 2 ? (
            <View style={styles.optionIconWrap}>
              <Icons2 name="dashboard" size={18} color="#FFD60A" />
            </View>
          ) : (
            <View style={styles.optionIconWrap}>
              {renderMenuIcon(item)}
            </View>
          )}

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

  const esCliente = infoUser.typeUser === 'Cliente';
  const esTaller = infoUser.typeUser === 'Taller';
  const tipoVisible = esCliente
    ? 'Conductor'
    : esTaller
    ? 'Taller'
    : infoUser.typeUser || 'Administrador';

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
            <Text style={styles.nameText} numberOfLines={2}>{infoUser.nombre || 'Usuario'}</Text>
            <Text style={styles.emailText} numberOfLines={1}>{infoUser.email || 'Sin correo registrado'}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeBadgeText}>{tipoVisible}</Text>
            </View>
          </View>

          {avisoPerfil === 'no_encontrada' ? (
            <Banner
              tone="error"
              text="No encontramos tu cuenta en Solvers. Puede que se haya eliminado. Inicia sesión de nuevo."
              actionLabel="Iniciar sesión"
              onAction={cerrarSesion}
              style={{ marginBottom: 12 }}
            />
          ) : avisoPerfil === 'sin_conexion' ? (
            <Banner
              tone="warn"
              text="No pudimos actualizar tus datos. Revisa tu conexión."
              actionLabel="Reintentar"
              onAction={getData}
              style={{ marginBottom: 12 }}
            />
          ) : null}

          <View style={styles.menuSection}>
            {!esCliente && !esTaller
              ? profileDataAdmin.map((item, index) =>
                renderOptionCard(item, `admin-${index}`, handleAdminOptionPress),
              )
              : null}
            {esCliente
              ? profileData
                .filter(item => item.id !== 3)
                .map((item, index) =>
                  renderOptionCard(item, `user-${index}`, handleMainOptionPress),
                )
              : null}

            {esTaller
              ? profileDataTaller.map((item, index) =>
                  renderOptionCard(item, `taller-${index}`, handleMainOptionPress),
                )
              : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ProfileScreen;
