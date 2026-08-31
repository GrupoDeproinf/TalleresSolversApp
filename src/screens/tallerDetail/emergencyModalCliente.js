/**
 * Misma lógica que EmergencyModalProvider en myTab: opciones → validar solicitud activa →
 * vehículos o bloqueo → navegación a SolicitudServicio / Mis Solicitudes.
 * Aislado aquí para no depender de myTab.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../../axiosInstance';

const EmergencyModalContent = ({ onClose, onSolicitarServicio, checkingActiveSolicitud = false }) => (
  <View
    style={{
      width: '88%',
      maxWidth: 360,
      borderRadius: 28,
      paddingVertical: 32,
      paddingHorizontal: 24,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 16,
    }}>
    <View
      style={{
        alignItems: 'center',
        marginBottom: 20,
      }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: '#FFF8E6',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
        }}>
        <MaterialCommunityIcons name="car-emergency" size={40} color="#E6A800" />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: '#1A1D26',
          textAlign: 'center',
          marginBottom: 4,
        }}>
        ¿Qué necesitas hoy?
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 20,
          paddingHorizontal: 8,
        }}>
        Elige el tipo de servicio que deseas solicitar para tu vehículo.
      </Text>
    </View>

    <View style={{ gap: 12 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={checkingActiveSolicitud}
        onPress={onSolicitarServicio}
        style={{
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: checkingActiveSolicitud ? '#E5E7EB' : '#F3F4FF',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#E0E7FF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <MaterialCommunityIcons name="wrench-outline" size={22} color="#2D3261" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1A1D26',
              marginBottom: 2,
            }}>
            {checkingActiveSolicitud ? 'Validando solicitud activa...' : 'Solicitar Servicio'}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
            }}>
            Pide un servicio para mantenimiento, revisión o reparación de tu vehículo.
          </Text>
        </View>
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      onPress={onClose}
      style={{
        alignSelf: 'center',
        marginTop: 18,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
      activeOpacity={0.8}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: '#6B7280',
          textDecorationLine: 'underline',
        }}>
        Cerrar
      </Text>
    </TouchableOpacity>
  </View>
);

const ActiveSolicitudBlockedModalContent = ({ onGoToMisSolicitudes, onClose }) => (
  <View
    style={{
      width: '88%',
      maxWidth: 360,
      borderRadius: 28,
      paddingVertical: 30,
      paddingHorizontal: 24,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 16,
    }}>
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: '#FFF8E6',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}>
        <MaterialCommunityIcons name="alert-circle-check-outline" size={38} color="#E6A800" />
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color: '#1A1D26',
          textAlign: 'center',
          marginBottom: 6,
        }}>
        Ya tienes una solicitud activa
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#6B7280',
          textAlign: 'center',
          lineHeight: 21,
          paddingHorizontal: 4,
        }}>
        Para brindarte una mejor experiencia, solo puedes tener una solicitud en espera por aprobación al mismo tiempo.
      </Text>
    </View>

    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onGoToMisSolicitudes}
      style={{
        marginTop: 8,
        borderRadius: 14,
        paddingVertical: 13,
        backgroundColor: '#2D3261',
        alignItems: 'center',
      }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
        Ir a Mis Solicitudes
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={onClose}
      style={{
        alignSelf: 'center',
        marginTop: 14,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
      activeOpacity={0.8}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: '#6B7280',
          textDecorationLine: 'underline',
        }}>
        Cerrar
      </Text>
    </TouchableOpacity>
  </View>
);

const VehicleSelectionModalContent = ({ onClose, onSelectVehicle }) => {
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jsonValue = await AsyncStorage.getItem('@userInfo');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      const uid = user?.uid ?? user?.id ?? '';
      if (!uid) {
        setVehicles([]);
        setSelectedId(null);
        setError('No se encontró la sesión. Inicia sesión nuevamente.');
        return;
      }
      const response = await api.post('usuarios/getVehiculosByUsuarioUid', { uid });
      const data = response?.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setVehicles(list);
      const porDefecto = list.find(v => v.por_defecto === true);
      setSelectedId(porDefecto?.id ?? null);
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      setError(err?.response?.data?.message || err?.message || 'No pudimos cargar tus vehículos.');
      setVehicles([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const formatSubtitle = v => {
    const anio = (v.vehiculo_anio || '').toString().trim();
    const km = (v.KM || '').toString().trim();
    const parts = [];
    if (anio) parts.push(anio);
    if (km) parts.push(km);
    return parts.length ? parts.join(' · ') : '—';
  };

  const goToVehiclesScreen = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate('VehiclesScreen');
    }, 180);
  };

  return (
    <View
      style={{
        width: '88%',
        maxWidth: 360,
        borderRadius: 28,
        paddingVertical: 28,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 16,
      }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#E8F4FD',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}>
          <MaterialCommunityIcons name="car-side" size={32} color="#2D3261" />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1A1D26',
            textAlign: 'center',
            marginBottom: 6,
          }}>
          Selecciona tu vehículo
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 20,
            paddingHorizontal: 8,
          }}>
          Elige el vehículo con el que deseas solicitar el servicio. Así podremos atenderte mejor.
        </Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2D3261" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#6B7280' }}>
            Cargando tus vehículos...
          </Text>
        </View>
      ) : error ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#DC2626', textAlign: 'center', marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchVehicles}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
            }}
            activeOpacity={0.8}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#2D3261' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              marginBottom: 14,
              lineHeight: 20,
            }}>
            No tienes vehículos asociados en este momento. Registra uno para poder solicitar el servicio.
          </Text>
          <TouchableOpacity
            onPress={() => {
              goToVehiclesScreen();
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 18,
              backgroundColor: '#2D3261',
              borderRadius: 14,
              minWidth: 210,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 5,
            }}
            activeOpacity={0.85}>
            <MaterialCommunityIcons
              name="car-side"
              size={18}
              color="#FFD60A"
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
              Ir a Mis Vehículos
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {vehicles.map(v => {
            const isSelected = selectedId === v.id;
            return (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.9}
                onPress={() => setSelectedId(v.id)}
                style={{
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  backgroundColor: isSelected ? '#F3F4FF' : '#F9FAFB',
                  borderWidth: 2,
                  borderColor: isSelected ? '#2D3261' : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isSelected ? '#E0E7FF' : '#E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}>
                  <MaterialCommunityIcons
                    name="car-hatchback"
                    size={24}
                    color={isSelected ? '#2D3261' : '#6B7280'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#1A1D26',
                      marginBottom: 2,
                    }}>
                    {[v.vehiculo_marca, v.vehiculo_modelo].filter(Boolean).join(' ') || 'Vehículo'}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    {formatSubtitle(v)} KM.
                  </Text>
                </View>
                {isSelected && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#2D3261" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            if (selectedId) {
              const vehicle = vehicles.find(ve => ve.id === selectedId);
              if (vehicle) onSelectVehicle(vehicle);
            }
            onClose();
          }}
          disabled={!selectedId}
          style={{
            marginTop: 20,
            borderRadius: 14,
            paddingVertical: 14,
            backgroundColor: selectedId ? '#2D3261' : '#E5E7EB',
            alignItems: 'center',
          }}
          activeOpacity={0.85}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: selectedId ? '#FFFFFF' : '#9CA3AF',
            }}>
            Continuar con este vehículo
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onClose}
        style={{
          alignSelf: 'center',
          marginTop: 12,
          paddingVertical: 6,
          paddingHorizontal: 12,
        }}
        activeOpacity={0.8}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#6B7280',
            textDecorationLine: 'underline',
          }}>
          Volver
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * @param {boolean} visible
 * @param {() => void} onClose — al cerrar modal (backdrop o botones)
 * @param {string} [uidTaller] — uid del taller (desde detalle); se envía a SolicitudServicio
 */
