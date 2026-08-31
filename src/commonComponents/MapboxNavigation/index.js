/**
 * MapboxNavigation
 *
 * Flujo:
 *   1. visible=true → Preview (mapa WebView + ruta + card info + botón "Vamos!")
 *   2. "Vamos!" → zoom cinematográfico en el WebView → overlay negro →
 *      NavigationViewController/NavigationActivity (SDK nativo) aparece encima
 *   3. Navegación termina → overlay desaparece → preview vuelve al estado inicial
 *
 * Props:
 *   visible              {boolean}
 *   destinationLat       {number}
 *   destinationLng       {number}
 *   destinationName      {string}
 *   destinationAddress   {string}   — opcional
 *   destinationPhone     {string}   — opcional
 *   destinationImage     {string}   — opcional (url)
 *   onClose              {() => void}
 *   onFinish             {() => void} — opcional, se llama cuando la navegación
 *                                       termina en el destino (no cuando el
 *                                       usuario cierra manualmente). Si se provee,
 *                                       el modal se cierra solo al llegar.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Easing,
  Image,
  Linking,
  Modal,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { RNMapboxNavigation } = NativeModules;

const MAPBOX_TOKEN =
  'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';


// ─────────────────────────────────────────────────────────────────────────────
//  Colores de tráfico
// ─────────────────────────────────────────────────────────────────────────────
const TRAFFIC_COLORS = {
  low:      '#4DA6FF',
  moderate: '#FCD34D',
  heavy:    '#F97316',
  severe:   '#EF4444',
  unknown:  '#4DA6FF',
};

// Calcula el ángulo (bearing) de un punto a otro en grados (0 = norte, 90 = este…)
const calcBearing = (lat1, lng1, lat2, lng2) => {
  const toRad = d => d * Math.PI / 180;
  const dLng  = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
          - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const buildTrafficGeoJson = (routeCoords, congestion) => {
  if (!congestion || congestion.length === 0) {
    return JSON.stringify({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { color: '#4DA6FF', casing: '#1A4E9F' },
        geometry: {
          type: 'LineString',
          coordinates: routeCoords.map(c => [c.longitude, c.latitude]),
        },
      }],
    });
  }

  const features = [];
  let segStart = 0;
  let segCong  = congestion[0] || 'unknown';

  for (let i = 1; i <= congestion.length; i++) {
    const cur = i < congestion.length ? (congestion[i] || 'unknown') : null;
    if (cur !== segCong || i === congestion.length) {
      const segCoords = routeCoords
        .slice(segStart, i + 1)
        .map(c => [c.longitude, c.latitude]);
      if (segCoords.length >= 2) {
        const color  = TRAFFIC_COLORS[segCong] || '#4DA6FF';
        const casing = segCong === 'low' || segCong === 'unknown' ? '#1A4E9F' : '#7C3F00';
        features.push({
          type: 'Feature',
          properties: { color, casing },
          geometry: { type: 'LineString', coordinates: segCoords },
        });
      }
      segStart = i;
      segCong  = cur;
    }
  }

  return JSON.stringify({ type: 'FeatureCollection', features });
};

// ─────────────────────────────────────────────────────────────────────────────
//  HTML del mapa Mapbox GL JS
// ─────────────────────────────────────────────────────────────────────────────
const buildMapboxHtml = (originLat, originLng, destLat, destLng, routeCoords, congestion = []) => {
  const hasRoute  = routeCoords.length > 0;
  const hasOrigin = originLat != null && originLng != null;

  // Ángulo de la flecha de origen apuntando hacia el destino
  const originBearing = hasOrigin
    ? Math.round(calcBearing(originLat, originLng, destLat, destLng))
    : 0;

  const trafficGeoJson = hasRoute ? buildTrafficGeoJson(routeCoords, congestion) : null;
  const boundsCoords   = hasRoute
    ? JSON.stringify(routeCoords.map(c => [c.longitude, c.latitude]))
    : null;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet'/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html, #map { width: 100%; height: 100%; background: #080920; }
    .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-logo { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [${destLng}, ${destLat}],
      zoom: 13,
      interactive: true,
      attributionControl: false,
    });

    map.touchZoomRotate.enable();
    map.scrollZoom.enable();
    map.dragPan.enable();

    map.on('load', function () {

      ${hasRoute ? `
      map.addSource('traffic-route', { type: 'geojson', data: ${trafficGeoJson} });

      map.addLayer({
        id: 'route-casing', type: 'line', source: 'traffic-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'casing'], 'line-width': 16, 'line-opacity': 1 },
      });

      map.addLayer({
        id: 'route-traffic', type: 'line', source: 'traffic-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 10, 'line-opacity': 1 },
      });

      map.addLayer({
        id: 'route-dash', type: 'line', source: 'traffic-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 4, 'line-opacity': 0.55, 'line-dasharray': [0, 4, 3] },
      });

      const dashSteps = [
        [0,4,3],[0.5,4,2.5],[1,4,2],[1.5,4,1.5],[2,4,1],[2.5,4,0.5],[3,4,0],
        [0,0.5,3,3.5],[0,1,3,3],[0,1.5,3,2.5],[0,2,3,2],[0,2.5,3,1.5],[0,3,3,1],[0,3.5,3,0.5],
      ];
      let dashStep = 0, lastTs = 0;
      function animateDash(ts) {
        if (ts - lastTs > 55) {
          dashStep = (dashStep + 1) % dashSteps.length;
          map.setPaintProperty('route-dash', 'line-dasharray', dashSteps[dashStep]);
          lastTs = ts;
        }
        requestAnimationFrame(animateDash);
      }
      requestAnimationFrame(animateDash);
      ` : ''}

      ${hasRoute ? `
      const coords = ${boundsCoords};
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: { top: 70, bottom: 290, left: 50, right: 50 }, duration: 500, maxZoom: 15 });
      ` : `map.setCenter([${destLng}, ${destLat}]); map.setZoom(13);`}

      /* Marcador destino */
      const destEl = document.createElement('div');
      destEl.innerHTML = \`
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="21" cy="21" r="20" fill="rgba(0,0,0,0.25)" transform="translate(1,1)"/>
          <circle cx="21" cy="21" r="20" fill="#FCD34D" stroke="#fff" stroke-width="2.5"/>
          <path d="M21 10C16.582 10 13 13.582 13 18C13 23.5 21 33 21 33C21 33 29 23.5 29 18C29 13.582 25.418 10 21 10Z" fill="#1E3A5F"/>
          <circle cx="21" cy="18" r="4" fill="#FCD34D"/>
        </svg>
      \`;
      destEl.style.cursor = 'pointer';
      new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat([${destLng}, ${destLat}])
        .addTo(map);

      ${hasOrigin ? `
      /* Marcador origen — mismo tamaño que destino (42×42) */
      const originEl = document.createElement('div');
      originEl.innerHTML = \`
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="21" cy="21" r="20" fill="rgba(0,0,0,0.25)" transform="translate(1,1)"/>
          <circle cx="21" cy="21" r="20" fill="#ffffff"/>
          <path d="M21 8 L32 32 L21 25 L10 32 Z" fill="#1E3A5F" transform="rotate(${originBearing} 21 21)"/>
        </svg>
      \`;
      originEl.style.width  = '42px';
      originEl.style.height = '42px';
      new mapboxgl.Marker({ element: originEl, anchor: 'center' })
        .setLngLat([${originLng}, ${originLat}])
        .addTo(map);
      ` : ''}
    });
  </script>
