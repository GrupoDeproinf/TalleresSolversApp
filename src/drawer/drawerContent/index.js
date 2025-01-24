import React from 'react';
import {
  View,
  Text,
  SectionList,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useValues} from '../../../App';
import {windowHeight, windowWidth} from '../../themes/appConstant';
import {Category, HomeIcon, MyBegs, ProfileTab} from '../../utils/icon';
import {external} from '../../style/external.css';
import {useNavigation} from '@react-navigation/native';
import {commonStyles} from '../../style/commonStyle.css';
import appColors from '../../themes/appColors';
import images from '../../utils/images';

const DrawerContent = () => {
  const {isDark, linearColorStyle, textColorStyle, iconColorStyle} =
    useValues();
  const navigation = useNavigation();

  const colors = isDark ? ['#5385FC', '#355FE9'] : ['#5385FC', '#355FE9'];
  const DATA = [
    {
      icon: <HomeIcon color={iconColorStyle} />,
      title: 'Home',
      data: ['- Home Variant 1', '- Home Variant 2'],
    },
    {
      icon: <Category color={iconColorStyle} />,
      title: 'Category',
      data: ['- Category Variant 1', '- Category Variant 2'],
    },
    {
      icon: <MyBegs color={iconColorStyle} />,
      title: 'My Bag',
      data: ['- My Bag Variant 1', '- My Bag Variant 2'],
    },
    {
      icon: <ProfileTab color={iconColorStyle} />,
      title: 'Product',
      data: [
        '- My Product Variant 1',
        '- My product Variant 2',
        '- My product Variant 3',
      ],
    },
  ];

  const handleItemPress = item => {
    switch (item) {
      case '- Home Variant 1':
        navigation.navigate('HomeScreen');
        break;
      case '- Home Variant 2':
        navigation.navigate('HomeScreenTwo');
        break;
      case '- Category Variant 1':
        navigation.navigate('CategoryScreen');
        break;
      case '- Category Variant 2':
        navigation.navigate('CategoryTwo');
        break;
      case '- My Bag Variant 1':
        navigation.navigate('AddtocartOne');
        break;
      case '- My Bag Variant 2':
        navigation.navigate('AddToCartTwo');
        break;
      case '- My Product Variant 1':
        navigation.navigate('ProductDetailOne');
        break;
      case '- My product Variant 2':
        navigation.navigate('ProductDetailTwo');
        break;
      case '- My product Variant 3':
        navigation.navigate('ProductDetailThree');
        break;
      default:
        break;
    }
  };

  return (
    <></>
    // <View>
    //   <LinearGradient
    //     start={{x: 0.0, y: 0.0}}
    //     end={{x: 0.0, y: 1.0}}
    //     colors={colors}
    //     style={styles.containerStyle}>
    //     <Image style={styles.logoPng} source={images.logo} />
    //   </LinearGradient>
    //   <LinearGradient
    //     start={{x: 0.0, y: 0.0}}
    //     end={{x: 0.0, y: 1.0}}
    //     colors={linearColorStyle}
    //     style={{backgroundColor: appColors.lightScreenBg, height: '100%'}}>
    //     <SectionList
    //       sections={DATA}
    //       keyExtractor={(item, index) => item + index}
    //       renderItem={({item}) => (
    //         <TouchableOpacity
    //           onPress={() => handleItemPress(item)}
    //           style={styles.item}>
    //           <Text style={[styles.title]}>{item}</Text>
    //         </TouchableOpacity>
    //       )}
    //       renderSectionHeader={({section: {title, icon}}) => (
    //         <View
    //           style={[
    //             external.fd_row,
    //             external.ai_center,
    //             external.mh_20,
    //             external.mt_20,
    //           ]}>
    //           {icon}
    //           <Text style={[styles.header, {color: textColorStyle}]}>
    //             {title}
    //           </Text>
    //         </View>
    //       )}
    //     />
    //   </LinearGradient>
    // </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    marginVertical: 8,
    ...external.ph_20,
  },
  header: {
    fontSize: 32,
    ...commonStyles.titleText19,
    paddingHorizontal: windowHeight(5),
  },
  title: {
    fontSize: 24,
    ...commonStyles.subtitleText,
    ...external.ph_20,
  },
  containerStyle: {
    width: windowWidth(300),
    height: windowHeight(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPng: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
  },
});
export default DrawerContent;
