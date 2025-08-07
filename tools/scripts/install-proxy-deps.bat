@echo off
echo =========================================
echo Installing SSO Proxy Dependencies...
echo =========================================
echo.

echo Installing express...
npm install express --no-save

echo Installing http-proxy-middleware...
npm install http-proxy-middleware --no-save

echo Installing cookie-parser...
npm install cookie-parser --no-save

echo.
echo =========================================
echo Dependencies installed successfully!
echo =========================================
echo.
echo Now you can run: node setup-sso-proxy.js
echo.
pause