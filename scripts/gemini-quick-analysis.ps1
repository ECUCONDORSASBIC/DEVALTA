# Script PowerShell para análisis rápido con Gemini CLI
# Uso: .\scripts\gemini-quick-analysis.ps1 -Analysis "codebase" -Output "analysis-results"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("codebase", "hipaa", "webrtc", "testing", "performance", "security")]
    [string]$Analysis,
    
    [string]$Output = "gemini-analysis",
    
    [switch]$Interactive
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GeminiPath = Join-Path $ProjectRoot "gemini-cli\bundle\gemini.js"
$OutputFile = Join-Path $ProjectRoot "$Output-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"

Write-Host "🏥 Ejecutando analisis $Analysis con Gemini CLI..." -ForegroundColor Green
Write-Host "📁 Proyecto: $ProjectRoot" -ForegroundColor Yellow
Write-Host "📝 Output: $OutputFile" -ForegroundColor Yellow

# Definir prompts específicos para cada tipo de análisis
$Prompts = @{
    "codebase" = @"
Analiza el codebase completo de AltaMedica y proporciona:

1. **Estado de Aplicaciones**:
   - Análisis de cada app (web-app, api-server, doctors, patients, companies, admin, signaling-server)
   - Nivel de completitud y quality score
   - Integración entre aplicaciones

2. **Arquitectura y Patrones**:
   - Service Layer implementation
   - UnifiedAuth middleware usage
   - Workspace dependencies health
   - Shared packages utilization

3. **Medical Domain Analysis**:
   - HIPAA compliance current state
   - Medical workflows implementation
   - PHI handling patterns
   - FHIR standards adherence

4. **Technical Quality**:
   - TypeScript usage and safety
   - Testing coverage by domain
   - Performance considerations
   - Security patterns

5. **Priority Recommendations**:
   - Top 5 technical improvements
   - Top 3 medical domain enhancements
   - Critical security updates needed
   - 4-week development roadmap

Incluye ejemplos específicos de código y archivos cuando sea relevante.
"@

    "hipaa" = @"
Realiza una auditoría completa de HIPAA compliance en AltaMedica:

1. **PHI Protection Analysis**:
   - Identificar todos los puntos donde se maneja PHI
   - Verificar encriptación en tránsito y en reposo
   - Auditar logging de acceso a datos médicos
   - Revisar retention policies

2. **Access Control Audit**:
   - Analizar role-based access implementation
   - Verificar UnifiedAuth middleware en endpoints médicos
   - Revisar session management y token handling
   - Evaluar user authentication flows

3. **Technical Safeguards**:
   - Audit trails implementation
   - Error handling sin exposición de PHI
   - Database security measures
   - API endpoint protection

4. **Compliance Gaps**:
   - Identificar vulnerabilidades específicas
   - Áreas que no cumplen HIPAA requirements
   - Recommendations prioritizadas por riesgo

5. **Remediation Plan**:
   - Immediate fixes required
   - Medium-term improvements
   - Long-term compliance strategy

Proporciona ejemplos específicos de código problemático y soluciones.
"@

    "webrtc" = @"
Analiza la implementación WebRTC y telemedicina en AltaMedica:

1. **WebRTC Architecture**:
   - Signaling server implementation (puerto 8888)
   - MediaSoup integration status
   - STUN/TURN configuration
   - Connection flow analysis

2. **Performance Analysis**:
   - Latency optimization actual
   - Video/audio quality settings
   - Bandwidth optimization
   - Error handling and reconnection

3. **Medical Integration**:
   - Doctor-patient video call flows
   - Session management and security
   - Medical data during calls
   - Recording capabilities and compliance

4. **Technical Implementation**:
   - Client-side WebRTC handling
   - Server-side signaling logic
   - Real-time communication patterns
   - Integration with Firebase/Socket.io

5. **Optimization Recommendations**:
   - Performance improvements específicos
   - Quality enhancements
   - Reliability improvements
   - Compliance considerations

Incluye análisis de código específico de WebRTC y telemedicina.
"@

    "testing" = @"
Audita la estrategia de testing completa de AltaMedica:

1. **Current Testing Coverage**:
   - Unit tests por aplicación y package
   - Integration tests entre apps
   - E2E tests para workflows médicos
   - Accessibility testing (WCAG compliance)

2. **Medical Testing Analysis**:
   - Testing de cálculos médicos críticos
   - Validation de workflows paciente-doctor
   - Testing de compliance HIPAA
   - Emergency scenario testing

3. **WebRTC Testing**:
   - Video call quality testing
   - Latency and performance testing
   - Connection reliability testing
   - Cross-browser compatibility

4. **Automation Assessment**:
   - CI/CD pipeline testing
   - Automated regression testing
   - Performance testing automation
   - Security testing integration

5. **Testing Gaps & Recommendations**:
   - Critical missing tests
   - Test automation improvements
   - Medical scenario edge cases
   - Performance benchmarking setup

Proporciona ejemplos específicos de tests que deberían implementarse.
"@

    "performance" = @"
Analiza la performance actual de AltaMedica y identifica optimizaciones:

1. **Application Performance**:
   - Bundle size analysis por app
   - Loading times y Core Web Vitals
   - React rendering optimization
   - Next.js optimization opportunities

2. **API Performance**:
   - Response times por endpoint
   - Database query optimization
   - Caching strategies (Redis usage)
   - Rate limiting effectiveness

3. **Real-time Performance**:
   - WebRTC latency analysis
   - Socket.io performance
   - Firebase real-time updates
   - Memory usage patterns

4. **Infrastructure Performance**:
   - Docker container optimization
   - Database performance (PostgreSQL + Firestore)
   - CDN and static asset optimization
   - Monitoring and alerting setup

5. **Medical Performance Requirements**:
   - Emergency response times (<3 seconds)
   - Telemedicine quality standards
   - Large medical file handling
   - Concurrent user capacity

Incluye benchmarks específicos y recommendations de optimización.
"@

    "security" = @"
Realiza una auditoría de seguridad completa de AltaMedica:

1. **Authentication & Authorization**:
   - Firebase Auth implementation
   - JWT token security
   - Role-based access control
   - Session management security

2. **API Security**:
   - Endpoint protection analysis
   - Input validation (Zod schemas)
   - Rate limiting implementation
   - CORS configuration

3. **Data Security**:
   - Encryption at rest and in transit
   - Database security measures
   - PHI handling security
   - Backup security practices

4. **Infrastructure Security**:
   - Docker security best practices
   - Network security configuration
   - Environment variable security
   - Dependency vulnerability scanning

5. **Medical Data Security**:
   - HIPAA security requirements
   - Audit trail security
   - Medical device integration security
   - Telemedicine security protocols

Identifica vulnerabilidades específicas y proporciona remediation plan.
"@
}

