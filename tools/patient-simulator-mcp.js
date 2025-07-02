#!/usr/bin/env node
// 🏥 PATIENT SIMULATOR MCP SERVER - Simulador avanzado de pacientes

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

console.log('🏥 Patient Simulator MCP Server iniciado - SIMULACIÓN MÉDICA AVANZADA! 🚀');

class PatientSimulatorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'patient-simulator-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.patients = new Map();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_patient',
            description: 'Crear un nuevo paciente simulado con datos médicos',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nombre del paciente' },
                age: { type: 'number', description: 'Edad del paciente' },
                gender: { type: 'string', enum: ['M', 'F'], description: 'Género del paciente' },
                condition: { type: 'string', description: 'Condición médica principal' }
              },
              required: ['name', 'age', 'gender']
            }
          },
          {
            name: 'generate_symptoms',
            description: 'Generar síntomas realistas para un paciente',
            inputSchema: {
              type: 'object',
              properties: {
                patientId: { type: 'string', description: 'ID del paciente' },
                severity: { type: 'string', enum: ['mild', 'moderate', 'severe'], description: 'Severidad' }
              },
              required: ['patientId']
            }
          },
          {
            name: 'simulate_vitals',
            description: 'Simular signos vitales del paciente',
            inputSchema: {
              type: 'object',
              properties: {
                patientId: { type: 'string', description: 'ID del paciente' },
                condition: { type: 'string', description: 'Condición actual del paciente' }
              },
              required: ['patientId']
            }
          },
          {
            name: 'get_patient_history',
            description: 'Obtener historial médico simulado',
            inputSchema: {
              type: 'object',
              properties: {
                patientId: { type: 'string', description: 'ID del paciente' }
              },
              required: ['patientId']
            }
          }
        ]
      };
    });

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'create_patient':
          return this.createPatient(args);
        case 'generate_symptoms':
          return this.generateSymptoms(args);
        case 'simulate_vitals':
          return this.simulateVitals(args);
        case 'get_patient_history':
          return this.getPatientHistory(args);
        default:
          throw new Error(`Herramienta desconocida: ${name}`);
      }
    });
  }

  createPatient(args) {
    const patientId = `PAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const patient = {
      id: patientId,
      name: args.name,
      age: args.age,
      gender: args.gender,
      condition: args.condition || 'Evaluación general',
      createdAt: new Date().toISOString(),
      vitals: this.generateInitialVitals(args.age, args.gender),
      history: this.generateMedicalHistory(args.age, args.gender)
    };
    
    this.patients.set(patientId, patient);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Paciente creado exitosamente:\n\n` +
                `👤 ID: ${patientId}\n` +
                `📝 Nombre: ${patient.name}\n` +
                `🎂 Edad: ${patient.age} años\n` +
                `⚧ Género: ${patient.gender}\n` +
                `🏥 Condición: ${patient.condition}\n` +
                `📅 Creado: ${patient.createdAt}\n\n` +
                `🩺 Signos vitales iniciales:\n` +
                `- Presión arterial: ${patient.vitals.bloodPressure}\n` +
                `- Frecuencia cardíaca: ${patient.vitals.heartRate} bpm\n` +
                `- Temperatura: ${patient.vitals.temperature}°C\n` +
                `- Saturación O2: ${patient.vitals.oxygenSaturation}%`
        }
      ]
    };
  }

  generateSymptoms(args) {
    const patient = this.patients.get(args.patientId);
    if (!patient) {
      throw new Error(`Paciente no encontrado: ${args.patientId}`);
    }

    const severity = args.severity || 'moderate';
    const symptoms = this.getSymptomsByCondition(patient.condition, severity);
    
    return {
      content: [
        {
          type: 'text',
          text: `🩺 Síntomas generados para ${patient.name} (${severity}):\n\n` +
                symptoms.map(s => `• ${s.name}: ${s.description}`).join('\n') +
                `\n\n📊 Severidad: ${severity}\n` +
                `⏰ Generado: ${new Date().toLocaleString()}`
        }
      ]
    };
  }

  simulateVitals(args) {
    const patient = this.patients.get(args.patientId);
    if (!patient) {
      throw new Error(`Paciente no encontrado: ${args.patientId}`);
    }

    const newVitals = this.generateVitalsForCondition(
      patient.age, 
      patient.gender, 
      args.condition || patient.condition
    );
    
    // Actualizar signos vitales del paciente
    patient.vitals = newVitals;
    patient.vitalsUpdatedAt = new Date().toISOString();
    
    return {
      content: [
        {
          type: 'text',
          text: `📊 Signos vitales simulados para ${patient.name}:\n\n` +
                `🩸 Presión arterial: ${newVitals.bloodPressure}\n` +
                `💓 Frecuencia cardíaca: ${newVitals.heartRate} bpm\n` +
                `🌡️ Temperatura corporal: ${newVitals.temperature}°C\n` +
                `🫁 Saturación de oxígeno: ${newVitals.oxygenSaturation}%\n` +
                `👂 Frecuencia respiratoria: ${newVitals.respiratoryRate} rpm\n\n` +
                `🏥 Estado basado en: ${args.condition || patient.condition}\n` +
                `⏰ Actualizado: ${patient.vitalsUpdatedAt}`
        }
      ]
    };
  }

  getPatientHistory(args) {
    const patient = this.patients.get(args.patientId);
    if (!patient) {
      throw new Error(`Paciente no encontrado: ${args.patientId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `📋 Historial médico de ${patient.name}:\n\n` +
                `👤 Datos del paciente:\n` +
                `- ID: ${patient.id}\n` +
                `- Edad: ${patient.age} años\n` +
                `- Género: ${patient.gender}\n\n` +
                `📚 Historial médico:\n` +
                patient.history.map(h => `• ${h.year}: ${h.condition} - ${h.treatment}`).join('\n') +
                `\n\n🩺 Condición actual: ${patient.condition}\n` +
                `📅 Última actualización: ${patient.vitalsUpdatedAt || patient.createdAt}`
        }
      ]
    };
  }

  generateInitialVitals(age, gender) {
    // Generar signos vitales normales basados en edad y género
    const baseHR = gender === 'M' ? 70 : 75;
    const ageAdjustment = age > 65 ? 5 : (age < 18 ? -10 : 0);
    
    return {
      bloodPressure: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
      heartRate: baseHR + ageAdjustment + Math.floor(Math.random() * 20 - 10),
      temperature: (36.5 + Math.random() * 0.8).toFixed(1),
      oxygenSaturation: 98 + Math.floor(Math.random() * 3),
      respiratoryRate: 16 + Math.floor(Math.random() * 8)
    };
  }

  generateVitalsForCondition(age, gender, condition) {
    const baseVitals = this.generateInitialVitals(age, gender);
    
    // Ajustar signos vitales según condición
    if (condition.toLowerCase().includes('hipertensión')) {
      const systolic = 140 + Math.floor(Math.random() * 40);
      const diastolic = 90 + Math.floor(Math.random() * 20);
      baseVitals.bloodPressure = `${systolic}/${diastolic}`;
    } else if (condition.toLowerCase().includes('fiebre')) {
      baseVitals.temperature = (38.0 + Math.random() * 3.0).toFixed(1);
      baseVitals.heartRate += 20;
    } else if (condition.toLowerCase().includes('taquicardia')) {
      baseVitals.heartRate = 100 + Math.floor(Math.random() * 60);
    }
    
    return baseVitals;
  }

  generateMedicalHistory(age, gender) {
    const history = [];
    const currentYear = new Date().getFullYear();
    
    // Generar historial basado en edad
    if (age > 40) {
      history.push({
        year: currentYear - Math.floor(Math.random() * 10 + 5),
        condition: 'Chequeo preventivo',
        treatment: 'Exámenes de rutina normales'
      });
    }
    
    if (age > 50) {
      history.push({
        year: currentYear - Math.floor(Math.random() * 5 + 2),
        condition: 'Hipertensión leve',
        treatment: 'Dieta y ejercicio'
      });
    }
    
    if (Math.random() > 0.7) {
      history.push({
        year: currentYear - Math.floor(Math.random() * 20 + 1),
        condition: 'Accidente menor',
        treatment: 'Recuperación completa'
      });
    }
    
    return history;
  }

  getSymptomsByCondition(condition, severity) {
    const symptomsDb = {
      'hipertensión': [
        { name: 'Dolor de cabeza', description: 'Dolor occipital leve a moderado' },
        { name: 'Mareos', description: 'Sensación de inestabilidad ocasional' },
        { name: 'Visión borrosa', description: 'Dificultad para enfocar objetos' }
      ],
      'diabetes': [
        { name: 'Poliuria', description: 'Micción frecuente' },
        { name: 'Polidipsia', description: 'Sed excesiva' },
        { name: 'Fatiga', description: 'Cansancio generalizado' }
      ],
      'default': [
        { name: 'Malestar general', description: 'Sensación de incomodidad leve' },
        { name: 'Fatiga leve', description: 'Cansancio menor' }
      ]
    };
    
    const conditionLower = condition.toLowerCase();
    let symptoms = symptomsDb['default'];
    
    for (const [key, value] of Object.entries(symptomsDb)) {
      if (conditionLower.includes(key)) {
        symptoms = value;
        break;
      }
    }
    
    // Ajustar según severidad
    if (severity === 'severe') {
      symptoms = symptoms.map(s => ({
        ...s,
        description: s.description + ' (severo)'
      }));
    }
    
    return symptoms;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🏥 Patient Simulator MCP Server conectado via stdio');
  }
}

// Iniciar servidor
const server = new PatientSimulatorServer();
server.run().catch(console.error);
