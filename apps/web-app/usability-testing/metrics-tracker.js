/**
 * Sistema de Métricas para Pruebas de Usabilidad
 * DevAltaMedica - Web Application
 * 
 * Este sistema permite registrar y analizar métricas de usabilidad
 * durante las sesiones de prueba con usuarios internos.
 */

class UsabilityMetricsTracker {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
    this.taskTimers = {};
    this.interactions = [];
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Inicia una nueva sesión de pruebas
   */
  startSession(sessionData) {
    this.currentSession = {
      id: this.generateSessionId(),
      participant: sessionData.participant,
      facilitator: sessionData.facilitator,
      date: new Date(),
      startTime: Date.now(),
      endTime: null,
      tasks: [],
      metrics: {
        totalDuration: 0,
        taskCompletionRate: 0,
        errorRate: 0,
        satisfactionScore: 0,
        susScore: 0,
        timeMetrics: {},
        interactionMetrics: {},
        accessibilityIssues: []
      },
      observations: [],
      feedback: {}
    };

    console.log('Sesión iniciada:', this.currentSession.id);
    this.logEvent('session_started', { sessionId: this.currentSession.id });
  }

  /**
   * Inicia el seguimiento de una tarea específica
   */
  startTask(taskId, taskDescription) {
    if (!this.currentSession) {
      throw new Error('No hay sesión activa');
    }

    const task = {
      id: taskId,
      description: taskDescription,
      startTime: Date.now(),
      endTime: null,
      completed: false,
      errors: [],
      interactions: [],
      attempts: 1,
      helpRequested: 0,
      duration: 0
    };

    this.currentSession.tasks.push(task);
    this.taskTimers[taskId] = Date.now();
    
    console.log('Tarea iniciada:', taskId);
    this.logEvent('task_started', { taskId, description: taskDescription });
  }

