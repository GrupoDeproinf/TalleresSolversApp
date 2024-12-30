import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Bus, Refresh} from '../../../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../../../themes/appColors';
import {Linking} from 'react-native';
import MapComponent from '../../../../screens/map';

const IconContact = data => {
  const {textColorStyle, linearColorStyle, isDark} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  useEffect(() => {
    console.log(
      '...........................................................................',
    );
    console.log('data Metodos: ', data.data[0]?.taller);
    console.log(
      '...........................................................................',
    );
  }, []);

  const handleContact = async typeContact => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    const servicePayload = {
      id: data.data[0]?.id,
      nombre_servicio: data.data[0]?.nombre_servicio,
      precio: data.data[0]?.precio,
      taller: data.data[0]?.taller,
      uid_servicio: data.data[0]?.id,
      uid_taller: data.data[0]?.uid_taller,
      usuario_id: user?.uid || '',
      usuario_nombre: user?.nombre || '',
      usuario_email: user?.email || '',
      typeContact: typeContact,
    };

    console.log('-----------------------------------------------------');
    console.log('servicePayload', servicePayload);
    console.log('-----------------------------------------------------');

    // try {
    //   // Realizar la solicitud al endpoint
    //   const response = await api.post('/home/contactService', servicePayload);

    //   // Si llegamos aquí, la solicitud fue exitosa
    //   const responseData = response.data; // Axios ya procesa el JSON automáticamente
    //   console.log('Servicio guardado exitosamente:', responseData);
    // } catch (error) {
    //   // Manejar errores
    //   if (error.response) {
    //     // Errores del servidor (respuesta con error, por ejemplo, 400, 500)
    //     console.error('Error del servidor:', error.response.data);
    //   } else if (error.request) {
    //     // La solicitud se realizó pero no hubo respuesta
    //     console.error('No se recibió respuesta del servidor:', error.request);
    //   } else {
    //     // Otro tipo de error
    //     console.error('Error al configurar la solicitud:', error.message);
    //   }
    // }
  };

  return (
    <View style={[styles.view]}>
      <Text style={[styles.textTitle]}>Contacto</Text>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.refreshIcon,
          {shadowColor: appColors.shadowColor, borderRadius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <View style={[styles.gridContainer]}>
            {data.data[0]?.taller.phone && (
              <View style={[styles.gridItem]}>
                <Text
                  style={[styles.deliveryIn, {color: textColorStyle}]}
                  onPress={() => {
                    handleContact('Llamada');
                    Linking.openURL(`tel:0${data.data[0]?.taller.phone}`);
                  }}>
                  📞 Teléfono: {data.data[0]?.taller.phone}
                </Text>
              </View>
            )}

            {data.data[0]?.taller.whatsapp && (
              <View style={[styles.gridItem]}>
                <Text
                  style={[styles.deliveryIn, {color: textColorStyle}]}
                  onPress={() => {
                    handleContact('WhatsApp');
                    Linking.openURL(
                      `https://wa.me/+58${data.data[0]?.taller.whatsapp}`,
                    );
                  }}>
                  🔗 WhatsApp: {data.data[0]?.taller.whatsapp}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default IconContact;
