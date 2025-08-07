# Fix Build Issues Script
Write-Host "=== Fixing Build Issues ===" -ForegroundColor Cyan

# Navigate to project root
Set-Location (Join-Path $PSScriptRoot "..")

# Step 1: Install dependencies
Write-Host "`n[1] Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build packages in correct order
Write-Host "`n[2] Building packages in dependency order..." -ForegroundColor Yellow

# Build packages that don't depend on others first
Write-Host "  Building independent packages..." -ForegroundColor Gray
pnpm --filter @altamedica/types build
pnpm --filter @altamedica/medical-cache build
pnpm --filter @altamedica/firebase build
pnpm --filter @altamedica/shared build

# Then build packages that depend on others
Write-Host "  Building dependent packages..." -ForegroundColor Gray
pnpm --filter @altamedica/core build

Write-Host "`n✓ Build process complete!" -ForegroundColor Green
Write-Host "If there are still errors, check the output above." -ForegroundColor Yellow