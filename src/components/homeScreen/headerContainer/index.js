import {Image, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {external} from '../../../style/external.css';
import IconBackground from '../../../commonComponents/iconBackGround';
import {hiSmitha} from '../../../constant';
import {Drawer, Heart, Notification, Offer} from '../../../utils/icon';
import {commonStyles} from '../../../style/commonStyle.css';
import {useNavigation} from '@react-navigation/native';
import images from '../../../utils/images';
import styles from './style.css';
import {useValues} from '../../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HeaderContainer = ({onPress}) => {
  const navigation = useNavigation('');
  const {textColorStyle, viewRTLStyle, t} = useValues();
  const [infoUser, setinfoUser] = useState({
    uid: '',
    nombre: '',
    cedula: '',
    phone: '',
    typeUser: '',
  });

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('valor del storage', user);

      setinfoUser(user);
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return (
    <View
      style={[
        external.fd_row,
        external.ai_center,
        external.js_space,
        external.ph_20,
        {flexDirection: viewRTLStyle},
      ]}>
      <View
        style={[
          external.fd_row,
          external.ai_center,
          {flexDirection: viewRTLStyle},
        ]}>
        {/* <IconBackground value={<Drawer />} onPress={onPress} /> */}
        <View style={[external.ml_5]}>
          <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
            Hola, {infoUser.nombre}
          </Text>
        </View>
        <Image style={styles.img} source={images.hifi} />
      </View>
      {/* <View style={[external.fd_row, external.ai_center]}>
        <IconBackground
          onPress={() => navigation.navigate('MyWhishList')}
          value={<Heart />}
        />
        <View style={[external.mh_8]}>
          <IconBackground
            value={<Offer />}
            onPress={() => navigation.navigate('OfferScreen')}
          />
        </View>
        <IconBackground
          onPress={() => navigation.navigate('NotificationScreen')}
          value={<Notification />}
        />
      </View> */}
    </View>
  );
};

export default HeaderContainer;
