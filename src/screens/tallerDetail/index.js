"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import {
  ArrowLeft,
  MapPin,
  Phone,
  Wrench,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Mail,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Share2,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react-native"
import api from "../../../axiosInstance"

const { width, height } = Dimensions.get("window")

const TallerDetail = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { tallerId, tallerData } = route.params || {}

  const [taller, setTaller] = useState(tallerData || {})
  const [loading, setLoading] = useState(false)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [showTallerInfo, setShowTallerInfo] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [showTarifas, setShowTarifas] = useState(false)
  const [paymentMethodsAnimation] = useState(new Animated.Value(0))
  const [tallerInfoAnimation] = useState(new Animated.Value(0))
  const [experienceAnimation] = useState(new Animated.Value(0))
  const [tarifasAnimation] = useState(new Animated.Value(0))

  // Métodos de pago disponibles (puedes ajustar según los datos reales del taller)
  const paymentMethods = [
    { id: 1, name: "Efectivo", icon: "Banknote", color: "#10B981" },
    { id: 2, name: "Tarjeta de Crédito", icon: "CreditCard", color: "#3B82F6" },
    { id: 3, name: "Tarjeta de Débito", icon: "CreditCard", color: "#8B5CF6" },
    { id: 4, name: "Transferencia Bancaria", icon: "Wallet", color: "#F59E0B" },
    { id: 5, name: "Pago Móvil", icon: "Phone", color: "#EF4444" },
  ]

  useEffect(() => {
    if (tallerId && !tallerData) {
      fetchTallerData()
    }
  }, [tallerId])

  useEffect(() => {
    Animated.timing(paymentMethodsAnimation, {
      toValue: showPaymentMethods ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [showPaymentMethods])

  useEffect(() => {
    Animated.timing(tallerInfoAnimation, {
      toValue: showTallerInfo ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [showTallerInfo])

  useEffect(() => {
    Animated.timing(experienceAnimation, {
      toValue: showExperience ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [showExperience])

  useEffect(() => {
    Animated.timing(tarifasAnimation, {
      toValue: showTarifas ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [showTarifas])

  const fetchTallerData = async () => {
    setLoading(true)
    try {
      const response = await api.post("/usuarios/getUser+ByUid", {
        uid: tallerId,
      })

      if (response.data.message === "Usuario encontrado") {
        setTaller(response.data.userData)
      }
    } catch (error) {
      console.error("Error al obtener datos del taller:", error)
      Alert.alert("Error", "No se pudieron cargar los datos del taller")
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    if (taller.phone) {
      Linking.openURL(`tel:${taller.phone}`)
    } else {
      Alert.alert("Teléfono no disponible", "Este taller no tiene número de teléfono registrado.")
    }
  }

  const handleWhatsApp = () => {
    if (taller.whatsapp) {
      const phoneNumber = taller.whatsapp.replace(/[^\d]/g, "")
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`)
    } else {
      Alert.alert("WhatsApp no disponible", "Este taller no tiene WhatsApp registrado.")
    }
  }

  const handleEmail = () => {
    if (taller.email) {
      Linking.openURL(`mailto:${taller.email}`)
    } else {
      Alert.alert("Email no disponible", "Este taller no tiene email registrado.")
    }
  }

  const handleLocation = () => {
    if (taller.ubicacion && taller.ubicacion.lat && taller.ubicacion.lng) {
      const url = `https://www.google.com/maps?q=${taller.ubicacion.lat},${taller.ubicacion.lng}`
      Linking.openURL(url)
    } else {
      Alert.alert("Ubicación no disponible", "Este taller no tiene ubicación registrada.")
    }
  }

  const togglePaymentMethods = () => {
    setShowPaymentMethods(!showPaymentMethods)
  }

  const toggleTallerInfo = () => {
    setShowTallerInfo(!showTallerInfo)
  }

  const toggleExperience = () => {
    setShowExperience(!showExperience)
  }

  const toggleTarifas = () => {
    setShowTarifas(!showTarifas)
  }

  const handleSocialMedia = (platform, url) => {
    if (url) {
      Linking.openURL(url)
    } else {
      Alert.alert(`${platform} no disponible`, `Este taller no tiene ${platform} registrado.`)
    }
  }

  const getPaymentIcon = (iconName) => {
    switch (iconName) {
      case "Banknote":
        return <Banknote size={20} color="#6B7280" />
      case "CreditCard":
        return <CreditCard size={20} color="#6B7280" />
      case "Wallet":
        return <Wallet size={20} color="#6B7280" />
      case "Phone":
        return <Phone size={20} color="#6B7280" />
      default:
        return <DollarSign size={20} color="#6B7280" />
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando información del taller...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle del Taller</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {taller.image_perfil ? (
              <Image source={{ uri: taller.image_perfil }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Wrench size={40} color="#6B7280" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.tallerName}>{taller.nombre || "Nombre del Taller"}</Text>
            </View>

            <Text style={styles.tallerEmail}>{taller.email || "contacto@taller.com"}</Text>

            {taller.descripcion && <Text style={styles.tallerDescription}>{taller.descripcion}</Text>}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Star size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>4.5</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Clock size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{taller.Experiencia ? taller.Experiencia : "N/A"}</Text>
            <Text style={styles.statLabel}>Experiencia</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, !taller.phone && styles.actionButtonDisabled]}
            onPress={handleCall}
            disabled={!taller.phone}
          >
            <View style={styles.actionIconContainer}>
              <Phone size={22} color={taller.phone ? "#3B82F6" : "#9CA3AF"} />
            </View>
            <Text style={[styles.actionText, !taller.phone && styles.actionTextDisabled]}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !taller.whatsapp && styles.actionButtonDisabled]}
            onPress={handleWhatsApp}
            disabled={!taller.whatsapp}
          >
            <View style={styles.actionIconContainer}>
              <MessageCircle size={22} color={taller.whatsapp ? "#25D366" : "#9CA3AF"} />
            </View>
            <Text style={[styles.actionText, !taller.whatsapp && styles.actionTextDisabled]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              (!taller.ubicacion?.lat || !taller.ubicacion?.lng) && styles.actionButtonDisabled,
            ]}
            onPress={handleLocation}
            disabled={!taller.ubicacion?.lat || !taller.ubicacion?.lng}
          >
            <View style={styles.actionIconContainer}>
              <MapPin size={22} color={taller.ubicacion?.lat && taller.ubicacion?.lng ? "#EF4444" : "#9CA3AF"} />
            </View>
            <Text
              style={[
                styles.actionText,
                (!taller.ubicacion?.lat || !taller.ubicacion?.lng) && styles.actionTextDisabled,
              ]}
            >
              Ubicación
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !taller.email && styles.actionButtonDisabled]}
            onPress={handleEmail}
            disabled={!taller.email}
          >
            <View style={styles.actionIconContainer}>
              <Mail size={22} color={taller.email ? "#8B5CF6" : "#9CA3AF"} />
            </View>
            <Text style={[styles.actionText, !taller.email && styles.actionTextDisabled]}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>INFORMACIÓN</Text>

          <TouchableOpacity style={styles.infoItem} onPress={toggleTallerInfo}>
            <View style={styles.infoItemLeft}>
              <View style={styles.infoIcon}>
                <Wrench size={18} color="#6B7280" />
              </View>
              <Text style={styles.infoText}>Información del Taller</Text>
            </View>
            {showTallerInfo ? <ChevronDown size={18} color="#9CA3AF" /> : <ChevronRight size={18} color="#9CA3AF" />}
          </TouchableOpacity>

          {/* Taller Info Dropdown */}
          <Animated.View
            style={[
              styles.infoDropdown,
              {
                maxHeight: tallerInfoAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 300],
                }),
                opacity: tallerInfoAnimation,
              },
            ]}
          >
            <View style={styles.infoContent}>
              {taller.nombre && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombre:</Text>
                  <Text style={styles.infoValue}>{taller.nombre}</Text>
                </View>
              )}
              {taller.rif && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>RIF:</Text>
                  <Text style={styles.infoValue}>{taller.rif}</Text>
                </View>
              )}
              {taller.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{taller.email}</Text>
                </View>
              )}
              {taller.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono:</Text>
                  <Text style={styles.infoValue}>{taller.phone}</Text>
                </View>
              )}
              {taller.Direccion && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dirección:</Text>
                  <Text style={styles.infoValue}>{taller.Direccion}</Text>
                </View>
              )}
              {taller.estado && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado:</Text>
                  <Text style={styles.infoValue}>{taller.estado}</Text>
                </View>
              )}
              {taller.RegComercial && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Registro Comercial:</Text>
                  <Text style={styles.infoValue}>{taller.RegComercial}</Text>
                </View>
              )}
              {taller.Caracteristicas && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Características:</Text>
                  <Text style={styles.infoValue}>{taller.Caracteristicas}</Text>
                </View>
              )}
              {taller.Garantia && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Garantía:</Text>
                  <Text style={styles.infoValue}>{taller.Garantia}</Text>
                </View>
              )}
              {taller.seguro && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Seguro:</Text>
                  <Text style={styles.infoValue}>{taller.seguro}</Text>
                </View>
              )}
              {!taller.nombre && !taller.rif && !taller.email && !taller.phone && !taller.Direccion && !taller.estado && !taller.RegComercial && !taller.Caracteristicas && !taller.Garantia && !taller.seguro && (
                <View style={styles.emptyInfo}>
                  <Text style={styles.emptyInfoText}>No hay información adicional disponible</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {taller.Experiencia && (
            <TouchableOpacity style={styles.infoItem} onPress={toggleExperience}>
              <View style={styles.infoItemLeft}>
                <View style={styles.infoIcon}>
                  <Clock size={18} color="#6B7280" />
                </View>
                <Text style={styles.infoText}>Experiencia</Text>
              </View>
              {showExperience ? <ChevronDown size={18} color="#9CA3AF" /> : <ChevronRight size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          )}

          {/* Experience Dropdown */}
          {taller.Experiencia && (
            <Animated.View
              style={[
                styles.infoDropdown,
                {
                  maxHeight: experienceAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                  }),
                  opacity: experienceAnimation,
                },
              ]}
            >
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Experiencia:</Text>
                  <Text style={styles.infoValue}>{taller.Experiencia}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {taller.Tarifa && (
            <TouchableOpacity style={styles.infoItem} onPress={toggleTarifas}>
              <View style={styles.infoItemLeft}>
                <View style={styles.infoIcon}>
                  <DollarSign size={18} color="#6B7280" />
                </View>
                <Text style={styles.infoText}>Tarifas</Text>
              </View>
              {showTarifas ? <ChevronDown size={18} color="#9CA3AF" /> : <ChevronRight size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          )}

          {/* Tarifas Dropdown */}
          {taller.Tarifa && (
            <Animated.View
              style={[
                styles.infoDropdown,
                {
                  maxHeight: tarifasAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                  }),
                  opacity: tarifasAnimation,
                },
              ]}
            >
              <View style={styles.infoContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tarifas:</Text>
                  <Text style={styles.infoValue}>{taller.Tarifa}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          <TouchableOpacity style={styles.infoItem} onPress={togglePaymentMethods}>
            <View style={styles.infoItemLeft}>
              <View style={styles.infoIcon}>
                <DollarSign size={18} color="#6B7280" />
              </View>
              <Text style={styles.infoText}>Métodos de Pago</Text>
            </View>
            {showPaymentMethods ? <ChevronDown size={18} color="#9CA3AF" /> : <ChevronRight size={18} color="#9CA3AF" />}
          </TouchableOpacity>

          {/* Payment Methods Dropdown */}
          <Animated.View
            style={[
              styles.paymentMethodsDropdown,
              {
                maxHeight: paymentMethodsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, paymentMethods.length * 60],
                }),
                opacity: paymentMethodsAnimation,
              },
            ]}
          >
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, { backgroundColor: method.color + '20' }]}>
                    {getPaymentIcon(method.icon)}
                  </View>
                  <Text style={styles.paymentMethodText}>{method.name}</Text>
                </View>
                <View style={[styles.paymentMethodStatus, { backgroundColor: method.color }]} />
              </View>
            ))}
          </Animated.View>

          {/* Redes Sociales */}
          {(taller.LinkFacebook || taller.LinkInstagram || taller.LinkTiktok) && (
            <View style={styles.socialSection}>
              <Text style={styles.sectionTitle}>REDES SOCIALES</Text>
              <View style={styles.socialButtons}>
                {taller.LinkFacebook && (
                  <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                    onPress={() => handleSocialMedia('Facebook', taller.LinkFacebook)}
                  >
                    <Facebook size={20} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Facebook</Text>
                  </TouchableOpacity>
                )}
                
                {taller.LinkInstagram && (
                  <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                    onPress={() => handleSocialMedia('Instagram', taller.LinkInstagram)}
                  >
                    <Instagram size={20} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Instagram</Text>
                  </TouchableOpacity>
                )}
                
                {taller.LinkTiktok && (
                  <TouchableOpacity 
                    style={[styles.socialButton, { backgroundColor: '#000000' }]}
                    onPress={() => handleSocialMedia('TikTok', taller.LinkTiktok)}
                  >
                    <Youtube size={20} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>TikTok</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#1E40AF",
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#E5E7EB",
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#E5E7EB",
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tallerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  tallerEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  tallerDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  actionsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  actionTextDisabled: {
    color: "#9CA3AF",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  paymentMethodsDropdown: {
    overflow: "hidden",
  },
  paymentMethodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  paymentMethodStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoDropdown: {
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  socialSection: {
    marginTop: 24,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 8,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: Math.min(120, width * 0.25),
    justifyContent: "center",
    gap: 8,
    flex: 1,
    maxWidth: 150,
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyInfoText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
})

export default TallerDetail
