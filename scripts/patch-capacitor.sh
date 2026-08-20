#!/bin/bash
# Patches Capacitor 3 Bridge.java to remove setAppCacheEnabled (removed in API 33+)
# Run this after npm install or if the build fails with "cannot find symbol setAppCacheEnabled"

BRIDGE_FILE="node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/Bridge.java"

if [ -f "$BRIDGE_FILE" ]; then
  if grep -q "settings.setAppCacheEnabled" "$BRIDGE_FILE"; then
    sed -i '' 's/settings.setAppCacheEnabled(true);/\/\/ settings.setAppCacheEnabled(true); \/\/ Removed in API 33+/' "$BRIDGE_FILE"
    echo "Patched Bridge.java: removed setAppCacheEnabled"
  else
    echo "Bridge.java already patched"
  fi
else
  echo "Bridge.java not found - skipping patch"
fi
