# FarmSync Phase 1 - Automated Start Script
# Run this script to start backend + frontend for testing

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          FarmSync Phase 1 - Quick Start                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colors
$success = "Green"
$error = "Red"
$warning = "Yellow"
$info = "Cyan"

function Show-Checklist {
    param([string]$title, [array]$items)
    Write-Host $title -ForegroundColor $info
    foreach ($item in $items) {
        Write-Host "  ☐ $item"
    }
    Write-Host ""
}

# Step 0: Pre-flight checks
Write-Host "Step 0: Checking Prerequisites..." -ForegroundColor $info
Write-Host ""

$errors = @()

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $errors += "❌ Node.js not found. Install from https://nodejs.org/"
}
else {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js $nodeVersion found" -ForegroundColor $success
}

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    $errors += "❌ npm not found"
}
else {
    $npmVersion = npm --version
    Write-Host "  ✅ npm $npmVersion found" -ForegroundColor $success
}

# Check if Backend folder exists
if (-not (Test-Path "Backend")) {
    $errors += "❌ Backend folder not found"
}
else {
    Write-Host "  ✅ Backend folder found" -ForegroundColor $success
}

# Check if Frontend folder exists
if (-not (Test-Path "Frontend")) {
    $errors += "❌ Frontend folder not found"
}
else {
    Write-Host "  ✅ Frontend folder found" -ForegroundColor $success
}

Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "🚨 Issues Found:" -ForegroundColor $error
    foreach ($err in $errors) {
        Write-Host "   $err"
    }
    Write-Host ""
    Write-Host "Please fix the above issues and run this script again." -ForegroundColor $warning
    exit 1
}

Write-Host "✅ All prerequisites found!" -ForegroundColor $success
Write-Host ""

# Step 1: Backend setup
Write-Host "Step 1: Installing Backend Dependencies..." -ForegroundColor $info
Write-Host ""

Push-Location Backend
if (Test-Path "node_modules") {
    Write-Host "  ℹ️  Backend already has node_modules, skipping install" -ForegroundColor $warning
}
else {
    Write-Host "  Installing npm packages..." -ForegroundColor $info
    npm install | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Backend dependencies installed" -ForegroundColor $success
    }
    else {
        Write-Host "  ❌ Failed to install backend dependencies" -ForegroundColor $error
        exit 1
    }
}
Pop-Location
Write-Host ""

# Step 2: Frontend setup
Write-Host "Step 2: Installing Frontend Dependencies..." -ForegroundColor $info
Write-Host ""

Push-Location Frontend
if (Test-Path "node_modules") {
    Write-Host "  ℹ️  Frontend already has node_modules, skipping install" -ForegroundColor $warning
}
else {
    Write-Host "  Installing npm packages..." -ForegroundColor $info
    npm install | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor $success
    }
    else {
        Write-Host "  ❌ Failed to install frontend dependencies" -ForegroundColor $error
        exit 1
    }
}
Pop-Location
Write-Host ""

# Step 3: .env check
Write-Host "Step 3: Checking Environment Configuration..." -ForegroundColor $info
Write-Host ""

if (-not (Test-Path "Backend\.env")) {
    Write-Host "  ⚠️  Backend\.env not found" -ForegroundColor $warning
    Write-Host "  Creating template..." -ForegroundColor $info
    $envTemplate = @"
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=farmsync_db
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key-here-change-in-production

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/google/callback

# OAuth - Microsoft
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_CALLBACK_URL=http://localhost:5000/api/auth/oauth/microsoft/callback

# OAuth - Apple
APPLE_KEY_ID=
APPLE_TEAM_ID=
APPLE_SERVICE_ID=

# SMS - Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# WhatsApp
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=

# Frontend
FRONTEND_URL=http://localhost:5173

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server
PORT=5000
NODE_ENV=development
"@
    
    Set-Content -Path "Backend\.env" -Value $envTemplate
    Write-Host "  ✅ Created Backend\.env template" -ForegroundColor $success
    Write-Host "  ⚠️  Please update Backend\.env with your credentials" -ForegroundColor $warning
}
else {
    Write-Host "  ✅ Backend\.env found" -ForegroundColor $success
}

Write-Host ""

if (-not (Test-Path "Frontend\.env")) {
    Write-Host "  ⚠️  Frontend\.env not found" -ForegroundColor $warning
    Write-Host "  Creating template..." -ForegroundColor $info
    $frontendEnv = @"
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
VITE_APPLE_CLIENT_ID=
"@
    
    Set-Content -Path "Frontend\.env" -Value $frontendEnv
    Write-Host "  ✅ Created Frontend\.env template" -ForegroundColor $success
    Write-Host "  ⚠️  Please update Frontend\.env with your client IDs" -ForegroundColor $warning
}
else {
    Write-Host "  ✅ Frontend\.env found" -ForegroundColor $success
}

Write-Host ""

# Step 4: Start servers
Write-Host "Step 4: Starting Servers..." -ForegroundColor $info
Write-Host ""

Write-Host "  🚀 Starting Backend on http://localhost:5000" -ForegroundColor $info
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/Backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "  🚀 Starting Frontend on http://localhost:5173" -ForegroundColor $info
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/Frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ SERVERS STARTING                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📱 Frontend will be ready at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend will be ready at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Write-Host "   Please wait 10-20 seconds for both servers to initialize" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update Backend\.env with OAuth credentials (OAUTH_SETUP.md)" -ForegroundColor Cyan
Write-Host "  2. Update Frontend\.env with client IDs" -ForegroundColor Cyan
Write-Host "  3. Open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host "  4. Test Google/Microsoft/Apple Sign-In" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  • Quick Reference: QUICK_REFERENCE.md" -ForegroundColor Cyan
Write-Host "  • OAuth Setup: docs/OAUTH_SETUP.md" -ForegroundColor Cyan
Write-Host "  • Deployment: docs/DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "  • Mobile Apps: docs/APP_CONVERSION_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  • Keep these terminal windows open while developing" -ForegroundColor Cyan
Write-Host "  • Backend will auto-restart on code changes" -ForegroundColor Cyan
Write-Host "  • Frontend will hot-reload on code changes" -ForegroundColor Cyan
Write-Host "  • Check the terminal output for errors" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Ctrl+C in either terminal to stop the server" -ForegroundColor Gray
Write-Host ""
