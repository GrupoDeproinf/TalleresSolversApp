import {FlatList, Image, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ArrowLeft, ChevronRight} from 'lucide-react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import styles from './style.css';
import appFonts from '../../../themes/appFonts';
import {useValues} from '../../../../App';
import api from '../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import moment from 'moment';

const PLACEHOLDER_IMAGE = require('../../../assets/noimageNew.png');

/** Mismo azul que `headerBlock` en `style.css.js`. */
const HEADER_BLUE = '#1F2344';

/** Color de acento + tinte de fondo claro por tarjeta. */
const CARD_THEMES = [
  {accent: '#2D3261', tint: '#EEF1FF'},
  {accent: '#6D28D9', tint: '#F3E8FF'},
  {accent: '#EA580C', tint: '#FFF4E6'},
  {accent: '#059669', tint: '#E8FFF4'},
  {accent: '#1D4ED8', tint: '#E8F0FF'},
  {accent: '#DB2777', tint: '#FCE8F3'},
];

function getServiceImageSource(item) {
  const raw = item?.servicio?.service_image;
  const uri = Array.isArray(raw) ? raw[0] : raw;
  if (typeof uri === 'string' && uri.trim().length > 0) {
    return {uri: uri.trim()};
  }
  return PLACEHOLDER_IMAGE;
}

function hasRemoteServiceImage(item) {
  const raw = item?.servicio?.service_image;
  const uri = Array.isArray(raw) ? raw[0] : raw;
  return typeof uri === 'string' && uri.trim().length > 0;
}

function getTallerDisplayName(item) {
  const t = item?.taller;
  if (typeof t === 'string' && t.trim()) {
    return t.trim();
  }
  if (t && typeof t === 'object' && typeof t.nombre === 'string' && t.nombre.trim()) {
    return t.nombre.trim();
  }
  const nt = item?.nombre_taller;
  if (typeof nt === 'string' && nt.trim()) {
    return nt.trim();
  }
  return '';
}

function getTallerUid(item) {
  const u =
    item?.uid_taller ??
    item?.taller?.uid ??
    item?.taller?.id ??
    null;
  if (u == null) {
    return null;
  }
  const s = String(u).trim();
  return s.length > 0 ? s : null;
}

