import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Wrench, Navigation } from 'lucide-react-native';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import { windowHeight } from '../../../themes/appConstant';
import { external } from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import { useValues } from '../../../../App';

const ShowProductsContainer = React.memo(({
  data,
  value,
  marginTop,
  userLocation,
}) => {
  const {
    textColorStyle,
    viewRTLStyle,
    textRTLStyle,
    t,
    isDark,
  } = useValues();

  const navigation = useNavigation();
  const color = isDark ? appColors.blackBg : appColors.bgLayout;

  const [visibleHint, setVisibleHint] = useState(null);
  const [statusLabel, setstatusLabel] = useState(false);

  const goToDetail = useCallback((item) => {
    navigation.navigate('ProductDetailOne', { uid: item.uid_servicio || item.id });
  }, [navigation]);

  const toRad = useCallback((value) => (value * Math.PI) / 180, []);

  const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [toRad]);

  // 1️⃣ Pre-calcula distancia y ordena solo una vez
  const sortedData = useMemo(() => {
    if (!data || data.length === 0 || !userLocation) return data;

    return [...data]
      .map(item => {
        if (item?.taller?.ubicacion?.lat && item?.taller?.ubicacion?.lng) {
          const distancia = calcularDistancia(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(item.taller.ubicacion.lat),
            parseFloat(item.taller.ubicacion.lng)
          );
          return { ...item, _distanciaKm: distancia };
        }
        return item;
      })
      .sort((a, b) => {
        if (a._distanciaKm != null && b._distanciaKm != null) return a._distanciaKm - b._distanciaKm;
        if (a._distanciaKm != null) return -1;
        if (b._distanciaKm != null) return 1;
        return 0;
      });
  }, [data, userLocation, calcularDistancia]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={stylesNew.container}
      onPress={() => goToDetail(item)}
      activeOpacity={0.8}
    >
      <View style={stylesNew.gradientBackground}>
        <View style={[stylesNew.content, { flexDirection: viewRTLStyle }]}>
          {/* Imagen del servicio */}
          <View style={[stylesNew.imageContainer, { backgroundColor: color }]}>
            <Image
              style={stylesNew.serviceImage}
              source={{
                uri: Array.isArray(item?.service_image)
                  ? item?.service_image[0]
                  : item?.service_image,
              }}
            />
          </View>

          {/* Contenido principal */}
          <View style={stylesNew.leftContent}>
            <View style={[stylesNew.header, { flexDirection: viewRTLStyle }]}>
              <Text style={[stylesNew.serviceName, { color: textColorStyle, textAlign: textRTLStyle }]} numberOfLines={2}>
                {t(item.nombre_servicio)}
              </Text>
            </View>

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

            <View style={stylesNew.statusAndDistanceRow}>
              {(item?.taller?.estado || item?.estado) && (
                <View style={stylesNew.statusContainer}>
                  <View style={stylesNew.statusDot} />
                  <Text style={stylesNew.statusText}>{t(item?.taller?.estado || item?.estado || "")}</Text>
                </View>
              )}

              {item._distanciaKm != null && (
                <View style={stylesNew.distanceContainer}>
                  <Navigation size={10} color="#3A4A85" />
                  <Text style={stylesNew.distanceText}>
                    {item._distanciaKm.toFixed(1)} km
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [goToDetail, viewRTLStyle, color, textColorStyle, textRTLStyle, t]);

  return (
    <View style={stylesNew.newArrivalContainer}>
      <View style={{ marginTop: marginTop || windowHeight(14) }}>
        {data.length > 0 && <H3HeadingCategory value={value} />}
      </View>

      <FlatList
        data={sortedData || []}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.uid_servicio?.toString() ?? item.id?.toString() ?? index.toString()}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
});

// ✅ Estilos optimizados
const stylesNew = StyleSheet.create({
  newArrivalContainer: {
    paddingHorizontal: 16,  // tu padding anterior
    paddingBottom: 0,      // si quieres mantener espacio al final (igual que tu ScrollView)
  },
  container: {
    marginHorizontal: 4,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: "#3A4A85",
    shadowOffset: { width: 0, height: 2 },
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
    flex: 1,
    marginRight: 8,
    textTransform: "uppercase",
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
});

// Comparación de props para evitar re-renders innecesarios
const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.data?.length !== nextProps.data?.length) return false;
  if (prevProps.userLocation?.latitude !== nextProps.userLocation?.latitude ||
      prevProps.userLocation?.longitude !== nextProps.userLocation?.longitude) return false;
  if (prevProps.value !== nextProps.value || prevProps.marginTop !== nextProps.marginTop) return false;
  return true;
};

export default React.memo(ShowProductsContainer, arePropsEqual);
