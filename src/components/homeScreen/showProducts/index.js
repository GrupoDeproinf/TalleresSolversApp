import React, {useState} from 'react';
import {View, Text, FlatList, Image, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {StarRatingDisplay} from 'react-native-star-rating-widget';
import styles from './styles.css';
import {windowHeight} from '../../../themes/appConstant';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';
import { MapPin } from 'lucide-react-native';
import { Wrench } from 'lucide-react-native';
import { Navigation } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';

// Note: Some imports and styles are omitted for brevity

const ShowProductsContainer = React.memo(({
  data,
  value,
  show,
  showPlus,
  marginTop,
  userLocation,
}) => {
  const {
    linearColorStyle,
    textColorStyle,
    isDark,
    imageContainer,
    textRTLStyle,
    viewRTLStyle,
    t,
    linearColorStyleTwo,
    currSymbol,
    currPrice,
  } = useValues();
  const navigation = useNavigation();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];



  const [visibleHint, setVisibleHint] = useState(false);
  const [statusLabel, setstatusLabel] = useState(false);

  const goToDetail = item => {
    console.log(item);

    navigation.navigate('ProductDetailOne', { uid: item.uid_servicio || item.id });
  };

  const onLongPressHandler = (itemId, status) => {
    setVisibleHint(itemId); // Muestra el Snackbar para el ítem presionado
    setstatusLabel(status);
    setTimeout(() => {
      setVisibleHint(null); // Oculta el Snackbar después de un tiempo
    }, 1000);
  };

  const onDismissHint = () => {
    setVisibleHint(null); // Oculta el Snackbar cuando se presiona para cerrar
  };

  const toRad = React.useCallback((value) => {
    return (value * Math.PI) / 180;
  }, []);

  const calcularDistancia = React.useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [toRad]);

    const color = isDark ? appColors.blackBg : appColors.bgLayout;
  
  // Función para ordenar los datos por distancia - optimizada para evitar re-renderizados
  const sortedData = React.useMemo(() => {
    if (!userLocation || !data || data.length === 0) {
      return data;
    }

    // Verificar si realmente necesitamos re-ordenar
    const hasLocationData = data.some(item => 
      item?.taller?.ubicacion?.lat && item?.taller?.ubicacion?.lng
    );
    
    if (!hasLocationData) {
      return data; // No hay datos de ubicación, mantener orden original
    }

    return [...data].sort((a, b) => {
      const aHasLocation = a?.taller?.ubicacion?.lat && a?.taller?.ubicacion?.lng;
      const bHasLocation = b?.taller?.ubicacion?.lat && b?.taller?.ubicacion?.lng;

      // Si ambos tienen ubicación, comparar distancias
      if (aHasLocation && bHasLocation) {
        const distanciaA = calcularDistancia(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(a.taller.ubicacion.lat),
          parseFloat(a.taller.ubicacion.lng)
        );
        const distanciaB = calcularDistancia(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(b.taller.ubicacion.lat),
          parseFloat(b.taller.ubicacion.lng)
        );
        return distanciaA - distanciaB; // Ordenar de menor a mayor
      }

      // Si solo uno tiene ubicación, poner el que tiene ubicación primero
      if (aHasLocation && !bHasLocation) return -1;
      if (!aHasLocation && bHasLocation) return 1;

      // Si ninguno tiene ubicación, mantener orden original
      return 0;
    });
  }, [data, userLocation?.latitude, userLocation?.longitude]);

  const renderItem = React.useCallback(({item}) => {
    // Calcular distancia si tenemos la ubicación del usuario y del taller
    if (userLocation && item?.taller?.ubicacion?.lat && item?.taller?.ubicacion?.lng) {
      const distancia = calcularDistancia(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(item.taller.ubicacion.lat),
        parseFloat(item.taller.ubicacion.lng)
      );
    }
    
    return (
    <TouchableOpacity style={stylesNew.container} onPress={() => goToDetail(item)} activeOpacity={0.8}>
      <View style={stylesNew.gradientBackground}>
        <View style={[stylesNew.content, { flexDirection: viewRTLStyle }]}>
          {/* Imagen del servicio con el estilo del icono */}
          <View style={[stylesNew.imageContainer, { backgroundColor: color }]}>
            <Image
              style={stylesNew.serviceImage}
              source={{
                uri: Array.isArray(item?.service_image) ? item?.service_image[0] : item?.service_image,
              }}
            />
          </View>

          {/* Contenido principal */}
          <View style={stylesNew.leftContent}>
            {/* Header con nombre del servicio y badge de categoría */}
            <View style={[stylesNew.header, { flexDirection: viewRTLStyle }]}>
              <Text style={[stylesNew.serviceName, { color: textColorStyle, textAlign: textRTLStyle }]} numberOfLines={2}>
                {t(item.nombre_servicio)}
              </Text>
            </View>

            {/* Nombre del taller */}
            <View style={stylesNew.tallerContainer}>
              <MapPin size={12} color="#64748B" />
              <Text style={[stylesNew.tallerName, { textAlign: textRTLStyle }]} numberOfLines={1}>
                {t(item?.taller?.nombre || item?.taller || "Nombre no disponible")}
              </Text>
            </View>
            {item?.categoria && (
                <View style={stylesNew.tallerContainer}>
                  <Wrench size={10} color="#64748B" />
                  <Text style={stylesNew.tallerName}>{t(item.categoria)}</Text>
                </View>
              )}

            {/* Estado del taller y distancia en la misma fila */}
            <View style={stylesNew.statusAndDistanceRow}>
              {(item?.taller?.estado || item?.estado) && (
                <View style={stylesNew.statusContainer}>
                  <View style={stylesNew.statusDot} />
                  <Text style={stylesNew.statusText}>{t(item?.taller?.estado || item?.estado || "")}</Text>
                </View>
              )}

              {userLocation && item?.taller?.ubicacion?.lat && item?.taller?.ubicacion?.lng && (
                <View style={stylesNew.distanceContainer}>
                  <Navigation size={10} color="#3A4A85" />
                  <Text style={stylesNew.distanceText}>
                    {calcularDistancia(
                      userLocation.latitude,
                      userLocation.longitude,
                      parseFloat(item.taller.ubicacion.lat),
                      parseFloat(item.taller.ubicacion.lng)
                    ).toFixed(1)} km
                  </Text>
                </View>
              )}
            </View>

            {/* Información adicional si existe */}
            
          </View>

          
        </View>
      </View>
         </TouchableOpacity>
   );
   }, [userLocation, textColorStyle, viewRTLStyle, color, t, goToDetail]);

  return (
    <>
      <View style={styles.newArrivalContainer}>
        <View style={{marginTop: marginTop || windowHeight(14)}}>
        {data.length > 0 ? (
          <H3HeadingCategory value={value} />
        ): null}
      </View>
        <FlatList
          data={sortedData || []}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
        />
      </View>
    </>
  );
});

