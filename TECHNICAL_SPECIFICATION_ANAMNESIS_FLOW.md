# 📋 TECHNICAL SPECIFICATION: Full Anamnesis Flow
## AltaMedica Medical System - Complete Analysis & Requirements

### Version: 1.0.0
### Date: December 2024
### Status: Initial Analysis Complete

---

## 📊 EXECUTIVE SUMMARY

This document provides a comprehensive technical specification for the full anamnesis flow in the AltaMedica medical system, including analysis of existing 3D prototypes, functional requirements collection, API inventory, and UX persona development.

### Key Findings:
- **Current 3D Implementation**: Basic hospital scene with nurse model using React Three Fiber
- **Medical Data Models**: Comprehensive FHIR-compliant schemas with HIPAA/GDPR compliance
- **API Infrastructure**: Robust medical records, patient management, and AI symptom analysis endpoints
- **Authentication**: Firebase-based with role-based access control
- **Gaps Identified**: No complete anamnesis flow, missing body-part selection UI, limited questionnaire system

---

## 🏗️ CURRENT SYSTEM ARCHITECTURE ANALYSIS

### 3D Components Inventory

#### 1. HospitalScene (`/components/scene/HospitalScene.tsx`)
```typescript
// Current implementation uses React Three Fiber
- Environment: Hospital room EXR background
- Character: Nurse 3D model positioned at [0, 0, -2]
- Technology: @react-three/fiber, @react-three/drei
- Status: Basic prototype with room for enhancement
```

#### 2. Hospital3DClient (`/app/hospital3d/Hospital3DClient.tsx`)
```typescript
// Client-side wrapper for 3D scene
- Dynamic loading with SSR disabled
- Loading state management
- Basic error boundaries needed
```

#### 3. Nurse Component (`/components/scene/Nurse.tsx`)
```typescript
// 3D character model
- Uses GLTF loader for /models/nurse.glb
- Configurable positioning
- Ready for interaction enhancement
```

### Data Models & Types Analysis

#### 1. Medical Entities (`/types/medical-entities.ts`)
**Comprehensive SNOMED CT & ICD-11 compliant schemas:**

```typescript
interface Patient {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    socialSecurityNumber?: string; // AES-256 encrypted
    nationalId: string;
    phoneNumber: string;
    email: string;
    emergencyContact: EmergencyContact;
  };
  medicalInfo: {
    bloodType: BloodType;
    allergies: Allergy[];
    chronicConditions: ChronicCondition[];
    currentMedications: Medication[];
    medicalHistory: MedicalHistoryEntry[];
    vitalSigns: VitalSigns;
  };
  auditInfo: AuditInfo;
  privacySettings: PrivacySettings;
}
```

#### 2. Medical Records Schema (`/api/v1/medical-records/schemas.ts`)
**Zod validation with comprehensive clinical data:**

```typescript
- VitalSigns: Temperature, BP, HR, RR, O2Sat, Weight, Height, BMI
- Symptoms: Name, severity, duration, onset, triggers
- Diagnoses: ICD-10 codes, certainty levels, severity
- Treatments: Medications, procedures, therapy plans
- Allergies: Type-specific with severity ratings
```

### API Infrastructure Analysis

#### 1. AI Symptom Analysis (`/api/v1/ai/analyze-symptoms/route.ts`)
**Capabilities:**
- Symptom pattern recognition
- Risk factor analysis
- Emergency detection with automatic alerts
- Multi-language support (ES/EN)
- Confidence scoring and recommendations

#### 2. Patient Management (`/api/v1/patients/route.ts`)
**Features:**
- CRUD operations with validation
- Advanced filtering and search
- Pagination support
- Role-based access control
- Firestore integration

#### 3. Medical Records (`/api/v1/medical-records/`)
**Comprehensive system:**
- FHIR R4 compatibility
- Multi-level access controls
- Audit logging
- Version management
- Quality scoring

### Authentication & Security

#### Firebase Integration
```typescript
// Medical login with license validation
- Firebase Auth with custom claims
- Role-based permissions (ADMIN, MEDICO, ENFERMERO, PACIENTE)
- HIPAA-compliant audit trails
- AES-256 encryption for PHI
- Session management with token rotation
```

