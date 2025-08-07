# Update App URLs for Local Domain Configuration
Write-Host "=== Updating App URLs for Local Domains ===" -ForegroundColor Cyan

# Configuration for URL updates
$updates = @(
    # SSO Service - Update redirect URLs
    @{
        File = "packages\shared\src\auth\sso-service.ts"
        Pattern = "http://localhost"
        Replace = "http://altamedica.local"
        Description = "SSO redirect URLs"
    },
    # SSO Middleware - Update login path
    @{
        File = "packages\shared\src\auth\sso-middleware.ts"
        Pattern = "http://localhost"
        Replace = "http://altamedica.local"
        Description = "SSO middleware URLs"
    },
    # Patients App middleware
    @{
        File = "apps\patients\middleware.ts"
        Pattern = "http://localhost:3000/login"
        Replace = "http://altamedica.local:3000/login"
        Description = "Patients app login redirect"
    },
    # API Server responses
    @{
        File = "apps\api-server\src\app\api\v1\auth\login\route.ts"
        Pattern = "http://localhost:"
        Replace = "http://*.altamedica.local:"
        Description = "API server redirect URLs"
    }
)

# Function to update files
function Update-FileUrls {
    param($update)
    
    $filePath = Join-Path $PSScriptRoot ".." $update.File
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Simple replacement for localhost
        $content = $content -replace [regex]::Escape($update.Pattern), $update.Replace
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Updated: $($update.File)" -ForegroundColor Green
            Write-Host "  - $($update.Description)" -ForegroundColor Gray
        } else {
            Write-Host "- No changes needed: $($update.File)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ File not found: $($update.File)" -ForegroundColor Red
    }
}

# Process updates
Write-Host "`nUpdating configuration files..." -ForegroundColor Yellow
foreach ($update in $updates) {
    Update-FileUrls -update $update
}

Write-Host "`n=== Creating Environment Configuration ===" -ForegroundColor Cyan

# Create .env.development.local with domain configuration
$envContent = @"
# Local Domain Configuration
NEXT_PUBLIC_DOMAIN=altamedica.local
NEXT_PUBLIC_API_URL=http://api.altamedica.local:3001
NEXT_PUBLIC_WEB_URL=http://altamedica.local:3000
NEXT_PUBLIC_PATIENTS_URL=http://patients.altamedica.local:3003
NEXT_PUBLIC_DOCTORS_URL=http://doctors.altamedica.local:3002
NEXT_PUBLIC_COMPANIES_URL=http://companies.altamedica.local:3004
NEXT_PUBLIC_ADMIN_URL=http://admin.altamedica.local:3005
"@

$envPath = Join-Path $PSScriptRoot ".." ".env.development.local"
Set-Content -Path $envPath -Value $envContent
Write-Host "✓ Created .env.development.local" -ForegroundColor Green

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Rebuild packages: npm run build:packages" -ForegroundColor White
Write-Host "2. Restart all services: npm run dev:all" -ForegroundColor White
Write-Host "3. Access applications using new domains:" -ForegroundColor White
Write-Host "   - http://altamedica.local:3000 (Web App)" -ForegroundColor Gray
Write-Host "   - http://patients.altamedica.local:3003 (Patients)" -ForegroundColor Gray
Write-Host "   - http://doctors.altamedica.local:3002 (Doctors)" -ForegroundColor Gray

Write-Host "`n✓ URL update complete!" -ForegroundColor Green