import {Text, View} from 'react-native';
import React from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Bus, Refresh} from '../../../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../../../App';

const IconContainer = () => {
  const {isDark, textColorStyle} = useValues();
  return (
    <View
      style={[
        styles.refreshIcon,
        {backgroundColor: isDark ? '#24272d' : '#EEF0F3'},
      ]}>
      <IconBackground value={<Refresh />} backgroundColor={'#EEF0F3'} />
      <Text style={[styles.upTofive, {color: textColorStyle}]}>
        Up to 7 days returnable
      </Text>
      <View style={styles.verticalLine} />
      <IconBackground value={<Bus />} backgroundColor={'#EEF0F3'} />
      <Text style={[styles.deliveryIn, {color: textColorStyle}]}>
        Delivery in 3 days
      </Text>
    </View>
  );
};

export default IconContainer;