---

## 🎯 FUNCTIONAL REQUIREMENTS: Full Anamnesis Flow

### Phase 1: Patient Onboarding & Initial Assessment

#### FR-1.1: 3D Hospital Welcome
- **Priority**: High
- **Description**: Interactive 3D hospital environment for patient orientation
- **Components Needed**: 
  - Enhanced HospitalScene with navigation
  - Multiple room environments (reception, waiting, consultation)
  - Interactive NPC system (receptionists, nurses, doctors)
- **Current Gap**: Limited to single scene, no navigation

#### FR-1.2: Patient Registration in 3D Space
- **Priority**: High
- **Description**: Virtual reception desk for new patient registration
- **Components Needed**:
  - Registration kiosk 3D model
  - Form integration within 3D space
  - Document scanner simulation
  - Insurance verification system
- **Current Gap**: No 3D registration interface

### Phase 2: Interactive Questionnaire System

#### FR-2.1: Pre-Consultation Questionnaire
- **Priority**: High
- **Description**: Comprehensive health questionnaire with adaptive questioning
- **Components Needed**:
  ```typescript
  interface QuestionnaireSystem {
    questionTypes: 'multiple-choice' | 'scale' | 'text' | 'boolean' | 'date';
    adaptiveLogic: ConditionalBranching;
    progressTracking: ProgressIndicator;
    validation: ZodSchemas;
    autoSave: boolean;
  }
  ```
- **Current Gap**: No questionnaire system exists

#### FR-2.2: Medical History Collection
- **Priority**: High
- **Description**: Structured collection of past medical events
- **Components Needed**:
  - Timeline interface for medical events
  - Medication history with drug interaction checking
  - Family history tree visualization
  - Previous diagnosis import system
- **Current Gap**: Manual data entry only

### Phase 3: Body-Part Selection & Symptom Mapping

#### FR-3.1: Interactive Body Diagram
- **Priority**: Critical
- **Description**: 3D human body model for symptom localization
- **Components Needed**:
  ```typescript
  interface BodyPartSelector {
    model3D: 'male' | 'female' | 'child';
    anatomicalSystems: 'skeletal' | 'muscular' | 'circulatory' | 'nervous';
    selectionModes: 'click' | 'hover' | 'drag';
    symptomMapping: SymptomToBodyPart[];
    zoomLevels: number[];
  }
  ```
- **Current Gap**: No body part selection system

#### FR-3.2: Symptom Intensity & Duration Mapping
- **Priority**: High
- **Description**: Visual tools for describing symptom characteristics
- **Components Needed**:
  - Pain scale visualizations (1-10, Wong-Baker faces)
  - Duration selectors (acute, chronic, intermittent)
  - Trigger identification system
  - Symptom progression tracking
- **Current Gap**: Basic severity enum only

### Phase 4: AI-Powered Analysis & Review

#### FR-4.1: Real-time Symptom Analysis
- **Priority**: High
- **Description**: Enhanced AI analysis with visual feedback
- **Current Implementation**: Basic pattern matching in `/api/v1/ai/analyze-symptoms/`
- **Enhancements Needed**:
  - Integration with body part data
  - Visual confidence indicators
  - Differential diagnosis suggestions
  - Risk stratification with color coding

#### FR-4.2: Doctor Review Interface
- **Priority**: Critical
- **Description**: Comprehensive review system for medical professionals
- **Components Needed**:
  ```typescript
  interface DoctorReviewSystem {
    patientSummary: ComprehensiveView;
    aiRecommendations: AIAnalysisResults;
    editableFields: MedicalRecord[];
    approvalWorkflow: WorkflowState[];
    collaborationTools: Comment[];
  }
  ```
- **Current Gap**: No doctor review interface

### Phase 5: Documentation & Follow-up

#### FR-5.1: Automated Medical Record Generation
- **Priority**: High
- **Description**: Generate structured medical records from anamnesis data
- **Components Needed**:
  - FHIR R4 resource generation
  - PDF report generation
  - ICD-10 code assignment
  - Treatment plan templates
