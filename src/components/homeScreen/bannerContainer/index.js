import React, {useRef, useState} from 'react';
import {
  View,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import styles from './style.css';

const {width} = Dimensions.get('window');

const banners = [
  images.newBannerOne,
  images.newBannerTwo,
  images.newBannerThree,
  images.newBannerFour,
];

const BannerContainer = () => {
  const [index, setIndex] = useState(0);
  const viewConfig = {viewAreaCoveragePercentThreshold: 50};

  const onViewRef = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index);
    }
  });

  return (
    <View style={[external.mt_20, external.mh_20]}>
      <FlatList
        data={banners}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.bannerWrapper}>
            <ImageBackground
              source={item}
              resizeMode="cover"
              style={styles.imgStyle}
            />
          </View>
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfig}
      />

      {/* Indicadores */}
      <View style={styles.dotsContainer}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerContainer;
