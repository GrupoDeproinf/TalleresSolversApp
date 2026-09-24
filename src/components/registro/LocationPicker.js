// Selector de ubicación en mapa (Mapbox en WebView). Extraído del registro
// anterior para reutilizarlo en el registro nuevo del taller.
import React, {useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibHVpcy1zb2x2ZXJzIiwiYSI6ImNtaTZla2k2ZzJxY3Yyam9sd3d4c2JoeDIifQ.za22tuYJ06Tf8mseJJMqmQ';

const buildLocationPickerHTML = (lat, lng) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"/>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet"/>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,sans-serif;background:#1D1E56;}
    #map{width:100%;height:100%;}
    .mapboxgl-ctrl-bottom-left,.mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-logo{display:none!important;}
    #pin{position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);z-index:10;pointer-events:none;}
    #pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));}
    #bottom{position:absolute;bottom:0;left:0;right:0;background:#1D1E56;border-radius:22px 22px 0 0;padding:16px 20px 40px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);z-index:20;}
    #handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px;}
    #confirm-btn{width:100%;padding:17px 0;border:none;border-radius:16px;background:#FFD60A;font-size:16px;font-weight:900;color:#1D1E56;cursor:pointer;letter-spacing:0.2px;}
    #hint{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:rgba(29,30,86,0.82);border-radius:20px;padding:7px 16px;z-index:15;pointer-events:none;white-space:nowrap;}
    #hint span{font-size:12px;color:#FFFFFF;font-weight:600;}
    #locate-btn{position:absolute;top:16px;right:16px;width:46px;height:46px;border-radius:23px;background:#FFFFFF;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);z-index:15;transition:opacity 0.2s;}
    #locate-btn.loading{opacity:0.5;pointer-events:none;}
    @keyframes spin{to{transform:rotate(360deg);}}
    #locate-btn.loading svg{animation:spin 0.9s linear infinite;}
  </style>
</head>
<body>
<div id="map"></div>
<div id="pin">
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#E11D48"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
  </svg>
</div>
<div id="hint"><span>Mueve el mapa para ajustar el pin</span></div>
<button id="locate-btn" onclick="requestLocation()">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="#1D1E56" stroke-width="2.2"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#1D1E56" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
</button>
<div id="bottom">
  <div id="handle"></div>
  <button id="confirm-btn" onclick="confirm()">Usar esta ubicación</button>
</div>
<script>
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var map=new mapboxgl.Map({container:'map',style:'mapbox://styles/mapbox/streets-v12',center:[${lng},${lat}],zoom:15,attributionControl:false});
var currentLng=${lng},currentLat=${lat};
map.on('move',function(){var c=map.getCenter();currentLng=+c.lng.toFixed(6);currentLat=+c.lat.toFixed(6);});
setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);
function confirm(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'confirm',lat:currentLat,lng:currentLng}));}
function requestLocation(){var btn=document.getElementById('locate-btn');if(btn)btn.classList.add('loading');window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'requestLocation'}));}
window.flyToLocation=function(lat,lng){currentLat=lat;currentLng=lng;map.flyTo({center:[lng,lat],zoom:16,duration:800,essential:true});var btn=document.getElementById('locate-btn');if(btn)btn.classList.remove('loading');};
<\/script>
</body>
</html>`;

// Centro por defecto: Caracas.
export const DEFAULT_LAT = 10.4806;
export const DEFAULT_LNG = -66.9036;

const LocationPicker = ({visible, lat, lng, onClose, onConfirm}) => {
  const ref = useRef(null);
  const startLat = Number.isFinite(lat) ? lat : DEFAULT_LAT;
  const startLng = Number.isFinite(lng) ? lng : DEFAULT_LNG;

  const onMessage = event => {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch (_) {
      return;
    }
    if (msg.type === 'confirm') {
      onConfirm && onConfirm({lat: msg.lat, lng: msg.lng});
      return;
    }
    if (msg.type !== 'requestLocation') return;
    const removeLoading = () =>
      ref.current?.injectJavaScript(
        "var b=document.getElementById('locate-btn');if(b)b.classList.remove('loading'); true;",
      );
    const locate = () =>
      Geolocation.getCurrentPosition(
        pos =>
          ref.current?.injectJavaScript(
            `window.flyToLocation(${pos.coords.latitude}, ${pos.coords.longitude}); true;`,
          ),
        () => removeLoading(),
        {enableHighAccuracy: true, timeout: 10000, maximumAge: 5000},
      );
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(g =>
        g === PermissionsAndroid.RESULTS.GRANTED ? locate() : removeLoading(),
      );
    } else {
      Geolocation.requestAuthorization();
      locate();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{flex: 1, backgroundColor: '#1D1E56'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 54 : 16,
            paddingBottom: 12,
            paddingHorizontal: 16,
          }}>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar mapa"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{flex: 1, textAlign: 'center', color: '#FFD60A', fontSize: 16, fontWeight: '800'}}>
            Marca dónde está tu taller
          </Text>
          <View style={{width: 44}} />
        </View>
        {visible ? (
          <WebView
            ref={ref}
            style={{flex: 1}}
            originWhitelist={['*']}
            source={{html: buildLocationPickerHTML(startLat, startLng)}}
            javaScriptEnabled
            domStorageEnabled
            onMessage={onMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1D1E56'}}>
                <ActivityIndicator size="large" color="#FFD60A" />
              </View>
            )}
          />
        ) : null}
      </View>
    </Modal>
  );
};

export default LocationPicker;
