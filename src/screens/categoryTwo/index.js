import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import HeaderContainer from '../../components/categoryContainer/headerContainer';
import SearchContainer from '../../components/homeScreen/searchContainer';
import {filterScreenData} from '../../data/filterScreenData';
import appColors from '../../themes/appColors';
import {useValues} from '../../../App';
import {styles} from './styles.css';
import CategoryDetailScreen from '../../components/categoryDetailScreen';
import LinearGradient from 'react-native-linear-gradient';
import {categoryDetailTwo} from '../../data/categoryDetailTwo';
const CategoryTwo = () => {
  const adjustDataForNumber = (data, number) => {
    const adjustedData = [...data];
    adjustedData.forEach(item => {
      item.id = (item.id + number) % adjustedData.length;
    });
    adjustedData.sort((a, b) => a.id - b.id);

    return adjustedData;
  };
  const [selectedItem, setSelectedItem] = useState(0);
  const {isRTL, isDark, viewRTLStyle, t} = useValues();
  const colorBg = isDark ? appColors.bgLayout : appColors.layoutBg;
  const colorBgDark = isDark ? appColors.blackBg : appColors.screenBg;
  const colorText = isDark ? appColors.titleText : appColors.lightButton;
  const colorTextDark = isDark ? appColors.screenBg : appColors.titleText;

  const borderwidth = isRTL ? 2 : null;
  const {bgFullStyle, linearColorStyle} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.pt_10, external.ph_20]}>
        <HeaderContainer />
      </View>
      <SearchContainer />
      <View style={[styles.content, {flexDirection: viewRTLStyle}]}>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyle}
          style={[styles.menuColumn, {backgroundColor: colorBg}]}>
          {filterScreenData.map((item, index) => {
            return (
              <View>
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedItem(item.id)}
                  style={[
                    styles.menuItem,
                    item.id === selectedItem ? styles.selectedMenuItem : null,
                    item.id === selectedItem && {borderRightColor: colorText},
                    item.id === selectedItem && {borderLeftWidth: borderwidth},
                    item.id === selectedItem && {backgroundColor: colorBgDark},
                  ]}>
                  <Text
                    style={[
                      styles.menuItemText,
                      item.id === selectedItem
                        ? styles.menuItemTextSelect
                        : null,
                      item.id === selectedItem && {color: colorTextDark},
                    ]}>
                    {t(item.title)}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </LinearGradient>
        <View>
          <CategoryDetailScreen
            data={adjustDataForNumber(categoryDetailTwo, selectedItem)}
            number={selectedItem}
          />
        </View>
      </View>
    </View>
  );
};

export default CategoryTwo;
