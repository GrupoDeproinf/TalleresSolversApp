import {FlatList, View} from 'react-native';
import React from 'react';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
import {categoryDetailTwo} from '../../data/categoryDetailTwo';
import {styles} from './style.css';
import appColors from '../../themes/appColors';

const CategoryDetailScreen = ({data}) => {
  const {linearColorStyle, isDark, bgFullStyle} = useValues();

  const renderItem = ({item}) => (
    <View>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyle}
        style={styles.linearGradient}>
      </LinearGradient>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {borderColor: isDark ? appColors.solidDark : appColors.screenBg},
        {backgroundColor: bgFullStyle},
      ]}>
      <FlatList data={data} renderItem={renderItem} numColumns={3} />
    </View>
  );
};

export default CategoryDetailScreen;
