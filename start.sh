#!/bin/sh
cd "$(dirname "$0")"
echo ""
echo "  VYORA – Music Without Borders."
echo "  Starting local server..."
echo ""
echo "  Open in your browser:"
echo "    http://127.0.0.1:3456"
echo "    http://localhost:3456"
echo ""
echo "  Press Ctrl+C to stop."
echo ""
python3 -m http.server 3456
