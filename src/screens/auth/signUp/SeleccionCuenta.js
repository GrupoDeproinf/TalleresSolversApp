// Primera pantalla del registro: elegir si la cuenta es personal o de un negocio.
// Sigue la línea gráfica de la campaña (azul marino, amarillo, huella de
// neumático y titular inclinado) y deja las dos opciones a la vista sin
// tener que desplazar, también en teléfonos pequeños.
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Respuesta al toque: se hunde un poco al presionar (120 ms, salida rápida).
const SALIDA = Easing.bezier(0.23, 1, 0.32, 1);
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {brand} from '../../../ui/tokens';

const GRIS = '#5B6478';
const FONDO = '#F4F5F9';

const Opcion = ({
  icono,
  etiqueta,
  titulo,
  descripcion,
  ventajas,
  destacada,
  onPress,
  indice = 0,
}) => {
  const escala = useRef(new Animated.Value(1)).current;
  // Entrada al abrir la pantalla: sube y aparece, una tarjeta tras otra.
  const entrada = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 280,
      delay: 60 + indice * 70,
      easing: SALIDA,
      useNativeDriver: true,
    }).start();
  }, [entrada, indice]);
  const presion = v =>
    Animated.timing(escala, {toValue: v, duration: 120, easing: SALIDA, useNativeDriver: true}).start();
  const subir = entrada.interpolate({inputRange: [0, 1], outputRange: [16, 0]});
  return (
  <Pressable
    onPress={onPress}
    onPressIn={() => presion(0.97)}
    onPressOut={() => presion(1)}
    accessibilityRole="button"
    accessibilityLabel={`${titulo}. ${descripcion}`}>
  <Animated.View
    style={[
      s.tarjeta,
      destacada && s.tarjetaDestacada,
      {opacity: entrada, transform: [{translateY: subir}, {scale: escala}]},
    ]}>
    <View style={s.tarjetaFila}>
      <View style={[s.icono, destacada ? s.iconoAmarillo : s.iconoMarino]}>
        <MaterialCommunityIcons
          name={icono}
          size={30}
          color={destacada ? brand.navy : brand.yellow}
        />
      </View>
      <View style={s.tarjetaTexto}>
        <Text style={s.etiqueta}>{etiqueta}</Text>
        <Text style={s.titulo}>{titulo}</Text>
      </View>
      <View style={s.flecha}>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={brand.navy}
        />
      </View>
    </View>
    <Text style={s.descripcion}>{descripcion}</Text>
    <View style={s.ventajas}>
      {ventajas.map(v => (
        <View key={v} style={s.ventaja}>
          <MaterialCommunityIcons
            name="check-circle"
            size={14}
            color={brand.navy}
          />
          <Text style={s.ventajaTexto}>{v}</Text>
        </View>
      ))}
    </View>
  </Animated.View>
  </Pressable>
  );
};

const SeleccionCuenta = ({onCliente, onNegocio, onIniciarSesion}) => {
  const insets = useSafeAreaInsets();
  // En Android con barra translúcida el área segura puede venir en cero.
  const barra = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const arriba = Math.max(insets.top || 0, barra);

  return (
    <View style={s.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor={brand.navy} />

      <View style={[s.hero, {paddingTop: arriba + 22}]}>
        <Image
          source={require('../../../assets/brand/huella-amarilla.png')}
          style={s.huella}
          resizeMode="contain"
          accessible={false}
        />
        <View style={s.pastilla}>
          <Text style={s.pastillaTexto}>CREA TU CUENTA</Text>
        </View>
        <Text style={s.titular}>
          ¿CÓMO VAS A USAR <Text style={s.titularAmarillo}>SOLVERS</Text>?
        </Text>
        <Text style={s.bajada}>Elige una opción para empezar.</Text>
      </View>

      <ScrollView
        style={s.cuerpo}
        contentContainerStyle={s.cuerpoContenido}
        showsVerticalScrollIndicator={false}>
        <Opcion
          icono="car-side"
          etiqueta="SOLUCIONES PARA TI"
          titulo="Busco servicios para mi carro"
          descripcion="Encuentra talleres de confianza cerca de ti y lleva el control del cuidado de tu vehículo."
          ventajas={['Pide servicios', 'Agenda citas', 'Mantenimientos']}
          onPress={onCliente}
        />
        <Opcion
          destacada
          icono="garage-variant"
          etiqueta="PARA TU NEGOCIO AUTOMOTRIZ"
          titulo="Ofrezco servicios automotrices"
          descripcion="Registra tu taller, muestra tus servicios y conecta con conductores que te necesitan."
          ventajas={['Empieza gratis', 'Publica servicios', 'Más clientes']}
          onPress={onNegocio}
          indice={1}
        />
        <Text style={s.promesa}>{brand.promise}</Text>
      </ScrollView>

      <View style={[s.pie, {paddingBottom: Math.max(insets.bottom, 14)}]}>
        <Text style={s.pieTexto}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity
          style={s.pieBoton}
          activeOpacity={0.8}
          onPress={onIniciarSesion}
          accessibilityRole="button">
          <Text style={s.pieBotonTexto}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  pantalla: {flex: 1, backgroundColor: FONDO},

  hero: {
    backgroundColor: brand.navy,
    paddingHorizontal: 24,
    paddingBottom: 46,
    borderBottomWidth: 5,
    borderBottomColor: brand.yellow,
    overflow: 'hidden',
  },
  huella: {
    position: 'absolute',
    right: -130,
    bottom: -26,
    width: 400,
    height: 122,
    opacity: 0.2,
  },
  pastilla: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(252,200,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(252,200,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  pastillaTexto: {
    color: brand.yellow,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  titular: {
    color: '#FFFFFF',
    fontFamily: brand.headlineFont,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: 0.2,
  },
  titularAmarillo: {color: brand.yellow},
  bajada: {
    color: '#D5D9EC',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginTop: 6,
  },

  cuerpo: {flex: 1, marginTop: -30},
  cuerpoContenido: {paddingHorizontal: 18, paddingBottom: 12},

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(21,29,97,0.08)',
    elevation: 4,
    shadowColor: brand.navyDeep,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tarjetaDestacada: {
    borderColor: brand.yellow,
    borderWidth: 1.5,
  },
  tarjetaFila: {flexDirection: 'row', alignItems: 'center'},
  icono: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoMarino: {backgroundColor: brand.navy},
  iconoAmarillo: {backgroundColor: brand.yellow},
  tarjetaTexto: {flex: 1, marginLeft: 14},
  etiqueta: {
    color: GRIS,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10.5,
    letterSpacing: 1.3,
  },
  titulo: {
    color: brand.navy,
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  flecha: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  descripcion: {
    color: GRIS,
    fontFamily: 'Poppins-Regular',
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 12,
  },
  ventajas: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  ventaja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF0F8',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  ventajaTexto: {
    color: brand.navy,
    fontFamily: 'Poppins-Medium',
    fontSize: 11.5,
    marginLeft: 4,
  },

  promesa: {
    textAlign: 'center',
    color: brand.navy,
    fontFamily: 'Poppins-SemiBoldItalic',
    fontSize: 13,
    opacity: 0.75,
    marginTop: 4,
  },

  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(21,29,97,0.08)',
  },
  pieTexto: {
    color: GRIS,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginRight: 10,
  },
  pieBoton: {
    borderWidth: 1.5,
    borderColor: brand.navy,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  pieBotonTexto: {
    color: brand.navy,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});

export default SeleccionCuenta;
