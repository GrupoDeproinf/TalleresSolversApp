import {Pressable, ScrollView, Text, ToastAndroid, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {
  allReview,
  basedReviews,
  otherReviews,
  reviews,
  writeYourReview,
} from '../../constant';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import styles from './style.css';
import CustomRatingBars from '../../commonComponents/customRating';
import {ratingScreen} from '../../data/ratingScreen';
import {fontSizes} from '../../themes/appConstant';
import {DownArrow} from '../../utils/icon';
import RatingScreenContainer from '../../components/ratingScreenContainer';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Modal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import BeautifulModal from './components/modal';

const RatingScreen = () => {
  const route = useRoute();
  const navigate = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    const handleCloseModal = () => {
      setModalVisible(false);
    };

    const { dataComments, dataAverage, id, dataTotal } = route.params;

    const showToast = text => {
        ToastAndroid.show(text, ToastAndroid.SHORT);
    };

    const addComment = async (rating, comment) => {
      try {
        // Obtener el usuario desde AsyncStorage
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue ? JSON.parse(jsonValue) : null;
    
        if (!user) {
          console.error("Error: Usuario no encontrado en AsyncStorage");
          return;
        }
    
        // Validar que todos los parámetros requeridos están disponibles
        if (!id || !dataTotal || !dataTotal.taller || !dataTotal.uid_taller) {
          console.error("Error: Parámetros faltantes en route.params");
          return;
        }
        // Enviar la solicitud a la API
        const response = await api.post('/home/addCommentToService', {
          uid_service: id,
          comentario: comment,
          puntuacion: rating,
          nombre_taller: dataTotal.taller,
          uid_taller: dataTotal.uid_taller,
          usuario: {
            uid: user.uid,
            nombre: user.nombre,
            email: user.email,
          },
        });
    
        if (response.status === 201) {
          console.log("Comentario añadido con éxito:", response.data);
          setModalVisible(false);
          showToast('Gracias por tu comentario');
          navigate.navigate('HomeScreen');
        } else {
          console.error("Error en la API. Código de estado:", response.status);
        }
      } catch (error) {
        console.error("Error en addComment:", error);
      }
    };
    
  

  useEffect(() => {
    console.log('123456789***************');
    console.log('Data:', dataComments);
    console.log('123456789***************');
    console.log('Data:', dataAverage);
  }, []);
  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    linearColorStyleTwo,
    iconColorStyle,
  } = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[external.mh_20]}
        contentContainerStyle={[external.Pb_30]}>
        <HeaderContainer value={'Comentarios'} />
        <View style={[external.mt_12, external.as_center]}>
          <Text style={[styles.textContext, {color: textColorStyle}]}>
            {dataAverage}
          </Text>
          <CustomRatingBars />
          <Text style={[commonStyles.subtitleText, external.pt_10]}>
            Basado en {dataComments?.length} comentarios
          </Text>
        </View>
        <LinearGradient
          colors={linearColorStyleTwo}
          style={styles.ratingScreenView}>
          
        </LinearGradient>
        <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => {setModalVisible(true)}}>
          <Text style={styles.writeReview}>Dejanos saber que piensas</Text>
        </TouchableOpacity>
        {/* <View style={styles.viewText}>
          {/* <Text
            style={[
              commonStyles.titleText19,
              {fontSize: fontSizes.FONT21},
              {color: textColorStyle},
            ]}>
            {otherReviews}
          </Text> */}
         {/* <LinearGradient colors={linearColorStyle} style={styles.allReview}>
            <LinearGradient colors={linearColorStyle} style={styles.allReview}>
              <Text
                style={[
                  commonStyles.titleText19,
                  external.ph_8,
                  {color: textColorStyle},
                ]}>
                {allReview}
              </Text>
              <DownArrow color={iconColorStyle} />
            </LinearGradient>
          </LinearGradient>
        </View> */}
        <RatingScreenContainer data={dataComments} />
      </ScrollView>

      <BeautifulModal
  visible={modalVisible}
  onClose={handleCloseModal}
  onSubmit={(rating, comment) => addComment(rating, comment)}
/>

    </View>
  );
};

export default RatingScreen;
