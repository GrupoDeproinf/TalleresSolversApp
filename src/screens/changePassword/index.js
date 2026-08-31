import {Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import TextInputs from '../../commonComponents/textInputs';
import {Cross, Key} from '../../utils/icon';
import NavigationButton from '../../commonComponents/navigationButton';
import {useValues} from '../../../App';
import CommonModal from '../../commonComponents/commonModel';
import images from '../../utils/images';
import {fontSizes} from '../../themes/appConstant';
import appColors from '../../themes/appColors';
import {styles} from './styles.css';

const ChangePasswordScreen = () => {
  const {bgFullStyle, t, textColorStyle} = useValues();
  const [modalVisible, setModalVisible] = useState(false);
  const [successfullyVisible, setSuccessfullyVisible] = useState(false);
  const closeModal = () => {
    setModalVisible(false);
    setSuccessfullyVisible(false);
  };
  return (
    <View
      style={[
        commonStyles.commonContainer,
        external.ph_20,
        {backgroundColor: bgFullStyle},
      ]}>
      <HeaderContainer value="Cambiar Contraseña" />
      <TextInputs
        title="Actual contraseña"
        placeHolder="Ingrese su contraseña antigua"
        icon={<Key />}
      />
      <TextInputs
        title="Nueva contraseña" 
        placeHolder="Ingrese su nueva contraseña"
        icon={<Key />}
      />
      <TextInputs
        title="Confirme su nueva contraseña"
        placeHolder="Ingrese su nueva contraseña otra vez "
        icon={<Key />}
      />
      <View
        style={[
          external.fx_1,
          external.js_end,
          external.ai_center,
          external.Pb_30,
        ]}>
        <View style={{width: '100%'}}>
          <NavigationButton
            title="Cambiar Contraseña"
            backgroundColor={'#2D3261'}
            onPress={() => setModalVisible(true)}
            color={'white'}
          />
        </View>
        <CommonModal
          isVisible={modalVisible}
          value={
            <View>
              <TouchableOpacity style={[external.as_end]} onPress={closeModal}>
                <Cross />
              </TouchableOpacity>
              <Image style={styles.deleteText} source={images.delete} />
              <Text
                style={[
                  commonStyles.hederH2,
                  external.ti_center,
                  external.Pb_5,
                  {color: textColorStyle},
                ]}>
                {'You Can’t Use Old Password'}
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ti_center,
                  {fontSize: fontSizes.FONT19},
                ]}>
                {
                  'You can not use one of your old password as a new password. Please Change it.'
                }
              </Text>
              <View style={[external.mt_20]}>
                <NavigationButton
                  backgroundColor={appColors.primary}
                  title={t('transData.tryAgain')}
                  onPress={() => setSuccessfullyVisible(true)}
                  color={appColors.screenBg}
                />
              </View>
            </View>
          }
        />
        <CommonModal
          isVisible={successfullyVisible}
          value={
            <View>
              <TouchableOpacity style={[external.as_end]} onPress={closeModal}>
                <Cross />
              </TouchableOpacity>
              <Image style={styles.deleteText} source={images.delete} />
              <Text
                style={[
                  commonStyles.hederH2,
                  external.ti_center,
                  external.Pb_5,
                  {color: textColorStyle},
                ]}>
                {'Congratulations !!'}
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ti_center,
                  {fontSize: fontSizes.FONT19},
                ]}>
                {'Yeah !! Your password has been successully changed.'}
              </Text>
              <View style={[external.mt_20]}>
                <NavigationButton
                  backgroundColor={appColors.primary}
                  title={'Okay'}
                  onPress={closeModal}
                  color={appColors.screenBg}
                />
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default ChangePasswordScreen;
