@echo off
REM Backend startup script for Windows CMD - ensures correct directory and runs Flask
REM Note: This will open in cmd.exe. For Git Bash, use start_backend.sh instead

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Try py launcher first (Windows), then python
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set PYTHON_CMD=python
    ) else (
        echo Error: Python not found. Please install Python or add it to PATH.
        pause
        exit /b 1
    )
)

echo Using Python command: %PYTHON_CMD%
echo.

REM Check if Flask is installed
%PYTHON_CMD% -c "import flask" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Flask not found. Installing dependencies...
    echo.
    %PYTHON_CMD% -m pip install --no-cache-dir -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Failed to install dependencies. Please run manually:
        echo   %PYTHON_CMD% -m pip install -r requirements.txt
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Starting backend server...
echo.

REM Run the backend script
%PYTHON_CMD% RUN_ME.py

pause
