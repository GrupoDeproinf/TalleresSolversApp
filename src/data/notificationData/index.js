import {
  discountAvailable,
  newProduct,
  newProductDesc,
  orderComplete,
  recommendedNotifi,
  shippingAddress,
  shippingAddressDesc,
  specialOffer,
  specialOfferDesc,
  threeMinAgo,
  twentyhourago,
  twoMinAgo,
  yourOrder,
} from '../../constant';
import {
  Complete,
  LocationNotification,
  Offer,
  Products,
} from '../../utils/icon';

export const notificationData = [
  {
    time: 'Today',
    data: [
      {
        id: 0,
        title: discountAvailable,
        subttile: recommendedNotifi,
        time: twoMinAgo,
        isread: 0,
        icon: <Offer />,
      },
      {
        id: 1,
        title: shippingAddress,
        subttile: shippingAddressDesc,
        time: twoMinAgo,
        isread: 0,
        icon: <LocationNotification />,
      },
      {
        id: 2,
        title: newProduct,
        subttile: newProductDesc,
        time: threeMinAgo,
        isread: 1,
        icon: <Products />,
      },
    ],
  },
  {
    time: 'Yesterday',
    data: [
      {
        id: 0,
        title: orderComplete,
        subttile: yourOrder,
        time: twentyhourago,
        isread: 1,
        icon: <Complete />,
      },
      {
        id: 1,
        title: specialOffer,
        subttile: specialOfferDesc,
        time: twentyhourago,
        isread: 1,
        icon: <Offer />,
      },
    ],
  },
];
