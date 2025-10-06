#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Compile Move package"
aptos move compile --package-dir .

echo "Publish to network (requires configured profile)"
aptos move publish --package-dir . --profile ${APTOS_PROFILE:-default}
