# AltaMedica - Actualización de Bibliotecas Médicas
# Nuevas dependencias para mejorar funcionalidades médicas

Write-Host "🏥 AltaMedica - Actualizando Bibliotecas Médicas Avanzadas" -ForegroundColor Green

# Bibliotecas médicas para IA y análisis
Write-Host "`n🤖 Instalando bibliotecas de IA médica..." -ForegroundColor Cyan

# TensorFlow.js optimizado para medicina
npm install @tensorflow/tfjs@latest @tensorflow/tfjs-node@latest

# Bibliotecas de procesamiento de imágenes médicas
npm install sharp@latest canvas@latest

# FHIR R4 compliance mejorado
npm install @types/fhir@latest fhir-kit-client@latest

# Validación médica avanzada
npm install joi@latest yup@latest

# Bibliotecas de seguridad médica
Write-Host "`n🔒 Actualizando seguridad HIPAA..." -ForegroundColor Yellow
npm install crypto-js@latest bcryptjs@latest helmet@latest

# WebRTC mejorado para telemedicina
Write-Host "`n📹 Mejorando WebRTC para telemedicina..." -ForegroundColor Blue
npm install mediasoup-client@latest simple-peer@latest

# Análisis de audio para consultas médicas
npm install @google-cloud/speech@latest recorder-js@latest

# Bibliotecas de accesibilidad médica
Write-Host "`n♿ Mejorando accesibilidad médica..." -ForegroundColor Magenta
npm install @axe-core/react@latest react-aria@latest

# Monitoreo y métricas médicas
Write-Host "`n📊 Instalando herramientas de monitoreo médico..." -ForegroundColor Green
npm install @opentelemetry/api@latest @opentelemetry/auto-instrumentations-node@latest

# Bibliotecas específicas para cada app
Write-Host "`n📱 Actualizando bibliotecas por aplicación..." -ForegroundColor Yellow

# API Server - Bibliotecas backend médicas
Set-Location "apps/api-server"
npm install @google-cloud/healthcare@latest hl7-fhir@latest
npm install rate-limiter-flexible@latest express-rate-limit@latest
Set-Location "../.."

# Doctors App - Herramientas médicas profesionales
Set-Location "apps/doctors"
npm install react-hook-form@latest @hookform/resolvers@latest
npm install react-query@latest swr@latest
Set-Location "../.."

# Patients App - UX optimizado para pacientes
Set-Location "apps/patients"
npm install framer-motion@latest react-spring@latest
npm install react-datepicker@latest react-calendar@latest
Set-Location "../.."

# Signaling Server - WebRTC optimizado
Set-Location "apps/signaling-server"
npm install ws@latest socket.io@latest
npm install kurento-client@latest
Set-Location "../.."

Write-Host "`n✅ Bibliotecas médicas actualizadas!" -ForegroundColor Green
Write-Host "🧪 Ejecuta tests para verificar compatibilidad: npm run test:all" -ForegroundColor Yellow