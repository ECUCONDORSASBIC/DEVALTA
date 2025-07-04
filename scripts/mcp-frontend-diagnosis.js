#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class MCPFrontendDiagnosis {
  constructor() {
    this.mcpProcess = null;
    this.diagnosisResults = null;
  }

  async startMCP() {
    return new Promise((resolve, reject) => {
      this.mcpProcess = spawn('node', ['./mcp-servers/enhanced-multi-agent-mcp.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      
      this.mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('18 agentes especializados de Altamedica inicializados')) {
          resolve();
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('MCP Error:', data.toString());
      });

      this.mcpProcess.on('error', (error) => {
        reject(error);
      });

      // Timeout después de 30 segundos
      setTimeout(() => {
        if (!output.includes('18 agentes especializados')) {
          reject(new Error('MCP no se inicializó correctamente'));
        }
      }, 30000);
    });
  }

  async sendDiagnosisCommand() {
    return new Promise((resolve, reject) => {
      if (!this.mcpProcess) {
        reject(new Error('MCP no está iniciado'));
        return;
      }

      const command = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "compose_application",
          arguments: {
            spec: {
              name: "Frontend de Pacientes - Diagnóstico",
              description: "Análisis completo del frontend de pacientes para optimización",
              requirements: [
                "Personalización basada en usuario",
                "Implementación de todas las funcionalidades",
                "Optimización de rendimiento",
                "Testing exhaustivo",
                "Responsive Design"
              ],
              target: "apps/patients/src",
              analysis_type: "frontend_diagnosis"
            },
            context: {
              module: "patients",
              area: "frontend",
              priority: "high"
            }
          }
        }
      });

      let response = '';
      
      this.mcpProcess.stdout.on('data', (data) => {
        response += data.toString();
        if (response.includes('"result"')) {
          try {
            const result = JSON.parse(response);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      });

      this.mcpProcess.stdin.write(command + '\n');
    });
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      module: "patients",
      area: "frontend",
      diagnosis: this.diagnosisResults,
      recommendations: [
        {
          category: "Personalización",
          priority: "high",
          actions: [
            "Implementar sistema de preferencias de usuario",
            "Crear componentes adaptativos basados en rol",
            "Añadir temas personalizables"
          ]
        },
        {
          category: "Funcionalidades",
          priority: "high",
          actions: [
            "Completar implementación de dashboard compacto",
            "Añadir funcionalidades de telemedicina",
            "Implementar sistema de notificaciones en tiempo real"
          ]
        },
        {
          category: "Rendimiento",
          priority: "medium",
          actions: [
            "Optimizar carga de componentes",
            "Implementar lazy loading",
            "Optimizar bundle size"
          ]
        },
        {
          category: "Testing",
          priority: "high",
          actions: [
            "Implementar tests unitarios completos",
            "Añadir tests de integración",
            "Configurar tests E2E"
          ]
        },
        {
          category: "Responsive Design",
          priority: "medium",
          actions: [
            "Optimizar para dispositivos móviles",
            "Mejorar accesibilidad",
            "Implementar breakpoints consistentes"
          ]
        }
      ]
    };

    const logsDir = './logs';
    await fs.mkdir(logsDir, { recursive: true });
    
    const reportPath = path.join(logsDir, 'frontend-diagnosis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  async run() {
    try {
      console.log('🚀 Iniciando diagnóstico del frontend de pacientes...');
      
      await this.startMCP();
      console.log('✅ MCP enhanced iniciado correctamente');
      
      this.diagnosisResults = await this.sendDiagnosisCommand();
      console.log('✅ Diagnóstico completado');
      
      const reportPath = await this.generateReport();
      console.log(`📊 Reporte generado en: ${reportPath}`);
      
      return reportPath;
    } catch (error) {
      console.error('❌ Error durante el diagnóstico:', error);
      throw error;
    } finally {
      if (this.mcpProcess) {
        this.mcpProcess.kill();
      }
    }
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnosis = new MCPFrontendDiagnosis();
  diagnosis.run()
    .then(reportPath => {
      console.log('🎉 Diagnóstico completado exitosamente');
      console.log(`📄 Reporte disponible en: ${reportPath}`);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default MCPFrontendDiagnosis; 