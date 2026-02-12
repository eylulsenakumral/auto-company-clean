#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR***REMOVED***"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PORT***REMOVED***"${PORT:-8791}"
BASE_URL***REMOVED***"${BASE_URL:-http://127.0.0.1:${PORT}}"
DB_NAME***REMOVED***"${DB_NAME:-ar-assistant-db}"
PERSIST_DIR***REMOVED***"${PERSIST_DIR:-.wrangler/pilot-smoke}"
CSV_FILE***REMOVED***"${CSV_FILE:-sample/invoices.sample.csv}"
LOG_DIR***REMOVED***"${LOG_DIR:-logs}"
RUN_TS***REMOVED***"$(date +%Y%m%d-%H%M%S)"
RUN_LOG***REMOVED***"${RUN_LOG:-${LOG_DIR}/pilot-smoke-${RUN_TS}.log}"

mkdir -p "$LOG_DIR"

echo "[pilot-smoke] starting"
echo "[pilot-smoke] root***REMOVED***$ROOT_DIR"
echo "[pilot-smoke] base_url***REMOVED***$BASE_URL"
echo "[pilot-smoke] persist_dir***REMOVED***$PERSIST_DIR"

rm -rf "$PERSIST_DIR"
mkdir -p "$PERSIST_DIR"

exec > >(tee -a "$RUN_LOG") 2>&1

