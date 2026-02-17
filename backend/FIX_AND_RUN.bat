@echo off
REM Comprehensive fix and run script
cd /d "%~dp0"

echo ============================================================
echo BACKEND FIX AND RUN SCRIPT
echo ============================================================
echo.

REM Step 1: Upgrade pip
echo [1/4] Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% NEQ 0 (
    echo Failed to upgrade pip!
    pause
    exit /b 1
)
echo.

REM Step 2: Install dependencies
echo [2/4] Installing dependencies from requirements.txt...
python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: Some dependencies may have failed to install.
    echo Continuing anyway...
)
echo.

REM Step 3: Run diagnostic
echo [3/4] Running diagnostic check...
python DIAGNOSE.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Diagnostic found issues. Check the output above.
    echo.
    pause
    exit /b 1
)
echo.

REM Step 4: Start server
echo [4/4] Starting Flask server...
echo.
python RUN_ME.py

pause
