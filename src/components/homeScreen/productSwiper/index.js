import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import SolidLine from '../../../commonComponents/solidLine';
import {commonStyles} from '../../../style/commonStyle.css';
import {homeProductData} from '../../../data/homeProductData';
import {external} from '../../../style/external.css';
import styles from './style';
import {useValues} from '../../../../App';

const ProductSwiper = () => {
  const [selectedItem, setSelectedItem] = useState(0);
  const {isRTL, t} = useValues();

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.container,
        item.id === selectedItem ? styles.selectedMenuItem : null,
      ]}
      onPress={() => setSelectedItem(item.id)}>
      <Text
        style={[
          commonStyles.subtitleText,
          item.id === selectedItem ? styles.selectedMenuItemText : null,
        ]}>
        {t(item.title)}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={[external.mh_20, external.mt_15]}>
      <SolidLine />
      <FlatList
        renderItem={renderItem}
        data={homeProductData}
        horizontal
        showsHorizontalScrollIndicator={false}
        inverted={isRTL ? true : false}
      />
      <SolidLine />
    </View>
  );
};

export default ProductSwiper;
