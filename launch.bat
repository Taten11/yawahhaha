@echo off
title EARNLANG Game Platform
color 0A

echo.
echo ========================================
echo    EARNLANG - Task-Based Earning Game
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Make sure to check "Add to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo Checking MongoDB connection...
echo (This may take a moment...)

echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo.
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

echo Setting up database...
node setup.js

if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    echo.
    echo Make sure MongoDB is running:
    echo - Windows: net start MongoDB
    echo - macOS/Linux: sudo systemctl start mongod
    echo.
    pause
    exit /b 1
)

echo ✅ Database setup completed
echo.

echo Starting EARNLANG platform...
echo.
echo 🌐 Main Site: http://localhost:5000
echo 🛠️ Admin Panel: http://localhost:5000/admin
echo.
echo 📧 Admin Login: admin@earnlang.com / admin123
echo 📧 Demo Login: demo@earnlang.com / demo123
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
