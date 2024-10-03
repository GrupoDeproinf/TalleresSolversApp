import appColors from '../themes/appColors';

export const bgFullStyle = value => {
  var direction = value ? appColors.blackBg : appColors.lightScreenBg;
  return direction;
};
export const textColorStyle = value => {
  var direction = value ? appColors.screenBg : appColors.titleText;
  return direction;
};
export const iconColorStyle = value => {
  var direction = value ? appColors.screenBg : '#051E47';
  return direction;
};
export const linearColorStyle = value => {
  var direction = value
    ? ['#2B2D33', '#27282E', appColors.shadowColor]
    : [appColors.screenBg, appColors.screenBg];
  return direction;
};
export const subtitleColorStyle = value => {
  var direction = value ? appColors.screenBg : appColors.subtitle;
  return direction;
};
export const imageContainer = value => {
  var direction = value ? appColors.blackBg : appColors.bgLayout;
  return direction;
};
export const linearColorStyleTwo = value => {
  var direction = value
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg];
  return direction;
};