- **Current Implementation**: Manual record creation

#### FR-5.2: Follow-up Scheduling & Monitoring
- **Priority**: Medium
- **Description**: Automated follow-up based on analysis results
- **Components Needed**:
  - Appointment scheduling integration
  - Reminder system
  - Progress tracking
  - Care plan adjustments
- **Current Gap**: No automated follow-up

---

## 👥 UX PERSONAS

### Persona 1: María González - Patient (Age 45)
**Demographics**: Working mother, moderate tech literacy, chronic hypertension
**Goals**: 
- Quick, efficient medical consultations
- Easy symptom tracking
- Understanding of her condition
**Pain Points**:
- Long waiting times
- Difficulty explaining symptoms
- Forgetting medical history details
**3D Experience Needs**:
- Intuitive navigation
- Clear visual feedback
- Multilingual support (Spanish primary)
- Accessible design for vision impairments

**User Journey**:
1. **Entry**: Virtual reception with helpful guide
2. **Registration**: Voice-guided form completion
3. **Waiting**: Educational content about her condition
4. **Consultation**: Easy symptom reporting with visual aids
5. **Follow-up**: Simple appointment scheduling

### Persona 2: Dr. Eduardo Marques - Medical Director (Age 52)
**Demographics**: 25+ years experience, technology adopter, efficiency-focused
**Goals**:
- Comprehensive patient information
- Efficient diagnosis process
- Quality care delivery
- Reduced administrative burden
**Pain Points**:
- Incomplete patient histories
- Time-consuming documentation
- Inconsistent data quality
**3D Experience Needs**:
- Quick access to all patient data
- AI-assisted decision support
- Streamlined documentation
- Integration with existing workflows

**User Journey**:
1. **Pre-consultation**: Review AI-generated patient summary
2. **Consultation**: Access 3D body mapping results
3. **Diagnosis**: Utilize AI recommendations
4. **Documentation**: Auto-generated medical records
5. **Follow-up**: Automated care plan creation

### Persona 3: Ana Rodríguez - Head Nurse (Age 38)
**Demographics**: Clinical coordinator, patient advocate, workflow optimizer
**Goals**:
- Smooth patient flow
- Accurate vital signs collection
- Patient comfort and education
**Pain Points**:
- Rushed patient interactions
- Incomplete preliminary data
- Communication barriers
**3D Experience Needs**:
- Efficient data collection tools
- Patient education resources
- Multi-device compatibility
- Role-based access controls

**User Journey**:
1. **Patient Check-in**: Guide through 3D registration
2. **Vitals Collection**: Integrated measurement tools
3. **Preparation**: Brief doctor on patient status
4. **Support**: Assist during consultation if needed
5. **Discharge**: Provide care instructions

---

## 🔌 API INVENTORY & INTEGRATION POINTS

### Existing APIs (Production Ready)

#### 1. Patient Management API
```typescript
// Base URL: /api/v1/patients
Endpoints:
- GET    /              // List patients with filtering
- POST   /              // Create patient profile
- GET    /:id           // Get patient by ID
- PUT    /:id           // Update patient data
- DELETE /:id           // Soft delete patient

// Integration Points:
- Firebase Auth for authorization
- Firestore for data persistence
- Zod for validation
- Pagination support
```

#### 2. Medical Records API
```typescript
// Base URL: /api/v1/medical-records
Endpoints:
- GET    /              // Query medical records
- POST   /              // Create new record
- GET    /:id           // Get specific record
- PUT    /:id           // Update record
- DELETE /:id           // Archive record

// Features:
- FHIR R4 compatibility
- Access level controls
- Audit logging
- Version management
```

#### 3. AI Symptom Analysis API
```typescript
// Base URL: /api/v1/ai/analyze-symptoms
Endpoint:
- POST   /              // Analyze patient symptoms

// Input Schema:
interface SymptomAnalysisRequest {
  patientId: string;
  symptoms: Symptom[];
  patientInfo: PatientInfo;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
}

// Output:
- Possible conditions with probabilities
- Urgency recommendations
- Specialist referrals
- Follow-up plans
```

### APIs Needed for Full Anamnesis Flow