</body>
</html>`;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers de formato
// ─────────────────────────────────────────────────────────────────────────────
const fmtDistance = m =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

const fmtDuration = secs => {
  const min = Math.round(secs / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
};

const fmtArrival = secs => {
  const d = new Date(Date.now() + secs * 1000);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Componente
// ─────────────────────────────────────────────────────────────────────────────
const MapboxNavigation = ({
  visible,
  destinationLat,
  destinationLng,
  destinationName      = 'Destino',
  destinationAddress,
  destinationPhone,
  destinationImage,
  onClose,
  onFinish,
}) => {
  // Cierra el preview manualmente (X o back) — NO dispara onFinish
  const handleClosePress = () => {
    onClose?.();
  };

  const launchedRef    = useRef(false);
  const navStartTimeRef = useRef(null);
  const webViewRef     = useRef(null);
  const boundsRef      = useRef(null);
  const animCancelRef  = useRef(false); // cancela la secuencia zoom+fade si el preview se cierra

  // Animated values
  const cardTranslateY  = useRef(new Animated.Value(0)).current;
  const closeBtnOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity  = useRef(new Animated.Value(0)).current;

  // State
  const [origin,          setOrigin]          = useState(null);
  const [routeCoords,     setRouteCoords]     = useState([]);
  const [distance,        setDistance]        = useState(null);
  const [duration,        setDuration]        = useState(null);
  const [arrival,         setArrival]         = useState(null);
  const [trafficDelay,    setTrafficDelay]    = useState(0);
  const [routeLoading,    setRouteLoading]    = useState(true);
  const [showPreview,     setShowPreview]     = useState(false);
  const [mapHtml,         setMapHtml]         = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActive,       setNavActive]       = useState(false);

  // ── Sync con prop visible ──────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setShowPreview(true);
      setNavActive(false);
      setRouteLoading(true);
      setRouteCoords([]);
      setOrigin(null);
      setDistance(null);
      setDuration(null);
      setArrival(null);
      setTrafficDelay(0);
      boundsRef.current = null;
      animCancelRef.current = false;
      cardTranslateY.setValue(0);
      closeBtnOpacity.setValue(1);
      overlayOpacity.setValue(0);
      setMapHtml(buildMapboxHtml(null, null, destinationLat, destinationLng, []));
      launchedRef.current = false;
      loadLocationAndRoute();
    } else {
      RNMapboxNavigation?.cancelPreview?.();
      animCancelRef.current = true;       // aborta cualquier zoom+fade en curso
      setShowPreview(false);
      setNavActive(false);
      setIsTransitioning(false);
      launchedRef.current = false;
      boundsRef.current = null;
      cardTranslateY.setValue(0);
      closeBtnOpacity.setValue(1);
      overlayOpacity.setValue(0);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GPS + ruta ─────────────────────────────────────────────────────────────
  const loadLocationAndRoute = useCallback(() => {
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setOrigin({ latitude, longitude });
        await fetchRoute(latitude, longitude);
      },
      err => {
        console.warn('[MapboxNavigation] GPS error:', err);
        setRouteLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  }, [destinationLat, destinationLng]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRoute = async (originLat, originLng) => {
    try {
      const url =
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/` +
        `${originLng},${originLat};${destinationLng},${destinationLat}` +
        `?geometries=geojson&language=es&overview=full&steps=false` +
        `&annotations=congestion&access_token=${MAPBOX_TOKEN}`;

      const res  = await fetch(url);
      const data = await res.json();

      if (data.routes?.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => ({
          latitude: lat, longitude: lng,
        }));
        const congestion      = route.legs?.[0]?.annotation?.congestion ?? [];
        const durationTypical = route.duration_typical ?? route.duration;
        const delayMin        = Math.max(0, Math.round((route.duration - durationTypical) / 60));

        setRouteCoords(coords);
        setDistance(fmtDistance(route.distance));
        setDuration(fmtDuration(route.duration));
        setArrival(fmtArrival(route.duration));
        setTrafficDelay(delayMin);

        // Guardar bounds para resetear el mapa al volver del navigation
        if (coords.length > 0) {
          const lngs = coords.map(c => c.longitude);
          const lats = coords.map(c => c.latitude);
          boundsRef.current = {
            sw: [Math.min(...lngs), Math.min(...lats)],
            ne: [Math.max(...lngs), Math.max(...lats)],
          };
        }

        setMapHtml(buildMapboxHtml(
          originLat, originLng,
          destinationLat, destinationLng,
          coords, congestion,
        ));

        RNMapboxNavigation?.prepareNavigation?.(
          originLat, originLng,
          destinationLat, destinationLng,
          destinationName,
        );
      }
    } catch (err) {
      console.warn('[MapboxNavigation] Route fetch error:', err);
    } finally {
      setRouteLoading(false);
    }
  };

  // ── "¡Vamos!" — oculta card → zoom al origen → navigation nativo
  const handleVamos = () => {
    if (isTransitioning || navActive) return;
    setIsTransitioning(true);
    animCancelRef.current = false;

    // Ocultar card inferior y botón cerrar (ambas plataformas)
    Animated.parallel([
      Animated.timing(cardTranslateY, {
        toValue: 320,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(closeBtnOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // ── Android: sin pre-carga ni NavigationEmbeddedView ──────────────────────
    // El Modal de RN vive en una Window distinta al decorView de la Activity,
    // por lo que bringChildToFront nunca aparece encima del Modal.
    // Usamos NavigationActivity directamente, que sí toma toda la pantalla.
    if (Platform.OS === 'android') {
      setNavActive(true);
      return;
    }

    // ── iOS: flujo completo con pre-carga + zoom cinematográfico ──────────────
    const startNav = () => {
      if (animCancelRef.current) return;
      setNavActive(true);
    };

    if (origin?.latitude && origin?.longitude) {
      // 1) Pre-cargar el mapa de navigation nativo en segundo plano
      RNMapboxNavigation?.preloadNavigationUI?.(
        origin.latitude, origin.longitude,
        destinationLat, destinationLng,
        destinationName,
      );

      // 2) Zoom + pitch hacia la ubicación del usuario
      webViewRef.current?.injectJavaScript(`
        (function(){
          try {
            if (typeof map !== 'undefined' && map) {
              map.flyTo({
                center: [${origin.longitude}, ${origin.latitude}],
                zoom: 18,
                pitch: 45,
                duration: 1600,
                essential: true
              });
            }
          } catch(e) {}
        })();
        true;
      `);

      // 3) Al terminar el zoom revelar el mapa ya cargado
      setTimeout(() => {
        if (animCancelRef.current) return;
        startNav();
      }, 1400);
    } else {
      startNav();
    }
  };

  // ── Lanzar navegación nativa ───────────────────────────────────────────────
  useEffect(() => {
    if (!navActive || launchedRef.current) return;
    if (!RNMapboxNavigation) {
      console.warn('[MapboxNavigation] Módulo nativo no disponible.');
      onClose?.();
      return;
    }

    launchedRef.current   = true;
    navStartTimeRef.current = Date.now();

    // finished=true  → navegación completó en destino
    // finished=false → cancelada / error → volver al preview
    const done = (finished = false) => {
      launchedRef.current = false;
      setNavActive(false);
      setIsTransitioning(false);
      overlayOpacity.setValue(0);

      // Si llegó al destino y el padre quiere saberlo → cerrar y notificar
      if (finished && onFinish) {
        onClose?.();
        onFinish();
        return;
      }

      // Resetear cámara del WebView para volver al preview
      if (boundsRef.current && webViewRef.current) {
        const { sw, ne } = boundsRef.current;
        webViewRef.current.injectJavaScript(`
          (function(){
            try {
              if (typeof map !== 'undefined' && map) {
                map.fitBounds(
                  [[${sw[0]}, ${sw[1]}], [${ne[0]}, ${ne[1]}]],
                  {
                    padding: { top: 70, bottom: 290, left: 50, right: 50 },
                    animate: false,
                    maxZoom: 15,
                    pitch: 0,
                    bearing: 0
                  }
                );
              }
            } catch(e) {}
          })();
          true;
        `);
      }

      // Card y botón de cierre reaparecen con slide-up suave
      Animated.parallel([
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: true,
        }),
        Animated.timing(closeBtnOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const doNavigate = (lat, lng) => {
      RNMapboxNavigation.navigate(lat, lng, destinationLat, destinationLng, destinationName)
        .then(() => {
          const elapsed = Date.now() - (navStartTimeRef.current || 0);
          done(elapsed >= 30000);
        })
        .catch(err => {
          console.warn('[MapboxNavigation] Error:', err);
          done(false);
        });
    };

    if (origin?.latitude && origin?.longitude) {
      doNavigate(origin.latitude, origin.longitude);
    } else {
      Geolocation.getCurrentPosition(
        pos => doNavigate(pos.coords.latitude, pos.coords.longitude),
        () => done(),
        { enableHighAccuracy: true, timeout: 12000 },
      );
    }
  }, [navActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // ───────────────────────────────────────────────────────────────────────────
  if (!showPreview) return null;

  const previewContent = (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Mapa WebView */}
      <View style={StyleSheet.absoluteFillObject}>
        {mapHtml ? (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={StyleSheet.absoluteFillObject}
            scrollEnabled={false}
            javaScriptEnabled
            originWhitelist={['*']}
            backgroundColor="#080920"
            scalesPageToFit={false}
            allowsInlineMediaPlayback
            domStorageEnabled
          />
        ) : (
          <View style={s.mapBg}>
            <ActivityIndicator color="#4DA6FF" size="large" />
          </View>
        )}
      </View>

      {/* Overlay negro de transición */}
      <Animated.View
        pointerEvents={isTransitioning || navActive ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: overlayOpacity }]}
      />

      {/* Botón cerrar */}
      <Animated.View style={{ opacity: closeBtnOpacity }}>
        <TouchableOpacity
          style={s.closeBtn}
          onPress={handleClosePress}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-down" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Card inferior */}
      <Animated.View style={[s.card, { transform: [{ translateY: cardTranslateY }] }]}>
        <View style={s.handle} />

        {routeLoading ? (
          <View style={s.loadingRow}>
            <ActivityIndicator color="#4DA6FF" size="small" />
            <Text style={s.loadingTxt}>Calculando ruta…</Text>
          </View>
        ) : (
          <>
            {/* Cabecera */}
            <View style={s.headerRow}>
              {destinationImage ? (
                <Image source={{ uri: destinationImage }} style={s.avatar} />
              ) : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Icon name="store" size={22} color="#4DA6FF" />
                </View>
              )}
              <View style={s.headerInfo}>
                <View style={s.categoryPill}>
                  <Icon name="wrench" size={10} color="#60A5FA" style={{ marginRight: 3 }} />
                  <Text style={s.categoryTxt}>Negocio Automotriz</Text>
                </View>
                <Text style={s.destName} numberOfLines={1}>{destinationName}</Text>
              </View>
              <View style={s.modeBadge}>
                <Icon name="car" size={20} color="#60A5FA" />
                <Text style={s.modeTxt}>Coche</Text>
              </View>
            </View>

            {/* Dirección */}
            {destinationAddress ? (
              <View style={s.infoRow}>
                <Icon name="map-marker-outline" size={13} color="#60A5FA" />
                <Text style={s.infoTxt} numberOfLines={1}>{destinationAddress}</Text>
              </View>
            ) : null}

            {/* Teléfono */}
            {destinationPhone ? (
              <TouchableOpacity
                style={s.infoRow}
                onPress={() => Linking.openURL(`tel:${destinationPhone}`)}
                activeOpacity={0.7}>
                <Icon name="phone-outline" size={13} color="#60A5FA" />
                <Text style={[s.infoTxt, s.phoneLink]}>{destinationPhone}</Text>
                <Icon name="chevron-right" size={13} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            ) : null}

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statVal}>{duration ?? '—'}</Text>
                <Text style={s.statLbl}>TIEMPO</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>{distance ?? '—'}</Text>
                <Text style={s.statLbl}>DISTANCIA</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>{arrival ?? '—'}</Text>
                <Text style={s.statLbl}>LLEGADA</Text>
              </View>
            </View>

            {/* Tráfico */}
            {trafficDelay > 1 && (
              <View style={s.trafficRow}>
                <View style={s.trafficDot} />
                <Text style={s.trafficTxt}>Tráfico intenso en tu ruta</Text>
                <Text style={s.trafficDelay}>+{trafficDelay} min</Text>
              </View>
            )}

            {/* Botón ¡Vamos! */}
            <TouchableOpacity
              style={[s.startBtn, (isTransitioning || navActive) && { opacity: 0.5 }]}
              onPress={handleVamos}
              disabled={isTransitioning || navActive}
              activeOpacity={0.88}>
              <Icon name="navigation" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={s.startTxt}>¡Vamos!</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );

  // En Android envolvemos en Modal para garantizar que tape toda la UI de RN.
  // En iOS el absoluteFillObject + zIndex funciona correctamente → no tocamos nada.
  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={showPreview}
        transparent
        animationType="none"
        onRequestClose={() => { if (!launchedRef.current) handleClosePress(); }}
        statusBarTranslucent>
        {previewContent}
      </Modal>
    );
  }

  return previewContent;
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080920',
    zIndex: 9998,
    elevation: 9998,
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080920',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8,9,32,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0E2D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarFallback: {
    backgroundColor: 'rgba(77,166,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  categoryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 4,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  categoryTxt: { color: '#60A5FA', fontSize: 10, fontWeight: '700' },
  destName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  modeBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 54,
  },
  modeTxt: {
    color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700',
    marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7,
  },
  infoTxt: { flex: 1, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' },
  phoneLink: { color: '#60A5FA', textDecorationLine: 'underline' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8,
    marginTop: 4, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 3 },
  statLbl: {
    color: 'rgba(255,255,255,0.38)', fontSize: 9, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  trafficRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', gap: 8,
  },
  trafficDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  trafficTxt: { flex: 1, color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
  trafficDelay: { color: '#F87171', fontSize: 13, fontWeight: '700' },
  startBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    shadowColor: '#FCD34D', shadowOpacity: 0.45, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  startTxt: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 24,
  },
  loadingTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});

export default MapboxNavigation;
