import React, { useEffect, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, Image, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../axiosInstance';
import HomeScreen from '../screens/homeScreen';
import CategoryScreen from '../screens/categoryScreen';
// import MyBeg from '../screens/emptyScreen/myBeg';
import ProfileScreen from '../screens/profileScreen';
import TalleresContainer from '../screens/Talleres';
import ServiciosContainer from '../screens/Servicios';

import RadioSelector from '../screens/perimeter-map';
import MisSolicitudesScreen from '../screens/misSolicitudes';
import TallerInicio from '../screens/tallerInicio';
import SolicitudesTallerScreen from '../screens/solicitudesTaller';
import {
  Category,
  CategoryLight,
  HomeIcon,
  HomeLight,
  MyBegDis,
  MyBegs,
  ProfileLight,
  ProfileTab,
  Setting,
} from '../utils/icon';
import images from '../utils/images';
import { external } from '../style/external.css';
import LinearGradient from 'react-native-linear-gradient';
import { useValues } from '../../App';
import { windowHeight, windowWidth } from '../themes/appConstant';
import Icons from 'react-native-vector-icons/FontAwesome';
import Icons3 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icons2 from 'react-native-vector-icons/Entypo';


const Tab = createBottomTabNavigator();

const EmergencyModalContext = React.createContext({ visible: false, setVisible: () => { } });

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

      {/* <TouchableOpacity
        activeOpacity={0.9}
        onPress={onClose}
        style={{
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: '#FFF7F3',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFE4D5',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <MaterialCommunityIcons name="tow-truck" size={22} color="#E56A1A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1A1D26',
              marginBottom: 2,
            }}>
            Servicio de grúa
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#6B7280',
            }}>
            Solicita ayuda de grúa si tu vehículo no puede movilizarse.
          </Text>
        </View>
      </TouchableOpacity> */}
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
      const porDefecto = list.find((v) => v.por_defecto === true);
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

  const formatSubtitle = (v) => {
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
            No tienes vehículos asociados en este momento. Registra uno para poder
            solicitar el servicio.
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
          {vehicles.map((v) => {
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
              const vehicle = vehicles.find((ve) => ve.id === selectedId);
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

const EmergencyModalProvider = ({ children }) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState('options');
  const [checkingActiveSolicitud, setCheckingActiveSolicitud] = useState(false);

  const handleClose = () => {
    setVisible(false);
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

  const handleSelectVehicle = (vehicle) => {
    handleClose();
    navigation.navigate('SolicitudServicio', { vehicle });
  };

  const handleGoToVehiclesScreen = () => {
    handleClose();
  };

  return (
    <EmergencyModalContext.Provider value={{ visible, setVisible }}>
      {children}
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
    </EmergencyModalContext.Provider>
  );
};

const EmergenciaScreen = ({ navigation, route }) => {
  const showMap = route.params?.showMap === true;

  if (showMap) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => navigation.setParams({ showMap: undefined })}
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            zIndex: 10,
            padding: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 24,
          }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <RadioSelector />
      </View>
    );
  }

  return <View style={{ flex: 1 }} />;
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [activeTab, setActiveTab] = useState(state.routes[0].name);

  useEffect(() => {
    console.log("activeTab", activeTab);
    console.log("aqui va algo la primera vez");

    // Verificar si hay un tab específico que debe estar activo
    const currentRoute = state.routes[state.index];
    if (currentRoute && currentRoute.name !== activeTab) {
      setActiveTab(currentRoute.name);
    }
  }, [state.index, state.routes]);

  const handleTabPress = routeName => {
    setActiveTab(routeName);
    navigation.navigate(routeName);
  };
  const { linearColorStyle, textColorStyle, linearColorStyleTwo, viewRTLStyle } =
    useValues();
  const emergencyModal = React.useContext(EmergencyModalContext);

  const emergencyIndex = state.routes.findIndex((r) => r.name === 'Emergencia');
  const serviciosIndex = state.routes.findIndex((r) => r.name === 'Servicios');
  const serviciosScreenIndex = state.routes.findIndex((r) => r.name === 'ServiciosScreen');
  const centerIndex = emergencyIndex >= 0 ? emergencyIndex : (serviciosIndex >= 0 ? serviciosIndex : (serviciosScreenIndex >= 0 ? serviciosScreenIndex : -1));
  const hasCenteredButton = centerIndex >= 0;

  // Márgenes del sistema: los aplica MainActivity (Android) y App.tsx (iOS).
  const insets = {top: 0, bottom: 0};

  const renderNormalTab = (route) => {
    const { options } = descriptors[route.key];
    const label = TAB_LABELS[route.name] || options.tabBarLabel || options.title || route.name;
    const IconComponent = options.tabBarIcon;
    const ActiveIcon = options.activeTabBarIcon || IconComponent;
    const isFocused = activeTab === route.name;
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        handleTabPress(route.name);
      }
    };
    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
        activeOpacity={0.7}
        style={tabStyles.tab}>
        <View style={[tabStyles.iconWrap, isFocused && tabStyles.iconWrapOn]}>
          <View style={tabStyles.iconScale}>
            {isFocused ? <ActiveIcon /> : <IconComponent />}
          </View>
        </View>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.15}
          style={[tabStyles.label, isFocused && tabStyles.labelOn]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCenterButton = (route, onPress, isServicios) => (
    <View key={route.key} style={tabStyles.centerCol}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={TAB_LABELS[route.name] || 'Emergencia'}
        activeOpacity={0.8}
        style={tabStyles.centerBtn}>
        {isServicios ? (
          <Icons3 name="tools" size={26} color="#1F2344" />
        ) : (
          <MaterialCommunityIcons name="car-emergency" size={30} color="#1F2344" />
        )}
      </TouchableOpacity>
      <Text numberOfLines={1} maxFontSizeMultiplier={1.15} style={tabStyles.centerLabel}>
        {TAB_LABELS[route.name] || 'Emergencia'}
      </Text>
    </View>
  );

  const barStyle = [tabStyles.bar, { paddingBottom: Math.max(insets.bottom, 6) }];

  if (hasCenteredButton) {
    const leftRoutes = state.routes.slice(0, centerIndex);
    const centerRoute = state.routes[centerIndex];
    const rightRoutes = state.routes.slice(centerIndex + 1);
    const isCenterEmergencia = centerRoute.name === 'Emergencia';
    const isCenterServicios = centerRoute.name === 'Servicios' || centerRoute.name === 'ServiciosScreen';
    return (
      <View style={[barStyle, { flexDirection: viewRTLStyle }]}>
        <View style={{ flex: 1, flexDirection: viewRTLStyle }}>
          {leftRoutes.map((route) => renderNormalTab(route))}
        </View>
        {renderCenterButton(
          centerRoute,
          () => {
            if (isCenterEmergencia && emergencyModal.setVisible) {
              emergencyModal.setVisible(true);
            } else {
              handleTabPress(centerRoute.name);
            }
          },
          isCenterServicios,
        )}
        <View style={{ flex: 1, flexDirection: viewRTLStyle }}>
          {rightRoutes.map((route) => renderNormalTab(route))}
        </View>
      </View>
    );
  }

  return (
    <View style={[barStyle, { flexDirection: viewRTLStyle }]}>
      {state.routes.map((route) => {
        if (route.name === 'Emergencia') {
          return renderCenterButton(route, () => handleTabPress(route.name), false);
        }
        return renderNormalTab(route);
      })}
    </View>
  );
};

