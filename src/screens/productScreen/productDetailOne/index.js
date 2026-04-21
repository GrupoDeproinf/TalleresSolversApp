import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ToastAndroid,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  InteractionManager,
  AppState,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import BottomContainer from '../../../commonComponents/bottomContainer';
import { commonStyles } from '../../../style/commonStyle.css';
import { external } from '../../../style/external.css';
import { Plus } from '../../../utils/icon';
import { addtoBag, buyNow, writeYourReview } from '../../../constant';
import styles from './style.css';
import { Cart } from '../../../assets/icons/cart';
import DetailsTextContainer from '../../../components/productDetail/productOne/detailsText';
import DescriptionText from '../../../components/productDetail/productOne/descriptionText';
import BrandData from '../../../components/productDetail/productOne/brandData';
import IconProduct from '../../../components/productDetail/productOne/iconProduct';
import KeyFeatures from '../../../components/productDetail/productOne/keyFeatures';
import { useValues } from '../../../../App';
import SliderDetails from '../../../components/productDetail/productOne/sliderDetails';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TallerDetailEmergencyModal from '../../tallerDetail/emergencyModalCliente';
import { FlatList } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  ClipboardDocumentIcon,
  ClipboardIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline'; // Importar íconos
import { Linking } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import MapComponent from '../../map';
import MapboxNavigation from '../../../commonComponents/MapboxNavigation';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
} from 'lucide-react-native';

/** `metodos_pago` viene como objeto { efectivo: true, ... }, no como array. */
function hasActivePaymentMethods(metodosPago) {
  if (metodosPago == null) {
    return false;
  }
  if (Array.isArray(metodosPago)) {
    return metodosPago.length > 0;
  }
  if (typeof metodosPago === 'object') {
    return Object.values(metodosPago).some(v => v === true);
  }
  return false;
}

const HORARIO_DAY_ORDER = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

const HORARIO_DAY_LABELS = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const normalizeDayKey = dayKey =>
  String(dayKey ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Agrupa días consecutivos (orden Lunes→Domingo) con el mismo horario en una sola fila. */
function groupHorarioRowsByConsecutiveSameTime(detailRows) {
  if (!detailRows.length) {
    return [];
  }
  const grouped = [];
  let i = 0;
  while (i < detailRows.length) {
    const time = detailRows[i].time;
    let j = i;
    while (j + 1 < detailRows.length && detailRows[j + 1].time === time) {
      j += 1;
    }
    const start = detailRows[i];
    const end = detailRows[j];
    const label =
      i === j ? start.label : `${start.label} – ${end.label}`;
    grouped.push({
      key: detailRows.slice(i, j + 1).map(r => r.key).join('|'),
      label,
      time,
    });
    i = j + 1;
  }
  return grouped;
}

/** Filas por día o texto plano (fallback `horario`). */
function getHorarioAtencionDisplay(dataTaller) {
  if (!dataTaller) {
    return { rows: [], plain: '' };
  }

  let raw = dataTaller.horarios_atencion;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return { rows: [], plain: String(raw).trim() };
      }
    } catch {
      return { rows: [], plain: raw.trim() };
    }
  }

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const normalizedSlots = Object.entries(raw).reduce((acc, [key, value]) => {
      const normalizedKey = normalizeDayKey(key);
      if (HORARIO_DAY_ORDER.includes(normalizedKey)) {
        acc[normalizedKey] = value;
      }
      return acc;
    }, {});

    const detailRows = [];
    for (const key of HORARIO_DAY_ORDER) {
      const slot = normalizedSlots[key];
      if (!slot || slot.enabled !== true) {
        continue;
      }
      const open = slot.open != null ? String(slot.open).trim() : '';
      const close = slot.close != null ? String(slot.close).trim() : '';
      if (!open || !close) {
        continue;
      }
      detailRows.push({
        key,
        label: HORARIO_DAY_LABELS[key] || key,
        time: `${open} – ${close}`,
      });
    }
    if (detailRows.length > 0) {
      return { rows: groupHorarioRowsByConsecutiveSameTime(detailRows), plain: '' };
    }
  }

  const horarioStr = dataTaller.horario;
  if (horarioStr != null && String(horarioStr).trim() !== '') {
    return { rows: [], plain: String(horarioStr).trim() };
  }

  return { rows: [], plain: '' };
}

