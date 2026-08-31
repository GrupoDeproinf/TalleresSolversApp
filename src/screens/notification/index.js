import React, {useEffect} from 'react';
import images from '../../utils/images';
import ErrorContainer from '../../commonComponents/errorContainer';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';

const NotificationScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.navigate('NotificationContainer');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigation]);
  const {t, isDark} = useValues();
  const darkImg = isDark ? images.DarkNotification : images.notification;
  return (
    <ErrorContainer
      Buttontitle={t('transData.refresh')}
      img={darkImg}
      title={t('transData.noNewNotifications')}
      headerTitle={t('transData.notification')}
      Desc={t('transData.notificationDesc')}
      onPress={() => navigation.navigate('NotificationContainer')}
    />
  );
};

export default NotificationScreen;
