# Fresh Install and Build Script
Write-Host "=== Fresh Install and Build ===" -ForegroundColor Cyan
Write-Host "This will clean and reinstall everything" -ForegroundColor Yellow
Write-Host ""

# Navigate to project root
Set-Location (Join-Path $PSScriptRoot "..")

# Step 1: Clean node_modules and build artifacts
Write-Host "[1] Cleaning old files..." -ForegroundColor Yellow
$foldersToDelete = @(
    "node_modules",
    "packages/*/node_modules",
    "packages/*/dist",
    "apps/*/node_modules",
    "apps/*/.next"
)

foreach ($pattern in $foldersToDelete) {
    Get-ChildItem -Path . -Filter $pattern -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Deleting: $($_.FullName)" -ForegroundColor Gray
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Step 2: Install dependencies
Write-Host "`n[2] Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Step 3: Build packages
Write-Host "`n[3] Building packages..." -ForegroundColor Yellow
pnpm run build:packages

# Step 4: Show next steps
Write-Host "`n[4] Next steps:" -ForegroundColor Yellow
Write-Host "1. Start services: npm run dev:all" -ForegroundColor White
Write-Host "2. Access via domains:" -ForegroundColor White
Write-Host "   - http://altamedica.local:3000" -ForegroundColor Gray
Write-Host "   - http://patients.altamedica.local:3003" -ForegroundColor Gray

Write-Host "`n✓ Fresh install complete!" -ForegroundColor Green