import {Image, Pressable, Text, View} from 'react-native';
import React, {useState, useEffect } from 'react';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import images from '../../utils/images';
import {profileData} from '../../data/profileData';
import {RightArrow} from '../../assets/icons/rightArrow';
import styles from './style.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../themes/appColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [infoUser, setinfoUser] = useState(
    {
      uid:"",
      nombre:"",
      cedula:"",
      phone:"",
      typeUser:""
    }
  );


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    getData()
  }, []);

  const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        console.log("valor del storage", user);

        setinfoUser(user)
    } catch(e) {
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
    <View style={[styles.viewContainer, {backgroundColor: bgFullStyle}]}>
      <Text
        style={[
          external.ti_center,
          commonStyles.hederH2,
          {color: textColorStyle},
        ]}>
        Mi Perfil
      </Text>
      <View style={[external.as_center]}>
        <View
          style={[
            styles.grayBorder,
            {borderColor: isDark ? '#202439' : '#EBEEFD'},
          ]}>
          <View style={[styles.primayBorder]}>
            <Image style={styles.imgStyle} source={images.user} />
          </View>
        </View>
        <Text style={[styles.nameText, {color: textColorStyle}]}>
        {infoUser.nombre}
        </Text>
        <Text style={[commonStyles.subtitleText, external.ti_center]}>
        {infoUser.email}
        </Text>
      </View>
      <View style={[external.mt_10]}>
        {profileData.map((item, index) => (
          <Pressable
            key={index}
            activeOpacity={0.9}
            onPress={() => {
              if (item.id === 6) {
                removePropertyFromStorage()
                handleLogout();
              } else {
                navigation.navigate(item.screenName);
              }
            }}>
            <LinearGradient
              start={{x: 0.0, y: 0.0}}
              end={{x: 0.0, y: 1.0}}
              colors={colors}
              style={styles.container}>
              <LinearGradient
                start={{x: 0.0, y: 0.0}}
                end={{x: 0.0, y: 1.0}}
                colors={linearColorStyle}
                style={styles.menuItemContent}>
                <View
                  style={[
                    external.fd_row,
                    external.ai_center,
                    {flexDirection: viewRTLStyle},
                  ]}>
                  {item.icon}
                  <View style={{width: '86%'}}>
                    <Text
                      style={[
                        styles.titleText,
                        {color: textColorStyle},
                        {textAlign: textRTLStyle},
                      ]}>
                      {t(item.title)}
                    </Text>
                  </View>
                  <View style={{transform: [{scale: imageRTLStyle}]}}>
                    <RightArrow />
                  </View>
                </View>
              </LinearGradient>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ProfileScreen;
