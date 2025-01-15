import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MyTabs, MyTabsCliente, MyTabsTaller, MyTabsAdmin } from '../myTab';
import { useValues } from '../../App';
import { windowHeight, windowWidth } from '../themes/appConstant';
import DrawerContent from './drawerContent';
import HomeScreenTwo from '../screens/homeScreenTwo';
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

      setuser(userNew)
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
      console.log("Userrrr12344444navbarrr", userNew)
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    } catch (e) {
      console.log("Aquiiii esta el errooooooooor", e)
    }
  }

  if (user.typeUser !== "") {
    return (
      <Drawer.Navigator
        // eslint-disable-next-line react/no-unstable-nested-components
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            width: windowWidth(290),
            borderTopRightRadius: 20,
            borderBottomEndRadius: isRTL ? 0 : windowWidth(30),
            borderBottomLeftRadius: isRTL ? windowHeight(18) : 0,
            borderTopEndRadius: windowHeight(14),
            borderTopStartRadius: windowHeight(14),
            overflow: 'hidden',
          },
          headerShown: false,
          drawerPosition: isRTL ? 'right' : 'left',
        }}
      >
        {user.typeUser === 'Taller' && (
          <Drawer.Screen name="MyTabsTaller" component={MyTabsTaller} />
        )}

        {user.typeUser === 'Cliente' && (
          <Drawer.Screen name="MyTabsCliente" component={MyTabsCliente} />
        )}

        {user.typeUser === 'Admin' && (
          <Drawer.Screen name="MyTabsAdmin" component={MyTabsAdmin} />
        )}

        {/* <Drawer.Screen name="HomeScreenTwo" component={HomeScreenTwo} /> */}

      </Drawer.Navigator>
    );
  }

};

const DrawerScreen = () => {

  return <CustomDrawerNavigator />;
};

export default DrawerScreen;