DEV_PID***REMOVED***""
cleanup() {
  if [[ -n "$DEV_PID" ]] && kill -0 "$DEV_PID" 2>/dev/null; then
    echo "[pilot-smoke] stopping wrangler dev pid***REMOVED***$DEV_PID"
    kill "$DEV_PID" >/dev/null 2>&1 || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[pilot-smoke] missing command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd node
require_cmd npx
require_cmd sed

if [[ ! -f "$CSV_FILE" ]]; then
  echo "[pilot-smoke] CSV file not found: $CSV_FILE" >&2
  exit 1
fi

# Ensure a clean local schema in isolated storage.
printf 'y\n' | npx wrangler d1 migrations apply "$DB_NAME" --local --persist-to "$PERSIST_DIR"

WRANGLER_LOG***REMOVED***"$LOG_DIR/pilot-smoke-wrangler-${RUN_TS}.log"

echo "[pilot-smoke] starting wrangler dev"
npx wrangler dev --local --port "$PORT" --persist-to "$PERSIST_DIR" >"$WRANGLER_LOG" 2>&1 &
DEV_PID***REMOVED***$!

for _ in $(seq 1 60); do
  if curl -fsS "$BASE_URL/" >/dev/null 2>&1; then
    echo "[pilot-smoke] server ready"
    break
  fi
  sleep 0.5
done

if ! curl -fsS "$BASE_URL/" >/dev/null 2>&1; then
  echo "[pilot-smoke] worker failed to boot; see $WRANGLER_LOG" >&2
  exit 1
fi

post_expect_status() {
  local path***REMOVED***"$1"
  local expect_status_csv***REMOVED***"$2"
  local extra_arg***REMOVED***"${3:-}"
  local headers body status
  headers***REMOVED***"$(mktemp)"
  body***REMOVED***"$(mktemp)"
  if [[ -n "$extra_arg" ]]; then
    curl -sS -X POST -D "$headers" -o "$body" $extra_arg "$BASE_URL$path"
  else
    curl -sS -X POST -D "$headers" -o "$body" "$BASE_URL$path"
  fi
  status***REMOVED***"$(awk 'NR***REMOVED******REMOVED***1{print $2}' "$headers")"
  local matched***REMOVED***"false"
  local expect
  IFS***REMOVED***',' read -r -a expect <<<"$expect_status_csv"
  for code in "${expect[@]}"; do
    if [[ "$status" ***REMOVED******REMOVED*** "$code" ]]; then
      matched***REMOVED***"true"
      break
    fi
  done
  if [[ "$matched" !***REMOVED*** "true" ]]; then
    echo "[pilot-smoke] unexpected status for POST $path: got***REMOVED***$status expect_one_of***REMOVED***$expect_status_csv" >&2
    echo "[pilot-smoke] response preview:" >&2
    sed -n '1,40p' "$body" >&2
    rm -f "$headers" "$body"
    exit 1
  fi
  echo "[pilot-smoke] POST $path -> $status"
  rm -f "$headers" "$body"
}

echo "[pilot-smoke] step***REMOVED***init-defaults"
post_expect_status "/init-defaults" "200,303"

echo "[pilot-smoke] step***REMOVED***import-csv"
post_expect_status "/import/csv" "200" "-F file***REMOVED***@${CSV_FILE};type***REMOVED***text/csv"

echo "[pilot-smoke] step***REMOVED***cadence-run"
cadence_body***REMOVED***"$(mktemp)"
curl -sS -X POST "$BASE_URL/cadence/run" -o "$cadence_body"
if ! rg -q "Cadence run complete" "$cadence_body"; then
  echo "[pilot-smoke] cadence run did not complete as expected" >&2
  sed -n '1,80p' "$cadence_body" >&2
  rm -f "$cadence_body"
  exit 1
fi
if ! rg -q "Drafts created: <code>2</code>" "$cadence_body"; then
  echo "[pilot-smoke] unexpected created draft count in cadence output" >&2
  rg -n "Drafts created|Skipped" "$cadence_body" >&2 || true
  rm -f "$cadence_body"
  exit 1
fi
rm -f "$cadence_body"
echo "[pilot-smoke] cadence created 2 drafts"

queue_pending***REMOVED***"$(mktemp)"
curl -sS "$BASE_URL/queue?status***REMOVED***pending" -o "$queue_pending"
DRAFT_ID***REMOVED***"$(sed -n 's#.*action***REMOVED***"/queue/\([a-z0-9-]*\)/approve".*#\1#p' "$queue_pending" | head -n1)"
if [[ -z "$DRAFT_ID" ]]; then
  echo "[pilot-smoke] failed to extract draft id from pending queue" >&2
  sed -n '1,120p' "$queue_pending" >&2
  rm -f "$queue_pending"
  exit 1
fi
if rg -q "send (resend)" "$queue_pending"; then
  echo "[pilot-smoke] expected resend send button to be absent when not configured" >&2
  rm -f "$queue_pending"
  exit 1
fi
rm -f "$queue_pending"

echo "[pilot-smoke] selected draft_id***REMOVED***$DRAFT_ID"

echo "[pilot-smoke] step***REMOVED***mark-sent-blocked-before-approve"
post_expect_status "/queue/${DRAFT_ID}/mark-sent" "303"

DRAFT_STATUS_SQL***REMOVED***"SELECT status FROM drafts WHERE id***REMOVED***'${DRAFT_ID}' LIMIT 1;"
draft_status_json***REMOVED***"$(npx wrangler d1 execute "$DB_NAME" --local --persist-to "$PERSIST_DIR" --command "$DRAFT_STATUS_SQL" --json)"
draft_status***REMOVED***"$(node -e 'const data***REMOVED***JSON.parse(process.argv[1]); console.log((data[0].results[0]||{}).status || "");' "$draft_status_json")"
if [[ "$draft_status" !***REMOVED*** "pending" ]]; then
  echo "[pilot-smoke] expected pending draft to stay pending before approval, got***REMOVED***$draft_status" >&2
  exit 1
fi
echo "[pilot-smoke] pre-approval guard ok (status stays pending)"

echo "[pilot-smoke] step***REMOVED***approve"
post_expect_status "/queue/${DRAFT_ID}/approve" "303"

echo "[pilot-smoke] step***REMOVED***mark-sent"
post_expect_status "/queue/${DRAFT_ID}/mark-sent" "303"

STATUS_SQL***REMOVED***"SELECT COALESCE(SUM(CASE WHEN status***REMOVED***'pending' THEN 1 ELSE 0 END),0) AS pending, COALESCE(SUM(CASE WHEN status***REMOVED***'approved' THEN 1 ELSE 0 END),0) AS approved, COALESCE(SUM(CASE WHEN status***REMOVED***'sent' THEN 1 ELSE 0 END),0) AS sent FROM drafts;"
EVENT_SQL***REMOVED***"SELECT type, COUNT(*) AS c FROM events GROUP BY type ORDER BY type;"

status_json***REMOVED***"$(npx wrangler d1 execute "$DB_NAME" --local --persist-to "$PERSIST_DIR" --command "$STATUS_SQL" --json)"
events_json***REMOVED***"$(npx wrangler d1 execute "$DB_NAME" --local --persist-to "$PERSIST_DIR" --command "$EVENT_SQL" --json)"

pending_count***REMOVED***"$(node -e 'const data***REMOVED***JSON.parse(process.argv[1]); console.log(data[0].results[0].pending);' "$status_json")"
approved_count***REMOVED***"$(node -e 'const data***REMOVED***JSON.parse(process.argv[1]); console.log(data[0].results[0].approved);' "$status_json")"
sent_count***REMOVED***"$(node -e 'const data***REMOVED***JSON.parse(process.argv[1]); console.log(data[0].results[0].sent);' "$status_json")"

if [[ "$pending_count" !***REMOVED*** "1" || "$approved_count" !***REMOVED*** "0" || "$sent_count" !***REMOVED*** "1" ]]; then
  echo "[pilot-smoke] unexpected draft status distribution: pending***REMOVED***$pending_count approved***REMOVED***$approved_count sent***REMOVED***$sent_count" >&2
  exit 1
fi

echo "[pilot-smoke] status distribution ok: pending***REMOVED***$pending_count approved***REMOVED***$approved_count sent***REMOVED***$sent_count"
echo "[pilot-smoke] event summary: $events_json"
echo "[pilot-smoke] PASS"
echo "[pilot-smoke] run log: $RUN_LOG"
echo "[pilot-smoke] wrangler log: $WRANGLER_LOG"
