/**
 * Agente Base para Conocimiento Técnico
 * Proporciona funcionalidades comunes para todos los agentes especializados
 */

import { TechnicalKnowledgeService } from '../services/technical-knowledge.service.js';

export class BaseTechnicalAgent {
  constructor(role, config) {
    this.role = role;
    this.config = config;
    this.knowledgeService = new TechnicalKnowledgeService();
    this.specialization = config.specialization;
    this.knowledgeAreas = config.knowledge_areas;
  }
  
  async analyzeCode(code, language) {
    const analysis = {
      quality: await this.analyzeQuality(code),
      security: await this.analyzeSecurity(code),
      performance: await this.analyzePerformance(code),
      bestPractices: await this.checkBestPractices(code, language)
    };
    
    return analysis;
  }
  
  async analyzeQuality(code) {
    // Análisis básico de calidad
    const metrics = {
      lines: code.split('\n').length,
      complexity: this.calculateComplexity(code),
      maintainability: this.calculateMaintainability(code)
    };
    
    return metrics;
  }
  
  async analyzeSecurity(code) {
    // Análisis básico de seguridad
    const securityIssues = [];
    
    // Detectar patrones inseguros comunes
    const insecurePatterns = [
      /eval\(/,
      /innerHTML\s*=/,
      /document\.write/,
      /sql\s*\+/,
      /password\s*=\s*['"][^'"]*['"]/
    ];
    
    insecurePatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        securityIssues.push({
          type: 'security_pattern',
          pattern: pattern.source,
          line: this.findLineNumber(code, pattern)
        });
      }
    });
    
    return securityIssues;
  }
  
  async analyzePerformance(code) {
    // Análisis básico de performance
    const performanceIssues = [];
    
    // Detectar patrones de performance problemáticos
    const performancePatterns = [
      /for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/, // Nested loops
      /\$\$/, // jQuery selector
      /innerHTML\s*\+=/, // String concatenation in loops
      /setTimeout\([^,]*,\s*0\)/ // Zero timeout
    ];
    
    performancePatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        performanceIssues.push({
          type: 'performance_pattern',
          pattern: pattern.source,
          line: this.findLineNumber(code, pattern)
        });
      }
    });
    
    return performanceIssues;
  }
  
  async checkBestPractices(code, language) {
    // Verificar mejores prácticas según el lenguaje
    const bestPractices = {
      passed: [],
      failed: [],
      suggestions: []
    };
    
    // Implementar verificaciones específicas por lenguaje
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        bestPractices.suggestions.push(
          'Usar const y let en lugar de var',
          'Implementar manejo de errores con try-catch',
          'Usar async/await en lugar de callbacks',
          'Implementar validación de tipos'
        );
        break;
      case 'python':
        bestPractices.suggestions.push(
          'Usar type hints',
          'Implementar docstrings',
          'Usar context managers',
          'Seguir PEP 8'
        );
        break;
      default:
        bestPractices.suggestions.push(
          'Revisar documentación oficial del lenguaje',
          'Implementar tests unitarios',
          'Usar un linter apropiado'
        );
    }
    
    return bestPractices;
  }
  
  calculateComplexity(code) {
    // Cálculo básico de complejidad ciclomática
    const complexityKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }
  
  calculateMaintainability(code) {
    // Cálculo básico de mantenibilidad
    const lines = code.split('\n').length;
    const complexity = this.calculateComplexity(code);
    
    // Fórmula simplificada de mantenibilidad
    const maintainability = Math.max(0, 100 - (lines * 0.5) - (complexity * 2));
    
    return Math.round(maintainability);
  }
  
  findLineNumber(code, pattern) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return -1;
  }
  
  async getRecommendations(context) {
    const recommendations = [];
    
    // Buscar soluciones técnicas
    const solutions = await this.knowledgeService.searchTechnicalSolution(
      context.problem,
      context.tags
    );
    
    if (solutions.length > 0) {
      recommendations.push({
        type: 'technical_solution',
        source: 'Stack Overflow',
        solutions: solutions.slice(0, 3)
      });
    }
    
    // Obtener ejemplos de código
    const examples = await this.knowledgeService.getCodeExamples(
      context.language,
      context.topic
    );
    
    if (examples.length > 0) {
      recommendations.push({
        type: 'code_example',
        source: 'GitHub',
        examples: examples.slice(0, 2)
      });
    }
    
    return recommendations;
  }
  
  async generateReport(projectPath) {
    const report = {
      agent: this.role,
      timestamp: new Date().toISOString(),
      specialization: this.specialization,
      knowledgeAreas: this.knowledgeAreas,
      analysis: await this.analyzeProject(projectPath),
      recommendations: await this.getProjectRecommendations(projectPath)
    };
    
    return report;
  }
  
  async analyzeProject(projectPath) {
    // Análisis básico del proyecto
    return {
      files: await this.countFiles(projectPath),
      languages: await this.detectLanguages(projectPath),
      dependencies: await this.analyzeDependencies(projectPath)
    };
  }
  
  async getProjectRecommendations(projectPath) {
    // Recomendaciones específicas del proyecto
    return [
      'Implementar tests automatizados',
      'Configurar CI/CD pipeline',
      'Revisar dependencias por vulnerabilidades',
      'Optimizar performance del código'
    ];
  }
  
  async countFiles(projectPath) {
    // Contar archivos en el proyecto
    try {
      const files = await this.walkDirectory(projectPath);
      return files.length;
    } catch (error) {
      console.error('Error contando archivos:', error);
      return 0;
    }
  }
  
  async detectLanguages(projectPath) {
    // Detectar lenguajes de programación usados
    const extensions = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust'
    };
    
    try {
      const files = await this.walkDirectory(projectPath);
      const languages = new Set();
      
      files.forEach(file => {
        const ext = path.extname(file);
        if (extensions[ext]) {
          languages.add(extensions[ext]);
        }
      });
      
      return Array.from(languages);
    } catch (error) {
      console.error('Error detectando lenguajes:', error);
      return [];
    }
  }
  
  async analyzeDependencies(projectPath) {
    // Analizar dependencias del proyecto
    const dependencies = [];
    
    try {
      // Buscar package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        dependencies.push({
          type: 'npm',
          dependencies: packageJson.dependencies || {},
          devDependencies: packageJson.devDependencies || {}
        });
      }
      
      // Buscar requirements.txt
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      if (fs.existsSync(requirementsPath)) {
        const requirements = fs.readFileSync(requirementsPath, 'utf8')
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'));
        dependencies.push({
          type: 'python',
          dependencies: requirements
        });
      }
    } catch (error) {
      console.error('Error analizando dependencias:', error);
    }
    
    return dependencies;
  }
  
  async walkDirectory(dir) {
    const files = [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...await this.walkDirectory(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}
