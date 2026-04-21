import React from 'react';
import { View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {getMapboxPublicToken} from '../../config/mapboxPublicToken';

const token = getMapboxPublicToken();
if (token) {
  MapboxGL.setAccessToken(token);
}

/**
 * Mapa interactivo (Android): Mapbox — mismo stack que el resto de mapas de la app.
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
  const hasLine =
    polylineFrom &&
    polylineTo &&
    Number.isFinite(Number(polylineFrom.latitude)) &&
    Number.isFinite(Number(polylineFrom.longitude)) &&
    Number.isFinite(Number(polylineTo.latitude)) &&
    Number.isFinite(Number(polylineTo.longitude));

  return (
    <MapboxGL.MapView
      style={style}
      styleURL={MapboxGL.StyleURL.Street}
      onPress={e => {
        const coords = e?.geometry?.coordinates;
        if (!coords || coords.length < 2) return;
        const [cLng, cLat] = coords;
        onPress?.({ latitude: cLat, longitude: cLng });
      }}
      showsUserLocation={!!showsUserLocation}
      compassEnabled
    >
      <MapboxGL.Camera
        centerCoordinate={[lng, lat]}
        zoomLevel={14}
        animationDuration={0}
      />
      <MapboxGL.PointAnnotation id="sol-pick" coordinate={[lng, lat]}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#E11D48',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      </MapboxGL.PointAnnotation>
      {hasLine ? (
        <MapboxGL.ShapeSource
          id="sol-line"
          shape={{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [Number(polylineFrom.longitude), Number(polylineFrom.latitude)],
                [Number(polylineTo.longitude), Number(polylineTo.latitude)],
              ],
            },
          }}>
          <MapboxGL.LineLayer
            id="sol-line-layer"
            style={{ lineColor: '#2D3261', lineWidth: 3 }}
          />
        </MapboxGL.ShapeSource>
      ) : null}
    </MapboxGL.MapView>
  );
}
