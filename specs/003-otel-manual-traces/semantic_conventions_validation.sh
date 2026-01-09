#!/bin/bash
# semantic_conventions_validation.sh - Validate OpenTelemetry Semantic Conventions
# 
# This script validates that all traces follow OpenTelemetry semantic conventions:
# - Span names follow meaningful patterns
# - Resource attributes use correct semantic convention keys
# - HTTP attributes match OTel specifications
# - Span kind is set to SERVER for HTTP handlers
#
# Usage: ./semantic_conventions_validation.sh <log-file>
# Example: npm run dev 2>&1 | tee trace.log
#          ./semantic_conventions_validation.sh ../../trace.log

LOG_FILE="${1:-/tmp/verify-us3-clean.log}"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Error: Log file '$LOG_FILE' not found"
  echo "Usage: $0 <log-file>"
  exit 1
fi

echo "======================================================================"
echo "  OpenTelemetry Semantic Conventions Validation"
echo "======================================================================"
echo "Log file: $LOG_FILE"
echo ""

# Track validation results
PASS_COUNT=0
FAIL_COUNT=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to report test result
report_test() {
  local test_name="$1"
  local status="$2"
  local details="$3"
  
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    [ -n "$details" ] && echo "  $details"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "${RED}✗${NC} $test_name"
    [ -n "$details" ] && echo "  $details"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo "----------------------------------------------------------------------"
echo "T027: Validate Span Names Follow Meaningful Pattern"
echo "----------------------------------------------------------------------"
echo "Expected pattern: '<METHOD> <ROUTE>' (e.g., 'GET /api/albums')"
echo ""

# Extract manual span names
SPAN_NAMES=$(grep '"instrumentation": "manual"' "$LOG_FILE" -B 15 | grep '"name":' | grep -v '"instrumentation"' | sed 's/.*"name": "\([^"]*\)".*/\1/' | sort -u)

if [ -z "$SPAN_NAMES" ]; then
  report_test "T027: Span names found" "FAIL" "No manual spans found in log file"
else
  report_test "T027: Span names found" "PASS" "$(echo "$SPAN_NAMES" | wc -l | xargs) unique span names"
  
  # Validate each span name follows pattern
  echo ""
  echo "Span Names Found:"
  PATTERN_VALID=true
  while IFS= read -r name; do
    # Skip empty lines
    [ -z "$name" ] && continue
    
    if [[ "$name" =~ ^[A-Z]+\ /api/.+ ]]; then
      echo "  ✓ $name"
    else
      echo "  ✗ $name (does not match pattern)"
      PATTERN_VALID=false
    fi
  done <<< "$SPAN_NAMES"
  
  if [ "$PATTERN_VALID" = true ]; then
    report_test "T027: All span names follow pattern" "PASS" "METHOD /api/route format"
  else
    report_test "T027: All span names follow pattern" "FAIL" "Some names don't match expected pattern"
  fi
fi

echo ""
echo "----------------------------------------------------------------------"
echo "T028: Validate Resource Attributes Use Semantic Convention Keys"
echo "----------------------------------------------------------------------"
echo "Expected keys: service.name, service.version, deployment.environment, host.name"
echo ""

# Check for resource attributes
RESOURCE_ATTRS=$(grep -A 5 '"resource":' "$LOG_FILE" | grep '"service.name"\|"service.version"\|"deployment.environment"\|"host.name"' | sed 's/.*"\([^"]*\)": "\([^"]*\)".*/\1: \2/' | sort -u)

if [ -z "$RESOURCE_ATTRS" ]; then
  report_test "T028: Resource attributes found" "FAIL" "No resource attributes found"
else
  report_test "T028: Resource attributes found" "PASS" ""
  
  # Check each required attribute
  echo ""
  echo "Resource Attributes Found:"
  echo "$RESOURCE_ATTRS" | while IFS= read -r attr; do
    echo "  ✓ $attr"
  done
  
  # Validate all required attributes are present
  REQUIRED_ATTRS=("service.name" "service.version" "deployment.environment" "host.name")
  ALL_PRESENT=true
  
  for attr in "${REQUIRED_ATTRS[@]}"; do
    if ! echo "$RESOURCE_ATTRS" | grep -q "^$attr:"; then
      echo "  ✗ Missing: $attr"
      ALL_PRESENT=false
    fi
  done
  
  if [ "$ALL_PRESENT" = true ]; then
    report_test "T028: All required resource attributes present" "PASS" "4/4 attributes found"
  else
    report_test "T028: All required resource attributes present" "FAIL" "Some required attributes missing"
  fi
fi

echo ""
echo "----------------------------------------------------------------------"
echo "T029: Validate HTTP Attributes Match OpenTelemetry Specifications"
echo "----------------------------------------------------------------------"
echo "Expected keys: http.request.method, http.route, http.response.status_code"
echo ""

# Extract HTTP attributes from manual spans
HTTP_ATTRS=$(grep '"instrumentation": "manual"' "$LOG_FILE" -B 10 | grep -E '"http\.(request\.method|route|response\.status_code)"' | sed 's/.*"\([^"]*\)": \([^,]*\).*/\1: \2/' | sort -u)

if [ -z "$HTTP_ATTRS" ]; then
  report_test "T029: HTTP attributes found" "FAIL" "No HTTP attributes found in manual spans"
else
  report_test "T029: HTTP attributes found" "PASS" ""
  
  echo ""
  echo "HTTP Attributes Found:"
  echo "$HTTP_ATTRS" | while IFS= read -r attr; do
    echo "  ✓ $attr"
  done
  
  # Validate required HTTP attributes
  REQUIRED_HTTP_ATTRS=("http.request.method" "http.route" "http.response.status_code")
  HTTP_ALL_PRESENT=true
  
  for attr in "${REQUIRED_HTTP_ATTRS[@]}"; do
    if ! echo "$HTTP_ATTRS" | grep -q "^$attr:"; then
      echo "  ✗ Missing: $attr"
      HTTP_ALL_PRESENT=false
    fi
  done
  
  if [ "$HTTP_ALL_PRESENT" = true ]; then
    report_test "T029: All HTTP semantic conventions present" "PASS" "3/3 HTTP attributes found"
  else
    report_test "T029: All HTTP semantic conventions present" "FAIL" "Some HTTP attributes missing"
  fi
  
  # Check for custom instrumentation attribute
  if grep -q '"instrumentation": "manual"' "$LOG_FILE"; then
    report_test "T029: Custom 'instrumentation' attribute present" "PASS" "Value: 'manual'"
  else
    report_test "T029: Custom 'instrumentation' attribute present" "FAIL" "Not found in manual spans"
  fi
fi

echo ""
echo "----------------------------------------------------------------------"
echo "T030: Validate Span Kind is Set to SERVER"
echo "----------------------------------------------------------------------"
echo "Expected: \"kind\": 1 (SpanKind.SERVER)"
echo ""

# Extract span kinds from manual spans
SPAN_KINDS=$(grep '"instrumentation": "manual"' "$LOG_FILE" -B 10 | grep '"kind":' | sed 's/.*"kind": \([0-9]*\).*/\1/' | sort -u)

if [ -z "$SPAN_KINDS" ]; then
  report_test "T030: Span kind found" "FAIL" "No span kind found in manual spans"
else
  report_test "T030: Span kind found" "PASS" ""
  
  # Count spans by kind
  KIND_1_COUNT=$(echo "$SPAN_KINDS" | grep -c "^1$" || true)
  KIND_OTHER_COUNT=$(echo "$SPAN_KINDS" | grep -cv "^1$" || true)
  
  echo ""
  echo "Span Kinds Found:"
  echo "$SPAN_KINDS" | while IFS= read -r kind; do
    case $kind in
      0) echo "  ✗ kind: $kind (INTERNAL - should be SERVER)" ;;
      1) echo "  ✓ kind: $kind (SERVER)" ;;
      2) echo "  ✗ kind: $kind (CLIENT - should be SERVER)" ;;
      3) echo "  ✗ kind: $kind (PRODUCER - should be SERVER)" ;;
      4) echo "  ✗ kind: $kind (CONSUMER - should be SERVER)" ;;
      *) echo "  ✗ kind: $kind (UNKNOWN)" ;;
    esac
  done
  
  if [ "$KIND_OTHER_COUNT" -eq 0 ] && [ "$KIND_1_COUNT" -gt 0 ]; then
    report_test "T030: All manual spans use SERVER kind" "PASS" "All spans are kind: 1 (SERVER)"
  else
    report_test "T030: All manual spans use SERVER kind" "FAIL" "Some spans use incorrect kind"
  fi
fi

echo ""
echo "======================================================================"
echo "  Validation Summary"
echo "======================================================================"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
if [ $TOTAL_TESTS -eq 0 ]; then
  echo "⚠️  No tests were run - please check the log file"
  exit 1
fi

echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ All semantic convention validations passed!${NC}"
  echo ""
  echo "Your OpenTelemetry instrumentation follows industry best practices:"
  echo "  • Meaningful span names with HTTP method and route"
  echo "  • Standard resource attributes for service identification"
  echo "  • HTTP semantic conventions for request/response attributes"
  echo "  • Correct span kind (SERVER) for HTTP endpoint handlers"
  exit 0
else
  echo -e "${RED}✗ Some validations failed${NC}"
  echo ""
  echo "Please review the failed tests above and ensure:"
  echo "  1. Span names follow 'METHOD /api/route' pattern"
  echo "  2. Resource attributes include service.name, service.version, etc."
  echo "  3. HTTP attributes use http.request.method, http.route, http.response.status_code"
  echo "  4. All endpoint spans use SpanKind.SERVER (kind: 1)"
  exit 1
fi
