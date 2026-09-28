// Barra de acciones fija al pie de las fichas (taller y servicio):
// Llamar · WhatsApp · Cómo llegar + la acción principal en amarillo.
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {Phone, MessageCircle, Navigation} from 'lucide-react-native';
import {Button, useMargenesSistema} from './index';
import {colors, fonts, space, shadow, TOUCH, MAX_FONT_SCALE} from './tokens';

const Action = ({icon: Icon, label, onPress, disabled, color}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{disabled: !!disabled}}
    style={({pressed}) => [bar.action, pressed && {backgroundColor: colors.bg}, disabled && {opacity: 0.35}]}>
    <Icon size={22} color={color || colors.navy} strokeWidth={2.2} />
    <Text maxFontSizeMultiplier={1.15} style={bar.actionText} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

/**
 * @param primary {title, onPress, loading, disabled} acción principal
 * @param hint texto corto sobre la barra (ej. "Abre mañana a las 8:00")
 */
const ContactBar = ({
  onCall,
  onWhatsApp,
  onDirections,
  canCall = true,
  canWhatsApp = true,
  canDirections = true,
  primary,
  hint,
}) => {
  const insets = useMargenesSistema();
  return (
    <View style={[bar.wrap, {paddingBottom: Math.max(insets.bottom, space.s) + 4}]}>
      {hint ? (
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={bar.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
      <View style={bar.row}>
        <Action icon={Phone} label="Llamar" onPress={onCall} disabled={!canCall} />
        <Action
          icon={MessageCircle}
          label="WhatsApp"
          onPress={onWhatsApp}
          disabled={!canWhatsApp}
          color={colors.whatsapp}
        />
        <Action icon={Navigation} label="Cómo llegar" onPress={onDirections} disabled={!canDirections} />
        {primary ? (
          <Button
            variant="accent"
            size="m"
            title={primary.title}
            onPress={primary.onPress}
            loading={primary.loading}
            disabled={primary.disabled}
            style={bar.primary}
          />
        ) : null}
      </View>
    </View>
  );
};

/** Alto aproximado para dejar espacio al final del ScrollView. */
export const CONTACT_BAR_SPACE = 120;

const bar = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: space.s,
    ...shadow.bar,
  },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 4},
  action: {
    minWidth: 60,
    minHeight: TOUCH + 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionText: {fontFamily: fonts.medium, fontSize: 12, color: colors.navy, marginTop: 2},
  primary: {flex: 1, marginLeft: 4},
});

export default ContactBar;
