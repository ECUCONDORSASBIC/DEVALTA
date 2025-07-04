const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory storage for demo purposes
// In production, use a proper database
const patients = new Map();
const observations = new Map();

// Initialize with sample data
const samplePatient = {
  resourceType: 'Patient',
  id: 'patient-123',
  meta: {
    versionId: '1',
    lastUpdated: new Date().toISOString()
  },
  identifier: [
    {
      use: 'usual',
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR'
          }
        ]
      },
      system: 'urn:oid:1.2.36.146.595.217.0.1',
      value: '12345'
    }
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: 'Doe',
      given: ['John']
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '555-1234',
      use: 'home'
    },
    {
      system: 'email',
      value: 'john.doe@example.com',
      use: 'home'
    }
  ],
  gender: 'male',
  birthDate: '1990-01-01',
  address: [
    {
      use: 'home',
      line: ['123 Main St'],
      city: 'Anytown',
      state: 'NY',
      postalCode: '12345',
      country: 'USA'
    }
  ]
};

const sampleObservation = {
  resourceType: 'Observation',
  id: 'obs-123',
  meta: {
    versionId: '1',
    lastUpdated: new Date().toISOString()
  },
  status: 'final',
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }
      ]
    }
  ],
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '8867-4',
        display: 'Heart rate'
      }
    ]
  },
  subject: {
    reference: 'Patient/patient-123'
  },
  effectiveDateTime: new Date().toISOString(),
  valueQuantity: {
    value: 72,
    unit: 'beats/min',
    system: 'http://unitsofmeasure.org',
    code: '/min'
  }
};

patients.set('patient-123', samplePatient);
observations.set('obs-123', sampleObservation);

// Patient validation schema
const patientSchema = Joi.object({
  resourceType: Joi.string().valid('Patient').required(),
  id: Joi.string().optional(),
  identifier: Joi.array().items(Joi.object({
    use: Joi.string().valid('usual', 'official', 'temp', 'secondary'),
    type: Joi.object(),
    system: Joi.string().uri(),
    value: Joi.string().required()
  })).optional(),
  active: Joi.boolean().default(true),
  name: Joi.array().items(Joi.object({
    use: Joi.string().valid('usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden'),
    family: Joi.string().required(),
    given: Joi.array().items(Joi.string())
  })).required(),
  telecom: Joi.array().items(Joi.object({
    system: Joi.string().valid('phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'),
    value: Joi.string().required(),
    use: Joi.string().valid('home', 'work', 'temp', 'old', 'mobile')
  })).optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
  birthDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: Joi.array().items(Joi.object({
    use: Joi.string().valid('home', 'work', 'temp', 'old', 'billing'),
    line: Joi.array().items(Joi.string()),
    city: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string()
  })).optional()
});

// Observation validation schema
const observationSchema = Joi.object({
  resourceType: Joi.string().valid('Observation').required(),
  id: Joi.string().optional(),
  status: Joi.string().valid('registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown').required(),
  category: Joi.array().items(Joi.object({
    coding: Joi.array().items(Joi.object({
      system: Joi.string().uri(),
      code: Joi.string().required(),
      display: Joi.string()
    }))
  })).optional(),
  code: Joi.object({
    coding: Joi.array().items(Joi.object({
      system: Joi.string().uri(),
      code: Joi.string().required(),
      display: Joi.string()
    })).required()
  }).required(),
  subject: Joi.object({
    reference: Joi.string().required()
  }).required(),
  effectiveDateTime: Joi.string().isoDate().optional(),
  valueQuantity: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string()
  }).optional(),
  valueString: Joi.string().optional(),
  valueBoolean: Joi.boolean().optional()
});

// Apply authentication to all FHIR routes
router.use(authenticateToken);

// Patient endpoints
router.get('/Patient', (req, res) => {
  const { name, identifier, birthdate } = req.query;
  let results = Array.from(patients.values());

  // Simple search filters
  if (name) {
    results = results.filter(patient => 
      patient.name.some(n => 
        n.family.toLowerCase().includes(name.toLowerCase()) ||
        n.given.some(g => g.toLowerCase().includes(name.toLowerCase()))
      )
    );
  }

  if (identifier) {
    results = results.filter(patient => 
      patient.identifier && patient.identifier.some(i => i.value === identifier)
    );
  }

  if (birthdate) {
    results = results.filter(patient => patient.birthDate === birthdate);
  }

  res.json({
    resourceType: 'Bundle',
    id: uuidv4(),
    type: 'searchset',
    total: results.length,
    entry: results.map(patient => ({
      resource: patient,
      fullUrl: `${req.protocol}://${req.get('host')}/fhir/Patient/${patient.id}`
    }))
  });
});

router.get('/Patient/:id', (req, res) => {
  const patient = patients.get(req.params.id);
  if (!patient) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: `Patient with id ${req.params.id} not found`
      }]
    });
  }
  res.json(patient);
});

router.post('/Patient', (req, res) => {
  const { error, value } = patientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        diagnostics: error.details[0].message
      }]
    });
  }

  const id = value.id || uuidv4();
  const patient = {
    ...value,
    id,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    }
  };

  patients.set(id, patient);
  res.status(201).json(patient);
});

router.put('/Patient/:id', (req, res) => {
  const { error, value } = patientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        diagnostics: error.details[0].message
      }]
    });
  }

  const existingPatient = patients.get(req.params.id);
  const versionId = existingPatient ? 
    (parseInt(existingPatient.meta.versionId) + 1).toString() : '1';

  const patient = {
    ...value,
    id: req.params.id,
    meta: {
      versionId,
      lastUpdated: new Date().toISOString()
    }
  };

  patients.set(req.params.id, patient);
  res.json(patient);
});

// Observation endpoints
router.get('/Observation', (req, res) => {
  const { patient, code, date } = req.query;
  let results = Array.from(observations.values());

  // Simple search filters
  if (patient) {
    results = results.filter(obs => 
      obs.subject.reference === `Patient/${patient}` ||
      obs.subject.reference === patient
    );
  }

  if (code) {
    results = results.filter(obs => 
      obs.code.coding.some(c => c.code === code)
    );
  }

  if (date) {
    results = results.filter(obs => 
      obs.effectiveDateTime && obs.effectiveDateTime.startsWith(date)
    );
  }

  res.json({
    resourceType: 'Bundle',
    id: uuidv4(),
    type: 'searchset',
    total: results.length,
    entry: results.map(observation => ({
      resource: observation,
      fullUrl: `${req.protocol}://${req.get('host')}/fhir/Observation/${observation.id}`
    }))
  });
});

router.get('/Observation/:id', (req, res) => {
  const observation = observations.get(req.params.id);
  if (!observation) {
    return res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'not-found',
        diagnostics: `Observation with id ${req.params.id} not found`
      }]
    });
  }
  res.json(observation);
});

router.post('/Observation', (req, res) => {
  const { error, value } = observationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'invalid',
        diagnostics: error.details[0].message
      }]
    });
  }

  const id = value.id || uuidv4();
  const observation = {
    ...value,
    id,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString()
    }
  };

  observations.set(id, observation);
  res.status(201).json(observation);
});

module.exports = router;
