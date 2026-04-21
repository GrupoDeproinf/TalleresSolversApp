import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../../axiosInstance';
import { useValues } from '../../../App';
import styles, { DARK_BLUE, YELLOW } from './style.css';
import moment from 'moment';
import Icons from 'react-native-vector-icons/FontAwesome5';
import epStyles from '../profileScreen/editProfile/style.css';

/** Precios casi cero (p. ej. 1e-16) se muestran como 0. */
export const formatSubscriptionPriceDisplay = monto => {
  const n = Number(monto);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return '0';
  }
  if (Math.abs(n) < 1e-9) {
    return '0';
  }
  if (Number.isInteger(n)) {
    return String(n);
  }
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
};

/** Convierte fecha Firestore / ISO / número a segundos Unix para comparar. */
const toUnixSeconds = dateField => {
  if (dateField == null) return null;
  if (typeof dateField === 'number' && Number.isFinite(dateField)) {
    return dateField > 1e12 ? Math.floor(dateField / 1000) : Math.floor(dateField);
  }
  if (typeof dateField._seconds === 'number') {
    return dateField._seconds;
  }
  if (dateField && typeof dateField.toDate === 'function') {
    const d = dateField.toDate();
    return d ? Math.floor(d.getTime() / 1000) : null;
  }
  const t = new Date(dateField).getTime();
  if (Number.isFinite(t) && !Number.isNaN(t)) {
    return Math.floor(t / 1000);
  }
  return null;
};

/** Igual que home / solicitudesTaller: unifica userData anidado de getUserByUid. */
const flattenUserDataFromGetUserResponse = data => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  let merged = {...data};
  const nest = data.userData ?? data.data ?? data.user;
  if (nest && typeof nest === 'object' && !Array.isArray(nest)) {
    merged = {...merged, ...nest};
    const inner = nest.userData;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = {...merged, ...inner};
    }
  }
  return merged;
};

const pickSubscriptionActual = merged => {
  const raw = merged?.subscripcion_actual;
  if (raw == null) {
    return null;
  }
  if (Array.isArray(raw)) {
    return raw.length > 0 && typeof raw[0] === 'object' ? raw[0] : null;
  }
  if (typeof raw === 'object' && Object.keys(raw).length === 0) {
    return null;
  }
  return typeof raw === 'object' ? raw : null;
};

