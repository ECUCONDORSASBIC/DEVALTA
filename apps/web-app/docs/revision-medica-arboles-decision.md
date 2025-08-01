# Revisión Médica de Árboles de Decisión Clínica
## Sistema ALTAMEDICA - Motor de Decisión v1.0

**Fecha de creación:** 11 de Julio de 2025  
**Versión del documento:** 1.0  
**Estado:** Pendiente de revisión médica

---

## 📋 Resumen Ejecutivo

Este documento presenta los árboles de decisión clínica implementados en el sistema ALTAMEDICA para su revisión y validación por parte del equipo médico. El sistema diferencia entre pacientes pediátricos y adultos, aplicando reglas específicas según el grupo etario.

## 🎯 Casos de Validación Críticos Implementados

### ✅ Caso 1: Exclusión de IAM en Pacientes Pediátricos
- **Descripción:** Niño de 15 años con dolor intenso en brazo izquierdo
- **Comportamiento esperado:** NO incluir Infarto Agudo de Miocardio (IAM) en diagnósticos sugeridos
- **Estado actual:** ✅ IMPLEMENTADO Y VALIDADO
- **Test unitario:** `should not suggest heart attack for pediatric patients`

```typescript
// Contexto clínico del caso
{
  age: 15,
  symptoms: ["Dolor en brazo izquierdo"],
  severity: "high",
  bodyPart: "leftArm"
}

// Resultado esperado: IAM excluido de diagnósticos
```

## 📊 Árboles de Decisión Actuales

### 🧸 Reglas Pediátricas (< 18 años)

#### 1. Condiciones Respiratorias
```json
{
  "conditions": {
    "ageRange": { "min": 0, "max": 17 },
    "symptoms": ["cough", "fever", "chest"]
  },
  "questions": [
    {
      "id": "fever-duration",
      "text": "¿Cuántos días ha tenido fiebre?",
      "type": "slider",
      "range": { "min": 0, "max": 7, "step": 1 }
    }
  ],
  "diagnoses": [
    {
      "id": "viral-infection",
      "name": "Infección viral respiratoria",
      "urgency": "medium"
    }
  ]
}
```

#### 2. Condiciones Abdominales
```json
{
  "conditions": {
    "ageRange": { "min": 5, "max": 17 },
    "symptoms": ["abdominal", "pain"],
    "severity": "high"
  },
  "diagnoses": [
    {
      "id": "appendicitis",
      "name": "Posible apendicitis",
      "urgency": "critical"
    }
  ]
}
```

### 👨‍⚕️ Reglas Adultas (≥ 18 años)

#### 1. Condiciones Cardiovasculares
```json
{
  "conditions": {
    "ageRange": { "min": 30, "max": 999 },
    "symptoms": ["chest", "pain"],
    "bodyPart": "chest"
  },
  "diagnoses": [
    {
      "id": "heart-attack",
      "name": "Posible infarto agudo de miocardio",
      "urgency": "critical"
    }
  ]
}
```

## 🔍 Puntos Clave para Revisión Médica

### 1. Exclusiones por Edad
- [ ] **Validar:** IAM no se sugiere en menores de 18 años
- [ ] **Validar:** Condiciones pediátricas no aparecen en adultos
- [ ] **Revisar:** Umbrales de edad para cada condición

### 2. Urgencias y Priorización
- [ ] **Confirmar:** Clasificación de urgencias (critical/high/medium/low)
- [ ] **Revisar:** Condiciones que requieren atención inmediata
- [ ] **Validar:** Criterios para derivación a emergencias

### 3. Síntomas y Diagnósticos
- [ ] **Verificar:** Asociación correcta síntoma-diagnóstico
- [ ] **Agregar:** Diagnósticos diferenciales faltantes
- [ ] **Refinar:** Preguntas adaptativas para cada condición

### 4. Casos Especiales
- [ ] **Revisar:** Embarazo y condiciones asociadas
- [ ] **Validar:** Condiciones crónicas vs agudas
- [ ] **Confirmar:** Factores de riesgo cardiovascular

## 📝 Checklist de Validación Clínica

### Validaciones Generales
- [ ] Los árboles de decisión siguen guías clínicas actualizadas
- [ ] Las urgencias están correctamente clasificadas
- [ ] No hay diagnósticos peligrosos omitidos
- [ ] Las preguntas adaptativas son relevantes

### Validaciones Pediátricas
- [ ] Condiciones apropiadas para cada rango de edad
- [ ] Exclusión correcta de condiciones adultas
- [ ] Consideración de presentaciones atípicas en niños
- [ ] Lenguaje adaptado para padres/cuidadores

### Validaciones Adultas
- [ ] Factores de riesgo correctamente ponderados
- [ ] Condiciones geriátricas consideradas
- [ ] Diagnósticos diferenciales completos
- [ ] Criterios de derivación apropiados

## 🚨 Condiciones Críticas Requiriendo Validación Inmediata

1. **Meningitis pediátrica** - Actualmente no detectada correctamente
2. **Síndrome coronario agudo** - Validar criterios de inclusión
3. **Abdomen agudo** - Confirmar diagnósticos diferenciales
4. **Sepsis** - Agregar criterios de detección temprana

## 💡 Recomendaciones para el Equipo Médico

1. **Priorizar** la revisión de condiciones críticas/urgentes
2. **Validar** grupos etarios y exclusiones específicas
3. **Sugerir** preguntas adicionales para mejorar precisión
4. **Identificar** diagnósticos faltantes importantes
5. **Confirmar** que el lenguaje es apropiado para pacientes

## 📅 Próximos Pasos

1. **Revisión médica inicial** - Validar estructura general
2. **Refinamiento de reglas** - Ajustar según feedback médico
3. **Ampliación de condiciones** - Agregar más diagnósticos
4. **Validación con casos reales** - Probar con historias clínicas
5. **Certificación médica** - Aprobación formal del sistema

## ⚖️ Consideraciones Legales y Éticas

- El sistema es una **herramienta de apoyo**, no reemplaza el juicio clínico
- Todos los diagnósticos son **sugerencias** requiriendo validación médica
- Se debe mantener un **registro de auditoría** de todas las decisiones
- Los pacientes deben ser informados sobre el uso de IA en el proceso

## 📞 Contacto para Revisión

**Equipo de Desarrollo:** desarrollo@altamedica.com  
**Coordinador Médico:** [Por definir]  
**Fecha límite de revisión:** [Por definir]

---

*Este documento está sujeto a actualizaciones basadas en el feedback del equipo médico.*
