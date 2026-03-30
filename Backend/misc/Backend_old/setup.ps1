# PowerShell script to set up the database automatically
# Run this script: .\setup.ps1

Write-Host "FarmSync Backend Setup" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "MySQL found: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "Warning: MySQL may not be in PATH. Make sure MySQL is installed and running." -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully!" -ForegroundColor Green

# Setup database
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow
npm run setup-db

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Database setup failed. Please check PostgreSQL is running and password is correct." -ForegroundColor Red
    exit 1
}

Write-Host "Database setup completed!" -ForegroundColor Green

# Seed database
Write-Host ""
Write-Host "Seeding initial data..." -ForegroundColor Yellow
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Seeding failed. You can run 'npm run seed' manually later." -ForegroundColor Yellow
} else {
    Write-Host "Database seeded successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server: npm run dev" -ForegroundColor White
Write-Host "2. Configure frontend .env file with: VITE_API_URL=http://localhost:5000/api" -ForegroundColor White
Write-Host "3. Start the frontend: cd ../Frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@farmsync.com / admin123" -ForegroundColor White
Write-Host "Farmer: farmer@test.com / farmer123" -ForegroundColor White
