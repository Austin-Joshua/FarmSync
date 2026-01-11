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

# Start the server
try {
    npm run dev
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
