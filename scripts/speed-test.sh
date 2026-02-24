#!/bin/bash
# 10 speed tests for dev server (run: npm run dev in another terminal first)
BASE="http://localhost:3000"
echo "=== Speed tests (10 runs) ==="
for i in 1 2 3 4 5 6 7 8 9 10; do
  t=$(curl -s -o /dev/null -w "%{time_total}" "$BASE/")
  echo "Run $i: ${t}s"
done
echo "--- Event page ---"
for i in 1 2 3; do
  t=$(curl -s -o /dev/null -w "%{time_total}" "$BASE/events/bloom-of-energy")
  echo "Event $i: ${t}s"
done
echo "=== Done ==="
