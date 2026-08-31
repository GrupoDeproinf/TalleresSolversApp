import {ImageBackground, Text, View, ScrollView, Dimensions} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import styles from './style.css';
import {useValues} from '../../../../App';

const BannerContainer = () => {
  const {t} = useValues();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);

  // Array de banners disponibles
  const banners = [
    images.homeBannerOne,
    images.homeBannerTwo,
    images.homeBannerThree,
    images.homeBannerFour,
  ];
  const bannerMeta = [
    {
      chip: 'Solvers',
      title: 'Talleres confiables cerca de ti',
      subtitle: 'Encuentra servicios verificados en segundos.',
    },
    {
      chip: 'Promociones',
      title: 'Ofertas activas para tu vehiculo',
      subtitle: 'Aprovecha precios especiales y beneficios.',
    },
    {
      chip: 'Rapido',
      title: 'Atencion rapida cuando la necesitas',
      subtitle: 'Solicita y coordina sin complicaciones.',
    },
    {
      chip: 'Seguro',
      title: 'Servicio confiable y transparente',
      subtitle: 'Trabaja con talleres con mejor reputacion.',
    },
  ];

  const screenWidth = Dimensions.get('window').width - 28;

  // Función helper para reiniciar el intervalo
  const startAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % banners.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
  };

  // Función helper para detener el auto-play
  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Auto-play cada 3 segundos
  useEffect(() => {
    startAutoPlay();
    return () => {
      stopAutoPlay();
    };
  }, []);

  // Manejar el scroll manual
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  // Manejar cuando el usuario comienza a hacer scroll
  const handleScrollBeginDrag = () => {
    // Pausar el auto-play mientras el usuario hace scroll
    stopAutoPlay();
  };

  // Manejar cuando el usuario termina de hacer scroll
  const handleScrollEndDrag = () => {
    // Reanudar el auto-play después de que el usuario termine de hacer scroll
    startAutoPlay();
  };

  return (
    <View style={[external.mt_20, external.mh_15]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={{width: screenWidth}}>
        {banners.map((banner, index) => (
          <ImageBackground
            key={index}
            resizeMode="cover"
            style={[styles.imgStyle, {width: screenWidth}]}
            source={banner}>
            <View style={styles.bannerOverlay} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerChip}>
                <Text style={styles.bannerChipText}>
                  {bannerMeta[index]?.chip || 'Solvers'}
                </Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {bannerMeta[index]?.title || 'Servicios para tu vehiculo'}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {bannerMeta[index]?.subtitle || 'Encuentra el taller ideal.'}
              </Text>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>
      
      {/* Indicadores de página */}
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerContainer;
