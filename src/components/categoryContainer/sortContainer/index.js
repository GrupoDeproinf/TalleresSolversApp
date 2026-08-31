import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {Cross, Filter, SortBy} from '../../../utils/icon';
import {external} from '../../../style/external.css';
import {filterBy, sortBy} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';
import appColors from '../../../themes/appColors';
import styles from './style.css';
import CommonModal from '../../../commonComponents/commonModel';
import SolidLine from '../../../commonComponents/solidLine';
import {sortContainerData} from '../../../data/sortingData';
import RadioButton from '../../../commonComponents/radioButton';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
const SortContainer = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const paymentData = index => {
    setSelectedItem(index === selectedItem ? null : index);
  };
  const [isModalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };
  const {linearColorStyle, isDark, bgFullStyle, textColorStyle} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <View style={[external.mh_20, external.mt_10]}>
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
          <TouchableOpacity
            style={styles.sortBycontainer}
            onPress={() => setModalVisible(true)}>
            <SortBy />
            <Text
              style={[
                commonStyles.subtitleText,
                external.ph_10,
                {fontSize: fontSizes.FONT19, color: textColorStyle},
              ]}>
              {sortBy}
            </Text>
          </TouchableOpacity>
          <View style={styles.viewContainer} />
          <View style={[external.fd_row, external.ai_center]}>
            <Filter />
            <Text
              style={[
                commonStyles.subtitleText,
                {
                  fontSize: fontSizes.FONT19,
                  color: textColorStyle,
                  paddingHorizontal: windowHeight(5),
                },
              ]}>
              {filterBy}
            </Text>
          </View>
          <CommonModal
            isVisible={isModalVisible}
            closeModal={closeModal}
            value={
              <View>
                <View
                  style={[
                    external.fd_row,
                    external.js_space,
                    external.ai_center,
                    external.mb_5,
                  ]}>
                  <Text
                    style={[
                      commonStyles.titleText19,
                      {fontSize: fontSizes.FONT21, color: textColorStyle},
                    ]}>
                    {sortBy}
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Cross />
                  </TouchableOpacity>
                </View>
                <SolidLine />
                {sortContainerData.map((item, index) => (
                  <View style={[external.mv_5]}>
                    <View
                      style={[
                        external.fd_row,
                        external.js_space,
                        external.ai_center,
                      ]}>
                      <Text
                        style={[
                          commonStyles.subtitleText,
                          {
                            color: textColorStyle,
                            fontSize: fontSizes.FONT19,
                            marginVertical: windowHeight(5),
                          },
                        ]}>
                        {item.title}
                      </Text>
                      <RadioButton
                        onPress={() => {
                          paymentData(index);
                        }}
                        checked={index === selectedItem}
                      />
                    </View>
                    {index !== sortContainerData.length - 1 && (
                      <SolidLine marginVertical={windowHeight(9)} />
                    )}
                  </View>
                ))}
              </View>
            }
          />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

export default SortContainer;