export default function TallerDetailEmergencyModal({ visible, onClose, uidTaller }) {
  const navigation = useNavigation();
  const [step, setStep] = useState('options');
  const [checkingActiveSolicitud, setCheckingActiveSolicitud] = useState(false);

  useEffect(() => {
    if (!visible) {
      setStep('options');
      setCheckingActiveSolicitud(false);
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
    setStep('options');
  };

  const handleOpenVehicleSelection = async () => {
    try {
      setCheckingActiveSolicitud(true);
      const userInfoStr = await AsyncStorage.getItem('@userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const uid = userInfo?.uid ?? userInfo?.id;
      if (!uid) {
        setStep('vehicle');
        return;
      }

      const response = await api.post('usuarios/getSolicitudesByUsuario', {
        uid_usuario: uid,
        solo_ultima: true,
        status: 'En espera por aprobación',
      });
      const raw = response?.data;
      const singleItem =
        raw && typeof raw === 'object' && !Array.isArray(raw) && raw.id
          ? raw
          : Array.isArray(raw) && raw.length > 0
            ? raw[0]
            : null;

      if (singleItem?.id) {
        setStep('blocked');
      } else {
        setStep('vehicle');
      }
    } catch (_error) {
      setStep('vehicle');
    } finally {
      setCheckingActiveSolicitud(false);
    }
  };

  const handleSelectVehicle = vehicle => {
    handleClose();
    const params = { vehicle };
    if (uidTaller != null && String(uidTaller).trim() !== '') {
      params.uid_taller = String(uidTaller).trim();
    }
    navigation.navigate('SolicitudServicio', params);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {step === 'options' && (
          <EmergencyModalContent
            onClose={handleClose}
            onSolicitarServicio={handleOpenVehicleSelection}
            checkingActiveSolicitud={checkingActiveSolicitud}
          />
        )}
        {step === 'vehicle' && (
          <VehicleSelectionModalContent
            onClose={() => handleClose()}
            onSelectVehicle={handleSelectVehicle}
          />
        )}
        {step === 'blocked' && (
          <ActiveSolicitudBlockedModalContent
            onClose={handleClose}
            onGoToMisSolicitudes={() => {
              handleClose();
              setTimeout(() => {
                navigation.navigate('DrawerScreen', { screen: 'MisSolicitudes' });
              }, 180);
            }}
          />
        )}
      </View>
    </Modal>
  );
}
