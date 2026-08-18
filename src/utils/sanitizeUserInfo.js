// Elimina campos sensibles (p. ej. la contraseña) antes de persistir el
// objeto de usuario en el almacenamiento local del dispositivo.
//
// AsyncStorage NO está cifrado: cualquier acceso al almacenamiento de la app
// (o un respaldo del dispositivo) podría leer su contenido en texto plano.
// Por eso la contraseña nunca debe guardarse ahí. (APP-05)
const SENSITIVE_USER_FIELDS = ['password', 'clave', 'contrasena', 'contraseña'];

export const sanitizeUserInfo = user => {
  if (!user || typeof user !== 'object') {
    return user;
  }
  const clean = {...user};
  SENSITIVE_USER_FIELDS.forEach(field => {
    if (field in clean) {
      delete clean[field];
    }
  });
  return clean;
};

export default sanitizeUserInfo;
