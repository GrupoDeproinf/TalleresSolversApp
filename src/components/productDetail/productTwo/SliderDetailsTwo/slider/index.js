import React, {useEffect, useRef, useState} from 'react';
import {View, Dimensions, Image, Animated} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import {useValues} from '../../../../../../App';
import {styles} from './styles';
import appColors from '../../../../../themes/appColors';
import {sliderData} from '../../../../../data/productDetailBrand';

const {width, height} = Dimensions.get('window');
const cardWidth = width - 205;

const Slider = () => {
  const {viewRTLStyle, isDark} = useValues();
  const barWidth = width - 200;
  const [progress, setProgress] = useState(new Animated.Value(0));
  const carouselRef = useRef();
  useEffect(() => {
    startAnim(0);
  }, []);

  const startAnim = index => {
    const val =
      index === 0
        ? sliderData.length
        : sliderData.length === index + 1
        ? 1
        : index + 1;
    Animated.timing(progress, {
      toValue: barWidth / val,
      duration: 500,
    }).start();
  };
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
              height: height * 0.4,
            },
          ]}>
          <Image style={styles.cardText} source={item.images} />
        </View>
      </View>
    );
  };

  return (
    <View>
      <Carousel
        ref={carouselRef}
        data={sliderData}
        renderItem={renderItem}
        horizontal
        sliderWidth={width}
        inactiveSlideOpacity={0.7}
        itemWidth={cardWidth}
        inactiveSlideScale={0.5}
        onSnapToItem={index => {
          startAnim(index);
        }}
      />
      <View style={[{flexDirection: viewRTLStyle, width: '100%'}]}>
        <View
          style={[
            styles.barContainer,
            {
              width: barWidth,
              backgroundColor: isDark
                ? appColors.darkScreenBg
                : appColors.screenBg,
            },
          ]}>
          <Animated.View
            style={[
              styles.bar,
              {
                width: progress,
                backgroundColor: isDark
                  ? appColors.screenBg
                  : appColors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default Slider;
