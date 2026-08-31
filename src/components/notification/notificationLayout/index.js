import React from 'react';
import {FlatList, Text, View} from 'react-native';
import {commonStyles} from '../../../style/commonStyle.css';
import {external} from '../../../style/external.css';
import appColors from '../../../themes/appColors';
import {fontSizes} from '../../../themes/appConstant';
import styles from './style.css';
import {notificationData} from '../../../data/notificationData';
import {useValues} from '../../../../App';
import LinearGradient from 'react-native-linear-gradient';
const NotificationLayout = () => {
  const {
    linearColorStyle,
    isDark,
    bgFullStyle,
    textColorStyle,
    imageContainer,
    viewRTLStyle,
    textRTLStyle,
  } = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const renderNotificationItem = ({item}) => (
    <LinearGradient
      start={{x: 0.0, y: 0.0}}
      end={{x: 0.0, y: 1.0}}
      colors={colors}
      style={[
        styles.container,
        {shadowColor: appColors.shadowColor, borderradius: 6},
        {flexDirection: viewRTLStyle},
      ]}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={linearColorStyle}
        style={[
          styles.menuItemContent,
          {shadowColor: appColors.shadowColor},
          {flexDirection: viewRTLStyle},
        ]}>
        <View style={[styles.radiusView, {backgroundColor: imageContainer}]}>
          {item.icon}
        </View>
        <View style={[external.ph_10]}>
          <Text
            style={[
              commonStyles.subtitleText,
              {color: textColorStyle, fontSize: fontSizes.FONT19},
              {textAlign: textRTLStyle},
            ]}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.subtitleText,
              {
                color: item.isread === 0 ? textColorStyle : appColors.subtitle,
              },
              {textAlign: textRTLStyle},
            ]}>
            {item.subttile}
          </Text>
          <Text style={[styles.time, {textAlign: textRTLStyle}]}>
            {item.time}
          </Text>
        </View>
      </LinearGradient>
    </LinearGradient>
  );

  return (
    <FlatList
      data={notificationData}
      keyExtractor={(item, index) => item.title + index}
      renderItem={({item}) => (
        <View>
          <Text
            style={[
              commonStyles.subtitleText,
              external.pt_10,
              {textAlign: textRTLStyle},
            ]}>
            {item.time}
          </Text>
          {item.data.map(notificationItem => (
            <React.Fragment key={notificationItem.id}>
              {renderNotificationItem({item: notificationItem})}
            </React.Fragment>
          ))}
        </View>
      )}
    />
  );
};

export default NotificationLayout;
