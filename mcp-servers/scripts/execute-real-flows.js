// MODULE TYPE: ESM (ECMAScript Modules)
// Script: execute-real-flows.js
// Objetivo: leer los prompts de PROMPTS_AUTOMATIZADOS_ALTAMEDICA.md y ejecutar
// composiciones reales con EnhancedMultiAgentComposer sobre cada aplicación
// crítica de Altamedica.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnhancedMultiAgentComposer } from '../enhanced-multi-agent-mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo de prompts
const PROMPTS_PATH = path.resolve(__dirname, '../PROMPTS_AUTOMATIZADOS_ALTAMEDICA.md');
// Directorios de aplicaciones críticos (pueden ampliarse dinámicamente)
const APPS_DIRS = [
  '../../apps/web-app',
  '../../apps/patients',
  '../../apps/medical',
  '../../apps/companies',
  '../../apps/api-server',
  '../../apps/anthropic-simulator'
].map(p => path.resolve(__dirname, p));

// Utilidad simple de extracción (alta fidelidad mínima)
function extractPrompts(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.replace(/^[-*>\d. ]+/, '').trim())
    .filter(Boolean);
}

async function main() {
  console.error('🚀 Ejecutando flujos reales multi-agente');

  // 1. Cargar prompts
  const md = await fs.readFile(PROMPTS_PATH, 'utf-8');
  const prompts = extractPrompts(md);
  if (!prompts.length) {
    console.error('❌ No se encontraron prompts válidos');
    process.exit(1);
  }
  console.error(`📋 Prompts encontrados: ${prompts.length}`);

  // 2. Inicializar compositor
  const composer = new EnhancedMultiAgentComposer();

  // 3. Ejecutar composición para cada app y prompt
  for (const appDir of APPS_DIRS) {
    const appName = path.basename(appDir);
    console.error(`\n🏥 Aplicación: ${appName}`);

    for (const prompt of prompts) {
      const spec = {
        name: `${appName} - ${prompt.slice(0, 30)}…`,
        description: prompt,
        type: 'fullstack',
        budget: 0, // Desconocido; se ajustará durante negociación
        timeline: 'TBD',
        appPath: appDir,
        frontend: { framework: 'Next.js' },
        backend: { language: 'TypeScript' }
      };

      console.error(`📝 Prompt: ${prompt}`);
      const composition = await composer.composeApplicationEnhanced(spec, { appDir });

      // Guardar resultado para referencia
      const outDir = path.resolve(__dirname, '../../docs/compositions');
      await fs.mkdir(outDir, { recursive: true });
      const outPath = path.join(outDir, `${appName}-${Date.now()}.md`);
      await fs.writeFile(outPath, composition.principleAlignment.principleDocument, 'utf-8');
      console.error(`✅ Composición guardada en ${outPath}`);
    }
  }

  console.error('🎉 Flujos reales completados');
}

main().catch(err => {
  console.error('💥 Error ejecutando flujos reales:', err);
  process.exit(1);
}); 