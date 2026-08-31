import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  Linking,
  ActivityIndicator,
  ScrollView,
  Modal,
  AppState,
  Platform,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Clock,
  ChevronRight,
  CreditCard,
  Wallet,
  Banknote,
} from "lucide-react-native";
import api from "../../../axiosInstance";
import MapboxNavigation from "../../commonComponents/MapboxNavigation";
import ArrivedModal from "../../commonComponents/ArrivedModal";
import BeautifulModal from "../ratingScreen/components/modal";
import RatingSuccessModal from "../../commonComponents/RatingSuccessModal";
import TallerDetailEmergencyModal from "./emergencyModalCliente";
import useLocationPermission from "../../hooks/useLocationPermission";
import LocationPermissionModal from "../../commonComponents/LocationPermissionModal";

const { width } = Dimensions.get("window");

/** Claves Firebase / perfil taller (orden de visualización). */
const PAYMENT_METHOD_ORDER = [
  "efectivo",
  "pagoMovil",
  "puntoVenta",
  "tarjetaCreditoI",
  "tarjetaCreditoN",
  "transferencia",
  "zelle",
  "zinli",
];

const PAYMENT_METHOD_META = {
  efectivo: { name: "Efectivo", icon: "Banknote" },
  pagoMovil: { name: "Pago móvil", icon: "Phone" },
  puntoVenta: { name: "Punto de venta", icon: "CreditCard" },
  tarjetaCreditoI: { name: "Tarjeta crédito internacional", icon: "CreditCard" },
  tarjetaCreditoN: { name: "Tarjeta crédito nacional", icon: "CreditCard" },
  transferencia: { name: "Transferencia", icon: "Wallet" },
  zelle: { name: "Zelle", icon: "CreditCard" },
  zinli: { name: "Zinli", icon: "CreditCard" },
};

const HORARIO_DAY_ORDER = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const HORARIO_DAY_LABELS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

const normalizeDayKey = dayKey =>
  String(dayKey ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function getActivePaymentMethods(metodosPago) {
  if (metodosPago == null) {
    return [];
  }
  if (Array.isArray(metodosPago)) {
    return metodosPago
      .filter(Boolean)
      .map(id => {
        const meta = PAYMENT_METHOD_META[id];
        if (!meta) {
          return null;
        }
        return { id, ...meta };
      })
      .filter(Boolean);
  }
  if (typeof metodosPago === "object") {
    return PAYMENT_METHOD_ORDER.filter(key => metodosPago[key] === true).map(
      key => ({
        id: key,
        name: PAYMENT_METHOD_META[key]?.name || key,
        icon: PAYMENT_METHOD_META[key]?.icon || "CreditCard",
      }),
    );
  }
  return [];
}

const PAYMENT_LUCIDE_ICONS = {
  Wallet,
  Phone,
  Banknote,
  CreditCard,
};

function PaymentMethodIcon({ icon }) {
  const Icon = PAYMENT_LUCIDE_ICONS[icon] ?? CreditCard;
  return <Icon size={18} color="#FFD60A" />;
}

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
    const label = i === j ? start.label : `${start.label} – ${end.label}`;
    grouped.push({
      key: detailRows.slice(i, j + 1).map(r => r.key).join("|"),
      label,
      time,
    });
    i = j + 1;
  }
  return grouped;
}

function getHorarioAtencionDisplay(taller) {
  if (!taller) {
    return { rows: [], plain: "" };
  }

  let raw = taller.horarios_atencion;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return { rows: [], plain: String(raw).trim() };
      }
    } catch {
      return { rows: [], plain: String(raw).trim() };
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
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
      const open = slot.open != null ? String(slot.open).trim() : "";
      const close = slot.close != null ? String(slot.close).trim() : "";
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
      return { rows: groupHorarioRowsByConsecutiveSameTime(detailRows), plain: "" };
    }
  }

  const horarioStr = taller?.horario;
  if (horarioStr != null && String(horarioStr).trim() !== "") {
    return { rows: [], plain: String(horarioStr).trim() };
  }

  return { rows: [], plain: "" };
}

/** Índice alineado con `Date.getDay()` (0 = domingo). */
const KEYS_BY_JS_DOW = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

const STORAGE_CLIENTE_FAB_TALLER_UID = "@cliente_fab_taller_uid";

