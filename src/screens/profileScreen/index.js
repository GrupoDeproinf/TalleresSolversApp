import {Image, Pressable, Text, View} from 'react-native';
import React from 'react';
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
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

  return (
    <View style={[styles.viewContainer, {backgroundColor: bgFullStyle}]}>
      <Text
        style={[
          external.ti_center,
          commonStyles.hederH2,
          {color: textColorStyle},
        ]}>
        {t('transData.myProfile')}
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
          {t('transData.smithaWilliams')}
        </Text>
        <Text style={[commonStyles.subtitleText, external.ti_center]}>
          {t('transData.smithaWilliamsMail')}
        </Text>
      </View>
      <View style={[external.mt_10]}>
        {profileData.map((item, index) => (
          <Pressable
            key={index}
            activeOpacity={0.9}
            onPress={() => {
              if (item.id === 6) {
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
