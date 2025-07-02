#!/usr/bin/env node
/**
 * 🏥 DEMOSTRACIÓN: CONTEXTO MÉDICO ESPECIALIZADO
 * =============================================
 * Muestra cómo Copilot Enhanced añade contexto médico automáticamente
 */

async function demonstrateMedicalContext() {
  console.log('🏥 DEMOSTRACIÓN: CONTEXTO MÉDICO ESPECIALIZADO');
  console.log('='.repeat(55));
  
  const examples = [
    {
      input: "Create a patient registration form",
      copilotBasic: `// Copilot básico sugiere:
function PatientForm() {
  return (
    <form>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <input name="phone" placeholder="Phone" />
    </form>
  );
}`,
      copilotEnhanced: `// Copilot Enhanced con contexto médico automático:
interface Patient {
  // PHI (Protected Health Information) fields
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn?: string; // Encrypted SSN
  insurance: InsuranceInfo;
  emergencyContact: EmergencyContact;
}

function PatientRegistrationForm() {
  const [patient, setPatient] = useState<Patient>();
  const [hipaaConsent, setHipaaConsent] = useState(false);
  
  // HIPAA compliant data handling
  const handleSubmit = async (data: Patient) => {
    // Audit logging required
    await auditLog.create({
      action: 'PATIENT_REGISTRATION',
      userId: currentUser.id,
      timestamp: new Date(),
      dataAccessed: ['firstName', 'lastName', 'dob']
    });
    
    // Encrypt PHI before storage
    const encryptedData = await encryptPHI(data);
    await savePatient(encryptedData);
  };

  return (
    <form onSubmit={handleSubmit} className="hipaa-compliant-form">
      {/* HIPAA Notice */}
      <HIPAANotice />
      
      {/* MRN auto-generation */}
      <input 
        name="mrn" 
        value={generateMRN()} 
        readOnly 
        aria-label="Medical Record Number"
      />
      
      {/* Required fields with validation */}
      <input 
        name="firstName" 
        required 
        pattern="[A-Za-z]+"
        aria-label="First Name"
      />
      
      {/* Date of Birth with age calculation */}
      <input 
        type="date" 
        name="dateOfBirth" 
        max={new Date().toISOString().split('T')[0]}
        onChange={calculateAge}
        aria-label="Date of Birth"
      />
      
      {/* Emergency Contact (required for minors) */}
      <EmergencyContactFields />
      
      {/* HIPAA Consent Checkbox */}
      <label>
        <input 
          type="checkbox" 
          checked={hipaaConsent}
          onChange={(e) => setHipaaConsent(e.target.checked)}
          required
        />
        I consent to the use and disclosure of my health information 
        as described in the Notice of Privacy Practices.
      </label>
      
      <button type="submit" disabled={!hipaaConsent}>
        Register Patient
      </button>
    </form>
  );
}`
    },
    {
      input: "Create ICD-10 diagnosis component",
      copilotBasic: `// Copilot básico sugiere:
function DiagnosisSelect() {
  return (
    <select name="diagnosis">
      <option value="">Select diagnosis</option>
      <option value="common-cold">Common Cold</option>
      <option value="flu">Flu</option>
    </select>
  );
}`,
      copilotEnhanced: `// Copilot Enhanced con contexto ICD-10:
interface ICD10Code {
  code: string;
  description: string;
  category: string;
  billable: boolean;
  effectiveDate: Date;
  revisionDate?: Date;
}

interface DiagnosisComponentProps {
  onDiagnosisSelect: (diagnosis: ICD10Code) => void;
  specialty?: MedicalSpecialty;
  required?: boolean;
}

function ICD10DiagnosisComponent({ 
  onDiagnosisSelect, 
  specialty,
  required = false 
}: DiagnosisComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ICD10Code[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<ICD10Code | null>(null);
  
  // ICD-10 code validation
  const validateICD10Code = (code: string): boolean => {
    // ICD-10 format: Letter + 2 digits + optional decimal + 1-2 chars
    const icd10Pattern = /^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/;
    return icd10Pattern.test(code);
  };
  
  // Search ICD-10 database with debounced API call
  const searchICD10 = useCallback(
    debounce(async (term: string) => {
      if (term.length < 3) return;
      
      try {
        const results = await icd10API.search({
          term,
          specialty,
          billableOnly: true,
          currentVersion: true
        });
        
        setSuggestions(results);
      } catch (error) {
        console.error('ICD-10 search failed:', error);
      }
    }, 300),
    [specialty]
  );
  
  const handleDiagnosisSelect = (diagnosis: ICD10Code) => {
    // Validate code is current and billable
    if (!diagnosis.billable) {
      showWarning('Selected code is not billable for insurance claims');
    }
    
    setSelectedDiagnosis(diagnosis);
    onDiagnosisSelect(diagnosis);
    
    // Audit log for diagnosis entry
    auditLog.create({
      action: 'DIAGNOSIS_SELECTED',
      icd10Code: diagnosis.code,
      description: diagnosis.description,
      timestamp: new Date()
    });
  };
  
  return (
    <div className="icd10-diagnosis-component">
      <label htmlFor="diagnosis-search">
        ICD-10 Diagnosis Code {required && '*'}
      </label>
      
      <div className="diagnosis-search-container">
        <input
          id="diagnosis-search"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchICD10(e.target.value);
          }}
          placeholder="Search ICD-10 codes (e.g., Z00.00, M79.3)"
          autoComplete="off"
          required={required}
        />
        
        {suggestions.length > 0 && (
          <div className="diagnosis-suggestions">
            {suggestions.map((diagnosis) => (
              <div
                key={diagnosis.code}
                className="diagnosis-option"
                onClick={() => handleDiagnosisSelect(diagnosis)}
              >
                <strong>{diagnosis.code}</strong>
                <span className="diagnosis-description">
                  {diagnosis.description}
                </span>
                {!diagnosis.billable && (
                  <span className="non-billable-warning">
                    Non-billable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedDiagnosis && (
        <div className="selected-diagnosis">
          <h4>Selected Diagnosis:</h4>
          <p><strong>Code:</strong> {selectedDiagnosis.code}</p>
          <p><strong>Description:</strong> {selectedDiagnosis.description}</p>
          <p><strong>Category:</strong> {selectedDiagnosis.category}</p>
          <p><strong>Billable:</strong> {selectedDiagnosis.billable ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}`
    }
  ];

  for (const [index, example] of examples.entries()) {
    console.log(`\n📌 EJEMPLO ${index + 1}: "${example.input}"`);
    console.log('='.repeat(60));
    
    console.log('\n❌ COPILOT BÁSICO (Sin contexto médico):');
    console.log('-'.repeat(45));
    console.log(example.copilotBasic);
    
    console.log('\n✅ COPILOT ENHANCED (Con contexto médico automático):');
    console.log('-'.repeat(55));
    console.log(example.copilotEnhanced);
    
    console.log('\n🎯 MEJORAS AUTOMÁTICAS APLICADAS:');
    console.log('• ✅ Terminología médica (ICD-10, CPT, SNOMED)');
    console.log('• ✅ Cumplimiento HIPAA obligatorio');
    console.log('• ✅ Validación de códigos médicos');
    console.log('• ✅ Audit logging automático');
    console.log('• ✅ Encriptación de PHI');
    console.log('• ✅ Patrones de seguridad médica');
  }

  console.log('\n🏆 RESULTADO FINAL:');
  console.log('='.repeat(40));
  console.log('🎯 COPILOT BÁSICO: Código genérico sin especialización');
  console.log('🚀 COPILOT ENHANCED: Código médico profesional con:');
  console.log('   • 100% especialización médica');
  console.log('   • Cumplimiento automático HIPAA/GDPR');
  console.log('   • Validación de estándares médicos');
  console.log('   • Seguridad PHI integrada');
  console.log('   • Audit trails automáticos');
}

demonstrateMedicalContext().catch(console.error);
