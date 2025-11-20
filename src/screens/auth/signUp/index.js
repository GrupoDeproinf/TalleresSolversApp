import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/FontAwesome';

MapboxGL.setAccessToken('pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ');

const MapComponent = ({ initialRegion, edit, returnFunction, useThisCoo }) => {
  const [location, setLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showbutton, setshowbutton] = useState(true);
  const [gpsModalVisible, setGpsModalVisible] = useState(false);

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
          if (!useThisCoo) getCurrentLocation();
          else setLocationFromInitial();
        } else setshowbutton(false);
      } else {
        if (!useThisCoo) getCurrentLocation();
        else setLocationFromInitial();
      }
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      setshowbutton(false);
    }
  };

  const setLocationFromInitial = () => {
    if (initialRegion?.latitude && initialRegion?.longitude) {
      setLocation({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        zoomLevel: 15,
      });
    } else getCurrentLocation();
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude } = info.coords;
        setLocation({ latitude, longitude, zoomLevel: 15 });
      },
      error => {
        console.log('Error al obtener la ubicación:', error);
        setGpsModalVisible(true);
      },
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (useThisCoo) setLocationFromInitial();
    else getCurrentLocation();
  }, [initialRegion]);

  const handleMapPress = (e) => {
    if (!edit) return;
    const [longitude, latitude] = e.geometry.coordinates;
    setLocation({ latitude, longitude, zoomLevel: 15 });
  };

  const validarUbicacion = () => {
    if (!useThisCoo) {
      Geolocation.getCurrentPosition(
        info => {
          const { latitude, longitude } = info.coords;
          setLocation({ latitude, longitude, zoomLevel: 15 });
          setModalVisible(true);
        },
        error => {
          console.log('Error al obtener la ubicación:', error);
          setGpsModalVisible(true);
          setModalVisible(false);
        },
      );
    } else setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {showbutton && (
        <TouchableOpacity
          style={[stylesImage.button, {
            borderWidth: 1,
            borderColor: '#2D3261',
            borderStyle: 'dotted',
            borderRadius: 5,
            backgroundColor: '#FFF',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            marginTop: 10,
            width: 300,
          }]}
          onPress={validarUbicacion}
        >
          <Icons name="map-marker" size={15} color="#2D3261" />
          <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#2D3261' }]}>
            Ubicación
          </Text>
        </TouchableOpacity>
      )}

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
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 50, justifyContent: 'center' }}>
            <Text style={{
              color: '#2D3261',
              fontSize: 16,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              <Icons name="question-circle" size={18} color="#2D3261" />{" "}
              Haz clic en el mapa para marcar la ubicación del taller
            </Text>
          </View>

          <MapboxGL.MapView
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Street}
            onPress={handleMapPress}
          >
            {location && (
              <MapboxGL.Camera
                centerCoordinate={[location.longitude, location.latitude]}
                zoomLevel={location.zoomLevel}
              />
            )}

            {location && (
              <MapboxGL.PointAnnotation
                id="selectedLocation"
                coordinate={[location.longitude, location.latitude]}
              >
                <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: 'red' }} />
              </MapboxGL.PointAnnotation>
            )}
          </MapboxGL.MapView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
            <TouchableOpacity
              style={[stylesImage.button, {
                borderWidth: 1,
                borderColor: '#2D3261',
                borderStyle: 'dotted',
                borderRadius: 5,
                backgroundColor: '#FFF',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                marginBottom: 10,
                flex: 1,
                marginRight: 5,
              }]}
              onPress={() => {
                setModalVisible(false);
                returnFunction(initialRegion);
              }}
            >
              <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#2D3261' }]}>
                Cerrar Mapa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[stylesImage.button, {
                borderWidth: 1,
                borderColor: '#28a745',
                borderStyle: 'solid',
                borderRadius: 5,
                backgroundColor: '#28a745',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                marginBottom: 10,
                flex: 1,
                marginLeft: 5,
              }]}
              onPress={() => {
                setModalVisible(false);
                returnFunction(location ?? initialRegion);
                Alert.alert('Solvers Informa', "La ubicación fue tomada correctamente");
              }}
            >
              <Icons name="map-marker" size={15} color="#FFF" />
              <Text style={[stylesImage.buttonText, { marginLeft: 10, color: '#FFF' }]}>
                Guardar Ubicación
              </Text>
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
            <Text style={stylesModal.modalText}>
              Usted debe habilitar la ubicación del dispositivo
            </Text>
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
});

const stylesImage = StyleSheet.create({
  button: { padding: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

const stylesModal = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalText: { marginBottom: 15, textAlign: 'center', color: '#333', fontSize: 16, fontWeight: 'bold' },
  buttonNo: { backgroundColor: '#FFA500', borderRadius: 5, padding: 10, width: '48%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default MapComponent;
