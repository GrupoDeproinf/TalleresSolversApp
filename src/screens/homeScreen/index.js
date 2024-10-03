import {ScrollView} from 'react-native';
import React from 'react';
import HeaderContainer from '../../components/homeScreen/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import BannerContainer from '../../components/homeScreen/bannerContainer';
import NewArrivalContainer from '../../components/homeScreen/newArrivalContainer';
import styles from './style.css';
import {newArrivalSmallData} from '../../data/homeScreen/newArrivalData';
import TrendingContainer from '../../components/homeScreen/trendingContainer';
import {external} from '../../style/external.css';
import DealContainer from '../../components/homeScreen/dealContainer';
import TopBrandContainer from '../../components/homeScreen/topBrandContainer';
import {dealData} from '../../data/homeScreen/dealData';
import {justWatchedData} from '../../data/homeScreenTwo/newArrivalData';
import NewArrivalBigContainer from '../../components/homeScreenTwo/newArrivalTwoContainer';
import {useValues} from '../../../App';
import ProductSwiper from '../../components/homeScreen/productSwiper';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
  const {bgFullStyle, t} = useValues();
  const navigation = useNavigation('');

  return (
    <ScrollView
      contentContainerStyle={[external.Pb_80]}
      style={[styles.container, {backgroundColor: bgFullStyle}]}
      showsVerticalScrollIndicator={false}>
      <HeaderContainer onPress={() => navigation.openDrawer()} />
      <SearchContainer show={true} />
      <BannerContainer />
      <ProductSwiper />
      <NewArrivalContainer
        data={newArrivalSmallData}
        value={t('transData.newArrival')}
        show={true}
        showPlus={true}
      />
      <TrendingContainer />
      <NewArrivalContainer
        data={newArrivalSmallData}
        value={t('transData.topRating')}
        show={true}
        showPlus={true}
      />
      <DealContainer data={dealData} />
      <NewArrivalBigContainer
        data={justWatchedData}
        width={178}
        value={t('transData.justWatcheds')}
        horizontal={true}
        show={true}
      />
      <TopBrandContainer />
    </ScrollView>
  );
};

export default HomeScreen;
