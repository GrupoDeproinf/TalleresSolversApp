import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, MapPin, Navigation, Wrench, CreditCard, DollarSign, Route } from 'lucide-react-native';

const NearlyTallerItem = ({ key, item, onPress, navigation, onRoutePress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const handleRoutePress = () => {
    if (onRoutePress) {
      onRoutePress(item);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.gradientBackground}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Wrench size={18} color="#FFFFFF" />
          </View>
          
          <View style={styles.leftContent}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {item?.nombre || 'AutoFix Pro'}
              </Text>
              <View style={styles.distanceBadge}>
                <Navigation size={10} color="#3A4A85" />
                <Text style={styles.distance}>{item?.distancia || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.addressContainer}>
              <MapPin size={12} color="#64748B" />
              <Text style={styles.address} numberOfLines={1}>
                {item?.direccion || 'Dirección no disponible'}
              </Text>
            </View>
            
            {item?.estado && (
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.estado}</Text>
              </View>
            )}
            
            {item?.metodosPago && (
              <View style={styles.paymentMethodsContainer}>
                <DollarSign size={10} color="#64748B" />
                <Text style={styles.paymentMethodsText}>
                  {Object.values(item.metodosPago).filter(Boolean).length} métodos de pago
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.rightContent}>
            <TouchableOpacity 
              style={styles.routeButton}
              onPress={handleRoutePress}
              activeOpacity={0.7}
            >
              <MapPin size={16} color="#162556" />
            </TouchableOpacity>
            
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#3A4A85',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientBackground: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A4A85',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3A4A85',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
    marginRight: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D9E8',
    minWidth: 50,
  },
  distance: {
    fontSize: 10,
    color: '#3A4A85',
    marginLeft: 3,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  address: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F9A825',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '600',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentMethodsText: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  rightContent: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffca00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffca00',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffca00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffca00',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default NearlyTallerItem;