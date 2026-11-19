// Campo de fecha para escribir (DD/MM/AAAA).
//
// Regla de uso: si la persona ya conoce la fecha o la lee de un documento
// (vencimiento del RCV, de la licencia…), se escribe; abrir un calendario y
// pasar meses o años es más lento. El calendario queda para fechas que se
// están eligiendo (una cita, una visita). Aquí el ícono de calendario sigue
// disponible para quien lo prefiera.
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import {CalendarDays} from 'lucide-react-native';
import {colors, space, radius} from './tokens';

const dos = n => String(n).padStart(2, '0');

/** Date, "2027-12-31" o "31/12/2027" → Date local (sin desfase de zona horaria). */
const normalizarFecha = value => {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    // eslint-disable-next-line no-use-before-define
    return iso ? textoAFecha(`${iso[3]}${iso[2]}${iso[1]}`) : textoAFecha(value);
  }
  return null;
};

export const fechaATexto = value => {
  const d = normalizarFecha(value);
  return d ? `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}` : '';
};

/** "31122027" o "31/12/2027" → Date, o null si no es una fecha real. */
export const textoAFecha = (texto, {minYear = 1950, maxYear = 2100} = {}) => {
  const dig = String(texto || '').replace(/\D/g, '');
  if (dig.length !== 8) return null;
  const d = Number(dig.slice(0, 2));
  const m = Number(dig.slice(2, 4));
  const y = Number(dig.slice(4, 8));
  if (y < minYear || y > maxYear || m < 1 || m > 12 || d < 1) return null;
  const f = new Date(y, m - 1, d);
  return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d ? f : null;
};

/** Pone las barras mientras se escribe: 3112 → 31/12. */
const conBarras = texto => {
  const dig = String(texto || '').replace(/\D/g, '').slice(0, 8);
  if (dig.length <= 2) return dig;
  if (dig.length <= 4) return `${dig.slice(0, 2)}/${dig.slice(2)}`;
  return `${dig.slice(0, 2)}/${dig.slice(2, 4)}/${dig.slice(4)}`;
};

const FechaInput = ({
  value,
  onChange,
  onOpenCalendar,
  minYear,
  maxYear,
  accessibilityLabel = 'Fecha',
  style,
}) => {
  const [texto, setTexto] = useState(fechaATexto(value));
  const [error, setError] = useState('');
  const ultimaRef = useRef(normalizarFecha(value)?.getTime() ?? null);

  // Si la fecha cambia desde fuera (al cargar o al elegirla en el calendario),
  // se muestra en el campo.
  useEffect(() => {
    const t = normalizarFecha(value)?.getTime() ?? null;
    if (t !== ultimaRef.current) {
      ultimaRef.current = t;
      setTexto(fechaATexto(value));
      setError('');
    }
  }, [value]);

  const cambiar = nuevo => {
    // Al escribir se ponen las barras solas; al borrar se respeta lo que quedó
    // (si no, una barra borrada volvería a aparecer).
    const borrando = nuevo.length < texto.length;
    const formateado = borrando ? nuevo.replace(/[^\d/]/g, '') : conBarras(nuevo);
    setTexto(formateado);
    const dig = formateado.replace(/\D/g, '');
    if (dig.length < 8) {
      setError('');
      if (ultimaRef.current !== null) {
        ultimaRef.current = null;
        onChange?.(null);
      }
      return;
    }
    const f = textoAFecha(dig, {minYear, maxYear});
    if (!f) {
      setError('Revisa la fecha: día, mes y año (DD/MM/AAAA).');
      ultimaRef.current = null;
      onChange?.(null);
      return;
    }
    setError('');
    ultimaRef.current = f.getTime();
    onChange?.(f);
  };

  return (
    <View style={style}>
      <View style={[s.caja, error ? s.cajaError : null]}>
        <TextInput
          value={texto}
          onChangeText={cambiar}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.placeholder || '#9CA3AF'}
          keyboardType="number-pad"
          returnKeyType="done"
          onBlur={() => setTexto(t => conBarras(t))}
          accessibilityState={{invalid: Boolean(error)}}
          style={s.input}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Escribe la fecha con día, mes y año"
        />
        {onOpenCalendar ? (
          <Pressable
            onPress={onOpenCalendar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Elegir ${accessibilityLabel.toLowerCase()} en el calendario`}
            style={s.icono}>
            <CalendarDays size={20} color={colors.navy || '#1F2344'} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: radius.m || 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingLeft: space.m || 14,
  },
  cajaError: {borderColor: '#DC2626'},
  input: {flex: 1, fontSize: 16, color: '#1F2344', paddingVertical: 10, letterSpacing: 0.5},
  icono: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  error: {marginTop: 6, fontSize: 12, color: '#B91C1C'},
});

export default FechaInput;
