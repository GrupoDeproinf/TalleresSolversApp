import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import TextInputs from '../../../commonComponents/textInputs';
import { commonStyles } from '../../../style/commonStyle.css';
import styles from '../../auth/signUp/style.css';
import appColors from '../../../themes/appColors';
import { Email } from '../../../assets/icons/email';
import { Call } from '../../../utils/icon';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons2 from 'react-native-vector-icons/Ionicons';
import Icons5 from 'react-native-vector-icons/AntDesign';
import Icons3 from 'react-native-vector-icons/Fontisto';
import Icons4 from 'react-native-vector-icons/Entypo';
import CheckBox from 'react-native-check-box';
import { RadioButton } from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { Dropdown } from 'react-native-element-dropdown';
import { useValues } from '../../../../App';

const BUSINESS_DAYS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label: value, value };
});

const buildDefaultBusinessHours = () =>
  BUSINESS_DAYS.reduce((acc, day) => {
    acc[day.key] = { enabled: false, open: '08:00', close: '17:00' };
    return acc;
  }, {});

const isHttpDocumentUrl = s =>
  typeof s === 'string' && /^https?:\/\//i.test(s.trim());

/** Normaliza URI remota para Image (trim; sin romper URLs ya codificadas). */
const normalizeRemoteImageUri = s => {
  if (typeof s !== 'string') return '';
  return s.trim();
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAPBOX_TOKEN = 'REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN';

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
    #pin{
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-100%);
      z-index:10;pointer-events:none;
    }
    #pin svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));}
    #bottom{
      position:absolute;bottom:0;left:0;right:0;
      background:#1D1E56;border-radius:22px 22px 0 0;
      padding:16px 20px 40px;
      box-shadow:0 -4px 24px rgba(0,0,0,0.4);
      z-index:20;
    }
    #handle{width:36px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:0 auto 14px;}
    #confirm-btn{
      width:100%;padding:17px 0;border:none;border-radius:16px;
      background:#FFD60A;font-size:16px;font-weight:900;
      color:#1D1E56;cursor:pointer;letter-spacing:0.2px;
    }
    #hint{
      position:absolute;top:80px;left:50%;transform:translateX(-50%);
      background:rgba(29,30,86,0.82);border-radius:20px;
      padding:7px 16px;z-index:15;pointer-events:none;
      white-space:nowrap;
    }
    #hint span{font-size:12px;color:#FFFFFF;font-weight:600;}
    #locate-btn{
      position:absolute;top:16px;right:16px;
      width:46px;height:46px;border-radius:23px;
      background:#FFFFFF;border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 12px rgba(0,0,0,0.3);z-index:15;
      transition:opacity 0.2s;
    }
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
var map=new mapboxgl.Map({
  container:'map',style:'mapbox://styles/mapbox/streets-v12',
  center:[${lng},${lat}],zoom:15,
  attributionControl:false
});
var currentLng=${lng},currentLat=${lat};
map.on('move',function(){
  var c=map.getCenter();
  currentLng=+c.lng.toFixed(6);currentLat=+c.lat.toFixed(6);
});
setTimeout(function(){var h=document.getElementById('hint');if(h)h.style.display='none';},3000);
function confirm(){
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
    JSON.stringify({type:'confirm',lat:currentLat,lng:currentLng})
  );
}
function requestLocation(){
  var btn=document.getElementById('locate-btn');
  if(btn)btn.classList.add('loading');
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
    JSON.stringify({type:'requestLocation'})
  );
}
window.flyToLocation=function(lat,lng){
  currentLat=lat;currentLng=lng;
  map.flyTo({center:[lng,lat],zoom:16,duration:800,essential:true});
  var btn=document.getElementById('locate-btn');
  if(btn)btn.classList.remove('loading');
};
<\/script>
</body>
</html>`;

/** Mismos estilos que tallerDetail (card, instalaciones). */
const tallerInstalacionStyles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1F2344',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  titleHintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2344',
    marginBottom: 0,
    marginRight: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD60A',
    paddingLeft: 10,
    flexShrink: 0,
  },
  helpBesideTitle: {
    flex: 1,
    minWidth: 120,
    fontSize: 11,
    lineHeight: 15,
    color: '#6B7280',
    fontWeight: '500',
    paddingTop: 5,
    paddingLeft: 2,
  },
  installationImage: {
    width: SCREEN_WIDTH * 0.78,
    height: 240,
    borderRadius: 16,
  },
  installationRow: {
    paddingRight: 6,
  },
  installationPreviewBlock: {
    marginBottom: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#F6F2F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31,35,68,0.08)',
    borderStyle: 'dashed',
  },
  imageWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
});

/**
 * Stepper de edición de taller (misma UI que el registro en SignUp, sin modificar SignUp).
 */
const TallerEditStepper = ({
  initialProfile,
  onSave,
  onStepChange,
}) => {
  const [email, setEmail] = useState('');
  const [cedula, setcedula] = useState(0);
  const [Nombre, setNombre] = useState('');
  const [phone, setPhone] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cedulaError, setcedulaError] = useState('');
  const [NombreError, setNombreError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isGetOtpDisabled, setGetOtpDisabled] = useState(false);
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [iscedulaTyping, setcedulaTyping] = useState(false);
  const [NombreTyping, setNombreTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isConfTyping, setConfPwdTyping] = useState(false);

  const [typeOfView, settypeOfView] = useState('');

  const [selectedPrefix, setSelectedPrefix] = useState('J-'); // Default value 'J'

  const [MetodosPagoSelected, setMetodosPagoSelected] = useState([]);

  const [whats, setwhats] = useState(0);
  const [whatsError, setwhatsError] = useState('');

  const [lat, setlat] = useState(37.7749);
  const [lng, setlng] = useState(-122.4194);

  // Nuevos campos para el formulario de taller
  const [Direccion, setDireccion] = useState('');
  const [DireccionError, setDireccionError] = useState('');
  const [DireccionTyping, setDireccionTyping] = useState(false);

  const [RegComercial, setRegComercial] = useState('');
  const [RegComercialError, setRegComercialError] = useState('');
  const [RegComercialTyping, setRegComercialTyping] = useState(false);

  const [checked, setChecked] = useState('no'); // Para agente autorizado

  const [Caracteristicas, setCaracteristicas] = useState('');
  const [CaracteristicasError, setCaracteristicasError] = useState('');
  const [CaracteristicasTyping, setCaracteristicasTyping] = useState(false);

  const [Experiencia, setExperiencia] = useState('');
  const [ExperienciaError, setExperienciaError] = useState('');
  const [ExperienciaTyping, setExperienciaTyping] = useState(false);

  const [LinkFacebook, setLinkFacebook] = useState('');
  const [LinkFacebookError, setLinkFacebookError] = useState('');

  const [LinkInstagram, setLinkInstagram] = useState('');
  const [LinkInstagramError, setLinkInstagramError] = useState('');

  const [LinkTiktok, setLinkTiktok] = useState('');
  const [LinkTiktokError, setLinkTiktokError] = useState('');

  const [seguro, setseguro] = useState('');
  const [seguroError, setseguroError] = useState('');
  const [seguroTyping, setseguroTyping] = useState(false);

  // Estados de error para documentos requeridos
  const [rifIdFiscalError, setRifIdFiscalError] = useState('');
  const [fotoFrenteTallerError, setFotoFrenteTallerError] = useState('');
  const [fotoInternaTallerError, setFotoInternaTallerError] = useState('');

  const [metodosPago, setMetodosPago] = useState([
    { label: 'Efectivo', value: 'efectivo', checked: false },
    { label: 'Pago Móvil', value: 'pagoMovil', checked: false },
    { label: 'Punto de venta', value: 'puntoVenta', checked: false },
    { label: 'Credito internacional', value: 'tarjetaCreditoI', checked: false },
    { label: 'Credito nacional', value: 'tarjetaCreditoN', checked: false },
    { label: 'Transferencia', value: 'transferencia', checked: false },
    { label: 'Zelle', value: 'zelle', checked: false },
    { label: 'Zinli', value: 'zinli', checked: false },
  ]);

  const [estadoSelected, setestadoSelected] = useState(''); // Default value 'J'

  const [estadosVenezuela, setEstadosVenezuela] = useState([
    { label: 'Seleccione un estado', value: '' },
    { label: 'Amazonas', value: 'Amazonas' },
    { label: 'Anzoátegui', value: 'Anzoátegui' },
    { label: 'Apure', value: 'Apure' },
    { label: 'Aragua', value: 'Aragua' },
    { label: 'Barinas', value: 'Barinas' },
    { label: 'Bolívar', value: 'Bolívar' },
    { label: 'Carabobo', value: 'Carabobo' },
    { label: 'Cojedes', value: 'Cojedes' },
    { label: 'Delta Amacuro', value: 'Delta Amacuro' },
    { label: 'Distrito Capital', value: 'Distrito Capital' },
    { label: 'Falcón', value: 'Falcón' },
    { label: 'Guárico', value: 'Guárico' },
    { label: 'Lara', value: 'Lara' },
    { label: 'La Guaira', value: 'La Guaira' },
    { label: 'Mérida', value: 'Mérida' },
    { label: 'Miranda', value: 'Miranda' },
    { label: 'Monagas', value: 'Monagas' },
    { label: 'Nueva Esparta', value: 'Nueva Esparta' },
    { label: 'Portuguesa', value: 'Portuguesa' },
    { label: 'Sucre', value: 'Sucre' },
    { label: 'Táchira', value: 'Táchira' },
    { label: 'Trujillo', value: 'Trujillo' },
    { label: 'Yaracuy', value: 'Yaracuy' },
    { label: 'Zulia', value: 'Zulia' },
  ]);

  const [businessHours, setBusinessHours] = useState(buildDefaultBusinessHours);
  const [businessHoursError, setBusinessHoursError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(7);
  const [imageUri, setImageUri] = useState(null);
  const [base64, setBase64] = useState(null);

  // Estados para los 5 nuevos inputs de archivo
  const [rifIdFiscalUri, setRifIdFiscalUri] = useState(null);
  const [rifIdFiscalBase64, setRifIdFiscalBase64] = useState(null);
  
  const [permisoOperacionUri, setPermisoOperacionUri] = useState(null);
  const [permisoOperacionBase64, setPermisoOperacionBase64] = useState(null);
  
  const [logotipoNegocioUri, setLogotipoNegocioUri] = useState(null);
  const [logotipoNegocioBase64, setLogotipoNegocioBase64] = useState(null);
  
  const [fotoFrenteTallerUri, setFotoFrenteTallerUri] = useState(null);
  const [fotoFrenteTallerBase64, setFotoFrenteTallerBase64] = useState(null);
  
  const [fotoInternaTallerUri, setFotoInternaTallerUri] = useState(null);
  const [fotoInternaTallerBase64, setFotoInternaTallerBase64] = useState(null);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalTarget,  setPhotoModalTarget]  = useState(null);

  // ── Helpers selector multi-origen ────────────────────────────────────────
  const fileToBase64 = uri =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

  const applyPhotoResult = (target, uri, b64) => {
    if (target === 'logo')              { setImageUri(uri); setBase64(b64); }
    else if (target === 'rifIdFiscal')  { setRifIdFiscalUri(uri); setRifIdFiscalBase64(b64); setRifIdFiscalError(''); }
    else if (target === 'permiso')      { setPermisoOperacionUri(uri); setPermisoOperacionBase64(b64); }
    else if (target === 'logotipo')     { setLogotipoNegocioUri(uri); setLogotipoNegocioBase64(b64); }
    else if (target === 'frente')       { setFotoFrenteTallerUri(uri); setFotoFrenteTallerBase64(b64); setFotoFrenteTallerError(''); }
    else if (target === 'interna')      { setFotoInternaTallerUri(uri); setFotoInternaTallerBase64(b64); setFotoInternaTallerError(''); }
  };

  const openPhotoOptions = target => { setPhotoModalTarget(target); setPhotoModalVisible(true); };

  const handlePickGallery = () => {
    const t = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(() => {
      launchImageLibrary({ mediaType: 'photo', includeBase64: true }, res => {
        if (res.didCancel || res.errorCode) return;
        const a = res.assets?.[0];
        if (a) applyPhotoResult(t, a.uri, a.base64);
      });
    }, 400);
  };

  const handlePickCamera = () => {
    const t = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(async () => {
      if (Platform.OS === 'android') {
        const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
          { title: 'Permiso de cámara', message: 'La app necesita acceso a tu cámara.' });
        if (g !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      launchCamera({ mediaType: 'photo', includeBase64: true }, res => {
        if (res.didCancel || res.errorCode) return;
        const a = res.assets?.[0];
        if (a) applyPhotoResult(t, a.uri, a.base64);
      });
    }, 400);
  };

  const handlePickDocument = () => {
    const t = photoModalTarget;
    setPhotoModalVisible(false);
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.allFiles] });
        const uri = result.uri;
        let b64 = null;
        try { b64 = await fileToBase64(uri); } catch (_) {}
        applyPhotoResult(t, uri, b64);
      } catch (e) {
        if (!DocumentPicker.isCancel(e)) console.warn('[DocumentPicker]', e);
      }
    }, 400);
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        const base64Length =
          base64Data.length * (3 / 4) -
          (base64Data.slice(-2) === '=='
            ? 2
            : base64Data.slice(-1) === '='
              ? 1
              : 0);
        const sizeInKB = base64Length / 1024;
        const sizeInMB = sizeInKB / 1024;
        console.log(`Size in KB: ${sizeInKB.toFixed(2)} KB`);
        console.log(`Size in MB: ${sizeInMB.toFixed(2)} MB`);
        setImageUri(source.uri);
        setBase64(base64Data);
      }
    });
  };

  const clearImage = () => {
    setImageUri(null);
    setBase64(null);
  };

  const selectRifIdFiscal = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setRifIdFiscalUri(source.uri);
        setRifIdFiscalBase64(base64Data);
        setRifIdFiscalError('');
      }
    });
  };

  const clearRifIdFiscal = () => {
    setRifIdFiscalUri(null);
    setRifIdFiscalBase64(null);
    if (currentStep === 6) {
      setRifIdFiscalError('RIF/ID Fiscal es requerido');
    }
  };

  const selectPermisoOperacion = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setPermisoOperacionUri(source.uri);
        setPermisoOperacionBase64(base64Data);
      }
    });
  };

  const clearPermisoOperacion = () => {
    setPermisoOperacionUri(null);
    setPermisoOperacionBase64(null);
  };

  const selectLogotipoNegocio = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setLogotipoNegocioUri(source.uri);
        setLogotipoNegocioBase64(base64Data);
      }
    });
  };

  const clearLogotipoNegocio = () => {
    setLogotipoNegocioUri(null);
    setLogotipoNegocioBase64(null);
  };

  const selectFotoFrenteTaller = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setFotoFrenteTallerUri(source.uri);
        setFotoFrenteTallerBase64(base64Data);
        setFotoFrenteTallerError('');
      }
    });
  };

  const clearFotoFrenteTaller = () => {
    setFotoFrenteTallerUri(null);
    setFotoFrenteTallerBase64(null);
    if (currentStep === 6) {
      setFotoFrenteTallerError('Foto del Frente del Taller es requerida');
    }
  };

  const selectFotoInternaTaller = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else {
        const source = { uri: response.assets[0].uri };
        const base64Data = response.assets[0].base64;
        setFotoInternaTallerUri(source.uri);
        setFotoInternaTallerBase64(base64Data);
        setFotoInternaTallerError('');
      }
    });
  };

  const clearFotoInternaTaller = () => {
    setFotoInternaTallerUri(null);
    setFotoInternaTallerBase64(null);
    if (currentStep === 6) {
      setFotoInternaTallerError('Foto Interna del Taller es requerida');
    }
  };

  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);
  const [locationManuallyModified, setLocationManuallyModified] = useState(false);
  const locationPickerRef = useRef(null);

  const handleLocationPickerMessage = event => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'confirm') {
        setlat(msg.lat);
        setlng(msg.lng);
        setLocationPicked(true);
        setLocationManuallyModified(true);
        setLocationPickerVisible(false);
      } else if (msg.type === 'requestLocation') {
        const removeLoading = () => {
          locationPickerRef.current?.injectJavaScript(
            `var b=document.getElementById('locate-btn');if(b)b.classList.remove('loading'); true;`
          );
        };
        const doGetLocation = () => {
          Geolocation.getCurrentPosition(
            pos => {
              locationPickerRef.current?.injectJavaScript(
                `window.flyToLocation(${pos.coords.latitude}, ${pos.coords.longitude}); true;`
              );
            },
            () => removeLoading(),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
          );
        };
        if (Platform.OS === 'android') {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(granted => {
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              doGetLocation();
            } else {
              removeLoading();
            }
          });
        } else {
          Geolocation.requestAuthorization();
          doGetLocation();
        }
      }
    } catch (_) {}
  };

  const [showPass, setshowPass] = useState(true);
  const changePassValue = () => {
    setshowPass(!showPass);
  };

  const [showPass2, setshowPass2] = useState(true);
  const changePassValue2 = () => {
    setshowPass2(!showPass2);
  };

  const [showPass3, setshowPass3] = useState(true);
  const changePassValue3 = () => {
    setshowPass3(!showPass3);
  };

  const [showPass4, setshowPass4] = useState(true);
  const changePassValue4 = () => {
    setshowPass4(!showPass4);
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Direccion de correo incorrecta');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePhone = () => {
    // Verificar que phone no sea undefined o null
    if (!phone || phone === '') {
      setPhoneError('Teléfono es requerido');
      return false;
    }
    
    // Eliminar la máscara para validar solo los números
    const numericPhone = phone.replace(/[^0-9]/g, ''); // Remueve paréntesis, espacios y guiones
    
    // Validar que no empiece con 0
    if (numericPhone.length > 0 && numericPhone[0] === '0') {
      setPhoneError('El número no puede empezar con 0');
      return false;
    }
    
    const phoneRegex = /^\d{10}$/; // Validar exactamente 10 dígitos

    if (!phoneRegex.test(numericPhone)) {
      setPhoneError('Teléfono debe contener exactamente 10 dígitos');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };


  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  const validateDireccion = () => {
    if (Direccion?.trim() === '') {
      setDireccionError('Dirección es requerida');
      return false;
    } else {
      setDireccionError('');
      return true;
    }
  };

  const validateRegComercial = () => {
    if (RegComercial?.trim() === '') {
      setRegComercialError('Registro comercial es requerido');
      return false;
    } else {
      setRegComercialError('');
      return true;
    }
  };

  const validateCaracteristicas = () => {
    if (Caracteristicas?.trim() === '') {
      setCaracteristicasError('Características es requerido');
      return false;
    } else {
      setCaracteristicasError('');
      return true;
    }
  };

  const validateExperiencia = () => {
    if (Experiencia?.trim() === '') {
      setExperienciaError('Experiencia es requerida');
      return false;
    } else {
      setExperienciaError('');
      return true;
    }
  };

  const validateSeguro = () => {
    if (seguro?.trim() === '') {
      setseguroError('Seguro es requerido');
      return false;
    } else {
      setseguroError('');
      return true;
    }
  };

  const validateBusinessHours = () => {
    const hasSelectedDay = BUSINESS_DAYS.some(day => businessHours[day.key]?.enabled);
    if (!hasSelectedDay) {
      setBusinessHoursError('Debes seleccionar al menos un día de atención');
      return false;
    }

    const invalidDay = BUSINESS_DAYS.find(day => {
      const item = businessHours[day.key];
      if (!item?.enabled) {
        return false;
      }
      return !item.open || !item.close || item.open >= item.close;
    });

    if (invalidDay) {
      setBusinessHoursError(
        'Verifica que la hora de cierre sea mayor a la de apertura',
      );
      return false;
    }

    setBusinessHoursError('');
    return true;
  };

  // Función para validar el paso actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Información básica - REQUERIDO
        return Nombre?.trim() !== '' && 
               selectedPrefix !== '' && 
               cedula !== '' && 
               cedula !== 0 && 
               email?.trim() !== '' && 
               validateEmail();
      case 2: // Ubicación - REQUERIDO
        return estadoSelected !== '' && Direccion?.trim() !== '';
      case 3: // Contacto - REQUERIDO
        return phone && phone !== '' && whats && whats !== '' && validatePhone();
      case 4: // Información del taller - OPCIONAL
        return true; // Siempre permite continuar
      case 5: // Redes sociales y seguro - OPCIONAL
        return true; // Siempre permite continuar
      case 6: // Documentos — opcional al editar
        return true;
      case 7: // Horarios - REQUERIDO
        return validateBusinessHours();
      default:
        return false;
    }
  };
  // Funciones para navegación entre pasos
  const nextStep = () => {
    // Ejecutar validación antes de avanzar
    const isValid = validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const toggleCheckBox = index => {
    const updatedMetodos = [...metodosPago];
    updatedMetodos[index].checked = !updatedMetodos[index].checked;
    setMetodosPago(updatedMetodos);
  };

  const { bgFullStyle, textColorStyle, iconColorStyle, isDark, t, textRTLStyle } = useValues();

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };
  const stepStyles = StyleSheet.create({
    progressContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#f8f9fa',
      borderBottomWidth: 1,
      borderBottomColor: '#e9ecef',
    },
    progressBar: {
      height: 4,
      backgroundColor: '#e9ecef',
      borderRadius: 2,
      marginBottom: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2D3261',
      borderRadius: 2,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stepDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#e9ecef',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#e9ecef',
    },
    stepDotActive: {
      backgroundColor: '#FFD60A',
      borderColor: '#FFD60A',
    },
    stepDotCompleted: {
      backgroundColor: '#FFD60A',
      borderColor: '#FFD60A',
    },
    stepNumber: {
      color: '#6c757d',
      fontSize: 11,
      fontWeight: 'bold',
    },
    stepNumberActive: {
      color: '#1F2344',
    },
    stepNumberCompleted: {
      color: '#1F2344',
    },
    stepTitle: {
      fontSize: 10,
      color: '#6c757d',
      textAlign: 'center',
      marginTop: 5,
      fontWeight: '500',
    },
    stepTitleActive: {
      color: '#2D3261',
      fontWeight: 'bold',
    },
    stepTitleCompleted: {
      color: '#FFD60A',
      fontWeight: 'bold',
    },
    stepContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      marginTop: 8,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: 1,
      borderColor: 'rgba(15,23,42,0.05)',
    },
    stepHeader: {
      marginBottom: 20,
      alignItems: 'center',
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2D3261',
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: '#6c757d',
      textAlign: 'center',
      lineHeight: 22,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e9ecef',
    },
    navButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    navButtonSecondary: {
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#dee2e6',
    },
    navButtonPrimary: {
      backgroundColor: '#2D3261',
    },
    navButtonDisabled: {
      backgroundColor: '#e9ecef',
      opacity: 0.6,
    },
    navButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    navButtonTextSecondary: {
      color: '#6c757d',
    },
    navButtonTextPrimary: {
      color: '#ffffff',
    },
    navButtonTextDisabled: {
      color: '#adb5bd',
    },
  });
  // Componente del indicador de progreso
  const ProgressIndicator = () => {
    const steps = [
      { number: 1, title: 'Básico' },
      { number: 2, title: 'Ubicación' },
      { number: 3, title: 'Contacto' },
      { number: 4, title: 'Negocio' },
      { number: 5, title: 'Redes' },
      { number: 6, title: 'Documentos' },
      { number: 7, title: 'Horarios' },
    ];

    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const currentStepConfig = steps.find(s => s.number === currentStep);
    let motivationalText = 'Actualiza los datos de tu negocio.';
    if (progressPercent >= 25 && progressPercent < 50) {
      motivationalText = '¡Buen comienzo! Sigue avanzando con los siguientes datos.';
    } else if (progressPercent >= 50 && progressPercent < 75) {
      motivationalText = '¡Vas a mitad de camino! Cada paso te acerca a más clientes.';
    } else if (progressPercent >= 75 && progressPercent < 100) {
      motivationalText = '¡Ya casi terminas! Revisa y completa los últimos detalles.';
    } else if (progressPercent === 100) {
      motivationalText = '¡Excelente! Tu registro está listo para enviarse.';
    }

    return (
      <View
        style={[
          stepStyles.progressContainer,
          {
            paddingVertical: 4,
            paddingHorizontal: 12,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          },
        ]}>
        <View style={stepStyles.stepIndicator}>
          {steps.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            
            return (
              <View
                key={step.number}
                style={[
                  stepStyles.stepDot,
                  isActive && stepStyles.stepDotActive,
                  isCompleted && stepStyles.stepDotCompleted,
                ]}
              >
                <Text
                  style={[
                    stepStyles.stepNumber,
                    isActive && stepStyles.stepNumberActive,
                    isCompleted && stepStyles.stepNumberCompleted,
                  ]}
                >
                  {isCompleted ? '✓' : step.number}
                </Text>
              </View>
            );
          })}
        </View>
        {(() => {
          const required = [
            (Nombre || '').trim() !== '',
            String(cedula || '').trim() !== '' && cedula !== 0,
            (email || '').trim() !== '',
            (estadoSelected || '').trim() !== '',
            (Direccion || '').trim() !== '',
            String(phone || '').replace(/[^0-9]/g, '').length >= 10,
            String(whats || '').replace(/[^0-9]/g, '').length >= 10,
            !!(rifIdFiscalUri || rifIdFiscalBase64),
            !!(fotoFrenteTallerUri || fotoFrenteTallerBase64),
            !!(fotoInternaTallerUri || fotoInternaTallerBase64),
            BUSINESS_DAYS.some(d => businessHours[d.key]?.enabled),
          ];
          const filled = required.filter(Boolean).length;
          const total  = required.length;
          const pct    = Math.round((filled / total) * 100);
          const barColor = pct < 40 ? '#F59E0B' : pct < 80 ? '#3B82F6' : '#22C55E';
          return (
            <View style={{ marginTop: 6, paddingHorizontal: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ flex: 1 }} />
                <Text style={{ fontSize: 11, color: appColors.subtitle, textAlign: 'center', flex: 2 }}>
                  Paso {currentStep} de {totalSteps}{currentStepConfig ? ` · ${currentStepConfig.title}` : ''}
                </Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: barColor }}>{pct}%</Text>
                </View>
              </View>
              <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }}>
                <View style={{ height: 4, width: `${pct}%`, backgroundColor: barColor, borderRadius: 2 }} />
              </View>
              <Text style={{ fontSize: 10, color: appColors.primary, textAlign: 'center', marginTop: 3 }}>
                {filled} de {total} campos requeridos completados
              </Text>
            </View>
          );
        })()}
      </View>
    );
  };
  const validateWhats = () => {
    const w = whats == null ? '' : String(whats);
    const numeric = w.replace(/[^0-9]/g, '');
    if (!numeric || numeric.length === 0) {
      setwhatsError('WhatsApp es requerido');
      return false;
    }
    if (numeric[0] === '0') {
      setwhatsError('El número no puede empezar con 0');
      return false;
    }
    if (!/^\d{10}$/.test(numeric)) {
      setwhatsError('WhatsApp debe tener exactamente 10 dígitos');
      return false;
    }
    setwhatsError('');
    return true;
  };

  const submitTallerEdit = async () => {
    if (typeof onSave !== 'function') return;
    setGetOtpDisabled(true);
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isWhatsValid = validateWhats();
    const isHoursValid = validateBusinessHours();
    const cedulaOk =
      cedula !== '' && cedula !== 0 && String(cedula).trim() !== '';
    if (
      !isEmailValid ||
      !isPhoneValid ||
      !isWhatsValid ||
      !isHoursValid ||
      !Nombre?.trim() ||
      !cedulaOk ||
      estadoSelected === '' ||
      !(Direccion || '').trim()
    ) {
      setGetOtpDisabled(false);
      showToast('Error al actualizar el taller, por favor validar formulario');
      return;
    }
    const newFormatMP = metodosPago.reduce((acc, method) => {
      acc[method.value] = method.checked;
      return acc;
    }, {});
    const payload = {
      nombre: Nombre ?? '',
      rif: selectedPrefix + '' + cedula,
      phone: phone?.replace(/\s+/g, '') ?? '',
      email: email ?? '',
      Direccion: Direccion ?? '',
      RegComercial: RegComercial ?? '',
      Caracteristicas: Caracteristicas ?? '',
      Experiencia: Experiencia ?? '',
      LinkFacebook: LinkFacebook ?? '',
      LinkInstagram: LinkInstagram ?? '',
      LinkTiktok: LinkTiktok ?? '',
      seguro: seguro ?? '',
      agenteAutorizado: checked === 'si',
      whatsapp: String(whats ?? '').replace(/\s+/g, ''),
      metodos_pago: newFormatMP,
      estado: estadoSelected,
      horarios_atencion: businessHours,
      base64:
        base64 == null || base64 === undefined || base64 === '' ? '' : base64,
      rifIdFiscal:
        rifIdFiscalBase64 == null ||
        rifIdFiscalBase64 === undefined ||
        rifIdFiscalBase64 === ''
          ? ''
          : rifIdFiscalBase64,
      permisoOperacion:
        permisoOperacionBase64 == null ||
        permisoOperacionBase64 === undefined ||
        permisoOperacionBase64 === ''
          ? ''
          : permisoOperacionBase64,
      logotipoNegocio:
        logotipoNegocioBase64 == null ||
        logotipoNegocioBase64 === undefined ||
        logotipoNegocioBase64 === ''
          ? ''
          : logotipoNegocioBase64,
      fotoFrenteTaller:
        fotoFrenteTallerBase64 == null ||
        fotoFrenteTallerBase64 === undefined ||
        fotoFrenteTallerBase64 === ''
          ? ''
          : fotoFrenteTallerBase64,
      fotoInternaTaller:
        fotoInternaTallerBase64 == null ||
        fotoInternaTallerBase64 === undefined ||
        fotoInternaTallerBase64 === ''
          ? ''
          : fotoInternaTallerBase64,
      ubicacion: { lat, lng },
      lat,
      lng,
    };
    try {
      await onSave(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setGetOtpDisabled(false);
    }
  };

  const StepNavigation = () => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;
    const canProceed = validateCurrentStep();

    return (
      <View style={stepStyles.navigationContainer}>
        <TouchableOpacity
          style={[
            stepStyles.navButton,
            stepStyles.navButtonSecondary,
            isFirstStep && stepStyles.navButtonDisabled,
          ]}
          onPress={prevStep}
          disabled={isFirstStep}
        >
          <Text
            style={[
              stepStyles.navButtonText,
              stepStyles.navButtonTextSecondary,
              isFirstStep && stepStyles.navButtonTextDisabled,
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        {isLastStep ? (
          <TouchableOpacity
            style={[
              stepStyles.navButton,
              stepStyles.navButtonPrimary,
              !canProceed && stepStyles.navButtonDisabled,
            ]}
            onPress={submitTallerEdit}
            disabled={!canProceed || isGetOtpDisabled}
          >
            <Text
              style={[
                stepStyles.navButtonText,
                stepStyles.navButtonTextPrimary,
                (!canProceed || isGetOtpDisabled) &&
                  stepStyles.navButtonTextDisabled,
              ]}
            >
              Guardar cambios
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              stepStyles.navButton,
              stepStyles.navButtonPrimary,
              !canProceed && stepStyles.navButtonDisabled,
            ]}
            onPress={nextStep}
            disabled={!canProceed}
          >
            <Text
              style={[
                stepStyles.navButtonText,
                stepStyles.navButtonTextPrimary,
                !canProceed && stepStyles.navButtonTextDisabled,
              ]}
            >
              Siguiente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const renderStep1 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 200 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información básica del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Empecemos con el nombre y los datos fiscales principales de tu negocio.
        </Text>
      </View>

      <View
        style={{
          marginTop: 0,
          marginBottom: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginRight: 10,
            }}>
            {imageUri ? (
              <View style={stylesImage.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: 90, height: 90, borderRadius: 18 }}
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearImage}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 18,
                  backgroundColor: '#EEF2FF',
                  borderWidth: 1,
                  borderColor: 'rgba(45, 50, 97, 0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icons name="image" size={32} color="#2D3261" />
              </View>
            )}
          </View>
          <View style={{ flex: 2 }}>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('logo')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  {
                    marginLeft: 8,
                    color: '#2D3261',
                    fontSize: 13,
                    fontWeight: '600',
                  },
                ]}>
                Subir logo del negocio
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 6,
                fontSize: 10,
                color: '#9CA3AF',
              }}>
              JPG o PNG, máximo 5MB.
            </Text>
          </View>
        </View>
      </View>

      <TextInputs
        keyboardType="default"
        autoCapitalize="words"
        formCardMode={true}
        title="Nombre del Negocio"
        placeHolder="Ingrese el nombre"
        value={Nombre}
        onChangeText={text => {
          console.log(text);
          setNombre(text);
          setNombreTyping(true);
          if (text?.trim() === '') {
            setNombreError('Nombre es requerido');
          } else {
            setNombreError('');
          }
        }}
        onBlur={() => {
          setNombreTyping(false);
        }}
        icon={<Icons name="user" size={20} color="#9BA6B8" />}
      />
      {NombreError !== '' && (
        <Text style={styles.errorStyle}>{NombreError}</Text>
      )}

      <View style={{ marginTop: 5 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
          Registro de Información Fiscal (RIF)
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 4, alignItems: 'flex-start' }}>
          <View style={{
            width: 76,
            borderWidth: 1,
            borderColor: '#CBD5E1',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            height: 52,
            justifyContent: 'center',
          }}>
            <Dropdown
              style={{
                width: '100%',
                borderWidth: 0,
                paddingHorizontal: 10,
                backgroundColor: 'transparent',
                height: 52,
              }}
              placeholderStyle={{
                color: 'gray',
                fontSize: 14,
              }}
              selectedTextStyle={{
                color: 'black',
                fontSize: 14,
              }}
              data={[
                { label: 'C-', value: 'C-' },
                { label: 'E-', value: 'E-' },
                { label: 'G-', value: 'G-' },
                { label: 'J-', value: 'J-' },
                { label: 'P-', value: 'P-' },
                { label: 'V-', value: 'V-' },
              ]}
              labelField="label"
              valueField="value"
              placeholder="V-"
              value={selectedPrefix}
              onChange={item => setSelectedPrefix(item.value)}
            />
          </View>

          <View style={{
            flex: 1,
            marginLeft: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#CBD5E1',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            height: 52,
            paddingHorizontal: 12,
            minWidth: 0,
          }}>
            <Icons name="id-card-o" size={20} color="#9BA6B8" />
            <TextInput
              value={String(cedula || '')}
              placeholder="Número de RIF"
              placeholderTextColor="#9BA6B8"
              keyboardType="numeric"
              onChangeText={text => {
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 10) {
                  setcedula(numericText);
                  setcedulaTyping(true);
                  if (numericText?.trim() === '') {
                    setcedulaError('Documento es requerido');
                  } else {
                    setcedulaError('');
                  }
                }
              }}
              onBlur={() => { setcedulaTyping(false); }}
              style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#111827', minWidth: 0 }}
            />
          </View>
        </View>
        {cedulaError !== '' && (
          <Text style={styles.errorStyle}>{cedulaError}</Text>
        )}
      </View>

      <TextInputs
        title="Correo Electrónico"
        formCardMode={true}
        keyboardType={'email-address'}
        value={email}
        placeHolder="Ingrese su email"
        onChangeText={text => {
          setEmail(text);
          setEmailTyping(true);
          if (text?.trim() === '') {
            setEmailError('Email es requerido');
          } else {
            setEmailError('');
          }
        }}
        onBlur={() => {
          validateEmail();
          setEmailTyping(false);
        }}
        icon={
          <Email color={isEmailTyping ? '#051E47' : appColors.subtitle} />
        }
      />
      {emailError !== '' && (
        <Text style={styles.errorStyle}>{emailError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep2 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Ubicación del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Selecciona el estado y marca en el mapa dónde se encuentra tu negocio.
        </Text>
      </View>

      <View
        style={{
          marginTop: 8,
          marginBottom: 16,
        }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
          Estado
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 10,
            backgroundColor: '#F3F4F6',
            height: 50,
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}>
          <Dropdown
            style={{
              width: '100%',
              borderWidth: 0,
              paddingHorizontal: 4,
              backgroundColor: 'transparent',
              height: 42,
            }}
            placeholderStyle={{
              color: 'gray',
              fontSize: 13,
            }}
            selectedTextStyle={{
              color: '#111827',
              fontSize: 13,
            }}
            data={estadosVenezuela}
            labelField="label"
            valueField="value"
            placeholder="Seleccione un estado"
            value={estadoSelected}
            onChange={item => setestadoSelected(item.value)}
            search={true}
          />
        </View>
      </View>

      {/* Tarjeta de ubicación seleccionada */}
      <View
        style={{
          marginTop: 0,
          marginBottom: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: locationPicked ? '#22C55E' : 'rgba(15,23,42,0.08)',
          backgroundColor: locationPicked ? '#F0FDF4' : '#F9FAFB',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: locationPicked ? '#DCFCE7' : '#EEF2FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icons
            name={locationPicked ? 'map-marker' : 'map-marker'}
            size={22}
            color={locationPicked ? '#16A34A' : '#2D3261'}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
            Ubicación del negocio
          </Text>
          {locationPicked && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: locationManuallyModified ? '#DBEAFE' : '#DCFCE7',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginTop: 3,
              }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: locationManuallyModified ? '#1D4ED8' : '#16A34A',
              }}>
                {locationManuallyModified ? 'Modificada' : 'Guardada'}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            {locationManuallyModified
              ? 'Ubicación actualizada correctamente'
              : locationPicked
              ? 'Ubicación guardada del perfil'
              : 'Aún no has seleccionado una ubicación'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setLocationPickerVisible(true)}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#1D1E56',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}>
          <Text style={{ color: '#FFD60A', fontSize: 12, fontWeight: '700' }}>
            {locationPicked ? 'Cambiar' : 'Seleccionar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 4,
        }}>
        <TextInputs
          title="Dirección del Negocio"
          formCardMode={true}
          placeHolder="Describe la dirección lo más claro posible"
          value={Direccion}
          multiline={true}
          numberOfLines={4}
          height={120}
          onChangeText={text => {
            setDireccion(text);
            setDireccionTyping(true);
            if (text?.trim() === '') {
              setDireccionError('Direccion es requerido');
            } else {
              setDireccionError('');
            }
          }}
          onBlur={() => {
            setDireccionTyping(false);
          }}
          icon={<Icons name="map-marker" size={20} color="#9BA6B8" />}
        />
      </View>
      {DireccionError !== '' && (
        <Text style={styles.errorStyle}>{DireccionError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información de contacto
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Agrega los números de teléfono y WhatsApp para que puedan comunicarse contigo.
        </Text>
      </View>

      <TextInputs
        title="Número Telefónico"
        formCardMode={true}
        value={phone}
        placeHolder="Ejem (414) 261-79-66"
        keyboardType="numeric"
        onChangeText={text => {
          let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

          console.log('numericText', numericText)

          // Validar que no empiece con 0
          if (numericText.length > 0 && numericText[0] == '0') {
            setPhoneError('El número no puede empezar con 0');
            setPhone('');
            return;
          }

          let formattedText = '';
          if (numericText.length > 0 && numericText.length <= 3) {
            formattedText = `${numericText}`;
          } else if (numericText.length > 3 && numericText.length <= 6) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
          } else if (numericText.length > 6 && numericText.length <= 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
          } else if (numericText.length > 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
          }
          setPhone(formattedText);
          setCallTyping(true);
          if (numericText?.trim() === '') {
            setPhoneError('Número telefónico requerido');
          } else {
            setPhoneError('');
          }
        }}
        onBlur={() => {
          validatePhone();
          setCallTyping(false);
        }}
        icon={
          <Call color={isCallTyping ? '#051E47' : appColors.subtitle} />
        }
      />
      {phoneError !== '' && (
        <Text style={styles.errorStyle}>{phoneError}</Text>
      )}

      <TextInputs
        title="Whatsapp"
        formCardMode={true}
        value={whats}
        placeHolder="Ejem (414) 261-79-66"
        keyboardType="numeric"
        onChangeText={text => {
          let numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

          // Validar que no empiece con 0
          if (numericText.length > 0 && numericText[0] === '0') {
            setwhatsError('El número no puede empezar con 0');
            setwhats('');
            return;
          }

          let formattedText = '';
          if (numericText.length > 0 && numericText.length <= 3) {
            formattedText = `${numericText}`;
          } else if (numericText.length > 3 && numericText.length <= 6) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3)}`;
          } else if (numericText.length > 6 && numericText.length <= 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6)}`;
          } else if (numericText.length > 8) {
            formattedText = `${numericText.slice(0, 3)} ${numericText.slice(3, 6)} ${numericText.slice(6, 8)} ${numericText.slice(8)}`;
          }
          setwhats(formattedText);
          setCallTyping(true);
          if (numericText?.trim() === '') {
            setwhatsError('Número telefónico requerido');
          } else {
            setwhatsError('');
          }
        }}
        onBlur={() => {
          setCallTyping(false);
        }}
        icon={<Icons name="whatsapp" size={20} color="#9BA6B8" />}
      />
      {whatsError !== '' && (
        <Text style={styles.errorStyle}>{whatsError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep4 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Información del negocio
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Cuéntanos sobre tu experiencia, registro comercial y métodos de pago disponibles.
        </Text>
      </View>

      <TextInputs
        title="Registro Comercial"
        formCardMode={true}
        value={RegComercial}
        placeHolder="Ingrese su Registro Comercial"
        onChangeText={text => {
          const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
          if (numericText.length <= 10) {
            setRegComercial(numericText);
            setRegComercialTyping(true);
            if (numericText?.trim() === '') {
              setRegComercialError('Registro comercial es requerido');
            } else {
              setRegComercialError('');
            }
          }
        }}
        onBlur={() => {
          setRegComercialTyping(false);
        }}
        keyboardType="numeric"
        icon={<Icons name="id-card" size={20} color="#9BA6B8"/>}
      />
      {RegComercialError !== '' && (
        <Text style={styles.errorStyle}>{RegComercialError}</Text>
      )}

      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 10, marginTop: 15 }}>
        ¿Es un Agente Autorizado?
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {[
          { value: 'si', label: 'Sí', icon: 'checkmark-circle-outline' },
          { value: 'no', label: 'No', icon: 'close-circle-outline' },
        ].map(opt => {
          const isSelected = checked === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setChecked(opt.value)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: isSelected ? '#2D3261' : '#D1D5DB',
                backgroundColor: isSelected ? '#2D3261' : '#F9FAFB',
                gap: 8,
              }}>
              <Icons2 name={opt.icon} size={20} color={isSelected ? '#FFD60A' : '#9CA3AF'} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#FFD60A' : '#4B5563' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInputs
        title="Caracteristicas del negocio"
        formCardMode={true}
        value={Caracteristicas}
        placeHolder="Característica del taller (tipo de piso, si posee fosa, rampla, entre otras condiciones, gatos elevadores)"
        multiline={true}
        numberOfLines={4}
        height={150}
        onChangeText={text => {
          setCaracteristicas(text);
          setCaracteristicasTyping(true);
          if (text?.trim() === '') {
            setCaracteristicasError('Caracteristicas es requerido');
          } else {
            setCaracteristicasError('');
          }
        }}
        onBlur={() => {
          validateCaracteristicas();
          setCaracteristicasTyping(false);
        }}
        icon={<Icons name="wrench" size={20} color="#9BA6B8" />}
      />
      {CaracteristicasError !== '' && (
        <Text style={styles.errorStyle}>{CaracteristicasError}</Text>
      )}

      <TextInputs
        title="Tiempo de experiencia en el área."
        formCardMode={true}
        placeHolder="Tiempo de experiencia"
        value={Experiencia}
        onChangeText={text => {
          setExperiencia(text);
          setExperienciaTyping(true);
          if (text?.trim() === '') {
            setExperienciaError('Experiencia es requerida');
          } else {
            setExperienciaError('');
          }
        }}
        onBlur={() => {
          setExperienciaTyping(false);
        }}
        icon={<Icons name="star" size={20} color="#9BA6B8" />}
      />
      {ExperienciaError !== '' && (
        <Text style={styles.errorStyle}>{ExperienciaError}</Text>
      )}

      <View style={{ marginTop: 5 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
          Metodos de Pago
        </Text>

        <View style={{ padding: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            {metodosPago.map((method, index) => (
              <View
                key={method.value}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 5,
                  width: '45%',
                }}>
                <CheckBox
                  isChecked={method.checked}
                  onClick={() => toggleCheckBox(index)}
                  checkBoxColor="#2D3261"
                />
                <Text style={{ marginLeft: 10, color: 'black' }}>
                  {method.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep5 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
      <View
        style={{
          marginBottom: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: '#F9FAFF',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.16)',
        }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1F2937',
            textAlign: 'left',
            marginBottom: 6,
          }}>
          Redes y seguro
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 18,
          }}>
          Conecta tus redes sociales y agrega la información del seguro de tu taller.
        </Text>
      </View>

      <TextInputs
        title="Link de Facebook"
        formCardMode={true}
        placeHolder="https://www.facebook.com/"
        value={LinkFacebook}
        onChangeText={text => {
          setLinkFacebook(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="facebook-square" size={20} color="#9BA6B8" />}
      />
      {LinkFacebookError !== '' && (
        <Text style={styles.errorStyle}>{LinkFacebookError}</Text>
      )}

      <TextInputs
        title="Link de Instagram"
        formCardMode={true}
        placeHolder="https://www.instagram.com/"
        value={LinkInstagram}
        onChangeText={text => {
          setLinkInstagram(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="instagram" size={20} color="#9BA6B8" />}
      />
      {LinkInstagramError !== '' && (
        <Text style={styles.errorStyle}>{LinkInstagramError}</Text>
      )}

      <TextInputs
        title="Link de TikTok"
        formCardMode={true}
        placeHolder="https://www.tiktok.com/"
        value={LinkTiktok}
        onChangeText={text => {
          setLinkTiktok(text);
        }}
        onBlur={() => {}}
        icon={<Icons name="rss-square" size={20} color="#9BA6B8" />}
      />
      {LinkTiktokError !== '' && (
        <Text style={styles.errorStyle}>{LinkTiktokError}</Text>
      )}

      <TextInputs
        title="Seguro del negocio"
        formCardMode={true}
        placeHolder="Ingrese su seguro"
        value={seguro}
        onChangeText={text => {
          setseguro(text);
          setseguroTyping(true);
          if (text?.trim() === '') {
            setseguroError('seguro es requerida');
          } else {
            setseguroError('');
          }
        }}
        onBlur={() => {
          setseguroTyping(false);
        }}
        icon={<Icons name="heart" size={20} color="#9BA6B8" />}
      />
      {seguroError !== '' && (
        <Text style={styles.errorStyle}>{seguroError}</Text>
      )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep6 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
          <View
            style={{
              marginBottom: 18,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFF',
              borderWidth: 1,
              borderColor: 'rgba(37, 99, 235, 0.16)',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                textAlign: 'left',
                marginBottom: 6,
              }}>
              Documentos del servicio
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#4B5563',
                lineHeight: 18,
              }}>
              Sube los documentos necesarios para validar y proteger tu negocio.
            </Text>
          </View>

          {/* RIF/ID Fiscal */}
          <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              RIF / ID Fiscal
            </Text>
            {rifIdFiscalUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  key={rifIdFiscalUri}
                  source={{ uri: normalizeRemoteImageUri(rifIdFiscalUri) }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearRifIdFiscal}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: rifIdFiscalError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('rifIdFiscal')}>
              <Icons name="file-text-o" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar RIF/ID Fiscal
              </Text>
            </TouchableOpacity>
            {rifIdFiscalError !== '' && (
              <Text style={styles.errorStyle}>{rifIdFiscalError}</Text>
            )}
          </View>

          {/* Permiso de Operación */}
          {/* <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 10,
              }}>
              Permiso de Operación
            </Text>
            {permisoOperacionUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  key={permisoOperacionUri}
                  source={{ uri: normalizeRemoteImageUri(permisoOperacionUri) }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearPermisoOperacion}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('permiso')}>
              <Icons name="file-text-o" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar Permiso de Operación
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Logotipo del Negocio (Opcional) */}
          {/* <View
            style={{
              marginBottom: 16,
              paddingVertical: 14,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 4,
              }}>
              Logotipo del Negocio
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
              Opcional
            </Text>
            {logotipoNegocioUri && (
              <View style={[stylesImage.imageContainer, { marginBottom: 10 }]}>
                <Image
                  key={logotipoNegocioUri}
                  source={{ uri: normalizeRemoteImageUri(logotipoNegocioUri) }}
                  style={{ width: 160, height: 160, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={stylesImage.closeButton}
                  onPress={clearLogotipoNegocio}>
                  <Text style={stylesImage.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor: '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('logotipo')}>
              <Icons name="image" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  { marginLeft: 8, color: '#2D3261', fontSize: 13, fontWeight: '600' },
                ]}>
                Cargar logotipo
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Foto del Frente del Taller (mismo patrón que tallerDetail — Instalaciones) */}
          <View style={tallerInstalacionStyles.card}>
            <View style={tallerInstalacionStyles.titleHintRow}>
              <Text style={tallerInstalacionStyles.cardTitle}>
                Foto del Frente del Negocio
              </Text>
              <Text style={tallerInstalacionStyles.helpBesideTitle}>
                Así se verá en tu perfil (Instalaciones). Buena luz, foto nítida;
                ideal que se vea el letrero o la entrada.
              </Text>
            </View>
            <View style={tallerInstalacionStyles.installationPreviewBlock}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tallerInstalacionStyles.installationRow}>
                <View style={tallerInstalacionStyles.imageWrap}>
                  {fotoFrenteTallerUri ? (
                    <>
                      <Image
                        key={fotoFrenteTallerUri}
                        source={{
                          uri: normalizeRemoteImageUri(fotoFrenteTallerUri),
                        }}
                        style={tallerInstalacionStyles.installationImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={stylesImage.closeButton}
                        onPress={clearFotoFrenteTaller}
                        accessibilityLabel="Quitar foto del frente">
                        <Text style={stylesImage.closeButtonText}>X</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={[
                        tallerInstalacionStyles.installationImage,
                        tallerInstalacionStyles.imagePlaceholder,
                      ]}>
                      <Icons name="camera" size={36} color="#2D3261" />
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor:
                    fotoFrenteTallerError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('frente')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  {
                    marginLeft: 8,
                    color: '#2D3261',
                    fontSize: 13,
                    fontWeight: '600',
                  },
                ]}>
                Cargar foto del frente del negocio
              </Text>
            </TouchableOpacity>
            {fotoFrenteTallerError !== '' && (
              <Text style={styles.errorStyle}>{fotoFrenteTallerError}</Text>
            )}
          </View>

          {/* Foto Interna del Taller */}
          <View style={tallerInstalacionStyles.card}>
            <View style={tallerInstalacionStyles.titleHintRow}>
              <Text style={tallerInstalacionStyles.cardTitle}>
                Foto Interna del Negocio
              </Text>
              <Text style={tallerInstalacionStyles.helpBesideTitle}>
                Así se verá en tu perfil público. Un interior ordenado transmite
                confianza y profesionalismo.
              </Text>
            </View>
            <View style={tallerInstalacionStyles.installationPreviewBlock}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tallerInstalacionStyles.installationRow}>
                <View style={tallerInstalacionStyles.imageWrap}>
                  {fotoInternaTallerUri ? (
                    <>
                      <Image
                        key={fotoInternaTallerUri}
                        source={{
                          uri: normalizeRemoteImageUri(fotoInternaTallerUri),
                        }}
                        style={tallerInstalacionStyles.installationImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={stylesImage.closeButton}
                        onPress={clearFotoInternaTaller}
                        accessibilityLabel="Quitar foto interna">
                        <Text style={stylesImage.closeButtonText}>X</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={[
                        tallerInstalacionStyles.installationImage,
                        tallerInstalacionStyles.imagePlaceholder,
                      ]}>
                      <Icons name="camera" size={36} color="#2D3261" />
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity
              style={[
                stylesImage.button,
                {
                  borderWidth: 1,
                  borderColor:
                    fotoInternaTallerError !== '' ? '#dc2626' : '#2D3261',
                  borderStyle: 'dotted',
                  borderRadius: 999,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                },
              ]}
              onPress={() => openPhotoOptions('interna')}>
              <Icons name="camera" size={16} color="#2D3261" />
              <Text
                style={[
                  stylesImage.buttonText,
                  {
                    marginLeft: 8,
                    color: '#2D3261',
                    fontSize: 13,
                    fontWeight: '600',
                  },
                ]}>
                Cargar foto interna del negocio
              </Text>
            </TouchableOpacity>
            {fotoInternaTallerError !== '' && (
              <Text style={styles.errorStyle}>{fotoInternaTallerError}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderStep7 = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={stepStyles.stepContainer}>
          <View
            style={{
              marginBottom: 18,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: '#F9FAFF',
              borderWidth: 1,
              borderColor: 'rgba(37, 99, 235, 0.16)',
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: '#1F2937',
                textAlign: 'left',
                marginBottom: 6,
              }}>
              Horarios de atención
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: '#4B5563',
                lineHeight: 18,
              }}>
              Selecciona los días que atiendes y define tu hora de apertura y
              cierre para cada uno.
            </Text>
          </View>

          {BUSINESS_DAYS.map(day => {
            const dayData = businessHours[day.key] || {};
            return (
              <View
                key={day.key}
                style={{
                  marginBottom: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(15,23,42,0.08)',
                  backgroundColor: '#FFFFFF',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: dayData.enabled ? 10 : 0,
                  }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                    {day.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setBusinessHours(prev => ({
                        ...prev,
                        [day.key]: {
                          ...prev[day.key],
                          enabled: !prev[day.key]?.enabled,
                        },
                      }));
                      setBusinessHoursError('');
                    }}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: dayData.enabled ? '#DCFCE7' : '#F3F4F6',
                      borderColor: dayData.enabled ? '#22C55E' : '#D1D5DB',
                      borderWidth: 1,
                      borderRadius: 999,
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                    }}>
                    <Text
                      style={{
                        color: dayData.enabled ? '#166534' : '#4B5563',
                        fontSize: 12,
                        fontWeight: '700',
                      }}>
                      {dayData.enabled ? 'Activo' : 'Inactivo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {dayData.enabled ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                          marginBottom: 6,
                          fontWeight: '600',
                        }}>
                        Apertura
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          backgroundColor: '#F9FAFB',
                          height: 44,
                          justifyContent: 'center',
                          paddingHorizontal: 8,
                        }}>
                        <Dropdown
                          style={{
                            width: '100%',
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                            height: 38,
                          }}
                          placeholderStyle={{ color: '#6B7280', fontSize: 13 }}
                          selectedTextStyle={{ color: '#111827', fontSize: 13 }}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.open}
                          onChange={item => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {
                                ...prev[day.key],
                                open: item.value,
                              },
                            }));
                            setBusinessHoursError('');
                          }}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                          marginBottom: 6,
                          fontWeight: '600',
                        }}>
                        Cierre
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          borderRadius: 10,
                          backgroundColor: '#F9FAFB',
                          height: 44,
                          justifyContent: 'center',
                          paddingHorizontal: 8,
                        }}>
                        <Dropdown
                          style={{
                            width: '100%',
                            borderWidth: 0,
                            backgroundColor: 'transparent',
                            height: 38,
                          }}
                          placeholderStyle={{ color: '#6B7280', fontSize: 13 }}
                          selectedTextStyle={{ color: '#111827', fontSize: 13 }}
                          data={TIME_OPTIONS}
                          labelField="label"
                          valueField="value"
                          value={dayData.close}
                          onChange={item => {
                            setBusinessHours(prev => ({
                              ...prev,
                              [day.key]: {
                                ...prev[day.key],
                                close: item.value,
                              },
                            }));
                            setBusinessHoursError('');
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}

          {businessHoursError ? (
            <Text style={styles.errorStyle}>{businessHoursError}</Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      default:
        return renderStep1();
    }
  };

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!initialProfile || hydratedRef.current || !initialProfile.hydrateReady) {
      return;
    }
    hydratedRef.current = true;
    const p = initialProfile;
    if (p.Nombre != null) setNombre(String(p.Nombre));
    if (p.cedula != null && p.cedula !== '') setcedula(p.cedula);
    if (p.email != null) setEmail(String(p.email));
    if (p.selectedPrefix) setSelectedPrefix(p.selectedPrefix);
    if (p.estadoSelected != null) setestadoSelected(p.estadoSelected);
    if (p.Direccion != null) setDireccion(String(p.Direccion));
    if (p.RegComercial != null) setRegComercial(String(p.RegComercial));
    if (p.phone != null) setPhone(p.phone);
    if (p.whats != null) setwhats(p.whats);
    if (p.Caracteristicas != null) setCaracteristicas(String(p.Caracteristicas));
    if (p.Experiencia != null) setExperiencia(String(p.Experiencia));
    if (p.LinkFacebook != null) setLinkFacebook(String(p.LinkFacebook));
    if (p.LinkInstagram != null) setLinkInstagram(String(p.LinkInstagram));
    if (p.LinkTiktok != null) setLinkTiktok(String(p.LinkTiktok));
    if (p.seguro != null) setseguro(String(p.seguro));
    if (p.checked === 'si' || p.checked === 'no') setChecked(p.checked);
    if (typeof p.lat === 'number') {
      setlat(p.lat);
    }
    if (typeof p.lng === 'number') {
      setlng(p.lng);
    }
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      setLocationPicked(true);
    }
    if (p.imageUri) {
      setImageUri(p.imageUri);
    }
    if (p.businessHours && typeof p.businessHours === 'object') {
      setBusinessHours(prev => ({ ...prev, ...p.businessHours }));
    }
    if (Array.isArray(p.metodosPago)) {
      setMetodosPago(p.metodosPago);
    }
  }, [initialProfile]);

  /**
   * Las URLs de documentos deben sincronizarse siempre desde el padre.
   * No usar hydratedRef aquí: si initialProfile se actualiza después del primer
   * montaje, el efecto principal ya no vuelve a ejecutar esos setState.
   */
  useEffect(() => {
    if (!initialProfile) return;

    const syncRemoteDoc = (url, hasNewLocalBase64, setUri, setB64) => {
      if (hasNewLocalBase64) return;
      if (isHttpDocumentUrl(url)) {
        const u = normalizeRemoteImageUri(url);
        setUri(u);
        setB64(null);
      }
    };

    syncRemoteDoc(
      initialProfile.rifIdFiscalUrl,
      !!rifIdFiscalBase64,
      setRifIdFiscalUri,
      setRifIdFiscalBase64,
    );
    syncRemoteDoc(
      initialProfile.permisoOperacionUrl,
      !!permisoOperacionBase64,
      setPermisoOperacionUri,
      setPermisoOperacionBase64,
    );
    syncRemoteDoc(
      initialProfile.logotipoNegocioUrl,
      !!logotipoNegocioBase64,
      setLogotipoNegocioUri,
      setLogotipoNegocioBase64,
    );
    syncRemoteDoc(
      initialProfile.fotoFrenteTallerUrl,
      !!fotoFrenteTallerBase64,
      setFotoFrenteTallerUri,
      setFotoFrenteTallerBase64,
    );
    syncRemoteDoc(
      initialProfile.fotoInternaTallerUrl,
      !!fotoInternaTallerBase64,
      setFotoInternaTallerUri,
      setFotoInternaTallerBase64,
    );
  }, [
    initialProfile?.rifIdFiscalUrl,
    initialProfile?.permisoOperacionUrl,
    initialProfile?.logotipoNegocioUrl,
    initialProfile?.fotoFrenteTallerUrl,
    initialProfile?.fotoInternaTallerUrl,
    rifIdFiscalBase64,
    permisoOperacionBase64,
    logotipoNegocioBase64,
    fotoFrenteTallerBase64,
    fotoInternaTallerBase64,
  ]);

  useEffect(() => {
    if (typeof onStepChange === 'function') {
      onStepChange(currentStep, totalSteps);
    }
  }, [currentStep, totalSteps, onStepChange]);

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <ProgressIndicator />
      {renderCurrentStep()}
      <StepNavigation />

      {/* Mapbox location picker modal */}
      <Modal
        visible={locationPickerVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setLocationPickerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#1D1E56' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#1D1E56',
              paddingTop: Platform.OS === 'ios' ? 54 : 20,
              paddingBottom: 14,
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity
              onPress={() => setLocationPickerVisible(false)}
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icons name="times" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: '#FFD60A',
                fontSize: 16,
                fontWeight: '800',
              }}>
              Selecciona la ubicación
            </Text>
            <View style={{ width: 36 }} />
          </View>
          {/* WebView */}
          <WebView
            ref={locationPickerRef}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            source={{ html: buildLocationPickerHTML(lat, lng) }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleLocationPickerMessage}
            startInLoadingState
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#1D1E56',
                }}>
                <ActivityIndicator size="large" color="#FFD60A" />
              </View>
            )}
          />
        </View>
      </Modal>

      {/* ── Modal selector de foto ────────────────────────────────────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,68,0.55)' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setPhotoModalVisible(false)} />
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            paddingHorizontal: 24, paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 28,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 22 }} />
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2344', textAlign: 'center', marginBottom: 6 }}>
              Adjuntar imagen o archivo
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 28 }}>
              Seleccione una opción para capturar{'\n'}la imagen y comprobar el documento
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Documento', icon: 'document-attach-outline', onPress: handlePickDocument },
                { label: 'Galería',   icon: 'images-outline',          onPress: handlePickGallery },
                { label: 'Cámara',    icon: 'camera-outline',          onPress: handlePickCamera },
              ].map(({ label, icon, onPress }) => (
                <TouchableOpacity key={label} onPress={onPress} activeOpacity={0.75}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20,
                    borderRadius: 18, backgroundColor: '#F0F1FA', borderWidth: 1.5, borderColor: '#2D3261' }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#2D3261',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icons2 name={icon} size={26} color="#FFD60A" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1F2344', textAlign: 'center' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)}
              style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: '#F0F1FA', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2344' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TallerEditStepper;

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
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});