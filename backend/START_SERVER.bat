@echo off
REM Start the Flask backend server with visible output
cd /d "%~dp0"

echo ============================================================
echo Starting Flask Backend Server
echo ============================================================
echo.

REM Check if Flask is installed
python -c "import flask" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Flask is not installed!
    echo.
    echo Installing dependencies...
    echo.
    python -m pip install --upgrade pip setuptools wheel
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed!
    echo.
)

echo Starting server...
echo.
python RUN_ME.py

pause