const PlanesContainer = () => {
  const { bgFullStyle } = useValues();
  const [subscriptionActual, setSubscriptionActual] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getData = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (!user?.uid) {
        setSubscriptionActual(null);
        return;
      }

      try {
        const response = await api.post('usuarios/getUserByUid', {
          uid: user.uid,
        });

        if (response.status === 200) {
          const merged = flattenUserDataFromGetUserResponse(
            response.data ?? {},
          );
          const sub = pickSubscriptionActual(merged);
          setSubscriptionActual(sub);
        } else {
          setSubscriptionActual(null);
        }
      } catch (error) {
        setSubscriptionActual(null);
        console.error(
          'Error en getUserByUid (planes):',
          error.response?.data || error.message,
        );
      }
    } catch (e) {
      setSubscriptionActual(null);
      console.log('Error al obtener datos del AsyncStorage:', e);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [getData]),
  );

  const resolveFechaFin = taller => {
    try {
      if (taller.fecha_fin && taller.fecha_fin._seconds != null) {
        return moment.unix(taller.fecha_fin._seconds).format('DD/MM/YYYY');
      }
    } catch (e) {
      console.error('Error al formatear fecha:', e);
    }
    return taller.fecha_fin_formateada || '—';
  };

  const resolveFechaInicio = taller => {
    try {
      if (taller.fecha_inicio && taller.fecha_inicio._seconds != null) {
        return moment.unix(taller.fecha_inicio._seconds).format('DD/MM/YYYY');
      }
    } catch (e) {
      console.error('Error al formatear fecha inicio:', e);
    }
    return taller.fecha_inicio_formateada || '—';
  };

  const statusStyles = status => {
    const s = String(status || '').trim();
    if (s === 'Aprobado') {
      return {
        wrap: [styles.statusPill, styles.statusAprobado],
        text: [styles.statusText, styles.statusAprobadoText],
      };
    }
    if (s === 'Por Aprobar') {
      return {
        wrap: [styles.statusPill, styles.statusPendiente],
        text: [styles.statusText, styles.statusPendienteText],
      };
    }
    if (s === 'Vencido') {
      return {
        wrap: [styles.statusPill, styles.statusVencido],
        text: [styles.statusText, styles.statusVencidoText],
      };
    }
    return {
      wrap: [styles.statusPill, styles.statusDefault],
      text: [styles.statusText, styles.statusDefaultText],
    };
  };

  const priceDisplay = formatSubscriptionPriceDisplay;
  const isFreePrice = monto => Math.abs(Number(monto) || 0) < 1e-9;

  const footerPlanAction = useMemo(() => {
    if (loadingPlans) {
      return {
        title: 'Cargando…',
        hint: 'Obteniendo tu suscripción.',
        showButton: false,
      };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const sub = subscriptionActual;

    if (!sub) {
      return {
        title: 'Ver planes disponibles',
        hint: 'Elige un plan para empezar o reactivar tu cuenta de taller.',
        showButton: true,
      };
    }

    const s = String(sub?.status || '').trim();
    const end = toUnixSeconds(sub?.fecha_fin);
    const vencidoPorFecha = end != null && end < nowSec;
    const vencido = s === 'Vencido' || vencidoPorFecha;
    const vigenteAprobado =
      s === 'Aprobado' && end != null && end >= nowSec && !vencidoPorFecha;
    const porAprobar = s === 'Por Aprobar';

    if (vencido && !vigenteAprobado) {
      return {
        title: 'Renovar plan',
        hint: 'Tu suscripción venció o está inactiva. Renueva para seguir con todos los beneficios.',
        showButton: true,
      };
    }
    if (porAprobar) {
      return {
        title: 'Solicitud en revisión',
        hint:
          'Tienes un plan pendiente de aprobación. Cuando se apruebe verás el detalle aquí.',
        showButton: false,
      };
    }
    if (vigenteAprobado) {
      return {
        title: 'Mejorar plan',
        hint: 'Tienes un plan activo. Puedes cambiar a uno superior o ajustar tu suscripción.',
        showButton: true,
      };
    }
    return {
      title: 'Renovar o mejorar plan',
      hint: 'Si un plan venció, renueva; si sigues al día, elige un plan superior cuando quieras.',
      showButton: true,
    };
  }, [subscriptionActual, loadingPlans]);

  const goToPlanCatalog = () => {
    navigation.navigate('PlanesRegistro', { fromPlanesTaller: true });
  };

  const renderSubscriptionCard = () => {
    const taller = subscriptionActual;
    if (!taller) {
      return null;
    }
    const fechaInicioFormateada = resolveFechaInicio(taller);
    const fechaFinFormateada = resolveFechaFin(taller);
    const st = statusStyles(taller.status);
    const montoRaw = taller.monto ?? taller.precio ?? taller.monto_usd ?? 0;
    const precioStr = priceDisplay(montoRaw);
    const gratis = isFreePrice(montoRaw);
    const nombrePlan =
      taller.nombre ||
      taller.plan_nombre ||
      taller.nombre_plan ||
      'Plan';

    return (
      <View
        key={String(taller.id ?? taller.uid ?? 'subscripcion-actual')}
        style={styles.planCard}>
        <LinearGradient
          colors={['#FFD60A', '#F59E0B', '#1F2344']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.planCardAccent}
        />
        <View style={styles.planCardInner}>
          <View style={styles.planTopRow}>
            <Text style={styles.planTitle} numberOfLines={2}>
              {nombrePlan}
            </Text>
            <View style={styles.planTopRightRow}>
              <View style={styles.statusPillOuter}>
                <View style={st.wrap}>
                  <Text style={st.text}>
                    {taller.status || 'Sin estado'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {taller.cantidad_servicios != null && (
            <View style={styles.serviciosStrip}>
              <View style={styles.serviciosStripIconWrap}>
                <Icons name="tools" size={14} color={DARK_BLUE} />
              </View>
              <Text style={styles.serviciosStripText}>
                {' '}
                <Text style={styles.serviciosStripNum}>
                  {taller.cantidad_servicios}
                </Text>{' '}
                {Number(taller.cantidad_servicios) === 1 ? 'servicio disponible' : 'servicios disponibles'}
              </Text>
            </View>
          )}

          <View style={styles.infoBlock}>
            <View style={styles.datesRow}>
              <View style={styles.dateCell}>
                <View style={styles.dateCellIcon}>
                  <Icons
                    name="calendar-check"
                    size={16}
                    color={DARK_BLUE}
                  />
                </View>
                <Text style={styles.dateLabelText}>Inicio</Text>
                <Text style={styles.dateValueText}>
                  {fechaInicioFormateada}
                </Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateCell}>
                <View style={styles.dateCellIcon}>
                  <Icons
                    name="calendar-day"
                    size={16}
                    color={DARK_BLUE}
                  />
                </View>
                <Text style={styles.dateLabelText}>Vencimiento</Text>
                <Text style={styles.dateValueText}>
                  {fechaFinFormateada}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoIconWrap}>
                <Icons name="clock" size={18} color={DARK_BLUE} />
              </View>
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Duración del plan</Text>
                <Text style={styles.infoValue}>
                  {taller.vigencia != null
                    ? `${taller.vigencia} días`
                    : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio</Text>
              <View style={styles.priceWrap}>
                <Text style={styles.priceValue}>{precioStr}</Text>
                <Text style={styles.priceCurrency}>USD</Text>
                {gratis ? (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>GRATIS</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screenRoot, { backgroundColor: bgFullStyle }]}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BLUE} />

      <View style={styles.headerArea}>
        <View style={styles.headerCircle1} pointerEvents="none" />
        <View style={styles.headerCircle2} pointerEvents="none" />
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top + 8,
            paddingBottom: 20,
            paddingHorizontal: 0,
            zIndex: 1,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={epStyles.signUpLikeHeaderBackBtn}
            accessibilityRole="button"
            accessibilityLabel="Volver">
            <Icons name="chevron-left" size={20} color={YELLOW} />
          </TouchableOpacity>
          <View
            style={epStyles.signUpLikeHeaderTitleSlot}
            pointerEvents="box-none">
            <Text style={epStyles.signUpLikeHeaderTitleText} numberOfLines={2}>
              Mis planes 
            </Text>
          </View>
          <View style={{ width: 42 }} />
        </View>
        <Text
          style={{
            fontSize: 15,
            color: '#E5E7EB',
            lineHeight: 22,
            marginBottom: 20,
            marginTop: -8,
            textAlign: 'center',
            paddingHorizontal: 12,
            zIndex: 1,
          }}>
          Consulta el estado de tu suscripción y fechas importantes.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {loadingPlans ? (
          <View style={styles.plansLoadingWrap}>
            <ActivityIndicator size="large" color={DARK_BLUE} />
            <Text style={styles.plansLoadingText}>Cargando tu plan…</Text>
          </View>
        ) : subscriptionActual ? (
          renderSubscriptionCard()
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Icons name="layer-group" size={36} color={DARK_BLUE} />
            </View>
            <Text style={styles.emptyTitle}>Aún no hay planes</Text>
            <Text style={styles.emptySubtitle}>
              Cuando actives o renueves un plan, aquí verás el detalle y las
              fechas de vigencia.
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footerWrap,
          {
            paddingBottom: Math.max(insets.bottom, 10),
            backgroundColor: bgFullStyle,
          },
        ]}>
        {footerPlanAction.showButton !== false ? (
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={goToPlanCatalog}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={footerPlanAction.title}
            accessibilityHint={footerPlanAction.hint}>
            <Text style={styles.footerBtnTitle}>{footerPlanAction.title}</Text>
            <Text style={styles.footerBtnHint}>{footerPlanAction.hint}</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={styles.footerInfoOnly}
            accessibilityRole="text"
            accessibilityLabel={`${footerPlanAction.title}. ${footerPlanAction.hint}`}>
            <Text style={styles.footerBtnTitle}>{footerPlanAction.title}</Text>
            <Text style={styles.footerBtnHint}>{footerPlanAction.hint}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PlanesContainer;
