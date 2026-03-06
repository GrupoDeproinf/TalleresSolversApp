import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Icons from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../../axiosInstance';
import {useValues} from '../../../../App';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import {BackLeft} from '../../../utils/icon';
import styles from './style.css';
import Icons2 from 'react-native-vector-icons/AntDesign';
import VehicleFormModal from './VehicleFormModal';

const VehiclesScreen = () => {
  const navigation = useNavigation();
  const {textColorStyle, viewRTLStyle, bgFullStyle} = useValues();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [planRequiredModalVisible, setPlanRequiredModalVisible] = useState(false);
  const [plansModalVisible, setPlansModalVisible] = useState(false);

  const fetchUserVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Usuario en storage (@userInfo): { nombre, email, cedula, phone, typeUser, estado, uid, ... }
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (!user) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      const uid = user?.uid || user?.id;
      if (!uid) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      const response = await api.post('usuarios/getVehiculosByUsuarioUid', {
        uid,
      });

      const data = response?.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setVehicles(list);
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al cargar vehículos');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserVehicles();
  }, [fetchUserVehicles]);

  const handleAddVehicle = () => {
    if (vehicles.length >= 1) {
      setPlanRequiredModalVisible(true);
      return;
    }
    setEditingVehicle(null);
    setAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);
    setEditingVehicle(null);
    setSelectedVehicle(null);
    setActionModalVisible(false);
  };

  const handleSubmitVehicle = async (payload) => {
    try {
      await api.post('usuarios/saveOrUpdateVehiculo', payload);
      setAddModalVisible(false);
      fetchUserVehicles();
      Alert.alert(
        '¡Listo!',
        'Tu vehículo se guardó correctamente.',
        [{ text: 'Entendido' }]
      );
    } catch (err) {
      const errorMsg = err?.response?.data?.message ?? err?.message ?? 'No se pudo guardar el vehículo. Intenta de nuevo.';
      Alert.alert('Error', errorMsg);
    }
  };

  const formatVehicleModel = (item) => {
    const parts = [item?.vehiculo_marca, item?.vehiculo_modelo].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Vehículo';
  };

  const formatVehicleId = (item) => {
    if (item?.id && typeof item.id === 'string') return item.id.slice(0, 8).toUpperCase();
    return item?.tipo_vehiculo || 'Vehículo';
  };

  const formatTimestamp = (ts) => {
    if (!ts || typeof ts !== 'object') return '—';
    const sec = ts?._seconds ?? ts?.seconds;
    if (sec == null) return '—';
    const d = new Date(sec * 1000);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatKm = (value) => {
    if (value == null || value === '') return '—';
    const num = Number(value);
    return Number.isNaN(num) ? String(value) : `${num.toLocaleString('es')} km`;
  };

  const handleCardPress = (item) => {
    setSelectedVehicle(item);
    setActionModalVisible(true);
  };

  const handleEditSelected = () => {
    if (!selectedVehicle) {
      setActionModalVisible(false);
      return;
    }
    setEditingVehicle(selectedVehicle);
    setActionModalVisible(false);
    setAddModalVisible(true);
  };

  const handleDeleteSelected = () => {
    if (!selectedVehicle) return;

    Alert.alert(
      'Eliminar vehículo',
      '¿Seguro que deseas eliminar este vehículo?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const jsonValue = await AsyncStorage.getItem('@userInfo');
              const user = jsonValue != null ? JSON.parse(jsonValue) : null;
              const uiduser = user?.uid ?? user?.id ?? '';
              const uidvehicle = selectedVehicle?.id ? String(selectedVehicle.id) : '';

              const payload = {uiduser, uidvehicle};
              console.log('Payload eliminar vehículo:', payload);

              await api.post('usuarios/deleteVehiculo', payload);
              setActionModalVisible(false);
              fetchUserVehicles();
              Alert.alert('Vehículo eliminado', 'El vehículo se eliminó correctamente.');
            } catch (err) {
              const errorMsg =
                err?.response?.data?.message ??
                err?.message ??
                'No se pudo eliminar el vehículo. Intenta de nuevo.';
              Alert.alert('Error', errorMsg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const renderDetailRow = (iconName, label, value, showChevron = false) => (
    <View style={styles.cardDetailRow}>
      <View style={styles.cardDetailIcon}>
        <Entypo name={iconName} size={16} color={appColors?.primary} />
      </View>
      <View style={[styles.cardDetailBody, {flex: 1}]}>
        <View style={{flex: 1}}>
          <Text style={styles.cardDetailLabel}>
            {label}
          </Text>
          <Text style={[styles.cardDetailValue, {color: textColorStyle}]}>
            {value}
          </Text>
        </View>
        {showChevron && (
          <Entypo
            name="chevron-small-right"
            size={20}
            color={textColorStyle}
            style={styles.cardDetailChevron}
          />
        )}
      </View>
    </View>
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.cardTouchable}
      activeOpacity={0.85}
      onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.cardHeaderWrap}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardPlateRow}>
                <Text
                  style={[styles.cardPlateText, {color: textColorStyle}]}
                  numberOfLines={1}>
                  {(item?.vehiculo_placa || '').toUpperCase()}
                </Text>
                {item?.vehiculo_anio != null && item?.vehiculo_anio != '' && (
                  <View style={[styles.cardYearTag, styles.cardYearTagMargin]}>
                    <Text style={styles.cardYearTagText}>{item?.vehiculo_anio}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.cardModelText, {color: textColorStyle}]}
                numberOfLines={1}>
                {(formatVehicleModel(item) || '').toUpperCase()}
              </Text>
              {item?.vehiculo_color != null && item?.vehiculo_color !== '' && (
                <Text
                  style={[styles.cardColorText, {color: textColorStyle}]}
                  numberOfLines={1}>
                  {(item?.vehiculo_color || '').toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.cardIconTopRight}>
              <Icons name="car" size={22} color={appColors?.primary} />
            </View>
          </View>
        </View>

        <View style={styles.cardSeparator} />

        {renderDetailRow('gauge', 'KILOMETRAJE', formatKm(item?.KM), false)}
        {renderDetailRow(
          'tools',
          'PRÓXIMO CAMBIO ACEITE',
          formatTimestamp(item?.proximo_cambio_aceite),
          true,
        )}
        {item?.ultimo_lavado != null &&
          (item?.ultimo_lavado?._seconds != null || item?.ultimo_lavado?.seconds != null) &&
          renderDetailRow(
            'calendar',
            'ÚLTIMO LAVADO',
            formatTimestamp(item?.ultimo_lavado),
            false,
          )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Icons name="car" size={48} color={appColors?.primary} />
        </View>
        <Text style={[styles.emptyText, {color: textColorStyle}]}>
          {error || 'No tienes vehículos registrados'}
        </Text>
        {!error && (
          <Text style={[styles.emptySubtext, {color: textColorStyle}]}>
            Toca el ícono + para agregar uno nuevo
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: bgFullStyle}]}>
      <View style={[styles.header, {flexDirection: viewRTLStyle}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBack}
          activeOpacity={0.7}>
          <BackLeft />
        </TouchableOpacity>
        <Text
          style={[commonStyles.hederH2, styles.headerTitle, {color: textColorStyle}]}
          numberOfLines={1}>
          Mis vehículos
        </Text>
        <TouchableOpacity
          onPress={handleAddVehicle}
          style={styles.headerIcon}
          activeOpacity={0.7}>
          <Entypo name="add-to-list" size={24} color={textColorStyle} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors?.primary || '#3A4A85'} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item?.id || `vehicle-${item?.vehiculo_marca}-${item?.vehiculo_modelo}`}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={
            vehicles.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />
      )}

      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}>
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActionModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.actionModalBox}>
            <View style={styles.actionModalHeaderIconWrap}>
              <Icons2 name="car" size={28} color={appColors?.primary ?? '#2D3261'} />
            </View>
            <Text style={styles.actionModalTitle}>¿Qué deseas hacer?</Text>
            <Text style={styles.actionModalSubtitle}>
              Selecciona una opción para este vehículo.
            </Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionBtnEdit}
                onPress={handleEditSelected}
                activeOpacity={0.8}
                disabled={deleting}>
                <View style={styles.actionBtnEditIconWrap}>
                  <Icons2 name="edit" size={40} color="#2D7CFF" />
                </View>
                <Text style={styles.actionBtnEditText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnDelete}
                onPress={handleDeleteSelected}
                activeOpacity={0.8}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <View style={styles.actionBtnDeleteIconWrap}>
                      <Icons2 name="delete" size={40} color="#FF3B30" />
                    </View>
                    <Text style={styles.actionBtnDeleteText}>Eliminar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.actionModalCerrar}
              onPress={() => setActionModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.actionModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={planRequiredModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlanRequiredModalVisible(false)}>
        <TouchableOpacity
          style={styles.planModalOverlay}
          activeOpacity={1}
          onPress={() => setPlanRequiredModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.planModalCard}>
            <View style={styles.planModalIconWrap}>
              <Icons2 name="creditcard" size={44} color="#FFFFFF" />
            </View>
            <Text style={styles.planModalTitle}>Plan de pago requerido</Text>
            <Text style={styles.planModalMessage}>
              Para registrar un nuevo vehículo necesitas contar con un plan de pago activo. Actualiza tu plan para poder agregar más vehículos a tu cuenta.
            </Text>
            <TouchableOpacity
              style={styles.planModalBtn}
              onPress={() => {
                setPlanRequiredModalVisible(false);
                setPlansModalVisible(true);
              }}
              activeOpacity={0.85}>
              <Text style={styles.planModalBtnText}>Ver planes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.planModalCerrar}
              onPress={() => setPlanRequiredModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.planModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={plansModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlansModalVisible(false)}>
        <TouchableOpacity
          style={styles.planModalOverlay}
          activeOpacity={1}
          onPress={() => setPlansModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.plansModalCard}>
            <View style={styles.plansModalHeader}>
              <Text style={styles.plansModalTitle}>Planes disponibles</Text>
              <TouchableOpacity
                onPress={() => setPlansModalVisible(false)}
                style={styles.plansModalCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Icons2 name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.planItemCard}>
              <View style={styles.planItemBadge}>
                <Text style={styles.planItemPrice}>$1</Text>
                <Text style={styles.planItemPeriod}>/ mes</Text>
              </View>
              <Text style={styles.planItemVehicles}>Hasta 10 vehículos</Text>
              <Text style={styles.planItemDesc}>Con este plan puedes registrar hasta 10 vehículos en tu cuenta.</Text>
            </View>
            <TouchableOpacity
              style={styles.planModalCerrar}
              onPress={() => setPlansModalVisible(false)}
              activeOpacity={0.7}>
              <Text style={styles.planModalCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <VehicleFormModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitVehicle}
        initialValues={editingVehicle}
      />
    </View>
  );
};

export default VehiclesScreen;
