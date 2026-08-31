import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {external} from '../../style/external.css';
import appColors from '../../themes/appColors';
import {changeAddressData} from '../../data/addressData';
import {commonStyles} from '../../style/commonStyle.css';
import NavigationButton from '../../commonComponents/navigationButton';
import RadioButton from '../../commonComponents/radioButton';
import {styles} from './style.css';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import CommonModal from '../../commonComponents/commonModel';
import {Cross} from '../../utils/icon';
import SolidLine from '../../commonComponents/solidLine';
import TextInputs from '../../commonComponents/textInputs';
import CheckBox from '../../commonComponents/checkBox';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';
const ChangeAddressScreen = ({navigation}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
  };
  const paymentData = index => {
    setSelectedItem(index === selectedItem ? null : index);
  };
  const {
    bgFullStyle,
    textColorStyle,
    linearColorStyle,
    isDark,
    t,
    viewRTLStyle,
    textRTLStyle,
  } = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <HeaderContainer value={t('transData.changeAddress')} />
      </View>
      {changeAddressData.map((item, index) => (
        <TouchableOpacity
          onPress={() => {
            paymentData(index);
          }}
          elevation={1}>
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
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  {flexDirection: viewRTLStyle},
                ]}>
                <RadioButton
                  onPress={() => {
                    paymentData(index);
                  }}
                  checked={index === selectedItem}
                />
                <Text
                  style={[
                    commonStyles.titleText19,
                    external.ph_10,
                    {color: textColorStyle},
                  ]}>
                  {t(item.title)}
                </Text>
              </View>
              <View style={[external.ph_10]}>
                <Text
                  style={[
                    commonStyles.subtitleText,
                    {textAlign: textRTLStyle},
                    external.ph_20,
                    {
                      color:
                        index === selectedItem
                          ? textColorStyle
                          : appColors.subtitle,
                      paddingVertical: windowHeight(2),
                      fontSize: fontSizes.FONT16,
                    },
                  ]}>
                  {t(item.address)}
                </Text>
                <View
                  style={[
                    external.fd_row,
                    external.ai_center,
                    external.ph_20,
                    {flexDirection: viewRTLStyle},
                  ]}>
                  <Text
                    style={[
                      commonStyles.subtitleText,
                      {color: textColorStyle},
                    ]}>
                    {item.mo} :
                  </Text>
                  <Text style={[commonStyles.subtitleText]}>
                    {item.phoneNumber}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={[styles.textContainer, {textAlign: textRTLStyle}]}>
          + Add New Address
        </Text>
      </TouchableOpacity>
      <View
        style={[
          external.fx_1,
          external.js_end,
          external.Pb_30,
          external.ph_20,
        ]}>
        <NavigationButton
          backgroundColor={'#2D3261'}
          color={appColors.screenBg}
          title={'Select'}
          onPress={() => navigation.navigate('CheckoutScreen')}
        />
        <CommonModal
          isVisible={isModalVisible}
          closeModal={closeModal}
          value={
            <View>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                ]}>
                <Text
                  style={[commonStyles.titleText19, {color: textColorStyle}]}>
                  Add New Address
                </Text>
                <Pressable onPress={closeModal}>
                  <Cross />
                </Pressable>
              </View>
              <SolidLine />
              <TextInputs title={'Title'} placeHolder={'Enter Title'} />
              <TextInputs
                title={'Phone Number'}
                placeHolder={'Enter phone number'}
              />
              <TextInputs
                title={'Street Address'}
                placeHolder={'Enter address'}
              />
              <View style={[external.fd_row, external.ai_center]}>
                <View style={{width: '45%', marginHorizontal: 10}}>
                  <TextInputs title={'City'} placeHolder={'Enter city name'} />
                </View>
                <View style={{width: '45%', marginHorizontal: 10}}>
                  <TextInputs
                    title={'ZIP Code'}
                    placeHolder={'Enter zip code'}
                  />
                </View>
              </View>
              <View style={[external.fd_row]}>
                <CheckBox />
                <Text
                  style={[
                    commonStyles.subtitleText,
                    external.ph_5,
                    {color: textColorStyle},
                  ]}>
                  Make as a default
                </Text>
              </View>
              <View
                style={[
                  external.fd_row,
                  external.ai_center,
                  external.js_space,
                  external.mt_30,
                ]}>
                <View style={{width: 170}}>
                  <NavigationButton
                    backgroundColor={appColors.screenBg}
                    title={'Cancel'}
                    color={textColorStyle}
                    borderWidth={0.3}
                    onPress={closeModal}
                  />
                </View>
                <View style={{width: 170}}>
                  <NavigationButton
                    backgroundColor={'#2D3261'}
                    title={'Add'}
                    color={appColors.screenBg}
                    onPress={closeModal}
                  />
                </View>
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default ChangeAddressScreen;
