import { Router } from 'express';

const patientResource = Router();

// FHIR R4 Patient Resource Schema
interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: Array<{
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}

// Mock FHIR R4 Patient data
const mockPatients: FHIRPatient[] = [
  {
    resourceType: 'Patient',
    id: 'patient-001',
    identifier: [
      {
        system: 'http://example.hospital.com/patient-id',
        value: '12345'
      }
    ],
    name: [
      {
        family: 'Doe',
        given: ['John']
      }
    ],
    gender: 'male',
    birthDate: '1985-05-15',
    address: [
      {
        line: ['123 Main St'],
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA'
      }
    ]
  }
];

// FHIR R4 Patient Resource endpoints
patientResource.get('/Patient/:id', (req, res) => {
  const { id } = req.params;
  const patient = mockPatients.find(p => p.id === id);
  
  if (!patient) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: `Patient with id ${id} not found`
      }]
    });
  }
  
  return res.json(patient);
});

patientResource.get('/Patient', (req, res) => {
  return res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: mockPatients.length,
    entry: mockPatients.map(patient => ({
      resource: patient
    }))
  });
});

export default patientResource;
