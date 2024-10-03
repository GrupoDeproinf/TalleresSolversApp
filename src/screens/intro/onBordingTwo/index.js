import React, {useState, useEffect} from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FlipCard from 'react-native-flip-card';
import {commonStyles} from '../../../style/commonStyle.css';
import images from '../../../utils/images';
import {external} from '../../../style/external.css';
import VerticalLine from '../../../commonComponents/verticalLine';
import appColors from '../../../themes/appColors';
import {fontSizes} from '../../../themes/appConstant';
import NavigationButton from '../../../commonComponents/navigationButton';
import {styles} from './style.css';
import {
  productImages,
  productImagesFront,
} from '../../../data/productImageFront';
import {
  create_An_Account,
  discover_New_Upcoming,
  i_Have_An_Account,
  skip,
} from '../../../constant';
import {useValues} from '../../../../App';

const OnboardingTwo = ({navigation}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const flipInterval = setInterval(() => {
      setIsFlipped(prevState => !prevState);
    }, 1500);

    return () => clearInterval(flipInterval);
  }, []);

  const renderFlipCards = () => {
    const numberOfCards = 2;
    const cards = [];
    const numberOfRows = Math.ceil(productImages.length / numberOfCards);

    for (let i = 0; i < numberOfRows; i++) {
      const row = [];
      for (let j = 0; j < numberOfCards; j++) {
        const index = i * numberOfCards + j;
        if (index < productImages.length) {
          row.push(
            <FlipCard
              key={index}
              style={styles.card}
              friction={10}
              perspective={2000}
              flipHorizontal={true}
              flipVertical={false}
              flip={isFlipped}
              clickable={true}
              onFlipEnd={() => {}}
              useNativeDriver={true}>
              <View style={styles.face}>
                <Image
                  style={styles.imgStyle}
                  source={productImagesFront[index].source}
                />
              </View>
              <View style={styles.back}>
                <Image
                  style={styles.imgStyle}
                  source={productImages[index].source}
                />
              </View>
            </FlipCard>,
          );
        }
      }
      cards.push(
        <View key={i} style={styles.rowStyle}>
          {row}
        </View>,
      );
    }

    return cards;
  };
  const {bgFullStyle, isDark, textColorStyle} = useValues();
  const imageBg = isDark ? images.onboardingTwoDark : images.onboardingTwo;
  const imageBgSmall = isDark ? images.smallLogoTwo : images.smallLogo;

  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <View style={[external.fd_row, external.ai_center, external.js_center]}>
        <View style={[external.fg_8]}>
          <Image style={styles.smallLogo} source={imageBgSmall} />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[commonStyles.subtitleText]}>{skip}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.VerticalLineView}>
        <VerticalLine dynamicHeight={'100%'} />
        <View>
          <Text
            style={[
              commonStyles.H1Banner,
              {color: textColorStyle, fontSize: fontSizes.FONT30},
            ]}>
            {discover_New_Upcoming}
          </Text>
        </View>
      </View>
      <ImageBackground style={styles.imageBg} source={imageBg}>
        <View style={styles.container}>{renderFlipCards()}</View>
      </ImageBackground>
      <View style={styles.navigationBtnView}>
        <NavigationButton
          title={i_Have_An_Account}
          backgroundColor={'#4D66FF'}
          onPress={() => navigation.navigate('Login')}
          color={appColors.screenBg}
        />
        <View style={[external.mv_10]}>
          <NavigationButton
            title={create_An_Account}
            color={textColorStyle}
            backgroundColor={'lightgray'}
            borderColor={'#E9E9E9'}
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingTwo;