/** Nombre visible de cada pestaña (en español, debajo del ícono). */
const TAB_LABELS = {
  HomeScreen: 'Inicio',
  CategoryScreen: 'Categorías',
  MisSolicitudes: 'Solicitudes',
  Servicios: 'Servicios',
  ServiciosScreen: 'Servicios',
  Talleres: 'Talleres',
  ProfileScreen: 'Perfil',
  RadioSelector: 'Mapa',
  Emergencia: 'Emergencia',
  MyBeg: 'Favoritos',
};

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E3E5EE',
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#1F2344',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  iconWrap: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOn: { backgroundColor: '#E8EAFB' },
  iconScale: { transform: [{ scale: 0.8 }] },
  label: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#5B6078', marginTop: 2 },
  labelOn: { fontFamily: 'Inter-Bold', color: '#1F2344' },
  centerCol: { width: 76, alignItems: 'center', justifyContent: 'flex-end' },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD60A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  centerLabel: { fontFamily: 'Inter-Bold', fontSize: 11, color: '#1F2344', marginTop: 2 },
});

// Tabs usuarios clientes

const MyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      {/* <Tab.Screen
        name="MyBeg"
        component={MyBeg}
        options={{
          tabBarLabel: 'My Bag',
          tabBarIcon: () => <MyBegDis />,
          activeTabBarIcon: () => <MyBegs />,
        }}
      /> */}

      <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="Talleres"
        component={TalleresContainer}
        options={{
          tabBarLabel: 'Talleres',
          tabBarIcon: () => <Icons name="car" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="car" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsCliente = () => {
  return (
    <EmergencyModalProvider>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <CustomTabBar {...props} />}
        tabBarOptions={{
          activeTintColor: '#2D3261',
          inactiveTintColor: '#808080',
        }}>
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
            activeTabBarIcon: () => (
              <Icons name="home" size={30} color="#2D3261" />
            ),
          }}
        />

        <Tab.Screen
          name="MisSolicitudes"
          component={MisSolicitudesScreen}
          options={{
            tabBarLabel: 'Solicitudes',
            tabBarIcon: () => (
              <MaterialCommunityIcons name="clipboard-text-outline" size={26} color="#9BA6B8" />
            ),
            activeTabBarIcon: () => (
              <MaterialCommunityIcons name="clipboard-text" size={26} color="#2D3261" />
            ),
          }}
        />

        <Tab.Screen
          name="Emergencia"
          component={EmergenciaScreen}
          options={{
            tabBarLabel: 'Emergencia',
            tabBarIcon: () => <View />,
            activeTabBarIcon: () => <View />,
          }}
        />

        <Tab.Screen
          name="CategoryScreen"
          component={CategoryScreen}
          options={{
            tabBarLabel: 'Category',
            tabBarIcon: () => <CategoryLight />,
            activeTabBarIcon: () => <Category />,
          }}
        />



        <Tab.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: () => <ProfileLight />,
            activeTabBarIcon: () => <ProfileTab />,
          }}
        />
      </Tab.Navigator>
    </EmergencyModalProvider>
  );
};

