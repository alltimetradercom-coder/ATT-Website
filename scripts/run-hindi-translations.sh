#!/bin/bash
# Hindi Translation Runner
# Keeps running the translation script until all nodes are translated
# Run: bash scripts/run-hindi-translations.sh

cd /home/z/my-project

echo "=== Hindi Translation Runner ==="
echo "Started at: $(date)"
echo ""

while true; do
  # Check how many nodes still need translation
  REMAINING=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function main() {
      const count = await prisma.node.count({ where: { content: { not: null }, contentHi: null } });
      console.log(count);
    }
    main().catch(() => console.log(999)).finally(() => prisma.\$disconnect());
  " 2>/dev/null)
  
  echo "[$(date)] Remaining nodes: $REMAINING"
  
  if [ "$REMAINING" = "0" ] || [ "$REMAINING" = "" ]; then
    echo "All nodes translated! Done."
    break
  fi
  
  echo "[$(date)] Running translation script..."
  node scripts/generate-hindi-translations.js
  
  EXIT_CODE=$?
  echo "[$(date)] Script exited with code: $EXIT_CODE"
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(date)] Script failed. Waiting 5 minutes before retry..."
    sleep 300
  fi
done

echo "=== Completed at: $(date) ==="
