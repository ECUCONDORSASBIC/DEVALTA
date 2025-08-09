@echo off
cd /d "C:\Users\Eduardo\Documents\devaltamedica"
echo Installing dependencies with npx pnpm...
npx pnpm install
echo.
echo Building packages...
npx pnpm build
echo.
echo Dependencies installation completed!
pause