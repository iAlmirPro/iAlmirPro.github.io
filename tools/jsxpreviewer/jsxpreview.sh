#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# dev.sh — local JSX browser preview with live rebuild
# Usage:  ./dev.sh [file.jsx]
#         defaults to input.jsx
# ─────────────────────────────────────────────────────────

DIR="$(cd "$(dirname "$0")" && pwd)"
BUNDLE="$DIR/__bundle.jsx"
PORT=7743

# Resolve SRC: absolute path, path relative to CWD, or filename inside jsxpreviewer dir
if [ -z "$1" ]; then
  SRC="$DIR/input.jsx"
elif [[ "$1" == /* ]]; then
  SRC="$1"
else
  # relative to CWD (where the script was called from)
  SRC="$(cd "$(dirname "$1")" 2>/dev/null && pwd)/$(basename "$1")"
fi
JSX="$(basename "$SRC")"

if [ ! -f "$SRC" ]; then
  echo "❌  File not found: $SRC"
  exit 1
fi

# ── bundle function ────────────────────────────────────────
build() {
  {
    echo 'const { useState, useEffect, useRef, useReducer, useCallback, useMemo, useContext, useLayoutEffect } = React;'
    sed \
      -e '/^import /d' \
      -e '/^const {[^}]*} = React;/d' \
      -e '/^export default /s/export default /const __DefaultExport = /' \
      -e 's|https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css|http://127.0.0.1:'"$PORT"'/bootstrap.min.css|g' \
      -e 's|https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js|http://127.0.0.1:'"$PORT"'/d3.min.js|g' \
      -e 's|https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js|http://127.0.0.1:'"$PORT"'/topojson.min.js|g' \
      -e 's|https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json|http://127.0.0.1:'"$PORT"'/countries-50m.json|g' \
      "$SRC"
    printf '\n;(function(){\n  const root = ReactDOM.createRoot(document.getElementById("root"));\n  root.render(React.createElement(__DefaultExport));\n})();\n'
  } > "$BUNDLE"
}

# ── initial build ──────────────────────────────────────────
echo "📦  Building $JSX → __bundle.jsx"
build
echo "✅  Bundle ready"

# ── kill any old server on the port ───────────────────────
lsof -ti tcp:$PORT | xargs kill -9 2>/dev/null || true
sleep 1

# ── start no-cache HTTP server ─────────────────────────────
cd "$DIR"
python3 server.py $PORT &
SERVER_PID=$!
echo "🖥️   Server on http://127.0.0.1:$PORT  (PID $SERVER_PID)"

sleep 0.4
open "http://127.0.0.1:$PORT/index.html"

echo ""
echo "👀  Watching for changes — save $JSX then ⌘R in browser"
echo "    Ctrl+C to stop"
echo ""

# ── cleanup on exit ────────────────────────────────────────
trap "kill $SERVER_PID 2>/dev/null; echo '🛑  Stopped'; exit 0" INT TERM

# ── watch loop ─────────────────────────────────────────────
LAST_MOD=""
while true; do
  MOD=$(stat -f "%m" "$SRC" 2>/dev/null)
  if [ "$MOD" != "$LAST_MOD" ]; then
    [ -n "$LAST_MOD" ] && echo "🔄  Change detected — rebuilding…"
    build
    echo "✅  Bundle updated — hit ⌘R"
    LAST_MOD="$MOD"
  fi
  sleep 0.5
done
