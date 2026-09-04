#!/usr/bin/env bash
# Regenerates assets/og.png and assets/apple-touch-icon.png from tools/og-render.html
# and assets/favicon.svg using headless Chrome (ImageMagick cannot rasterize these correctly).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

shoot() { # src w h out
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$2,$3" \
    --virtual-time-budget=10000 --screenshot="$4" "file://$1" >/dev/null 2>&1
}

# 1200x630 Open Graph card
shoot "$ROOT/tools/og-render.html" 1200 630 "$ROOT/assets/og.png"

# Icon: Chrome ignores window widths under ~500px, so render at 512 and downscale.
cat > "$TMP/icon.html" <<HTML
<!DOCTYPE html><meta charset="utf-8">
<style>html,body{margin:0;background:#0A0A0B;width:512px;height:512px}
svg{display:block;width:512px;height:512px}</style>
$(cat "$ROOT/assets/favicon.svg")
HTML
shoot "$TMP/icon.html" 512 512 "$TMP/icon512.png"
cp "$TMP/icon512.png" "$ROOT/assets/icon-512.png"
sips -z 180 180 "$TMP/icon512.png" --out "$ROOT/assets/apple-touch-icon.png" >/dev/null

echo "og.png              $(sips -g pixelWidth -g pixelHeight "$ROOT/assets/og.png" | tail -2 | tr -d ' \n')"
echo "apple-touch-icon    $(sips -g pixelWidth -g pixelHeight "$ROOT/assets/apple-touch-icon.png" | tail -2 | tr -d ' \n')"
