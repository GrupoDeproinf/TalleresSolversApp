// Visor de fotos a pantalla completa: se pasa a la siguiente deslizando,
// se amplía con dos dedos y con doble toque. Lo usa el certificador para
// revisar el RIF y las fotos del taller.
import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector, GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {X} from 'lucide-react-native';
import {fonts, space} from './tokens';

const MAX_ZOOM = 4;

const FotoConZoom = ({uri, ancho, alto, onZoom}) => {
  const escala = useSharedValue(1);
  const escalaBase = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const xBase = useSharedValue(0);
  const yBase = useSharedValue(0);
  const [ampliada, setAmpliada] = useState(false);

  const avisar = v => {
    setAmpliada(v);
    onZoom(v);
  };

  const limitar = (valor, s, lado) => {
    'worklet';
    const max = ((s - 1) * lado) / 2;
    return Math.min(max, Math.max(-max, valor));
  };

  const reiniciar = () => {
    'worklet';
    escala.value = withTiming(1);
    escalaBase.value = 1;
    x.value = withTiming(0);
    y.value = withTiming(0);
    xBase.value = 0;
    yBase.value = 0;
    runOnJS(avisar)(false);
  };

  const pellizco = Gesture.Pinch()
    .onUpdate(e => {
      escala.value = Math.min(MAX_ZOOM, Math.max(1, escalaBase.value * e.scale));
    })
    .onEnd(() => {
      if (escala.value <= 1.02) {
        reiniciar();
      } else {
        escalaBase.value = escala.value;
        x.value = limitar(x.value, escala.value, ancho);
        y.value = limitar(y.value, escala.value, alto);
        xBase.value = x.value;
        yBase.value = y.value;
        runOnJS(avisar)(true);
      }
    });

  // Mover la foto solo cuando está ampliada; si no, el deslizamiento es para
  // pasar a la siguiente.
  const arrastre = Gesture.Pan()
    .enabled(ampliada)
    .onUpdate(e => {
      x.value = limitar(xBase.value + e.translationX, escala.value, ancho);
      y.value = limitar(yBase.value + e.translationY, escala.value, alto);
    })
    .onEnd(() => {
      xBase.value = x.value;
      yBase.value = y.value;
    });

  const dobleToque = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (escalaBase.value > 1) {
        reiniciar();
      } else {
        escala.value = withTiming(2.5);
        escalaBase.value = 2.5;
        runOnJS(avisar)(true);
      }
    });

  const estilo = useAnimatedStyle(() => ({
    transform: [{translateX: x.value}, {translateY: y.value}, {scale: escala.value}],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pellizco, arrastre, dobleToque)}>
      <Animated.View style={[{width: ancho, height: alto}, estilo]}>
        <Image source={{uri}} style={{width: ancho, height: alto}} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
};

/**
 * @param fotos [{uri, label}]
 * @param inicio índice de la foto que se abre
 */
const VisorFotos = ({visible, fotos = [], inicio = 0, onClose}) => {
  const {width, height} = useWindowDimensions();
  const [indice, setIndice] = useState(inicio);
  const [zoom, setZoom] = useState(false);
  const lista = useRef(null);

  useEffect(() => {
    if (visible) {
      setIndice(inicio);
      setZoom(false);
    }
  }, [visible, inicio]);

  const actual = fotos[indice];
  const altoFoto = height - 160;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={st.fondo}>
        <StatusBar barStyle="light-content" />
        <View style={st.cabecera}>
          <View style={{flex: 1}}>
            <Text style={st.titulo} numberOfLines={1}>
              {actual?.label || 'Foto'}
            </Text>
            {fotos.length > 1 ? (
              <Text style={st.sub}>
                {indice + 1} de {fotos.length}
                {zoom ? ' · Toca dos veces para volver' : ' · Desliza para ver la siguiente'}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10} style={st.cerrar}>
            <X size={22} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
        {/* La clave remonta la lista al abrir: así siempre arranca en la foto tocada. */}
        <FlatList
          key={visible ? `abierto-${inicio}-${fotos.length}` : 'cerrado'}
          ref={lista}
          data={fotos}
          horizontal
          pagingEnabled
          scrollEnabled={!zoom}
          initialScrollIndex={Math.min(inicio, Math.max(0, fotos.length - 1))}
          getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f, i) => `${f.uri}-${i}`}
          onMomentumScrollEnd={e => setIndice(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({item, index}) => (
            <View style={{width, height: altoFoto, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
              {Math.abs(index - indice) <= 1 ? (
                <FotoConZoom uri={item.uri} ancho={width} alto={altoFoto} onZoom={setZoom} />
              ) : null}
            </View>
          )}
        />
        <Text style={st.ayuda}>Pellizca o toca dos veces para ampliar</Text>
      </GestureHandlerRootView>
    </Modal>
  );
};

const st = StyleSheet.create({
  fondo: {flex: 1, backgroundColor: 'rgba(8,10,26,0.96)'},
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: space.m,
    paddingBottom: space.m,
    gap: space.m,
  },
  titulo: {fontFamily: fonts.bold, fontSize: 17, color: '#FFFFFF'},
  sub: {fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  cerrar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayuda: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingVertical: space.l,
  },
});

export default VisorFotos;
