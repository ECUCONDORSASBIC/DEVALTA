#!/usr/bin/env node

/**
 * 🤖 B001: Sistema de Gestión de Tareas de Agentes
 * Altamedica - Clinical Decision Support Engine
 * 
 * Este sistema gestiona las 156 tareas distribuidas entre 18 agentes especializados
 * según el documento de asignaciones detalladas.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del proyecto
const PROJECT_CONFIG = {
  name: 'Altamedica - Clinical Decision Support Engine',
  version: '1.0.0',
  totalAgents: 18,
  totalTasks: 156,
  phases: 10,
  startDate: '2025-01-27',
  estimatedWeeks: 24
};

// Definición de agentes y sus tareas
const AGENT_ASSIGNMENTS = {
  'Project Manager': {
    priority: 'CRÍTICA',
    totalTasks: 15,
    estimatedWeeks: 24,
    responsibilities: ['Coordinación general', 'Gestión de riesgos', 'Comunicación con stakeholders'],
    tasks: {
      'Fase 0': [
        'Negociación inicial del proyecto con arquitecto y líder médico',
        'Configurar Jira/Asana para tracking de tareas',
        'Crear plan de comunicación con stakeholders',
        'Definir métricas de éxito del proyecto',
        'Establecer reuniones de seguimiento'
      ],
      'Fase 1': [
        'Coordinar diseño de arquitectura con equipo técnico',
        'Gestionar aprobación de arquitectura con stakeholders',
        'Coordinar configuración de herramientas de desarrollo',
        'Establecer métricas de progreso del proyecto',
        'Gestionar riesgos identificados en fase inicial'
      ],
      'Fase 2-10': [
        'Tracking de tareas completadas vs planificado',
        'Tracking de tiempo vs estimado',
        'Tracking de presupuesto vs real',
        'Reporting semanal a stakeholders',
        'Gestión de cambios de alcance'
      ]
    }
  },
  'System Architect': {
    priority: 'CRÍTICA',
    totalTasks: 18,
    estimatedWeeks: 20,
    responsibilities: ['Diseño de arquitectura', 'Decisiones técnicas', 'Validación de implementación'],
    tasks: {
      'Fase 1': [
        'Diseñar arquitectura de microservicios',
        'Definir patrones de comunicación entre servicios',
        'Diseñar estrategia de escalabilidad',
        'Definir estrategia de resiliencia y fallback',
        'Diseñar arquitectura de datos'
      ],
      'Fase 2': [
        'Diseñar arquitectura del motor bayesiano',
        'Definir arquitectura del motor de reglas',
        'Diseñar sistema de plugins',
        'Validar implementación de algoritmos',
        'Optimizar performance de motores'
      ],
      'Fase 3-5': [
        'Diseñar arquitectura de servicios de interacciones',
        'Definir arquitectura de servicios de compliance',
        'Diseñar estrategia de integración con EHRs',
        'Validar integraciones con sistemas externos',
        'Optimizar arquitectura de integraciones'
      ],
      'Fase 6-10': [
        'Validar arquitectura de frontend',
        'Diseñar estrategia de monitoreo',
        'Validar arquitectura de seguridad',
        'Optimizar arquitectura para producción',
        'Validar arquitectura final'
      ]
    }
  },
  'Backend Developer': {
    priority: 'CRÍTICA',
    totalTasks: 25,
    estimatedWeeks: 22,
    responsibilities: ['Implementación de servicios backend', 'APIs', 'Lógica de negocio'],
    tasks: {
      'Fase 2': [
        'Implementar motor bayesiano',
        'Implementar motor de reglas (json-rules-engine)',
        'Implementar algoritmos de scoring probabilístico',
        'Implementar arquitectura de plugins',
        'Optimizar performance de motores'
      ],
      'Fase 3': [
        'Implementar servicio de interacciones medicamentosas',
        'Implementar lógica de ajustes de dosis',
        'Implementar detector de alergias',
        'Optimizar servicios de interacciones',
        'Implementar cache de interacciones'
      ],
      'Fase 4': [
        'Implementar verificador de guías clínicas',
        'Implementar servicio de recomendaciones basadas en evidencia',
        'Implementar sistema de auditoría',
        'Optimizar servicios de compliance',
        'Implementar cache de compliance'
      ],
      'Fase 5': [
        'Implementar integración Epic EHR',
        'Implementar integración Cerner EHR',
        'Implementar conectores de dispositivos IoT',
        'Implementar integración PubMed',
        'Implementar integración Micromedex'
      ],
      'Fase 7-9': [
        'Implementar validaciones de seguridad',
        'Crear tests unitarios para servicios',
        'Crear tests de integración',
        'Optimizar performance de servicios',
        'Validar servicios en producción'
      ]
    }
  },
  'Frontend Developer': {
    priority: 'ALTA',
    totalTasks: 12,
    estimatedWeeks: 8,
    responsibilities: ['Implementación de interfaces de usuario', 'Componentes React'],
    tasks: {
      'Fase 6': [
        'Implementar dashboard principal React',
        'Implementar componentes de diagnóstico',
        'Implementar componentes de interacciones',
        'Implementar componentes de compliance',
        'Optimizar performance de frontend'
      ],
      'Fase 8-9': [
        'Crear tests unitarios para componentes',
        'Crear tests de integración frontend',
        'Optimizar componentes para producción',
        'Validar frontend en producción',
        'Implementar optimizaciones de UX'
      ],
      'Fase 10': [
        'Documentar componentes React',
        'Crear guías de desarrollo frontend'
      ]
    }
  },
  'DevOps Engineer': {
    priority: 'ALTA',
    totalTasks: 20,
    estimatedWeeks: 18,
    responsibilities: ['Infraestructura', 'CI/CD', 'Monitoreo', 'Despliegue'],
    tasks: {
      'Fase 0-1': [
        'Configurar repositorios Git',
        'Configurar CI/CD pipeline',
        'Configurar Prometheus',
        'Configurar Grafana',
        'Configurar infraestructura como código'
      ],
      'Fase 2-5': [
        'Configurar contenedores para servicios',
        'Configurar orquestación con Kubernetes',
        'Configurar monitoreo de servicios',
        'Configurar backup y recuperación',
        'Configurar escalabilidad automática'
      ],
      'Fase 8-9': [
        'Configurar testing automatizado',
        'Configurar scanning de vulnerabilidades',
        'Configurar despliegue automatizado',
        'Configurar monitoreo de producción',
        'Optimizar infraestructura'
      ],
      'Fase 10': [
        'Optimizar performance de infraestructura',
        'Configurar disaster recovery',
        'Validar infraestructura en producción',
        'Documentar infraestructura',
        'Configurar alertas de infraestructura'
      ]
    }
  },
  'QA Specialist': {
    priority: 'ALTA',
    totalTasks: 18,
    estimatedWeeks: 16,
    responsibilities: ['Testing', 'Calidad', 'Validación', 'Aseguramiento de calidad'],
    tasks: {
      'Fase 1-5': [
        'Configurar herramientas de testing',
        'Crear tests para motor bayesiano',
        'Crear tests para reglas clínicas',
        'Crear tests de interacciones',
        'Crear tests de compliance'
      ],
      'Fase 6-8': [
        'Crear tests de integración',
        'Validar integraciones con EHRs',
        'Validar integraciones con dispositivos',
        'Crear tests de performance',
        'Crear tests de seguridad'
      ],
      'Fase 9-10': [
        'Validar calidad en producción',
        'Crear tests de regresión',
        'Validar documentación',
        'Validar materiales de training',
        'Crear métricas de calidad'
      ]
    }
  },
  'Security Officer': {
    priority: 'CRÍTICA',
    totalTasks: 15,
    estimatedWeeks: 20,
    responsibilities: ['Seguridad', 'Compliance', 'Auditoría', 'Protección de datos'],
    tasks: {
      'Fase 0-1': [
        'Configurar políticas de seguridad',
        'Configurar SIEM',
        'Configurar logging de auditoría',
        'Definir eventos auditables',
        'Configurar monitoreo de seguridad'
      ],
      'Fase 7': [
        'Implementar MFA',
        'Configurar encriptación AES-256',
        'Implementar RBAC',
        'Configurar WAF',
        'Implementar protección DDoS'
      ],
      'Fase 7-8': [
        'Implementar controles HIPAA',
        'Preparar certificación ISO 27001',
        'Realizar penetration testing',
        'Crear tests de seguridad',
        'Validar compliance'
      ]
    }
  },
  'Data Engineer': {
    priority: 'ALTA',
    totalTasks: 12,
    estimatedWeeks: 16,
    responsibilities: ['Pipelines de datos', 'Integración de fuentes', 'Análisis'],
    tasks: {
      'Fase 1-2': [
        'Configurar data warehouse',
        'Integrar base de conocimientos ICD-10',
        'Configurar herramientas de análisis',
        'Integrar datos epidemiológicos',
        'Configurar sincronización de datos'
      ],
      'Fase 3-5': [
        'Integrar Micromedex',
        'Integrar Lexicomp',
        'Integrar PubMed/Semantic Scholar',
        'Integrar guías clínicas estructuradas',
        'Configurar pipelines de datos'
      ],
      'Fase 8-10': [
        'Optimizar pipelines de datos',
        'Validar integridad de datos',
        'Documentar pipelines'
      ]
    }
  },
  'Database Specialist': {
    priority: 'MEDIA',
    totalTasks: 8,
    estimatedWeeks: 12,
    responsibilities: ['Diseño de base de datos', 'Optimización', 'Gestión'],
    tasks: {
      'Fase 1': [
        'Diseñar modelo de datos',
        'Configurar PostgreSQL para datos clínicos',
        'Configurar Redis para cache',
        'Configurar Elasticsearch para búsqueda',
        'Configurar Firestore para alertas'
      ],
      'Fase 8-10': [
        'Optimizar consultas de base de datos',
        'Configurar backup de base de datos',
        'Documentar esquema de base de datos'
      ]
    }
  },
  'API Architect': {
    priority: 'ALTA',
    totalTasks: 10,
    estimatedWeeks: 14,
    responsibilities: ['Diseño de APIs', 'Estándares', 'Documentación'],
    tasks: {
      'Fase 1-2': [
        'Diseñar APIs REST/GraphQL',
        'Configurar API Gateway (Kong)',
        'Diseñar API para plugins',
        'Implementar adaptador FHIR',
        'Implementar adaptador HL7'
      ],
      'Fase 5-10': [
        'Diseñar API para dispositivos',
        'Crear documentación de APIs',
        'Validar APIs en producción',
        'Optimizar performance de APIs',
        'Documentar integraciones'
      ]
    }
  },
  'Medical Lead': {
    priority: 'CRÍTICA',
    totalTasks: 15,
    estimatedWeeks: 24,
    responsibilities: ['Validación clínica', 'Compliance médico', 'Expertise clínico'],
    tasks: {
      'Fase 0-1': [
        'Negociación inicial del proyecto',
        'Refinamiento de requerimientos clínicos',
        'Validar algoritmos de diagnóstico',
        'Definir reglas clínicas base',
        'Validar pesos de algoritmos'
      ],
      'Fase 2-5': [
        'Validar motor bayesiano',
        'Validar motor de reglas clínicas',
        'Validar lógica de detección de interacciones',
        'Validar algoritmos de ajuste de dosis',
        'Validar lógica de detección de alergias'
      ],
      'Fase 6-10': [
        'Validar flujos de usuario',
        'Validar presentación de resultados',
        'Validar alertas de interacciones',
        'Validar presentación de guías',
        'Preparar validación clínica'
      ]
    }
  },
  'Product Owner': {
    priority: 'MEDIA',
    totalTasks: 8,
    estimatedWeeks: 12,
    responsibilities: ['Visión del producto', 'Priorización', 'Stakeholders'],
    tasks: {
      'Fase 0-1': [
        'Definir visión del producto médico',
        'Priorizar backlog de funcionalidades',
        'Validar entregables con stakeholders',
        'Gestionar expectativas de clientes médicos'
      ],
      'Fase 6-10': [
        'Validar funcionalidad en producción',
        'Gestionar feedback de usuarios',
        'Preparar lanzamiento del producto',
        'Definir métricas de éxito del producto'
      ]
    }
  },
  'Business Analyst': {
    priority: 'MEDIA',
    totalTasks: 6,
    estimatedWeeks: 8,
    responsibilities: ['Análisis de negocio', 'Documentación', 'Validación'],
    tasks: {
      'Fase 0-1': [
        'Refinamiento de requerimientos de negocio',
        'Documentar procesos y workflows clínicos',
        'Validar funcionalidades con usuarios médicos'
      ],
      'Fase 6-10': [
        'Gestionar cambios de requerimientos',
        'Validar funcionalidades finales',
        'Documentar lecciones aprendidas'
      ]
    }
  },
  'Technical Writer': {
    priority: 'MEDIA',
    totalTasks: 12,
    estimatedWeeks: 16,
    responsibilities: ['Documentación técnica', 'Guías', 'Manuales'],
    tasks: {
      'Fase 0-1': [
        'Crear documentación inicial del proyecto',
        'Documentar arquitectura del sistema',
        'Crear documentación de APIs'
      ],
      'Fase 6-10': [
        'Crear documentación técnica completa',
        'Crear guías de usuario',
        'Crear manuales de training',
        'Documentar componentes',
        'Documentar integraciones'
      ],
      'Fase 10': [
        'Crear documentación de base de datos',
        'Crear documentación de seguridad',
        'Crear documentación clínica'
      ]
    }
  },
  'Scrum Master': {
    priority: 'BAJA',
    totalTasks: 5,
    estimatedWeeks: 8,
    responsibilities: ['Facilitación ágil', 'Coaching', 'Mejora de procesos'],
    tasks: {
      'Fase 0-1': [
        'Configurar ceremonias ágiles',
        'Facilitar reuniones de planificación'
      ],
      'Fase 6-10': [
        'Remover impedimentos del equipo',
        'Promover mejores prácticas ágiles',
        'Gestionar métricas y retrospectivas'
      ]
    }
  },
  'Support Specialist': {
    priority: 'MEDIA',
    totalTasks: 8,
    estimatedWeeks: 12,
    responsibilities: ['Soporte técnico', 'Training', 'Documentación de usuario'],
    tasks: {
      'Fase 0-1': [
        'Configurar sistema de tickets',
        'Configurar herramientas de soporte'
      ],
      'Fase 6-10': [
        'Configurar sistema de soporte',
        'Crear materiales de training',
        'Crear FAQs',
        'Configurar monitoreo de soporte'
      ],
      'Fase 10': [
        'Optimizar procesos de soporte',
        'Documentar procedimientos de soporte'
      ]
    }
  },
  'UX/UI Designer': {
    priority: 'ALTA',
    totalTasks: 8,
    estimatedWeeks: 10,
    responsibilities: ['Diseño de interfaces', 'Experiencia de usuario'],
    tasks: {
      'Fase 0-1': [
        'Configurar Figma/Sketch',
        'Definir sistema de diseño médico'
      ],
      'Fase 6': [
        'Diseñar dashboard principal',
        'Diseñar interfaz de diagnóstico',
        'Diseñar interfaz de interacciones',
        'Diseñar interfaz de compliance'
      ],
      'Fase 10': [
        'Crear videos tutoriales',
        'Optimizar experiencia de usuario'
      ]
    }
  },
  'FinOps Analyst': {
    priority: 'BAJA',
    totalTasks: 6,
    estimatedWeeks: 12,
    responsibilities: ['Optimización de costos', 'Análisis financiero'],
    tasks: {
      'Fase 0-1': [
        'Configurar monitoreo de costos',
        'Configurar herramientas de análisis financiero'
      ],
      'Fase 8-10': [
        'Optimizar costos de infraestructura',
        'Validar costos de performance',
        'Configurar monitoreo de costos de producción',
        'Documentar optimizaciones de costos'
      ]
    }
  }
};

// Criterios de éxito por agente
const SUCCESS_CRITERIA = {
  'Project Manager': [
    'Proyecto entregado en tiempo y presupuesto',
    'Stakeholders satisfechos con comunicación',
    'Riesgos gestionados efectivamente',
    'Equipo funcionando de manera colaborativa'
  ],
  'System Architect': [
    'Arquitectura escalable y mantenible',
    'Performance objetivos alcanzados',
    'Seguridad integrada desde el diseño',
    'Documentación técnica completa'
  ],
  'Backend Developer': [
    'Servicios funcionando correctamente',
    'Performance < 500ms para consultas críticas',
    'Cobertura de testing > 90%',
    'Código limpio y mantenible'
  ],
  'Frontend Developer': [
    'Interfaces intuitivas y accesibles',
    'Performance optimizada',
    'Compatibilidad cross-browser',
    'Componentes reutilizables'
  ],
  'DevOps Engineer': [
    'Infraestructura estable y escalable',
    'CI/CD pipeline funcionando',
    'Monitoreo completo implementado',
    'Disponibilidad > 99.9%'
  ],
  'QA Specialist': [
    'Cobertura de testing completa',
    'Tasa de defectos < 1%',
    'Testing automatizado funcionando',
    'Calidad validada por stakeholders'
  ],
  'Security Officer': [
    'Controles de seguridad implementados',
    'Compliance HIPAA alcanzado',
    'Auditoría completa funcionando',
    'Incidentes de seguridad = 0'
  ],
  'Medical Lead': [
    'Validación clínica exitosa',
    'Precisión diagnóstica > 90%',
    'Compliance médico alcanzado',
    'Aprobación de comité de ética'
  ]
};

class AgentTaskManager {
  constructor() {
    this.assignments = AGENT_ASSIGNMENTS;
    this.successCriteria = SUCCESS_CRITERIA;
    this.config = PROJECT_CONFIG;
    this.dataPath = path.join(__dirname, '../data');
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataPath, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio de datos:', error);
    }
  }

  // Generar resumen de asignaciones
  generateSummary() {
    const summary = {
      project: this.config,
      agents: Object.keys(this.assignments).map(agent => ({
        name: agent,
        ...this.assignments[agent],
        taskCount: this.getTotalTaskCount(agent)
      })),
      totalTasks: this.config.totalTasks,
      totalAgents: this.config.totalAgents,
      estimatedWeeks: this.config.estimatedWeeks
    };

    return summary;
  }

  getTotalTaskCount(agent) {
    const agentData = this.assignments[agent];
    let count = 0;
    Object.values(agentData.tasks).forEach(phaseTasks => {
      count += phaseTasks.length;
    });
    return count;
  }

  // Generar reporte detallado por agente
  generateAgentReport(agentName) {
    const agent = this.assignments[agentName];
    if (!agent) {
      throw new Error(`Agente no encontrado: ${agentName}`);
    }

    return {
      name: agentName,
      priority: agent.priority,
      totalTasks: this.getTotalTaskCount(agentName),
      estimatedWeeks: agent.estimatedWeeks,
      responsibilities: agent.responsibilities,
      tasks: agent.tasks,
      successCriteria: this.successCriteria[agentName] || []
    };
  }

  // Generar reporte de progreso
  generateProgressReport(progressData = {}) {
    const report = {
      timestamp: new Date().toISOString(),
      project: this.config,
      progress: {},
      metrics: {
        totalCompleted: 0,
        totalInProgress: 0,
        totalPending: 0,
        overallProgress: 0
      }
    };

    Object.keys(this.assignments).forEach(agent => {
      const agentProgress = progressData[agent] || { completed: 0, inProgress: 0, pending: this.getTotalTaskCount(agent) };
      report.progress[agent] = {
        ...agentProgress,
        totalTasks: this.getTotalTaskCount(agent),
        progressPercentage: Math.round((agentProgress.completed / this.getTotalTaskCount(agent)) * 100)
      };

      report.metrics.totalCompleted += agentProgress.completed || 0;
      report.metrics.totalInProgress += agentProgress.inProgress || 0;
      report.metrics.totalPending += agentProgress.pending || 0;
    });

    report.metrics.overallProgress = Math.round((report.metrics.totalCompleted / this.config.totalTasks) * 100);

    return report;
  }

  // Guardar reporte
  async saveReport(report, filename) {
    const filePath = path.join(this.dataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
    return filePath;
  }

  // Cargar reporte
  async loadReport(filename) {
    const filePath = path.join(this.dataPath, filename);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error cargando reporte ${filename}:`, error);
      return null;
    }
  }

  // Generar reporte de dependencias entre tareas
  generateDependencyReport() {
    const dependencies = {
      criticalPath: [
        'System Architect -> Backend Developer',
        'Backend Developer -> Frontend Developer',
        'Backend Developer -> QA Specialist',
        'Security Officer -> DevOps Engineer',
        'Medical Lead -> Product Owner'
      ],
      blockingTasks: {
        'Fase 1': ['System Architect', 'Medical Lead'],
        'Fase 2': ['Backend Developer', 'System Architect'],
        'Fase 3': ['Backend Developer', 'Data Engineer'],
        'Fase 4': ['Backend Developer', 'Security Officer'],
        'Fase 5': ['Backend Developer', 'API Architect'],
        'Fase 6': ['Frontend Developer', 'UX/UI Designer'],
        'Fase 7': ['Security Officer', 'DevOps Engineer'],
        'Fase 8': ['QA Specialist', 'DevOps Engineer'],
        'Fase 9': ['QA Specialist', 'DevOps Engineer'],
        'Fase 10': ['Technical Writer', 'Support Specialist']
      }
    };

    return dependencies;
  }

  // Generar métricas de seguimiento
  generateTrackingMetrics() {
    return {
      productivity: [
        'Tareas Completadas: % de tareas completadas vs planificado',
        'Tiempo Estimado vs Real: Desviación de tiempo por agente',
        'Calidad de Entregables: Score de calidad por agente',
        'Colaboración: Número de interacciones con otros agentes'
      ],
      performance: [
        'Velocidad de Desarrollo: Tareas completadas por semana',
        'Tasa de Errores: Bugs introducidos vs corregidos',
        'Tiempo de Resolución: Tiempo para resolver problemas',
        'Satisfacción del Cliente: Feedback de stakeholders'
      ],
      collaboration: [
        'Negociaciones Exitosas: % de acuerdos alcanzados',
        'Conflictos Resueltos: Tiempo de resolución de conflictos',
        'Comunicación Efectiva: Frecuencia y calidad de comunicación',
        'Aprendizaje Continuo: Mejoras implementadas por agente'
      ]
    };
  }

  // Ejecutar análisis completo
  async runCompleteAnalysis() {
    console.log('🤖 B001: Análisis Completo de Asignaciones de Agentes');
    console.log('=' .repeat(60));

    // Generar resumen
    const summary = this.generateSummary();
    console.log('\n📊 RESUMEN DEL PROYECTO:');
    console.log(`Proyecto: ${summary.project.name}`);
    console.log(`Total de Agentes: ${summary.totalAgents}`);
    console.log(`Total de Tareas: ${summary.totalTasks}`);
    console.log(`Semanas Estimadas: ${summary.estimatedWeeks}`);

    // Mostrar agentes críticos
    console.log('\n🎯 AGENTES CRÍTICOS:');
    summary.agents
      .filter(agent => agent.priority === 'CRÍTICA')
      .forEach(agent => {
        console.log(`- ${agent.name}: ${agent.taskCount} tareas (${agent.estimatedWeeks} semanas)`);
      });

    // Generar reportes
    const progressReport = this.generateProgressReport();
    const dependencyReport = this.generateDependencyReport();
    const trackingMetrics = this.generateTrackingMetrics();

    // Guardar reportes
    await this.saveReport(summary, 'project-summary.json');
    await this.saveReport(progressReport, 'progress-report.json');
    await this.saveReport(dependencyReport, 'dependency-report.json');
    await this.saveReport(trackingMetrics, 'tracking-metrics.json');

    console.log('\n✅ Reportes generados y guardados en scripts/data/');
    console.log('- project-summary.json');
    console.log('- progress-report.json');
    console.log('- dependency-report.json');
    console.log('- tracking-metrics.json');

    return {
      summary,
      progressReport,
      dependencyReport,
      trackingMetrics
    };
  }
}

// Función principal
async function main() {
  const manager = new AgentTaskManager();
  
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'analyze':
        await manager.runCompleteAnalysis();
        break;
      case 'summary':
        const summary = manager.generateSummary();
        console.log(JSON.stringify(summary, null, 2));
        break;
      case 'agent':
        const agentName = args[1];
        if (!agentName) {
          console.error('Error: Debe especificar el nombre del agente');
          process.exit(1);
        }
        const agentReport = manager.generateAgentReport(agentName);
        console.log(JSON.stringify(agentReport, null, 2));
        break;
      case 'progress':
        const progressData = args[1] ? JSON.parse(args[1]) : {};
        const progressReport = manager.generateProgressReport(progressData);
        console.log(JSON.stringify(progressReport, null, 2));
        break;
      default:
        console.log('🤖 B001: Sistema de Gestión de Asignaciones de Agentes');
        console.log('\nComandos disponibles:');
        console.log('  analyze    - Ejecutar análisis completo');
        console.log('  summary    - Generar resumen del proyecto');
        console.log('  agent <nombre> - Reporte detallado de un agente');
        console.log('  progress [data] - Reporte de progreso');
        console.log('\nEjemplos:');
        console.log('  node agent-task-manager.js analyze');
        console.log('  node agent-task-manager.js agent "Project Manager"');
        console.log('  node agent-task-manager.js progress \'{"Project Manager":{"completed":5,"inProgress":3,"pending":7}}\'');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AgentTaskManager; 