#!/bin/bash

# Cache Purge Script for FPL Axiom
# Triggers Next.js revalidation to clear cached pages

SITE_URL="https://fplaxiom.com"
PATHS=("/" "/fpl" "/luck" "/teams" "/matrix")

echo "🗑️  Purging Next.js Cache for FPL Axiom"
echo "=========================================="
echo ""

for path in "${PATHS[@]}"; do
  echo "📍 Revalidating: $path"

  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${SITE_URL}/api/revalidate?path=${path}")
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Success: $BODY"
  else
    echo "   ❌ Failed (HTTP $HTTP_CODE): $BODY"
  fi
  echo ""
done

echo "=========================================="
echo "✨ Cache purge complete!"
echo ""
echo "💡 Visit $SITE_URL to see fresh data"
