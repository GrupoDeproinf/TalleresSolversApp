import React from 'react';
import { View, Image, Modal, StyleSheet, Dimensions } from 'react-native';
import Images from '../../utils/images';

const { width, height } = Dimensions.get('window');

const CustomLoader = ({ visible }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <Image
            source={Images.loaderGIF}
            style={styles.loaderImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderImage: {
    width: 100,
    height: 100,
  },
});

export default CustomLoader; 