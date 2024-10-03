import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {styles} from './style.css';
import StepIndicator from 'react-native-step-indicator';
import appColors from '../../themes/appColors';
import {Box, CorrectMark, ParcelDelivered, Truck} from '../../utils/icon';
import {trackerData} from '../../data/orderTracker';
import {fontSizes, windowHeight} from '../../themes/appConstant';
import {useValues} from '../../../App';
import {commonStyles} from '../../style/commonStyle.css';

const OrderStepIndicator = () => {
  const [currentPage, setCurrentPage] = useState(2);
  const {t, textColorStyle, iconColorStyle, isDark} = useValues();
  const labels = [
    'Cart',
    'Delivery Address',
    'Order Summary',
    'Payment Method',
    'Track',
  ];
  const icons = [
    <CorrectMark />,
    <CorrectMark />,
    <Box />,
    <Truck color={'#9BA6B8'} colorWhite={iconColorStyle} />,
    <ParcelDelivered />,
  ];
  const stepIndicatorStyles = {
    stepIndicatorSize: 52,
    currentStepIndicatorSize: 25,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 0.1,
    stepStrokeCurrentColor: appColors.primary,
    stepStrokeWidth: 5,
    stepStrokeFinishedColor: appColors.bgLayout,
    stepStrokeUnFinishedColor: appColors.screenBg,
    separatorFinishedColor: appColors.primary,
    separatorUnFinishedColor: appColors.solideLine,
    stepIndicatorFinishedColor: appColors.primary,
    stepIndicatorUnFinishedColor: appColors.solideLine,
    stepIndicatorCurrentColor: appColors.screenBg,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: 'pink',
    stepIndicatorLabelFinishedColor: 'pink',
    stepIndicatorLabelUnFinishedColor: 'pink',
    labelColor: appColors.red,
  };
  if (isDark) {
    stepIndicatorStyles.stepStrokeFinishedColor = appColors.primary;
    stepIndicatorStyles.stepIndicatorUnFinishedColor = '#37383D';
    stepIndicatorStyles.stepStrokeUnFinishedColor = '#37383D';
    stepIndicatorStyles.separatorUnFinishedColor = '#3F4046';
    stepIndicatorStyles.stepIndicatorCurrentColor = '#2F3659';
  }
  return (
    <View>
      <View style={[styles.container]}>
        <View style={[styles.stepIndicator]}>
          <StepIndicator
            customStyles={stepIndicatorStyles}
            stepCount={5}
            direction="vertical"
            currentPosition={currentPage}
            labels={labels}
            renderStepIndicator={({position}) => icons[position]}
            renderLabel={({position}) => {
              return (
                <View
                  style={[
                    styles.lableContainer,
                    {
                      paddingLeft: windowHeight(15),
                    },
                  ]}>
                  <Text
                    style={[
                      commonStyles.titleText19,
                      {
                        fontSize: fontSizes.FONT16,
                        color: textColorStyle,
                      },
                    ]}>
                    {t(trackerData[position].label)}
                  </Text>
                  <Text
                    style={[
                      commonStyles.subtitleText,
                      {color: textColorStyle},
                    ]}>
                    {t(trackerData[position].status)}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default OrderStepIndicator;
