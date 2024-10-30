import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import {
  addressOne,
  editAddress,
  phoneMo,
  phoneNumber,
  remove,
  streetAddress,
  title,
  workAddress,
} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import {addressData} from '../../../data/addressData';
import appColors from '../../../themes/appColors';
import IconBackground from '../../../commonComponents/iconBackGround';
import {Cross, Edit} from '../../../utils/icon';
import SolidLine from '../../../commonComponents/solidLine';
import styles from './style.css';
import {fontSizes, windowHeight} from '../../../themes/appConstant';
import CheckBox from '../../../commonComponents/checkBox';
import CommonModal from '../../../commonComponents/commonModel';
import images from '../../../utils/images';
import NavigationButton from '../../../commonComponents/navigationButton';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
import TextInputs from '../../../commonComponents/textInputs';

const AddressScreen = ({navigation}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [checkedData, setCheckedData] = useState(false);
  const [addressValue, setAddressValue] = useState('');
  const paymentData = index => {
    setSelectedItem(index === selectedItem ? null : index);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const handleAddressChange = text => {
    setAddressValue(text);
  };

  const {
    textColorStyle,
    linearColorStyle,
    bgFullStyle,
    textRTLStyle,
    viewRTLStyle,
    t,
    isDark,
    linearColorStyleTwo,
  } = useValues();
  const valData = () => {
    setCheckedData(!checkedData);
  };
  const deleteDark = isDark ? images.deleteDarkGif : images.delete;
  const renderItem = ({item, index}) => (
    <LinearGradient
      start={{x: 0.0, y: 0.0}}
      end={{x: 0.0, y: 1.0}}
      colors={linearColorStyle}
      style={styles.container}>
      <View style={[styles.viewContainer, {flexDirection: viewRTLStyle}]}>
        <View style={[external.fg_1]}>
          <Text
            style={[
              commonStyles.titleText19,
              {color: textColorStyle},
              {textAlign: textRTLStyle},
            ]}>
            {t(item.title)}
          </Text>
          <Text
            style={[
              commonStyles.subtitleText,
              {color: textColorStyle},
              {textAlign: textRTLStyle},
            ]}>
            {t(item.subtitle)}
          </Text>
        </View>
        <IconBackground
          value={<Edit />}
          borderradius={windowHeight(4)}
          onPress={() => setEditModal(true)}
        />
      </View>
      <SolidLine />
      <Text
        style={[
          styles.addressItem,
          {color: textColorStyle},
          {textAlign: textRTLStyle},
        ]}>
        {t(item.address)}
      </Text>
      <View style={[styles.monoText, {flexDirection: viewRTLStyle}]}>
        <Text style={[commonStyles.subtitleText, {color: textColorStyle}]}>
          {item.mo}
        </Text>
        <Text> : </Text>
        <Text style={[commonStyles.subtitleText, {color: textColorStyle}]}>
          {item.phoneNumber}
        </Text>
      </View>
      <View style={[styles.defaulText, {flexDirection: viewRTLStyle}]}>
        <CheckBox
          onPress={() => {
            paymentData(index);
          }}
          checked={index === selectedItem}
        />
        <Text
          style={[
            styles.defaulTextView,
            {color: textColorStyle},
            {textAlign: textRTLStyle},
          ]}>
          {t(item.defaulText)}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.removeText}>{remove}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View
        style={[
          commonStyles.commonContainer,
          external.ph_20,
          {backgroundColor: bgFullStyle},
        ]}>
        <HeaderContainer value={t('transData.manageDeliveryAddress')} />
        <FlatList data={addressData} renderItem={renderItem} />
        <CommonModal
          isVisible={modalVisible}
          value={
            <View>
              <TouchableOpacity style={[external.as_end]} onPress={closeModal}>
                <Cross />
              </TouchableOpacity>
              <Image style={styles.deleteText} source={deleteDark} />
              <Text
                style={[
                  commonStyles.hederH2,
                  external.ti_center,
                  external.Pb_5,
                  {color: textColorStyle},
                ]}>
                {t('transData.successfullyDeleted')}
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ti_center,
                  {fontSize: fontSizes.FONT19},
                ]}>
                {t('transData.youronePaymentDelelted')}
              </Text>
              <View style={[external.mt_20]}>
                <NavigationButton
                  backgroundColor={appColors.primary}
                  title={t('transData.tryAgain')}
                  onPress={closeModal}
                  color={appColors.screenBg}
                />
              </View>
            </View>
          }
        />
        <CommonModal
          isVisible={editModal}
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
                  {editAddress}
                </Text>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Cross />
                </TouchableOpacity>
              </View>
              <SolidLine />
              <TextInputs
                title={title}
                placeHolder={workAddress}
                onChangeText={handleAddressChange}
              />
              <TextInputs
                title={phoneNumber}
                placeHolder={phoneMo}
                onChangeText={handleAddressChange}
              />
              <TextInputs
                title={streetAddress}
                placeHolder={addressOne}
                onChangeText={handleAddressChange}
              />
              <View style={[external.fd_row, external.ai_center]}>
                <View style={{width: '45%', marginHorizontal: 10}}>
                  <TextInputs
                    title={'City'}
                    placeHolder={'Enter city name'}
                    onChangeText={handleAddressChange}
                  />
                </View>
                <View style={{width: '45%', marginHorizontal: 10}}>
                  <TextInputs
                    title={'ZIP Code'}
                    placeHolder={'Enter zip code'}
                    onChangeText={handleAddressChange}
                  />
                </View>
              </View>

              <View
                style={[external.fd_row, external.ai_center, external.mt_3]}>
                <CheckBox onPress={valData} checked={checkedData} />
                <Text
                  style={[
                    commonStyles.subtitleText,
                    external.ph_5,
                    external.fg_1,
                    {color: textColorStyle, fontSize: fontSizes.FONT16},
                  ]}>
                  {t('transData.makeasadefault')}
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
                    backgroundColor={isDark ? linearColorStyle : 'white'}
                    title={'Cancel'}
                    color={isDark ? appColors.screenBg : appColors.titleText}
                    borderWidth={0.3}
                    onPress={() => setEditModal(false)}
                    borderColor={linearColorStyleTwo}
                  />
                </View>
                <View style={{width: 170}}>
                  <NavigationButton
                    backgroundColor={'#2D3261'}
                    title={'Add'}
                    color={appColors.screenBg}
                    onPress={() => setEditModal(false)}
                  />
                </View>
              </View>
            </View>
          }
        />
      </View>

      <View style={[external.Pb_15, external.ph_20]}>
        <NavigationButton
          backgroundColor={appColors.primary}
          title={t('transData.saveChanges')}
          color={appColors.screenBg}
          onPress={() => navigation.goBack('')}
        />
      </View>
    </View>
  );
};

export default AddressScreen;
