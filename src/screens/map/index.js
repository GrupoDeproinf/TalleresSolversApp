import React from 'react';
import { View, StyleSheet } from 'react-native';
// import MapView from 'react-native-maps';

const MapComponent = ({ initialRegion }) => {
  return (
    <h1>hola</h1>
    // <MapView
    //   initialRegion={{
    //     latitude: 37.78825,
    //     longitude: -122.4324,
    //     latitudeDelta: 0.0922,
    //     longitudeDelta: 0.0421,
    //   }}
    // />
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 200,
  },
});

export default MapComponent;
