import React from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // Import the navigation hook
import FullHeader from '../../../commonComponents/fullHeader';
import {clearAll, notification} from '../../../constant';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import {fontSizes} from '../../../themes/appConstant';
import NotificationLayout from '../../../components/notification/notificationLayout';
import {useValues} from '../../../../App';

const NotificationContainer = () => {
  const navigation = useNavigation();
  const {bgFullStyle} = useValues();

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.mh_20]}>
        <FullHeader
          onpressBack={() => navigation.goBack()}
          show={true}
          title={notification}
          text={
            <Text
              style={[
                commonStyles.hederH2,
                {fontSize: fontSizes.FONT17, color: '#4D66FF'},
              ]}>
              {clearAll}
            </Text>
          }
        />
        <NotificationLayout />
      </View>
    </View>
  );
};

export default NotificationContainer;
