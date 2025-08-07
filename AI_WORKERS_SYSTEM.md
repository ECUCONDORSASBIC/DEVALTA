# 🤖 Sistema de AI Workers - AltaMedica Platform

## 📋 Resumen Ejecutivo

El sistema de AI Workers de AltaMedica es una arquitectura asíncrona de procesamiento de tareas de inteligencia artificial médica, diseñada para manejar operaciones computacionalmente intensivas sin bloquear el servidor principal.

## 🏗️ Arquitectura del Sistema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Server  │────▶│  Firestore   │◀────│  AI Worker   │
│   (React)    │◀────│  (Next.js)   │◀────│  (ai_jobs)   │────▶│  (Python)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                                           │
                            ▼                                           ▼
                    ┌──────────────┐                         ┌──────────────┐
                    │   Job Queue  │                         │  AI Models   │
                    │  Management  │                         │ (TensorFlow) │
                    └──────────────┘                         └──────────────┘
```

## 🚀 Inicio Rápido

### 1. Configuración Inicial

```bash
# Navegar al directorio de Python
cd C:\Users\Eduardo\Documents\devaltamedica\tools\python

# Crear entorno virtual
python -m venv .venv

# Activar entorno
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Firebase

```bash
# Establecer credenciales (Windows)
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Eduardo\Documents\devaltamedica\apps\api-server\altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json
```

### 3. Iniciar el Sistema Completo

```bash
# Opción 1: Script automatizado
C:\Users\Eduardo\Documents\devaltamedica\START_AI_SYSTEM.bat

# Opción 2: Manual
# Terminal 1 - API Server
pnpm --filter api-server dev

# Terminal 2 - AI Worker
cd tools\python
start_ai_worker.bat
```

## 📊 Tipos de Jobs Soportados

### 1. `summarize_medical_record`
Genera un resumen ejecutivo del historial médico del paciente.

```javascript
{
  "type": "summarize_medical_record",
  "patientId": "PATIENT_123",
  "context": {
    "timeRange": "last_6_months",
    "focus": ["diagnoses", "medications"]
  }
}
```

### 2. `analyze_symptoms`
Analiza síntomas y sugiere posibles condiciones.

```javascript
{
  "type": "analyze_symptoms",
  "patientId": "PATIENT_456",
  "context": {
    "symptoms": ["headache", "fever", "fatigue"],
    "duration": "3 days"
  }
}
```

### 3. `generate_prescription`
Genera recomendaciones de prescripción basadas en diagnóstico.

```javascript
{
  "type": "generate_prescription",
  "patientId": "PATIENT_789",
  "context": {
    "diagnosis": "hypertension",
    "allergies": ["penicillin"],
    "currentMedications": ["metformin"]
  }
}
```

### 4. `analyze_lab_results`
Interpreta resultados de laboratorio.

```javascript
{
  "type": "analyze_lab_results",
  "patientId": "PATIENT_012",
  "context": {
    "labType": "blood_panel",
    "results": {
      "glucose": 145,
      "cholesterol": 220
    }
  }
}
```

## 🔄 Flujo de Procesamiento

### 1. Creación del Job (API Server)

```typescript
// POST /api/v1/ai/jobs
const createJob = async (jobData) => {
  const newJob = {
    id: generateId(),
    type: jobData.type,
    patientId: jobData.patientId,
    status: 'queued',
    createdAt: new Date(),
    result: null,
    error: null
  };
  
  await firestore.collection('ai_jobs').add(newJob);
  return newJob;
};
```

### 2. Detección del Job (Python Worker)

```python
# Worker escucha cambios en Firestore
def on_snapshot(doc_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            job_data = change.document.to_dict()
            if job_data.get('status') == 'queued':
                process_job(job_id, job_data)
```

### 3. Procesamiento con IA

```python
def process_summarize_medical_record(job_data):
    # 1. Obtener datos del paciente
    patient_data = fetch_patient_data(job_data['patientId'])
    
    # 2. Llamar al modelo de IA
    summary = ai_model.summarize(patient_data)
    
    # 3. Retornar resultado
    return {
        "summary": summary,
        "keyFindings": extract_key_findings(summary),
        "recommendations": generate_recommendations(summary)
    }
```

### 4. Actualización del Estado

```python
# Actualizar job en Firestore
jobs_collection.document(job_id).update({
    'status': 'completed',
    'result': result,
    'updatedAt': firestore.SERVER_TIMESTAMP
})
```

## 📡 API Endpoints

### Crear Job
```bash
POST /api/v1/ai/jobs
Content-Type: application/json

{
  "type": "summarize_medical_record",
  "patientId": "PATIENT_123",
  "context": {}
}
```