  /**
   * Finaliza el seguimiento de una tarea
   */
  completeTask(taskId, completed = true) {
    if (!this.currentSession) {
      throw new Error('No hay sesión activa');
    }

    const task = this.currentSession.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Tarea no encontrada: ${taskId}`);
    }

    task.endTime = Date.now();
    task.duration = task.endTime - task.startTime;
    task.completed = completed;

    delete this.taskTimers[taskId];
    
    console.log('Tarea completada:', taskId, `(${task.duration}ms)`);
    this.logEvent('task_completed', { 
      taskId, 
      duration: task.duration,
      completed 
    });
  }

  /**
   * Registra una interacción del usuario
   */
  recordInteraction(type, element, details = {}) {
    if (!this.currentSession) return;

    const interaction = {
      timestamp: Date.now(),
      type, // 'click', 'keypress', 'scroll', 'hover', etc.
      element,
      details,
      sessionId: this.currentSession.id
    };

    this.interactions.push(interaction);
    
    // Agregar la interacción a la tarea actual si existe
    const currentTask = this.getCurrentTask();
    if (currentTask) {
      currentTask.interactions.push(interaction);
    }

    this.logEvent('interaction', interaction);
  }

  /**
   * Registra un error durante la sesión
   */
  recordError(type, description, severity = 'medium', taskId = null) {
    if (!this.currentSession) return;

    const error = {
      timestamp: Date.now(),
      type,
      description,
      severity, // 'low', 'medium', 'high', 'critical'
      taskId,
      sessionId: this.currentSession.id
    };

    this.errors.push(error);
    
    // Agregar el error a la tarea específica si se proporciona
    if (taskId) {
      const task = this.currentSession.tasks.find(t => t.id === taskId);
      if (task) {
        task.errors.push(error);
      }
    }

    console.warn('Error registrado:', error);
    this.logEvent('error', error);
  }

  /**
   * Registra una observación durante la sesión
   */
  recordObservation(type, description, timestamp = null) {
    if (!this.currentSession) return;

    const observation = {
      timestamp: timestamp || Date.now(),
      type, // 'confusion', 'frustration', 'satisfaction', 'comment', etc.
      description,
      sessionId: this.currentSession.id
    };

    this.currentSession.observations.push(observation);
    this.logEvent('observation', observation);
  }

  /**
   * Registra métricas de tiempo específicas
   */
  recordTimeMetric(metricName, value, unit = 'ms') {
    if (!this.currentSession) return;

    this.currentSession.metrics.timeMetrics[metricName] = {
      value,
      unit,
      timestamp: Date.now()
    };

    this.logEvent('time_metric', { metricName, value, unit });
  }

  /**
   * Registra problemas de accesibilidad
   */
  recordAccessibilityIssue(issue, severity, wcagGuideline = null) {
    if (!this.currentSession) return;

    const accessibilityIssue = {
      timestamp: Date.now(),
      issue,
      severity,
      wcagGuideline,
      sessionId: this.currentSession.id
    };

    this.currentSession.metrics.accessibilityIssues.push(accessibilityIssue);
    this.logEvent('accessibility_issue', accessibilityIssue);
  }

  /**
   * Registra la puntuación SUS
   */
  recordSUSScore(responses) {
    if (!this.currentSession) return;

    // Calcular puntuación SUS
    const susScore = this.calculateSUSScore(responses);
    this.currentSession.metrics.susScore = susScore;
    
    this.logEvent('sus_score', { score: susScore, responses });
  }

  /**
   * Calcula la puntuación SUS basada en las respuestas
   */
  calculateSUSScore(responses) {
    let score = 0;
    
    responses.forEach((response, index) => {
      if (index % 2 === 0) {
        // Preguntas impares (1, 3, 5, 7, 9)
        score += response - 1;
      } else {
        // Preguntas pares (2, 4, 6, 8, 10)
        score += 5 - response;
      }
    });

    return score * 2.5; // Multiplica por 2.5 para obtener puntuación 0-100
  }

  /**
   * Registra feedback del usuario
   */
  recordFeedback(category, feedback) {
    if (!this.currentSession) return;

    if (!this.currentSession.feedback[category]) {
      this.currentSession.feedback[category] = [];
    }

    this.currentSession.feedback[category].push({
      timestamp: Date.now(),
      feedback
    });

    this.logEvent('feedback', { category, feedback });
  }

  /**
   * Finaliza la sesión actual
   */
  endSession() {
    if (!this.currentSession) {
      throw new Error('No hay sesión activa');
    }

    this.currentSession.endTime = Date.now();
    this.currentSession.metrics.totalDuration = 
      this.currentSession.endTime - this.currentSession.startTime;

    // Calcular métricas finales
    this.calculateSessionMetrics();

    this.sessions.push(this.currentSession);
    
    console.log('Sesión finalizada:', this.currentSession.id);
    this.logEvent('session_ended', { sessionId: this.currentSession.id });

    const completedSession = this.currentSession;
    this.currentSession = null;
    
    return completedSession;
  }

  /**
   * Calcula métricas de la sesión
   */
  calculateSessionMetrics() {
    if (!this.currentSession) return;

    const tasks = this.currentSession.tasks;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Tasa de completación de tareas
    this.currentSession.metrics.taskCompletionRate = 
      tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // Tasa de errores
    const totalErrors = this.errors.filter(e => 
      e.sessionId === this.currentSession.id).length;
    this.currentSession.metrics.errorRate = totalErrors;

    // Métricas de tiempo por tarea
    tasks.forEach(task => {
      this.currentSession.metrics.timeMetrics[task.id] = {
        duration: task.duration,
        completed: task.completed,
        errors: task.errors.length,
        interactions: task.interactions.length
      };
    });

    // Métricas de interacción
    const sessionInteractions = this.interactions.filter(i => 
      i.sessionId === this.currentSession.id);
    
    this.currentSession.metrics.interactionMetrics = {
      totalInteractions: sessionInteractions.length,
      clicksPerTask: sessionInteractions.length / Math.max(tasks.length, 1),
      interactionTypes: this.groupBy(sessionInteractions, 'type')
    };
  }

  /**
   * Obtiene la tarea actual (la última sin completar)
   */
  getCurrentTask() {
    if (!this.currentSession) return null;
    
    return this.currentSession.tasks.find(t => !t.endTime);
  }

  /**
   * Genera un ID único para la sesión
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `session-${timestamp}-${random}`;
  }

  /**
   * Registra un evento en la consola y almacenamiento
   */
  logEvent(type, data) {
    const event = {
      timestamp: Date.now(),
      type,
      data
    };

    // Almacenar en localStorage para persistencia
    const events = JSON.parse(localStorage.getItem('usabilityEvents') || '[]');
    events.push(event);
    localStorage.setItem('usabilityEvents', JSON.stringify(events));

    console.log('Evento registrado:', event);
  }

  /**
   * Exporta los datos de la sesión
   */
  exportSessionData(sessionId = null) {
    const session = sessionId ? 
      this.sessions.find(s => s.id === sessionId) : 
      this.currentSession;

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    return {
      session,
      events: JSON.parse(localStorage.getItem('usabilityEvents') || '[]')
        .filter(e => e.data.sessionId === session.id)
    };
  }

  /**
   * Genera un reporte de la sesión
   */
  generateReport(sessionId = null) {
    const session = sessionId ? 
      this.sessions.find(s => s.id === sessionId) : 
      this.currentSession;

    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    return {
      sessionInfo: {
        id: session.id,
        participant: session.participant,
        duration: session.metrics.totalDuration,
        date: session.date
      },
      taskMetrics: {
        totalTasks: session.tasks.length,
        completedTasks: session.tasks.filter(t => t.completed).length,
        completionRate: session.metrics.taskCompletionRate,
        averageTaskTime: this.calculateAverageTaskTime(session.tasks)
      },
      usabilityMetrics: {
        errorRate: session.metrics.errorRate,
        susScore: session.metrics.susScore,
        satisfactionScore: session.metrics.satisfactionScore,
        totalInteractions: session.metrics.interactionMetrics.totalInteractions
      },
      accessibilityIssues: session.metrics.accessibilityIssues,
      keyObservations: session.observations,
      feedback: session.feedback
    };
  }

  /**
   * Calcula el tiempo promedio de las tareas
   */
  calculateAverageTaskTime(tasks) {
    const completedTasks = tasks.filter(t => t.completed && t.duration > 0);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => sum + task.duration, 0);
    return totalTime / completedTasks.length;
  }

  /**
   * Función auxiliar para agrupar elementos por una propiedad
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  /**
   * Obtiene estadísticas generales de todas las sesiones
   */
  getOverallStatistics() {
    if (this.sessions.length === 0) {
      return {
        totalSessions: 0,
        averageCompletionRate: 0,
        averageSUSScore: 0,
        commonIssues: [],
        averageSessionDuration: 0
      };
    }

    const totalSessions = this.sessions.length;
    const avgCompletionRate = this.sessions.reduce((sum, s) => 
      sum + s.metrics.taskCompletionRate, 0) / totalSessions;
    
    const avgSUSScore = this.sessions.reduce((sum, s) => 
      sum + (s.metrics.susScore || 0), 0) / totalSessions;
    
    const avgDuration = this.sessions.reduce((sum, s) => 
      sum + s.metrics.totalDuration, 0) / totalSessions;

    // Analizar problemas comunes
    const allIssues = this.sessions.flatMap(s => s.metrics.accessibilityIssues);
    const issueGroups = this.groupBy(allIssues, 'issue');
    const commonIssues = Object.entries(issueGroups)
      .map(([issue, occurrences]) => ({
        issue,
        frequency: occurrences.length,
        severity: this.getMostCommonSeverity(occurrences)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      totalSessions,
      averageCompletionRate: avgCompletionRate,
      averageSUSScore: avgSUSScore,
      commonIssues,
      averageSessionDuration: avgDuration
    };
  }

  /**
   * Obtiene la severidad más común de un grupo de problemas
   */
  getMostCommonSeverity(issues) {
    const severityCount = this.groupBy(issues, 'severity');
    return Object.entries(severityCount)
      .sort((a, b) => b[1].length - a[1].length)[0][0];
  }
}

// Crear instancia global para el tracking
const usabilityTracker = new UsabilityMetricsTracker();

// Función para automatizar el tracking de interacciones
function setupAutomaticTracking() {
  // Tracking de clics
  document.addEventListener('click', (e) => {
    usabilityTracker.recordInteraction('click', e.target.tagName.toLowerCase(), {
      id: e.target.id,
      className: e.target.className,
      text: e.target.textContent?.slice(0, 50) || ''
    });
  });

  // Tracking de teclas
  document.addEventListener('keydown', (e) => {
    usabilityTracker.recordInteraction('keypress', 'document', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey
    });
  });

  // Tracking de scroll
  let scrollTimeout;
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      usabilityTracker.recordInteraction('scroll', 'document', {
        scrollTop: window.pageYOffset,
        scrollLeft: window.pageXOffset
      });
    }, 100);
  });

  // Tracking de errores JavaScript
  window.addEventListener('error', (e) => {
    usabilityTracker.recordError('javascript_error', e.message, 'high');
  });

  // Tracking de errores de recursos
  window.addEventListener('unhandledrejection', (e) => {
    usabilityTracker.recordError('promise_rejection', e.reason, 'medium');
  });
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UsabilityMetricsTracker, usabilityTracker };
}

// Exponer globalmente para uso en el navegador
if (typeof window !== 'undefined') {
  window.usabilityTracker = usabilityTracker;
  window.UsabilityMetricsTracker = UsabilityMetricsTracker;
  
  // Configurar tracking automático cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutomaticTracking);
  } else {
    setupAutomaticTracking();
  }
}

console.log('Sistema de métricas de usabilidad cargado');
