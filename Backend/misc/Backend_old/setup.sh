#!/bin/bash
# Bash script to set up the database automatically
# Run this script: chmod +x setup.sh && ./setup.sh

echo "FarmSync Backend Setup"
echo "======================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi
echo "Node.js version: $(node --version)"
echo ""

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "Warning: PostgreSQL may not be in PATH. Make sure PostgreSQL is installed and running."
else
    echo "PostgreSQL found"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies."
    exit 1
fi

echo "Dependencies installed successfully!"
echo ""

# Setup database
echo "Setting up database..."
npm run setup-db

if [ $? -ne 0 ]; then
    echo "Error: Database setup failed. Please check PostgreSQL is running and password is correct."
    exit 1
fi

echo "Database setup completed!"
echo ""

# Seed database
echo "Seeding initial data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "Warning: Seeding failed. You can run 'npm run seed' manually later."
else
    echo "Database seeded successfully!"
fi

echo ""
echo "Setup completed!"
echo ""
echo "Next steps:"
echo "1. Start the backend server: npm run dev"
echo "2. Configure frontend .env file with: VITE_API_URL=http://localhost:5000/api"
echo "3. Start the frontend: cd ../Frontend && npm run dev"
echo ""
echo "Default credentials:"
echo "Admin: admin@farmsync.com / admin123"
echo "Farmer: farmer@test.com / farmer123"
