@echo off
cd /d "%~dp0"
echo.
echo   VYORA - Music Without Borders.
echo   Starting local server...
echo.
echo   Open in your browser:
echo     http://127.0.0.1:3456
echo     http://localhost:3456
echo.
echo   Press Ctrl+C to stop.
echo.
python -m http.server 3456
pause
