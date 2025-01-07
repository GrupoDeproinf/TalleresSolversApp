import {FlatList, Image, Text, View} from 'react-native';
import React from 'react';
import appColors from '../../themes/appColors';
import {otherReview} from '../../data/ratingScreen';
import {commonStyles} from '../../style/commonStyle.css';
import {fontSizes} from '../../themes/appConstant';
import {external} from '../../style/external.css';
import SolidLine from '../../commonComponents/solidLine';
import {styles} from './styles.css';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';

const RatingScreenContainer = (data) => {
  const {linearColorStyle, linearColorStyleTwo, textColorStyle} = useValues();
  console.log('Data:', data);
  console.log('*************************************5632')
  const renderItem = ({item}) => (
    <View>
      <View
        style={[
          external.ph_20,
          external.fd_row,
          external.ai_center,
          external.pv_15,
        ]}>
        <Image style={styles.img} source={item.img} />
        <View style={[external.ph_20]}>
          <Text
            style={[
              commonStyles.titleText19,
              {fontSize: fontSizes.FONT17},
              {color: textColorStyle},
            ]}>
            {item.usuario.nombre}
          </Text>
          <Text
            style={[
              commonStyles.titleText19,
              {fontSize: fontSizes.FONT17, color: appColors.subtitle},
            ]}>
            {moment(item.fecha_creacion).format('DD/MM/YYYY')}
          </Text>
          <Text style={[styles.subtitle, {color: textColorStyle}]}>
            {item.comentario}
          </Text>
        </View>
      </View>
      <View>
        <SolidLine />
      </View>
    </View>
  );
  return (
    <LinearGradient colors={linearColorStyleTwo} style={styles.container}>
      <LinearGradient colors={linearColorStyle} style={styles.containerTwo}>
        <FlatList data={data.data} renderItem={renderItem} />
      </LinearGradient>
    </LinearGradient>
  );
};

export default RatingScreenContainer;
