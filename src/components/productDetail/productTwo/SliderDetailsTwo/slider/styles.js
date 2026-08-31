import {StyleSheet} from 'react-native';
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from '../../../../../themes/appConstant';
import {external} from '../../../../../style/external.css';
import {commonStyles} from '../../../../../style/commonStyle.css';

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: windowHeight(10),
  },
  card: {
    borderRadius: 10,
    alignSelf: 'center',
  },
  cardText: {
    height: windowHeight(201),
    width: windowWidth(201),
    resizeMode: 'contain',
  },
  contentContainer: {
    alignItems: 'center',
    right: 20,
  },
  barContainer: {
    height: 4,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  bar: {
    height: 4,
    borderRadius: 10,
  },
  chairColors: {
    width: windowHeight(22),
    height: windowHeight(22),
    borderRadius: windowHeight(11),
    borderWidth: 5,
    marginLeft: windowWidth(4),
  },
  colorMap: {
    height: 20,
    width: 20,
    borderRadius: 20,
    marginVertical: 1,
    marginBottom: 25,
    marginHorizontal: 5,
  },
  linear: {
    ...external.ph_20,
    backgroundColor: '#23262c',
    width: '55%',
    height: 330,
    position: 'absolute',
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 20,
  },
  text: {
    ...commonStyles.titleText19,
    marginLeft: '20%',
    fontSize: fontSizes.FONT21,
  },
  viewStyle: {
    flexDirection: 'row',
    bottom: 50,
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
  },
});

export {styles};
