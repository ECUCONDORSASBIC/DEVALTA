#!/usr/bin/env node

/**
 * 📊 Dashboard de Tareas de Agentes
 * Altamedica - Clinical Decision Support Engine
 * 
 * Este script genera un dashboard visual del progreso de las tareas
 * asignadas a cada agente según el documento de asignaciones detalladas.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import AgentTaskManager from './agent-task-manager.js';
import TaskActivator from './activate-tasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TaskDashboard {
  constructor() {
    this.manager = new AgentTaskManager();
    this.activator = new TaskActivator();
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  // Generar barra de progreso visual
  generateProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return bar;
  }

  // Obtener color basado en porcentaje
  getProgressColor(percentage) {
    if (percentage >= 80) return this.colors.green;
    if (percentage >= 60) return this.colors.cyan;
    if (percentage >= 40) return this.colors.yellow;
    if (percentage >= 20) return this.colors.magenta;
    return this.colors.red;
  }

  // Mostrar header del dashboard
  showHeader() {
    console.clear();
    console.log(`${this.colors.bright}${this.colors.cyan}`);
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🤖 B001: DASHBOARD DE TAREAS DE AGENTES                    ║');
    console.log('║                    Altamedica - Clinical Decision Support Engine             ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log(`${this.colors.reset}`);
  }

  // Mostrar resumen general
  showGeneralSummary(statusReport) {
    console.log(`\n${this.colors.bright}${this.colors.white}📊 RESUMEN GENERAL${this.colors.reset}`);
    console.log('─'.repeat(60));
    
    const overallColor = this.getProgressColor(statusReport.summary.overallProgress);
    const progressBar = this.generateProgressBar(statusReport.summary.overallProgress);
    
    console.log(`Progreso General: ${overallColor}${progressBar} ${statusReport.summary.overallProgress}%${this.colors.reset}`);
    console.log(`Total de Tareas: ${this.colors.cyan}${statusReport.summary.totalTasks}${this.colors.reset}`);
    console.log(`Completadas: ${this.colors.green}${statusReport.summary.completed}${this.colors.reset}`);
    console.log(`En Progreso: ${this.colors.yellow}${statusReport.summary.inProgress}${this.colors.reset}`);
    console.log(`Pendientes: ${this.colors.blue}${statusReport.summary.pending}${this.colors.reset}`);
    console.log(`Bloqueadas: ${this.colors.red}${statusReport.summary.blocked}${this.colors.reset}`);
    console.log(`En Revisión: ${this.colors.magenta}${statusReport.summary.review}${this.colors.reset}`);
  }

  // Mostrar tabla de agentes
  showAgentsTable(statusReport) {
    console.log(`\n${this.colors.bright}${this.colors.white}👥 ESTADO POR AGENTE${this.colors.reset}`);
    console.log('─'.repeat(120));
    
    // Header de la tabla
    console.log(`${this.colors.bright}${'Agente'.padEnd(25)} ${'Prioridad'.padEnd(10)} ${'Progreso'.padEnd(35)} ${'Completadas'.padEnd(12)} ${'Total'.padEnd(6)}${this.colors.reset}`);
    console.log('─'.repeat(120));

    // Ordenar agentes por progreso
    const sortedAgents = Object.entries(statusReport.agents)
      .sort((a, b) => b[1].progress - a[1].progress);

    sortedAgents.forEach(([agentName, stats]) => {
      const progressColor = this.getProgressColor(stats.progress);
      const progressBar = this.generateProgressBar(stats.progress, 25);
      
      // Obtener prioridad del agente
      const agentData = this.manager.assignments[agentName];
      const priority = agentData?.priority || 'N/A';
      const priorityColor = priority === 'CRÍTICA' ? this.colors.red : 
                           priority === 'ALTA' ? this.colors.yellow : 
                           priority === 'MEDIA' ? this.colors.cyan : this.colors.blue;

      console.log(
        `${agentName.padEnd(25)} ` +
        `${priorityColor}${priority.padEnd(10)}${this.colors.reset} ` +
        `${progressColor}${progressBar} ${stats.progress.toString().padStart(3)}%${this.colors.reset} ` +
        `${this.colors.green}${stats.completed.toString().padEnd(12)}${this.colors.reset} ` +
        `${stats.total.toString().padEnd(6)}`
      );
    });
  }

  // Mostrar tareas críticas
  showCriticalTasks(statusReport) {
    console.log(`\n${this.colors.bright}${this.colors.red}🚨 TAREAS CRÍTICAS${this.colors.reset}`);
    console.log('─'.repeat(80));

    const criticalAgents = Object.entries(statusReport.agents)
      .filter(([agentName]) => {
        const agentData = this.manager.assignments[agentName];
        return agentData?.priority === 'CRÍTICA';
      });

    if (criticalAgents.length === 0) {
      console.log(`${this.colors.yellow}No hay agentes críticos definidos${this.colors.reset}`);
      return;
    }

    criticalAgents.forEach(([agentName, stats]) => {
      const progressColor = this.getProgressColor(stats.progress);
      const progressBar = this.generateProgressBar(stats.progress, 20);
      
      console.log(`${this.colors.bright}${agentName}:${this.colors.reset}`);
      console.log(`  Progreso: ${progressColor}${progressBar} ${stats.progress}%${this.colors.reset}`);
      console.log(`  Estado: ${this.colors.green}${stats.completed}${this.colors.reset} completadas, ` +
                  `${this.colors.yellow}${stats.inProgress}${this.colors.reset} en progreso, ` +
                  `${this.colors.red}${stats.blocked}${this.colors.reset} bloqueadas`);
      console.log('');
    });
  }

  // Mostrar tareas bloqueadas
  showBlockedTasks() {
    const blockedTasks = this.activator.getBlockedTasks();
    
    if (blockedTasks.length === 0) {
      console.log(`\n${this.colors.bright}${this.colors.green}✅ No hay tareas bloqueadas${this.colors.reset}`);
      return;
    }

    console.log(`\n${this.colors.bright}${this.colors.red}⚠️  TAREAS BLOQUEADAS${this.colors.reset}`);
    console.log('─'.repeat(80));

    blockedTasks.forEach(({ agent, tasks }) => {
      console.log(`${this.colors.bright}${this.colors.red}${agent}:${this.colors.reset}`);
      tasks.forEach(task => {
        console.log(`  • ${task.description}`);
        console.log(`    Bloqueada por: ${this.colors.yellow}${task.blockers.join(', ')}${this.colors.reset}`);
      });
      console.log('');
    });
  }

  // Mostrar próximas tareas
  showNextTasks() {
    const availableTasks = this.activator.getAvailableTasks();
    
    if (availableTasks.length === 0) {
      console.log(`\n${this.colors.bright}${this.colors.yellow}📋 No hay tareas disponibles para iniciar${this.colors.reset}`);
      return;
    }

    console.log(`\n${this.colors.bright}${this.colors.green}✅ PRÓXIMAS TAREAS DISPONIBLES${this.colors.reset}`);
    console.log('─'.repeat(80));

    availableTasks.forEach(({ agent, tasks }) => {
      console.log(`${this.colors.bright}${this.colors.cyan}${agent}:${this.colors.reset}`);
      tasks.slice(0, 3).forEach(task => {
        console.log(`  • ${task.description}`);
        console.log(`    ID: ${this.colors.blue}${task.id}${this.colors.reset}`);
      });
      if (tasks.length > 3) {
        console.log(`    ${this.colors.yellow}... y ${tasks.length - 3} tareas más${this.colors.reset}`);
      }
      console.log('');
    });
  }

  // Mostrar métricas de rendimiento
  showPerformanceMetrics(statusReport) {
    console.log(`\n${this.colors.bright}${this.colors.white}📈 MÉTRICAS DE RENDIMIENTO${this.colors.reset}`);
    console.log('─'.repeat(60));

    // Calcular métricas
    const totalAgents = Object.keys(statusReport.agents).length;
    const agentsWithProgress = Object.values(statusReport.agents)
      .filter(stats => stats.inProgress > 0 || stats.completed > 0).length;
    
    const avgProgress = Object.values(statusReport.agents)
      .reduce((sum, stats) => sum + stats.progress, 0) / totalAgents;

    const topPerformers = Object.entries(statusReport.agents)
      .sort((a, b) => b[1].progress - a[1].progress)
      .slice(0, 3);

    const laggingAgents = Object.entries(statusReport.agents)
      .filter(([_, stats]) => stats.progress < 20)
      .sort((a, b) => a[1].progress - b[1].progress);

    console.log(`Agentes Activos: ${this.colors.cyan}${agentsWithProgress}/${totalAgents}${this.colors.reset}`);
    console.log(`Progreso Promedio: ${this.colors.cyan}${avgProgress.toFixed(1)}%${this.colors.reset}`);
    
    console.log(`\n${this.colors.green}🏆 TOP 3 PERFORMERS:${this.colors.reset}`);
    topPerformers.forEach(([agent, stats], index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      console.log(`  ${medal} ${agent}: ${stats.progress}% (${stats.completed}/${stats.total})`);
    });

    if (laggingAgents.length > 0) {
      console.log(`\n${this.colors.red}⚠️  AGENTES CON BAJO PROGRESO:${this.colors.reset}`);
      laggingAgents.forEach(([agent, stats]) => {
        console.log(`  • ${agent}: ${stats.progress}% (${stats.completed}/${stats.total})`);
      });
    }
  }

  // Mostrar timeline del proyecto
  showProjectTimeline() {
    console.log(`\n${this.colors.bright}${this.colors.white}📅 TIMELINE DEL PROYECTO${this.colors.reset}`);
    console.log('─'.repeat(80));

    const phases = [
      { phase: 'Fase 0-1', description: 'Preparación y Arquitectura', agents: ['Project Manager', 'System Architect', 'Medical Lead'] },
      { phase: 'Fase 2', description: 'Core Engine', agents: ['System Architect', 'Backend Developer', 'Medical Lead'] },
      { phase: 'Fase 3', description: 'Servicios de Interacciones', agents: ['Backend Developer', 'Data Engineer', 'Medical Lead'] },
      { phase: 'Fase 4', description: 'Servicios de Compliance', agents: ['Backend Developer', 'Security Officer', 'Medical Lead'] },
      { phase: 'Fase 5', description: 'Integraciones', agents: ['Backend Developer', 'API Architect', 'Data Engineer'] },
      { phase: 'Fase 6', description: 'Frontend y UX', agents: ['Frontend Developer', 'UX/UI Designer', 'System Architect'] },
      { phase: 'Fase 7', description: 'Seguridad', agents: ['Security Officer', 'DevOps Engineer', 'Backend Developer'] },
      { phase: 'Fase 8-9', description: 'Testing y Despliegue', agents: ['QA Specialist', 'DevOps Engineer', 'Frontend Developer'] },
      { phase: 'Fase 10', description: 'Documentación y Lanzamiento', agents: ['Technical Writer', 'Support Specialist', 'Product Owner'] }
    ];

    phases.forEach(({ phase, description, agents }) => {
      console.log(`${this.colors.bright}${this.colors.cyan}${phase}:${this.colors.reset} ${description}`);
      console.log(`  Agentes: ${this.colors.yellow}${agents.join(', ')}${this.colors.reset}`);
      console.log('');
    });
  }

  // Generar dashboard completo
  async generateDashboard() {
    try {
      // Cargar estado actual
      await this.activator.loadState();
      
      // Generar reporte de estado
      const statusReport = this.activator.generateStatusReport();

      // Mostrar dashboard
      this.showHeader();
      this.showGeneralSummary(statusReport);
      this.showAgentsTable(statusReport);
      this.showCriticalTasks(statusReport);
      this.showBlockedTasks();
      this.showNextTasks();
      this.showPerformanceMetrics(statusReport);
      this.showProjectTimeline();

      // Footer
      console.log(`\n${this.colors.bright}${this.colors.cyan}╔══════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                    🤖 B001: DASHBOARD DE TAREAS DE AGENTES                    ║`);
      console.log(`║                    Altamedica - Clinical Decision Support Engine             ║`);
      console.log(`╚══════════════════════════════════════════════════════════════════════════════╝${this.colors.reset}`);
      console.log(`\n${this.colors.yellow}Última actualización: ${new Date().toLocaleString('es-ES')}${this.colors.reset}`);

      return statusReport;
    } catch (error) {
      console.error(`${this.colors.red}Error generando dashboard:${this.colors.reset}`, error.message);
      throw error;
    }
  }

  // Generar dashboard en modo JSON
  async generateJSONDashboard() {
    try {
      await this.activator.loadState();
      const statusReport = this.activator.generateStatusReport();
      
      const dashboard = {
        timestamp: new Date().toISOString(),
        project: this.manager.config,
        statusReport,
        blockedTasks: this.activator.getBlockedTasks(),
        availableTasks: this.activator.getAvailableTasks(),
        criticalAgents: Object.entries(statusReport.agents)
          .filter(([agentName]) => {
            const agentData = this.manager.assignments[agentName];
            return agentData?.priority === 'CRÍTICA';
          })
          .map(([agentName, stats]) => ({ agentName, ...stats }))
      };

      return dashboard;
    } catch (error) {
      console.error('Error generando dashboard JSON:', error.message);
      throw error;
    }
  }

  // Guardar dashboard como archivo
  async saveDashboard(filename = 'dashboard.json') {
    const dashboard = await this.generateJSONDashboard();
    const dataPath = path.join(__dirname, '../data');
    await fs.mkdir(dataPath, { recursive: true });
    
    const filePath = path.join(dataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(dashboard, null, 2));
    
    console.log(`💾 Dashboard guardado en: ${filePath}`);
    return filePath;
  }
}

// Función principal
async function main() {
  const dashboard = new TaskDashboard();
  
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'show':
        await dashboard.generateDashboard();
        break;
      case 'json':
        const jsonDashboard = await dashboard.generateJSONDashboard();
        console.log(JSON.stringify(jsonDashboard, null, 2));
        break;
      case 'save':
        const filename = args[1] || 'dashboard.json';
        await dashboard.saveDashboard(filename);
        break;
      default:
        console.log('📊 B001: Dashboard de Tareas de Agentes');
        console.log('\nComandos disponibles:');
        console.log('  show           - Mostrar dashboard visual completo');
        console.log('  json           - Generar dashboard en formato JSON');
        console.log('  save [filename] - Guardar dashboard como archivo');
        console.log('\nEjemplos:');
        console.log('  node task-dashboard.js show');
        console.log('  node task-dashboard.js json');
        console.log('  node task-dashboard.js save dashboard-2025-01-27.json');
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

export default TaskDashboard; 