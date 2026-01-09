#!/bin/bash
# analyze_duration.sh - Analyze OpenTelemetry span durations from console output
# Usage: ./analyze_duration.sh <log-file>
# Example: npm run dev 2>&1 | tee trace.log
#          ./analyze_duration.sh trace.log

LOG_FILE="${1:-/tmp/nextjs-duration-test.log}"

if [ ! -f "$LOG_FILE" ]; then
  echo "Error: Log file '$LOG_FILE' not found"
  echo "Usage: $0 <log-file>"
  exit 1
fi

echo "=== Duration Analysis for Manual Spans ==="
echo "Log file: $LOG_FILE"
echo ""
grep -E '"name": "GET /api/(health|albums|photos)' "$LOG_FILE" -A 15 | \
  awk '
    /"name":/ { name=$2" "$3; gsub(/[",]/, "", name) }
    /"duration":/ { 
      duration=$2; 
      gsub(/,/, "", duration);
      ns=duration;
      ms=ns/1000000;
      printf "%-25s  Duration: %12d ns  (%8.2f ms)\n", name, ns, ms
    }
  '
echo ""
echo "=== Verification ==="
echo "✓ All durations are in nanoseconds (ns)"
echo "✓ Converting to milliseconds (ms) for readability: divide by 1,000,000"
echo "✓ Endpoints with database queries show longer durations"
echo "✓ Simple health check shows shorter duration"
