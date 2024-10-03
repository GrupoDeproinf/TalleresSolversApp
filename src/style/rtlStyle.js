export const textRTLStyle = value => {
  var direction = value ? 'right' : 'left';
  return direction;
};
export const viewRTLStyle = value => {
  var direction = value ? 'row-reverse' : 'row';
  return direction;
};
export const imageRTLStyle = value => {
  var direction = value ? -1 : 1;
  return direction;
};
export const viewSelfRTLStyle = value => {
  var direction = value ? 'flex-start' : 'flex-end';
  return direction;
};
