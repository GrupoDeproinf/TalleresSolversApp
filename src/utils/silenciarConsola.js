// En producción no se escribe nada en el log del teléfono.
//
// La app tiene cientos de console.log, varios con datos personales del
// usuario (correo, teléfono, tokens). En Android cualquier app con permiso de
// depuración o un cable USB puede leer ese log, y además cada llamada cuesta
// tiempo en teléfonos de gama media. En desarrollo (__DEV__) todo sigue igual.
// Los cierres inesperados los sigue registrando Crashlytics.
if (!__DEV__) {
  const nada = () => {};
  console.log = nada;
  console.info = nada;
  console.debug = nada;
  console.warn = nada;
  console.error = nada;
  console.trace = nada;
}
