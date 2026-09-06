#!/usr/bin/env bash
# Assembles dist/ — the exact set of files that should be public.
# An explicit allowlist, so repo tooling can never leak onto the site by accident.
# There is no build step for development: serve the repo root directly.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist

# top-level files
for f in index.html 404.html robots.txt sitemap.xml llms.txt site.webmanifest _headers; do
  cp "$f" dist/
done

# directories served as-is
for d in assets .well-known ventures system technology thesis about enter; do
  cp -R "$d" "dist/$d"
done

find dist -name '.DS_Store' -delete

# Cache busting. Asset filenames are not content-hashed in the repo, so a deploy
# alone cannot invalidate a cached CSS/JS file and visitors keep running the old
# one. Stamp each reference with a short content hash here; _headers can then
# cache /assets/*.css and *.js immutably because the URL changes when they do.
for f in fz.css fz-common.js fz-data.js fz-app.js fz-ventures.js fz-enter.js; do
  h=$(shasum -a 256 "dist/assets/$f" | cut -c1-8)
  find dist -name '*.html' -exec sed -i '' "s|/assets/$f\"|/assets/$f?v=$h\"|g" {} +
done
# the README banner is for GitHub, not the site
rm -f dist/assets/readme-banner.png

echo "dist/ assembled:"
find dist -type f | sed 's|^dist/|  |' | sort
echo "  ($(find dist -type f | wc -l | tr -d ' ') files)"
