import {Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {fontSizes, windowHeight} from '../../../../themes/appConstant';
import appColors from '../../../../themes/appColors';
import {external} from '../../../../style/external.css';
import {commonStyles} from '../../../../style/commonStyle.css';
import {reviews} from '../../../../constant';
import {RightSmallArrow} from '../../../../utils/icon';
import {ratingScreen} from '../../../../data/ratingScreen';
import {useNavigation} from '@react-navigation/native';
import styles from './styles.css';
import {useValues} from '../../../../../App';
import api from '../../../../../axiosInstance';
import {X, Star} from 'lucide-react-native';

const RatingScreen = data => {
  const {textColorStyle, t, viewRTLStyle, textRTLStyle} = useValues();
  const [dataComments, setDataComments] = useState(null);
  const [dataAverage, setDataAverage] = useState(null);
  const navigation = useNavigation();

  const calculateAverageScore = comments => {
    const totalScore = comments.reduce(
      (sum, comment) => sum + (comment.puntuacion || 0),
      0,
    );
    const averageScore = totalScore / comments.length;

    return averageScore;
  };

  // Ejemplo de uso en tu función:
  const getComments = async data => {
    try {
      const response = await api.post('/home/getCommentsByService', {
        uid_service: data.id,
      });

      if (response.status === 200) {
        setDataComments(response.data);

        const averageScore = calculateAverageScore(response.data);
        setDataAverage(averageScore.toFixed(1));
      } else {
        console.warn('Respuesta inesperada del servidor:', response.status);
        setDataComments([]);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  useEffect(() => {
    // console.log('data:', data.data)
    getComments(data.data);
  }, []);

  return (
    <View>
      <View
        style={{
          backgroundColor: appColors.bgLayout,
          marginTop: windowHeight(15),
        }}>
        <View style={[external.ph_20, external.pv_15]}>
          <View
            style={[
              external.fd_row,
              external.ai_center,
              {flexDirection: viewRTLStyle},
            ]}>
            <Text
              style={[
                commonStyles.titleText19,
                external.fg_1,
                {fontSize: fontSizes.FONT17},
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {'Comentarios'} :
            </Text>
            <TouchableOpacity
              style={[external.fd_row, external.ai_center]}
              onPress={() =>
                navigation.navigate('RatingScreen', {
                  dataComments: dataComments,
                  dataAverage: dataAverage,
                  id: data.data.id,
                  dataTotal: data.data,
                })
              }>
              <Text
                style={[
                  commonStyles.titleText19,
                  {fontSize: fontSizes.FONT17},
                  {color: textColorStyle},
                ]}>
                {dataComments?.length}
              </Text>
              <RightSmallArrow />
            </TouchableOpacity>
          </View>
          <View
            style={[
              external.fd_row,
              {alignItems: 'center', justifyContent: 'center'},
            ]}>
            <View style={styles.viewContainer}>
              <Text style={[styles.fourPointOne, {alignItems: 'center', justifyContent: 'center'}]}>
                {dataAverage} <Star size={15} color={'#D3D3D3'} fill={'none'} />
              </Text>
              <Text style={styles.outOfFive}>de 5</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RatingScreen;