const STORAGE_CLIENTE_FAB_TALLER_UID = '@cliente_fab_taller_uid';

const KEYS_BY_JS_DOW = [
  'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado',
];

function timeStrToMinutes(s) {
  if (!s || typeof s !== 'string') return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function isNowWithinHorarioAtencion(horariosRaw, now = new Date()) {
  let raw = horariosRaw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const dayKey = KEYS_BY_JS_DOW[now.getDay()];
  let slotData = null;
  for (const [k, v] of Object.entries(raw)) {
    if (normalizeDayKey(k) === dayKey) { slotData = v; break; }
  }
  if (!slotData || slotData.enabled !== true) return false;
  const openM = timeStrToMinutes(slotData.open);
  const closeM = timeStrToMinutes(slotData.close);
  if (openM == null || closeM == null) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  if (closeM >= openM) return cur >= openM && cur <= closeM;
  return cur >= openM || cur <= closeM;
}

const ProductDetailOne = ({ navigation }) => {
  const { bgFullStyle, textColorStyle, t, textRTLStyle, iconColorStyle } =
    useValues();

  const route = useRoute();

  const [DataService, setDataService] = useState({
    categoria: '',
    descripcion: '',
    estatus: true,
    garantia: '',
    id: '',
    nombre_servicio: '',
    precio: '',
    puntuacion: '',
    subcategoria: [],
    taller: '',
    uid_categoria: '',
    uid_servicio: '',
    uid_subcategoria: '',
    uid_taller: '',
  });

  const [uidService, setuidService] = useState('');
  const [typeUserLogged, settypeUserLogged] = useState('');
  const [data, setData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dataUser, setDataUser] = useState();
  const [dataProductCategory, setDataProductCategory] = useState('');
  const [dataComments, setDataComments] = useState([]);
  const [dataAverage, setDataAverage] = useState(0);
  const [renderLoading, setRenderLoading] = useState(false);

  const [showRuta, setshowRuta] = useState(false);

  const [dataTaller, setdataTaller] = useState(null);

  const insets = useSafeAreaInsets();
  const [showFabClienteHorario, setShowFabClienteHorario] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  const scrollRef = React.createRef();

  useEffect(() => {
    const initScreen = async () => {
      const { uid, typeUser } = route.params || {};
      // setRenderLoading(true);
      if (uid) {
        console.log(uid);
        console.log("uiddjfkbdfjgbdjfkg", uid)
        await getDataFirst(uid, typeUser);
      }
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setRenderLoading(false);
          });
        });
      });
      scrollRef.current?.scrollTo({ y: 0, animated: true }); // Scroll to top
    };
    initScreen();
  }, []);

  const getDataFirst = async (uid, typeUser) => {
    await Promise.all([getService(uid), getData(uid)]);
    setuidService(uid);
    settypeUserLogged(typeUser);
  };

  const getService = async uid => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;


    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post('/usuarios/getUserByUid', {
        uid: user.uid,
      });


      const result = response.data;
      setDataUser(result.userData);

      console.log("result.userData", result.userData)

    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }


    try {
      const response = await api.post('/usuarios/getServiceByUid', {
        uid: uid,
      });

      // Verificar la respuesta del servidor
      const result = response.data;
      const resultData = {
        ...response.data,
        uid_servicio: result.id,
      };

      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );
      console.log('resultData', resultData);
      console.log(
        'resultDataresultDataresultDataresultDataresultDataresultDataresultData',
      );

      if (result.message === 'Servicio encontrado') {
        setDataService(resultData.service);
        console.log("este es el servicio")
        console.log(resultData.service)

        try {
          const responseTaller = await api.post('/usuarios/getUserByUid', {
            uid: resultData.service.uid_taller
          });
          console.log("abajo esta el result123444")
          console.log(responseTaller.data.userData)
          setdataTaller(responseTaller.data.userData)
        } catch (error) {

        }


        await getAdditionalServices(
          resultData?.service?.uid_categoria,
          resultData?.service?.uid_servicio
            ? resultData?.service?.uid_servicio
            : resultData?.service?.id,
        );
      } else {
        // console.log('Servicio no encontrado');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
    }
  };

  const getData = async (id = null) => {
    // try {
    //   const jsonValue = await AsyncStorage.getItem('@userInfo');
    //   const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    //   console.log('Usuario:', user);

    //   try {
    //     // Realizar la solicitud GET para obtener todos los servicios
    //     const response = await api.get('/home/getServices');

    //     // Verificar la respuesta del servidor
    //     if (response.status === 200) {
    //       const allServices = response.data;

    //       // Si se proporciona un ID, filtramos los datos localmente
    //       const filteredData = id
    //         ? allServices.filter(
    //           service =>
    //             service.uid_servicio === id ||
    //             (service.uid_servicio === '' && service.id === id),
    //         )
    //         : allServices;

    //       // console.log('filtered', filteredData);

    //       // Actualizar el estado con los datos filtrados
    //       setData(filteredData);
    //     } else {
    //       setData([]);
    //     }
    //   } catch (error) {
    //     console.error('Error en la solicitud:', error);
    //   }
    // } catch (e) {
    //   console.error('Error al obtener el usuario:', e);
    // }
  };

  const getAdditionalServices = async (category, id) => {

    try {
      // Realizar la solicitud POST con parámetros
      const response = await api.post('/home/getServicesByCategory', {
        uid_categoria: category,
        id: id,
      });

      // Verificar la respuesta del servidor
      if (response.status === 200) {
        const allServices = response.data;

        // Filtrar los servicios que sean distintos al id proporcionado
        const filteredServices = allServices.filter(service => service.id !== id || service.uid_servicio !== id);

        // Actualizar el estado con los datos filtrados
        setDataProductCategory(filteredServices);
      } else {
        console.warn('Respuesta no exitosa. Estado:', response.status);
        setDataProductCategory([]);
      }
    } catch (error) {
      console.error(
        'Error en la solicitud de categoría:',
        error.message || error,
      );
    }
  };

  const calculateAverageScore = comments => {
    if (!Array.isArray(comments) || comments.length === 0) return 0;
    const totalScore = comments.reduce(
      (sum, comment) => sum + (comment?.puntuacion || 0),
      0,
    );
    const averageScore = totalScore / comments.length;
    return Math.min(Math.max(Math.ceil(averageScore), 0), 5);
  };

  const getCommentsByService = async service => {
    try {
      const uidService = service?.uid_servicio || service?.id;
      if (!uidService) return;
      const response = await api.post('/home/getCommentsByService', {
        uid_service: uidService,
      });
      if (response.status === 200) {
        const comments = Array.isArray(response.data) ? response.data : [];
        setDataComments(comments);
        setDataAverage(calculateAverageScore(comments));
      } else {
        setDataComments([]);
        setDataAverage(0);
      }
    } catch (error) {
      console.error('Error en comentarios del servicio:', error);
      setDataComments([]);
      setDataAverage(0);
    }
  };

  useEffect(() => {
    if (DataService?.uid_servicio || DataService?.id) {
      getCommentsByService(DataService);
    }
  }, [DataService?.uid_servicio, DataService?.id]);

  const recomputeFabVisibilidad = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      if (!user || user.typeUser !== 'Cliente') { setShowFabClienteHorario(false); return; }
      if (!dataTaller) { setShowFabClienteHorario(false); return; }
      setShowFabClienteHorario(isNowWithinHorarioAtencion(dataTaller.horarios_atencion));
    } catch (_e) { setShowFabClienteHorario(false); }
  }, [dataTaller]);

  useEffect(() => { recomputeFabVisibilidad(); }, [recomputeFabVisibilidad]);

  useEffect(() => {
    const id = setInterval(recomputeFabVisibilidad, 60 * 1000);
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') recomputeFabVisibilidad();
    });
    return () => { clearInterval(id); sub.remove(); };
  }, [recomputeFabVisibilidad]);

  const handleFabClientePress = () => setEmergencyModalVisible(true);


  const PublicarService = async () => {
    console.log(DataService);

    try {
      // Hacer la solicitud POST utilizando Axios
      const response = await api.post(
        '/usuarios/saveOrUpdateService',
        DataService,
      );
      // Verificar la respuesta del servidor
      const result = response.data;

      if (
        result.message === 'Servicio actualizado exitosamente' ||
        result.message === 'Servicio creado exitosamente'
      ) {
        showToast('Servicio Publicado con exito');
        navigation.goBack();
      } else {
        showToast('Ha ocurrido un error');
        navigation.goBack();
      }
    } catch (error) {
      // Manejo de errores
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
      showToast('Ha ocurrido un error');
      navigation.goBack();
    }
  };

  const handleContact = async typeContact => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    const servicePayload = {
      id: DataService.uid_servicio || DataService.id,
      nombre_servicio: data[0].nombre_servicio || '',
      precio: DataService?.precio || '',
      taller: dataTaller?.nombre || '',
      uid_servicio: DataService.id || '',
      uid_taller: DataService?.uid_taller || '',
      usuario_id: user?.uid || '',
      usuario_nombre: user?.nombre || '',
      usuario_email: user?.email || '',
      typeContact: typeContact,
    };

    console.log('-----------------------------------------------------');
    console.log('servicePayload', servicePayload);
    console.log('-----------------------------------------------------');

    try {
      // Realizar la solicitud al endpoint
      const response = await api.post('/home/contactService', servicePayload);

      // Si llegamos aquí, la solicitud fue exitosa
      const responseData = response.data; // Axios ya procesa el JSON automáticamente
      console.log('Servicio guardado exitosamente:', responseData);
    } catch (error) {
      // Manejar errores
      if (error.response) {
        // Errores del servidor (respuesta con error, por ejemplo, 400, 500)
        console.error('Error del servidor:', error.response.data);
      } else if (error.request) {
        // La solicitud se realizó pero no hubo respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        // Otro tipo de error
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const showToast = text => {
    // ToastAndroid.show(text, ToastAndroid.SHORT);
    Alert.alert('Solvers Informa', text);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const GetCoordenadas = () => { };

  const closeMapRutas = () => {
    setshowRuta(false);
  };

  const handleCall = () => {
    const phone = dataTaller.phone || dataTaller.telefono;
    if (!phone) {
      Alert.alert('Telefono no disponible');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const whatsapp = dataTaller?.whatsapp || dataTaller?.telefono || dataTaller?.phone;
    if (!whatsapp) {
      Alert.alert('WhatsApp no disponible');
      return;
    }
    const phoneNumber = String(whatsapp).replace(/[^\d]/g, '');
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const stylesMap = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center' },
  });
  const dataTest = [{ phone: '4241436070' }];
  const precioNumero = Number(
    String(DataService?.precio ?? '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, ''),
  );
  const precioVisible = Number.isFinite(precioNumero) && precioNumero > 0
    ? `${precioNumero.toFixed(2)}`
    : 'Por consultar';
  const heroImageSource =
    Array.isArray(DataService?.service_image) && DataService.service_image.length > 0
      ? {uri: DataService.service_image[0]}
      : require('../../../assets/noimageNew.png');

  const tallerDetailUid =
    dataTaller?.uid || dataTaller?.id || DataService?.uid_taller || '';

  const horarioAtencionDisplay = getHorarioAtencionDisplay(dataTaller);
  const showHorarioAtencion =
    horarioAtencionDisplay.rows.length > 0 ||
    horarioAtencionDisplay.plain !== '';

  const goToTallerDetail = () => {
    if (!tallerDetailUid) {
      return;
    }
    navigation.navigate('TallerDetail', {
      tallerId: tallerDetailUid,
      uid_taller: tallerDetailUid,
      tallerData: dataTaller,
    });
  };

  return (
    <View
      style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={[external.Pb_80]}
        style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}>
        <View style={styles.topNav}>
          <View style={styles.topNavCircle1} />
          {/* <View style={styles.topNavCircle2} /> */}
          <View style={styles.topNavLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack('')}
              style={styles.topNavBackBtn}>
              <View>
                <ArrowLeft size={22} color="#FFEA00" />
              </View>
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>Detalle del servicio</Text>
          </View>
          <View style={styles.topNavSpacer} />
        </View>
        <View>
          <View style={styles.hero}>
            <Image source={heroImageSource} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroBottom}>
              <View style={styles.heroBadgeRow}>
                <Text style={styles.activeBadge}>ACTIVO</Text>
                <Text style={styles.estadoBadge}>
                  {dataTaller?.estado || 'SIN ESTADO'}
                </Text>
              </View>
              <Text style={styles.heroName} numberOfLines={2}>
                {DataService.nombre
                  ? DataService.nombre
                  : DataService?.nombre_servicio}
              </Text>
              <TouchableOpacity
                style={[
                  styles.heroTallerBadge,
                  !tallerDetailUid && styles.heroTallerBadgeDisabled,
                ]}
                onPress={goToTallerDetail}
                activeOpacity={0.82}
                disabled={!tallerDetailUid}
                accessibilityRole="button"
                accessibilityLabel="Ver perfil del taller">
                <Text style={styles.heroTallerBadgeText} numberOfLines={1}>
                  {dataTaller?.nombre || 'TALLER'}
                </Text>
                {!!tallerDetailUid && (
                  <ChevronRight
                    size={18}
                    color="#FFD60A"
                    strokeWidth={2.5}
                    style={styles.heroTallerBadgeChevron}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionYellow]} onPress={handleCall} activeOpacity={0.9}>
              <Phone size={18} color="#6F5C00" />
              <Text style={styles.actionYellowText}>LLAMAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionGreen]} onPress={handleWhatsApp} activeOpacity={0.9}>
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.actionWhiteText}>WHATSAPP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBlue]}
              onPress={() => setshowRuta(true)}
              activeOpacity={0.9}
              disabled={!dataTaller?.ubicacion?.lat || !dataTaller?.ubicacion?.lng}>
              <MapPin size={18} color="#FFFFFF" />
              <Text style={styles.actionWhiteText}>MAPA</Text>
            </TouchableOpacity>
          </View>
          <View style={[external.mh_20, styles.mainCard]}>
            <View style={styles.serviceMetaRow}>
              <View style={styles.priceInlineRow}>
                <Text style={styles.priceInlineLabel}>DESDE:</Text>
                <Text style={styles.priceInlineValue} numberOfLines={1}>
                  {precioVisible === 'Por consultar' ? precioVisible : `$${precioVisible}`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.ratingPill}
                onPress={() =>
                  navigation.navigate('RatingScreen', {
                    dataComments: dataComments,
                    dataAverage: dataAverage,
                    id: DataService?.id,
                    dataTotal: DataService,
                  })
                }>
                <View style={styles.ratingPillRow}>
                  <Text style={styles.ratingPillText}>
                    ★ {String(dataAverage || 0)}
                  </Text>
                  <Text style={styles.ratingPillArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.infoBlockCard}>
              <Text style={styles.infoBlockTitle}>Descripcion</Text>
              <Text style={styles.infoBlockText}>
                {DataService?.descripcion && String(DataService.descripcion).trim() !== ''
                  ? String(DataService.descripcion)
                  : 'Sin descripcion disponible.'}
              </Text>
            </View>

            <BrandData DataService={DataService} />


            <View style={styles.infoBlockCard}>
              <Text style={styles.infoBlockTitle}>Garantia</Text>
              <Text style={styles.infoBlockText}>
                {DataService?.garantia && String(DataService.garantia).trim() !== ''
                  ? String(DataService.garantia)
                  : 'Sin garantia disponible.'}
              </Text>
            </View>
          </View>

        </View>

        {showHorarioAtencion ? (
          <View style={[external.mh_20, styles.horarioSectionWrap]}>
            <View style={styles.horarioSectionHeader}>
              <Clock size={18} color="#1F2344" />
              <Text style={styles.horarioSectionTitle}>Horario de atención</Text>
            </View>
            {horarioAtencionDisplay.plain !== '' ? (
              <Text style={styles.horarioSectionPlain}>
                {horarioAtencionDisplay.plain}
              </Text>
            ) : (
              horarioAtencionDisplay.rows.map(row => (
                <View key={row.key} style={styles.horarioRow}>
                  <Text style={styles.horarioDayLabel}>{row.label}</Text>
                  <Text style={styles.horarioTimeText}>{row.time}</Text>
                </View>
              ))
            )}
          </View>
        ) : null}

        {hasActivePaymentMethods(dataTaller?.metodos_pago) && (
          <View style={[external.mh_20, styles.paymentSectionWrap]}>
            <IconProduct data={dataTaller.metodos_pago} />
          </View>
        )}

        <View style={[external.mh_20, external.mt_20]}>
          <View style={styles.similaresTitleWrap}>
            <Text style={styles.similaresSectionTitle}>PRODUCTOS SIMILARES</Text>
          </View>
          {Array.isArray(dataProductCategory) && dataProductCategory.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similaresRow}>
              {dataProductCategory.map((service, idx) => {
                const firstImageFromArray =
                  Array.isArray(service?.service_image) && service.service_image.length > 0
                    ? service.service_image[0]
                    : null;
                const singleImage =
                  typeof service?.service_image === 'string' ? service.service_image : null;
                const imageUriCandidate = firstImageFromArray || singleImage;
                const hasValidImage =
                  typeof imageUriCandidate === 'string' && imageUriCandidate.trim() !== '';
                const serviceImage =
                  hasValidImage
                    ? { uri: imageUriCandidate.trim() }
                    : require('../../../assets/noimageNew.png');
                const serviceUid = service?.uid_servicio || service?.id;
                const precioServicio =
                  service?.precio != null && service?.precio !== ''
                    ? `$${service.precio}`
                    : service?.tarifa != null && service?.tarifa !== ''
                      ? `$${service.tarifa}`
                      : 'Precio por consultar';
                const categoriaServicio =
                  service?.nombre_categoria || service?.categoria || service?.subcategoria || '';
                const puntuacionServicio =
                  service?.puntuacion != null && service?.puntuacion !== ''
                    ? String(service.puntuacion)
                    : '0';

                return (
                  <View
                    key={`${service?.id || service?.uid_servicio || 'service'}-${idx}`}
                    style={[styles.similarServiceCard, idx > 0 && { marginLeft: 10 }]}>
                    <Image source={serviceImage} style={styles.similarServiceImage} />
                    <View style={styles.similarServiceBody}>
                      <Text style={styles.similarServiceTitle} numberOfLines={1}>
                        {service?.nombre_servicio || service?.nombre || 'Servicio'}
                      </Text>
                      {(categoriaServicio || puntuacionServicio) ? (
                        <View style={styles.similarMetaRow}>
                          {categoriaServicio ? (
                            <View style={styles.similarMetaChip}>
                              <Text style={styles.similarMetaChipText} numberOfLines={1}>
                                {categoriaServicio}
                              </Text>
                            </View>
                          ) : null}
                          <View style={styles.similarScoreChip}>
                            <Text style={styles.similarScoreChipText}>★ {puntuacionServicio}</Text>
                          </View>
                        </View>
                      ) : null}
                      <Text style={styles.similarServicePrice} numberOfLines={1}>
                        {precioServicio}
                      </Text>
                      <Text style={styles.similarServiceDesc} numberOfLines={2}>
                        {service?.descripcion || 'Servicio disponible en este taller.'}
                      </Text>
                      <TouchableOpacity
                        style={styles.similarDetailBtn}
                        activeOpacity={0.9}
                        onPress={async () => {
                          if (!serviceUid) return;
                          scrollRef.current?.scrollTo({ y: 0, animated: true });
                          // setRenderLoading(true);
                          await getDataFirst(serviceUid);
                          InteractionManager.runAfterInteractions(() => {
                            requestAnimationFrame(() => {
                              requestAnimationFrame(() => {
                                setRenderLoading(false);
                              });
                            });
                          });
                        }}>
                        <Text style={styles.similarDetailBtnText}>Ver detalle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.similaresEmpty}>
              <Text style={styles.similaresEmptyText}>No hay productos similares disponibles.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainerView}>

        {typeUserLogged === 'Taller' && dataUser?.status == "Aprobado" ? (
          null
        ) : <BottomContainer
        leftValue={
          typeUserLogged === 'Taller' ? (
            <TouchableOpacity
              style={[external.fd_row, external.ai_center, external.mh_20]}
              onPress={() => navigation.goBack()}>
              <View
                style={[external.mh_15, external.fd_row, external.ai_center]}>
                {/* <Plus color={iconColorStyle} /> */}
                <Text style={styles.footerLeftText}>
                  Volver
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={[external.fd_row, external.ai_center, external.mh_20]}>
            </View>
          )
        }
        value={
          <TouchableOpacity
              onPress={async () => {

                console.log("este es el dataTaller", dataTaller.phone)
                console.log("este es el dataServices ", DataService?.nombre_servicio)

                console.log("este es el phone", dataTaller?.phone)

                // // Validar el número de teléfono
                const phoneNumber = dataTaller?.whatsapp;
                // const phoneNumber = dataTaller?.phone;
                
                if (!phoneNumber || phoneNumber === null || phoneNumber === '') {
                  showToast('El número de teléfono no está disponible');
                  return;
                }

                // Convertir a string para validar
                const phoneString = String(phoneNumber).trim();
                
                // Validar que no empiece con 02
                if (phoneString.startsWith('02')) {
                  showToast('El número de teléfono no es válido');
                  return;
                }

                // Validar que empiece con 04 o 4
                if (!phoneString.startsWith('04') && !phoneString.startsWith('4')) {
                  showToast('El número de teléfono no es válido');
                  return;
                }

                try {
                  await api.post('/usuarios/sendNotification', {
                    token: dataTaller.token,
                    title: 'Contacto de Usuario',
                    body: "Hola, un usuario está interesado en contactarte para el servicio de " + DataService?.nombre_servicio + ".",
                    secretCode: "Usuario contacta a taller",
                  });

                  console.log("notificacion enviada con exito")

                  console.log("este es el phone", dataTaller?.phone)

                  handleContact('WhatsApp');
                  Linking.openURL(
                    `https://wa.me/+58${phoneString}`,
                  );
                } catch (error) {
                  console.log("este es el error de la notificacion", error);
                  Linking.openURL(
                    `https://wa.me/+58${phoneString}`,
                  );
                }


              }}
              style={styles.footerActionButton}>
              <MessageCircle size={20} color="#FFD60A" />
              <Text style={styles.footerActionText}>CONTACTAR</Text>
            </TouchableOpacity>
        }
        valueContainerStyle={styles.footerValueDarkContainer}
      />}


        
      </View>
      <MapboxNavigation
        visible={showRuta}
        destinationLat={dataTaller?.ubicacion?.lat}
        destinationLng={dataTaller?.ubicacion?.lng}
        destinationName={dataTaller?.nombre || 'Taller'}
        onClose={() => setshowRuta(false)}
      />

      {showFabClienteHorario ? (
        <TouchableOpacity
          style={[stylesImage.fabClienteHorario, { bottom: Math.max(insets.bottom, 12) + 90 }]}
          activeOpacity={0.9}
          onPress={handleFabClientePress}>
          <MaterialCommunityIcons name="car-emergency" size={36} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      <TallerDetailEmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        uidTaller={tallerDetailUid}
      />

      {renderLoading ? (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(9, 13, 46, 0.28)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 14,
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="#2D3261" />
            <Text style={{marginTop: 10, color: '#2D3261', fontWeight: '700'}}>
              Cargando informacion...
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

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
  fabClienteHorario: {
    position: 'absolute',
    right: 14,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
});

export default ProductDetailOne;
