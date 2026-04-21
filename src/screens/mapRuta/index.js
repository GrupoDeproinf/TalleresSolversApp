import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icons from 'react-native-vector-icons/FontAwesome';
import {getMapboxPublicToken} from '../../config/mapboxPublicToken';

const mapboxToken = getMapboxPublicToken();
if (mapboxToken) {
  MapboxGL.setAccessToken(mapboxToken);
}

const MapRutaComponent = ({ initialRegion, edit, returnFunction, location }) => {
  const secondLocation = initialRegion;
  const [modalVisible, setModalVisible] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const MAPBOX_DIRECTIONS_API = 'https://api.mapbox.com/directions/v5/mapbox/driving';

  const fetchRoute = async () => {
    if (!location || !secondLocation) return;
    if (!mapboxToken) {
      Alert.alert(
        'Mapbox',
        'Falta el token público de Mapbox. Configura src/config/mapboxPublicToken.local.js (ver mapbox.properties.example en la raíz).',
      );
      return;
    }
    setLoadingRoute(true);
    try {
      console.log("AQUIIIIIIII")
      const url = `${MAPBOX_DIRECTIONS_API}/${location.longitude},${location.latitude};${secondLocation.longitude},${secondLocation.latitude}?geometries=geojson&access_token=${encodeURIComponent(
        mapboxToken,
      )}`;
      const response = await fetch(url);
      console.log(response)
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
  };

  return (
    <View style={styles.container}>
      

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
                  zoomLevel={10}
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
                  id="selectedPoint"
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



export default MapRutaComponent;
