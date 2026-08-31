import {Text, View} from 'react-native';
import React from 'react';
import {ratingScreen} from '../../../../data/ratingScreen';
import {external} from '../../../../style/external.css';
import styles from './styles.css';
import {useValues} from '../../../../../App';

const ReviewScreen = () => {
  const {textColorStyle, t} = useValues();

  return (
    <View style={[external.pv_5]}>
      {ratingScreen.map((item, index) => (
        <View
          style={[
            external.fd_row,
            external.ai_center,
            external.mh_20,
            external.pt_10,
          ]}>
          <Text style={[styles.titleText, {color: textColorStyle}]}>
            {t(item.title)}
          </Text>
          <View style={[styles.progressBar]}>
            <View style={[styles.progressBarPrimary, {width: item.width}]} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default ReviewScreen;
