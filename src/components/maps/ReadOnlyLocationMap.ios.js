import React from 'react';
import MapView, { Marker } from 'react-native-maps';

/**
 * Mapa solo lectura (iOS): MapKit vía react-native-maps.
 */
export default function ReadOnlyLocationMap({ style, latitude, longitude }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      style={style}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      initialRegion={region}
      region={region}>
      <Marker coordinate={{ latitude: lat, longitude: lng }} title="Ubicación de la solicitud" />
    </MapView>
  );
}
