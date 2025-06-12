import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MyTabs, MyTabsCliente, MyTabsTaller, MyTabsAdmin } from '../myTab';
import { useValues } from '../../App';
import { windowHeight, windowWidth } from '../themes/appConstant';
import DrawerContent from './drawerContent';
// import HomeScreenTwo from '../screens/homeScreenTwo';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const CustomDrawerNavigator = () => {
  const { isRTL } = useValues();
  const [user, setuser] = useState({
    typeUser: ""
  });

  const navigationScreen = useNavigation();

  useEffect(() => {
    const unsubscribe = navigationScreen.addListener('focus', () => {
      getUser();
    });

    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, [navigationScreen]);

  const getUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const userNew = jsonValue != null ? JSON.parse(jsonValue) : null;

      setuser(userNew);
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("Userrrr12344444navbarrr", userNew);
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    } catch (e) {
      console.log("Aquiiii esta el errooooooooor23", e);
    }
  };

  // Adaptación: Renderizar directamente los componentes según el tipo de usuario
  if (user.typeUser === 'Taller') {
    return <MyTabsTaller />;
  }

  if (user.typeUser === 'Cliente') {
    return <MyTabsCliente />;
  }

  if (user.typeUser === 'Admin') {
    return <MyTabsAdmin />;
  }

  // Opcional: manejar el caso en que user.typeUser no esté definido
  return null;
};

const DrawerScreen = () => {
  return <CustomDrawerNavigator />;
};

export default DrawerScreen;