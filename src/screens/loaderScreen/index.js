import {Image, ImageBackground} from 'react-native';
import React, {useEffect, useState} from 'react';
import images from '../../utils/images';
import styles from './style.css';
import {useValues} from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoaderScreen = ({navigation}) => {

  const [ValidTaller, setValidTaller] = useState(false);

  useEffect(() => {
    getData()
  }, []);


  const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        console.log("valor del storage 658888", user);
        if(user.typeUser == "Cliente"){
          const timer = setTimeout(() => {
            navigation.replace('DrawerScreen');
          }, 1000);
          return () => clearTimeout(timer);

        } else {
          if (ValidTaller == true){
            const timer = setTimeout(() => {
              navigation.replace('DrawerScreen');
            }, 1000);
            return () => clearTimeout(timer);
          } else {
            const timer = setTimeout(() => {
              navigation.replace('TallerProfileScreen');
            }, 1000);
            return () => clearTimeout(timer);
          }
        }

    } catch(e) {
        // error reading value
        console.log(e)
    }
};


  const {isDark} = useValues();
  const imageBg = isDark ? images.loaderBgDark : images.loaderBg;
  const loader = isDark ? images.loading : images.loaderGIF;
  return (
    <ImageBackground style={styles.container} source={imageBg}>
      <Image
        style={isDark ? styles.imgStyleDark : styles.imgStyle}
        source={loader}
      />
    </ImageBackground>
  );
};

export default LoaderScreen;
