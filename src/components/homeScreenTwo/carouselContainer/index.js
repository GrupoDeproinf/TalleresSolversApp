import {ImageBackground, Text, View} from 'react-native';
import React from 'react';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {windowWidth} from '../../../themes/appConstant';
import {carouselData} from '../../../data/homeScreenTwo/carouselData';
import styles from './styles';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {useValues} from '../../../../App';

const CarouselContainer = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const {t} = useValues();
  const renderItem = ({item}) => {
    return (
      <View style={[styles.container, styles.mt_20, styles.mh_20]}>
        <ImageBackground
          resizeMode="stretch"
          style={styles.imageBackground}
          source={item.img}>
          <Text
            style={[commonStyles.subtitleText, external.mt_40, styles.mh_20]}>
            {t(item.title)}
          </Text>
          <Text style={[commonStyles.H1Banner, styles.mh_20]}>
            {t(item.subtitle)}
          </Text>
          <Text
            style={[
              styles.titleText19,
              styles.mh_20,
              external.mt_10,
              styles.shopNow,
            ]}>
            {t(item.shopNow)}
          </Text>
        </ImageBackground>
      </View>
    );
  };

  return (
    <>
      <Carousel
        data={carouselData}
        renderItem={renderItem}
        sliderWidth={windowWidth(530)}
        itemWidth={windowWidth(425)}
        activeSlideAlignment="start"
        onSnapToItem={index => setActiveIndex(index)}
      />
      <Pagination
        dotsLength={carouselData.length}
        activeDotIndex={activeIndex}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.activeDot}
        inactiveDotStyle={styles.inactiveDot}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    </>
  );
};

export default CarouselContainer;
