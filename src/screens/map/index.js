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

import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Icons from 'react-native-vector-icons/FontAwesome';

Mapbox.setAccessToken("pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ");

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
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          if (!useThisCoo) {
            getCurrentLocation();
          } else {
            if (initialRegion?.latitude && initialRegion?.longitude) {
              setLocation({
                latitude: initialRegion.latitude,
                longitude: initialRegion.longitude,
              });
            } else {
              getCurrentLocation();
            }
          }
        } else {
          setshowbutton(false);
        }
      } else {
        if (!useThisCoo) {
          getCurrentLocation();
        } else {
          if (initialRegion?.latitude && initialRegion?.longitude) {
            setLocation({
              latitude: initialRegion.latitude,
              longitude: initialRegion.longitude,
            });
          } else {
            getCurrentLocation();
          }
        }
      }
    } catch (e) {
      setshowbutton(false);
    }
  };

  useEffect(() => {
    if (!useThisCoo) {
      getCurrentLocation();
    } else {
      if (initialRegion?.latitude && initialRegion?.longitude) {
        setLocation({
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
        });
      } else {
        getCurrentLocation();
      }
    }
  }, [initialRegion]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      info => {
        const { latitude, longitude } = info.coords;
        setLocation({ latitude, longitude });
      },
      error => {
        setGpsModalVisible(true);
      },
    );
  };

  const handleMapPress = (e) => {
    if (!edit) return;

    const [longitude, latitude] = e.geometry.coordinates;

    setLocation({
      latitude,
      longitude,
    });
  };

  const validarUbicacion = () => {
    if (!useThisCoo) {
      Geolocation.getCurrentPosition(
        info => {
          const { latitude, longitude } = info.coords;
          setLocation({ latitude, longitude });
          setModalVisible(true);
        },
        error => {
          setGpsModalVisible(true);
          setModalVisible(false);
        },
      );
    } else {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {showbutton && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={validarUbicacion}>
          <Icons name="map-marker" size={15} color="#2D3261" />
          <Text style={styles.actionButtonText}>Ubicación</Text>
        </TouchableOpacity>
      )}

      {/* Modal del Mapa */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          returnFunction(location);
        }}>
        <View style={styles.modalContainer}>

          {/* Texto superior */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              <Icons name="question-circle" size={18} color="#2D3261" />
              {" "}Haz clic en el mapa para marcar la ubicación del taller
            </Text>
          </View>

          {/* MAPBOX */}
          <Mapbox.MapView
            style={styles.map}
            onPress={handleMapPress}
            styleURL={Mapbox.StyleURL.Street}
          >
            <Mapbox.Camera
              zoomLevel={14}
              centerCoordinate={
                location
                  ? [location.longitude, location.latitude]
                  : [initialRegion.longitude, initialRegion.latitude]
              }
            />

            {location && (
              <Mapbox.PointAnnotation
                id="selectedPoint"
                coordinate={[location.longitude, location.latitude]}
              />
            )}
          </Mapbox.MapView>

          {/* Botones */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setModalVisible(false);
                returnFunction(initialRegion);
              }}>
              <Text style={styles.closeBtnText}>Cerrar Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                setModalVisible(false);
                returnFunction(location ?? initialRegion);
                Alert.alert("Solvers Informa", "La ubicación fue tomada correctamente");
              }}>
              <Icons name="map-marker" size={15} color="#FFF" />
              <Text style={styles.saveBtnText}>Guardar Ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal GPS OFF */}
      <Modal transparent={true} animationType="slide" visible={gpsModalVisible}>
        <View style={stylesGps.container}>
          <View style={stylesGps.modalView}>
            <Text style={stylesGps.modalText}>
              Usted debe habilitar la ubicación del dispositivo
            </Text>
            <TouchableOpacity
              style={stylesGps.buttonNo}
              onPress={() => setGpsModalVisible(false)}>
              <Text style={stylesGps.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

// ----------------- ESTILOS -----------------

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  actionButton: {
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
  },
  actionButtonText: {
    marginLeft: 10,
    color: '#2D3261',
    fontWeight: 'bold'
  },

  modalContainer: { flex: 1 },

  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
    justifyContent: 'center'
  },
  headerText: {
    color: '#2D3261',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  map: {
    height: '77%',
    width: '100%',
  },

  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: '#2D3261',
    borderRadius: 5,
    backgroundColor: '#FFF',
    flex: 1,
    padding: 15,
    margin: 5
  },
  closeBtnText: {
    color: '#2D3261',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  saveBtn: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    padding: 15,
    margin: 5
  },
  saveBtnText: {
    color: '#FFF',
    marginLeft: 10,
    fontWeight: "bold"
  }
});

const stylesGps = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: { marginBottom: 15, textAlign: 'center', fontSize: 16 },
  buttonNo: {
    backgroundColor: '#FFA500',
    borderRadius: 5,
    padding: 10,
    width: 150,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default MapComponent;
