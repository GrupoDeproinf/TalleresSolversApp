import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';
import {Search} from '../../../assets/icons/search';
import api from '../../../../axiosInstance';

const {width} = Dimensions.get('window');
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (width - H_PAD * 2 - CARD_GAP) / 2;

const AnimatedCard = ({item, index, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
        tension: 70,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 260,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(pressAnim, {toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10}).start();

  const handlePressOut = () =>
    Animated.spring(pressAnim, {toValue: 1, useNativeDriver: true, tension: 300, friction: 10}).start();

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{scale: scaleAnim}, {scale: pressAnim}],
        width: CARD_WIDTH,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}>
        <View style={styles.imageContainer}>
          <Image style={styles.cardImage} source={{uri: item.imageUrl}} resizeMode="cover" />
          <View style={styles.imageOverlay} />
          <View style={styles.accentDot} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {String(item?.nombre || '').toUpperCase()}
          </Text>
          <View style={styles.cardArrow}>
            <Text style={styles.cardArrowText}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductContainer = () => {
  const {isDark} = useValues();
  const navigation = useNavigation('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const getCategories = async () => {
    try {
      const response = await api.get('/usuarios/getActiveCategories', {
        headers: {'Content-Type': 'application/json'},
      });
      if (response.status === 200 && response.data) {
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      } else {
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      setCategories([]);
      setFilteredCategories([]);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleSearchChange = text => {
    setSearchText(text);
    setFilteredCategories(
      categories.filter(cat => cat.nombre.toLowerCase().includes(text.toLowerCase())),
    );
  };

  const bg          = isDark ? '#1F2344' : '#F8F9FC';
  const textPrimary = isDark ? '#F9FAFB' : '#111827';
  const textSub     = isDark ? '#9CA3AF' : '#6B7280';
  const searchBg    = isDark ? '#1F2344' : '#FFFFFF';
  const borderColor = isDark ? '#2A2E56' : '#E5E7EB';

  const ListHeader = () => (
    <View>
      {/* ── HEADER ── */}
      <View style={styles.headerBlock}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Pill + contador en la misma fila */}
        <View style={styles.headerTopRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>🛠  Servicios</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredCategories.length} disponibles</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>
          {'Estas son las '}
          <Text style={styles.headerAccent}>categorías</Text>
        </Text>

        <Text style={styles.headerSubtitle}>
          Encuentra el servicio que necesitas de forma rápida y sencilla
        </Text>
      </View>

      {/* ── BUSCADOR ── */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: searchBg,
            borderColor: isFocused ? '#FFD60A' : borderColor,
            shadowColor: isFocused ? '#FFD60A' : '#1F2344',
            shadowOpacity: isFocused ? 0.22 : 0.06,
          },
        ]}>
        <Search color={isFocused ? '#FFD60A' : textSub} size={17} />
        <TextInput
          placeholder="Buscar categoría..."
          placeholderTextColor={textSub}
          style={[styles.searchInput, {color: textPrimary}]}
          onChangeText={handleSearchChange}
          value={searchText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Text style={[styles.clearBtn, {color: textSub}]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderItem = ({item, index}) => (
    <AnimatedCard
      item={item}
      index={index}
      onPress={() => navigation.navigate('CategoryDetail', {uid: item.id})}
    />
  );

  return (
    <View style={[styles.root, {backgroundColor: bg}]}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2344" />
      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, {color: textSub}]}>
              {(() => {
                const value = `sin resultados para "${searchText}"`;
                const lower = value.toLowerCase();
                return lower.charAt(0).toUpperCase() + lower.slice(1);
              })()}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},

  /* ── Header ── */
  headerBlock: {
    backgroundColor: '#1F2344',
    paddingHorizontal: H_PAD,
    paddingTop: 20,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,214,10,0.06)',
    top: -50,
    right: -30,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,214,10,0.05)',
    bottom: -20,
    left: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pill: {
    backgroundColor: 'rgba(255,214,10,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,10,0.3)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  pillText: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: 'rgba(249,250,251,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  headerAccent: {
    color: '#FFD60A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(249,250,251,0.55)',
    lineHeight: 19,
  },

  /* ── Buscador ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginTop: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 13,
    paddingHorizontal: 2,
  },

  /* ── Lista ── */
  listContent: {
    paddingBottom: 36,
  },
  row: {
    paddingHorizontal: H_PAD,
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },

  /* ── Card ── */
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#1F2344',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(9,13,46,0.2)',
  },
  accentDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFD60A',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2344',
    lineHeight: 17,
    paddingRight: 6,
  },
  cardArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F2344',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowText: {
    color: '#FFD60A',
    fontSize: 17,
    fontWeight: '800',
    marginTop: -1,
  },

  /* ── Empty ── */
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {fontSize: 40},
  emptyText: {fontSize: 14},
});

export default ProductContainer;
