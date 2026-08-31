/**
 * LocationPermissionModal
 *
 * Modal que se muestra cuando el GPS está desactivado o los permisos
 * de ubicación no han sido concedidos.
 *
 * Props:
 *   visible  {boolean}
 *   onClose  {() => void}
 *   type     {'permission' | 'gps'}
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MapPin, Navigation, Settings } from 'lucide-react-native';

const NAVY   = '#1F2344';
const YELLOW = '#FFD60A';

const LocationPermissionModal = ({ visible, onClose, type = 'permission' }) => {
  const isGps = type === 'gps';

  // ── Animaciones de entrada ────────────────────────────────────────────────
  const scaleCard   = useRef(new Animated.Value(0.88)).current;
  const opacityCard = useRef(new Animated.Value(0)).current;
  const scaleIcon   = useRef(new Animated.Value(0)).current;
  const bounceIcon  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      scaleCard.setValue(0.88);
      opacityCard.setValue(0);
      scaleIcon.setValue(0);
      bounceIcon.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleCard,   { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityCard, { toValue: 1, duration: 230, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.spring(scaleIcon, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true })
        .start(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(bounceIcon, { toValue: 1.08, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
              Animated.timing(bounceIcon, { toValue: 1,    duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
          ).start();
        });
    }, 180);

    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Acción del botón principal ────────────────────────────────────────────
  const handlePrimary = async () => {
    onClose();
    if (isGps && Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      } catch {
        await Linking.openSettings();
      }
    } else {
      // iOS: abre los ajustes de la app (el usuario activa ubicación desde ahí)
      // Android + permission: abre ajustes de la app para conceder el permiso
      await Linking.openSettings();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={s.overlay}>
        <Animated.View
          style={[s.card, { opacity: opacityCard, transform: [{ scale: scaleCard }] }]}>

          {/* Icono central */}
          <Animated.View style={{ transform: [{ scale: scaleIcon }, { scale: bounceIcon }] }}>
            <View style={[s.iconCircle, isGps && s.iconCircleGps]}>
              {isGps
                ? <Navigation size={36} color={NAVY} strokeWidth={2} />
                : <MapPin      size={36} color={NAVY} strokeWidth={2} />
              }
            </View>
          </Animated.View>

          {/* Textos */}
          <Text style={s.title}>
            {isGps ? '¡GPS desactivado!' : 'Ubicación necesaria'}
          </Text>

          <Text style={s.body}>
            {isGps
              ? 'Tu GPS está apagado. Actívalo para que podamos calcular la ruta y guiarte hasta el taller.'
              : 'Necesitamos acceso a tu ubicación para mostrarte el mapa y calcular la ruta al taller.'}
          </Text>

          {/* Indicador visual del problema */}
          <View style={[s.alertChip, isGps && s.alertChipGps]}>
            {isGps
              ? <Navigation size={13} color="#F97316" />
              : <MapPin      size={13} color="#EF4444" />
            }
            <Text style={[s.alertChipTxt, isGps && s.alertChipTxtGps]}>
              {isGps ? 'GPS / Servicios de ubicación desactivados' : 'Permiso de ubicación no concedido'}
            </Text>
          </View>

          {/* Botón principal */}
          <Pressable
            style={({ pressed }) => [s.primaryBtn, pressed && s.btnPressed]}
            onPress={handlePrimary}
            accessibilityRole="button">
            <Settings size={16} color={NAVY} style={{ marginRight: 8 }} />
            <Text style={s.primaryTxt}>
              {isGps ? 'Activar GPS' : 'Dar permiso'}
            </Text>
          </Pressable>

          {/* Cancelar */}
          <Pressable
            style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.65 }]}
            onPress={onClose}
            accessibilityRole="button">
            <Text style={s.cancelTxt}>Ahora no</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,45,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 26,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 18,
  },

  // ── Icono ─────────────────────────────────────────────────────────────────
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  iconCircleGps: {
    backgroundColor: '#FED7AA', // naranja claro para GPS off
    shadowColor: '#F97316',
  },

  // ── Textos ────────────────────────────────────────────────────────────────
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },

  // ── Chip de alerta ────────────────────────────────────────────────────────
  alertChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 22,
  },
  alertChipGps: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  alertChipTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  alertChipTxtGps: {
    color: '#EA580C',
  },

  // ── Botones ───────────────────────────────────────────────────────────────
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: YELLOW,
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 10,
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryTxt: {
    fontSize: 15,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 0.3,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelTxt: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default LocationPermissionModal;
