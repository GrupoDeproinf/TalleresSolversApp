import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, Image, Modal } from 'react-native';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icons2 from 'react-native-vector-icons/Entypo';


const Tab = createBottomTabNavigator();

const EmergencyModalContext = React.createContext({ visible: false, setVisible: () => {} });

const EmergencyModalContent = ({ onClose }) => (
  <View
    style={{
      width: '88%',
      maxWidth: 340,
      borderRadius: 28,
      paddingVertical: 36,
      paddingHorizontal: 28,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 16,
      alignItems: 'center',
    }}>
    <View
      style={{
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFF8E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
      }}>
      <MaterialCommunityIcons name="hammer-wrench" size={40} color="#E6A800" />
    </View>
    <Text
      style={{
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1D26',
        textAlign: 'center',
        marginBottom: 12,
      }}>
      ¡Próximamente!
    </Text>
    <Text
      style={{
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        paddingHorizontal: 8,
      }}>
      Estamos trabajando en esta nueva funcionalidad para ofrecerte una mejor experiencia. Te avisaremos cuando esté lista.
    </Text>
    <TouchableOpacity
      onPress={onClose}
      style={{
        backgroundColor: '#2D3261',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 36,
        minWidth: 160,
        alignItems: 'center',
      }}
      activeOpacity={0.85}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Entendido</Text>
    </TouchableOpacity>
  </View>
);

const EmergencyModalProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <EmergencyModalContext.Provider value={{ visible, setVisible }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <EmergencyModalContent onClose={() => setVisible(false)} />
        </View>
      </Modal>
    </EmergencyModalContext.Provider>
  );
};

const EmergenciaScreen = ({ navigation, route }) => {
  const showMap = route.params?.showMap === true;

  if (showMap) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => navigation.setParams({ showMap: undefined })}
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            zIndex: 10,
            padding: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 24,
          }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <RadioSelector />
      </View>
    );
  }

  return <View style={{ flex: 1 }} />;
};

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
  const emergencyModal = React.useContext(EmergencyModalContext);

  const emergencyIndex = state.routes.findIndex((r) => r.name === 'Emergencia');
  const serviciosIndex = state.routes.findIndex((r) => r.name === 'Servicios');
  const serviciosScreenIndex = state.routes.findIndex((r) => r.name === 'ServiciosScreen');
  const centerIndex = emergencyIndex >= 0 ? emergencyIndex : (serviciosIndex >= 0 ? serviciosIndex : (serviciosScreenIndex >= 0 ? serviciosScreenIndex : -1));
  const hasCenteredButton = centerIndex >= 0;

  const renderNormalTab = (route) => {
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
                backgroundColor: '#2D3261',
                borderTopLeftRadius: windowWidth(65) / 2,
                borderTopRightRadius: windowWidth(65) / 2,
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmergencyTab = (route) => {
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
        style={{ justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={0.8}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#FFD60A',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: windowHeight(10),
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}>
          <MaterialCommunityIcons
            name="car-emergency"
            size={30}
            color="#ffffff"
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (hasCenteredButton) {
    const leftRoutes = state.routes.slice(0, centerIndex);
    const centerRoute = state.routes[centerIndex];
    const rightRoutes = state.routes.slice(centerIndex + 1);
    const isCenterEmergencia = centerRoute.name === 'Emergencia';
    const isCenterServicios = centerRoute.name === 'Servicios' || centerRoute.name === 'ServiciosScreen';
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
        <View style={{ flex: 1, flexDirection: viewRTLStyle }}>
          {leftRoutes.map((route) => renderNormalTab(route))}
        </View>
        <View
          style={{
            width: 72,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              if (isCenterEmergencia && emergencyModal.setVisible) {
                emergencyModal.setVisible(true);
              } else if (isCenterServicios) {
                handleTabPress(centerRoute.name);
              } else {
                handleTabPress(centerRoute.name);
              }
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FFD60A',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: windowHeight(10),
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
            activeOpacity={0.8}>
            {isCenterServicios ? (
              <Icons3 name="tools" size={30} color="#ffffff" />
            ) : (
              <MaterialCommunityIcons
                name="car-emergency"
                size={30}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, flexDirection: viewRTLStyle }}>
          {rightRoutes.map((route) => renderNormalTab(route))}
        </View>
      </LinearGradient>
    );
  }

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
      {state.routes.map((route) => {
        if (route.name === 'Emergencia') {
          return renderEmergencyTab(route);
        }
        return renderNormalTab(route);
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
    <EmergencyModalProvider>
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
        name="Mapa"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="map-marker-radius" size={30} color="#9BA6B8" />
          ),
          activeTabBarIcon: () => (
            <MaterialCommunityIcons name="map-marker-radius" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="Emergencia"
        component={EmergenciaScreen}
        options={{
          tabBarLabel: 'Emergencia',
          tabBarIcon: () => <View />,
          activeTabBarIcon: () => <View />,
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
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
    </EmergencyModalProvider>
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

