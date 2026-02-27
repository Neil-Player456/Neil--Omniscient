@echo off
REM Simple script to restart the backend server on Windows

echo Stopping any running Flask processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *RUN_ME*" 2>nul
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd /d "%~dp0"
python RUN_ME.py
pause
