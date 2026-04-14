#!/usr/bin/env bash
set -euo pipefail

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
	docker compose up --build
elif command -v docker-compose >/dev/null 2>&1; then
	docker-compose up --build
else
	echo "Docker Compose is not available. Install docker compose plugin or docker-compose binary." >&2
	exit 1
fi
