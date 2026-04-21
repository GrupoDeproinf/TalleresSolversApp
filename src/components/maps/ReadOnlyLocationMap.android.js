import React from 'react';
import { View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import {getMapboxPublicToken} from '../../config/mapboxPublicToken';

const token = getMapboxPublicToken();
if (token) {
  MapboxGL.setAccessToken(token);
}

/**
 * Mapa solo lectura (Android): Mapbox.
 */
export default function ReadOnlyLocationMap({ style, latitude, longitude }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <MapboxGL.MapView
      style={style}
      styleURL={MapboxGL.StyleURL.Street}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      compassEnabled={false}>
      <MapboxGL.Camera centerCoordinate={[lng, lat]} zoomLevel={14} animationDuration={0} />
      <MapboxGL.PointAnnotation id="read-only-pin" coordinate={[lng, lat]}>
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#2D3261',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      </MapboxGL.PointAnnotation>
    </MapboxGL.MapView>
  );
}
