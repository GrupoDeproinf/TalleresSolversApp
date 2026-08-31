import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft} from 'lucide-react-native';
import Icons from 'react-native-vector-icons/FontAwesome5';
import api from '../../../../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BooleanPillToggle from '../BooleanPillToggle';

const VehicleNotificationsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [notificationOptions, setNotificationOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const vehicleId = route?.params?.vehicleId ? String(route.params.vehicleId) : '';

  const vehicleName = useMemo(() => {
    const data = route?.params?.vehicleData;
    const placa = String(data?.vehiculo_placa || '').trim();
    const marca = String(data?.vehiculo_marca || '').trim();
    const modelo = String(data?.vehiculo_modelo || '').trim();
    if (placa) return placa.toUpperCase();
    if (marca || modelo) return `${marca} ${modelo}`.trim();
    return 'Vehículo';
  }, [route?.params?.vehicleData]);

  const vehicleSummary = useMemo(() => {
    const data = route?.params?.vehicleData || {};
    const placa = String(data?.vehiculo_placa || '').trim();
    const marca = String(data?.vehiculo_marca || '').trim();
    const modelo = String(data?.vehiculo_modelo || '').trim();
    const anio = String(data?.vehiculo_ano || data?.vehiculo_anio || '').trim();
    const color = String(data?.vehiculo_color || '').trim();
    const tipo = String(data?.tipo_vehiculo || '').trim();
    const kilometraje = String(data?.KM ?? data?.kilometraje ?? '').trim();

    const estadoRaw = data?.activo;
    const estado =
      typeof estadoRaw === 'boolean' ? (estadoRaw ? 'Activo' : 'Inactivo') : String(estadoRaw || '');

    return {
      placa: placa ? placa.toUpperCase() : '--',
      marcaModelo: `${marca} ${modelo}`.trim() || '--',
      kilometrajeLabel: kilometraje ? `${kilometraje} km` : '--',
      details: [
        {label: 'Año', value: anio || '--'},
        {label: 'Color', value: color || '--'},
        {label: 'Tipo', value: tipo || '--'},
        {label: 'Estado', value: estado || '--'},
      ],
    };
  }, [route?.params?.vehicleData]);

  const toBool = value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const normalized = String(value || '').trim().toLowerCase();
    return ['true', '1', 'si', 'sí', 'activo', 'activa', 'enabled'].includes(normalized);
  };

  const fetchNotificationOptions = useCallback(async () => {
    const response = await api.get('usuarios/getNotificaciones');
    const data = response?.data;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.notificaciones)
      ? data.notificaciones
      : [];

    return list.map((item, index) => ({
      id: String(item?.id ?? item?.uid ?? item?.key ?? index),
      title: String(item?.nombre ?? `Notificación ${index + 1}`),
      subtitle: String(item?.descripcion ?? 'Configura esta notificación para tu vehículo.'),
      enabled: false,
      raw: item,
    }));
  }, []);

  const fetchActiveNotificationsByVehicle = useCallback(async () => {
    const userInfoStr = await AsyncStorage.getItem('@userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const uid = userInfo?.uid ?? userInfo?.id ?? '';
    if (!uid) return {};

    const response = await api.post('usuarios/getUserByUid', {uid});
    const data = response?.data;
    const userData =
      data && typeof data === 'object' && !Array.isArray(data) && (data.data || data.user)
        ? data.data || data.user
        : data;

    const notificacionesVehiculos =
      userData?.notificacionesVehiculos ?? userData?.userData?.notificacionesVehiculos ?? [];

    console.log('notificacionesVehiculos =>', notificacionesVehiculos);

    const selectedVehicleNotifications = (Array.isArray(notificacionesVehiculos)
      ? notificacionesVehiculos
      : []
    ).find(item => String(item?.uidvehicle ?? '') === vehicleId);

    return (selectedVehicleNotifications?.notificaciones || []).reduce((acc, item) => {
      const code = String(item?.secretCode || '').trim();
      if (code) acc[code] = toBool(item?.active);
      return acc;
    }, {});
  }, [vehicleId]);

  const loadNotificationsInOrder = useCallback(async () => {
    try {
      setLoadingOptions(true);

      // 1) Traer catálogo base en variable temporal.
      const baseOptions = await fetchNotificationOptions();

      // 2) Consultar activas por usuario/vehículo.
      const bySecretCode = await fetchActiveNotificationsByVehicle();

      // 3) Mezclar todo en otra variable temporal.
      const mergedOptions = baseOptions.map(opt => {
        const secret = String(opt?.raw?.secretCode || '').trim();
        if (!secret) return opt;
        if (!(secret in bySecretCode)) return opt;
        return {...opt, enabled: bySecretCode[secret]};
      });

      // 4) Asignar una sola vez al estado principal usado en el JSX.
      console.log('mergedOptions =>', mergedOptions);
      setNotificationOptions(mergedOptions);
    } catch (e) {
      setNotificationOptions([]);
      console.log('Error cargando notificaciones:', e?.message || e);
    } finally {
      setLoadingOptions(false);
    }
  }, [fetchActiveNotificationsByVehicle, fetchNotificationOptions]);

  useEffect(() => {
    loadNotificationsInOrder();
  }, [loadNotificationsInOrder]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotificationsInOrder();
    });

    return unsubscribe;
  }, [navigation, loadNotificationsInOrder]);

  const toggleNotificationOption = (id, value) => {
    setNotificationOptions(prev =>
      prev.map(item => (item.id === id ? {...item, enabled: value} : item)),
    );
  };

  const allSelected =
    notificationOptions.length > 0 && notificationOptions.every(item => item.enabled);

  const toggleAllNotifications = value => {
    setNotificationOptions(prev => prev.map(item => ({...item, enabled: value})));
  };

  const handleSaveChanges = async () => {
    try {
      setSavingChanges(true);

      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uiduser = userInfo?.uid ?? userInfo?.id ?? '';
      const uidvehicle = route?.params?.vehicleId ? String(route.params.vehicleId) : '';

      const notificationsPayload = notificationOptions.map(item => ({
        ...(item.raw || {}),
        active: Boolean(item.enabled),
      }));

      console.log('notificationsPayload', notificationsPayload);
      console.log('uiduser', uiduser);
      console.log('uidvehicle', uidvehicle);

      await api.post('usuarios/saveUpdateNotificationUser', {
        uiduser,
        uidvehicle,
        notificaciones: notificationsPayload,
      });

      setSuccessModalVisible(true);
    } catch (e) {
      // Si ocurre error, mantenemos la pantalla para reintento.
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnCircle}
          activeOpacity={0.85}>
          <ArrowLeft size={20} color="#FFD60A" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            Configura alertas y mantente al día con su mantenimiento.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeaderRow}>
            <View style={styles.infoIconWrap}>
              <Icons name="bell" size={18} color="#FFD60A" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoCardTitle}>Centro de actividades</Text>
              <Text style={styles.infoCardText}>
                Desde esta pantalla puedes activar y desactivar las notificaciones de tu
                vehículo.
              </Text>
            </View>
          </View>
          <View style={styles.vehicleDataCard}>
            <View style={styles.vehiclePrimaryRow}>
              <View style={styles.plateChip}>
                <Icons name="car-side" size={13} color="#FFD60A" style={styles.plateChipIcon} />
                <Text style={styles.plateChipText} numberOfLines={1}>
                  {vehicleSummary.placa}
                </Text>
              </View>
              <View style={styles.modelChip}>
                <Icons name="car" size={12} color="#FFD60A" style={styles.kmChipIcon} />
                <Text style={styles.kmChipText} numberOfLines={1}>
                  {vehicleSummary.marcaModelo}
                </Text>
              </View>
              <View style={styles.kmChip}>
                <Icons name="tachometer-alt" size={12} color="#FFD60A" style={styles.kmChipIcon} />
                <Text style={styles.kmChipText} numberOfLines={1}>
                  {vehicleSummary.kilometrajeLabel}
                </Text>
              </View>
            </View>

            <View style={styles.vehicleGridWrap}>
              {vehicleSummary.details.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.vehicleGridItem,
                    index % 2 === 0 ? styles.vehicleGridItemLeft : null,
                  ]}>
                  <Text style={styles.vehicleGridLabel}>{item.label}</Text>
                  <Text style={styles.vehicleGridValue} numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Seleccionar todo</Text>
              <Text style={styles.settingSubtitle}>
                Activa o desactiva todas las notificaciones de una vez.
              </Text>
            </View>
            <View style={styles.switchWrap}>
              <BooleanPillToggle
                value={allSelected}
                onValueChange={toggleAllNotifications}
                disabled={loadingOptions || notificationOptions.length === 0}
              />
            </View>
          </View>

          <View style={styles.settingDivider} />

          {loadingOptions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#2D3261" />
              <Text style={styles.loadingText}>Cargando notificaciones...</Text>
            </View>
          ) : notificationOptions.length > 0 ? (
            notificationOptions.map((option, index) => (
              <View key={option.id}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Text style={styles.settingTitle}>{option.title}</Text>
                    <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                  </View>
                  <View style={styles.switchWrap}>
                    <BooleanPillToggle
                      value={option.enabled}
                      onValueChange={value =>
                        toggleNotificationOption(option.id, value)
                      }
                    />
                  </View>
                </View>
                {index < notificationOptions.length - 1 ? (
                  <View style={styles.settingDivider} />
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyStateText}>
                No hay opciones de notificaciones disponibles por ahora.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSaveChanges}
          disabled={savingChanges || loadingOptions}>
          {savingChanges ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icons name="save" size={16} color="#FFFFFF" style={styles.saveButtonIcon} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={successModalVisible}
        transparent
        onRequestClose={() => setSuccessModalVisible(false)}>
        <TouchableOpacity
          style={styles.successModalOverlay}
          activeOpacity={1}
          onPress={() => setSuccessModalVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.successModalCard}>
            <View style={styles.successIconWrap}>
              <Icons name="check" size={28} color="#1F2344" />
            </View>
            <Text style={styles.successTitle}>¡Cambios guardados!</Text>
            <Text style={styles.successSubtitle}>
              Tus preferencias de notificaciones del vehículo fueron actualizadas correctamente.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}>
              <Text style={styles.successBtnText}>Perfecto</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#1F2344',
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 7,
    borderBottomColor: '#FFD60A',
  },
  headerCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,214,10,0.12)',
    top: -34,
    right: -22,
  },
  headerCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 24,
    left: -14,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,214,10,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    position: 'absolute',
    left: 16,
    top: 28,
    zIndex: 3,
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFD60A',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.96,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 96,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#5D668A',
    lineHeight: 20,
    fontWeight: '600',
  },
  vehicleDataCard: {
    marginTop: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  vehiclePrimaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  plateChip: {
    maxWidth: '48%',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  plateChipIcon: {
    marginRight: 6,
  },
  plateChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  modelChip: {
    maxWidth: '52%',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 6,
  },
  vehicleGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  kmChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  kmChipIcon: {
    marginRight: 6,
  },
  kmChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  vehicleGridItem: {
    width: '50%',
    paddingHorizontal: 3,
    marginBottom: 6,
  },
  vehicleGridItemLeft: {
    paddingRight: 6,
  },
  vehicleGridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleGridValue: {
    fontSize: 12,
    color: '#1F2344',
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6ECFA',
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  switchWrap: {
    width: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 6,
  },
  settingTitle: {
    fontSize: 15,
    color: '#1F2344',
    fontWeight: '800',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 18,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#E8EDF8',
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyStateWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F6F8',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#E6ECFA',
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECFA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2344',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#5D668A',
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },
  successBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default VehicleNotificationsScreen;
