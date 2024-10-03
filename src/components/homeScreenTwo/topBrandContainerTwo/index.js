import {FlatList, View} from 'react-native';
import React from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {external} from '../../../style/external.css';
import {topBrands} from '../../../constant';
import {topBrandData} from '../../../data/homeScreen/topBrandData';
import styles from './style.css';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../../../App';
const TopBrandContainerTwo = () => {
  const {linearColorStyle, linearColorStyleTwo, t} = useValues();

  const renderItem = ({item}) => (
    <View style={[external.fd_row, external.ai_center]}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyleTwo}
        style={[styles.viewStyle]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={styles.menuItemContent}>
          <View style={styles.brandIconContainer}>{item.icon}</View>
        </LinearGradient>
      </LinearGradient>
      <View style={styles.separator} />
    </View>
  );

  return (
    <View style={styles.container}>
      <H3HeadingCategory value={t('transData.topBrands')} show={false} />
      <View style={styles.headingContainer}>
        <FlatList numColumns={3} data={topBrandData} renderItem={renderItem} />
      </View>
    </View>
  );
};

export default TopBrandContainerTwo;
