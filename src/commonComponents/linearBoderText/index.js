import {Text, View} from 'react-native';
import React from 'react';
import styles from './style.css';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
const LinearBoderText = () => {
  const {t} = useValues();
  return (
    <View style={[styles.linearView]}>
      <LinearGradient
        start={{x: 0.0, y: 3.0}}
        end={{x: 1.0, y: 5.0}}
        style={styles.linearBorderStyle}
        colors={[appColors.linearBorder, appColors.subtitle]}
      />
      <Text style={[styles.orText]}>{t('transData.continueWith')}</Text>
      <LinearGradient
        start={{x: 0.0, y: 3.0}}
        end={{x: 1.0, y: 5.0}}
        style={styles.linearBorderStyle}
        colors={[appColors.subtitle, appColors.linearBorder]}
      />
    </View>
  );
};

export default LinearBoderText;
