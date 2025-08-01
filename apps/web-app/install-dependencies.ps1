# install-dependencies.ps1
# Script para instalar todas las dependencias necesarias para la Anamnesis Interactiva

Write-Host "🚀 Instalando dependencias para Anamnesis Interactiva Avanzada..." -ForegroundColor Cyan

# Cambiar al directorio del proyecto web-app
Set-Location "C:\Users\Eduardo\Documents\devaltamedica\apps\web-app"

# Instalar dependencias de animación y efectos
Write-Host "`n📦 Instalando Framer Motion..." -ForegroundColor Yellow
pnpm add framer-motion@latest

# Instalar librería de confetti para celebraciones
Write-Host "`n🎉 Instalando Canvas Confetti..." -ForegroundColor Yellow
pnpm add canvas-confetti
pnpm add -D @types/canvas-confetti

# Instalar librería de animación de texto
Write-Host "`n✍️ Instalando React Type Animation..." -ForegroundColor Yellow
pnpm add react-type-animation

# Instalar Firebase si no está instalado
Write-Host "`n🔥 Verificando Firebase..." -ForegroundColor Yellow
pnpm add firebase

# Instalar otras utilidades necesarias
Write-Host "`n🛠️ Instalando utilidades adicionales..." -ForegroundColor Yellow
pnpm add clsx tailwind-merge

# Crear estructura de carpetas necesaria
Write-Host "`n📁 Creando estructura de carpetas..." -ForegroundColor Yellow

$carpetas = @(
    "src/components/anamnesis",
    "src/data",
    "src/types",
    "src/services",
    "src/config"
)

foreach ($carpeta in $carpetas) {
    if (!(Test-Path $carpeta)) {
        New-Item -ItemType Directory -Force -Path $carpeta
        Write-Host "✅ Creada carpeta: $carpeta" -ForegroundColor Green
    }
}

# Crear archivo de configuración de Firebase básico
$firebaseConfig = @'
// config/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Reemplazar con tu configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
'@

# Guardar archivo de configuración si no existe
$firebaseConfigPath = "src/config/firebase.ts"
if (!(Test-Path $firebaseConfigPath)) {
    $firebaseConfig | Out-File -FilePath $firebaseConfigPath -Encoding UTF8
    Write-Host "`n✅ Creado archivo de configuración Firebase" -ForegroundColor Green
}

# Crear archivo .env.local de ejemplo si no existe
$envExample = @'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
'@

$envPath = ".env.local.example"
if (!(Test-Path $envPath)) {
    $envExample | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "`n✅ Creado archivo de ejemplo .env.local.example" -ForegroundColor Green
}

Write-Host "`n✨ ¡Instalación completada!" -ForegroundColor Green
Write-Host "`n📝 Notas importantes:" -ForegroundColor Cyan
Write-Host "1. Configura tus credenciales de Firebase en .env.local" -ForegroundColor White
Write-Host "2. Asegúrate de tener el modelo patient.glb en public/models/" -ForegroundColor White
Write-Host "3. Importa los componentes en tu página principal" -ForegroundColor White
Write-Host "4. Los agentes MCP ya están integrados con el sistema" -ForegroundColor White

Write-Host "`n🎯 Para iniciar el proyecto:" -ForegroundColor Yellow
Write-Host "pnpm dev" -ForegroundColor White 