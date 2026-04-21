import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BackLeft} from '../../utils/icon';
import styles from './style.css';
import {useValues} from '../../../App';
import {useNavigation} from '@react-navigation/native';

const AuthContainer = ({
  subtitle,
  title,
  value,
  onPress,
  showBack,
  AlignItemTitle,
  /** Si true (p. ej. login dentro de ScrollView), quita flex:1 para que el alto sea el del contenido y el scroll funcione. */
  scrollEmbedded,
}) => {
  const {textRTLStyle, imageRTLStyle} = useValues();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const statusBarH =
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  const heroPaddingTop = Math.max(insets.top || 0, statusBarH) + 16;
  const scrollLayout = scrollEmbedded ? {flex: 0} : {};

  return (
    <View style={[styles.container, scrollLayout]}>
      <View style={[styles.hero, {paddingTop: heroPaddingTop}]}>
        <View style={styles.heroInner}>
          <View style={styles.heroRow}>
            {showBack && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, {transform: [{scale: imageRTLStyle}]}]}>
                <BackLeft />
              </TouchableOpacity>
            )}
            <Image
              source={require('../../assets/solverslogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.heroTitle,
              {textAlign: AlignItemTitle != undefined ? AlignItemTitle : textRTLStyle},
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.subtitleText,
              {textAlign: AlignItemTitle != undefined ? AlignItemTitle : textRTLStyle},
            ]}>
            {subtitle}
          </Text>
        </View>
      </View>
      {/* Zona blanca: inputs / formulario */}
      <View style={[styles.formZone, scrollLayout]}>
        {value}
      </View>
    </View>
  );
};

export default AuthContainer;
