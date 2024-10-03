import {ScrollView} from 'react-native';
import React from 'react';
import HeaderContainer from '../../components/homeScreen/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import styles from './style.css';
import {external} from '../../style/external.css';
import CarouselContainer from '../../components/homeScreenTwo/carouselContainer';
import WhosTrending from '../../components/homeScreenTwo/whosTending';
import {dealDataTwo} from '../../data/homeScreen/dealData';
import DealContainer from '../../components/homeScreen/dealContainer';
import TopBrandContainerTwo from '../../components/homeScreenTwo/topBrandContainerTwo';
import {
  justWatchedData,
  newArrivalBigData,
  topRatingData,
} from '../../data/homeScreenTwo/newArrivalData';
import NewArrivalBigContainer from '../../components/homeScreenTwo/newArrivalTwoContainer';
import {justWatcheds, newArrival, topRating} from '../../constant';
import {useValues} from '../../../App';
import SwiperProduct from '../../components/homeScreenTwo/swiperProduct';
import {useNavigation} from '@react-navigation/native';

const HomeScreenTwo = () => {
  const {bgFullStyle} = useValues();
  const navigation = useNavigation();
  const {t} = useValues();

  return (
    <ScrollView
      contentContainerStyle={[external.Pb_80]}
      style={[styles.container, {backgroundColor: bgFullStyle}]}
      showsVerticalScrollIndicator={false}>
      <HeaderContainer onPress={() => navigation.goBack('')} />
      <SearchContainer show={true} />
      <CarouselContainer />
      <SwiperProduct />
      <NewArrivalBigContainer
        data={newArrivalBigData}
        value={t('transData.newArrival')}
        horizontal={true}
        show={true}
      />
      <WhosTrending />
      <NewArrivalBigContainer
        data={topRatingData}
        value={t('transData.topRating')}
        horizontal={true}
        show={true}
      />
      <DealContainer data={dealDataTwo} />
      <NewArrivalBigContainer
        data={justWatchedData}
        width={178}
        value={justWatcheds}
        horizontal={true}
        show={true}
      />
      <TopBrandContainerTwo />
    </ScrollView>
  );
};

export default HomeScreenTwo;
