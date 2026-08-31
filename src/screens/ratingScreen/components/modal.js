import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {X, Star} from 'lucide-react-native';

const SOLVERS_NAVY = '#1F2344';
const SOLVERS_YELLOW = '#FFD60A';

const QUICK_TAGS = ['Buena atención', 'Precio justo', 'Rápido'];

const BeautifulModal = ({visible, onClose, onSubmit, businessName = ''}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Resetear el formulario cada vez que el modal se abre
  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
      setSelectedTags([]);
    }
  }, [visible]);

  const displayName = (businessName || '').trim() || 'este negocio';

  const toggleTag = label => {
    setSelectedTags(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label],
    );
  };

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit(rating, comment.trim(), [...selectedTags]);
    setRating(0);
    setComment('');
    setSelectedTags([]);
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setSelectedTags([]);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardWrap}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.modalView}>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <X size={22} color={SOLVERS_NAVY} />
              </Pressable>

              <Text style={styles.question}>
                ¿Cómo fue tu experiencia con{' '}
                <Text style={styles.questionAccent}>{displayName}</Text>?
              </Text>

              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${star} estrellas`}>
                    <Star
                      size={32}
                      color={star <= rating ? SOLVERS_YELLOW : '#C8CED9'}
                      fill={star <= rating ? SOLVERS_YELLOW : 'none'}
                      strokeWidth={star <= rating ? 0 : 1.5}
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionLabel}>¿Qué destacarías? (opcional)</Text>
              <View style={styles.tagsWrap}>
                {QUICK_TAGS.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      style={[styles.tagChip, active && styles.tagChipActive]}
                      accessibilityRole="button"
                      accessibilityState={{selected: active}}>
                      <Text
                        style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Comentario (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Detalles adicionales…"
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />

              <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Enviar calificación</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31,35,68,0.45)',
    justifyContent: 'center',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    paddingTop: 48,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E2E8F4',
    shadowColor: SOLVERS_NAVY,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F4FA',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: SOLVERS_NAVY,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 18,
  },
  questionAccent: {
    color: SOLVERS_NAVY,
    fontWeight: '900',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: '#647196',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  tagChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F4F6FB',
    borderWidth: 1,
    borderColor: '#D9E2F3',
  },
  tagChipActive: {
    backgroundColor: SOLVERS_NAVY,
    borderColor: SOLVERS_NAVY,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: SOLVERS_NAVY,
  },
  tagChipTextActive: {
    color: SOLVERS_YELLOW,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9E2F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    minHeight: 72,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: SOLVERS_NAVY,
    fontSize: 14,
    backgroundColor: '#FAFBFE',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: SOLVERS_YELLOW,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E7BF00',
  },
  buttonText: {
    color: SOLVERS_NAVY,
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default BeautifulModal;
