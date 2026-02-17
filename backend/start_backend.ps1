Set-Location $PSScriptRoot

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host "Starting Flask backend server..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    $env:FLASK_APP = "api/app.py"
    $env:FLASK_DEBUG = "1"
    Write-Host "Note: Create a .env file in backend/ for production use" -ForegroundColor Yellow
}

$pythonCmd = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} else {
    Write-Host "Error: Python not found. Please install Python or add it to PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Using Python command: $pythonCmd" -ForegroundColor Green
Write-Host ""

& $pythonCmd RUN_ME.py
