#!/bin/bash
# Translation generator using the Next.js API endpoint
# Calls one translation at a time with 10s delay between calls
# Usage: bash generate-translations-api.sh hi   (for Hindi)
#        bash generate-translations-api.sh te   (for Telugu)

LANG=${1:-hi}
API_BASE="http://localhost:3000/api/skill-tree"
DELAY=10  # seconds between API calls

echo "=== Translation Generator via API - $LANG ==="
echo "Started at: $(date)"

# Get all node IDs
NODES=$(curl -s "$API_BASE/realms" | python3 -c "
import json, sys
data = json.load(sys.stdin)
# We need to get node IDs from the realms
# Let's just iterate through realms
for r in data.get('realms', []):
    print(r['realmNumber'])
" 2>/dev/null)

if [ -z "$NODES" ]; then
    echo "Failed to fetch realms. Is the dev server running?"
    exit 1
fi

TOTAL_SUCCESS=0
TOTAL_FAILED=0

for REALM_NUM in $NODES; do
    echo ""
    echo "--- Processing Realm $REALM_NUM ---"

    # Get nodes in this realm
    NODE_IDS=$(curl -s "$API_BASE/realm/$REALM_NUM" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for n in data.get('nodes', []):
    print(n['nodeId'])
" 2>/dev/null)

    if [ -z "$NODE_IDS" ]; then
        echo "No nodes found for realm $REALM_NUM"
        continue
    fi

    for NODE_ID in $NODE_IDS; do
        echo -n "  Translating $NODE_ID to $LANG... "

        RESULT=$(curl -s -X POST "$API_BASE/admin/generate-translation" \
            -H "Content-Type: application/json" \
            -d "{\"nodeId\": \"$NODE_ID\", \"lang\": \"$LANG\"}" 2>&1)

        if echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('success') else 1)" 2>/dev/null; then
            echo "OK"
            TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
        elif echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('message') else 1)" 2>/dev/null; then
            echo "ALREADY DONE"
        else
            ERROR=$(echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('details','Unknown')[:60])" 2>/dev/null || echo "$RESULT" | head -1 | cut -c1-60)
            echo "FAILED: $ERROR"
            TOTAL_FAILED=$((TOTAL_FAILED + 1))

            # If rate limited, wait longer
            if echo "$ERROR" | grep -qi "429\|rate\|too many"; then
                echo "  Rate limited, waiting 60s..."
                sleep 60
            fi
        fi

        sleep $DELAY
    done
done

echo ""
echo "=== Complete ==="
echo "Success: $TOTAL_SUCCESS, Failed: $TOTAL_FAILED"
echo "Finished at: $(date)"
