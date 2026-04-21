import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';


const BeautifulModal = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center',width: '100%' }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // ajusta según tu header, si tienes uno
        >




          <View style={styles.modalView}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={22} color="#1F2344" />
            </Pressable>
            <View style={styles.headerChip}>
              <Text style={styles.headerChipText}>COMENTARIOS</Text>
            </View>
            <Text style={styles.modalTitle}>Califica tu experiencia</Text>
            <Text style={styles.modalSubtitle}>
              Tu opinion nos ayuda a mejorar el servicio para todos.
            </Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Star
                    size={30}
                    color={star <= rating ? '#FFD700' : '#D3D3D3'}
                    fill={star <= rating ? '#FFD700' : 'none'}
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Deja tu comentario aquí"
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Enviar comentario</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9,13,46,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#1F2344',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 7,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#D9E2F3',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2344',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  headerChipText: {
    color: '#FFD60A',
    fontSize: 10,
    fontWeight: '900',
  },
  modalTitle: {
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2344',
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#5B6383',
    fontSize: 13,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD7EE',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    minHeight: 108,
    textAlignVertical: 'top',
    marginBottom: 14,
    color: '#1F2344',
    fontSize: 15,
    backgroundColor: '#F8FBFF',
  },
  placeholderText: {
    color: '#999',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 12,
    elevation: 2,
    backgroundColor: '#FFD60A',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E7BF00',
  },
  buttonText: {
    color: '#1F2344',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default BeautifulModal;

