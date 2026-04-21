import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';

/**
 * Mapa interactivo (iOS): Apple MapKit vía react-native-maps.
 */
export default function SolicitudLocationMap({
  style,
  latitude,
  longitude,
  onPress,
  showsUserLocation,
  polylineFrom,
  polylineTo,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };
  const hasLine =
    polylineFrom &&
    polylineTo &&
    Number.isFinite(Number(polylineFrom.latitude)) &&
    Number.isFinite(Number(polylineFrom.longitude)) &&
    Number.isFinite(Number(polylineTo.latitude)) &&
    Number.isFinite(Number(polylineTo.longitude));

  return (
    <MapView
      style={style}
      initialRegion={region}
      region={region}
      onPress={e => {
        const c = e?.nativeEvent?.coordinate;
        if (!c) return;
        onPress?.({ latitude: c.latitude, longitude: c.longitude });
      }}
      showsCompass
      showsUserLocation={!!showsUserLocation}>
      <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor="#E11D48" title="Tu ubicación" />
      {hasLine ? (
        <Polyline
          coordinates={[polylineFrom, polylineTo]}
          strokeColor="#2D3261"
          strokeWidth={3}
        />
      ) : null}
    </MapView>
  );
}
