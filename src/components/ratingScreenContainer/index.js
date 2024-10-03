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

const RatingScreenContainer = () => {
  const {linearColorStyle, linearColorStyleTwo, textColorStyle} = useValues();
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
            {item.title}
          </Text>
          <Text
            style={[
              commonStyles.titleText19,
              {fontSize: fontSizes.FONT17, color: appColors.subtitle},
            ]}>
            {item.hours}
          </Text>
          <Text style={[styles.subtitle, {color: textColorStyle}]}>
            {item.subtitle}
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
        <FlatList data={otherReview} renderItem={renderItem} />
      </LinearGradient>
    </LinearGradient>
  );
};

export default RatingScreenContainer;
