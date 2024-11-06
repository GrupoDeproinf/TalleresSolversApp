import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { BackLeft } from '../../utils/icon';
import styles from './style.css';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const FullHeader = ({ onpressBack, modelPress, value, title, show, text, showArrow, showClose, showNewService }) => {
  const {
    linearColorStyle,
    textColorStyle,
    linearColorStyleTwo,
    viewRTLStyle,
    imageRTLStyle,
  } = useValues();

  const navigationScreen = useNavigation();


  const CloseSesion = async () => {
    console.log("aquiiii")


    try {
      await AsyncStorage.removeItem('@userInfo');
      console.log('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
    }

    try {
      await AsyncStorage.removeItem('userToken');
      navigationScreen.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  const createorEditService = async () => {
    console.log("Aquiii estoy")

    navigationScreen.navigate('FormService', {uid: ''});

  };


  return (
    <View style={[styles.container, { flexDirection: viewRTLStyle }]}>


      {
        showArrow ?? (
          <TouchableOpacity
            onPress={onpressBack}
            style={{ transform: [{ scale: imageRTLStyle }] }}>
            <BackLeft />
          </TouchableOpacity>
        )
      }

      {
        showClose ? (
          <TouchableOpacity onPress={CloseSesion}>
            <Text style={{ color: '#2D3261' }}>Cerrar Sesión</Text>
          </TouchableOpacity>

        ) : null
      }

{
        showNewService ? (
          <TouchableOpacity onPress={createorEditService} style={{marginRight:-55}}>
            <Text style={{ color: '#2D3261' }}>Agregar</Text>
          </TouchableOpacity>

        ) : null
      }
      





      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: showClose == true ? -60 : 20  }}>
        <Text style={[styles.titleText, { color: textColorStyle }]}>{title}</Text>
      </View>


      {show ? (
        <View>{text}</View>
      ) : (
        <TouchableOpacity activeOpacity={0.9} onPress={modelPress}>
          <LinearGradient
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
            colors={linearColorStyleTwo}
            style={[styles.cardContainer]}>
            <LinearGradient
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.0, y: 1.0 }}
              colors={linearColorStyle}
              style={[styles.menuItemContent]}>
              {value}
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FullHeader;
