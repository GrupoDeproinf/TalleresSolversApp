import { Pressable, ScrollView, Text, ToastAndroid, View, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {
  allReview,
  basedReviews,
  otherReviews,
  reviews,
  writeYourReview,
} from '../../constant';
import { external } from '../../style/external.css';
import { commonStyles } from '../../style/commonStyle.css';
import styles from './style.css';
import CustomRatingBars from '../../commonComponents/customRating';
import { ratingScreen } from '../../data/ratingScreen';
import { fontSizes } from '../../themes/appConstant';
import { DownArrow } from '../../utils/icon';
import RatingScreenContainer from '../../components/ratingScreenContainer';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Modal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import BeautifulModal from './components/modal';
import { Star, UnCheckedStar } from '../../utils/icon';

const RatingScreen = () => {
  const route = useRoute();
  const navigate = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [dataCommentsNew, setdataCommentsNew] = useState([]);
  const [dataAverageNew, setdataAverageNew] = useState([]);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const { dataComments, dataAverage, id, dataTotal } = route.params;

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);

  };

  const addComment = async (rating, comment) => {
    try {
      // Obtener el usuario desde AsyncStorage
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue ? JSON.parse(jsonValue) : null;

      if (!user) {
        console.error('Error: Usuario no encontrado en AsyncStorage');
        return;
      }

      console.log('id:', id);
      console.log('comment:', comment);
      console.log('rating:', rating);
      console.log('uid_taller:', dataTotal.uid_taller);
      console.log('taller:', dataTotal.taller);
      console.log('user:', user);

      // const dataComment = {
      //   uid_service: id,
      //   comentario: comment,
      //   puntuacion: rating,
      //   nombre_taller: dataTotal.taller,
      //   uid_taller: dataTotal.uid_taller,
      //   usuario: {
      //     uid: user.uid,
      //     nombre: user.nombre,
      //     email: user.email,
      //   },
      // }

      // console.log('data:', dataComment);

      const response = await api.post('/home/addCommentToService', {
        uid_service: id,
        comentario: comment,
        puntuacion: rating,
        nombre_taller: dataTotal.taller,
        uid_taller: dataTotal.uid_taller,
        usuario: { uid: user.uid, nombre: user.nombre, email: user.email },
      });

      if (response.status === 201) {
        console.log('Comentario añadido con éxito:', response.data);
        setModalVisible(false);
        showToast('Gracias por tu comentario');
        getComments(id)
        // navigate.navigate('HomeScreen');
      } else {
        console.error('Error en la API. Código de estado:', response.status);
      }
    } catch (error) {
      console.error('Error en addComment:', error);
    }
  };

  useEffect(() => {
    console.log('123456789***************');
    console.log('Data:', id);

    getComments(id)
  }, []);


  const getComments = async id => {
    try {
      const response = await api.post('/home/getCommentsByService', {
        uid_service: id,
      });

      if (response.status === 200) {
        console.log('Respuesta del servidor antes de ordenar:', response.data);

        // Ordenar los comentarios por fecha_creacion en orden descendente
        const sortedComments = response.data.sort((a, b) => {
          const dateA = a.fecha_creacion._seconds;
          const dateB = b.fecha_creacion._seconds;
          return dateB - dateA; // Orden descendente
        });

        console.log('Comentarios ordenados:', sortedComments);
        setdataCommentsNew(sortedComments);

        const averageScore = calculateAverageScore(sortedComments);
        const roundedScore = Math.min(Math.max(Math.ceil(averageScore), 0), 5); // Redondear hacia arriba, limitar entre 0 y 5
        console.log('Puntuación promedio redondeada:', roundedScore);
        setdataAverageNew(roundedScore);
      } else {
        console.warn('Respuesta inesperada del servidor:', response.status);
        setdataCommentsNew([]);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const calculateAverageScore = comments => {
    const totalScore = comments.reduce(
      (sum, comment) => sum + (comment.puntuacion || 0),
      0,
    );
    const averageScore = totalScore / comments.length;

    return averageScore;
  };


  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    linearColorStyleTwo,
    iconColorStyle,
  } = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[external.mh_20]}
        contentContainerStyle={[external.Pb_30]}>

        <HeaderContainer value={'Comentarios'} />

        <View style={[external.mt_12, external.as_center]}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* <Text style={[styles.textContext, { color: textColorStyle, marginBottom: 5 }]}>
              {dataAverageNew}
            </Text> */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                index < dataAverageNew ? <Star size={30} key={index} /> : <UnCheckedStar size={30} key={index} />
              ))}
            </View>
          </View>
          <Text style={[commonStyles.subtitleText, external.pt_10]}>
            Basado en {dataCommentsNew?.length} comentarios
          </Text>
        </View>
        <LinearGradient
          colors={linearColorStyleTwo}
          style={styles.ratingScreenView}></LinearGradient>
        <TouchableOpacity
          style={{ alignSelf: 'flex-end' }}
          onPress={() => {
            setModalVisible(true);
          }}>
          <Text style={styles.writeReview}>Dejanos saber que piensas</Text>
        </TouchableOpacity>

        <RatingScreenContainer data={dataCommentsNew} />

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
