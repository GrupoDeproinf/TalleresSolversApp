import React from 'react';
import {ImageBackground, Text, View, TouchableOpacity} from 'react-native';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import {grabToday, showNow, trendigOffers} from '../../../constant';
import {styles} from './style.css';
import {commonStyles} from '../../../style/commonStyle.css';
import TrendingAnimation from '../trendignAnimation';
import {LeftSideArrow} from '../../../assets/icons/leftSideArrow';
import {fontSizes} from '../../../themes/appConstant';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {useValues} from '../../../../App';

const TrendingOffer = () => {
  const {t} = useValues();
  return (
    <View style={[styles.container, external.mt_20]}>
      <H3HeadingCategory value={t('transData.trendigOffers')} />
      <ImageBackground
        resizeMode="stretch"
        style={styles.imageBackground}
        source={images.sliderBg}>
        <Text style={[styles.text, external.ph_20]}>
          20 % off <Text style={styles.subText}>in Headphones & Airpods</Text>
        </Text>
        <Text style={[styles.subTitleText, external.ph_20]}>{grabToday}</Text>
        <TouchableOpacity style={[styles.shopButton]}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ph_5,
              {fontSize: fontSizes.FONT16},
            ]}>
            {t('transData.showNow')}
          </Text>
          <LeftSideArrow />
        </TouchableOpacity>
      </ImageBackground>
      <TrendingAnimation />
    </View>
  );
};

export default TrendingOffer;
