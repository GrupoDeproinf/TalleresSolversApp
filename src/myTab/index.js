import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, TouchableOpacity, Text, Image} from 'react-native';
import HomeScreen from '../screens/homeScreen';
import CategoryScreen from '../screens/categoryScreen';
import MyBeg from '../screens/emptyScreen/myBeg';
import ProfileScreen from '../screens/profileScreen';
import {
  Category,
  CategoryLight,
  HomeIcon,
  HomeLight,
  MyBegDis,
  MyBegs,
  ProfileLight,
  ProfileTab,
} from '../utils/icon';
import images from '../utils/images';
import {external} from '../style/external.css';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../App';
import {windowHeight, windowWidth} from '../themes/appConstant';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({state, descriptors, navigation}) => {
  const [activeTab, setActiveTab] = useState(state.routes[0].name);

  const handleTabPress = routeName => {
    setActiveTab(routeName);
    navigation.navigate(routeName);
  };
  const {linearColorStyle, textColorStyle, linearColorStyleTwo, viewRTLStyle} =
    useValues();
  return (
    <LinearGradient
      start={{x: 0.0, y: 0.0}}
      end={{x: 0.0, y: 1.0}}
      colors={linearColorStyle}
      style={{
        flexDirection: viewRTLStyle,
        backgroundColor: '#ffffff',
        height: windowHeight(55),
        borderColor: '#E9E9E9',
        elevation: 10,
      }}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];

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
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View>{isFocused ? <ActiveIcon /> : <IconComponent />}</View>

            {isFocused && (
              <View style={[external.ai_center]}>
                <View
                  style={{
                    width: windowHeight(3),
                    height: windowHeight(3),
                    borderRadius: windowHeight(3),
                    backgroundColor: '#4D66FF',
                    marginVertical: 4,
                  }}
                />
                <Image
                  source={images.bottom}
                  style={{
                    width: windowWidth(65),
                    height: windowHeight(15),
                    position: 'absolute',
                    bottom: -windowHeight(18),
                    resizeMode: 'contain',
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const MyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#000000',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <HomeLight />,
          activeTabBarIcon: () => <HomeIcon />,
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
        name="MyBeg"
        component={MyBeg}
        options={{
          tabBarLabel: 'My Bag',
          tabBarIcon: () => <MyBegDis />,
          activeTabBarIcon: () => <MyBegs />,
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

export default MyTabs;