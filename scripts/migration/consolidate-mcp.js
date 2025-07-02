#!/usr/bin/env node

/**
 * 🔧 CONSOLIDADOR MCP - MIGRACIÓN ARQUITECTÓNICA
 * 
 * Este script consolida los archivos MCP duplicados entre tools/ y mcp-protected/
 * en una estructura unificada en platform/tools/.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class MCPConsolidator {
    constructor() {
        this.stats = {
            filesProcessed: 0,
            filesConsolidated: 0,
            duplicatesRemoved: 0,
            errors: []
        };

        this.sourceDirs = [
            path.join(projectRoot, 'tools'),
            path.join(projectRoot, 'mcp-protected')
        ];

        this.targetDir = path.join(projectRoot, 'platform', 'tools');
    }

    log(message, type = 'info') {
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            consolidation: '🔧'
        }[type];

        console.log(`${prefix} ${message}`);
    }

    async consolidate() {
        this.log('🔧 INICIANDO CONSOLIDACIÓN MCP...', 'info');

        try {
            // 1. Crear directorio de destino
            await fs.mkdir(this.targetDir, { recursive: true });
            this.log(`📁 Directorio de destino creado: ${this.targetDir}`, 'success');

            // 2. Analizar archivos MCP existentes
            const mcpFiles = await this.findMCPFiles();
            this.log(`📁 Encontrados ${mcpFiles.length} archivos MCP`, 'success');

            // 3. Agrupar archivos por nombre
            const fileGroups = this.groupFilesByName(mcpFiles);
            this.log(`📊 Agrupados en ${Object.keys(fileGroups).length} grupos`, 'success');

            // 4. Consolidar cada grupo
            for (const [baseName, files] of Object.entries(fileGroups)) {
                await this.consolidateFileGroup(baseName, files);
            }

            // 5. Limpiar directorios originales
            await this.cleanupSourceDirectories();

            // 6. Crear índice consolidado
            await this.createConsolidatedIndex();

            // 7. Verificar consolidación
            await this.verifyConsolidation();

            this.log('🎉 CONSOLIDACIÓN MCP COMPLETADA!', 'success');
            this.printSummary();

            return {
                success: true,
                stats: this.stats
            };

        } catch (error) {
            this.log(`❌ Error durante consolidación: ${error.message}`, 'error');
            this.stats.errors.push(error.message);
            return {
                success: false,
                error: error.message,
                stats: this.stats
            };
        }
    }

    async findMCPFiles() {
        const mcpFiles = [];

        for (const sourceDir of this.sourceDirs) {
            if (await this.exists(sourceDir)) {
                const files = await this.findFiles(sourceDir, '*.js');
                const mcpFilesInDir = files.filter(file =>
                    file.includes('mcp') ||
                    file.includes('MCP') ||
                    file.includes('server')
                );
                mcpFiles.push(...mcpFilesInDir);
            }
        }

        return mcpFiles;
    }

    groupFilesByName(files) {
        const groups = {};

        for (const file of files) {
            const baseName = path.basename(file, path.extname(file));
            if (!groups[baseName]) {
                groups[baseName] = [];
            }
            groups[baseName].push(file);
        }

        return groups;
    }

    async consolidateFileGroup(baseName, files) {
        this.log(`🔧 Consolidando grupo: ${baseName}`, 'consolidation');

        if (files.length === 1) {
            // Solo un archivo, mover directamente
            await this.moveFile(files[0], baseName);
            this.stats.filesConsolidated++;
        } else {
            // Múltiples archivos, analizar y consolidar
            await this.mergeFiles(files, baseName);
            this.stats.duplicatesRemoved += files.length - 1;
        }

        this.stats.filesProcessed += files.length;
    }

    async moveFile(sourcePath, baseName) {
        const targetPath = path.join(this.targetDir, `${baseName}.js`);

        try {
            const content = await fs.readFile(sourcePath, 'utf8');
            await fs.writeFile(targetPath, content);

            this.log(`📄 Movido: ${path.relative(projectRoot, sourcePath)} → ${path.relative(projectRoot, targetPath)}`, 'success');
        } catch (error) {
            this.log(`⚠️ Error moviendo ${sourcePath}: ${error.message}`, 'warning');
            this.stats.errors.push(`Error moving ${sourcePath}: ${error.message}`);
        }
    }

    async mergeFiles(files, baseName) {
        this.log(`🔄 Fusionando ${files.length} archivos para: ${baseName}`, 'consolidation');

        const targetPath = path.join(this.targetDir, `${baseName}.js`);
        let mergedContent = '';
        let header = `/**
 * 🔧 ARCHIVO CONSOLIDADO - ${baseName.toUpperCase()}
 * 
 * Este archivo fue consolidado automáticamente durante la migración arquitectónica.
 * Combina funcionalidades de múltiples versiones del mismo archivo.
 * 
 * Archivos originales:
${files.map(f => ` * - ${path.relative(projectRoot, f)}`).join('\n')}
 * 
 * Fecha de consolidación: ${new Date().toISOString()}
 */\n\n`;

        // Leer y analizar todos los archivos
        const fileContents = [];
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                fileContents.push({
                    path: file,
                    content: content,
                    size: content.length,
                    hasExports: content.includes('module.exports') || content.includes('export'),
                    hasClasses: content.includes('class '),
                    hasFunctions: content.includes('function ')
                });
            } catch (error) {
                this.log(`⚠️ Error leyendo ${file}: ${error.message}`, 'warning');
            }
        }

        // Estrategia de consolidación
        if (fileContents.length === 0) {
            this.log(`❌ No se pudieron leer archivos para ${baseName}`, 'error');
            return;
        }

        // Si solo hay un archivo válido, usarlo
        if (fileContents.length === 1) {
            mergedContent = fileContents[0].content;
        } else {
            // Estrategia de consolidación inteligente
            mergedContent = this.intelligentMerge(fileContents);
        }

        // Escribir archivo consolidado
        try {
            await fs.writeFile(targetPath, header + mergedContent);
            this.log(`📄 Consolidado: ${path.relative(projectRoot, targetPath)}`, 'success');
        } catch (error) {
            this.log(`❌ Error escribiendo archivo consolidado: ${error.message}`, 'error');
            this.stats.errors.push(`Error writing consolidated file: ${error.message}`);
        }
    }

    intelligentMerge(fileContents) {
        // Ordenar por tamaño (preferir archivos más grandes/completos)
        fileContents.sort((a, b) => b.size - a.size);

        // Tomar el archivo más completo como base
        let baseContent = fileContents[0].content;

        // Buscar funciones o clases únicas en otros archivos
        for (let i = 1; i < fileContents.length; i++) {
            const current = fileContents[i];
            const uniqueFunctions = this.extractUniqueFunctions(current.content, baseContent);

            if (uniqueFunctions.length > 0) {
                baseContent += '\n\n// Funciones adicionales del archivo: ' + path.basename(current.path) + '\n';
                baseContent += uniqueFunctions.join('\n\n');
            }
        }

        return baseContent;
    }

    extractUniqueFunctions(content, baseContent) {
        const functions = [];
        const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*function|class\s+(\w+))/g;

        let match;
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3];

            if (functionName && !baseContent.includes(functionName)) {
                // Extraer la función completa
                const functionStart = content.lastIndexOf('function', match.index);
                const classStart = content.lastIndexOf('class', match.index);
                const start = Math.max(functionStart, classStart);

                if (start !== -1) {
                    const functionEnd = this.findFunctionEnd(content, start);
                    if (functionEnd !== -1) {
                        functions.push(content.substring(start, functionEnd));
                    }
                }
            }
        }

        return functions;
    }

    findFunctionEnd(content, start) {
        let braceCount = 0;
        let inString = false;
        let stringChar = '';

        for (let i = start; i < content.length; i++) {
            const char = content[i];

            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar) {
                inString = false;
            } else if (!inString) {
                if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        return i + 1;
                    }
                }
            }
        }

        return -1;
    }

    async cleanupSourceDirectories() {
        this.log('🧹 Limpiando directorios originales...', 'info');

        for (const sourceDir of this.sourceDirs) {
            if (await this.exists(sourceDir)) {
                try {
                    const files = await fs.readdir(sourceDir);
                    if (files.length === 0) {
                        await fs.rmdir(sourceDir);
                        this.log(`🗑️ Directorio vacío eliminado: ${path.relative(projectRoot, sourceDir)}`, 'success');
                    } else {
                        this.log(`⚠️ Directorio no vacío, mantener: ${path.relative(projectRoot, sourceDir)}`, 'warning');
                    }
                } catch (error) {
                    this.log(`⚠️ Error limpiando ${sourceDir}: ${error.message}`, 'warning');
                }
            }
        }
    }

    async createConsolidatedIndex() {
        const indexPath = path.join(this.targetDir, 'index.js');

        const indexContent = `/**
 * 🔧 ÍNDICE CONSOLIDADO MCP - ALTAMEDICA
 * 
 * Este archivo exporta todos los servidores MCP consolidados.
 * Generado automáticamente durante la migración arquitectónica.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-discovery de servidores MCP
async function discoverMCPServers() {
  const servers = {};
  
  try {
    const files = await fs.readdir(__dirname);
    const mcpFiles = files.filter(file => 
      file.endsWith('.js') && 
      file !== 'index.js' &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    );
    
    for (const file of mcpFiles) {
      const moduleName = path.basename(file, '.js');
      try {
        const module = await import(\`./\${file}\`);
        servers[moduleName] = module.default || module;
      } catch (error) {
        console.warn(\`⚠️ Error cargando MCP server \${file}:\`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error descubriendo servidores MCP:', error.message);
  }
  
  return servers;
}

// Exportar servidores descubiertos
const mcpServers = await discoverMCPServers();

export default mcpServers;
export { discoverMCPServers };
`;

        try {
            await fs.writeFile(indexPath, indexContent);
            this.log('📄 Índice consolidado creado', 'success');
        } catch (error) {
            this.log(`❌ Error creando índice: ${error.message}`, 'error');
        }
    }

    async verifyConsolidation() {
        this.log('🔍 Verificando consolidación...', 'info');

        try {
            const files = await fs.readdir(this.targetDir);
            const mcpFiles = files.filter(file => file.endsWith('.js'));

            this.log(`✅ Verificado: ${mcpFiles.length} archivos MCP consolidados`, 'success');

            // Verificar que no hay duplicados
            const fileNames = mcpFiles.map(f => path.basename(f, '.js'));
            const uniqueNames = [...new Set(fileNames)];

            if (fileNames.length === uniqueNames.length) {
                this.log('✅ Sin duplicados detectados', 'success');
            } else {
                this.log('⚠️ Posibles duplicados detectados', 'warning');
            }

        } catch (error) {
            this.log(`❌ Error en verificación: ${error.message}`, 'error');
        }
    }

    printSummary() {
        console.log('\n📊 RESUMEN DE CONSOLIDACIÓN MCP:');
        console.log('================================');
        console.log(`📁 Archivos procesados: ${this.stats.filesProcessed}`);
        console.log(`🔧 Archivos consolidados: ${this.stats.filesConsolidated}`);
        console.log(`🗑️ Duplicados eliminados: ${this.stats.duplicatesRemoved}`);
        console.log(`❌ Errores: ${this.stats.errors.length}`);
        console.log(`📂 Ubicación consolidada: platform/tools/`);

        if (this.stats.errors.length > 0) {
            console.log('\n⚠️ Errores encontrados:');
            this.stats.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }
    }

    async exists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    async findFiles(dir, pattern) {
        const files = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await this.findFiles(fullPath, pattern));
                } else if (entry.isFile() && entry.name.match(pattern)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignorar errores de acceso
        }

        return files;
    }
}

// Ejecutar consolidación
const consolidator = new MCPConsolidator();
consolidator.consolidate().then(result => {
    if (result.success) {
        console.log('\n🎉 CONSOLIDACIÓN MCP COMPLETADA EXITOSAMENTE');
        process.exit(0);
    } else {
        console.log('\n❌ ERROR EN LA CONSOLIDACIÓN');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 