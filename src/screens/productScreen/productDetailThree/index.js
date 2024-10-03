import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import styles from './style.css';
import appColors from '../../../themes/appColors';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../themes/appConstant';
import {Table, TableWrapper, Row, Rows} from 'react-native-table-component';
import BottomContainer from '../../../commonComponents/bottomContainer';
import {Plus, RightSmallArrow} from '../../../utils/icon';
import {Cart} from '../../../assets/icons/cart';
import SolidLine from '../../../commonComponents/solidLine';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {newArrivalBigData} from '../../../data/homeScreenTwo/newArrivalData';
import DetailContainer from '../../../components/productDetail/productThree/detailContainer';
import DetailText from '../../../components/productDetail/productThree/detailText';
import KeyContainer from '../../../components/productDetail/productThree/keyContainer';
import ReviewScreen from '../../../components/productDetail/productThree/reviewScreen';
import {useValues} from '../../../../App';
import DeliverContainer from '../../../components/productDetail/productThree/deliveryContaier';
import SliderCarousel from '../../../components/productDetail/productThree/sliderCarousel';
const tableData = {
  tableData: [
    ['Brands', 'Zebronics'],
    ['Model', 'ZEB-RETRO'],
    ['Driver Size', '40mm'],
    ['Dimensions', '181*181*89'],
    ['Sensitivity', '105±3 dB | Microphone:-58dB'],
    ['Frequency', '20hz to 20k hz'],
  ],
};
const ProductDetailThree = ({navigation}) => {
  const [data, setData] = useState(tableData);
  const {bgFullStyle, textColorStyle} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: windowHeight(50)}}>
        <SliderCarousel />
        <DetailContainer />
        <DetailText />
        <View style={styles.container}>
          <Table
            style={{borderRadius: 10, overflow: 'hidden'}}
            borderStyle={{borderWidth: 1, borderColor: '#EDF0FF'}}>
            <Row
              data={data.tableHead}
              flexArr={[1, 1, 2]}
              style={styles.head}
              textStyle={styles.text}
            />
            <TableWrapper style={styles.wrapper}>
              <Rows
                data={data.tableData}
                flexArr={[1, 2, 1]}
                style={styles.row}
                textStyle={styles.text}
              />
            </TableWrapper>
          </Table>
        </View>
        <DeliverContainer />
        <KeyContainer />
        <View style={[external.mh_20]}>
          <SolidLine />
          <View style={[external.fd_row, external.js_space]}>
            <Text style={[commonStyles.titleText19, {color: textColorStyle}]}>
              Reviews :
            </Text>
            <TouchableOpacity
              style={[external.fd_row, external.ai_center]}
              onPress={() => navigation.navigate('RatingScreen')}>
              <Text
                style={[
                  commonStyles.titleText19,
                  {fontSize: fontSizes.FONT17, color: textColorStyle},
                ]}>
                {'105 reviews'}
              </Text>
              <RightSmallArrow />
            </TouchableOpacity>
          </View>
          <SolidLine />
        </View>
        <ReviewScreen />
        <SolidLine />
        <Text style={styles.writeYourReview}>+ Write Your Review</Text>
        <NewArrivalBigContainer
          data={newArrivalBigData}
          horizontal={true}
          width={windowWidth(205)}
        />
      </ScrollView>
      <View style={styles.bottomContainerView}>
        <BottomContainer
          leftValue={
            <View style={[external.fd_row, external.ai_center, external.mh_20]}>
              <View
                style={[external.mh_15, external.fd_row, external.ai_center]}>
                <Plus color={appColors.titleText} />
                <Text style={[styles.addToBeg, {color: textColorStyle}]}>
                  Add to Bag
                </Text>
              </View>
            </View>
          }
          value={
            <TouchableOpacity
              onPress={() => navigation.navigate('AddtocartOne')}
              style={[external.fd_row, external.ai_center, external.pt_4]}>
              <Cart />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
};

export default ProductDetailThree;
