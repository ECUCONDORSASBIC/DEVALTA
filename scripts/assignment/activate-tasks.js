#!/usr/bin/env node

/**
 * 🚀 Activador de Tareas de Agentes
 * Altamedica - Clinical Decision Support Engine
 * 
 * Este script activa y gestiona las tareas asignadas a cada agente
 * según el documento de asignaciones detalladas.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import AgentTaskManager from './agent-task-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TaskActivator {
  constructor() {
    this.manager = new AgentTaskManager();
    this.activeTasks = new Map();
    this.taskStatus = {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      BLOCKED: 'blocked',
      REVIEW: 'review'
    };
  }

  // Activar tareas para un agente específico
  async activateAgentTasks(agentName, phase = null) {
    console.log(`🚀 Activando tareas para: ${agentName}`);
    
    const agentReport = this.manager.generateAgentReport(agentName);
    const tasks = [];

    Object.entries(agentReport.tasks).forEach(([phaseName, phaseTasks]) => {
      if (!phase || phaseName.includes(phase)) {
        phaseTasks.forEach((task, index) => {
          const taskId = `${agentName}_${phaseName}_${index}`;
          tasks.push({
            id: taskId,
            agent: agentName,
            phase: phaseName,
            description: task,
            status: this.taskStatus.PENDING,
            priority: agentReport.priority,
            estimatedWeeks: agentReport.estimatedWeeks,
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            dependencies: this.getTaskDependencies(agentName, phaseName, task),
            blockers: [],
            progress: 0,
            notes: []
          });
        });
      }
    });

    this.activeTasks.set(agentName, tasks);
    
    console.log(`✅ ${tasks.length} tareas activadas para ${agentName}`);
    return tasks;
  }

  // Obtener dependencias de una tarea
  getTaskDependencies(agentName, phase, task) {
    const dependencies = {
      'System Architect': {
        'Fase 1': ['Medical Lead'],
        'Fase 2': ['Backend Developer'],
        'Fase 3-5': ['Backend Developer', 'Data Engineer'],
        'Fase 6-10': ['Frontend Developer', 'DevOps Engineer']
      },
      'Backend Developer': {
        'Fase 2': ['System Architect'],
        'Fase 3': ['Data Engineer'],
        'Fase 4': ['Security Officer'],
        'Fase 5': ['API Architect'],
        'Fase 7-9': ['QA Specialist']
      },
      'Frontend Developer': {
        'Fase 6': ['System Architect', 'UX/UI Designer'],
        'Fase 8-9': ['QA Specialist'],
        'Fase 10': ['Technical Writer']
      },
      'DevOps Engineer': {
        'Fase 0-1': ['System Architect'],
        'Fase 2-5': ['Backend Developer'],
        'Fase 8-9': ['Security Officer'],
        'Fase 10': ['QA Specialist']
      }
    };

    return dependencies[agentName]?.[phase] || [];
  }

  // Iniciar una tarea específica
  async startTask(agentName, taskId) {
    const agentTasks = this.activeTasks.get(agentName);
    if (!agentTasks) {
      throw new Error(`No hay tareas activas para ${agentName}`);
    }

    const task = agentTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Tarea ${taskId} no encontrada`);
    }

    // Verificar dependencias
    const blockedBy = await this.checkDependencies(task);
    if (blockedBy.length > 0) {
      task.status = this.taskStatus.BLOCKED;
      task.blockers = blockedBy;
      console.log(`⚠️  Tarea ${taskId} bloqueada por: ${blockedBy.join(', ')}`);
      return task;
    }

    task.status = this.taskStatus.IN_PROGRESS;
    task.startedAt = new Date().toISOString();
    task.progress = 0;

    console.log(`▶️  Iniciando tarea: ${task.description}`);
    return task;
  }

  // Verificar dependencias de una tarea
  async checkDependencies(task) {
    const blockers = [];
    
    for (const dependency of task.dependencies) {
      const dependencyTasks = this.activeTasks.get(dependency);
      if (dependencyTasks) {
        const hasCompletedTasks = dependencyTasks.some(t => 
          t.status === this.taskStatus.COMPLETED
        );
        if (!hasCompletedTasks) {
          blockers.push(dependency);
        }
      }
    }

    return blockers;
  }

  // Actualizar progreso de una tarea
  async updateTaskProgress(agentName, taskId, progress, notes = null) {
    const agentTasks = this.activeTasks.get(agentName);
    if (!agentTasks) {
      throw new Error(`No hay tareas activas para ${agentName}`);
    }

    const task = agentTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Tarea ${taskId} no encontrada`);
    }

    task.progress = Math.min(100, Math.max(0, progress));
    
    if (notes) {
      task.notes.push({
        timestamp: new Date().toISOString(),
        progress: task.progress,
        note: notes
      });
    }

    if (task.progress === 100) {
      task.status = this.taskStatus.REVIEW;
      console.log(`✅ Tarea ${taskId} completada y en revisión`);
    } else if (task.progress > 0) {
      task.status = this.taskStatus.IN_PROGRESS;
    }

    return task;
  }

  // Completar una tarea
  async completeTask(agentName, taskId, reviewNotes = null) {
    const agentTasks = this.activeTasks.get(agentName);
    if (!agentTasks) {
      throw new Error(`No hay tareas activas para ${agentName}`);
    }

    const task = agentTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Tarea ${taskId} no encontrada`);
    }

    task.status = this.taskStatus.COMPLETED;
    task.completedAt = new Date().toISOString();
    task.progress = 100;

    if (reviewNotes) {
      task.notes.push({
        timestamp: new Date().toISOString(),
        progress: 100,
        note: `REVIEW: ${reviewNotes}`
      });
    }

    console.log(`🎉 Tarea ${taskId} marcada como completada`);
    return task;
  }

  // Generar reporte de estado actual
  generateStatusReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        blocked: 0,
        review: 0
      },
      agents: {}
    };

    for (const [agentName, tasks] of this.activeTasks) {
      const agentSummary = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === this.taskStatus.PENDING).length,
        inProgress: tasks.filter(t => t.status === this.taskStatus.IN_PROGRESS).length,
        completed: tasks.filter(t => t.status === this.taskStatus.COMPLETED).length,
        blocked: tasks.filter(t => t.status === this.taskStatus.BLOCKED).length,
        review: tasks.filter(t => t.status === this.taskStatus.REVIEW).length,
        progress: Math.round((tasks.filter(t => t.status === this.taskStatus.COMPLETED).length / tasks.length) * 100)
      };

      report.agents[agentName] = agentSummary;
      report.summary.totalTasks += agentSummary.total;
      report.summary.pending += agentSummary.pending;
      report.summary.inProgress += agentSummary.inProgress;
      report.summary.completed += agentSummary.completed;
      report.summary.blocked += agentSummary.blocked;
      report.summary.review += agentSummary.review;
    }

    report.summary.overallProgress = Math.round((report.summary.completed / report.summary.totalTasks) * 100);

    return report;
  }

  // Mostrar tareas bloqueadas
  getBlockedTasks() {
    const blocked = [];
    
    for (const [agentName, tasks] of this.activeTasks) {
      const agentBlocked = tasks.filter(t => t.status === this.taskStatus.BLOCKED);
      if (agentBlocked.length > 0) {
        blocked.push({
          agent: agentName,
          tasks: agentBlocked
        });
      }
    }

    return blocked;
  }

  // Mostrar próximas tareas disponibles
  getAvailableTasks() {
    const available = [];
    
    for (const [agentName, tasks] of this.activeTasks) {
      const agentAvailable = tasks.filter(t => 
        t.status === this.taskStatus.PENDING && 
        t.blockers.length === 0
      );
      if (agentAvailable.length > 0) {
        available.push({
          agent: agentName,
          tasks: agentAvailable
        });
      }
    }

    return available;
  }

  // Guardar estado actual
  async saveState() {
    const state = {
      timestamp: new Date().toISOString(),
      activeTasks: Object.fromEntries(this.activeTasks),
      statusReport: this.generateStatusReport()
    };

    const dataPath = path.join(__dirname, '../data');
    await fs.mkdir(dataPath, { recursive: true });
    
    const filePath = path.join(dataPath, 'task-state.json');
    await fs.writeFile(filePath, JSON.stringify(state, null, 2));
    
    console.log(`💾 Estado guardado en: ${filePath}`);
    return filePath;
  }

  // Cargar estado guardado
  async loadState() {
    const filePath = path.join(__dirname, '../data/task-state.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const state = JSON.parse(data);
      
      this.activeTasks = new Map(Object.entries(state.activeTasks));
      console.log(`📂 Estado cargado desde: ${filePath}`);
      return state;
    } catch (error) {
      console.log('No se encontró estado guardado, iniciando nuevo');
      return null;
    }
  }

  // Ejecutar flujo de activación completo
  async runActivationFlow() {
    console.log('🚀 B001: Activación de Tareas de Agentes');
    console.log('=' .repeat(50));

    // Cargar estado existente o iniciar nuevo
    await this.loadState();

    // Si no hay tareas activas, activar todas
    if (this.activeTasks.size === 0) {
      console.log('\n📋 Activando tareas para todos los agentes...');
      
      const agents = Object.keys(this.manager.assignments);
      for (const agent of agents) {
        await this.activateAgentTasks(agent);
      }
    }

    // Generar reporte de estado
    const statusReport = this.generateStatusReport();
    console.log('\n📊 ESTADO ACTUAL:');
    console.log(`Total de tareas: ${statusReport.summary.totalTasks}`);
    console.log(`Completadas: ${statusReport.summary.completed} (${statusReport.summary.overallProgress}%)`);
    console.log(`En progreso: ${statusReport.summary.inProgress}`);
    console.log(`Pendientes: ${statusReport.summary.pending}`);
    console.log(`Bloqueadas: ${statusReport.summary.blocked}`);
    console.log(`En revisión: ${statusReport.summary.review}`);

    // Mostrar agentes con más progreso
    console.log('\n🏆 TOP AGENTES POR PROGRESO:');
    Object.entries(statusReport.agents)
      .sort((a, b) => b[1].progress - a[1].progress)
      .slice(0, 5)
      .forEach(([agent, stats]) => {
        console.log(`${agent}: ${stats.completed}/${stats.total} (${stats.progress}%)`);
      });

    // Mostrar tareas bloqueadas
    const blockedTasks = this.getBlockedTasks();
    if (blockedTasks.length > 0) {
      console.log('\n⚠️  TAREAS BLOQUEADAS:');
      blockedTasks.forEach(({ agent, tasks }) => {
        console.log(`${agent}:`);
        tasks.forEach(task => {
          console.log(`  - ${task.description} (bloqueada por: ${task.blockers.join(', ')})`);
        });
      });
    }

    // Mostrar tareas disponibles
    const availableTasks = this.getAvailableTasks();
    if (availableTasks.length > 0) {
      console.log('\n✅ TAREAS DISPONIBLES:');
      availableTasks.forEach(({ agent, tasks }) => {
        console.log(`${agent}:`);
        tasks.slice(0, 3).forEach(task => {
          console.log(`  - ${task.description}`);
        });
        if (tasks.length > 3) {
          console.log(`  ... y ${tasks.length - 3} más`);
        }
      });
    }

    // Guardar estado
    await this.saveState();

    return statusReport;
  }
}

// Función principal
async function main() {
  const activator = new TaskActivator();
  
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'activate':
        await activator.runActivationFlow();
        break;
      case 'status':
        await activator.loadState();
        const statusReport = activator.generateStatusReport();
        console.log(JSON.stringify(statusReport, null, 2));
        break;
      case 'start':
        const agentName = args[1];
        const taskId = args[2];
        if (!agentName || !taskId) {
          console.error('Error: Debe especificar agente y taskId');
          process.exit(1);
        }
        await activator.loadState();
        const startedTask = await activator.startTask(agentName, taskId);
        console.log(JSON.stringify(startedTask, null, 2));
        await activator.saveState();
        break;
      case 'progress':
        const progressAgent = args[1];
        const progressTaskId = args[2];
        const progress = parseInt(args[3]);
        const notes = args[4];
        if (!progressAgent || !progressTaskId || isNaN(progress)) {
          console.error('Error: Debe especificar agente, taskId y progreso');
          process.exit(1);
        }
        await activator.loadState();
        const updatedTask = await activator.updateTaskProgress(progressAgent, progressTaskId, progress, notes);
        console.log(JSON.stringify(updatedTask, null, 2));
        await activator.saveState();
        break;
      case 'complete':
        const completeAgent = args[1];
        const completeTaskId = args[2];
        const reviewNotes = args[3];
        if (!completeAgent || !completeTaskId) {
          console.error('Error: Debe especificar agente y taskId');
          process.exit(1);
        }
        await activator.loadState();
        const completedTask = await activator.completeTask(completeAgent, completeTaskId, reviewNotes);
        console.log(JSON.stringify(completedTask, null, 2));
        await activator.saveState();
        break;
      default:
        console.log('🚀 B001: Activador de Tareas de Agentes');
        console.log('\nComandos disponibles:');
        console.log('  activate              - Ejecutar flujo de activación completo');
        console.log('  status                - Mostrar estado actual');
        console.log('  start <agente> <taskId> - Iniciar una tarea específica');
        console.log('  progress <agente> <taskId> <progreso> [notas] - Actualizar progreso');
        console.log('  complete <agente> <taskId> [notas] - Completar una tarea');
        console.log('\nEjemplos:');
        console.log('  node activate-tasks.js activate');
        console.log('  node activate-tasks.js start "Backend Developer" "Backend Developer_Fase 2_0"');
        console.log('  node activate-tasks.js progress "Backend Developer" "Backend Developer_Fase 2_0" 50 "Implementación en progreso"');
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

export default TaskActivator; 