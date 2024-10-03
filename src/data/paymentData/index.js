import images from '../../utils/images';

export const otherPaymentMode = [
  {
    id: 0,
    title: 'transData.masterCard',
    subtitle: 'transData.ExpiresOn',
    img: images.masterCard,
  },
  {
    id: 1,
    title: 'transData.masterCard',
    subtitle: 'transData.ExpiresOn',
    img: images.visa,
  },
  {
    id: 2,
    img: images.apple,
    subtitle: 'transData.upiId',
    title: 'transData.applePay',
  },
  {
    id: 3,
    img: images.gpay,
    title: 'transData.googlePay',
    subtitle: 'transData.upiId',
  },
];
