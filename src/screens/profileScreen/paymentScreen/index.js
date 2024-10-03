import {Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HeaderContainer from '../../../commonComponents/headingContainer';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import {
  addNewCards,
  cardHolderName,
  cardNumber,
  smithaWilliams,
} from '../../../constant';
import PaymentScreenContainer from '../../../components/paymentScreen';
import styles from './style.css';
import {useValues} from '../../../../App';
import CommonModal from '../../../commonComponents/commonModel';
import {Cross} from '../../../utils/icon';
import SolidLine from '../../../commonComponents/solidLine';
import TextInputs from '../../../commonComponents/textInputs';
import CheckBox from '../../../commonComponents/checkBox';
import NavigationButton from '../../../commonComponents/navigationButton';
import appColors from '../../../themes/appColors';
import {fontSizes} from '../../../themes/appConstant';
import { otherPaymentMode } from '../../../data/paymentData';

const PaymentScreen = () => {
  const {bgFullStyle, textRTLStyle, viewRTLStyle, t, textColorStyle} =
    useValues();
  const [editModal, setEditModal] = useState(false);
  const [addressValue, setAddressValue] = useState('');
  const [checkedData, setCheckedData] = useState(false);

  const handleAddressChange = text => {
    setAddressValue(text);
  };
  const closeModal = () => {
    setEditModal(false);
  };
  const valData = () => {
    setCheckedData(!checkedData);
  };
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value={t('transData.managePaymentMethod')} />
      <Text
        style={[
          commonStyles.subtitleText,
          external.mt_8,
          {textAlign: textRTLStyle},
        ]}>
        {t('transData.cards')}
      </Text>
      <PaymentScreenContainer data={otherPaymentMode} />
      <TouchableOpacity onPress={() => setEditModal(true)}>
        <Text style={[styles.text, {textAlign: textRTLStyle}]}>
          {t('transData.addNewCard')}
        </Text>
      </TouchableOpacity>

      <CommonModal
        isVisible={editModal}
        value={
          <View>
            <View
              style={[external.fd_row, external.ai_center, external.js_space]}>
              <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
                {addNewCards}
              </Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Cross />
              </TouchableOpacity>
            </View>
            <SolidLine />
            <TextInputs
              title={cardNumber}
              placeHolder={'7859 2323 4589'}
              onChangeText={handleAddressChange}
            />
            <TextInputs
              title={cardHolderName}
              placeHolder={smithaWilliams}
              onChangeText={handleAddressChange}
            />

            <View style={[external.fd_row, external.ai_center]}>
              <View style={{width: '45%', marginHorizontal: 10}}>
                <TextInputs
                  title={'CVV'}
                  placeHolder={'CVV'}
                  onChangeText={handleAddressChange}
                />
              </View>
              <View style={{width: '45%', marginHorizontal: 10}}>
                <TextInputs
                  title={'Exp. Date'}
                  placeHolder={'Exp. Date'}
                  onChangeText={handleAddressChange}
                />
              </View>
            </View>

            <View style={[external.fd_row, external.ai_center, external.mt_3]}>
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
                  backgroundColor={appColors.screenBg}
                  title={'Cancel'}
                  color={appColors.titleText}
                  borderWidth={0.3}
                  onPress={closeModal}
                />
              </View>
              <View style={{width: 170}}>
                <NavigationButton
                  backgroundColor={'#4D66FF'}
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
  );
};

export default PaymentScreen;
