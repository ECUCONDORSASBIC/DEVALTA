# 🎬 Guía Manual para Video Demo AltaMedica

## 🎯 Objetivo
Crear un video profesional de demostración similar al de YouTube con:
- Zoom rápido y suave
- Transiciones con blur
- Efectos de pan y highlight
- Audio profesional

## 🛠️ Herramientas Recomendadas

### Opción 1: OBS Studio + DaVinci Resolve (GRATIS)
1. **OBS Studio** - Para grabación
2. **DaVinci Resolve** - Para edición profesional
3. **Audacity** - Para audio (opcional)

### Opción 2: Camtasia (PAGO)
- Todo en uno, más fácil de usar

### Opción 3: ScreenFlow (Mac)
- Excelente para demos

## 📋 Configuración de Grabación

### OBS Studio Setup:
1. Resolución: **1920x1080**
2. FPS: **60fps** 
3. Bitrate: **6000 kbps**
4. Encoder: **x264**

### Fuentes:
- **Browser Source**: Para capturar aplicaciones web
- **Display Capture**: Para pantalla completa
- **Audio Input**: Para narración

## 🎬 Secuencia de Grabación


### 1. AltaMedica - Plataforma Médica Integral (3s)
- **URL**: `http://localhost:3003`
- **Descripción**: Sistema médico completo para pacientes y profesionales
- **Efectos sugeridos**: zoom_in, title_overlay

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 2. Dashboard de Pacientes (6s)
- **URL**: `http://localhost:3003`
- **Descripción**: Acceso a citas, historial médico y telemedicina
- **Efectos sugeridos**: smooth_pan, highlight_cards

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 3. Búsqueda de Especialistas (5s)
- **URL**: `http://localhost:3003/doctors`
- **Descripción**: Encuentra el doctor perfecto con filtros avanzados
- **Efectos sugeridos**: search_animation, card_focus

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 4. Telemedicina Avanzada (7s)
- **URL**: `http://localhost:3003/telemedicine`
- **Descripción**: Consultas médicas por video de alta calidad
- **Efectos sugeridos**: video_highlight, tech_zoom

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 5. Panel Médico Profesional (6s)
- **URL**: `http://localhost:3002`
- **Descripción**: Herramientas completas para profesionales médicos
- **Efectos sugeridos**: professional_transition, data_focus

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 6. Gestión de Pacientes (5s)
- **URL**: `http://localhost:3002/pacientes`
- **Descripción**: Sistema integral de historiales y seguimiento
- **Efectos sugeridos**: table_highlight, smooth_scroll

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 7. Marketplace Médico B2B (6s)
- **URL**: `http://localhost:3002/marketplace`
- **Descripción**: Conecta profesionales con oportunidades únicas
- **Efectos sugeridos**: grid_animation, card_reveal

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


### 8. AltaMedica - El Futuro Médico (4s)
- **URL**: `http://localhost:3003`
- **Descripción**: Transformando la atención médica digital
- **Efectos sugeridos**: zoom_out, logo_animation

**Acciones durante grabación:**
- Cargar página y esperar 2 segundos
- Hacer hover sobre elementos importantes
- Scroll suave si es necesario
- Resaltar características clave


## 🎨 Efectos de Post-Producción

### Transiciones Tipo YouTube:
1. **Zoom Rápido**:
   - Keyframe 1: Scale 100%
   - Keyframe 2: Scale 120% (0.3s después)
   - Easing: Ease Out

2. **Blur Transition**:
   - Keyframe 1: Blur 0
   - Keyframe 2: Blur 15 (0.2s)
   - Keyframe 3: Blur 0 (0.4s)

3. **Smooth Pan**:
   - Usar Position keyframes
   - Movimiento lento y suave
   - 2-3 segundos de duración

### Color Grading:
- **Contraste**: +15
- **Saturación**: +20
- **Shadows**: +10
- **Highlights**: -5

## 🎵 Audio

### Música de Fondo:
- Buscar en: YouTube Audio Library, Freesound
- Estilo: Corporate, Tech, Medical
- Volumen: -20dB (fondo)

### Narración:
- Grabar por separado
- Volumen: -6dB
- Eliminar ruido de fondo
- Compresión ligera

## 📝 Script de Narración


**AltaMedica - Plataforma Médica Integral**: "Sistema médico completo para pacientes y profesionales"

**Dashboard de Pacientes**: "Acceso a citas, historial médico y telemedicina"

**Búsqueda de Especialistas**: "Encuentra el doctor perfecto con filtros avanzados"

**Telemedicina Avanzada**: "Consultas médicas por video de alta calidad"

**Panel Médico Profesional**: "Herramientas completas para profesionales médicos"

**Gestión de Pacientes**: "Sistema integral de historiales y seguimiento"

**Marketplace Médico B2B**: "Conecta profesionales con oportunidades únicas"

**AltaMedica - El Futuro Médico**: "Transformando la atención médica digital"


## 🚀 Exportación Final

### Configuración DaVinci Resolve:
- **Codec**: H.264
- **Resolución**: 1920x1080
- **Frame Rate**: 60fps
- **Bitrate**: 10-15 Mbps
- **Audio**: AAC 320kbps

### YouTube Upload:
- **Formato**: MP4
- **Thumbnail**: 1280x720
- **Título**: "AltaMedica - Plataforma Médica Integral | Demo 2025"
- **Tags**: medicina, telemedicina, software médico, healthcare

## 💡 Tips Profesionales

1. **Planifica cada movimiento** - No improvises
2. **Usa un script** - Mantén consistencia
3. **Graba múltiples takes** - Elige el mejor
4. **Audio es clave** - 50% del impacto es audio
5. **Ritmo dinámico** - Varía la velocidad de transiciones

## 🎯 Resultado Esperado
Video de 42 segundos con transiciones suaves, efectos profesionales y audio claro que muestre todas las características de AltaMedica de manera impactante.

---
*Generado automáticamente por AltaMedica Video Demo Generator*
