# SolversApp — Contexto del proyecto

## Stack técnico
- **React Native** 0.79.2 · New Architecture (Bridgeless/Fabric) · `newArchEnabled=true`
- **React** 19.0.0
- **Android**: AGP 8.8.2 · Gradle 8.13 · NDK 27.1.12297006 · `minSdk` 24 · `targetSdk` 35
- **iOS**: Xcode · Team ID `HQ927CYR6D`
- **Hermes** habilitado · `hermesEnabled=true`
- **Node ARM64**: `~/.nvm/versions/node/v22.14.0/bin/node` (el v14 del PATH es x86, no usar)

## Rutas clave
| Qué | Ruta |
|---|---|
| App React Native | `/Users/evanderalvarado/Documents/Proyectoreactnative/appTestReactNative` |
| Backend Node/Express | `/Users/evanderalvarado/Documents/Deproinf/TalleresSolverBack` |
| Script build Android | `./build.sh` (genera APK + AAB release) |
| Parches node_modules | `patches/` · aplicados con `patch-package` vía `postinstall` |
| Script 16KB ELF | `scripts/patch_elf_16kb.py` |

## Backend
- **Framework**: Express + Firebase Admin (Firestore)
- **URL producción**: `https://apisolvers.solversapp.com/api`
- **Instancia Axios**: `axiosInstance.js` en la raíz del proyecto RN
- **Rutas**: `src/routes/` · Servicios: `src/services/`

### Endpoints importantes
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/home/addCommentToService` | Calificación → `Servicios/{uid}/calificaciones` |
| POST | `/home/addCommentToTaller` | Calificación → `Usuarios/{uid_taller}/calificaciones` |
| POST | `/home/getCommentsByService` | Comentarios de un servicio |
| POST | `/usuarios/getServiceByUid` | Detalle de servicio |
| POST | `/usuarios/getUserByUid` | Datos de usuario/taller |

## Arquitectura de navegación
- **React Navigation**: Stack + Bottom Tabs + Drawer
- `TallerDetail` → params: `{ tallerId, uid_taller, tallerData }`
- `ProductDetailOne` → params: `{ uid, typeUser }`
- `RatingScreen` → params: `{ dataComments, dataAverage, id, dataTotal }`

## Roles de usuario
- `Cliente` — ve talleres y servicios, puede calificar, usa navegación Mapbox
- `Taller` — gestiona sus servicios y perfil
- Almacenado en `AsyncStorage` clave `@userInfo` → `{ uid, nombre, email, typeUser, token, ... }`

## Mapbox Navigation (Android + iOS)
- **Módulo nativo**: `RNMapboxNavigation` en `NativeModules`
- **Componente**: `src/commonComponents/MapboxNavigation/index.js`
- **En Android** la navegación usa `NavigationActivity` (Modal RN en window separada)
- **En iOS** usa pre-carga + zoom cinematográfico
- **Props clave**: `visible`, `destinationLat/Lng`, `destinationName`, `onClose`, `onFinish`
- `onFinish` → se llama cuando el usuario llega al destino (promise `.then()` resuelve)
- `onClose` → se llama al presionar X manualmente
- **Actualmente (pruebas)**: la X también dispara `onFinish` via `handleClosePress()`

## Flujo de calificación post-navegación
```
Navegación termina (onFinish)
  → ArrivedModal ("¡Has llegado!" con Sparkles/Star de lucide)
      ├── "Calificar visita" → BeautifulModal (estrellas + tags + comentario)
      │     └── submit → API → RatingSuccessModal (muestra las N estrellas elegidas)
      └── "Omitir" → cierra sin calificar
```
- `BeautifulModal` se resetea automáticamente al abrirse (`useEffect` en `visible`)
- `RatingSuccessModal` NO se cierra solo, espera que el usuario presione "¡Perfecto!"
- Las estrellas del `RatingSuccessModal` muestran la cantidad que seleccionó el usuario

### Pantallas que usan el flujo
| Pantalla | Endpoint calificación | Colección Firestore |
|---|---|---|
| `TallerDetail` | `addCommentToTaller` | `Usuarios/{uid_taller}/calificaciones` |
| `ProductDetailOne` | `addCommentToService` | `Servicios/{uid_service}/calificaciones` |

## Componentes comunes importantes
| Componente | Ruta |
|---|---|
| `MapboxNavigation` | `src/commonComponents/MapboxNavigation/index.js` |
| `ArrivedModal` | `src/commonComponents/ArrivedModal/index.js` |
| `RatingSuccessModal` | `src/commonComponents/RatingSuccessModal/index.js` |
| `BeautifulModal` (rating) | `src/screens/ratingScreen/components/modal.js` |

## Pantallas principales
| Pantalla | Ruta |
|---|---|
| `TallerDetail` | `src/screens/TallerDetail/index.js` |
| `ProductDetailOne` | `src/screens/productScreen/productDetailOne/index.js` |
| `RatingScreen` | `src/screens/ratingScreen/index.js` |
| `solicitudesTaller` | `src/screens/solicitudesTaller/index.js` |

## Librerías de iconos
- **Primaria**: `lucide-react-native` ^0.469.0
  - Iconos usados: `Star`, `Sparkles`, `Sparkle`, `PartyPopper`, `WandSparkles`, `HeartHandshake`, `X`, `ArrowLeft`, `MapPin`, `Phone`, `MessageCircle`, etc.
- **Secundaria**: `react-native-vector-icons/MaterialCommunityIcons`
- **SVG custom**: `src/utils/icon.js` → re-exporta SVGs de `src/assets/icons/`

## Google Play / Android 16 KB page size
Todas las `.so` deben tener `p_align >= 0x4000`. Solución implementada:

1. **Mapbox** (pre-compiladas): `afterEvaluate` en `android/app/build.gradle` ejecuta
   `scripts/patch_elf_16kb.py` después de `mergeReleaseNativeLibs`
   - Parcheadas: `libmapbox-common.so`, `libmapbox-maps.so`, `libnavigator-android.so`, `librnscreens.so`, `libreact_codegen_rnscreens.so`

2. **react-native-screens** (compilada desde source): patch en
   `patches/react-native-screens+3.37.0.patch` agrega `-Wl,-z,max-page-size=16384`
   al `CMakeLists.txt`. Se aplica via `postinstall` en `package.json`.

3. `gradle.properties`: `android.experimental.enableSupportFor16kPageSize=true`
4. `build.gradle`: `packaging { jniLibs { useLegacyPackaging = false } }`

## Fixes importantes ya aplicados
- **`TallerDetail` imagen crash Android**: función `resolveUri()` normaliza campos de
  imagen que pueden llegar como `string` o `array` del backend. Evita
  `ReadableNativeArray → String` crash en New Architecture.
- **MapboxNavigation back button**: `onRequestClose` guardado con `!launchedRef.current`
  para no cerrar el modal mientras navega.
- **Promise resolve**: `RNMapboxNavigation.navigate()` resuelve con `null` (no con
  `mapOf(...)`) para compatibilidad con New Architecture.

## Reglas del proyecto (IMPORTANTE)
- **Solo tocar archivos pedidos explícitamente** — no refactorizar sin solicitud
- **No renombrar ni mover archivos** sin confirmación
- **Variables de entorno sensibles**: `MAPBOX_DOWNLOADS_TOKEN` en `gradle.properties`
  (no subir a git)
- El backend está en un repo/directorio separado; cambios ahí requieren reinicio
  del servidor Node para aplicarse