#### 1. Questionnaire Management API
```typescript
// Proposed: /api/v1/questionnaires
Endpoints Needed:
- GET    /templates     // Get questionnaire templates
- POST   /sessions      // Start questionnaire session
- PUT    /sessions/:id  // Update session responses
- POST   /sessions/:id/complete // Complete session
- GET    /sessions/:id/results  // Get analysis results
```

#### 2. Body Part Mapping API
```typescript
// Proposed: /api/v1/body-parts
Endpoints Needed:
- GET    /models        // Get 3D body models
- POST   /selections    // Record body part selections
- GET    /symptoms      // Get symptoms by body part
- POST   /mappings      // Create symptom-to-body mappings
```

#### 3. 3D Scene Management API
```typescript
// Proposed: /api/v1/scenes
Endpoints Needed:
- GET    /environments  // Get available 3D environments
- GET    /npcs          // Get NPC configurations
- POST   /interactions  // Log user interactions
- GET    /navigation    // Get navigation paths
```

#### 4. Doctor Review API
```typescript
// Proposed: /api/v1/reviews
Endpoints Needed:
- GET    /pending       // Get pending reviews
- POST   /assignments   // Assign to doctor
- PUT    /:id/status    // Update review status
- POST   /:id/approve   // Approve anamnesis
- POST   /:id/feedback  // Provide feedback
```

### Integration Requirements

#### External APIs Needed
1. **Medical Coding APIs**:
   - ICD-10 code lookup
   - SNOMED CT terminology
   - Drug interaction databases

2. **Communication APIs**:
   - SMS for appointment reminders
   - Email for reports
   - Push notifications

3. **Analytics APIs**:
   - Patient flow analytics
   - Clinical decision metrics
   - User experience tracking

---

## 🏥 TECHNICAL ARCHITECTURE RECOMMENDATIONS

### Frontend Architecture

#### 3D Scene Enhancement
```typescript
// Recommended Structure
/components/3d/
├── scenes/
│   ├── HospitalReception.tsx
│   ├── ConsultationRoom.tsx
│   ├── WaitingArea.tsx
│   └── ExaminationRoom.tsx
├── characters/
│   ├── Nurse.tsx
│   ├── Doctor.tsx
│   ├── Receptionist.tsx
│   └── Patient.tsx
├── interactions/
│   ├── Navigation.tsx
│   ├── DialogSystem.tsx
│   └── FormIntegration.tsx
└── ui/
    ├── HUD.tsx
    ├── ProgressIndicator.tsx
    └── AccessibilityControls.tsx
```

#### Questionnaire System
```typescript
/components/questionnaire/
├── QuestionnaireEngine.tsx
├── QuestionTypes/
│   ├── MultipleChoice.tsx
│   ├── ScaleQuestion.tsx
│   ├── TextInput.tsx
│   └── DatePicker.tsx
├── BodyPartSelector/
│   ├── BodyModel3D.tsx
│   ├── AnatomyViewer.tsx
│   └── SymptomMapper.tsx
└── ProgressTracking/
    ├── SectionProgress.tsx
    └── OverallProgress.tsx
```

### Backend Architecture

#### Microservices Approach
```typescript
/services/
├── anamnesis-service/     // Questionnaire management
├── ai-analysis-service/   // Enhanced symptom analysis
├── body-mapping-service/  // Body part interactions
├── review-service/        // Doctor review workflow
└── notification-service/  // Follow-up management
```

#### Database Schema Extensions
```sql
-- New tables needed
CREATE TABLE questionnaire_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  sections JSONB,
  adaptive_logic JSONB,
  created_at TIMESTAMP
);

CREATE TABLE questionnaire_sessions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  template_id UUID REFERENCES questionnaire_templates(id),
  responses JSONB,
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE body_part_selections (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES questionnaire_sessions(id),
  body_part VARCHAR(100),
  coordinates POINT,
  symptoms TEXT[],
  intensity INTEGER
);

CREATE TABLE doctor_reviews (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES questionnaire_sessions(id),
  doctor_id UUID REFERENCES users(id),
  status VARCHAR(50),
  notes TEXT,
  approved_at TIMESTAMP
);
```

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)
- **Week 1-2**: Enhanced 3D scene system with multiple rooms
- **Week 3-4**: Basic questionnaire engine with adaptive logic

