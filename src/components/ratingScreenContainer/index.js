import {FlatList, Image, Text, View} from 'react-native';
import React from 'react';
import appColors from '../../themes/appColors';
import {otherReview} from '../../data/ratingScreen';
import {commonStyles} from '../../style/commonStyle.css';
import {fontSizes} from '../../themes/appConstant';
import {external} from '../../style/external.css';
import {styles} from './styles.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import {Star} from '../../utils/icon';

const RatingScreenContainer = (data) => {
  const {linearColorStyle, linearColorStyleTwo, textColorStyle} = useValues();
  console.log('Data:', data);
  console.log('*************************************5632')
  const renderItem = ({item}) => {
    const avatarSource =
      item?.usuario?.image_perfil &&
      typeof item.usuario.image_perfil === 'string' &&
      item.usuario.image_perfil.trim() !== ''
        ? {uri: item.usuario.image_perfil}
        : require('../../assets/noimageNew.png');
    const puntuacion = Number(item?.puntuacion || 0);

    return (
      <View style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Image style={styles.img} source={avatarSource} />
          <View style={styles.commentHeaderText}>
            <Text
              style={[
                commonStyles.titleText19,
                {fontSize: fontSizes.FONT16, color: textColorStyle},
              ]}>
              {item?.usuario?.nombre || 'Usuario'}
            </Text>
            <Text style={styles.commentDateText}>
              {item?.fecha_creacion?._seconds
                ? moment.unix(item.fecha_creacion._seconds).format('DD/MM/YYYY')
                : 'Sin fecha'}
            </Text>
          </View>
          <View style={styles.scoreChip}>
            <Star size={14} />
            <Text style={styles.scoreChipText}>{Number.isFinite(puntuacion) ? puntuacion : 0}</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, {color: textColorStyle}]}>
          {item?.comentario || 'Sin comentario'}
        </Text>
      </View>
    );
  };
  return (
    <LinearGradient colors={linearColorStyleTwo} style={styles.container}>
      <LinearGradient colors={linearColorStyle} style={styles.containerTwo}>
        <FlatList
          data={data.data}
          renderItem={renderItem}
          keyExtractor={(item, idx) => String(item?.id || item?._id || idx)}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </LinearGradient>
  );
};

export default RatingScreenContainer;
