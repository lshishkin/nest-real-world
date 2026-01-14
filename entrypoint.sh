#!/bin/sh
set -e

echo "Running migrations..."
npm run migration:run

echo "Starting application..."
exec node dist/main