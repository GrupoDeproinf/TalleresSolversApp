import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {homeProductData} from '../../../data/homeProductData';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {useValues} from '../../../../App';

const SwiperProduct = () => {
  const {isDark} = useValues();

  const [selectedItem, setSelectedItem] = useState(0);
  const {t} = useValues();
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => setSelectedItem(item.id)}
      style={[
        external.mh_15,
        item.id === selectedItem ? styles.selectedMenuItemText : null,
      ]}>
      <Text
        style={[
          commonStyles.subtitleText,
          {
            color:
              item.id === selectedItem
                ? appColors.titleText
                : appColors.subtitle,
          },
          isDark && {
            color:
              item.id === selectedItem
                ? appColors.screenBg
                : appColors.subtitle,
          },
        ]}>
        {t(item.title)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[external.mh_20]}>
      <FlatList
        renderItem={renderItem}
        data={homeProductData}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default SwiperProduct;
