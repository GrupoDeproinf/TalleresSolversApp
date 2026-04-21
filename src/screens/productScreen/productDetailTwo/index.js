import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {external} from '../../../style/external.css';
import {commonStyles} from '../../../style/commonStyle.css';
import appColors from '../../../themes/appColors';
import {windowWidth} from '../../../themes/appConstant';
import styles from './style.css';
import {Plus} from '../../../utils/icon';
import NewArrivalBigContainer from '../../../components/homeScreenTwo/newArrivalTwoContainer';
import {newArrivalBigData} from '../../../data/homeScreenTwo/newArrivalData';
import BottomContainer from '../../../commonComponents/bottomContainer';
import {Cart} from '../../../assets/icons/cart';
import H3HeadingCategory from '../../../commonComponents/headingCategory/H3HeadingCategory';
import {Table, TableWrapper, Row, Rows} from 'react-native-table-component';
import {useValues} from '../../../../App';
import DescText from '../../../components/productDetail/productTwo/descText';
import KeyFeatureContainer from '../../../components/productDetail/productTwo/keyFeaturesContainer';
import IconContainer from '../../../components/productDetail/productTwo/iconContainer';
import SliderDetailsTwo from '../../../components/productDetail/productTwo/SliderDetailsTwo';
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

const ProductDetailTwo = ({navigation}) => {
  const [data, setData] = useState(tableData);
  const {bgFullStyle, textColorStyle, isDark} = useValues();
  return (
    <View
      style={[commonStyles.commonContainer, {backgroundColor: bgFullStyle}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <SliderDetailsTwo />
          <View style={[external.mh_20]}>
            <DescText />
            <View style={styles.container}>
              <Table
                style={styles.tableStyle}
                borderStyle={{
                  borderWidth: 1,
                  borderColor: isDark ? '#24272d' : '#EDF0FF',
                }}>
                <Row
                  data={data.tableHead}
                  flexArr={[1, 2, 2]}
                  style={styles.head}
                  textStyle={styles.text}
                />
                <TableWrapper style={styles.wrapper}>
                  <Rows
                    data={data.tableData}
                    flexArr={[1, 2, 1]}
                    style={styles.row}
                    textStyle={styles.textTwo}
                  />
                </TableWrapper>
              </Table>
            </View>
          </View>
          <IconContainer />
          <KeyFeatureContainer />
          <NewArrivalBigContainer
            data={newArrivalBigData}
            horizontal={true}
            width={windowWidth(220)}
          />
        </View>
      </ScrollView>
      <H3HeadingCategory />
      <View>
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

export default ProductDetailTwo;
