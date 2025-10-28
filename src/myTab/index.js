import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import HomeScreen from '../screens/homeScreen';
import CategoryScreen from '../screens/categoryScreen';
// import MyBeg from '../screens/emptyScreen/myBeg';
import ProfileScreen from '../screens/profileScreen';
import TalleresContainer from '../screens/Talleres';
import ServiciosContainer from '../screens/Servicios';

import RadioSelector from '../screens/perimeter-map';
import {
  Category,
  CategoryLight,
  HomeIcon,
  HomeLight,
  MyBegDis,
  MyBegs,
  ProfileLight,
  ProfileTab,
  Setting,
} from '../utils/icon';
import images from '../utils/images';
import { external } from '../style/external.css';
import LinearGradient from 'react-native-linear-gradient';
import { useValues } from '../../App';
import { windowHeight, windowWidth } from '../themes/appConstant';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons3 from 'react-native-vector-icons/FontAwesome5';
// import Icons2 from 'react-native-vector-icons/Entypo';


const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [activeTab, setActiveTab] = useState(state.routes[0].name);

  useEffect(() => {
    console.log("activeTab", activeTab);
    console.log("aqui va algo la primera vez");
    
    // Verificar si hay un tab específico que debe estar activo
    const currentRoute = state.routes[state.index];
    if (currentRoute && currentRoute.name !== activeTab) {
      setActiveTab(currentRoute.name);
    }
  }, [state.index, state.routes]);

  const handleTabPress = routeName => {
    setActiveTab(routeName);
    navigation.navigate(routeName);
  };
  const { linearColorStyle, textColorStyle, linearColorStyleTwo, viewRTLStyle } =
    useValues();
  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 0.0, y: 1.0 }}
      colors={linearColorStyle}
      style={{
        flexDirection: viewRTLStyle,
        backgroundColor: '#ffffff',
        height: windowHeight(55),
        borderColor: '#E9E9E9',
        elevation: 10,
      }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const IconComponent = options.tabBarIcon;
        const ActiveIcon = options.activeTabBarIcon;
        const isFocused = activeTab === route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            handleTabPress(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>{isFocused ? <ActiveIcon /> : <IconComponent />}</View>

            {isFocused && (
              <View style={[external.ai_center]}>
                <View
                  style={{
                    width: windowHeight(3),
                    height: windowHeight(3),
                    borderRadius: windowHeight(3),
                    backgroundColor: '#2D3261',
                    marginVertical: 4,
                  }}
                />
                <View
                  style={{
                    width: windowWidth(65),
                    height: windowHeight(15),
                    position: 'absolute',
                    bottom: -windowHeight(18),
                    backgroundColor: '#2D3261', // Color de fondo
                    borderTopLeftRadius: windowWidth(65) / 2, // Forma curva
                    borderTopRightRadius: windowWidth(65) / 2, // Forma curva
                  }}
                />


                {/* <Image
                  source={images.bottom}
                  style={{
                    width: windowWidth(65),
                    height: windowHeight(15),
                    position: 'absolute',
                    bottom: -windowHeight(18),
                    resizeMode: 'contain',
                  }}
                /> */}


              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

// Tabs usuarios clientes

const MyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      {/* <Tab.Screen
        name="MyBeg"
        component={MyBeg}
        options={{
          tabBarLabel: 'My Bag',
          tabBarIcon: () => <MyBegDis />,
          activeTabBarIcon: () => <MyBegs />,
        }}
      /> */}

      <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="Talleres"
        component={TalleresContainer}
        options={{
          tabBarLabel: 'Talleres',
          tabBarIcon: () => <Icons name="car" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="car" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsCliente = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}


      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsTaller = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#2D3261',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />


      <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}



      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsTallerPendiente = () => {
  return (
    <Tab.Navigator
      initialRouteName="ServiciosScreen"
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#2D3261',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      <Tab.Screen
        name="ServiciosScreen"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}



      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsAdmin = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      {/* <Tab.Screen
        name="MyBeg"
        component={MyBeg}
        options={{
          tabBarLabel: 'My Bag',
          tabBarIcon: () => <MyBegDis />,
          activeTabBarIcon: () => <MyBegs />,
        }}
      /> */}

      {/* <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      /> */}

      <Tab.Screen
        name="Talleres"
        component={TalleresContainer}
        options={{
          tabBarLabel: 'Talleres',
          tabBarIcon: () => <Icons name="car" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="car" size={30} color="#2D3261" />
          ),
        }}
      />

      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

export { MyTabs, MyTabsCliente, MyTabsTaller, MyTabsTallerPendiente, MyTabsAdmin };

