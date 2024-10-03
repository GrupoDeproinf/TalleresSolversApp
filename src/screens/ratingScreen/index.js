import {ScrollView, Text, View} from 'react-native';
import React from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {
  allReview,
  basedReviews,
  otherReviews,
  reviews,
  writeYourReview,
} from '../../constant';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import styles from './style.css';
import CustomRatingBars from '../../commonComponents/customRating';
import {ratingScreen} from '../../data/ratingScreen';
import {fontSizes} from '../../themes/appConstant';
import {DownArrow} from '../../utils/icon';
import RatingScreenContainer from '../../components/ratingScreenContainer';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

const RatingScreen = () => {
  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    linearColorStyleTwo,
    iconColorStyle,
  } = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[external.mh_20]}
        contentContainerStyle={[external.Pb_30]}>
        <HeaderContainer value={reviews} />
        <View style={[external.mt_12, external.as_center]}>
          <Text style={[styles.textContext, {color: textColorStyle}]}>4.0</Text>
          <CustomRatingBars />
          <Text style={[commonStyles.subtitleText, external.pt_10]}>
            {basedReviews}
          </Text>
        </View>
        <LinearGradient
          colors={linearColorStyleTwo}
          style={styles.ratingScreenView}>
          <LinearGradient
            colors={linearColorStyle}
            style={styles.ratingScreenView}>
            {ratingScreen.map((item, index) => (
              <View style={styles.mapView}>
                <Text style={[styles.titleText, {color: textColorStyle}]}>
                  {item.title}
                </Text>
                <View style={[styles.progressBar]}>
                  <View
                    style={[styles.progressBarPrimary, {width: item.width}]}
                  />
                </View>
                <Text style={[commonStyles.subtitleText, external.mh_20]}>
                  {item.range}
                </Text>
              </View>
            ))}
          </LinearGradient>
        </LinearGradient>
        <Text style={styles.writeReview}>{writeYourReview}</Text>
        <View style={styles.viewText}>
          <Text
            style={[
              commonStyles.titleText19,
              {fontSize: fontSizes.FONT21},
              {color: textColorStyle},
            ]}>
            {otherReviews}
          </Text>
          <LinearGradient colors={linearColorStyle} style={styles.allReview}>
            <LinearGradient colors={linearColorStyle} style={styles.allReview}>
              <Text
                style={[
                  commonStyles.titleText19,
                  external.ph_8,
                  {color: textColorStyle},
                ]}>
                {allReview}
              </Text>
              <DownArrow color={iconColorStyle} />
            </LinearGradient>
          </LinearGradient>
        </View>
        <RatingScreenContainer />
      </ScrollView>
    </View>
  );
};

export default RatingScreen;
