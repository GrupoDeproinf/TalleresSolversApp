import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/FontAwesome';

MapboxGL.setAccessToken('pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ');

const MapRutaComponent = ({ initialRegion, edit, returnFunction, useThisCoo }) => {
  const [location, setLocation] = useState(null);
  const [secondLocation, setSecondLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showbutton, setshowbutton] = useState(true);

  const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox/driving';

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
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setshowbutton(true);
          if (initialRegion?.latitude && initialRegion?.longitude) {
            setSecondLocation({
              ...initialRegion
            });
          }
          getCurrentLocation();
        } else setshowbutton(false);
      } else {
        if (initialRegion?.latitude && initialRegion?.longitude) {
          setSecondLocation({
            ...initialRegion
          });
        }
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error permisos ubicación:', error);
      setshowbutton(false);
    }
  };

  useEffect(() => { requestLocationPermission(); }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude } = info.coords;
        setLocation({ latitude, longitude });
      },
      error => { console.error(error); setGpsModalVisible(true); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchRoute = async () => {
    if (!location || !secondLocation) return;
    setLoadingRoute(true);
    try {
      const url = `${MAPBOX_DIRECTIONS_API}/${location.longitude},${location.latitude};${secondLocation.longitude},${secondLocation.latitude}?geometries=geojson&access_token=TU_MAPBOX_TOKEN`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({ longitude: c[0], latitude: c[1] }));
        setRouteCoordinates(coords);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Error', 'No se pudo calcular la ruta');
    } finally {
      setLoadingRoute(false);
    }
  };

  useEffect(() => { if (location && secondLocation) fetchRoute(); }, [location, secondLocation]);

  const handleMapPress = (e) => {
    if (!edit) return;
    const [longitude, latitude] = e.geometry.coordinates;
    if (!location) setLocation({ latitude, longitude });
    // si quisieras permitir edición de segundo punto, podrías agregar aquí
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        animationType="slide"
        visible={gpsModalVisible}
        onRequestClose={() => setGpsModalVisible(false)}
      >
        <View style={stylesModal.container}>
          <View style={stylesModal.modalView}>
            <Text style={stylesModal.modalText}>Debe habilitar la ubicación del dispositivo</Text>
            <View style={stylesModal.buttonContainer}>
              <TouchableOpacity style={stylesModal.buttonNo} onPress={() => setGpsModalVisible(false)}>
                <Text style={stylesModal.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {location && secondLocation && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            returnFunction(location);
          }}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={[stylesImage.button, { borderWidth: 1, borderColor: '#2D3261', borderStyle: 'dotted', borderRadius: 5, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 70 }]}
              onPress={() => { setModalVisible(false); returnFunction(location); }}
            >
              <Icons name="map-marker" size={15} color="#2D3261" />
              <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#2D3261' }]}>Cerrar Mapa</Text>
            </TouchableOpacity>

            <MapboxGL.MapView
              style={styles.map}
              styleURL={MapboxGL.StyleURL.Street}
              onPress={handleMapPress}
              showsUserLocation
            >
              {location && (
                <MapboxGL.Camera
                  centerCoordinate={[location.longitude, location.latitude]}
                  zoomLevel={15}
                />
              )}

              {location && (
                <MapboxGL.PointAnnotation
                  id="origin"
                  coordinate={[location.longitude, location.latitude]}
                >
                  <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: 'navy' }} />
                </MapboxGL.PointAnnotation>
              )}

              {secondLocation && (
                <MapboxGL.PointAnnotation
                  id="destination"
                  coordinate={[secondLocation.longitude, secondLocation.latitude]}
                >
                  <View style={{ height: 25, width: 25, borderRadius: 12.5, backgroundColor: 'red' }} />
                </MapboxGL.PointAnnotation>
              )}

              {routeCoordinates.length > 0 && (
                <MapboxGL.ShapeSource id="routeSource" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates.map(c => [c.longitude, c.latitude]) } }}>
                  <MapboxGL.LineLayer id="routeFill" style={{ lineColor: '#2D3261', lineWidth: 5 }} />
                </MapboxGL.ShapeSource>
              )}
            </MapboxGL.MapView>

            {loadingRoute && <ActivityIndicator size="large" color="#2D3261" style={{ position: 'absolute', top: '50%', left: '50%' }} />}
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1 },
  map: { height: '100%', width: '100%' },
});

const stylesImage = StyleSheet.create({
  button: { padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

const stylesModal = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalText: { marginBottom: 15, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  buttonNo: { backgroundColor: '#2196F3', borderRadius: 20, padding: 10, elevation: 2 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});

export default MapRutaComponent;
