# Patient Monitoring Agent

The Patient Monitoring Agent continuously monitors patient vital signs, wearable device data, and EHR updates to predict deterioration using ML models and emit alerts.

## Features

- **Real-time Vital Signs Monitoring**: Processes continuous streams of patient vital signs
- **Wearable Device Integration**: Supports data from Fitbit, Apple Watch, Garmin, CGM, and ECG patches
- **EHR Integration**: Processes lab results, medications, diagnoses, and clinical notes
- **ML-based Prediction**: Uses machine learning models to predict:
  - Sepsis risk
  - Cardiac events
  - Respiratory failure
  - Neurological deterioration
  - Metabolic issues
- **Alert Generation**: Emits `patient.alert` events with severity levels and recommended actions
- **Reactive Rules Engine**: Configurable rules for detecting critical conditions
- **WebSocket Streaming**: Real-time streaming of vitals and alerts
- **Trend Analysis**: Detects deteriorating patient conditions over time

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Patient Monitoring Agent                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Vital     │  │   Wearable   │  │      EHR         │  │
│  │   Signs     │  │    Devices   │  │    Updates       │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘           │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │   Patient    │                         │
│                    │    State     │                         │
│                    └──────┬──────┘                         │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐             │
│         │                                   │             │
│    ┌────▼────┐                      ┌──────▼──────┐       │
│    │   ML    │                      │  Reactive   │       │
│    │ Models  │                      │    Rules    │       │
│    └────┬────┘                      └──────┬──────┘       │
│         │                                   │              │
│         └─────────────────┬─────────────────┘             │
│                           │                                │
│                    ┌──────▼──────┐                        │
│                    │    Alert    │                        │
│                    │  Generator  │                        │
│                    └──────┬──────┘                        │
│                           │                                │
│                    ┌──────▼──────┐                        │
│                    │  Event Bus  │ → patient.alert        │
│                    └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Patient Data Submission

#### Submit Vital Signs
```http
POST /patients/:patientId/vitals
Content-Type: application/json

{
  "heartRate": 72,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "respiratoryRate": 16,
  "temperature": 36.5,
  "oxygenSaturation": 98,
  "bloodGlucose": 95
}
```

#### Submit Wearable Data
```http
POST /patients/:patientId/wearable
Content-Type: application/json

{
  "deviceId": "device-abc123",
  "type": "fitbit",
  "data": {
    "hrv": 45,
    "activity": 5000,
    "sleep": {
      "quality": 0.8,
      "duration": 7.5
    }
  }
}
```

#### Submit EHR Update
```http
POST /patients/:patientId/ehr
Content-Type: application/json

{
  "updateType": "lab_results",
  "data": {
    "wbc": 8.5,
    "hemoglobin": 14.2,
    "platelets": 250,
    "creatinine": 0.9,
    "lactate": 1.2
  }
}
```

### Query Endpoints

#### Get Patient Status
```http
GET /patients/:patientId/status

Response:
{
  "patientId": "patient-001",
  "lastUpdated": "2024-01-20T10:30:00Z",
  "currentVitals": {...},
  "riskScores": {
    "sepsis": 0.15,
    "cardiac": 0.08,
    "respiratory": 0.12
  },
  "activeAlerts": [...],
  "deviceCount": 3
}
```

#### Get Active Alerts
```http
GET /alerts/active
GET /alerts/history?limit=100&severity=critical&type=sepsis
```

#### Get ML Model Status
```http
GET /models

Response:
[
  {
    "id": "sepsis_predictor",
    "name": "Sepsis Early Warning System",
    "type": "sepsis",
    "enabled": true,
    "threshold": 0.7,
    "inputFeatures": ["heartRate", "temperature", "respiratoryRate", "whiteBloodCellCount"]
  }
]
```

### WebSocket Streams

#### Vital Signs Stream
```javascript
const ws = new WebSocket('ws://localhost:3004/stream/vitals');
ws.send(JSON.stringify({
  type: 'subscribe',
  patientId: 'patient-001'
}));
```

#### Alert Stream
```javascript
const ws = new WebSocket('ws://localhost:3004/stream/alerts');
// Automatically receives all alerts
```

## Alert Schema

