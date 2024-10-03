import {Image, Text, View} from 'react-native';
import React from 'react';
import IconBackground from '../../../commonComponents/iconBackGround';
import {Heart, Notification} from '../../../utils/icon';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import images from '../../../utils/images';
import appColors from '../../../themes/appColors';
import NavigationButton from '../../../commonComponents/navigationButton';
import styles from './style.css';
import {useValues} from '../../../../App';

const MyBeg = ({navigation}) => {
  const {isDark, bgFullStyle, textColorStyle, t} = useValues();
  const colors = isDark
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  const darkmode = isDark ? images.darkBag : images.beg;
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[styles.container]}>
        <View
          style={[external.ai_center, external.js_center, external.as_center]}>
          <Text
            style={[
              commonStyles.titleText19,
              external.ti_center,
              {color: textColorStyle, marginLeft: '30%'},
            ]}>
            {t('transData.myBeg')}
          </Text>
        </View>

        <View style={[external.mh_20]}>
          <IconBackground
            value={<Heart />}
            onPress={() => navigation.navigate('MyWhishList')}
          />
        </View>
        <IconBackground
          value={<Notification />}
          onPress={() => navigation.navigate('NotificationScreen')}
        />
      </View>
      <View style={styles.flexView}>
        <View>
          <Image style={styles.imgStyle} source={darkmode} />
          <Text style={[styles.bagIsEmptyText, {color: textColorStyle}]}>
            {t('transData.bagIsEmpty')}
          </Text>
          <Text style={styles.bagisEmptySomething}>
            {t('transData.bagIsEmptySomething')}
          </Text>
        </View>
        <View style={{width: '100%'}}>
          <NavigationButton
            title={t('transData.startShopping')}
            backgroundColor={'#4D66FF'}
            color={appColors.screenBg}
            onPress={() => navigation.goBack('')}
          />
        </View>
      </View>
    </View>
  );
};

export default MyBeg;
