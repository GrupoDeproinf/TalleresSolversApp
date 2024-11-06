import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState} from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {seeAll} from '../../../constant';
import {YellowStar} from '../../../assets/icons/yellowStar';
import styles from './styles.css';
import LinearGradient from 'react-native-linear-gradient';
import {MinusIcon, Plus, PlusRadial} from '../../../utils/icon';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import appFonts from '../../../themes/appFonts';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import appColors from '../../../themes/appColors';
import {useNavigation} from '@react-navigation/native';
import Icons from 'react-native-vector-icons/FontAwesome';
import {Snackbar} from 'react-native-paper';

import notImageFound from '../../../assets/noimageold.jpeg';

const ServicesContainer = ({data, value, show, showPlus, marginTop}) => {
  const {
    linearColorStyle,
    textColorStyle,
    isDark,
    imageContainer,
    textRTLStyle,
    viewRTLStyle,
    t,
    linearColorStyleTwo,
    currSymbol,
    currPrice,
  } = useValues();
  const navigation = useNavigation();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  const [visibleHint, setVisibleHint] = useState(false);
  const [statusLabel, setstatusLabel] = useState(false);

  const goToDetail = item => {
    console.log(item);

    navigation.navigate('FormService', {uid: item.id});
  };

  const onLongPressHandler = (itemId, status) => {
    setVisibleHint(itemId); // Muestra el Snackbar para el ítem presionado
    setstatusLabel(status);
    setTimeout(() => {
      setVisibleHint(null); // Oculta el Snackbar después de un tiempo
    }, 1000);
  };

  const onDismissHint = () => {
    setVisibleHint(null); // Oculta el Snackbar cuando se presiona para cerrar
  };

  const goToPreview = (data) =>{
    navigation.navigate('ProductDetailOne', {uid: data.id, typeUser:"Taller"});
  }

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => goToDetail(item)} activeOpacity={0.9}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
          {shadowColor: appColors.shadowColor},
          {flexDirection: viewRTLStyle},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
            {flexDirection: viewRTLStyle},
          ]}>
          <View
            style={[styles.imageContainer, {backgroundColor: imageContainer}]}>
            {item.img == null ? (
              <Image style={styles.image} source={notImageFound} />
            ) : (
              <Image style={styles.image} source={item.img} />
            )}
          </View>
          <View style={styles.textContainer}>
            <View
              style={[styles.ratingContainer, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  styles.title,
                  {color: textColorStyle},
                  {textAlign: textRTLStyle},
                ]}>
                {t(item.nombre_servicio)}
              </Text>
              <TouchableOpacity style={styles.ratingContainer}>
                <YellowStar />
                <Text style={[styles.ratingText]}>{t(item.puntuacion)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.datoSub, {textAlign: textRTLStyle}]}>
              Categoria: {t(item.categoria)}
            </Text>

            <Text
              style={[styles.datoSub, {textAlign: textRTLStyle}]}
              numberOfLines={1} // Limita a una línea y agrega "..." si el texto es demasiado largo
              ellipsizeMode="tail" // Agrega "..." al final del texto truncado
            >
              Subcategoria: {t(item.subcategoria)}
            </Text>

            <View
              style={{
                flexDirection: 'row', // Alinea los elementos en una fila
                alignItems: 'center', // Alinea verticalmente los elementos al centro
                justifyContent: 'space-between', // Espacio entre los elementos
              }}>
              <TouchableOpacity
                onPress={() => {
                  goToPreview(item)
                }}>
                <Text
                  style={[
                    styles.datoSub,
                    {
                      textAlign: textRTLStyle,
                      fontSize: 14,
                      color: '#2D3261', // Color del texto
                      textDecorationLine: 'underline', // Agrega subrayado
                    },
                  ]}
                  numberOfLines={1} // Limita a una línea y agrega "..." si el texto es demasiado largo
                  ellipsizeMode="tail" // Agrega "..." al final del texto truncado
                >
                  Preview
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 18,
                  color: '#2D3261',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  marginRight: 30,
                  marginTop: 10,
                }}>
                ${item.precio}
              </Text>

              {/* Mostrar el hint (Snackbar) solo para el item actual */}
              <Snackbar
                visible={visibleHint === item.uid}
                onDismiss={onDismissHint}
                duration={900}>
                {statusLabel}
              </Snackbar>
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.newArrivalContainer}>
      <View style={{marginTop: marginTop || windowHeight(14)}}>
        {show && (
          <H3HeadingCategory value={value} seeall={t('transData.seeAll')} />
        )}
      </View>
      <FlatList data={data} renderItem={renderItem} />
    </View>
  );
};

export default ServicesContainer;