$SelectedPrompt = $Prompts[$Analysis]

if (-not $SelectedPrompt) {
    Write-Error "Tipo de análisis no válido: $Analysis"
    exit 1
}

Write-Host "🔍 Ejecutando análisis de $Analysis..." -ForegroundColor Blue

try {
    # Cambiar al directorio del proyecto
    Set-Location $ProjectRoot
    
    if ($Interactive) {
        # Modo interactivo
        Write-Host "🎯 Iniciando modo interactivo con prompt inicial..." -ForegroundColor Cyan
        & node $GeminiPath --model "gemini-2.0-flash-exp" --all-files --show-memory-usage --prompt-interactive $SelectedPrompt
    } else {
        # Modo batch
        Write-Host "📝 Ejecutando análisis en modo batch..." -ForegroundColor Cyan
        $Result = & node $GeminiPath --model "gemini-2.0-flash-exp" --all-files --prompt $SelectedPrompt 2>&1
        
        # Guardar resultado
        $Result | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Host "✅ Análisis completado y guardado en: $OutputFile" -ForegroundColor Green
        
        # Mostrar resumen
        Write-Host "`n📊 Resumen del análisis:" -ForegroundColor Yellow
        Write-Host "- Tipo: $Analysis" -ForegroundColor White
        Write-Host "- Archivo: $OutputFile" -ForegroundColor White
        Write-Host "- Tamaño: $((Get-Item $OutputFile).Length) bytes" -ForegroundColor White
    }
} catch {
    Write-Error "Error ejecutando análisis: $_"
    exit 1
}

Write-Host "`n🎉 Analisis $Analysis completado exitosamente!" -ForegroundColor Green