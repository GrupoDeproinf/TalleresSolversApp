// Atajo bajo un campo cuando el correo o teléfono ya tiene cuenta.
import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {colors, fonts, TOUCH} from '../../ui/tokens';

const IrALogin = ({onPress}) => (
  <Pressable onPress={onPress} accessibilityRole="button" style={({pressed}) => [s.btn, pressed && {opacity: 0.6}]}>
    <Text style={s.text}>Ir a iniciar sesión</Text>
    <ChevronRight size={18} color={colors.blue} strokeWidth={2.5} />
  </Pressable>
);

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: TOUCH,
    marginTop: -8,
    marginBottom: 8,
  },
  text: {fontFamily: fonts.bold, fontSize: 15, color: colors.blue},
});

export default IrALogin;
