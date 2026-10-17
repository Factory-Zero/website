#!/usr/bin/env bash
# Assembles dist/ — the exact set of files that should be public.
# An explicit allowlist, so repo tooling can never leak onto the site by accident.
# There is no build step for development: serve the repo root directly.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist

# top-level files
# _routes.json: only /api/* runs the Pages Functions Worker; every other path is served from the asset cache.
for f in index.html 404.html robots.txt sitemap.xml llms.txt stack.json site.webmanifest _headers _redirects _routes.json; do
  cp "$f" dist/
done

# directories served as-is
for d in assets .well-known ventures stack system technology thesis about enter venture-as-a-service; do
  cp -R "$d" "dist/$d"
done

find dist -name '.DS_Store' -delete

# Cache busting. Asset filenames are not content-hashed in the repo, so a deploy
# alone cannot invalidate a cached CSS/JS file and visitors keep running the old
# one. Stamp each reference with a short content hash here; _headers can then
# cache /assets/*.css and *.js immutably because the URL changes when they do.
for f in fz-ui.css fz-common.js fz-data.js fz-ui.js fz-timeline.js fz-ventures.js fz-enter.js; do
  h=$(shasum -a 256 "dist/assets/$f" | cut -c1-8)
  find dist -name '*.html' -exec sed -i '' "s|/assets/$f\"|/assets/$f?v=$h\"|g" {} +
done
# Brand files (favicon, app icons, OG cards) are cached hard by the zone too, so a
# changed logo or card keeps showing for days unless its URL changes. Stamp them
# the same way, in the HTML (relative and absolute URLs) and in the manifest.
for p in dist/assets/favicon.svg dist/assets/apple-touch-icon.png dist/assets/icon-512.png dist/assets/og*.png; do
  [ -f "$p" ] || continue
  f=$(basename "$p")
  h=$(shasum -a 256 "$p" | cut -c1-8)
  find dist -name '*.html' -exec sed -i '' -E "s#(/assets/$f)\"#\1?v=$h\"#g" {} +
  sed -i '' -E "s#(/assets/$f)\"#\1?v=$h\"#g" dist/site.webmanifest
done
# the README banner is for GitHub, not the site
rm -f dist/assets/readme-banner.png

echo "dist/ assembled:"
find dist -type f | sed 's|^dist/|  |' | sort
echo "  ($(find dist -type f | wc -l | tr -d ' ') files)"
