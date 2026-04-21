import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome';

import MapboxGL from '@rnmapbox/maps';
import {getMapboxPublicToken} from '../../config/mapboxPublicToken';

const mapboxToken = getMapboxPublicToken();
if (mapboxToken) {
  MapboxGL.setAccessToken(mapboxToken);
}

const MapTalleres = ({
  talleres = [],
  initialRegion = null,
  edit = false,
  returnFunction = null,
  useThisCoo = false,
}) => {
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [tallerInfoModal, setTallerInfoModal] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [showbutton, setshowbutton] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);

  const defaultRegion = {
    latitude: 10.4806,
    longitude: -66.9036,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getRegionForTalleres = () => {
    if (!talleres || talleres.length === 0) return initialRegion || defaultRegion;

    let minLat = talleres[0].ubicacion.lat;
    let maxLat = talleres[0].ubicacion.lat;
    let minLng = talleres[0].ubicacion.lng;
    let maxLng = talleres[0].ubicacion.lng;

    talleres.forEach(taller => {
      minLat = Math.min(minLat, taller.ubicacion.lat);
      maxLat = Math.max(maxLat, taller.ubicacion.lat);
      minLng = Math.min(minLng, taller.ubicacion.lng);
      maxLng = Math.max(maxLng, taller.ubicacion.lng);
    });

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'Esta aplicación necesita acceso a tu ubicación',
            buttonNeutral: 'Pregúntame más tarde',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setshowbutton(true);
          if (!useThisCoo) getCurrentLocation();
          else if (initialRegion?.latitude && initialRegion?.longitude)
            setLocation({
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            });
          else getCurrentLocation();
        } else setshowbutton(false);
      } else {
        if (!useThisCoo) getCurrentLocation();
        else if (initialRegion?.latitude && initialRegion?.longitude)
          setLocation({
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
          });
        else getCurrentLocation();
      }
    } catch (error) {
      console.error(error);
      setshowbutton(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude } = info.coords;
        setLocation({ latitude, longitude });
      },
      error => setGpsModalVisible(true)
    );
  };

  const handleMapPress = event => {
    if (edit) {
      const [longitude, latitude] = event.geometry.coordinates;
      setLocation({ latitude, longitude });
    }
  };

  const formatMetodosPago = metodos => {
    const metodosActivos = Object.entries(metodos)
      .filter(([_, value]) => value)
      .map(([key]) => {
        switch (key) {
          case 'transferencia': return 'Transferencia';
          case 'pagoMovil': return 'Pago Móvil';
          case 'zinli': return 'Zinli';
          case 'efectivo': return 'Efectivo';
          case 'puntoVenta': return 'Punto de Venta';
          case 'tarjetaCreditoN': return 'Tarjeta Crédito Nacional';
          case 'zelle': return 'Zelle';
          case 'tarjetaCreditoI': return 'Tarjeta Crédito Internacional';
          default: return key;
        }
      });
    return metodosActivos.length > 0 ? metodosActivos.join(', ') : 'No especificado';
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 50, justifyContent: 'center' }}>
            <Text style={{ color: '#2D3261', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              <Icons name="wrench" size={18} color="#2D3261" /> Talleres disponibles en tu zona
            </Text>
          </View>

          <MapboxGL.MapView
            style={styles.map}
            onPress={handleMapPress}
            styleURL={MapboxGL.StyleURL.Street}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <MapboxGL.Camera
              centerCoordinate={[
                location?.longitude || (initialRegion || defaultRegion).longitude,
                location?.latitude || (initialRegion || defaultRegion).latitude,
              ]}
              zoomLevel={10}
            />

            {location && (
              <MapboxGL.PointAnnotation
                key="userLocation"
                id="userLocation"
                coordinate={[location.longitude, location.latitude]}
              >
                <View style={styles.userMarker} />
              </MapboxGL.PointAnnotation>
            )}

            {talleres.map((taller, index) => (
              <MapboxGL.PointAnnotation
                key={taller.id || index}
                id={`taller-${taller.id || index}`}
                coordinate={[taller.ubicacion.lng, taller.ubicacion.lat]}
              >
                <View style={styles.tallerMarker} />
                <MapboxGL.Callout title={taller.nombre}>
                  <View style={styles.calloutContainerLarge}>
                    <Text style={styles.tallerNameCompact}>{taller.nombre}</Text>
                    <Text>{taller.Direccion} - {taller.estado}</Text>
                  </View>
                </MapboxGL.Callout>
              </MapboxGL.PointAnnotation>
            ))}
          </MapboxGL.MapView>

          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 0, paddingHorizontal: 5 }}>
            <TouchableOpacity
              style={[stylesImage.button, { borderWidth: 1, borderColor: '#2D3261', borderStyle: 'dotted', borderRadius: 5, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, width: '100%' }]}
              onPress={() => { setModalVisible(false); if (returnFunction) returnFunction(null); }}
            >
              <Text style={[stylesImage.buttonText, { marginLeft: 0, color: '#2D3261', fontSize: 14 }]}>Cerrar Mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={gpsModalVisible}
        onRequestClose={() => setGpsModalVisible(false)}
      >
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>Usted debe habilitar la ubicación del dispositivo</Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={() => setGpsModalVisible(false)}>
                <Text style={stylesModal.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1 },
  map: { height: '77%', width: '100%' },
  userMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'blue', borderColor: '#fff', borderWidth: 2 },
  tallerMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'red', borderColor: '#fff', borderWidth: 2 },
  calloutContainerLarge: { width: 280, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, borderWidth: 1, borderColor: '#E5E5E5' },
  tallerNameCompact: { fontWeight: 'bold', fontSize: 16, color: '#2D3261', textAlign: 'center' },
});

const stylesImage = StyleSheet.create({
  button: { padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

const stylesModal = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalText: { marginBottom: 15, textAlign: 'center', color: '#333', fontSize: 16, fontWeight: 'bold' },
  buttonNo: { backgroundColor: '#FFA500', borderRadius: 5, padding: 10, width: '48%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default MapTalleres;
