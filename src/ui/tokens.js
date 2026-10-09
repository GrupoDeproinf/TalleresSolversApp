// Sistema visual único de Solvers (propuesta de mejora, sección 5).
//
// Reglas:
// - Azul marino de base. El amarillo se reserva para la acción principal de
//   cada pantalla. Verde, naranja y rojo solo para estados.
// - Inter en cuatro niveles: título, subtítulo, cuerpo y apoyo.
// - Retícula de 8 px. Áreas táctiles de 44 px o más. Contraste mínimo 4.5:1.
//
// Cualquier pantalla nueva o rediseñada debe tomar sus valores de aquí.

export const colors = {
  navy: '#1F2344',
  blue: '#000B7E',
  yellow: '#FFD60A',
  yellowPressed: '#E6BF00',

  bg: '#F5F6FA',
  card: '#FFFFFF',
  border: '#E3E5EE',
  skeleton: '#E8EAF2',

  text: '#1F2344',
  muted: '#5B6078', // 6.3:1 sobre blanco
  placeholder: '#8A90A6',
  onNavy: '#FFFFFF',
  onNavyMuted: '#C5C8DA',

  ok: '#1E7F46', // 5.1:1 sobre okBg
  okBg: '#E7F6EE',
  warn: '#955800',
  warnBg: '#FFF4E0',
  error: '#C62828',
  errorBg: '#FDECEC',
  info: '#000B7E',
  infoBg: '#E8EAFB',

  whatsapp: '#128C4B',
  overlay: 'rgba(15, 18, 40, 0.55)',
};

// Línea gráfica de la campaña "Encuentra a los buenos aquí" (Solvers Mesa #2).
// Colores tomados de la guía; la huella de neumático está en assets/brand.
export const brand = {
  yellow: '#FCC800',
  yellowSoft: '#FEE666',
  navy: '#151D61',
  navyDeep: '#101A3E',
  headline: 'ENCUENTRA A LOS BUENOS AQUÍ.',
  tagline: 'Soluciones automotrices de confianza',
  promise: 'Tu carro pide, Solvers resuelve.',
  // Titular de campaña: negro, inclinado y en mayúsculas.
  headlineFont: 'Poppins-BlackItalic',
};

export const space = {xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48};

export const radius = {s: 10, m: 14, l: 18, xl: 24, pill: 999};

/**
 * Inter con un archivo por peso. En Android no se combina fontFamily
 * personalizada con fontWeight (rompe la fuente), por eso cada nivel ya trae
 * su archivo.
 */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
};

/** Cuatro niveles de lectura. `display` solo para el saludo del inicio. */
export const type = {
  display: {fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32},
  title: {fontFamily: fonts.bold, fontSize: 20, lineHeight: 26},
  subtitle: {fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22},
  body: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 22},
  caption: {fontFamily: fonts.medium, fontSize: 13, lineHeight: 18},
};

export const shadow = {
  card: {
    shadowColor: '#1F2344',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  bar: {
    shadowColor: '#1F2344',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
};

/** Tamaño táctil mínimo (Apple HIG / Material). */
export const TOUCH = 44;

/** Evita que la tipografía del sistema rompa el diseño, sin ignorarla. */
export const MAX_FONT_SCALE = 1.3;
