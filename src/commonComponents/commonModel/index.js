import React from 'react';
import {View, Modal} from 'react-native';
import {styles} from './style.css';
import {useValues} from '../../../App';

const CommonModal = ({isVisible, value, animationType, onRequestClose}) => {
  const {bgFullStyle} = useValues();
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType={animationType || 'slide'}
      onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <View style={[styles.valueBar, {backgroundColor: bgFullStyle}]}>
          <View>{value}</View>
        </View>
      </View>
    </Modal>
  );
};

export default CommonModal;
