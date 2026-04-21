import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {YellowStar} from '../../../assets/icons/yellowStar';
import styles from './styles.css';
import {windowHeight} from '../../../themes/appConstant';
import {useValues} from '../../../../App';
import {useNavigation} from '@react-navigation/native';
import {Snackbar} from 'react-native-paper';

import Icons2 from 'react-native-vector-icons/FontAwesome5';

import notImageFound from '../../../assets/noimageold.jpeg';

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

const ServicesContainer = ({
  data,
  value,
  show,
  showPlus,
  marginTop,
  uidTaller,
  nombreTaller,
}) => {
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
    const categoriaTxt = capitalizeSentence(t(item.categoria ?? ''));
    const subcategoriaTxt = capitalizeSentence(
      Array.isArray(item.subcategoria)
        ? item.subcategoria[0]?.nombre_subcategoria ?? ''
        : t(item.subcategoria ?? ''),
    );
    const showSubcategoria =
      Boolean(subcategoriaTxt) &&
      subcategoriaTxt.trim().toLowerCase() !== categoriaTxt.trim().toLowerCase();

    const puntuacionTxt =
      item.puntuacion != null && String(item.puntuacion).trim() !== ''
        ? String(item.puntuacion)
        : '0';

    const descripcionCard = truncateDescription(item.descripcion);

    return (
      <TouchableOpacity
        onPress={() => openServiceModal(item)}
        activeOpacity={0.9}
        style={styles.serviceRowOuter}>
        <View
          style={[
            styles.serviceRowInner,
            {flexDirection: viewRTLStyle},
            {
              backgroundColor: isDark ? '#1E2235' : '#FFFFFF',
              borderColor: item.estatus
                ? isDark
                  ? '#4ADE80'
                  : '#22C55E'
                : isDark
                  ? '#FACC15'
                  : '#EAB308',
              borderWidth: 2,
            },
          ]}>
          <View style={styles.thumbWrap}>
            <View style={[styles.serviceThumb, {backgroundColor: imageContainer}]}>
              {item.service_image == null ||
              (Array.isArray(item.service_image) && !item.service_image[0]) ? (
                <Image style={styles.serviceThumbImage} source={notImageFound} />
              ) : (
                <Image
                  style={styles.serviceThumbImage}
                  source={{
                    uri: Array.isArray(item.service_image)
                      ? item.service_image[0]
                      : item.service_image,
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.serviceTextCol}>
            <View
              style={[styles.serviceTitleRatingRow, {flexDirection: viewRTLStyle}]}>
              <Text
                style={[
                  styles.serviceTitleHero,
                  {
                    color: isDark ? '#F8FAFC' : '#1F2344',
                    textAlign: textRTLStyle,
                  },
                ]}
                numberOfLines={2}>
                {toUpperName(t(item.nombre_servicio ?? ''))}
              </Text>
              <View
                style={[
                  styles.ratingCornerPill,
                  isDark && styles.ratingCornerPillDark,
                ]}>
                <YellowStar />
                <Text
                  style={[
                    styles.ratingCornerPillText,
                    isDark && styles.ratingCornerPillTextDark,
                  ]}>
                  {puntuacionTxt}
                </Text>
              </View>
            </View>

            {categoriaTxt || showSubcategoria ? (
              <View
                style={[styles.tagRow, styles.tagRowBelowTitle, {flexDirection: viewRTLStyle}]}>
                {categoriaTxt ? (
                  <View
                    style={[
                      styles.tagChip,
                      isDark ? styles.tagChipCategoryDark : styles.tagChipCategoryLavender,
                    ]}>
                    <Text
                      style={[
                        styles.tagChipText,
                        isDark ? styles.tagChipTextCategoryDark : styles.tagChipTextLavender,
                        {textAlign: textRTLStyle},
                      ]}
                      numberOfLines={2}>
                      {categoriaTxt}
                    </Text>
                  </View>
                ) : null}
                {showSubcategoria ? (
                  <View
                    style={[
                      styles.tagChip,
                      isDark ? styles.tagChipSubDark : styles.tagChipSub,
                    ]}>
                    <Text
                      style={[
                        styles.tagChipText,
                        isDark ? styles.tagChipTextSubDark : styles.tagChipTextSub,
                        {textAlign: textRTLStyle},
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      {subcategoriaTxt}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {descripcionCard ? (
              <View style={styles.serviceDescStack}>
                <Text
                  style={[
                    styles.serviceDescLabel,
                    {color: isDark ? '#94A3B8' : '#475569', textAlign: textRTLStyle},
                  ]}>
                  {t('transData.description')}
                </Text>
                <Text
                  style={[
                    styles.serviceDescSnippet,
                    {color: isDark ? '#CBD5E1' : '#64748B', textAlign: textRTLStyle},
                  ]}
                  numberOfLines={2}>
                  {descripcionCard}
                </Text>
              </View>
            ) : null}

            <View
              style={[styles.serviceFooterCard, {flexDirection: viewRTLStyle}]}>
              <View
                style={[
                  styles.servicePublicadoChip,
                  item.estatus
                    ? isDark
                      ? styles.servicePublicadoChipSiDark
                      : styles.servicePublicadoChipSi
                    : isDark
                      ? styles.servicePublicadoChipNoDark
                      : styles.servicePublicadoChipNo,
                ]}>
                <Text
                  style={[
                    styles.servicePublicadoChipText,
                    item.estatus
                      ? isDark
                        ? styles.servicePublicadoChipTextSiDark
                        : styles.servicePublicadoChipTextSi
                      : isDark
                        ? styles.servicePublicadoChipTextNoDark
                        : styles.servicePublicadoChipTextNo,
                    {textAlign: textRTLStyle},
                  ]}
                  numberOfLines={1}>
                  {item.estatus ? 'Publicado' : 'No publicado'}
                </Text>
              </View>
              <View style={styles.pricePillYellow}>
                <Text style={styles.pricePillYellowText}>${item.precio}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.newArrivalContainer}>
      <View style={{ marginTop: marginTop || windowHeight(14) }}>
        {show && (
          <H3HeadingCategory value={value} seeall={t('transData.seeAll')} />
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(row, index) =>
          String(row?.id ?? row?.uid_servicio ?? `svc-${index}`)
        }
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
