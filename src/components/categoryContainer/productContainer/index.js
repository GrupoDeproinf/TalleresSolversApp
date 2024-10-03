import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {external} from '../../../style/external.css';
import {categoryData} from '../../../data/categoryData';
import styles from './style.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import appColors from '../../../themes/appColors';
const ProductContainer = () => {
  const {isDark, textColorStyle, linearColorStyle, t} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const navigation = useNavigation('');
  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => navigation.navigate('CategoryDetail')}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={colors}
        style={[
          styles.container,
          {shadowColor: appColors.shadowColor, borderradius: 6},
        ]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[
            styles.menuItemContent,
            {shadowColor: appColors.shadowColor},
          ]}>
          <Image style={styles.imgContainer} source={item.img} />
        </LinearGradient>
      </LinearGradient>
      <Text style={[styles.title, {color: textColorStyle}]}>
        {t(item.title)}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View>
      <FlatList
        numColumns={4}
        data={categoryData}
        renderItem={renderItem}
        contentContainerStyle={[external.mt_10, external.mh_20]}
      />
    </View>
  );
};

export default ProductContainer;
