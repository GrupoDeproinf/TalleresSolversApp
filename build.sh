#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GRADLE_FILE="android/app/build.gradle"

echo "=========================================="
echo "📱 Build Solvers - Android"
echo "=========================================="
echo ""

# ── Versión actual
CURRENT_CODE=$(grep 'versionCode' "$GRADLE_FILE" | grep -o '[0-9]\+')
CURRENT_NAME=$(grep 'versionName' "$GRADLE_FILE" | grep -o '"[^"]*"' | tr -d '"')

echo "Versión actual: $CURRENT_NAME (versionCode: $CURRENT_CODE)"
echo ""

# ── Pedir nueva versión
read -p "Nuevo número de versión (ej: 1.1.0) [Enter para mantener '$CURRENT_NAME']: " VERSION
if [[ -z "$VERSION" ]]; then
    VERSION="$CURRENT_NAME"
else
    if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "⚠️  Formato recomendado: X.Y.Z (ej: 1.1.0)"
        read -p "¿Continuar de todos modos? (s/n): " CONFIRM
        [[ ! "$CONFIRM" =~ ^[sS]$ ]] && exit 1
    fi
fi

read -p "Nuevo versionCode (entero, ej: $((CURRENT_CODE + 1))) [Enter para autoincrement]: " VERSION_CODE
if [[ -z "$VERSION_CODE" ]]; then
    VERSION_CODE=$((CURRENT_CODE + 1))
fi
if [[ ! "$VERSION_CODE" =~ ^[0-9]+$ ]]; then
    echo "❌ El versionCode debe ser un número entero."
    exit 1
fi
if [[ "$VERSION_CODE" -le "$CURRENT_CODE" ]]; then
    echo "❌ El versionCode ($VERSION_CODE) debe ser mayor al actual ($CURRENT_CODE). Google Play lo rechazará."
    exit 1
fi

echo ""
echo "------------------------------------------"
echo "  versionName:  $CURRENT_NAME → $VERSION"
echo "  versionCode:  $CURRENT_CODE → $VERSION_CODE"
echo "------------------------------------------"
read -p "¿Aplicar y compilar? (s/n): " APPLY
[[ ! "$APPLY" =~ ^[sS]$ ]] && echo "Cancelado." && exit 0

# ── Actualizar build.gradle
sed -i '' "s/versionCode $CURRENT_CODE/versionCode $VERSION_CODE/" "$GRADLE_FILE"
sed -i '' "s/versionName \"$CURRENT_NAME\"/versionName \"$VERSION\"/" "$GRADLE_FILE"
echo ""
echo "✅ versionCode:  $CURRENT_CODE → $VERSION_CODE"
echo "✅ versionName:  $CURRENT_NAME → $VERSION"

# ── Compilar
cd android
echo ""
echo "=========================================="
echo "📦 Generando APK..."
echo "=========================================="
./gradlew assembleRelease

echo ""
echo "=========================================="
echo "📦 Generando Bundle (AAB)..."
echo "=========================================="
./gradlew bundleRelease
cd ..

echo ""
echo "=========================================="
echo "✅ Compilación completada"
echo "=========================================="
echo ""
echo "  APK:    android/app/build/outputs/apk/release/app-release.apk"
echo "  Bundle: android/app/build/outputs/bundle/release/app-release.aab"
echo ""

open android/app/build/outputs
