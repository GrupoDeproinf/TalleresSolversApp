import {TextInput, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Search} from '../../../assets/icons/search';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import {Filter} from '../../../utils/icon';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../../../App';
import {useNavigation} from '@react-navigation/native';

const SearchContainer = ({show}) => {
  const {linearColorStyle, linearColorStyleTwo, textRTLStyle, viewRTLStyle, t} =
    useValues();
  const naviagtion = useNavigation();
  return (
    <TouchableOpacity onPress={() => naviagtion.navigate('CategoryDetail')}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyleTwo}
        style={[styles.container, {flexDirection: viewRTLStyle}]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[styles.menuItemContent, {flexDirection: viewRTLStyle}]}>
          <View style={[styles.searchContainer, {flexDirection: viewRTLStyle}]}>
            <Search />
            <TextInput
              placeholder={t('transData.search')}
              placeholderTextColor={appColors.subtitle}
              style={[
                external.ph_5,
                commonStyles.subtitleText,
                {textAlign: textRTLStyle},
              ]}
            />
          </View>
          <View style={styles.containerView}>
            {show && (
              <View style={styles.filterStyle}>
                <View style={[external.mh_20]}>
                  <Filter />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SearchContainer;
