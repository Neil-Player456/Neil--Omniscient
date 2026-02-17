@echo off
REM Install Python dependencies for the backend
REM This avoids PowerShell issues

echo ============================================================
echo Installing Python dependencies...
echo ============================================================
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Upgrade pip, setuptools, and wheel first
echo Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel
if %ERRORLEVEL% NEQ 0 (
    echo Failed to upgrade pip/setuptools/wheel
    pause
    exit /b 1
)

echo.
echo Installing dependencies from requirements.txt...
python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to install some dependencies.
    echo You may need to install them manually.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Dependencies installed successfully!
echo ============================================================
echo.
echo You can now run: python RUN_ME.py
echo.
pause
