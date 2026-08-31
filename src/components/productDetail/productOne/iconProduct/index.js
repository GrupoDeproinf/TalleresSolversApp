import {Text, View} from 'react-native';
import React from 'react';
import styles from './style.css';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const IconProduct = data => {
  const methodsEnabled = Object.entries(data.data || {})
    .filter(([, value]) => !!value)
    .map(([key]) => {
      const config = {
        transferencia: {name: 'Transferencia Bancaria', icon: 'wallet-outline'},
        pagoMovil: {name: 'Pago Móvil', icon: 'phone-outline'},
        efectivo: {name: 'Efectivo', icon: 'cash'},
        zelle: {name: 'Zelle / Divisas', icon: 'credit-card-outline'},
        puntoVenta: {name: 'Punto de Venta', icon: 'credit-card-outline'},
        tarjetaCreditoN: {name: 'Tarjeta Crédito Nacional', icon: 'credit-card-outline'},
        tarjetaCreditoI: {name: 'Tarjeta Crédito Internacional', icon: 'credit-card-outline'},
        zinli: {name: 'Zinli', icon: 'wallet-plus-outline'},
      };
      return config[key] || null;
    })
    .filter(Boolean);

  return (
    <View style={styles.paymentCard}>
      <Text style={[styles.textTitle]}>Métodos de Pago</Text>
      <View style={styles.gridContainer}>
        {methodsEnabled.map((item, idx) => (
          <View style={styles.gridItem} key={`${item.name}-${idx}`}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color="#1F2344"
              />
            </View>
            <Text style={styles.deliveryIn}>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default IconProduct;
