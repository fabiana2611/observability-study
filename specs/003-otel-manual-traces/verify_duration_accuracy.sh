#!/bin/bash
# verify_duration_accuracy.sh - Verify duration accuracy by comparing with timestamp differences
# Usage: ./verify_duration_accuracy.sh <log-file>
# Example: npm run dev 2>&1 | tee trace.log
#          ./verify_duration_accuracy.sh trace.log

LOG_FILE="${1:-/tmp/nextjs-duration-test.log}"

if [ ! -f "$LOG_FILE" ]; then
  echo "Error: Log file '$LOG_FILE' not found"
  echo "Usage: $0 <log-file>"
  exit 1
fi

echo "=== Verifying Duration Calculation Accuracy ==="
echo "Log file: $LOG_FILE"
echo ""
grep -E '"name": "GET /api/(health|albums|photos)' "$LOG_FILE" -A 15 | \
  awk '
    /"name":/ { 
      name=$2" "$3; 
      gsub(/[",]/, "", name);
    }
    /"startTime":/ {
      start=$2;
      gsub(/[",]/, "", start);
      # Parse ISO 8601 timestamp
      cmd = "date -j -f \"%Y-%m-%dT%H:%M:%S\" \"" substr(start, 1, 19) "\" +%s";
      cmd | getline start_sec;
      close(cmd);
      # Get milliseconds
      split(start, parts, ".");
      start_ms = substr(parts[2], 1, 3);
      start_total = start_sec * 1000 + start_ms;
    }
    /"endTime":/ {
      end=$2;
      gsub(/[",]/, "", end);
      # Parse ISO 8601 timestamp  
      cmd = "date -j -f \"%Y-%m-%dT%H:%M:%S\" \"" substr(end, 1, 19) "\" +%s";
      cmd | getline end_sec;
      close(cmd);
      # Get milliseconds
      split(end, parts, ".");
      end_ms = substr(parts[2], 1, 3);
      end_total = end_sec * 1000 + end_ms;
    }
    /"duration":/ {
      duration=$2;
      gsub(/,/, "", duration);
      
      # Calculate expected duration from timestamps (in ms)
      calc_duration_ms = end_total - start_total;
      # Convert recorded duration from ns to ms
      recorded_duration_ms = duration / 1000000;
      
      # Calculate difference
      diff = calc_duration_ms - recorded_duration_ms;
      if (diff < 0) diff = -diff;
      
      printf "%-25s  Recorded: %8.2f ms  Calculated: %8.2f ms  Diff: %6.2f ms\n", 
        name, recorded_duration_ms, calc_duration_ms, diff;
    }
  '
echo ""
echo "Note: Small differences (<1ms) are expected due to rounding in ISO 8601 millisecond precision"
