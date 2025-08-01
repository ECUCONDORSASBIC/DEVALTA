# Lista de Verificación para Revisión Médica
## Árboles de Decisión Clínica - Alta Médica

### Información General
- **Fecha de revisión**: [Pendiente]
- **Médicos revisores**: [Por asignar]
- **Versión del sistema**: 1.0

### Objetivo
Validar que los árboles de decisión clínica implementados en el sistema sean médicamente apropiados, seguros y estén alineados con las mejores prácticas clínicas.

## 1. Validaciones Críticas por Edad

### 1.1 Exclusiones Pediátricas
- [ ] **Validado**: Los pacientes menores de 18 años NO reciben diagnósticos de:
  - Infarto agudo de miocardio (IAM - I21.9)
  - Angina inestable (I20.0)
  - Enfermedad coronaria (I25.x)
  - EPOC (J44.x)
  
### 1.2 Condiciones Pediátricas Específicas
- [ ] **Validado**: Otitis media aguda (H66.9) se sugiere apropiadamente en:
  - Niños de 6 meses a 12 años
  - Con síntomas de dolor de oído + fiebre
  - Mayor probabilidad si hay antecedente de resfriado reciente

- [ ] **Validado**: Bronquiolitis y bronquitis aguda en población pediátrica
  - Grupos de edad apropiados
  - Síntomas respiratorios característicos

## 2. Condiciones de Urgencia Crítica

### 2.1 Apendicitis Aguda
- [ ] **Validado**: Marcada como urgencia "crítica"
- [ ] **Validado**: Síntomas clave incluyen:
  - Dolor en fosa ilíaca derecha
  - Dolor periumbilical que migra
  - Signos de rebote/defensa

### 2.2 Meningitis
- [ ] **Validado**: Identificación en población pediátrica
- [ ] **Validado**: Síntomas de alarma:
  - Fiebre + rigidez de nuca
  - Alteración del estado mental
  - Petequias (si aplica)

## 3. Factores de Riesgo Cardiovascular

### 3.1 Adultos Jóvenes (18-40 años)
- [ ] **Validado**: Sin factores de riesgo → baja probabilidad de eventos cardíacos
- [ ] **Validado**: Considerar causas no cardíacas del dolor torácico:
  - Musculoesqueléticas
  - Gastrointestinales
  - Ansiedad

### 3.2 Adultos Mayores (>40 años)
- [ ] **Validado**: Factores de riesgo aumentan probabilidad de diagnósticos cardíacos:
  - Hipertensión
  - Diabetes
  - Tabaquismo
  - Dislipidemia
  - Historia familiar

## 4. Casos Específicos para Validar

### Caso 1: Adolescente con dolor en brazo izquierdo
- **Edad**: 15 años
- **Síntoma**: Dolor en brazo izquierdo
- **Validación esperada**:
  - [ ] NO se sugiere IAM
  - [ ] NO se sugiere angina
  - [ ] Se consideran causas musculoesqueléticas
  - [ ] Se consideran lesiones deportivas/trauma

### Caso 2: Niño con dolor abdominal severo
- **Edad**: 10 años
- **Síntoma**: Dolor abdominal en FID
- **Validación esperada**:
  - [ ] Apendicitis marcada como crítica
  - [ ] Se sugiere evaluación urgente
  - [ ] Diagnósticos diferenciales apropiados

### Caso 3: Adulto joven sin factores de riesgo
- **Edad**: 25 años
- **Síntoma**: Dolor torácico
- **Sin factores de riesgo CV**
- **Validación esperada**:
  - [ ] Baja probabilidad de eventos cardíacos
  - [ ] Se consideran causas benignas primero

## 5. Recomendaciones de Mejora

### 5.1 Árboles de Decisión Faltantes
- [ ] Dolor de cabeza/cefalea
- [ ] Síntomas neurológicos (mareo, síncope)
- [ ] Dolor lumbar
- [ ] Síntomas urinarios
- [ ] Erupciones cutáneas

### 5.2 Refinamientos Sugeridos
- [ ] Agregar más síntomas de alarma ("red flags")
- [ ] Incluir escalas validadas (ej: Wells para TEP)
- [ ] Considerar comorbilidades

## 6. Aspectos Legales y Éticos

### 6.1 Disclaimers
- [ ] **Validado**: Sistema NO reemplaza evaluación médica
- [ ] **Validado**: Recomendación clara de buscar atención urgente cuando corresponda
- [ ] **Validado**: Limitaciones del sistema claramente establecidas

### 6.2 Seguridad del Paciente
- [ ] **Validado**: Sesgo hacia la seguridad (mejor sobre-referir que sub-diagnosticar)
- [ ] **Validado**: Condiciones críticas siempre marcadas con urgencia alta

## Firma y Aprobación

### Médico Revisor 1
- **Nombre**: _______________________
- **Especialidad**: _________________
- **Fecha**: _______________________
- **Firma**: _______________________

### Médico Revisor 2
- **Nombre**: _______________________
- **Especialidad**: _________________
- **Fecha**: _______________________
- **Firma**: _______________________

### Comentarios Adicionales
_[Espacio para observaciones y recomendaciones de los revisores]_

---

**Nota**: Este documento debe ser revisado y actualizado periódicamente según nuevas evidencias clínicas y feedback de usuarios.