function timeStrToMinutes(s) {
  if (!s || typeof s !== "string") return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Misma lógica que `horarios_atencion` estructurado (enabled + open/close HH:mm). */
function isNowWithinHorarioAtencion(horariosRaw, now = new Date()) {
  let raw = horariosRaw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        raw = parsed;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return false;
  }
  const dayKey = KEYS_BY_JS_DOW[now.getDay()];
  let slotData = null;
  for (const [k, v] of Object.entries(raw)) {
    if (normalizeDayKey(k) === dayKey) {
      slotData = v;
      break;
    }
  }
  if (!slotData || slotData.enabled !== true) {
    return false;
  }
  const openM = timeStrToMinutes(slotData.open);
  const closeM = timeStrToMinutes(slotData.close);
  if (openM == null || closeM == null) {
    return false;
  }
  const cur = now.getHours() * 60 + now.getMinutes();
  if (closeM >= openM) {
    return cur >= openM && cur <= closeM;
  }
  return cur >= openM || cur <= closeM;
}

const TallerDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { tallerId, uid_taller, tallerData } = route.params || {};
  const resolvedTallerId = tallerId || uid_taller || tallerData?.uid || tallerData?.id;

  const { checkAndOpenMap, locModalVisible, setLocModalVisible, locModalType } = useLocationPermission();

  const [taller, setTaller] = useState(tallerData || null);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [tallerServices, setTallerServices] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showArrived, setShowArrived] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [lastRating, setLastRating] = useState(0);
  const [showImageFullScreen, setShowImageFullScreen] = useState(false);
  const [selectedInstalacionImage, setSelectedInstalacionImage] = useState(null);
  const [isMounted] = useState(true);
  const [typeUserForDetail] = useState("Cliente");

  const activePaymentMethods = useMemo(
    () => getActivePaymentMethods(taller?.metodos_pago),
    [taller?.metodos_pago],
  );
  const horarioAtencionDisplay = useMemo(
    () => getHorarioAtencionDisplay(taller),
    [taller],
  );
  const showHorarioAtencion =
    horarioAtencionDisplay.rows.length > 0 || horarioAtencionDisplay.plain !== "";

  const [showFabClienteHorario, setShowFabClienteHorario] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [dataComments, setDataComments] = useState([]);
  const [dataAverage, setDataAverage] = useState(0);

  const recomputeFabVisibilidad = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem("@userInfo");
      const user = json ? JSON.parse(json) : null;
      if (!user || user.typeUser !== "Cliente") {
        setShowFabClienteHorario(false);
        return;
      }
      if (!taller) {
        setShowFabClienteHorario(false);
        return;
      }
      setShowFabClienteHorario(isNowWithinHorarioAtencion(taller.horarios_atencion));
    } catch (_e) {
      setShowFabClienteHorario(false);
    }
  }, [taller]);

  useEffect(() => {
    recomputeFabVisibilidad();
  }, [recomputeFabVisibilidad]);

  useEffect(() => {
    const id = setInterval(recomputeFabVisibilidad, 60 * 1000);
    const sub = AppState.addEventListener("change", next => {
      if (next === "active") recomputeFabVisibilidad();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [recomputeFabVisibilidad]);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("@userInfo");
        const user = json ? JSON.parse(json) : null;
        if (user?.typeUser === "Cliente" && resolvedTallerId) {
          await AsyncStorage.setItem(
            STORAGE_CLIENTE_FAB_TALLER_UID,
            String(resolvedTallerId),
          );
        }
      } catch (_e) {
        /* ignore */
      }
    })();
  }, [resolvedTallerId]);

  const handleFabClientePress = () => {
    setEmergencyModalVisible(true);
  };

  useEffect(() => {
    if (resolvedTallerId) {
      fetchTallerData();
      fetchTallerServices();
      registrarVistaPerfilTaller();
      getCommentsByTaller(resolvedTallerId);
    } else if (tallerData) {
      setTaller(tallerData);
    }
  }, [resolvedTallerId, tallerData]);

  useFocusEffect(
    useCallback(() => {
      if (resolvedTallerId) {
        getCommentsByTaller(resolvedTallerId);
      }
    }, [resolvedTallerId]),
  );

  const registrarVistaPerfilTaller = async () => {
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      await api.post('/home/savePerfilView', {
        id:            resolvedTallerId,
        nombre_taller: tallerData?.nombre || tallerData?.nombre_taller || null,
        uid_taller:    resolvedTallerId,
        usuario: {
          id:     user?.uid    || user?.id    || null,
          email:  user?.email              || null,
          nombre: user?.nombre || user?.name || null,
        },
      });
    } catch (_e) {
      // No bloquear la UI si falla el registro
    }
  };

  const calculateAverageScore = (comments) => {
    if (!comments || comments.length === 0) return 0;
    const totalScore = comments.reduce((sum, c) => sum + (Number(c.puntuacion) || 0), 0);
    const avg = totalScore / comments.length;
    return Math.min(Math.max(Math.round(avg * 10) / 10, 0), 5);
  };

  const getCommentsByTaller = async (uid) => {
    try {
      const response = await api.post('/home/getCommentsByTaller', {
        uid_taller: uid,
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
      console.error('[TallerDetail] Error al obtener calificaciones:', error);
      setDataComments([]);
      setDataAverage(0);
    }
  };

  const fetchTallerData = async () => {
    if (!resolvedTallerId) return;
    setLoading(true);
    try {
      const response = await api.post("/usuarios/getUserByUid", {
        uid: resolvedTallerId,
      });
      const fetchedUser = response?.data?.userData || response?.data || null;
      if (fetchedUser) setTaller(fetchedUser);
      try {
        const jsonValue = await AsyncStorage.getItem("@userInfo");
        const u = jsonValue ? JSON.parse(jsonValue) : null;
        if (u?.typeUser === "Cliente" && resolvedTallerId) {
          await AsyncStorage.setItem(
            STORAGE_CLIENTE_FAB_TALLER_UID,
            String(resolvedTallerId),
          );
        }
      } catch (_e) {
        /* ignore */
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos del negocio");
    } finally {
      setLoading(false);
    }
  };

  const fetchTallerServices = async () => {

    console.log('tallerId', tallerId);
    if (!tallerId) return;
    setLoadingServices(true);
    console.log('tallerId', tallerId);
    try {
      const response = await api.post("/usuarios/getServicesByTallerUidTrue", {
        uid: tallerId,
      });

      console.log('1231231231231ooeoeeresponse', response);

      const result = response?.data;



      let services = [];
      if (Array.isArray(result?.services)) services = result.services;
      else if (Array.isArray(result?.service)) services = result.service;
      else if (result?.service && typeof result.service === "object") services = [result.service];
      else if (Array.isArray(result)) services = result;

      setTallerServices(services);
    } catch (_error) {
      setTallerServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCall = () => {
    const phone = taller?.phone || taller?.telefono;
    if (!phone) return Alert.alert("Teléfono no disponible");
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const whatsapp = taller?.whatsapp || taller?.telefono;
    if (!whatsapp) return Alert.alert("WhatsApp no disponible");
    const phoneNumber = String(whatsapp).replace(/[^\d]/g, "");
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const handleEmail = () => {
    if (!taller?.email) return Alert.alert("Email no disponible");
    Linking.openURL(`mailto:${taller.email}`);
  };

  const handleShare = async () => {
    try {
      const text = `${tallerNombre}\n${direccion || "Sin dirección disponible"}`;
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
    } catch (_e) {}
  };

  const handleSocialMedia = (platform, url) => {
    if (url) Linking.openURL(url);
    else Alert.alert(`${platform} no disponible`);
  };

  const tallerNombre =
    taller?.nombre_taller || taller?.nombre || taller?.razon_social || "Workshop";
  const rif = taller?.rif || taller?.RIF || "—";
  const estadoTaller = taller?.estado || "Sin estado";
  const correo = taller?.email || "—";
  const telefonoA = taller?.phone || taller?.telefono || "—";
  const telefonoB = taller?.telefono_2 || taller?.telefonoSecundario || "";
  const direccion =
    taller?.Direccion || taller?.direccion || taller?.ubicacion?.direccion || "Dirección no registrada";
  const caracteristicasTaller =
    taller?.Caracteristicas || taller?.caracteristicas || "Este taller no ha cargado características todavía.";
  const experienciaTaller =
    taller?.Experiencia || taller?.experiencia || "Este taller no ha cargado su experiencia todavía.";

  // Normaliza cualquier campo de imagen: puede llegar como string, array o null
  const resolveUri = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val.length > 0 ? String(val[0]).trim() || null : null;
    const s = String(val).trim();
    return s !== "" ? s : null;
  };

  const heroImageSource = (() => {
    const uri = resolveUri(taller?.image_perfil);
    return uri ? { uri } : require("../../assets/noimageNew.png");
  })();

  const instalacionesImages = useMemo(() => {
    const images = [];
    const addUri = (val) => {
      const uri = resolveUri(val);
      if (uri) images.push({ uri });
    };
    addUri(taller?.fotoFrenteTaller);
    addUri(taller?.fotoInternaTaller);
    if (images.length > 0) return images;

    if (Array.isArray(taller?.instalaciones_images) && taller.instalaciones_images.length > 0) {
      const uri = resolveUri(taller.instalaciones_images[0]);
      if (uri) return [{ uri }];
    }
    if (Array.isArray(taller?.galeria) && taller.galeria.length > 0) {
      const uri = resolveUri(taller.galeria[0]);
      if (uri) return [{ uri }];
    }
    return [require("../../assets/noimageNew.png")];
  }, [taller]);

  const GetCoordenadas = () => setShowMap(false);

  // ── Handler: enviar calificación del taller ────────────────────────────────
  const handleRatingSubmit = async (puntuacion, comentario, etiquetas_rapidas) => {
    setShowRating(false);
    setLastRating(puntuacion);
    try {
      const json = await AsyncStorage.getItem('@userInfo');
      const user = json ? JSON.parse(json) : null;
      await api.post('/home/addCommentToTaller', {
        uid_taller: resolvedTallerId,
        nombre_taller: taller?.nombre || taller?.nombre_taller || '',
        puntuacion,
        comentario,
        etiquetas_rapidas,
        usuario: {
          uid:    user?.uid    || user?.id    || '',
          nombre: user?.nombre || user?.name  || '',
          email:  user?.email  || '',
        },
      });
      setShowRatingSuccess(true);
    } catch (e) {
      console.warn('[TallerDetail] Error al enviar calificación:', e);
    }
  };
  const openInstalacionImage = imageSource => {
    setSelectedInstalacionImage(imageSource);
    setShowImageFullScreen(true);
  };
  const closeInstalacionImage = () => {
    setShowImageFullScreen(false);
    setSelectedInstalacionImage(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D3261" />
        <Text style={styles.loadingText}>Cargando información del negocio...</Text>
      </View>
    );
  }

  if (!taller) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No se encontró información del negocio.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D1E56" />

      <View style={styles.topNav}>
        <View style={styles.topNavCircle1} />
        <View style={styles.topNavCircle2} />
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.topNavBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Perfil del negocio</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Image source={heroImageSource} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBottom}>
            <View style={styles.heroBadgeRow}>
              <Text style={styles.activeBadge}>ACTIVO</Text>
              <Text style={styles.estadoBadge}>{estadoTaller}</Text>
            </View>
            <Text style={styles.heroName}>{tallerNombre}</Text>
            <Text style={styles.heroRif}>RIF: {rif}</Text>
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
            onPress={() => checkAndOpenMap(() => setShowMap(true))}
            activeOpacity={0.9}
            disabled={!taller?.ubicacion?.lat || !taller?.ubicacion?.lng}>
            <MapPin size={18} color="#FFFFFF" />
            <Text style={styles.actionWhiteText}>MAPA</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={styles.cardTitle}>Información del Negocio</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('RatingScreen', {
                  dataComments: dataComments,
                  dataAverage: dataAverage,
                  id: resolvedTallerId,
                  dataTotal: taller,
                  type: 'taller',
                })
              }
              style={{
                backgroundColor: '#FFD60A',
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}>
              <Text style={{ color: '#6F5C00', fontSize: 13, fontWeight: '800' }}>
                ★ {dataComments.length > 0 ? String(dataAverage) : '—'}
              </Text>
              <Text style={{ color: '#6F5C00', fontSize: 16, fontWeight: '900', lineHeight: 16 }}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#1F2344" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>{direccion}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Mail size={16} color="#1F2344" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{correo}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Phone size={16} color="#1F2344" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Teléfonos</Text>
              <Text style={styles.infoValue}>{telefonoA}</Text>
              {telefonoB ? <Text style={styles.infoValue}>{telefonoB}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instalaciones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.installationRow}>
            {instalacionesImages.map((img, idx) => (
              <TouchableOpacity
                key={`instalacion-${idx}`}
                activeOpacity={0.9}
                onPress={() => openInstalacionImage(img)}
                style={idx > 0 ? { marginLeft: 10 } : null}>
                <Image source={img} style={styles.installationImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Características</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoTextWrapNoIcon}>
              <Text style={styles.infoValue}>{String(caracteristicasTaller)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Experiencia</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoTextWrapNoIcon}>
              <Text style={styles.infoValue}>{String(experienciaTaller)}</Text>
            </View>
          </View>
        </View>

        {showHorarioAtencion ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Horario de atención</Text>
            {horarioAtencionDisplay.plain !== "" ? (
              <View style={styles.infoItem}>
                <View style={styles.infoTextWrapNoIcon}>
                  <Text style={styles.infoValue}>{horarioAtencionDisplay.plain}</Text>
                </View>
              </View>
            ) : (
              horarioAtencionDisplay.rows.map(row => (
                <View style={styles.horarioRow} key={row.key}>
                  <Text style={styles.horarioDayLabel}>{row.label}</Text>
                  <Text style={styles.horarioTimeText}>{row.time}</Text>
                </View>
              ))
            )}
          </View>
        ) : null}

        {activePaymentMethods.length > 0 && (
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Métodos de Pago</Text>
            <View style={styles.paymentGrid}>
              {activePaymentMethods.map(m => (
                <View style={styles.paymentItem} key={m.id}>
                  <PaymentMethodIcon icon={m.icon} />
                  <Text style={styles.paymentText}>{m.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitlePlain}>Síguenos</Text>
          <View style={styles.socialGrid}>
            <TouchableOpacity
              style={[styles.socialRow, styles.socialRowHalf]}
              onPress={() => handleSocialMedia("Instagram", taller?.LinkInstagram)}
              activeOpacity={0.85}>
              <View style={styles.socialLeft}>
                <View style={[styles.socialIconWrap, { backgroundColor: "#E4405F" }]}>
                  <Instagram size={15} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>Instagram</Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialRow, styles.socialRowHalf]}
              onPress={() => handleSocialMedia("Facebook", taller?.LinkFacebook)}
              activeOpacity={0.85}>
              <View style={styles.socialLeft}>
                <View style={[styles.socialIconWrap, { backgroundColor: "#1877F2" }]}>
                  <Facebook size={15} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>Facebook</Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialRow, styles.socialRowFull]}
              onPress={() => handleSocialMedia("TikTok", taller?.LinkTiktok)}
              activeOpacity={0.85}>
              <View style={styles.socialLeft}>
                <View style={[styles.socialIconWrap, { backgroundColor: "#1F2344" }]}>
                  <Youtube size={15} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>TikTok</Text>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Servicios de este negocio</Text>
          <Text style={styles.servicesSubtitle}>
            Explora los servicios activos y disponibles para atender tu vehiculo.
          </Text>
          {loadingServices ? (
            <View style={styles.servicesLoadingWrap}>
              <ActivityIndicator size="small" color="#1F2344" />
              <Text style={styles.servicesLoadingText}>Cargando servicios...</Text>
            </View>
          ) : tallerServices.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesRow}>
              {tallerServices.map((service, idx) => {
                const _svcUri = resolveUri(service?.service_image);
                const serviceImage = _svcUri
                  ? { uri: _svcUri }
                  : require("../../assets/noimageNew.png");
                const serviceUid = service?.uid_servicio || service?.id;
                const precioServicio =
                  service?.precio != null && service?.precio !== ""
                    ? `$${service.precio}`
                    : service?.tarifa != null && service?.tarifa !== ""
                    ? `$${service.tarifa}`
                    : "Precio por consultar";
                const categoriaServicio =
                  service?.nombre_categoria || service?.categoria || service?.subcategoria || "";
                const puntuacionServicio =
                  service?.puntuacion != null && service?.puntuacion !== ""
                    ? String(service.puntuacion)
                    : null;
                return (
                  <View
                    key={`${service?.id || service?.uid_servicio || "service"}-${idx}`}
                    style={[styles.serviceCard, idx > 0 && { marginLeft: 10 }]}>
                    <Image source={serviceImage} style={styles.serviceCardImage} />
                    <View style={styles.serviceCardBody}>
                      <Text style={styles.serviceCardTitle} numberOfLines={1}>
                        {service?.nombre_servicio || service?.nombre || "Servicio"}
                      </Text>
                      {(categoriaServicio || puntuacionServicio) ? (
                        <View style={styles.serviceMetaRow}>
                          {categoriaServicio ? (
                            <View style={styles.serviceMetaChip}>
                              <Text style={styles.serviceMetaChipText} numberOfLines={1}>
                                {categoriaServicio}
                              </Text>
                            </View>
                          ) : null}
                          {puntuacionServicio ? (
                            <View style={styles.serviceScoreChip}>
                              <Text style={styles.serviceScoreChipText}>★ {puntuacionServicio}</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                      <Text style={styles.serviceCardPrice} numberOfLines={1}>
                        {precioServicio}
                      </Text>
                      <Text style={styles.serviceCardDesc} numberOfLines={2}>
                        {service?.descripcion || "Servicio disponible en este taller."}
                      </Text>
                      <TouchableOpacity
                        style={styles.serviceDetailBtn}
                        activeOpacity={0.9}
                        onPress={() => {
                          if (!serviceUid) return;
                          navigation.navigate("ProductDetailOne", {
                            uid: serviceUid,
                            typeUser: typeUserForDetail,
                          });
                        }}>
                        <Text style={styles.serviceDetailBtnText}>Ver detalle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.servicesEmpty}>
              <Text style={styles.servicesEmptyText}>Este negocio aun no tiene servicios cargados.</Text>
            </View>
          )}
        </View>

        {/* <View style={styles.scheduleCard}>
          <Clock size={24} color="#705D00" />
          <Text style={styles.scheduleTitle}>Horario de Atención</Text>
          <Text style={styles.scheduleText}>
            {taller?.horario || "Lunes a Viernes: 8:00 AM - 5:00 PM\nSábados: 9:00 AM - 1:00 PM"}
          </Text>
        </View> */}
      </ScrollView>

      <MapboxNavigation
        visible={showMap}
        destinationLat={taller?.ubicacion?.lat}
        destinationLng={taller?.ubicacion?.lng}
        destinationName={taller?.nombre || taller?.nombre_taller || 'Taller'}
        destinationAddress={taller?.Direccion || taller?.direccion || taller?.ubicacion?.direccion}
        destinationCategory="Taller mecánico"
        destinationPhone={taller?.phone || taller?.telefono}
        destinationImage={taller?.image_perfil || null}
        destinationHours={
          horarioAtencionDisplay?.plain !== ''
            ? horarioAtencionDisplay?.plain
            : horarioAtencionDisplay?.rows?.length > 0
              ? horarioAtencionDisplay.rows.map(r => `${r.label}: ${r.time}`).join('  ·  ')
              : null
        }
        onClose={() => setShowMap(false)}
        onFinish={() => {
          setShowMap(false);
          setShowArrived(true);
        }}
      />

      {/* Modal GPS / permisos de ubicación */}
      <LocationPermissionModal
        visible={locModalVisible}
        type={locModalType}
        onClose={() => setLocModalVisible(false)}
      />

      {/* Modal "¡Has llegado!" */}
      <ArrivedModal
        visible={showArrived}
        destinationName={taller?.nombre || taller?.nombre_taller || 'el taller'}
        onClose={() => {
          setShowArrived(false);
          setShowRating(true);
        }}
        onSkip={() => setShowArrived(false)}
      />

      {/* Modal calificación del taller */}
      <BeautifulModal
        visible={showRating}
        businessName={taller?.nombre || taller?.nombre_taller || ''}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
      />

      {/* Modal de éxito tras enviar calificación */}
      <RatingSuccessModal
        visible={showRatingSuccess}
        rating={lastRating}
        onClose={() => setShowRatingSuccess(false)}
      />

      <Modal
        visible={showImageFullScreen}
        transparent
        animationType="fade"
        onRequestClose={closeInstalacionImage}>
        <View style={styles.fullImageOverlay}>
          <TouchableWithoutFeedback onPress={closeInstalacionImage}>
            <View style={styles.fullImageTouchArea}>
              {selectedInstalacionImage ? (
                <Image
                  source={selectedInstalacionImage}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            style={styles.fullImageCloseBtn}
            onPress={closeInstalacionImage}
            activeOpacity={0.9}>
            <Text style={styles.fullImageCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {showFabClienteHorario ? (
        <TouchableOpacity
          style={[
            styles.fabClienteHorario,
            { bottom: Math.max(insets.bottom, 12) + 10 },
          ]}
          activeOpacity={0.9}
          onPress={handleFabClientePress}
          accessibilityRole="button"
          accessibilityLabel="Solicitar servicio">
          <MaterialCommunityIcons name="car-emergency" size={36} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}

      <TallerDetailEmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        uidTaller={resolvedTallerId}
      />
    </View>
  );
};

const stylesMap = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF8FC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  topNav: {
    backgroundColor: "#1D1E56",
    paddingTop: Platform.OS === "ios" ? 24 : 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  topNavCircle1: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -15,
    right: 10,
  },
  topNavCircle2: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "rgba(255,214,10,0.08)",
    bottom: -8,
    right: 55,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topNavBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  topNavTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD60A",
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  hero: {
    marginHorizontal: 14,
    borderRadius: 24,
    overflow: "hidden",
    height: 300,
    backgroundColor: "#1F2344",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,13,46,0.30)",
  },
  heroBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 35,
    paddingTop: 15,
    backgroundColor: "rgba(9,13,46,0.62)",
    zIndex: 2,
  },
  activeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD60A",
    color: "#6F5C00",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 7,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  estadoBadge: {
    marginLeft: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  heroRif: {
    marginTop: 3,
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "600",
  },
  actionsRow: {
    marginHorizontal: 20,
    marginTop: -30,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    zIndex: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionYellow: {
    backgroundColor: "#FFD60A",
  },
  actionGreen: {
    backgroundColor: "#25D366",
  },
  actionBlue: {
    backgroundColor: "#1F2344",
  },
  actionYellowText: {
    fontWeight: "800",
    fontSize: 12,
    color: "#6F5C00",
  },
  actionWhiteText: {
    fontWeight: "800",
    fontSize: 12,
    color: "#FFFFFF",
  },
  card: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#1F2344",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2344",
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD60A",
    paddingLeft: 10,
  },
  cardTitlePlain: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2344",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F6F2F6",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  infoTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  infoTextWrapNoIcon: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "800",
    color: "#46464E",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: "#1B1B1E",
    lineHeight: 20,
    fontWeight: "600",
  },
  horarioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6F2F6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  horarioDayLabel: {
    color: "#1F2344",
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    marginRight: 8,
  },
  horarioTimeText: {
    color: "#1B1B1E",
    fontSize: 14,
    fontWeight: "700",
  },
  installationImage: {
    width: width * 0.78,
    height: 240,
    borderRadius: 16,
  },
  installationRow: {
    paddingRight: 6,
  },
  paymentCard: {
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 16,
    backgroundColor: "#1F2344",
    borderRadius: 20,
    padding: 16,
  },
  paymentTitle: {
    color: "#FFD60A",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 10,
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  paymentItem: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2E56",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  paymentText: {
    marginTop: 7,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F6F2F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  socialRowHalf: {
    width: "48.5%",
  },
  socialRowFull: {
    width: "100%",
  },
  socialLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  socialIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    marginLeft: 9,
    color: "#1F2344",
    fontSize: 14,
    fontWeight: "700",
  },
  scheduleCard: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: "rgba(253,212,4,0.14)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginBottom: 28,
  },
  scheduleTitle: {
    marginTop: 8,
    color: "#1F2344",
    fontSize: 15,
    fontWeight: "800",
  },
  scheduleText: {
    marginTop: 4,
    textAlign: "center",
    color: "#46464E",
    fontSize: 12,
    lineHeight: 18,
  },
  servicesSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  servicesLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  servicesLoadingText: {
    marginLeft: 8,
    color: "#1F2344",
    fontWeight: "600",
  },
  servicesRow: {
    paddingRight: 6,
  },
  serviceCard: {
    width: width * 0.72,
    backgroundColor: "#F6F2F6",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  serviceCardImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#E5E7EB",
  },
  serviceCardBody: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  serviceCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2344",
    marginBottom: 3,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  serviceMetaChip: {
    backgroundColor: "#E8EEFF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
    maxWidth: "72%",
  },
  serviceMetaChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1F2344",
  },
  serviceScoreChip: {
    backgroundColor: "#FFF4CC",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  serviceScoreChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7A5A00",
  },
  serviceCardPrice: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "800",
    marginBottom: 4,
  },
  serviceCardDesc: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 17,
  },
  serviceDetailBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#FFD60A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  serviceDetailBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2344",
  },
  servicesEmpty: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  servicesEmptyText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageTouchArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  fullImageCloseBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  fullImageCloseText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  fabClienteHorario: {
    position: "absolute",
    right: 14,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFD60A",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
});

export default TallerDetail;
