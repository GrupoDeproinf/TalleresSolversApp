import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../../axiosInstance';
import appColors from '../../themes/appColors';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <MaterialCommunityIcons name={icon} size={16} color={appColors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const TallerInfoScreen = ({ route, navigation }) => {
  const uid_taller = route?.params?.uid_taller;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tallerData, setTallerData] = useState(null);

  const fetchTallerData = useCallback(async () => {
    if (!uid_taller) {
      setError('No se recibio el uid del taller.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/usuarios/getUserByUid', {
        uid: uid_taller,
      });
      const userData = response?.data?.userData || response?.data || null;
      setTallerData(userData);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo cargar la informacion del taller.';
      setError(msg);
      setTallerData(null);
    } finally {
      setLoading(false);
    }
  }, [uid_taller]);

  useEffect(() => {
    fetchTallerData();
  }, [fetchTallerData]);

  const nombre =
    tallerData?.nombre_taller ||
    tallerData?.nombre_empresa ||
    tallerData?.nombre ||
    'Taller';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2344', '#2D3261', '#3F4AA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#1F2344" />
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          {tallerData?.foto_perfil ? (
            <Image source={{ uri: tallerData.foto_perfil }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="storefront-outline" size={30} color="#1F2344" />
          )}
        </View>

        <Text style={styles.heroTitle}>{nombre}</Text>
        <Text style={styles.heroSubtitle}>Perfil del negocio</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={appColors.primary} />
            <Text style={styles.centerText}>Cargando informacion del negocio...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={42} color="#B91C1C" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTallerData} activeOpacity={0.9}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Informacion general</Text>
              <InfoRow icon="storefront-outline" label="Nombre" value={nombre} />
              <InfoRow icon="email-outline" label="Correo" value={tallerData?.email} />
              <InfoRow icon="phone-outline" label="Telefono" value={tallerData?.telefono} />
              <InfoRow icon="map-marker-outline" label="Direccion" value={tallerData?.direccion} />
              <InfoRow icon="badge-account-outline" label="UID" value={uid_taller} />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Detalles del negocio</Text>
              <InfoRow icon="tools" label="Especialidad" value={tallerData?.especialidad} />
              <InfoRow icon="clock-outline" label="Horario" value={tallerData?.horario} />
              <InfoRow icon="check-decagram-outline" label="Estado" value={tallerData?.status} />
              <InfoRow icon="card-account-details-outline" label="RIF / Documento" value={tallerData?.rif} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FF' },
  hero: {
    paddingTop: 34,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 6,
    borderBottomColor: '#FFD60A',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 34,
    backgroundColor: '#FFD60A',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  heroSubtitle: { marginTop: 4, fontSize: 13, color: '#E5E7EB' },
  content: { padding: 16, paddingBottom: 30 },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  centerText: { marginTop: 10, color: appColors.subtitle, fontSize: 13, textAlign: 'center' },
  errorText: { marginTop: 10, color: '#B91C1C', fontSize: 13, textAlign: 'center' },
  retryBtn: {
    marginTop: 14,
    backgroundColor: '#FFD60A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: { color: '#1F2344', fontWeight: '800' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2344',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8FAFF',
    borderRadius: 10,
    padding: 10,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: { fontSize: 11, color: appColors.subtitle, marginBottom: 1 },
  infoValue: { fontSize: 13, color: '#111827', fontWeight: '700' },
});

export default TallerInfoScreen;
