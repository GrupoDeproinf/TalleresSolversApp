import {View} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Plus} from '../../utils/icon';
import styles from './style.css';

const PlusIcon = () => {
  return (
    <View>
      <LinearGradient
        start={{x: 0.0, y: 5.0}}
        end={{x: 5.0, y: 0.0}}
        style={styles.container}
        colors={['#5385FC', '#355FE9']}>
        <Plus />
      </LinearGradient>
    </View>
  );
};

export default PlusIcon;
