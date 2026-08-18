import {Dimensions, PixelRatio, Platform} from 'react-native';

export let SCREEN_HEIGHT = Dimensions.get('window').height;
export let SCREEN_WIDTH = Dimensions.get('window').width;

export const IsIOS = Platform.OS === 'ios';
export const IsIPAD = Platform.isPad;

export const IsHaveNotch = SCREEN_HEIGHT > 750;

export const Isiphone12promax = Platform.OS === 'ios' && SCREEN_HEIGHT > 2778;

export const windowHeight = height => {
  let tempHeight = SCREEN_HEIGHT * parseFloat(height / 667);
  return PixelRatio.roundToNearestPixel(tempHeight);
};

export const windowWidth = width => {
  let tempWidth = SCREEN_WIDTH * parseFloat(width / 480);
  return PixelRatio.roundToNearestPixel(tempWidth);
};

// Escalado tipográfico ACOTADO. (APP-18)
// El escalado por ancho (width/480) hacía el texto diminuto en pantallas
// angostas y enorme en tablets (factor hasta ~1.67). Se acota el factor a un
// rango sensato SOLO para las fuentes; windowWidth se deja intacto porque
// también se usa para anchos de layout (que sí deben escalar proporcional).
const FONT_SCALE_MIN = 0.7;
const FONT_SCALE_MAX = 1.2;

export const scaleFont = size => {
  const widthScale = SCREEN_WIDTH / 480;
  const clamped = Math.min(Math.max(widthScale, FONT_SCALE_MIN), FONT_SCALE_MAX);
  return PixelRatio.roundToNearestPixel(size * clamped);
};

export const fontSizes = {
  FONT6: scaleFont(6),
  FONT7: scaleFont(7),
  FONT8: scaleFont(8),
  FONT9: scaleFont(9),
  FONT10: scaleFont(10),
  FONT11: scaleFont(11),
  FONT12: scaleFont(12),
  FONT13: scaleFont(13),
  FONT14: scaleFont(14),
  FONT15: scaleFont(15),
  FONT16: scaleFont(16),
  FONT17: scaleFont(17),
  FONT18: scaleFont(18),
  FONT19: scaleFont(19),
  FONT20: scaleFont(20),
  FONT21: scaleFont(21),
  FONT22: scaleFont(22),
  FONT23: scaleFont(23),
  FONT24: scaleFont(24),
  FONT25: scaleFont(25),
  FONT26: scaleFont(26),
  FONT27: scaleFont(27),
  FONT28: scaleFont(28),
  FONT30: scaleFont(30),
  FONT33: scaleFont(33),
  FONT37: scaleFont(37),
  FONT45: scaleFont(45),
};