```typescript
interface PatientAlert {
  patientId: string;
  alertId: string;
  timestamp: string;
  type: 'sepsis' | 'cardiac' | 'respiratory' | 'neurological' | 'metabolic' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-1 confidence score
  indicators: string[]; // Features that triggered the alert
  recommendedActions: string[]; // Clinical recommendations
  modelUsed: string; // ML model or rule that generated the alert
}
```

## Configuration

```typescript
const config = {
  port: 3004,
  host: 'localhost',
  name: 'patient-monitoring-agent',
  eventBus: {
    url: 'ws://localhost:3010/event-bus',
  },
  scheduledJobs: [
    {
      name: 'monitoring_cycle',
      schedule: '*/1 * * * *', // Every minute
      handler: 'monitoringCycle',
    },
  ],
};
```

## ML Models

### Sepsis Predictor
- **Threshold**: 0.7
- **Features**: Heart rate, temperature, respiratory rate, WBC count
- **Actions**: Blood cultures, lactate check, antibiotics consideration

### Cardiac Risk Predictor
- **Threshold**: 0.75
- **Features**: Heart rate, blood pressure, ECG features
- **Actions**: ECG, cardiac biomarkers, consultation

### Respiratory Failure Predictor
- **Threshold**: 0.8
- **Features**: Respiratory rate, oxygen saturation, blood gas analysis
- **Actions**: ABG check, ventilation assessment, ICU consideration

## Reactive Rules

### Critical Vital Signs Rule
Triggers when any vital sign is outside critical ranges:
- Heart rate: < 40 or > 150
- Systolic BP: < 80 or > 180
- Temperature: < 35°C or > 39.5°C
- O2 saturation: < 88%

### Deterioration Trend Rule
Detects worsening conditions over 30+ minutes based on vital sign trends.

### ML Prediction Alert Rule
Triggers when ML models predict risk score ≥ 0.7 with confidence ≥ 0.8.

## Running the Agent

### Start the agent:
```bash
npm run start:patient-monitoring
# or
npx tsx src/patient-monitoring-agent/start.ts
```

### Run tests:
```bash
npx tsx test/patient-monitoring-test.ts
```

## Integration with Event Bus

The agent subscribes to:
- `patient.vitals.*`
- `patient.wearable.*`
- `patient.ehr.*`
- `device.data.*`
- `lab.results.*`

The agent publishes:
- `patient.alert` - Alert notifications
- `patient.vitals.processed` - Processed vital signs
- `patient.wearable.processed` - Processed wearable data
- `patient.ehr.processed` - Processed EHR updates
- `patient.monitoring.stale` - Stale patient data warnings
- `patient.deterioration` - Deterioration detected
- `patient.escalation.required` - Escalation needed
- `notification.send` - Send notifications

## Monitoring & Metrics

### Health Check
```http
GET /health
```

### Metrics
```http
GET /metrics
```

Key metrics:
- `active_patients` - Number of monitored patients
- `total_alerts` - Total alerts generated
- `critical_alerts` - Critical severity alerts
- `vitals_processed` - Vital signs processed
- `alert_generated` - Alerts by type and severity
- `ml_inference_duration` - ML model performance
- `rule_executed` - Rule executions

## Error Handling

- Validates all incoming data with Zod schemas
- Gracefully handles missing ML model features
- Circuit breaker pattern for external services
- Retry logic for transient failures
- Comprehensive error logging

## Security Considerations

- Input validation on all endpoints
- Rate limiting recommended
- Authentication/authorization to be implemented
- PHI data handling compliance required
- Audit logging for all patient data access

## Future Enhancements

1. **Additional ML Models**
   - Neurological deterioration prediction
   - Metabolic disorder detection
   - Multi-organ failure prediction

2. **Enhanced Features**
   - Anomaly detection in vital sign patterns
   - Personalized baselines per patient
   - Integration with clinical decision support
   - Predictive maintenance for medical devices

3. **Scalability**
   - Horizontal scaling with patient sharding
   - Stream processing with Kafka/Pulsar
   - Time-series database integration
   - Distributed ML inference

4. **Clinical Integration**
   - HL7 FHIR compatibility
   - Direct EHR system integration
   - Clinical workflow automation
   - Physician notification preferences
