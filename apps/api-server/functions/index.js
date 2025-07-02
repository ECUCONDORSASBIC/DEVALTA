const functions = require('firebase-functions');
const { https } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
initializeApp();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ALTAMEDICA API Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'altamedica-api',
    timestamp: new Date().toISOString()
  });
});

// Companies API routes
app.get('/api/companies', (req, res) => {
  // Mock data for now - replace with actual database calls
  const companies = [
    {
      id: '1',
      name: 'Hospital Italiano',
      type: 'hospital',
      location: 'Buenos Aires',
      specialties: ['Cardiología', 'Neurología'],
      employees: 120
    },
    {
      id: '2', 
      name: 'Clínica Alemana',
      type: 'clinic',
      location: 'CABA',
      specialties: ['Medicina General', 'Pediatría'],
      employees: 45
    }
  ];
  
  res.json(companies);
});

app.post('/api/companies', (req, res) => {
  const { name, type, location, specialties } = req.body;
  
  // Validate required fields
  if (!name || !type || !location) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, type, location' 
    });
  }
  
  // Mock response - replace with actual database insertion
  const newCompany = {
    id: Date.now().toString(),
    name,
    type,
    location,
    specialties: specialties || [],
    employees: 0,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(newCompany);
});

// Medical data API routes
app.get('/api/medical/specialties', (req, res) => {
  const specialties = [
    'Cardiología',
    'Neurología', 
    'Pediatría',
    'Medicina General',
    'Traumatología',
    'Ginecología',
    'Psiquiatría',
    'Dermatología'
  ];
  
  res.json(specialties);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Export the API as a Firebase Function
exports.api = https.onRequest(app);