### Phase 2: Core Features (Weeks 5-12)
- **Week 5-8**: Body part selection system with 3D integration
- **Week 9-12**: AI analysis enhancement and doctor review interface

### Phase 3: Integration & Testing (Weeks 13-16)
- **Week 13-14**: End-to-end flow integration
- **Week 15-16**: User testing and refinement

### Phase 4: Production Deployment (Weeks 17-20)
- **Week 17-18**: Performance optimization and security audit
- **Week 19-20**: Production deployment and monitoring setup

---

## 🔒 SECURITY & COMPLIANCE CONSIDERATIONS

### Data Protection
- **Encryption**: AES-256 for PHI at rest and in transit
- **Access Control**: Role-based with principle of least privilege
- **Audit Logging**: Comprehensive activity tracking
- **Data Retention**: Configurable policies per jurisdiction

### Regulatory Compliance
- **HIPAA**: Business Associate Agreements, risk assessments
- **GDPR**: Data subject rights, consent management
- **FDA**: Software as Medical Device considerations
- **Local**: Argentina medical data protection laws

### 3D Environment Security
- **Asset Protection**: Secure model loading and caching
- **Interaction Validation**: Prevent manipulation of clinical data
- **Session Security**: Secure WebGL context management
- **Privacy**: No sensitive data in 3D scene metadata

---

## 📊 SUCCESS METRICS & KPIs

### Clinical Outcomes
- **Diagnostic Accuracy**: AI prediction vs. final diagnosis
- **Time to Diagnosis**: Baseline vs. with anamnesis system
- **Patient Satisfaction**: Survey scores and retention rates
- **Doctor Efficiency**: Time spent per consultation

### Technical Performance
- **3D Scene Load Time**: Target <3 seconds
- **API Response Time**: Target <500ms for critical endpoints
- **System Uptime**: Target 99.9% availability
- **Data Quality Score**: Completeness and accuracy metrics

### User Experience
- **Task Completion Rate**: Successful anamnesis completion
- **User Error Rate**: Form validation failures
- **Accessibility Compliance**: WCAG 2.1 AA standards
- **Multi-device Usage**: Desktop, tablet, mobile performance

---

## 🔧 TECHNICAL DEBT & KNOWN ISSUES

### Current Limitations
1. **3D Performance**: Limited optimization for low-end devices
2. **Accessibility**: Insufficient keyboard navigation in 3D scenes
3. **Internationalization**: Hardcoded strings in Spanish
4. **Error Handling**: Basic error boundaries need enhancement
5. **Testing Coverage**: Limited unit tests for 3D components

### Recommended Improvements
1. **Component Architecture**: Move to composition pattern
2. **State Management**: Implement Redux Toolkit for complex flows
3. **Type Safety**: Enhance TypeScript strict mode compliance
4. **Performance**: Implement virtualization for large datasets
5. **Monitoring**: Add comprehensive application performance monitoring

---

## 📝 CONCLUSION

The AltaMedica system has a solid foundation for implementing a comprehensive anamnesis flow. The existing medical data models, API infrastructure, and 3D prototype provide excellent starting points. The main gaps are in the user interface layer, specifically:

1. **Interactive questionnaire system** with adaptive logic
2. **3D body part selection** integrated with symptom mapping
3. **Doctor review interface** for anamnesis validation
4. **End-to-end flow orchestration** connecting all components

The proposed solution maintains HIPAA/GDPR compliance while delivering an innovative, user-friendly experience that can significantly improve diagnostic accuracy and patient satisfaction.

### Next Steps
1. **Stakeholder Review**: Present this specification to medical and technical teams
2. **Prototype Development**: Begin with body part selection component
3. **User Testing**: Validate personas with real patients and doctors
4. **Technical Refinement**: Detailed API design and database schema

---

*Document prepared by: AI Medical Systems Analyst*  
*Review cycle: Every 2 weeks during implementation*  
*Next review date: January 15, 2025*
