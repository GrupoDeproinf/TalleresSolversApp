import {Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../axiosInstance';
import {toastMessage} from '../../utils/showToast';

const ChangePasswordScreen = ({navigation}) => {
  const {bgFullStyle, textColorStyle} = useValues();

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successfullyVisible, setSuccessfullyVisible] = useState(false);

  // Mostrar/ocultar cada campo de contraseña
  const [showCurrent, setShowCurrent] = useState(true);
  const [showNew, setShowNew] = useState(true);
  const [showConfirm, setShowConfirm] = useState(true);

  // Cargar el email del usuario autenticado (necesario para reautenticar).
  useEffect(() => {
    (async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@userInfo');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (user?.email) {
          setEmail(String(user.email).toLowerCase());
        }
      } catch (e) {
        console.log('Error leyendo @userInfo', e);
      }
    })();
  }, []);

  const showToast = text => {
    toastMessage(text);
  };

  const closeModal = () => {
    setSuccessfullyVisible(false);
  };

  const onSuccessOk = () => {
    setSuccessfullyVisible(false);
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleChangePassword = async () => {
    if (isSubmitting) {
      return;
    }

    // Validaciones locales antes de llamar al servidor.
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Completa todos los campos.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (newPassword === currentPassword) {
      showToast('La nueva contraseña debe ser diferente de la actual.');
      return;
    }
    if (!email) {
      showToast('No se pudo identificar tu cuenta. Vuelve a iniciar sesión.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/usuarios/changePassword', {
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      if (response.status === 200) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessfullyVisible(true);
      } else {
        showToast('No se pudo cambiar la contraseña. Intenta nuevamente.');
      }
    } catch (error) {
      if (error.response) {
        // 401 -> contraseña actual incorrecta; otros -> mensaje del servidor.
        showToast(
          error.response.data?.message ||
            'No se pudo cambiar la contraseña. Intenta nuevamente.',
        );
      } else {
        showToast('Error de conexión. Verifica tu internet e intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
        title="Contraseña actual"
        placeHolder="Ingrese su contraseña actual"
        icon={<Key />}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={showCurrent}
        showPass={true}
        changePassValue={() => setShowCurrent(prev => !prev)}
      />
      <TextInputs
        title="Nueva contraseña"
        placeHolder="Ingrese su nueva contraseña"
        icon={<Key />}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={showNew}
        showPass={true}
        changePassValue={() => setShowNew(prev => !prev)}
      />
      <TextInputs
        title="Confirme su nueva contraseña"
        placeHolder="Ingrese su nueva contraseña otra vez"
        icon={<Key />}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={showConfirm}
        showPass={true}
        changePassValue={() => setShowConfirm(prev => !prev)}
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
            title={isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
            backgroundColor={'#2D3261'}
            onPress={handleChangePassword}
            disabled={isSubmitting}
            color={'white'}
          />
        </View>

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
                {'¡Listo!'}
              </Text>
              <Text
                style={[
                  commonStyles.subtitleText,
                  external.ti_center,
                  {fontSize: fontSizes.FONT19},
                ]}>
                {'Tu contraseña se cambió correctamente.'}
              </Text>
              <View style={[external.mt_20]}>
                <NavigationButton
                  backgroundColor={appColors.primary}
                  title={'Aceptar'}
                  onPress={onSuccessOk}
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
