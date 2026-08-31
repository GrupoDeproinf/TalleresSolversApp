/**
 * ArrivedModal
 *
 * Modal de llegada al destino. Usa iconos de lucide-react-native
 * (la misma librería que el resto de la app).
 *
 * Props:
 *   visible         {boolean}
 *   destinationName {string}
 *   onClose         {() => void}
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Sparkles,
  Star,
  Sparkle,
  PartyPopper,
  WandSparkles,
} from 'lucide-react-native';

const NAVY   = '#1F2344';
const YELLOW = '#FFD60A';
const GREEN  = '#22C55E';

// ─── Partícula decorativa con lucide icon ──────────────────────────────────
const Particle = ({ style, Icon, size, color, delay, duration = 1400 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1,   duration: duration * 0.4, useNativeDriver: true }),
          Animated.spring(scale,   { toValue: 1,   tension: 80, friction: 6, useNativeDriver: true }),
        ]),
        Animated.delay(duration * 0.2),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.2, duration: duration * 0.4, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 0.7, duration: duration * 0.4, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
      ]),
    );
    const t = setTimeout(() => anim.start(), 300);
    return () => { clearTimeout(t); anim.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[styles.particle, style, { opacity, transform: [{ scale }] }]}>
      <Icon size={size} color={color} />
    </Animated.View>
  );
};

// Posiciones y configuración de las partículas decorativas
const PARTICLES = [
  { style: { top: 18,  left: 22  }, Icon: Sparkles,     size: 20, color: YELLOW,    delay: 0,   duration: 1600 },
  { style: { top: 14,  right: 20 }, Icon: Star,          size: 18, color: '#60A5FA', delay: 200, duration: 1800 },
  { style: { top: 55,  left: 10  }, Icon: Sparkle,       size: 14, color: GREEN,     delay: 400, duration: 1400 },
  { style: { top: 50,  right: 12 }, Icon: WandSparkles,  size: 16, color: YELLOW,    delay: 100, duration: 1900 },
  { style: { bottom: 90, left: 18  }, Icon: Star,        size: 16, color: '#A78BFA', delay: 300, duration: 1500 },
  { style: { bottom: 85, right: 16 }, Icon: Sparkles,    size: 18, color: GREEN,     delay: 500, duration: 1700 },
  { style: { bottom: 50, left: 8   }, Icon: Sparkle,     size: 12, color: '#60A5FA', delay: 150, duration: 1300 },
  { style: { bottom: 48, right: 10 }, Icon: Star,        size: 14, color: YELLOW,    delay: 350, duration: 1600 },
];

// ─── Componente principal ─────────────────────────────────────────────────
const ArrivedModal = ({ visible, destinationName = 'tu destino', onClose, onSkip }) => {
  const scaleCheck  = useRef(new Animated.Value(0)).current;
  const scaleCard   = useRef(new Animated.Value(0.82)).current;
  const opacityCard = useRef(new Animated.Value(0)).current;
  const pulseRing   = useRef(new Animated.Value(1)).current;
  const rotateParty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scaleCheck.setValue(0);
      scaleCard.setValue(0.82);
      opacityCard.setValue(0);
      pulseRing.setValue(1);
      rotateParty.setValue(0);
      return;
    }

    // Entrada de la card
    Animated.parallel([
      Animated.spring(scaleCard, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityCard, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();

    // Checkmark con rebote retardado
    const t1 = setTimeout(() => {
      Animated.spring(scaleCheck, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }).start();
    }, 200);

    // Rotación suave del PartyPopper
    const t2 = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateParty, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotateParty, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    }, 350);

    // Pulso del anillo exterior
    const t3 = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseRing, { toValue: 1.14, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseRing, { toValue: 1,    duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    }, 400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const rotate = rotateParty.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] });
  const displayName = (destinationName || '').trim() || 'tu destino';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>

        <Animated.View
          style={[styles.card, { opacity: opacityCard, transform: [{ scale: scaleCard }] }]}>

          {/* Partículas decorativas dentro de la card */}
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}

          {/* PartyPopper arriba */}
          <Animated.View style={[styles.partyWrap, { transform: [{ rotate }] }]}>
            <PartyPopper size={28} color={YELLOW} />
          </Animated.View>

          {/* Anillo pulsante + checkmark */}
          <View style={styles.iconWrap}>
            <Animated.View style={[styles.ringOuter, { transform: [{ scale: pulseRing }] }]} />
            <View style={styles.ringInner} />
            <Animated.View style={{ transform: [{ scale: scaleCheck }] }}>
              <View style={styles.checkCircle}>
                <Star size={34} color="#fff" fill="#fff" />
              </View>
            </Animated.View>
          </View>

          {/* Textos */}
          <Text style={styles.title}>¡Has llegado!</Text>
          <Text style={styles.subtitle}>
            Bienvenido a{' '}
            <Text style={styles.subtitleAccent}>{displayName}</Text>
          </Text>
          <Text style={styles.caption}>
            Cuéntanos cómo fue tu experiencia.{'\n'}
            Tu opinión ayuda a otros usuarios.
          </Text>

          {/* Separador con sparkles */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Sparkles size={14} color="#D1D5DB" />
            <View style={styles.dividerLine} />
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Calificar visita">
            <WandSparkles size={18} color={NAVY} style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>Calificar visita</Text>
          </Pressable>

          <Pressable onPress={onSkip ?? onClose} style={styles.skipBtn}>
            <Text style={styles.skipTxt}>Omitir</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,45,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
  },

  // ── Partículas ────────────────────────────────────────────────────────────
  particle: {
    position: 'absolute',
    zIndex: 0,
  },

  // ── Party popper ──────────────────────────────────────────────────────────
  partyWrap: {
    marginBottom: 10,
    zIndex: 1,
  },

  // ── Icono check ───────────────────────────────────────────────────────────
  iconWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  ringOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: `${GREEN}16`,
    borderWidth: 1.5,
    borderColor: `${GREEN}35`,
  },
  ringInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${GREEN}10`,
  },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },

  // ── Textos ────────────────────────────────────────────────────────────────
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 8,
    zIndex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    zIndex: 1,
  },
  subtitleAccent: {
    color: NAVY,
    fontWeight: '800',
  },
  caption: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    zIndex: 1,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
    width: '100%',
    zIndex: 1,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F4',
  },

  // ── Botón principal ───────────────────────────────────────────────────────
  btn: {
    backgroundColor: YELLOW,
    borderRadius: 16,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E7BF00',
    shadowColor: YELLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
    zIndex: 1,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 0.3,
  },

  // ── Skip ──────────────────────────────────────────────────────────────────
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  skipTxt: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default ArrivedModal;
