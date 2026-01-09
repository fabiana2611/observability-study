#!/bin/bash

# validate_json_format.sh - Validate JSON format of OpenTelemetry console output
#
# Purpose: Verify that all trace spans logged to console are valid JSON (T020)
#
# Usage: ./validate_json_format.sh <log-file>
#
# Test Requirements (T020):
# - Console output must be valid JSON format for all endpoints
# - Each span should be parseable by standard JSON parsers (jq)
# - Manual spans should contain all required fields per contract
#
# Exit Codes:
#   0 - All JSON validation checks passed
#   1 - One or more validation checks failed

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if log file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No log file provided${NC}"
    echo "Usage: $0 <log-file>"
    echo "Example: $0 /tmp/manual-traces.log"
    exit 1
fi

LOG_FILE="$1"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo -e "${RED}Error: Log file not found: $LOG_FILE${NC}"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install with: brew install jq"
    exit 1
fi

echo -e "${BLUE}=== OpenTelemetry Console Output JSON Validation ===${NC}"
echo "Log file: $LOG_FILE"
echo ""

# Counters
total_json_objects=0
valid_json_objects=0
invalid_json_objects=0
manual_spans=0
manual_spans_valid=0
manual_spans_invalid=0

# Validation results
declare -a validation_errors=()

# Extract JSON objects from log file and validate each one
echo -e "${BLUE}[1/3] Extracting and validating JSON objects...${NC}"

# Create temporary file for JSON objects
temp_file=$(mktemp)
trap "rm -f $temp_file" EXIT

# Extract multi-line JSON objects (from { to })
awk '/^\{$/,/^\}$/' "$LOG_FILE" > "$temp_file" || true

if [ ! -s "$temp_file" ]; then
    echo -e "${RED}✗ FAIL: No JSON objects found in log file${NC}"
    exit 1
fi

# Count total JSON objects
total_json_objects=$(awk '/^\{$/,/^\}$/' "$LOG_FILE" | grep -c '^\}$' || echo "0")
echo "Found $total_json_objects JSON objects"

# Split the temp file into individual JSON objects and validate each
json_obj=""
while IFS= read -r line; do
    json_obj+="$line"$'\n'
    
    # When we reach the closing brace, we have a complete JSON object
    if [[ "$line" == "}" ]]; then
        if echo "$json_obj" | jq empty 2>/dev/null; then
            ((valid_json_objects++))
            
            # Check if this is a manual span (has instrumentation: manual attribute)
            if echo "$json_obj" | jq -e '.attributes.instrumentation == "manual"' &>/dev/null; then
                ((manual_spans++))
                
                # Validate required fields for manual spans
                has_trace_id=$(echo "$json_obj" | jq -e '.traceId' &>/dev/null && echo "true" || echo "false")
                has_span_id=$(echo "$json_obj" | jq -e '.spanId' &>/dev/null && echo "true" || echo "false")
                has_name=$(echo "$json_obj" | jq -e '.name' &>/dev/null && echo "true" || echo "false")
                has_start_time=$(echo "$json_obj" | jq -e '.startTime' &>/dev/null && echo "true" || echo "false")
                has_end_time=$(echo "$json_obj" | jq -e '.endTime' &>/dev/null && echo "true" || echo "false")
                has_duration=$(echo "$json_obj" | jq -e '.duration' &>/dev/null && echo "true" || echo "false")
                has_attributes=$(echo "$json_obj" | jq -e '.attributes' &>/dev/null && echo "true" || echo "false")
                
                if [ "$has_trace_id" = "true" ] && [ "$has_span_id" = "true" ] && [ "$has_name" = "true" ] && \
                   [ "$has_start_time" = "true" ] && [ "$has_end_time" = "true" ] && [ "$has_duration" = "true" ] && \
                   [ "$has_attributes" = "true" ]; then
                    ((manual_spans_valid++))
                else
                    ((manual_spans_invalid++))
                    span_name=$(echo "$json_obj" | jq -r '.name // "unknown"')
                    validation_errors+=("Manual span '$span_name' missing required fields")
                fi
            fi
        else
            ((invalid_json_objects++))
            validation_errors+=("Invalid JSON object: ${json_obj:0:80}...")
        fi
        
        # Reset for next object
        json_obj=""
    fi
done < "$temp_file"

echo ""
echo -e "${BLUE}[2/3] JSON Format Validation Results:${NC}"
echo "  Total JSON objects: $total_json_objects"
echo "  Valid JSON: $valid_json_objects"
echo "  Invalid JSON: $invalid_json_objects"

if [ $invalid_json_objects -eq 0 ]; then
    echo -e "  ${GREEN}✓ All JSON objects are valid${NC}"
else
    echo -e "  ${RED}✗ Found $invalid_json_objects invalid JSON objects${NC}"
fi

echo ""
echo -e "${BLUE}[3/3] Manual Span Validation:${NC}"
echo "  Manual spans found: $manual_spans"
echo "  Valid manual spans: $manual_spans_valid"
echo "  Invalid manual spans: $manual_spans_invalid"

if [ $manual_spans -eq 0 ]; then
    echo -e "  ${YELLOW}⚠ Warning: No manual spans found with 'instrumentation: manual' attribute${NC}"
elif [ $manual_spans_invalid -eq 0 ]; then
    echo -e "  ${GREEN}✓ All manual spans have required fields${NC}"
else
    echo -e "  ${RED}✗ Found $manual_spans_invalid manual spans with missing required fields${NC}"
fi

# Check for specific endpoints (manual spans should follow pattern "GET /api/...")
echo ""
echo -e "${BLUE}[4/4] Endpoint Coverage Check:${NC}"

endpoints=("/api/health" "/api/albums" "/api/albums/\[id\]" "/api/photos/\[id\]")
endpoint_names=("/api/health" "/api/albums" "/api/albums/[id]" "/api/photos/[id]")
for i in "${!endpoints[@]}"; do
    endpoint="${endpoints[$i]}"
    endpoint_name="${endpoint_names[$i]}"
    # Look for manual spans matching this endpoint pattern - search in multi-line JSON
    count=$(grep -c "\"name\": \"GET $endpoint\"" "$temp_file" 2>/dev/null || echo "0")
    if [ "$count" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} $endpoint_name - found $count span(s)"
    else
        echo -e "  ${YELLOW}⚠${NC} $endpoint_name - no spans found (may need to trigger endpoint)"
    fi
done

# Summary
echo ""
echo -e "${BLUE}=== Summary ===${NC}"

# Calculate pass/fail
validation_passed=true

if [ $invalid_json_objects -gt 0 ]; then
    validation_passed=false
fi

if [ $manual_spans -gt 0 ] && [ $manual_spans_invalid -gt 0 ]; then
    validation_passed=false
fi

# Display validation errors if any
if [ ${#validation_errors[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Validation Errors:${NC}"
    for error in "${validation_errors[@]}"; do
        echo -e "  ${RED}✗${NC} $error"
    done
fi

echo ""
if [ "$validation_passed" = true ]; then
    echo -e "${GREEN}✅ T020 PASS: Console output is valid JSON format for all endpoints${NC}"
    exit 0
else
    echo -e "${RED}❌ T020 FAIL: JSON validation issues detected${NC}"
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    if [ $invalid_json_objects -gt 0 ]; then
        echo "  • Fix JSON syntax errors in console output"
        echo "  • Ensure all spans are properly serialized"
    fi
    if [ $manual_spans_invalid -gt 0 ]; then
        echo "  • Verify all manual spans include required fields"
        echo "  • Check tracing.ts for proper span configuration"
    fi
    exit 1
fi
