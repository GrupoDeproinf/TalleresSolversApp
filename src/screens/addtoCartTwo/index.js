import {Text, View} from 'react-native';
import React from 'react';
import HeaderContainer from '../../commonComponents/headingContainer';
import {myBagTwoItem} from '../../constant';
import {external} from '../../style/external.css';
import {commonStyles} from '../../style/commonStyle.css';
import LocationContainer from '../../components/locationContainer';
import {RightArrow} from '../../assets/icons/rightArrow';
import appColors from '../../themes/appColors';
import NewArrivalBigContainer from '../../components/homeScreenTwo/newArrivalTwoContainer';
import {newArrivalBigData} from '../../data/homeScreenTwo/newArrivalData';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import BottomContainer from '../../commonComponents/bottomContainer';
import {CheckOutIcon, Drawer} from '../../utils/icon';
import DashedBorderComponent from '../../commonComponents/dashBorder';
import styles from './style.css';
import {OrderInfoData} from '../../data/orderInfoData';
import {useValues} from '../../../App';
import LinearGradient from 'react-native-linear-gradient';

const AddToCartTwo = () => {
  const {
    bgFullStyle,
    t,
    linearColorStyleTwo,
    linearColorStyle,
    textColorStyle,
    textRTLStyle,
  } = useValues();

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.ph_20]}>
        <HeaderContainer value={myBagTwoItem} />
      </View>
      <View>
        <Text
          style={[
            styles.deliveryLocation,
            {color: textColorStyle},
            {textAlign: textRTLStyle},
          ]}>
          {t('transData.deliveryLocation')}
        </Text>
        <LocationContainer
          value={<RightArrow />}
          borderColor={appColors.bgLayout}
        />
        <Text
          style={[
            styles.orderInfo,
            {color: textColorStyle},
            {textAlign: textRTLStyle},
          ]}>
          {'Order Info'}
        </Text>
        <LinearGradient
          start={{x: 0.0, y: 0.0}}
          end={{x: 0.0, y: 1.0}}
          colors={linearColorStyleTwo}
          style={[styles.viewText]}>
          <LinearGradient
            start={{x: 0.0, y: 0.0}}
            end={{x: 0.0, y: 1.0}}
            colors={linearColorStyle}
            style={[styles.menuItemContent]}>
            {OrderInfoData.map(item => (
              <View style={styles.container}>
                <Text style={[commonStyles.subtitleText]}>{item.title}</Text>
                <View style={styles.dashBoardView}>
                  <DashedBorderComponent />
                </View>
                <Text
                  style={[commonStyles.titleText19, {color: textColorStyle}]}>
                  {item.price}$
                </Text>
              </View>
            ))}
          </LinearGradient>
        </LinearGradient>
      </View>

      <NewArrivalBigContainer
        data={newArrivalBigData}
        value={t('transData.newArrival')}
        horizontal={true}
        show={true}
      />
      <View style={styles.viewStyle}>
        <BottomContainer
          leftValue={
            <Text
              style={[
                commonStyles.H1Banner,
                {
                  fontSize: fontSizes.FONT23,
                  color: appColors.titleText,
                  paddingHorizontal: windowHeight(14),
                },
                {color: textColorStyle},
              ]}>
              $3568.31{' '}
              <Text style={[commonStyles.subtitleText]}>(2 items)</Text>
            </Text>
          }
          value={
            <View style={[external.fd_row, external.ai_center, external.pt_4]}>
              <CheckOutIcon />
              <Text style={[styles.checkOut, {color: textColorStyle}]}>
                Check Out
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default AddToCartTwo;
