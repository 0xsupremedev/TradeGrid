#!/usr/bin/env bash
set -euo pipefail

echo "Starting demo via docker compose..."
cd "$(dirname "$0")/../infra"
docker compose up --build -d
echo "Visit http://localhost:3000"


