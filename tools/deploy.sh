#!/usr/bin/env bash
# Deploy factory0.ventures from an up-to-date main.
#
#   tools/deploy.sh              deploy main
#   tools/deploy.sh 16           squash-merge PR #16 first, then deploy
#   tools/deploy.sh 16 --refresh ...and afterwards make every venture refetch its GitHub activity
#
# Runs from the repo root on purpose: wrangler reads functions/ and wrangler.toml from here.
set -euo pipefail
cd "$(dirname "$0")/.."

pr="" refresh=""
for a in "$@"; do
  case "$a" in
    --refresh) refresh=1 ;;
    *) pr="$a" ;;
  esac
done

[ -n "$pr" ] && gh pr merge "$pr" --squash --delete-branch
git checkout -q main
git pull -q --ff-only
./tools/build-dist.sh > /dev/null
npx wrangler pages deploy dist --project-name=factory-zero --branch=main
[ -n "$refresh" ] && node tools/setup-github-app.mjs --refresh
echo "Deployed $(git log --oneline -1)"
