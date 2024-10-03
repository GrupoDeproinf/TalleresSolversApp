import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import BottomContainer from '../../../commonComponents/bottomContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {windowWidth} from '../../../themes/appConstant';
import {external} from '../../../style/external.css';
import {Plus} from '../../../utils/icon';
import {addtoBag, buyNow, writeYourReview} from '../../../constant';
import styles from './style.css';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {newArrivalBigData} from '../../../data/homeScreenTwo/newArrivalData';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {Cart} from '../../../assets/icons/cart';
import DetailsTextContainer from '../../../components/productDetail/productOne/detailsText';
import DescriptionText from '../../../components/productDetail/productOne/descriptionText';
import InfoContainer from '../../../components/productDetail/productOne/infoContainer';
import BrandData from '../../../components/productDetail/productOne/brandData';
import IconProduct from '../../../components/productDetail/productOne/iconProduct';
import KeyFeatures from '../../../components/productDetail/productOne/keyFeatures';
import RatingScreen from '../../../components/productDetail/productOne/reviewScreen';
import {useValues} from '../../../../App';
import SliderDetails from '../../../components/productDetail/productOne/sliderDetails';

const ProductDetailOne = ({navigation}) => {
  const {bgFullStyle, textColorStyle, t, textRTLStyle, iconColorStyle} =
    useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[external.Pb_80]}
        style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
        <View>
          <SliderDetails />
          <View style={[external.mh_20]}>
            <Text
              style={[
                commonStyles.titleText19,
                external.mt_8,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t('transData.Beatssolo3')}
            </Text>
            <Text
              style={[commonStyles.subtitleText, {textAlign: textRTLStyle}]}>
              {t('transData.headphones')}
            </Text>
            <DetailsTextContainer />
            <DescriptionText />
            <InfoContainer />
            <BrandData />
            <IconProduct />
            <KeyFeatures />
          </View>
        </View>
        <RatingScreen />
        <Text style={styles.writeYourReview}>{writeYourReview}</Text>
        <View style={[external.mh_20, external.mt_20]}>
          <H3HeadingCategory
            value={'Similar Products'}
            seeall={t('transData.seeAll')}
          />
          <NewArrivalBigContainer
            data={newArrivalBigData}
            horizontal={true}
            width={windowWidth(205)}
          />
        </View>
      </ScrollView>
      <View style={styles.bottomContainerView}>
        <BottomContainer
          leftValue={
            <View style={[external.fd_row, external.ai_center, external.mh_20]}>
              <View
                style={[external.mh_15, external.fd_row, external.ai_center]}>
                <Plus color={iconColorStyle} />
                <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                  {addtoBag}
                </Text>
              </View>
            </View>
          }
          value={
            <TouchableOpacity
              onPress={() => navigation.navigate('AddtocartOne')}
              style={[external.fd_row, external.ai_center, external.pt_4]}>
              <Cart />
              <Text style={styles.buyNowText}>{buyNow}</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
};

export default ProductDetailOne;