const stylesNew = StyleSheet.create({
  container: {
    marginHorizontal: 4,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: "#3A4A85",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientBackground: {
    backgroundColor: "#FEFEFE",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EAF0",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // shadowColor: "#3A4A85",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 2,
    // elevation: 2,
    overflow: "hidden",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 12,
    
    fontWeight: "700",
    color: "#2D3748",
    flex: 1,
    marginRight: 8,
    textTransform: "uppercase",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D9E8",
    minWidth: 50,
  },
  categoryText: {
    fontSize: 10,
    color: "#3A4A85",
    marginLeft: 3,
    fontWeight: "600",
  },
  tallerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tallerName: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
    flex: 1,
    fontWeight: "500",
  },
  statusAndDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F9A825",
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#B45309",
    fontWeight: "600",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D9E8",
  },
  distanceText: {
    fontSize: 10,
    color: "#3A4A85",
    marginLeft: 4,
    fontWeight: "600",
  },
  rightContent: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffca00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffca00",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  locationContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3261',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3261',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
});

// Función de comparación personalizada para evitar re-renderizados innecesarios
const arePropsEqual = (prevProps, nextProps) => {
  // Comparar datos
  if (prevProps.data?.length !== nextProps.data?.length) return false;
  
  // Comparar ubicación del usuario
  if (prevProps.userLocation?.latitude !== nextProps.userLocation?.latitude ||
      prevProps.userLocation?.longitude !== nextProps.userLocation?.longitude) return false;
  
  // Comparar otras props importantes
  if (prevProps.value !== nextProps.value ||
      prevProps.marginTop !== nextProps.marginTop) return false;
  
  return true;
};

export default React.memo(ShowProductsContainer, arePropsEqual);