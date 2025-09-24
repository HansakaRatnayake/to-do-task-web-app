#!/bin/sh
# wait-for-it.sh

set -e

hostport="$1"
shift
cmd="$@"

# Extract host from host:port format
host=$(echo "$hostport" | cut -d: -f1)

# Skip any "--" argument if present
if [ "$1" = "--" ]; then
  shift
  cmd="$@"
fi

until pg_isready -h "$host" -U "postgres"; do
  echo "Waiting for PostgreSQL at $host..."
  sleep 2
done

echo "PostgreSQL is up - executing command"
exec $cmd