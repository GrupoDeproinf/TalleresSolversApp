import {View} from 'react-native';
import React, {useEffect} from 'react';
import ErrorContainer from '../../commonComponents/errorContainer';
import {
  addNow,
  myWishlist,
  whishlistEmpty,
  whishlistEmptyDesc,
} from '../../constant';
import images from '../../utils/images';
import {commonStyles} from '../../style/commonStyle.css';
import {useNavigation} from '@react-navigation/native';
import {useValues} from '../../../App';

const MyWhishList = () => {
  const navigation = useNavigation();
  const stackNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MyTabs'}],
    });
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.navigate('WhishlitContainer');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [navigation]);
  const {t} = useValues();
  return (
    <View style={[commonStyles.commonContainer]}>
      <ErrorContainer
        Buttontitle={t('transData.addNow')}
        img={images.box}
        title={t('transData.whishlistEmpty')}
        headerTitle={t('transData.myWishlist')}
        Desc={t('transData.whishlistEmptyDesc')}
        onPress={stackNavigation}
      />
    </View>
  );
};

export default MyWhishList;
