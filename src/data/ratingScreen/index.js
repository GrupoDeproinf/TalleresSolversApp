import {
  arleneMcCoy,
  arleneMcCoyDesc,
  average,
  cameronWilliamson,
  cameronWilliamsonDesc,
  excellent,
  headPhonesWork,
  kathrynMurphy,
  poor,
  sophieChaudhary,
  sophieChaudharyDesc,
  veryGood,
} from '../../constant';
import {windowWidth} from '../../themes/appConstant';
import images from '../../utils/images';

export const ratingScreen = [
  {
    id: 0,
    title: 'Excelente',
    range: 65,
    width: windowWidth(190),
  },
  {
    id: 1,
    title: 'Muy Bien',
    range: 35,
    width: windowWidth(120),
  },
  {
    id: 2,
    title: 'Promedio',
    range: 15,
    width: windowWidth(73),
  },
  {
    id: 2,
    title: 'Pobre',
    range: 15,
    width: windowWidth(33),
  },
];

export const otherReview = [
  {
    id: 0,
    title: sophieChaudhary,
    subtitle: sophieChaudharyDesc,
    hours: '2 hour ago',
    img: images.profileOne,
  },
  {
    id: 0,
    title: kathrynMurphy,
    subtitle: headPhonesWork,
    img: images.profileTwo,
    hours: '1 hour ago',
  },
  {
    id: 0,
    title: arleneMcCoy,
    subtitle: arleneMcCoyDesc,
    img: images.profileThree,
    hours: '45 min ago',
  },
  {
    id: 0,
    title: cameronWilliamson,
    subtitle: cameronWilliamsonDesc,
    img: images.profileFour,
    hours: '45 min ago',
  },
];
