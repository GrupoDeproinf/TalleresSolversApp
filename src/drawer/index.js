import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import MyTabs from '../myTab';
import {useValues} from '../../App';
import {windowHeight, windowWidth} from '../themes/appConstant';
import DrawerContent from './drawerContent';
import HomeScreenTwo from '../screens/homeScreenTwo';

const Drawer = createDrawerNavigator();

const CustomDrawerNavigator = () => {
  const {isRTL} = useValues();
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
      }}>
      <Drawer.Screen name="MyTabs" component={MyTabs} />
      <Drawer.Screen name="HomeScreenTwo" component={HomeScreenTwo} />
    </Drawer.Navigator>
  );
};

const DrawerScreen = () => {
  return <CustomDrawerNavigator />;
};

export default DrawerScreen;
