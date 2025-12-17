#!/bin/bash

# Skrypt do uruchamiania testów dla zmigrowanych komponentów
# Użycie: ./scripts/test-migrated.sh [component]

set -e

MIGRATED_COMPONENTS=(
  # Będą dodawane w miarę migracji
)

if [ -z "$1" ]; then
  echo "🧪 Testing all migrated components..."
  echo ""
  
  if [ ${#MIGRATED_COMPONENTS[@]} -eq 0 ]; then
    echo "⚠️  No components migrated yet"
    exit 0
  fi
  
  for comp in "${MIGRATED_COMPONENTS[@]}"; do
    echo "Testing $comp..."
    npm test -- --group "$comp" || exit 1
  done
  
  echo ""
  echo "✅ All migrated components passed!"
else
  echo "🧪 Testing $1..."
  npm test -- --group "$1"
fi
