import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {BackLeft} from '../../utils/icon';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import IconBackground from '../iconBackGround';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';

const HeaderContainer = ({value, show, icon, iconTwo, onPress}) => {
  const navigation = useNavigation('');
  const {viewRTLStyle, textColorStyle, imageRTLStyle} = useValues();
  return (
    <View
      style={[
        external.fd_row,
        external.ai_center,
        external.pt_15,
        {justifyContent: show ? 'space-between' : null},
        {flexDirection: viewRTLStyle},
      ]}>
      <TouchableOpacity
        onPress={() => navigation.goBack('')}
        style={[external.fg_half, {flexDirection: viewRTLStyle}]}>
        <View style={{transform: [{scale: imageRTLStyle}]}}>
          <BackLeft />
        </View>
      </TouchableOpacity>
      <Text
        style={[
          commonStyles.hederH2,
          external.as_center,
          {color: textColorStyle},
        ]}>
        {value}
      </Text>
      {show && (
        <View style={[external.fd_row]}>
          <View style={[external.mh_8]}>
            <IconBackground value={icon} />
          </View>
          <IconBackground value={iconTwo} />
        </View>
      )}
    </View>
  );
};

export default HeaderContainer;
