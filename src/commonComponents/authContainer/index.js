import {SafeAreaView, Text, TouchableOpacity, View, Image} from 'react-native';
import React from 'react';
import {BackLeft} from '../../utils/icon';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import styles from './style.css';
import {useValues} from '../../../App';
import {useNavigation} from '@react-navigation/native';

const AuthContainer = ({subtitle, title, value, onPress, showBack, AlignItemTitle}) => {
  const {bgFullStyle, textColorStyle, textRTLStyle, imageRTLStyle} =
    useValues();
  const navigation = useNavigation('');

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              left: 10,
              transform: [{scale: imageRTLStyle}],
            }} // Posiciona el botón a la izquierda
          >
            <BackLeft />
          </TouchableOpacity>
        )}

        <Image
          source={require('../../assets/solverslogo.jpg')} // Asegúrate de que la ruta sea correcta
          style={{width: 70, height: 70}} // Ajusta el tamaño de la imagen aquí
          resizeMode="contain" // Esto asegura que la imagen mantenga sus proporciones
        />
      </View>

      <Text
        style={[
          commonStyles.container,
          external.mt_20,
          {color: textColorStyle},
          {textAlign: AlignItemTitle != undefined ? AlignItemTitle : textRTLStyle },
        ]}>
        {title}
      </Text>
      <Text style={[styles.subtitleText, {textAlign: AlignItemTitle != undefined ? AlignItemTitle : textRTLStyle}]}>
        {subtitle}
      </Text>
      <View>{value}</View>
    </SafeAreaView>
  );
};

export default AuthContainer;
