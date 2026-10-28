import {precioDesde} from '../../../utils/taller';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import React, {useCallback, useEffect, useRef, useState} from 'react';

/** Círculo verde parpadeante para servicios publicados */
const PulsingDot = ({style}) => {
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

  return <Animated.View style={[styles.gridCardStatusCircle, styles.gridCardStatusCircleOn, style, {opacity}]} />;
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

  // Lista compacta (una fila por servicio): con planes de 20 o 50 servicios
  // la cuadrícula de tarjetas grandes saturaba la pantalla.
  const renderItem = ({item}) => {
    const categoriaTxt = capitalizeSentence(item.categoria);
    const imgUri = Array.isArray(item.service_image)
      ? item.service_image[0]
      : item.service_image;
    const nombre = capitalizeSentence(t(item.nombre_servicio ?? ''));
    const precio = precioDesde(item.precio);
    const publicado = !!item.estatus;

    return (
      <TouchableOpacity
        onPress={() => openServiceModal(item)}
        activeOpacity={0.85}
        style={[fila.fila, {backgroundColor: isDark ? '#1E2235' : '#FFFFFF'}]}
        accessibilityRole="button"
        accessibilityLabel={`${nombre}. ${precio}. ${publicado ? 'Publicado' : 'No publicado'}`}>
        {imgUri ? (
          <Image source={{uri: imgUri}} style={fila.foto} resizeMode="cover" />
        ) : (
          <View style={[fila.foto, fila.sinFoto]}>
            <Icons2 name="tools" size={18} color="#1F2344" />
          </View>
        )}
        <View style={fila.texto}>
          <Text style={[fila.nombre, {color: isDark ? '#F1F5F9' : '#1F2344'}]} numberOfLines={1}>
            {nombre}
          </Text>
          <Text style={[fila.detalle, {color: isDark ? '#94A3B8' : '#64748B'}]} numberOfLines={1}>
            {categoriaTxt ? `${categoriaTxt} · ` : ''}
            {precio}
          </Text>
        </View>
        <View style={[fila.estado, publicado ? fila.estadoOn : fila.estadoOff]}>
          {publicado ? <PulsingDot style={fila.punto} /> : <View style={[styles.gridCardStatusCircle, styles.gridCardStatusCircleOff, fila.punto]} />}
          <Text style={[fila.estadoTexto, publicado ? fila.estadoTextoOn : fila.estadoTextoOff]}>
            {publicado ? 'Publicado' : 'Oculto'}
          </Text>
        </View>
        <Icons2 name="chevron-right" size={12} color={isDark ? '#64748B' : '#94A3B8'} style={{marginLeft: 8}} />
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
        scrollEnabled={false}
        contentContainerStyle={fila.lista}
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

const fila = StyleSheet.create({
  lista: {paddingTop: 4},
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7EAF2',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  foto: {width: 52, height: 52, borderRadius: 12, backgroundColor: '#EEF0F8'},
  sinFoto: {alignItems: 'center', justifyContent: 'center'},
  texto: {flex: 1, marginLeft: 12, marginRight: 8},
  nombre: {fontSize: 15, fontWeight: '700'},
  detalle: {fontSize: 12.5, marginTop: 3},
  estado: {flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4},
  estadoOn: {backgroundColor: '#E7F7EE'},
  estadoOff: {backgroundColor: '#F1F3F7'},
  // El punto de estado se usa dentro de la pastilla, no en la esquina.
  punto: {position: 'relative', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, borderWidth: 0},
  estadoTexto: {fontSize: 11.5, fontWeight: '700', marginLeft: 5},
  estadoTextoOn: {color: '#15803D'},
  estadoTextoOff: {color: '#64748B'},
});

export default ServicesContainer;
