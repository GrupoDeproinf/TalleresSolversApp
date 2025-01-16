import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { commonStyles } from '../../style/commonStyle.css';
import Icons from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar el ícono que estás usando
import MapViewDirections from 'react-native-maps-directions';

import { WebView } from 'react-native-webview'


const MapRutaComponent = ({ initialRegion, edit, returnFunction, useThisCoo }) => {
  const [location, setLocation] = useState(null);
  const [secondLocation, setSecondLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);

  const [showbutton, setshowbutton] = useState(true);

  const GOOGLE_MAPS_APIKEY = "AIzaSyBwxtCqHREImZv8RnZF2xJjevp44LXvbKo"

  const mapStyle = [
    // Aquí puedes añadir tu estilo personalizado para el mapa
  ];

  const [loading, setLoading] = useState(false);
  const mapUrl = `https://www.google.com/maps/dir//${initialRegion.latitude},${initialRegion.longitude}`;

  const requestLocationPermission = async () => {
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
        console.log('Permiso de ubicación concedido');
        console.log(useThisCoo);
        console.log(initialRegion);
        if (
          initialRegion.latitude != undefined &&
          initialRegion.latitude != '' &&
          initialRegion.longitude != undefined &&
          initialRegion.longitude != ''
        ) {
          setSecondLocation({
            latitude: initialRegion.latitude,
            longitude: initialRegion.longitude,
            latitudeDelta: initialRegion.latitudeDelta,
            longitudeDelta: initialRegion.longitudeDelta,
            name_taller: initialRegion.name_taller
          });
        }
        getCurrentLocation();
      } else {
        console.log('Permiso de ubicación denegado');
        setshowbutton(false);
      }
    } else {
      if (
        initialRegion.latitude != undefined &&
        initialRegion.latitude != '' &&
        initialRegion.longitude != undefined &&
        initialRegion.longitude != ''
      ) {
        setSecondLocation({
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: initialRegion.latitudeDelta,
          longitudeDelta: initialRegion.longitudeDelta,
          name_taller: initialRegion.name_taller
        });
      }
      
      getCurrentLocation();
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    console.log('Aqui estoy :>');
    Geolocation.getCurrentPosition(info => {
      const { latitude, longitude } = info.coords;
      console.log(latitude);
      console.log(longitude);
      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
      console.log('Se agregó 2:>');
      setTimeout(() => {

        console.log(secondLocation);
        console.log(location);
      }, 2000);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getCurrentLocation();
    }, 5000); // 5000ms = 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  const handleMapPress = event => {
    if (edit) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      if (!location) {
        setLocation({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      } else {
        // console.log('Aqui estoy :>74562897462');
        // setSecondLocation({
        //   latitude,
        //   longitude,
        //   latitudeDelta: 0.015,
        //   longitudeDelta: 0.0121,
        // });
      }
    }
  };

  return (
    <View style={styles.container}>

      {location != undefined && secondLocation != undefined ? (


        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            console.log('Aquiiii');
            returnFunction(location);
          }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 5,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  marginTop: 0,
                },
              ]}
              onPress={() => {
                setModalVisible(false);
                console.log('Aquiiii');
                returnFunction(location);
              }}>
              <Icons name="map-marker" size={15} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 10, color: '#2D3261' },
                ]}>
                Cerrar Mapa
              </Text>
            </TouchableOpacity>


            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={location}
              customMapStyle={mapStyle}
              showsUserLocation={true}
              onPress={handleMapPress}>
              {location && (
                <Marker coordinate={location} pinColor='navy' title="Tu ubicación actual">
              </Marker>
              )}
              {secondLocation && (
                <Marker coordinate={secondLocation} title={secondLocation.name_taller} icon={require('../../assets/SolversMarker-150px.png')}/>
              )}

              <MapViewDirections
                  origin={location}
                  destination={secondLocation}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={5}
                  strokeColor="#2D3261"
                  mode='DRIVING'
                  language='en'
                  onStart={(params) => {
                    console.log(`Started routing between "${params.origin}" and "${params.destination}"${(params.waypoints.length ? " using waypoints: " + params.waypoints.join(', ') : "")}`);
                  }}
                />

            </MapView>
          </View>
        </Modal>

      ) : null
      }

    </View>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 30,
    height: 30,
    backgroundColor: '#2D3261', // Color personalizado
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  map: {
    height: '100%',
    width: '100%',
  },
});

const stylesImage = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapRutaComponent;
