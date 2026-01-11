# FarmSync Backend Server Startup Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "  FARM SYNC - BACKEND SERVER" -ForegroundColor Cyan
Write-Host "  Running on http://localhost:5000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Keep this window open!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Change to backend directory
Set-Location $PSScriptRoot

# Check if port 5000 is already in use
Write-Host "Checking if port 5000 is available..." -ForegroundColor Cyan
$existingProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingProcess) {
    $existingPid = $existingProcess.OwningProcess
    $existingProc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "⚠️  WARNING: Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Process: $($existingProc.ProcessName) (PID: $existingPid)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Close the other backend window that's using port 5000" -ForegroundColor White
    Write-Host "2. Or this script will try to stop it for you" -ForegroundColor White
    Write-Host ""
    $response = Read-Host "Do you want to stop the existing process? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        try {
            Stop-Process -Id $existingPid -Force -ErrorAction Stop
            Write-Host "✅ Stopped process PID $existingPid" -ForegroundColor Green
            Start-Sleep -Seconds 2
            Write-Host ""
        } catch {
            Write-Host "❌ Could not stop process. Please close it manually." -ForegroundColor Red
            Write-Host "Press any key to exit..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit
        }
    } else {
        Write-Host "Please close the other backend window first, then try again." -ForegroundColor Yellow
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
} else {
    Write-Host "✅ Port 5000 is available" -ForegroundColor Green
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Server may not start correctly without .env file." -ForegroundColor Yellow
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host ""
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