### Consultar Estado del Job
```bash
GET /api/v1/ai/jobs/{jobId}
```

### Listar Jobs de un Paciente
```bash
GET /api/v1/ai/jobs?patientId=PATIENT_123
```

## 🧪 Testing

### Test Manual con Python
```bash
cd tools\python
python test_ai_job.py
```

### Test con cURL
```bash
curl -X POST http://localhost:3001/api/v1/ai/jobs \
  -H "Content-Type: application/json" \
  -d '{"type": "summarize_medical_record", "patientId": "PATIENT_TEST"}'
```

### Test con Postman
```
POST http://localhost:3001/api/v1/ai/jobs
Body (JSON):
{
  "type": "analyze_symptoms",
  "patientId": "PATIENT_001",
  "context": {
    "symptoms": ["headache", "nausea"],
    "severity": "moderate"
  }
}
```

## 🔍 Monitoreo

### Logs del Worker
```python
# El worker imprime logs detallados
🤖 AI Worker started. Listening for new jobs...
New job detected: job_abc123
Processing job job_abc123 of type summarize_medical_record...
✅ Job job_abc123 completed successfully.
```

### Firestore Console
1. Ir a https://console.firebase.google.com
2. Seleccionar proyecto `altamedic-20f69`
3. Navegar a Firestore Database
4. Buscar colección `ai_jobs`

### Métricas del Sistema
```javascript
// Endpoint de métricas
GET /api/v1/ai/jobs/stats

{
  "totalJobs": 150,
  "queued": 5,
  "processing": 2,
  "completed": 140,
  "failed": 3,
  "averageProcessingTime": 15.3 // segundos
}
```

## 🚨 Manejo de Errores

### Reintentos Automáticos
```python
MAX_RETRIES = 3
RETRY_DELAY = 5  # segundos

def process_job_with_retry(job_id, job_data):
    for attempt in range(MAX_RETRIES):
        try:
            process_job(job_id, job_data)
            break
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                mark_job_failed(job_id, str(e))
```

### Dead Letter Queue
Jobs que fallan repetidamente se mueven a una cola especial:
```python
if job_data['failureCount'] > 3:
    move_to_dlq(job_id, job_data)
```

## 🔐 Seguridad

### Autenticación
- Worker usa Service Account con permisos mínimos
- API requiere JWT válido para crear jobs

### Validación de Datos
```python
# Validación con Zod en TypeScript
const AIJobSchema = z.object({
  type: z.enum([...validTypes]),
  patientId: z.string().regex(/^PATIENT_\d+$/),
  context: z.record(z.any()).optional()
});
```

### Encriptación
- Datos sensibles encriptados en tránsito (HTTPS)
- Firestore con encriptación at-rest

## 📈 Escalabilidad

### Múltiples Workers
```python
# Iniciar múltiples instancias
python workers/ai_worker.py --worker-id=1
python workers/ai_worker.py --worker-id=2
python workers/ai_worker.py --worker-id=3
```

### Load Balancing
```python
# Asignación basada en hash del job ID
worker_id = hash(job_id) % num_workers
if worker_id == my_worker_id:
    process_job(job_id, job_data)
```

## 🛠️ Troubleshooting

### Worker no detecta jobs
1. Verificar credenciales Firebase
2. Confirmar conexión a Firestore
3. Revisar permisos del Service Account

### Jobs quedan en 'processing'
1. Verificar logs del worker
2. Implementar timeout automático
3. Limpiar jobs huérfanos

### API no puede crear jobs
1. Verificar que Firebase Admin SDK esté inicializado
2. Confirmar que los tipos estén exportados correctamente
3. Revisar logs del API server

## 📚 Próximos Pasos

### Mejoras Planificadas
1. **Integración con OpenAI/Gemini** para análisis más sofisticado
2. **Cache de resultados** para consultas repetidas
3. **WebSocket notifications** para actualizaciones en tiempo real
4. **Dashboard de monitoreo** con métricas en vivo
5. **Auto-scaling** basado en carga de trabajo

### Nuevos Tipos de Jobs
- `medical_image_analysis` - Análisis de radiografías con TensorFlow
- `drug_interaction_check` - Verificación de interacciones medicamentosas
- `treatment_plan_generation` - Planes de tratamiento personalizados
- `clinical_trial_matching` - Matching con ensayos clínicos

## 📞 Soporte

Para problemas o preguntas:
- **Documentación**: `/docs/ai-workers/`
- **Logs**: `/tools/python/logs/`
- **Firebase Console**: https://console.firebase.google.com/project/altamedic-20f69

---

**Última actualización**: 7 de Enero, 2025  
**Versión**: 1.0.0  
**Autor**: Eduardo Marques, MD - AltaMedica Platform