/** Evita filas repetidas del mismo servicio / interés. */
function dedupeInterestItems(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const sid =
      item?.uid_servicio != null && String(item.uid_servicio).trim() !== ''
        ? String(item.uid_servicio).trim()
        : null;
    const key = sid
      ? `svc:${sid}`
      : `fb:${String(item?.nombre_servicio ?? '')}|${getTallerUid(item) ?? ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Milis Unix para ordenar: `fecha_creacion` (Firestore / API) y si no, `date`. */
function getFechaCreacionMs(item) {
  if (!item) {
    return 0;
  }
  const fc = item.fecha_creacion;
  if (fc != null && typeof fc === 'object') {
    if (typeof fc._seconds === 'number') {
      const nano =
        typeof fc._nanoseconds === 'number' ? fc._nanoseconds / 1e6 : 0;
      return fc._seconds * 1000 + nano;
    }
    if (typeof fc.seconds === 'number') {
      return fc.seconds * 1000;
    }
    if (typeof fc.toDate === 'function') {
      try {
        const d = fc.toDate();
        return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
      } catch {
        /* ignore */
      }
    }
  }
  if (typeof fc === 'number' && Number.isFinite(fc)) {
    return fc > 1e12 ? fc : fc * 1000;
  }
  if (typeof fc === 'string' && fc.trim()) {
    const parsed = Date.parse(fc);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (item.date != null) {
    const t = new Date(item.date).getTime();
    return Number.isFinite(t) && !Number.isNaN(t) ? t : 0;
  }
  return 0;
}

/** Más reciente primero. */
function sortInterestsByFechaCreacionDesc(items) {
  return [...items].sort(
    (a, b) => getFechaCreacionMs(b) - getFechaCreacionMs(a),
  );
}

const OrderHistory = () => {
  const {
    isDark,
    bgFullStyle,
    textColorStyle,
    textRTLStyle,
    viewRTLStyle,
    t,
    currSymbol,
    currPrice,
  } = useValues();

  const [dataService, setDataService] = useState([]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const interestCount = Array.isArray(dataService) ? dataService.length : 0;

  const getDataServices = async () => {
    const jsonValue = await AsyncStorage.getItem('@userInfo');
    const user = jsonValue != null ? JSON.parse(jsonValue) : null;

    try {
      const response = await api.get('/home/getContactService');
      const raw = response.data;
      const result = Array.isArray(raw) ? raw : [];

      if (user && user.uid) {
        const filteredData = result.filter(
          item => item?.usuario?.id === user.uid,
        );
        const sorted = sortInterestsByFechaCreacionDesc(filteredData);
        setDataService(dedupeInterestItems(sorted));
      } else {
        console.warn(
          'UID del usuario no encontrado. Mostrando datos completos.',
        );
        setDataService(sortInterestsByFechaCreacionDesc(result));
      }
    } catch (error) {
      if (error.response) {
        console.error('Error en la solicitud:', error.response.statusText);
      } else {
        console.error('Error en la solicitud:', error.message);
      }
      setDataService([]);
    }
  };

  useEffect(() => {
    getDataServices();
  }, []);

  const openDetail = item => {
    navigation.navigate('ProductDetailOne', {
      uid: item.uid_servicio,
    });
  };

  const openTallerProfile = uid => {
    if (!uid) {
      return;
    }
    navigation.navigate('TallerDetail', {tallerId: uid});
  };

  const renderItem = ({item, index}) => {
    const {accent, tint} = CARD_THEMES[index % CARD_THEMES.length];
    const cardBg = isDark ? appColors.solidDark : tint;
    const imgBoxBg = isDark ? '#1E1E24' : '#FFFFFF';
    const dateChipBg = isDark ? `${accent}35` : `${accent}22`;
    const dateChipColor = isDark ? '#FFFFFF' : accent;
    const remoteImg = hasRemoteServiceImage(item);
    const src = getServiceImageSource(item);
    const headerTone = isDark ? '#D8DDF5' : HEADER_BLUE;
    const tallerName = getTallerDisplayName(item);
    const tallerUid = getTallerUid(item);
    const chevronFlip =
      textRTLStyle === 'right' ? {transform: [{scaleX: -1}]} : undefined;

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => openDetail(item)}
        style={[styles.cardWrap, {shadowColor: accent}]}>
        <View
          style={[
            styles.cardInner,
            {
              backgroundColor: cardBg,
              borderStartColor: accent,
              borderColor: `${accent}44`,
            },
          ]}>
          <View style={styles.imageOuter}>
            <View
              style={[
                styles.imageRing,
                {backgroundColor: isDark ? `${accent}40` : `${accent}1F`},
              ]}>
              <View
                style={[
                  styles.imageContainer,
                  {backgroundColor: imgBoxBg},
                ]}>
                <Image
                  style={styles.imageFill}
                  source={src}
                  resizeMode={remoteImg ? 'cover' : 'contain'}
                />
              </View>
            </View>
          </View>
          <View style={[styles.cardMain, {flexDirection: 'column'}]}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                {color: textColorStyle},
                {textAlign: textRTLStyle},
              ]}>
              {t(item.nombre_servicio)}
            </Text>
            {tallerName ? (
              tallerUid ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => openTallerProfile(tallerUid)}
                  style={[
                    styles.tallerBox,
                    isDark && styles.tallerBoxDark,
                  ]}
                  accessibilityRole="link"
                  accessibilityLabel={`Perfil del taller ${tallerName}`}
                  accessibilityHint="Abre el perfil del taller">
                  <View
                    style={[
                      styles.tallerRow,
                      {flexDirection: viewRTLStyle},
                    ]}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.tallerNameOnly,
                        {color: textColorStyle},
                        {textAlign: textRTLStyle},
                      ]}>
                      {tallerName}
                    </Text>
                    <ChevronRight
                      size={18}
                      color={isDark ? '#D8DDF5' : HEADER_BLUE}
                      strokeWidth={2.2}
                      style={[styles.tallerChevron, chevronFlip]}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={[styles.tallerBox, isDark && styles.tallerBoxDark]}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tallerNameOnly,
                      styles.tallerNameStatic,
                      {color: textColorStyle},
                      {textAlign: textRTLStyle},
                    ]}>
                    {tallerName}
                  </Text>
                </View>
              )
            ) : null}
            <View
              style={[
                styles.dateRow,
                {flexDirection: viewRTLStyle},
              ]}>
              <View
                style={[
                  styles.dateBadge,
                  {backgroundColor: dateChipBg, borderColor: `${accent}55`},
                ]}>
                <Text
                  style={[
                    styles.dateText,
                    {color: dateChipColor, fontFamily: appFonts.semiBold},
                  ]}>
                  {moment(item.date).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.actionsRow,
                {flexDirection: viewRTLStyle},
              ]}>
              <Text
                style={[
                  styles.priceRow,
                  {color: headerTone},
                  {textAlign: textRTLStyle},
                ]}>
                <Text style={[styles.priceDesdeLabel, {fontFamily: appFonts.semiBold}]}>
                  Desde:{' '}
                </Text>
                <Text style={[styles.priceAmount, {fontFamily: appFonts.bold}]}>
                  {currSymbol}
                  {(currPrice * item.precio).toFixed(2)}
                </Text>
              </Text>
              <View
                style={[
                  styles.verPill,
                  {
                    backgroundColor: HEADER_BLUE,
                    borderColor: 'rgba(255, 214, 10, 0.45)',
                  },
                ]}>
                <Text style={styles.verPillText}>Ver servicio</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={[styles.emptyTitle, {color: textColorStyle}]}>
        Aún no tienes intereses guardados
      </Text>
      <Text
        style={[styles.emptySub, {color: textColorStyle, opacity: 0.75}]}>
        Cuando explores servicios y muestres interés, aparecerán aquí para que
        los encuentres al instante.
      </Text>
    </View>
  );

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View
        style={[
          styles.headerBlock,
          {paddingTop: insets.top + 16},
        ]}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={styles.topNavBackBtn}>
            <ArrowLeft size={20} color="#FFD60A" />
          </TouchableOpacity>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Mis intereses</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {interestCount}{' '}
              {interestCount === 1 ? 'interés' : 'intereses'}
            </Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>
          {'Tus servicios '}
          <Text style={styles.headerAccent}>favoritos</Text>
        </Text>

        <Text style={styles.headerSubtitle}>
          Tus servicios favoritos y consultas recientes, en un solo lugar.
        </Text>
      </View>
      <View
        style={[
          commonStyles.commonContainer,
          external.ph_20,
          {backgroundColor: bgFullStyle},
        ]}>
        <FlatList
          data={Array.isArray(dataService) ? dataService : []}
          keyExtractor={(item, idx) =>
            String(item?.uid_servicio ?? item?.id ?? idx)
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmpty}
        />
      </View>
    </View>
  );
};

export default OrderHistory;