const MyTabsTaller = ({initialRouteName = 'HomeScreen'}) => {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#2D3261',
      }}>
      <Tab.Screen
        name="HomeScreen"
        // Req. 005: el taller ve los datos de su negocio, no el catálogo del conductor.
        component={TallerInicio}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />


      <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="MisSolicitudes"
        component={SolicitudesTallerScreen}
        options={{
          tabBarLabel: 'Solicitudes',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="clipboard-text-outline" size={26} color="#9BA6B8" />
          ),
          activeTabBarIcon: () => (
            <MaterialCommunityIcons name="clipboard-text" size={26} color="#2D3261" />
          ),
        }}
      />


      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsTallerPendiente = () => {
  return (
    <Tab.Navigator
      initialRouteName="ServiciosScreen"
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#2D3261',
      }}>
      <Tab.Screen
        name="HomeScreen"
        // Req. 005: el taller ve los datos de su negocio, no el catálogo del conductor.
        component={TallerInicio}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      <Tab.Screen
        name="ServiciosScreen"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      />

      <Tab.Screen
        name="MisSolicitudes"
        component={SolicitudesTallerScreen}
        options={{
          tabBarLabel: 'Solicitudes',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="clipboard-text-outline" size={26} color="#9BA6B8" />
          ),
          activeTabBarIcon: () => (
            <MaterialCommunityIcons name="clipboard-text" size={26} color="#2D3261" />
          ),
        }}
      />



      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}



      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

const MyTabsAdmin = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
      tabBarOptions={{
        activeTintColor: '#2D3261',
        inactiveTintColor: '#808080',
      }}>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Icons name="home" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="home" size={30} color="#2D3261" />
          ),
        }}
      />
      <Tab.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: () => <CategoryLight />,
          activeTabBarIcon: () => <Category />,
        }}
      />

      {/* <Tab.Screen
        name="MyBeg"
        component={MyBeg}
        options={{
          tabBarLabel: 'My Bag',
          tabBarIcon: () => <MyBegDis />,
          activeTabBarIcon: () => <MyBegs />,
        }}
      /> */}

      {/* <Tab.Screen
        name="Servicios"
        component={ServiciosContainer}
        options={{
          tabBarLabel: 'Servicios',
          tabBarIcon: () => <Icons3 name="tools" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons3 name="tools" size={30} color="#2D3261" />
          ),
        }}
      /> */}

      <Tab.Screen
        name="Talleres"
        component={TalleresContainer}
        options={{
          tabBarLabel: 'Talleres',
          tabBarIcon: () => <Icons name="car" size={30} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="car" size={30} color="#2D3261" />
          ),
        }}
      />

      {/* <Tab.Screen
        name="RadioSelector"
        component={RadioSelector}
        options={{
          tabBarLabel: 'Radio Talleres',
          tabBarIcon: () => <Icons name="map" size={27} color="#9BA6B8" />,
          activeTabBarIcon: () => (
            <Icons name="map" size={27} color="#2D3261" />
          ),
        }}
      /> */}

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <ProfileLight />,
          activeTabBarIcon: () => <ProfileTab />,
        }}
      />
    </Tab.Navigator>
  );
};

export { MyTabs, MyTabsCliente, MyTabsTaller, MyTabsTallerPendiente, MyTabsAdmin };

