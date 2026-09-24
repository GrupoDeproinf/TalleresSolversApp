// Términos y Condiciones de Solvers (extraído de signUp para reutilizarlo en
// los registros nuevos de conductor y taller).
import React from 'react';
import {Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform} from 'react-native';
import Icons2 from 'react-native-vector-icons/Ionicons';

const TermsModal = ({visible, onClose, onAccept, acceptLabel}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={termsStyles.overlay}>
      <View style={termsStyles.sheet}>
        {/* Header */}
        <View style={termsStyles.header}>
          <View style={termsStyles.headerAccent} />
          <Text style={termsStyles.headerTitle}>Términos y Condiciones</Text>
          <TouchableOpacity
            style={termsStyles.closeBtn}
            onPress={onClose}
          >
            <Icons2 name="close" size={22} color="#1D1E56" />
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={termsStyles.scroll}
          contentContainerStyle={termsStyles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={termsStyles.updated}>Última actualización: 29 de enero de 2025</Text>
          <Text style={termsStyles.body}>
            En SOLVERS, valoramos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política de privacidad describe cómo recopilamos, usamos, compartimos y protegemos la información que obtenemos de ti al utilizar nuestra aplicación.
          </Text>

          <Text style={termsStyles.sectionTitle}>1. Información que recopilamos</Text>
          <Text style={termsStyles.body}>
            Cuando utilizas SOLVERS, podemos recopilar la siguiente información:
          </Text>
          <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Información personal:</Text> Nombre, dirección de correo electrónico, número de teléfono y cualquier otra información que decidas proporcionarnos al registrarte o utilizar nuestros servicios.</Text>
          <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Información de ubicación:</Text> Para ofrecerte una mejor experiencia, podemos acceder a tu ubicación a través de Google Maps para mostrarte los talleres mecánicos más cercanos.</Text>
          <Text style={termsStyles.bullet}>– <Text style={termsStyles.bulletBold}>Datos de uso:</Text> Información sobre cómo utilizas la aplicación, incluyendo las funciones que utilizas y el tiempo que pasas en la app.</Text>

          <Text style={termsStyles.sectionTitle}>2. Cómo utilizamos tu información</Text>
          <Text style={termsStyles.body}>Utilizamos la información que recopilamos para:</Text>
          <Text style={termsStyles.bullet}>– Proporcionar y mejorar nuestros servicios.</Text>
          <Text style={termsStyles.bullet}>– Facilitar la búsqueda y gestión de talleres mecánicos.</Text>
          <Text style={termsStyles.bullet}>– Enviar notificaciones sobre promociones, actualizaciones y novedades relacionadas con la app.</Text>
          <Text style={termsStyles.bullet}>– Responder a tus consultas y brindar soporte al cliente.</Text>

          <Text style={termsStyles.sectionTitle}>3. Compartir tu información</Text>
          <Text style={termsStyles.body}>No compartimos tu información personal con terceros, excepto en las siguientes circunstancias:</Text>
          <Text style={termsStyles.bullet}>– Con tu consentimiento.</Text>
          <Text style={termsStyles.bullet}>– Con proveedores de servicios que nos ayudan a operar la app y que están obligados a proteger tu información.</Text>
          <Text style={termsStyles.bullet}>– Cuando sea requerido por la ley o para proteger nuestros derechos.</Text>

          <Text style={termsStyles.sectionTitle}>4. Seguridad de la información</Text>
          <Text style={termsStyles.body}>
            Implementamos medidas de seguridad adecuadas para proteger tu información personal contra el acceso no autorizado, la divulgación, la alteración o la destrucción. Sin embargo, ten en cuenta que ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
          </Text>

          <Text style={termsStyles.sectionTitle}>5. Tus derechos</Text>
          <Text style={termsStyles.body}>
            Tienes derecho a acceder, corregir o eliminar tu información personal. Si deseas ejercer estos derechos, por favor contáctanos a través de solverstalleres@gmail.com.
          </Text>

          <Text style={termsStyles.sectionTitle}>6. Cambios a esta política de privacidad</Text>
          <Text style={termsStyles.body}>
            Podemos actualizar esta política de privacidad de vez en cuando. Te notificaremos sobre cualquier cambio publicando la nueva política en la app. Te recomendamos revisar esta política periódicamente para estar al tanto de cómo protegemos tu información.
          </Text>

          <Text style={termsStyles.sectionTitle}>7. Contacto</Text>
          <Text style={termsStyles.body}>
            Si tienes preguntas o inquietudes sobre esta política de privacidad, no dudes en contactarnos a través de solverstalleres@gmail.com.
          </Text>
        </ScrollView>

        {/* Footer buttons */}
        <View style={termsStyles.footer}>
          <TouchableOpacity
            style={termsStyles.declineBtn}
            onPress={onClose}
          >
            <Text style={termsStyles.declineBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={termsStyles.acceptBtn}
            onPress={onAccept}
          >
            <Icons2 name="checkmark-circle-outline" size={18} color="#1D1E56" style={{ marginRight: 6 }} />
            <Text style={termsStyles.acceptBtnText}>{acceptLabel || 'Acepto y continuar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const termsStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,14,45,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#1D1E56',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F8',
    backgroundColor: '#FFFFFF',
  },
  headerAccent: {
    width: 4,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FFD60A',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1E56',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  updated: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(29,30,86,0.45)',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1E56',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 21,
    color: 'rgba(29,30,86,0.72)',
  },
  bullet: {
    fontSize: 13.5,
    lineHeight: 21,
    color: 'rgba(29,30,86,0.72)',
    marginTop: 4,
    paddingLeft: 4,
  },
  bulletBold: {
    fontWeight: '700',
    color: '#1D1E56',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F8',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  declineBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(29,30,86,0.55)',
  },
  acceptBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFD60A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1E56',
  },
});

export default TermsModal;
