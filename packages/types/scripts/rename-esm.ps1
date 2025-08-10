# PowerShell script to copy ESM files from dist-esm to dist with .esm.js extension

# Check if dist-esm exists
if (!(Test-Path -Path "dist-esm")) {
    Write-Error "dist-esm directory not found. Run build:esm first."
    exit 1
}

# Get all .js files from dist-esm
$files = Get-ChildItem -Path "dist-esm" -Recurse -Filter "*.js"

foreach ($file in $files) {
    # Calculate relative path from dist-esm
    $relativePath = $file.FullName.Substring((Get-Item "dist-esm").FullName.Length + 1)
    
    # Replace .js with .esm.js
    $newRelativePath = $relativePath -replace '\.js$', '.esm.js'
    
    # Create destination path
    $destPath = Join-Path "dist" $newRelativePath
    
    # Create directory if it doesn't exist
    $destDir = Split-Path -Parent $destPath
    if (!(Test-Path -Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file with new name
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "Copied: $relativePath -> $newRelativePath"
}

# Copy source maps with .esm.js.map extension
$sourceMaps = Get-ChildItem -Path "dist-esm" -Recurse -Filter "*.js.map"

foreach ($file in $sourceMaps) {
    # Calculate relative path from dist-esm
    $relativePath = $file.FullName.Substring((Get-Item "dist-esm").FullName.Length + 1)
    
    # Replace .js.map with .esm.js.map
    $newRelativePath = $relativePath -replace '\.js\.map$', '.esm.js.map'
    
    # Create destination path
    $destPath = Join-Path "dist" $newRelativePath
    
    # Create directory if it doesn't exist
    $destDir = Split-Path -Parent $destPath
    if (!(Test-Path -Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file with new name
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "Copied: $relativePath -> $newRelativePath"
}

Write-Host "`nESM files successfully copied to dist directory with .esm.js extension"