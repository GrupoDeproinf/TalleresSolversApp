import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 10) / 2; // padding 20px c/lado + gap 10px
import React, {useCallback, useEffect, useRef, useState} from 'react';

/** Círculo verde parpadeante para servicios publicados */
const PulsingDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 0.15, duration: 700, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1,    duration: 700, useNativeDriver: true}),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.gridCardStatusCircle, styles.gridCardStatusCircleOn, {opacity}]} />;
};
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {YellowStar} from '../../../assets/icons/yellowStar';
import styles from './styles.css';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import {useNavigation} from '@react-navigation/native';
import {Snackbar} from 'react-native-paper';

import Icons2 from 'react-native-vector-icons/FontAwesome5';

import notImageFound from '../../../assets/noimageNew.png';

/** Nombre del servicio: todo en mayúsculas */
const toUpperName = raw => String(raw ?? '').trim().toUpperCase();

/** Descripción visible en tarjeta: máximo 40 caracteres */
const truncateDescription = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

/** Resto de textos: minúsculas con la primera letra en mayúscula (tipo oración) */
const capitalizeSentence = raw => {
  const s = String(raw ?? '').trim();
  if (!s) {
    return '';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const ServicesContainer = ({data, value, show, showPlus, marginTop, uidTaller, nombreTaller}) => {
  const {textColorStyle, isDark, imageContainer, textRTLStyle, viewRTLStyle, t} =
    useValues();
  const navigation = useNavigation();

  const [visibleHint, setVisibleHint] = useState(false);
  const [statusLabel, setstatusLabel] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [modalService, setModalService] = useState(null);

  const onLongPressHandler = (itemId, status) => {
    setVisibleHint(itemId); // Muestra el Snackbar para el ítem presionado
    setstatusLabel(status);
    setTimeout(() => {
      setVisibleHint(null); // Oculta el Snackbar después de un tiempo
    }, 1000);
  };

  const onDismissHint = () => {
    setVisibleHint(null); // Oculta el Snackbar cuando se presiona para cerrar
  };

  const openServiceModal = useCallback(item => {
    setModalService(item);
    setServiceModalVisible(true);
  }, []);

  const closeServiceModal = useCallback(() => {
    setServiceModalVisible(false);
    setModalService(null);
  }, []);

  const onModalEditar = useCallback(() => {
    if (!modalService) {
      return;
    }
    const item = modalService;
    closeServiceModal();
    navigation.navigate('FormService', {
      uid: item.id,
      ...(uidTaller ? {uid_taller: uidTaller, nombre_taller: nombreTaller} : {}),
    });
  }, [modalService, closeServiceModal, navigation, uidTaller, nombreTaller]);

  const onModalVerPublicacion = useCallback(() => {
    if (!modalService) {
      return;
    }
    const item = modalService;
    closeServiceModal();
    navigation.navigate('ProductDetailOne', {
      uid: item.id,
      typeUser: 'Taller',
    });
  }, [modalService, closeServiceModal, navigation]);

  const renderItem = ({item}) => {
    const categoriaTxt = String(item.categoria ?? '').trim();
    const descripcionCard = truncateDescription(item.descripcion);
    const puntuacionTxt =
      item.puntuacion != null && String(item.puntuacion).trim() !== ''
        ? String(item.puntuacion)
        : '0';
    const imgUri = Array.isArray(item.service_image)
      ? item.service_image[0]
      : item.service_image;

    return (
      <TouchableOpacity
        onPress={() => openServiceModal(item)}
        activeOpacity={0.88}
        style={[styles.gridCard, {width: CARD_WIDTH}]}>

        {/* ── Image section ── */}
        <View style={styles.gridCardImgWrap}>
          <Image
            source={imgUri ? {uri: imgUri} : notImageFound}
            style={styles.gridCardImg}
            resizeMode="cover"
          />
          {/* Dark gradient overlay at bottom of image */}
          <View style={styles.gridCardImgOverlay} />

          {/* Category badge */}
          {categoriaTxt ? (
            <View style={styles.gridCardCatBadge}>
              <Text style={styles.gridCardCatText} numberOfLines={1}>
                {categoriaTxt.toUpperCase()}
              </Text>
            </View>
          ) : null}

          {/* Rating pill bottom-right */}
          {/* <View style={styles.gridCardRating}>
            <YellowStar />
            <Text style={styles.gridCardRatingText}>{puntuacionTxt}</Text>
          </View> */}
        </View>

        {/* ── Status circle (top-right corner of card) ── */}
        {item.estatus
          ? <PulsingDot />
          : <View style={[styles.gridCardStatusCircle, styles.gridCardStatusCircleOff]} />
        }

        {/* ── Body ── */}
        <View style={[styles.gridCardBody, {backgroundColor: isDark ? '#1E2235' : '#FFFFFF'}]}>
          <Text
            style={[styles.gridCardName, {color: isDark ? '#F1F5F9' : '#1F2344'}]}
            numberOfLines={2}>
            {toUpperName(t(item.nombre_servicio ?? ''))}
          </Text>
          {descripcionCard ? (
            <Text
              style={[styles.gridCardDesc, {color: isDark ? '#94A3B8' : '#64748B'}]}
              numberOfLines={1}>
              {descripcionCard}
            </Text>
          ) : null}

          {/* Footer: price + arrow button */}
          <View style={styles.gridCardFooter}>
            <Text style={[styles.gridCardPrice, {color: isDark ? '#FFD60A' : '#1F2344'}]}>
              ${item.precio}
            </Text>
            <View style={styles.gridCardPlusBtn}>
              <Icons2 name="chevron-right" size={14} color="#1F2344" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.newArrivalContainer}>
      {show && (
        <View style={{ marginTop: marginTop || windowHeight(14) }}>
          <H3HeadingCategory value={value} seeall={t('transData.seeAll')} />
        </View>
      )}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(row, index) =>
          String(row?.id ?? row?.uid_servicio ?? `svc-${index}`)
        }
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={false}
      />
      <Snackbar
        visible={visibleHint !== null && visibleHint !== false}
        onDismiss={onDismissHint}
        duration={900}
      >
        {statusLabel}
      </Snackbar>

      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeServiceModal}>
        <View style={styles.serviceModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closeServiceModal}
            accessibilityLabel="Cerrar modal"
          />
          <View
            style={[
              styles.serviceModalCard,
              isDark && styles.serviceModalCardDark,
            ]}>
            <View style={styles.serviceModalHeaderRow}>
              <View style={styles.serviceModalTitleBlock}>
                <Text
                  style={[
                    styles.serviceModalTitle,
                    {color: isDark ? '#F8FAFC' : '#1F2344'},
                  ]}>
                  ¿Qué deseas hacer?
                </Text>
                {modalService ? (
                  <Text
                    style={[
                      styles.serviceModalSubtitle,
                      {color: isDark ? '#94A3B8' : '#64748B'},
                    ]}
                    numberOfLines={2}>
                    {toUpperName(t(modalService.nombre_servicio ?? ''))}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={closeServiceModal}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                style={styles.serviceModalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Cerrar">
                <Icons2
                  name="times"
                  size={18}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onModalEditar}
              style={[
                styles.serviceModalOption,
                isDark && styles.serviceModalOptionDark,
              ]}>
              <View
                style={[
                  styles.serviceModalIconWrap,
                  isDark && styles.serviceModalIconWrapDark,
                ]}>
                <Icons2 name="edit" size={18} color="#1F2344" solid />
              </View>
              <View style={styles.serviceModalOptionText}>
                <Text
                  style={[
                    styles.serviceModalOptionTitle,
                    {color: isDark ? '#F8FAFC' : '#1F2344'},
                  ]}>
                  Editar servicio
                </Text>
                <Text
                  style={[
                    styles.serviceModalOptionDesc,
                    {color: isDark ? '#94A3B8' : '#64748B'},
                  ]}>
                  Cambia el nombre, el precio, las fotos y los detalles. Ideal si
                  quieres mantener tu oferta al día.
                </Text>
              </View>
              <Icons2
                name="chevron-right"
                size={14}
                color={isDark ? '#64748B' : '#94A3B8'}
                style={styles.serviceModalChevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onModalVerPublicacion}
              style={[
                styles.serviceModalOption,
                styles.serviceModalOptionLast,
                isDark && styles.serviceModalOptionDark,
              ]}>
              <View
                style={[
                  styles.serviceModalIconWrap,
                  isDark && styles.serviceModalIconWrapDark,
                ]}>
                <Icons2 name="eye" size={18} color="#1F2344" solid />
              </View>
              <View style={styles.serviceModalOptionText}>
                <Text
                  style={[
                    styles.serviceModalOptionTitle,
                    {color: isDark ? '#F8FAFC' : '#1F2344'},
                  ]}>
                  Ver publicación
                </Text>
                <Text
                  style={[
                    styles.serviceModalOptionDesc,
                    {color: isDark ? '#94A3B8' : '#64748B'},
                  ]}>
                  Mira exactamente cómo ven los clientes tu servicio en el
                  catálogo, como una vista previa real.
                </Text>
              </View>
              <Icons2
                name="chevron-right"
                size={14}
                color={isDark ? '#64748B' : '#94A3B8'}
                style={styles.serviceModalChevron}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ServicesContainer;
