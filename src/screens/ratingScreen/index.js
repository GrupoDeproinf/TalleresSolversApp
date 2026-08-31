import {ScrollView, Text, View, TouchableOpacity} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
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
import RatingSuccessModal from '../../commonComponents/RatingSuccessModal';
import { Star, UnCheckedStar } from '../../utils/icon';
import { ArrowLeft } from 'lucide-react-native';

const RatingScreen = () => {
  const route = useRoute();
  const navigate = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastRating, setLastRating] = useState(0);
  const [dataCommentsNew, setdataCommentsNew] = useState([]);
  const [dataAverageNew, setdataAverageNew] = useState(0);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const { dataComments, dataAverage, id, dataTotal, type } = route.params || {};
  const isTaller = type === 'taller';

  /** Título del modal: nombre del servicio si existe; si no, nombre del taller. */
  const modalExperienceName = useMemo(() => {
    const d = dataTotal;
    if (!d || typeof d !== 'object') {
      return '';
    }
    const serviceName =
      String(d.nombre_servicio ?? '').trim() || String(d.nombre ?? '').trim();
    if (serviceName) {
      return serviceName;
    }
    if (typeof d.taller === 'string' && String(d.taller).trim() !== '') {
      return String(d.taller).trim();
    }
    if (d.taller && typeof d.taller === 'object') {
      const tallerNombre = String(d.taller.nombre ?? '').trim();
      if (tallerNombre) {
        return tallerNombre;
      }
    }
    return '';
  }, [dataTotal]);


  const addComment = async (rating, comment, etiquetasRapidas = []) => {
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue ? JSON.parse(jsonValue) : null;

      if (!user) {
        console.error('Error: Usuario no encontrado en AsyncStorage');
        return;
      }

      const etiquetas = Array.isArray(etiquetasRapidas) ? etiquetasRapidas : [];
      const usuario = { uid: user.uid, nombre: user.nombre, email: user.email };

      let response;
      if (isTaller) {
        const nombreTaller =
          dataTotal?.nombre_taller || dataTotal?.nombre || dataTotal?.razon_social || '';
        response = await api.post('/home/addCommentToTaller', {
          uid_taller: id,
          nombre_taller: nombreTaller,
          comentario: comment,
          puntuacion: rating,
          etiquetas_rapidas: etiquetas,
          usuario,
        });
      } else {
        response = await api.post('/home/addCommentToService', {
          uid_service: id,
          comentario: comment,
          puntuacion: rating,
          nombre_taller: dataTotal?.taller,
          uid_taller: dataTotal?.uid_taller,
          etiquetas_rapidas: etiquetas,
          usuario,
        });
      }

      if (response.status === 201) {
        setModalVisible(false);
        setLastRating(rating);
        setSuccessModalVisible(true);
        getComments(id);
      } else {
        console.error('Error en la API. Código de estado:', response.status);
      }
    } catch (error) {
      console.error('Error en addComment:', error);
    }
  };

  useEffect(() => {
    getComments(id);
  }, []);

  const getComments = async id => {
    try {
      let response;
      if (isTaller) {
        response = await api.post('/home/getCommentsByTaller', {
          uid_taller: id,
        });
      } else {
        response = await api.post('/home/getCommentsByService', {
          uid_service: id,
        });
      }

      if (response.status === 200) {
        const sortedComments = (Array.isArray(response.data) ? response.data : []).sort((a, b) => {
          const sA = a.fecha_creacion?._seconds ?? 0;
          const sB = b.fecha_creacion?._seconds ?? 0;
          return sB - sA;
        });

        setdataCommentsNew(sortedComments);
        const averageScore = calculateAverageScore(sortedComments);
        const roundedScore = Math.min(Math.max(Math.ceil(averageScore), 0), 5);
        setdataAverageNew(roundedScore);
      } else {
        setdataCommentsNew([]);
      }
    } catch (error) {
      console.error('Error en getComments:', error);
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
        businessName={modalExperienceName}
        onSubmit={(rating, comment, etiquetasRapidas) =>
          addComment(rating, comment, etiquetasRapidas)
        }
      />

      <RatingSuccessModal
        visible={successModalVisible}
        rating={lastRating}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
};

export default RatingScreen;
