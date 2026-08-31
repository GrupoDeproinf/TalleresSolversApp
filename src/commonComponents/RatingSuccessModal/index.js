/**
 * RatingSuccessModal
 *
 * Modal amistoso de confirmación tras enviar una calificación.
 * Usa iconos de lucide-react-native.
 *
 * Props:
 *   visible  {boolean}
 *   onClose  {() => void}
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  HeartHandshake,
  Star,
  Sparkles,
  Sparkle,
} from 'lucide-react-native';

const NAVY   = '#1F2344';
const YELLOW = '#FFD60A';

// ─── Estrella decorativa animada ──────────────────────────────────────────
const FloatingStar = ({ style, Icon, size, color, delay }) => {
  const opacity  = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity,     { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(opacity,     { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY,  { toValue: -6, duration: 500, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.timing(translateY, { toValue: 4, duration: 0, useNativeDriver: true }),
      ]),
    );
    const t = setTimeout(() => anim.start(), 300);
    return () => { clearTimeout(t); anim.stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[styles.floatingStar, style, { opacity, transform: [{ translateY }] }]}>
      <Icon size={size} color={color} />
    </Animated.View>
  );
};

const STARS = [
  { style: { top: 16, left: 20  }, Icon: Sparkles, size: 18, color: YELLOW,    delay: 0   },
  { style: { top: 12, right: 18 }, Icon: Star,      size: 16, color: '#60A5FA', delay: 250 },
  { style: { top: 52, left: 8   }, Icon: Sparkle,   size: 12, color: '#A78BFA', delay: 450 },
  { style: { top: 48, right: 10 }, Icon: Sparkles,  size: 14, color: YELLOW,    delay: 150 },
];

// ─── Modal principal ──────────────────────────────────────────────────────
const RatingSuccessModal = ({ visible, onClose, rating = 5 }) => {
  const scaleIcon  = useRef(new Animated.Value(0)).current;
  const scaleCard  = useRef(new Animated.Value(0.85)).current;
  const opacityCard = useRef(new Animated.Value(0)).current;
  const bounceIcon = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      scaleIcon.setValue(0);
      scaleCard.setValue(0.85);
      opacityCard.setValue(0);
      bounceIcon.setValue(1);
      return;
    }

    // Entrada de la card
    Animated.parallel([
      Animated.spring(scaleCard,   { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityCard, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();

    // Icono aparece con rebote
    const t1 = setTimeout(() => {
      Animated.spring(scaleIcon, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }).start(() => {
        // Pulso suave continuo
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceIcon, { toValue: 1.08, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(bounceIcon, { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ).start();
      });
    }, 180);

    return () => { clearTimeout(t1); };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

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

          {/* Estrellas flotantes */}
          {STARS.map((s, i) => <FloatingStar key={i} {...s} />)}

          {/* Icono central */}
          <Animated.View style={{ transform: [{ scale: scaleIcon }, { scale: bounceIcon }] }}>
            <View style={styles.iconCircle}>
              <HeartHandshake size={38} color={NAVY} strokeWidth={1.8} />
            </View>
          </Animated.View>

          {/* Textos */}
          <Text style={styles.title}>¡Gracias por tu opinión!</Text>

          <Text style={styles.body}>
            Tu calificación fue enviada exitosamente.{'\n'}
            Nos ayuda a mejorar y a que otros{'\n'}
            usuarios encuentren los mejores talleres.
          </Text>

          {/* Estrellas según la calificación del usuario */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={22}
                color={i <= rating ? YELLOW : '#D1D5DB'}
                fill={i <= rating ? YELLOW : 'none'}
                strokeWidth={i <= rating ? 0 : 1.5}
              />
            ))}
          </View>

          <Text style={styles.caption}>¡Tu experiencia importa! 🙌</Text>

          {/* Botón */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar">
            <Text style={styles.btnText}>¡Perfecto!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,45,0.85)',
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
    overflow: 'hidden',
  },

  floatingStar: {
    position: 'absolute',
    zIndex: 0,
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
    zIndex: 1,
  },

  // ── Textos ────────────────────────────────────────────────────────────────
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
    zIndex: 1,
  },
  body: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
    zIndex: 1,
  },

  // ── Estrellas ─────────────────────────────────────────────────────────────
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    zIndex: 1,
  },

  caption: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 22,
    zIndex: 1,
  },

  // ── Botón ─────────────────────────────────────────────────────────────────
  btn: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 1,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default RatingSuccessModal;
