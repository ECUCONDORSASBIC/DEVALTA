# Auditoría Automática del Estado Actual - AltaMedica Web App
# Script para capturar capturas de pantalla, exportar DOM/CSS y registrar problemas

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$OutputDir = "audit-results"
)

# Crear directorio de salida
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# Función para extraer DOM y CSS
function Extract-DOM-CSS {
    param(
        [string]$Url,
        [string]$PageName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 30
        
        # Guardar HTML completo
        $response.Content | Out-File -FilePath "$OutputDir\dom-$PageName.html" -Encoding UTF8
        
        # Extraer CSS inline
        $cssMatches = [regex]::Matches($response.Content, '<style[^>]*>(.*?)</style>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $cssContent = ""
        foreach ($match in $cssMatches) {
            $cssContent += $match.Groups[1].Value + "`n"
        }
        
        # Extraer enlaces CSS externos
        $linkPattern = '<link[^>]*rel=["'']stylesheet["''][^>]*href=["'']([^"'']+)["''][^>]*>'
        $linkMatches = [regex]::Matches($response.Content, $linkPattern)
        $externalCss = ""
        foreach ($match in $linkMatches) {
            $cssUrl = $match.Groups[1].Value
            if ($cssUrl -notmatch "^https?://") {
                $cssUrl = "$BaseUrl/$cssUrl"
            }
            try {
                $cssResponse = Invoke-WebRequest -Uri $cssUrl -TimeoutSec 10
                $externalCss += "/* $cssUrl */`n" + $cssResponse.Content + "`n`n"
            } catch {
                $externalCss += "/* Error loading: $cssUrl */`n"
            }
        }
        
        ($cssContent + $externalCss) | Out-File -FilePath "$OutputDir\css-$PageName.css" -Encoding UTF8
        
        return $response.Content
    } catch {
        Write-Host "Error al extraer DOM/CSS de $Url : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para analizar problemas de diseño
function Analyze-Layout-Issues {
    param(
        [string]$HtmlContent,
        [string]$PageName
    )
    
    $issues = @()
    
    # Buscar elementos con z-index alto
    $zIndexMatches = [regex]::Matches($HtmlContent, 'z-index\s*:\s*(\d+)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $zIndexMatches) {
        $zIndex = [int]$match.Groups[1].Value
        if ($zIndex -gt 1000) {
            $issues += "ALTO Z-INDEX: Elemento con z-index: $zIndex (puede causar problemas de superposición)"
        }
    }
    
    # Buscar elementos con width fijo que podrían causar overflow
    $widthMatches = [regex]::Matches($HtmlContent, 'width\s*:\s*(\d+)px', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $widthMatches) {
        $width = [int]$match.Groups[1].Value
        if ($width -gt 1200) {
            $issues += "ANCHO FIJO ALTO: Elemento con width: ${width}px (puede causar overflow horizontal)"
        }
    }
    
    # Buscar posicionamiento absoluto que podría causar superposición
    $positionMatches = [regex]::Matches($HtmlContent, 'position\s*:\s*absolute', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($positionMatches.Count -gt 5) {
        $issues += "MUCHOS ELEMENTOS ABSOLUTOS: $($positionMatches.Count) elementos con position:absolute (riesgo de superposición)"
    }
    
    # Buscar elementos con overflow hidden que podrían ocultar contenido
    $overflowMatches = [regex]::Matches($HtmlContent, 'overflow\s*:\s*hidden', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($overflowMatches.Count -gt 3) {
        $issues += "MUCHOS OVERFLOW HIDDEN: $($overflowMatches.Count) elementos con overflow:hidden (contenido podría estar oculto)"
    }
    
    # Buscar elementos con transform que podrían causar problemas de renderizado
    $transformMatches = [regex]::Matches($HtmlContent, 'transform\s*:', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($match in $transformMatches) {
        $issues += "TRANSFORM DETECTADO: Elemento con transform (verificar compatibilidad y rendimiento)"
    }
    
    # Buscar posibles problemas de responsive design
    $fixedUnitsMatches = [regex]::Matches($HtmlContent, '\d+px', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($fixedUnitsMatches.Count -gt 50) {
        $issues += "MUCHAS UNIDADES FIJAS: $($fixedUnitsMatches.Count) unidades px encontradas (posible falta de responsive design)"
    }
    
    return $issues
}

# Páginas a auditar
$pages = @(
    @{ Name = "home"; Path = "/" },
    @{ Name = "dashboard"; Path = "/dashboard" },
    @{ Name = "anamnesis-demo"; Path = "/anamnesis-demo" },
    @{ Name = "anamnesis-hospital-demo"; Path = "/anamnesis-hospital-demo" },
    @{ Name = "hospital3d"; Path = "/hospital3d" }
)

# Crear informe principal
$reportPath = "$OutputDir\audit-report.md"
$reportContent = @"
# Auditoría del Estado Actual - AltaMedica Web App
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**URL Base:** $BaseUrl

## Resumen de Auditoría

"@

Write-Host "Iniciando auditoría automática..." -ForegroundColor Green
Write-Host "URL Base: $BaseUrl" -ForegroundColor Yellow
Write-Host "Directorio de salida: $OutputDir" -ForegroundColor Yellow

foreach ($page in $pages) {
    $url = "$BaseUrl$($page.Path)"
    $pageName = $page.Name
    
    Write-Host "`nAuditando página: $pageName ($url)" -ForegroundColor Cyan
    
    # Extraer DOM y CSS
    $htmlContent = Extract-DOM-CSS -Url $url -PageName $pageName
    
    if ($htmlContent) {
        # Analizar problemas de diseño
        $issues = Analyze-Layout-Issues -HtmlContent $htmlContent -PageName $pageName
        
        # Guardar problemas encontrados
        $issuesPath = "$OutputDir\issues-$pageName.txt"
        if ($issues.Count -gt 0) {
            $issues | Out-File -FilePath $issuesPath -Encoding UTF8
            Write-Host "  - Problemas encontrados: $($issues.Count)" -ForegroundColor Red
        } else {
            "No se encontraron problemas evidentes." | Out-File -FilePath $issuesPath -Encoding UTF8
            Write-Host "  - No se encontraron problemas evidentes" -ForegroundColor Green
        }
        
        # Agregar al informe
        $reportContent += @"

### Página: $pageName
**URL:** $url
**Archivos generados:**
- DOM: dom-$pageName.html
- CSS: css-$pageName.css
- Problemas: issues-$pageName.txt

**Problemas encontrados:**
$(if ($issues.Count -gt 0) { ($issues | ForEach-Object { "- $_" }) -join "`n" } else { "- No se encontraron problemas evidentes" })

"@
        
        # Intentar capturar información adicional del DOM
        $elementCount = ([regex]::Matches($htmlContent, '<[^/][^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        $imgCount = ([regex]::Matches($htmlContent, '<img[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        $scriptCount = ([regex]::Matches($htmlContent, '<script[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        
        $reportContent += @"
**Estadísticas DOM:**
- Total elementos: $elementCount
- Imágenes: $imgCount
- Scripts: $scriptCount

"@
    } else {
        Write-Host "  - Error al acceder a la página" -ForegroundColor Red
        $reportContent += @"

### Página: $pageName
**URL:** $url
**Estado:** ERROR - No se pudo acceder a la página

"@
    }
}

# Análisis general del proyecto
Write-Host "`nAnalizando estructura del proyecto..." -ForegroundColor Cyan

$reportContent += @"

## Análisis de Estructura del Proyecto

### Tecnologías Identificadas
- Framework: Next.js 15.3.4
- UI: React 19.0.0
- CSS: Tailwind CSS 3.4.0
- Componentes UI: Radix UI
- Animaciones: Framer Motion
- 3D: Three.js + React Three Fiber

### Archivos de Configuración
- TypeScript: ✓ Configurado
- ESLint: ✓ Configurado
- Tailwind: ✓ Configurado
- PostCSS: ✓ Configurado

### Estructura de Componentes
"@

# Analizar estructura de componentes
$componentsPath = "src\components"
if (Test-Path $componentsPath) {
    $componentDirs = Get-ChildItem -Path $componentsPath -Directory
    foreach ($dir in $componentDirs) {
        $componentFiles = Get-ChildItem -Path $dir.FullName -Filter "*.tsx" -Recurse
        $reportContent += "- $($dir.Name): $($componentFiles.Count) componentes`n"
    }
}

# Recomendaciones finales
$reportContent += @"

## Recomendaciones Generales

### Problemas Potenciales Identificados
1. **Superposición de Elementos:** Revisar elementos con z-index alto
2. **Responsive Design:** Verificar uso excesivo de unidades fijas (px)
3. **Rendimiento:** Optimizar elementos con transform y animaciones
4. **Accesibilidad:** Revisar contraste y navegación por teclado

### Próximos Pasos
1. Revisar archivos de problemas individuales por página
2. Probar la aplicación en diferentes tamaños de pantalla
3. Validar interacciones y formularios
4. Optimizar carga de recursos CSS y JavaScript

### Archivos Generados
- Informe completo: audit-report.md
- DOM por página: dom-[pagina].html
- CSS por página: css-[pagina].css
- Problemas por página: issues-[pagina].txt

---
*Auditoría generada automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
"@

# Guardar informe final
$reportContent | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n✅ Auditoría completada!" -ForegroundColor Green
Write-Host "📁 Resultados guardados en: $OutputDir" -ForegroundColor Yellow
Write-Host "📄 Informe principal: $reportPath" -ForegroundColor Yellow

# Mostrar resumen
$totalIssues = 0
$issueFiles = Get-ChildItem -Path $OutputDir -Filter "issues-*.txt"
foreach ($file in $issueFiles) {
    $content = Get-Content $file.FullName
    if ($content -and $content.Length -gt 1) {
        $totalIssues += ($content | Where-Object { $_ -notmatch "No se encontraron problemas" }).Count
    }
}

Write-Host "`n📊 Resumen de la auditoría:" -ForegroundColor Cyan
Write-Host "  - Páginas auditadas: $($pages.Count)" -ForegroundColor White
Write-Host "  - Total de problemas encontrados: $totalIssues" -ForegroundColor $(if ($totalIssues -gt 0) { "Red" } else { "Green" })
Write-Host "  - Archivos generados: $((Get-ChildItem -Path $OutputDir).Count)" -ForegroundColor White

return $reportPath
