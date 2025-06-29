@echo off
echo.
echo ========================================
echo    EARNLANG - Platform Update
echo ========================================
echo.
echo Starting update process...
echo.

echo [1/5] Checking Node.js version...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo [2/5] Installing/updating dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [3/5] Running security audit...
call npm audit fix
if %errorlevel% neq 0 (
    echo ⚠️ Security audit found issues (non-critical)
)

echo.
echo [4/5] Checking for database updates...
if exist setup.js (
    echo Running database setup...
    call node setup.js
)

echo.
echo [5/5] Update complete! 
echo.
echo ✅ EARNLANG v1.1.0 has been updated successfully!
echo.
echo 🚀 To start the server:
echo    - Double-click launch.bat
echo    - Or run: npm start
echo.
echo 🔧 New features in v1.1.0:
echo    - Enhanced security (Helmet + Rate Limiting)
echo    - Better error handling
echo    - Health check endpoint
echo    - Graceful shutdown
echo    - Updated dependencies
echo.
pause 