import {Text, View} from 'react-native';
import React from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Bus, Refresh} from '../../../../utils/icon';
import appColors from '../../../../themes/appColors';
import {useValues} from '../../../../../App';
import styles from './styles.css';

const DeliverContainer = () => {
  const {textColorStyle} = useValues();
  return (
    <View>
      <View style={styles.refreshIcon}>
        <IconBackground
          value={<Refresh />}
          backgroundColor={appColors.screenBg}
        />
        <Text style={[styles.upTofive, {color: textColorStyle}]}>
          Up to 7 days returnable
        </Text>
        <View style={styles.verticalLine} />
        <IconBackground value={<Bus />} backgroundColor={appColors.screenBg} />
        <Text style={[styles.deliveryIn, {color: textColorStyle}]}>
          Delivery in 3 days
        </Text>
      </View>
    </View>
  );
};

export default DeliverContainer;
