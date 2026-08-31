#import <React/RCTBridgeModule.h>

// Exposes el módulo Swift RNMapboxNavigation al bridge de React Native
@interface RCT_EXTERN_MODULE(RNMapboxNavigation, NSObject)

// Cancela la pre-carga (usuario cerró el preview sin navegar)
RCT_EXTERN_METHOD(cancelPreview)

// Pre-calcula la ruta mientras el usuario ve el preview
RCT_EXTERN_METHOD(
  prepareNavigation:(double)originLat
  originLng:(double)originLng
  destLat:(double)destLat
  destLng:(double)destLng
  destName:(NSString *)destName
)

// Pre-renderiza el mapa de navegación en segundo plano (detrás del WebView),
// con voz silenciada, listo para ser revelado sin demora al presionar ¡Vamos!
RCT_EXTERN_METHOD(
  preloadNavigationUI:(double)originLat
  originLng:(double)originLng
  destLat:(double)destLat
  destLng:(double)destLng
  destName:(NSString *)destName
)

// Lanza la navegación (revela la UI pre-cargada si está lista, o la calcula)
RCT_EXTERN_METHOD(
  navigate:(double)originLat
  originLng:(double)originLng
  destLat:(double)destLat
  destLng:(double)destLng
  destName:(NSString *)destName
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
