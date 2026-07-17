#!/usr/bin/env bash
set -euo pipefail

# Gera o APK do SeniorEase (Android) para instalar em um emulador local.
# Requisitos: Android SDK, Java 17 e um emulador em execucao (adb).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
APK_PATH="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"

echo "==> Instalando dependencias"
pnpm install

echo "==> Gerando projeto nativo Android (expo prebuild)"
pnpm --filter @senior-ease/mobile exec expo prebuild --platform android --clean

echo "==> Compilando APK de release"
cd "$MOBILE_DIR/android"
./gradlew assembleRelease

echo "==> APK gerado em: $APK_PATH"

if command -v adb >/dev/null 2>&1 && [ -n "$(adb devices | sed -n '2p')" ]; then
  echo "==> Emulador detectado. Instalando APK"
  adb install -r "$APK_PATH"
  echo "==> Instalado. Abra o app SeniorEase no emulador."
else
  echo "==> Nenhum emulador detectado. Para instalar manualmente:"
  echo "    adb install -r \"$APK_PATH\""
fi
