# Solvers · Guía visual (una página)

Esta guía aplica a toda pantalla nueva o rediseñada de la app. Los valores viven en `src/ui/tokens.js` y los componentes en `src/ui/index.js`. No copies colores ni tamaños a mano: impórtalos.

## Color

| Uso | Token | Valor |
|---|---|---|
| Base, títulos, barras | `colors.navy` | `#1F2344` |
| Enlaces, acento informativo | `colors.blue` | `#000B7E` |
| **Solo la acción principal de la pantalla** | `colors.yellow` | `#FFD60A` |
| Fondo de pantalla | `colors.bg` | `#F5F6FA` |
| Texto secundario | `colors.muted` | `#5B6078` |
| Estado: bien / abierto / aprobado | `colors.ok` sobre `okBg` | verde |
| Estado: en revisión / por vencer | `colors.warn` sobre `warnBg` | naranja |
| Estado: error / cerrado / rechazado | `colors.error` sobre `errorBg` | rojo |

Solo hay un botón amarillo por pantalla. Verde, naranja y rojo se usan para estados, nunca para decorar.

## Tipografía: Inter, cuatro niveles

| Nivel | Token | Uso |
|---|---|---|
| Título | `type.title` (20, Bold) | Encabezado de sección |
| Subtítulo | `type.subtitle` (16, SemiBold) | Nombre en tarjetas, etiquetas |
| Cuerpo | `type.body` (15, Regular) | Texto corrido |
| Apoyo | `type.caption` (13, Medium) | Metadatos, ayudas |

`type.display` (26, ExtraBold) se usa solo en el saludo del inicio. Usa `<AppText variant="…">`. En Android no combines `fontFamily` con `fontWeight`, porque cada peso tiene su propio archivo.

## Espaciado y forma

- Retícula de 8 px: `space.s` 8, `space.m` 16, `space.l` 24, `space.xl` 32.
- Esquinas: `radius.m` 14 en campos, `radius.l` 18 en tarjetas y botones, `radius.pill` en chips.
- Sombra única de tarjeta: `shadow.card`.

## Componentes

| Componente | Cuándo |
|---|---|
| `Button` | Cinco estados: normal, presionado, `loading`, `disabled`, `done`. Variantes: `primary` (azul), `accent` (amarillo, acción principal), `secondary`, `ghost` |
| `IconButton` | Botón de solo ícono. Siempre lleva `label` para el lector de pantalla |
| `Chip` | Categorías y filtros. El seleccionado va en amarillo |
| `Tag` | Estado (`ok`, `warn`, `error`, `info`, `neutral`) |
| `Card` / `TallerCard` | Tarjeta compacta: nombre · distancia · ★ · abierto/cerrado en una línea |
| `Banner` | Error o aviso con causa y acción ("No hay conexión · Reintentar") |
| `EmptyState` | Lista vacía: qué pasó y cuál es el siguiente paso |
| `Skeleton` / `TallerCardSkeleton` | Carga de listas, en lugar de un spinner a pantalla completa |
| `SearchBar`, `Segmented`, `BottomSheet` | Búsqueda, alternar vistas y acciones secundarias |
| `ContactBar` | Pie fijo de las fichas: Llamar · WhatsApp · Cómo llegar + acción principal |

Íconos: un solo set, `lucide-react-native`, con trazo 2–2.2.

## Accesibilidad mínima

- Contraste de 4.5:1 o más. Los tokens de texto ya lo cumplen sobre blanco y sobre `bg`.
- Áreas táctiles de 44 px o más (`TOUCH`).
- El texto respeta el tamaño del sistema hasta ×1.3 (`MAX_FONT_SCALE`).
- Todo botón de solo ícono lleva `accessibilityLabel`.

## Mensajes

- Siempre di qué pasa y qué sigue: "No hay conexión a internet. Revisa tu señal y toca Reintentar."
- Nunca muestres códigos, inglés ni "campo inválido". Para errores del servidor usa `mensajeDeError()` (`src/components/registro/validators.js`).
