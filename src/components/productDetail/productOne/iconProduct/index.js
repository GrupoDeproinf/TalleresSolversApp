import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import IconBackground from '../../../../commonComponents/iconBackGround';
import {Bus, Refresh} from '../../../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../../../themes/appColors';

const IconProduct = data => {
  const {textColorStyle, linearColorStyle, isDark} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];

  useEffect(() => {
    console.log(
      '...........................................................................',
    );
    console.log('data Metodos: ', data.data);
    console.log(
      '...........................................................................',
    );
  }, []);
  return (
    <View style={[styles.view]}>
      <Text style={[styles.textTitle]}>Métodos de Pago</Text>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.refreshIcon,
          {shadowColor: appColors.shadowColor, borderRadius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          {/* <IconBackground value={<Refresh />} />
          <Text style={[styles.upTofive, {color: textColorStyle}]}>Zelle</Text>
          <View style={styles.verticalLine} />
          <IconBackground value={<Bus />} />
          <Text style={[styles.deliveryIn, {color: textColorStyle}]}>
            Delivery in 3 days
          </Text> */}
          
          <View style={[styles.gridContainer]}>
            
            {Object.entries(data.data || {}).map(([key, value]) => {
              if (value) {
                // Configuración de nombres e íconos por clave
                const config = {
                  efectivo: {name: 'Efectivo', icon: <Text>💵</Text>},
                  pagoMovil: {name: 'Pago Móvil', icon: <Text>📱</Text>},
                  puntoVenta: {name: 'Punto de Venta', icon: <Text>🛒</Text>},
                  tarjetaCreditoI: {
                    name: 'Tarjeta Crédito Internacional',
                    icon: <Text>💳</Text>,
                  },
                  tarjetaCreditoN: {
                    name: 'Tarjeta Crédito Nacional',
                    icon: <Text>💳</Text>,
                  },
                  transferencia: {name: 'Transferencia', icon: <Text>🔄</Text>},
                  zelle: {name: 'Zelle', icon: <Text>💸</Text>},
                  zinli: {name: 'Zinli', icon: <Text>📤</Text>},
                };

                const item = config[key]; // Obtén el nombre e ícono según la clave

                if (!item) {
                  return null; // Ignorar claves no configuradas
                }

                return (
                  <View key={key} style={[styles.gridItem]}>
                    <IconBackground
                      value={item.icon}
                      onPress={() => console.log(key)}
                    />
                    <Text style={[styles.deliveryIn, {color: textColorStyle}]}>
                      {item.name} {/* Mostrar el nombre personalizado */}
                    </Text>
                    
                  </View>
                );
              }
              return null; // Ignorar métodos de pago deshabilitados
            })}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default IconProduct;
