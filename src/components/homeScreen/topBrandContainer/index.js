import {FlatList, View} from 'react-native';
import React from 'react';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {topBrandData} from '../../../data/homeScreen/topBrandData';
import {external} from '../../../style/external.css';
import {windowHeight} from '../../../themes/appConstant';
import styles from './style.css';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../../../App';
import appColors from '../../../themes/appColors';
const TopBrandContainer = () => {
  const {linearColorStyle, isDark, isRTL, t} = useValues();
  const colors = isDark
    ? ['#3F4146', '#26282D']
    : [appColors.screenBg, appColors.screenBg];
  const renderItem = ({item}) => (
    <View>
      <LinearGradient
        start={{x: 0.0, y: 5.0}}
        end={{x: 5.0, y: 0.0}}
        style={styles.container}
        colors={colors}>
        <LinearGradient
          start={{x: 0.0, y: 5.0}}
          end={{x: 5.0, y: 0.0}}
          style={styles.menuItemContent}
          colors={linearColorStyle}>
          <View>{item.icon}</View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
  return (
    <View style={[external.mh_20]}>
      <View style={{marginTop: windowHeight(18)}}>
        <H3HeadingCategory value={t('transData.topBrands')} show={false} />
      </View>
      <FlatList
        numColumns={3}
        data={topBrandData}
        renderItem={renderItem}
        inverted={isRTL ? true : false}
      />
    </View>
  );
};

export default TopBrandContainer;
