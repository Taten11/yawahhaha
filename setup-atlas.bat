@echo off
echo.
echo ========================================
echo    EARNLANG - MongoDB Atlas Setup
echo ========================================
echo.
echo Setting up EARNLANG with MongoDB Atlas...
echo.

echo [1/4] Creating .env file...
if not exist .env (
    echo Creating .env file with Atlas configuration...
    echo # EARNLANG Environment Configuration > .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo MONGO_URI=mongodb+srv://earnlang:YOUR_PASSWORD@cluster0.0ku8feb.mongodb.net/earnlang?retryWrites=true^&w=majority >> .env
    echo JWT_SECRET=earnlang_super_secret_jwt_key_2024_change_this_in_production >> .env
    echo EMAIL_SERVICE=gmail >> .env
    echo EMAIL_USER=your_email@gmail.com >> .env
    echo EMAIL_PASS=your_email_app_password >> .env
    echo CORS_ORIGIN=http://localhost:5000 >> .env
    echo RATE_LIMIT_WINDOW_MS=900000 >> .env
    echo RATE_LIMIT_MAX_REQUESTS=100 >> .env
    echo AUTH_RATE_LIMIT_MAX_REQUESTS=5 >> .env
    echo MIN_PAYOUT_AMOUNT=50 >> .env
    echo POINTS_TO_PESO_RATIO=10 >> .env
    echo MAX_PAYOUT_AMOUNT=10000 >> .env
    echo ✅ .env file created!
) else (
    echo ⚠️ .env file already exists
)

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up database...
if exist setup.js (
    call node setup.js
) else (
    echo ⚠️ setup.js not found, skipping database setup
)

echo.
echo [4/4] Setup complete!
echo.
echo 🔧 Next steps:
echo    1. Edit .env file and replace YOUR_PASSWORD with your actual Atlas password
echo    2. Update email settings if needed
echo    3. Run: npm start
echo.
echo 📊 To connect MongoDB Compass:
echo    mongodb+srv://earnlang:YOUR_PASSWORD@cluster0.0ku8feb.mongodb.net/earnlang
echo.
echo 📖 Check ATLAS_SETUP.md for detailed instructions
echo.
pause 