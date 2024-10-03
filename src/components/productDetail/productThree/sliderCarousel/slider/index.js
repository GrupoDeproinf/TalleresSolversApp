import {Dimensions, Image, View} from 'react-native';
import React, {useRef} from 'react';
import {sliderDataTwo} from '../../../../../data/productDetailBrand';
import Carousel from 'react-native-snap-carousel';
import {styles} from './styles';
import {external} from '../../../../../style/external.css';
const {width, height} = Dimensions.get('window');

const cardWidth = width - 230;
const Slider = () => {
  const carouselRef = useRef();
  const renderItem = ({item}) => {
    return (
      <View
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
          },
        ]}>
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              height: height * 0.3,
            },
          ]}>
          <Image style={styles.cardText} source={item.images} />
        </View>
      </View>
    );
  };
  return (
    <View style={[external.mt_20]}>
      <Carousel
        ref={carouselRef}
        data={sliderDataTwo}
        renderItem={renderItem}
        horizontal={true}
        sliderWidth={width}
        inactiveSlideOpacity={1}
        itemWidth={cardWidth}
        inactiveSlideScale={0.2}
        enableSnap
        loop
        removeClippedSubviews={true}
        contentContainerCustomStyle={[external.ai_center]}
      />
    </View>
  );
};

export default Slider;
