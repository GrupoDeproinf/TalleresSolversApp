import {Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {BackLeft} from '../../utils/icon';
import {commonStyles} from '../../style/commonStyle.css';
import {external} from '../../style/external.css';
import IconBackground from '../iconBackGround';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';
import styles from './style.css';

const HeaderContainer = ({
  value,
  show,
  icon,
  iconTwo,
  onPress,
  decorCircles = true,
}) => {
  const navigation = useNavigation('');
  const {viewRTLStyle, textColorStyle, imageRTLStyle} = useValues();
  const rowContent = (
    <View
      style={[
        external.fd_row,
        external.ai_center,
        external.pt_15,
        {justifyContent: show ? 'space-between' : null},
        {flexDirection: viewRTLStyle},
        decorCircles && styles.rowElevated,
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

  if (!decorCircles) {
    return rowContent;
  }

  return (
    <View style={styles.decorOuter}>
      <View style={styles.decorCircle1} pointerEvents="none" />
      <View style={styles.decorCircle2} pointerEvents="none" />
      {rowContent}
    </View>
  );
};

export default HeaderContainer;
