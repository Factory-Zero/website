#!/usr/bin/env bash
# Regenerates assets/og.png and assets/apple-touch-icon.png from tools/og-render.html
# and assets/favicon.svg using headless Chrome (ImageMagick cannot rasterize these correctly).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

shoot() { # src w h out [scale]
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor="${5:-1}" --window-size="$2,$3" \
    --virtual-time-budget=10000 --screenshot="$4" "file://$1" >/dev/null 2>&1
}

# 1200x630 Open Graph card
shoot "$ROOT/tools/og-render.html" 1200 630 "$ROOT/assets/og.png"

# Per-page Open Graph cards
urlenc() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
card() { # out title kicker sub
  shoot "$ROOT/tools/og-render.html?t=$(urlenc "$2")&k=$(urlenc "$3")&s=$(urlenc "$4")" \
    1200 630 "$ROOT/assets/$1"
}
card og-ventures.png "Every venture runs on the same factory core." "VENTURE REGISTRY" \
  "Each keeps its own brand, customers, data boundaries and economics."
card og-system.png "Three layers. One factory." "SYSTEM / ARCHITECTURE" \
  "A shared core, venture services built on it, and isolated ventures."
card og-thesis.png "The company is becoming software." "THESIS / WORKING PAPER" \
  "What changes when coordination costs fall toward the cost of compute."
card og-about.png "We build and own real companies." "ABOUT / FZ" \
  "A network of autonomous agents does the work of running them. Not a fund, an accelerator or an agency."
card og-enter.png "Enter Factory Zero" "ACCESS REQUEST" \
  "Build with us, invest, partner or join. A human reads every request."

# README banner, rendered at 2x so it stays crisp on retina
shoot "$ROOT/tools/banner-render.html" 1280 400 "$ROOT/assets/readme-banner.png" 2

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

echo "readme-banner.png   $(sips -g pixelWidth -g pixelHeight "$ROOT/assets/readme-banner.png" | tail -2 | tr -d ' \n')"
echo "og.png              $(sips -g pixelWidth -g pixelHeight "$ROOT/assets/og.png" | tail -2 | tr -d ' \n')"
echo "apple-touch-icon    $(sips -g pixelWidth -g pixelHeight "$ROOT/assets/apple-touch-icon.png" | tail -2 | tr -d ' \n')"
