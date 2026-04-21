import {ScrollView, Text, View, Alert, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import { external } from '../../style/external.css';
import { commonStyles } from '../../style/commonStyle.css';
import styles from './style.css';
import RatingScreenContainer from '../../components/ratingScreenContainer';
import { useValues } from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import BeautifulModal from './components/modal';
import { Star, UnCheckedStar } from '../../utils/icon';
import { ArrowLeft } from 'lucide-react-native';

const RatingScreen = () => {
  const route = useRoute();
  const navigate = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [dataCommentsNew, setdataCommentsNew] = useState([]);
  const [dataAverageNew, setdataAverageNew] = useState(0);

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
    linearColorStyleTwo,
  } = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      <View style={styles.headerBlock}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigate.goBack()}
            activeOpacity={0.85}
            style={styles.topNavBackBtn}>
            <ArrowLeft size={20} color="#FFD60A" />
          </TouchableOpacity>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Comentarios</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{dataCommentsNew?.length || 0} opiniones</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>
          {'Conoce lo que dicen '}
          <Text style={styles.headerAccent}>nuestros usuarios</Text>
        </Text>

        <Text style={styles.headerSubtitle}>
          Mira experiencias reales y comparte tu opinion de forma rapida y sencilla
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[external.mh_20]}
        contentContainerStyle={[external.Pb_30]}>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryTitle}>Puntuacion general</Text>
            <View style={styles.summaryCountChip}>
              <Text style={styles.summaryCountChipText}>{dataCommentsNew?.length || 0} opiniones</Text>
            </View>
          </View>

          <View style={styles.summaryScoreRow}>
            <Text style={styles.summaryScoreValue}>{Number(dataAverageNew || 0).toFixed(1)}</Text>
            <View style={styles.summaryStarsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                index < dataAverageNew ? <Star size={30} key={index} /> : <UnCheckedStar size={30} key={index} />
              ))}
            </View>
          </View>

          <Text style={styles.summarySubtitle}>
            Basado en {dataCommentsNew?.length || 0} comentarios reales de usuarios
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewBtn}
          onPress={() => {
            setModalVisible(true);
          }}>
          <Text style={styles.writeReviewBtnText}>Calificar mi experiencia</Text>
        </TouchableOpacity>

        {dataCommentsNew?.length > 0 ? (
          <RatingScreenContainer data={dataCommentsNew} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aun no hay comentarios</Text>
            <Text style={styles.emptySubtitle}>Se el primero en compartir tu experiencia.</Text>
          </View>
        )}

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
