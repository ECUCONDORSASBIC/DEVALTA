# 🏥 Claude Prompts para usar en Gemini CLI

## 🎯 Cómo usar Claude desde Gemini

Una vez configurado, usa estos prompts en Gemini CLI para llamar a Claude con expertise médica:

---

## 🔒 **Análisis HIPAA Compliance**

```
Necesito que Claude analice el compliance HIPAA de este código.

@claude_hipaa
Analiza los siguientes archivos de AltaMedica para compliance HIPAA:
- apps/api-server/src/app/api/v1/patients/route.ts
- apps/api-server/src/lib/middleware/UnifiedAuth.ts
- packages/core/src/utils/medical-utils.ts

Enfócate en:
1. PHI handling y encryption
2. Access controls y role validation
3. Audit logging implementation
4. Compliance gaps y recommendations

Contexto: Este es el core del sistema médico que maneja información de pacientes.
```

---

## 📡 **Optimización WebRTC Médica**

```
Necesito que Claude optimice la implementación WebRTC para telemedicina.

@claude_webrtc
Analiza y optimiza este código WebRTC de AltaMedica:
- apps/signaling-server/src/index.ts
- apps/doctors/src/hooks/useWebRTC.ts
- apps/patients/src/hooks/useTelemedicineSession.ts

Target: <100ms latency para videollamadas médicas HD

Enfócate en:
1. Signaling server optimization
2. MediaSoup configuration
3. Network adaptability
4. Medical quality requirements
5. Emergency scenarios optimization

Contexto: Sistema de telemedicina para consultas médicas críticas.
```

---

## 🏥 **Review de Workflows Médicos**

```
Necesito que Claude revise workflows médicos para patient safety.

@claude_medical
Analiza este workflow médico de AltaMedica:
- Flujo de creación de citas médicas
- Proceso de telemedicina end-to-end
- Sistema de prescripciones digitales
- Emergency consultation workflow

Enfócate en:
1. Patient safety considerations
2. Medical accuracy validation
3. Emergency response times (<3 seconds)
4. FHIR R4 compliance
5. Healthcare workflow efficiency

Contexto: Workflows críticos que afectan directamente patient care.
```

---

## 🏗️ **Análisis de Arquitectura Médica**

```
Necesito que Claude analice la arquitectura médica del proyecto.

@claude_architecture
Analiza la arquitectura de AltaMedica:
- Service Layer pattern implementation
- Medical data flow entre 7 applications
- Shared packages para medical domain
- Security architecture para PHI protection

Enfócate en:
1. Medical domain modeling
2. Service pattern consistency
3. Security architecture review
4. Scalability para enterprise medical use
5. Medical compliance architecture

Contexto: Arquitectura enterprise para plataforma médica con 7 apps.
```

---

## 🔧 **Admin Dashboard Development Guidance**

```
Necesito que Claude guíe el desarrollo del admin dashboard.

@claude_medical
Claude, necesito desarrollar el admin dashboard de AltaMedica (actualmente 4.0/10).

Analiza estos dashboards existentes como referencia:
- apps/patients/src/components/dashboard/
- apps/doctors/src/components/dashboard/
- apps/companies/src/components/overview/

Proporciona:
1. Arquitectura component-based específica
2. Medical compliance features necesarias
3. HIPAA audit dashboard requirements
4. Performance metrics médicos críticos
5. 4-week development roadmap detallado

Target: Alcanzar 8.0/10 en 4 semanas.
Contexto: Admin dashboard para supervisión médica y compliance.
```

---

## 🧪 **Testing Strategy Médica**

```
Necesito que Claude diseñe estrategia de testing médica.

@claude_medical
Claude, analiza el testing actual de AltaMedica y diseña estrategia médica:

Coverage actual:
- Unit tests: 85%
- E2E tests: Cypress implementado
- Medical workflows: Parcial

Necesito estrategia para:
1. Medical calculations testing (edge cases críticos)
2. HIPAA compliance testing automation
3. WebRTC quality testing para telemedicina
4. Emergency scenarios testing (<3 seconds)
5. Patient safety testing protocols

Enfócate en testing específico del dominio médico.
```

---

## 💡 **Uso Avanzado - Análisis Colaborativo**

### **Workflow Gemini → Claude:**

```
Gemini: Analiza todo el codebase y identifica patrones arquitecturales.

Claude: [Desde Gemini] Basado en el análisis de Gemini, revisa estos patrones para medical safety y compliance HIPAA.

Resultado: Análisis comprehensivo con contexto completo + expertise médica.
```

### **Comandos Combinados:**

```
# En Gemini CLI:
> Analiza apps/api-server/src/services/ para identificar patterns

# Luego usar resultado con Claude:
@claude_architecture [Resultado del análisis de Gemini]
```

---

## 🎯 **Templates por Caso de Uso**

### **Debugging Médico:**
```
@claude_medical
Tengo un bug en [descripción]. El código es:
[código]

Como médico especialista, ¿qué implicaciones tiene este bug para patient safety? ¿Cómo lo arreglo manteniendo medical compliance?
```

### **Code Review Médico:**
```
@claude_hipaa
Revisa este código antes de deploy a producción:
[código]

¿Cumple con HIPAA? ¿Hay riesgos para PHI? ¿Qué mejoras de seguridad recomiendas?
```

### **Performance Médica:**
```
@claude_webrtc
Este endpoint tiene latencia alta en emergencias médicas:
[código]

Optimízalo para <3 seconds response time manteniendo medical accuracy.
```

---

## 🚀 **Setup Rápido en Gemini**

```bash
# 1. Instalar dependencias
cd ~/Documents/devaltamedica
node scripts/setup-claude-in-gemini.js

# 2. Configurar API key
# Editar gemini-claude-config.json con tu Claude API key

# 3. Iniciar Gemini con Claude
node start-gemini-with-claude.js

# 4. En Gemini CLI, usar:
@claude_medical [tu prompt médico]
```

---

**🏥 Con esta configuración, tendrás el poder de Gemini (contexto masivo) + Claude (expertise médica) trabajando juntos para AltaMedica!**