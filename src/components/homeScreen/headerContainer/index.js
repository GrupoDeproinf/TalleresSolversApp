import {Image, Text, View} from 'react-native';
import React from 'react';
import {external} from '../../../style/external.css';
import IconBackground from '../../../commonComponents/iconBackGround';
import {hiSmitha} from '../../../constant';
import {Drawer, Heart, Notification, Offer} from '../../../utils/icon';
import {commonStyles} from '../../../style/commonStyle.css';
import {useNavigation} from '@react-navigation/native';
import images from '../../../utils/images';
import styles from './style.css';
import {useValues} from '../../../../App';

const HeaderContainer = ({onPress}) => {
  const navigation = useNavigation('');
  const {textColorStyle, viewRTLStyle, t} = useValues();
  return (
    <View
      style={[
        external.fd_row,
        external.ai_center,
        external.js_space,
        external.ph_20,
        {flexDirection: viewRTLStyle},
      ]}>
      <View
        style={[
          external.fd_row,
          external.ai_center,
          {flexDirection: viewRTLStyle},
        ]}>
        <IconBackground value={<Drawer />} onPress={onPress} />
        <View style={[external.ml_5]}>
          <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
            {t('transData.hiSmitha')}
          </Text>
        </View>
        <Image style={styles.img} source={images.hifi} />
      </View>
      <View style={[external.fd_row, external.ai_center]}>
        <IconBackground
          onPress={() => navigation.navigate('MyWhishList')}
          value={<Heart />}
        />
        <View style={[external.mh_8]}>
          <IconBackground
            value={<Offer />}
            onPress={() => navigation.navigate('OfferScreen')}
          />
        </View>
        <IconBackground
          onPress={() => navigation.navigate('NotificationScreen')}
          value={<Notification />}
        />
      </View>
    </View>
  );
};

export default HeaderContainer;
