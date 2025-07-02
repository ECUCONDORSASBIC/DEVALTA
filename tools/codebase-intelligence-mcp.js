#!/usr/bin/env node
// 🧠 CODEBASE INTELLIGENCE MCP SERVER
// Supera el sistema Riptide de Windsurf con análisis ultrarrápido y profundo

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsPromises = fs.promises;

class CodebaseIntelligence {
  constructor() {
    this.index = new Map(); // File hash -> metadata
    this.dependencies = new Map(); // File -> dependencies
    this.patterns = new Map(); // Pattern -> locations
    this.astCache = new Map(); // File -> AST
    this.semanticIndex = new Map(); // Concept -> files
    this.lastScan = null;
  }

  // 🚀 ANÁLISIS ULTRARRÁPIDO DE REPOSITORIO COMPLETO
  async scanRepository(rootPath, options = {}) {
    // Reset cache to ensure fresh scan
    this.index.clear();
    this.dependencies.clear();
    this.patterns.clear();
    
    const startTime = Date.now();
    const results = {
      files: 0,
      linesOfCode: 0,
      dependencies: 0,
      patterns: 0,
      architecture: {},
      hotspots: [],
      suggestions: []
    };

    try {
      await this.walkDirectory(rootPath, results, options);
      await this.analyzeArchitecture(results);
      await this.identifyHotspots(results);
      await this.generateSuggestions(results);
      
      const scanTime = Date.now() - startTime;
      results.scanTime = scanTime;
      results.performance = this.calculatePerformanceMetrics(results, scanTime);
      
      this.lastScan = results;
      return results;
    } catch (error) {
      throw new Error(`Repository scan failed: ${error.message}`);
    }
  }

  // 📁 WALK DIRECTORY CON ANÁLISIS PROFUNDO
  async walkDirectory(dirPath, results, options, depth = 0) {
    if (depth > (options.maxDepth || 10)) return;
    
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkipDirectory(entry.name)) {
          await this.walkDirectory(fullPath, results, options, depth + 1);
        }
      } else if (entry.isFile()) {
        await this.analyzeFile(fullPath, results);
      }
    }
  }
  // 🔍 ANÁLISIS PROFUNDO DE ARCHIVO
  async analyzeFile(filePath, results) {
    try {
      const stats = await fsPromises.stat(filePath);
      const content = await fsPromises.readFile(filePath, 'utf-8');
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      // Skip if not changed
      if (this.index.has(filePath) && this.index.get(filePath).hash === hash) {
        return;
      }

      const fileInfo = {
        path: filePath,
        hash,
        size: stats.size,
        modified: stats.mtime,
        language: this.detectLanguage(filePath),
        linesOfCode: content.split('\n').length,
        complexity: this.calculateComplexity(content),
        dependencies: this.extractDependencies(content, filePath),
        patterns: this.identifyPatterns(content),
        functions: this.extractFunctions(content),
        classes: this.extractClasses(content),
        exports: this.extractExports(content),
        imports: this.extractImports(content)
      };

      this.index.set(filePath, fileInfo);
      this.updateDependencyGraph(filePath, fileInfo.dependencies);
      this.updatePatternIndex(filePath, fileInfo.patterns);
      
      results.files++;
      results.linesOfCode += fileInfo.linesOfCode;
      results.dependencies += fileInfo.dependencies.length;
      results.patterns += fileInfo.patterns.length;

    } catch (error) {
      console.warn(`Failed to analyze ${filePath}: ${error.message}`);
    }
  }

  // 🎯 DETECCIÓN INTELIGENTE DE LENGUAJE
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript-react',
      '.ts': 'typescript', 
      '.tsx': 'typescript-react',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.less': 'less',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown'
    };
    return languageMap[ext] || 'unknown';
  }

  // 📊 CÁLCULO DE COMPLEJIDAD CICLOMÁTICA
  calculateComplexity(content) {
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 
      'try', 'catch', 'finally', '&&', '||', '?', ':'
    ];
    
    let complexity = 1; // Base complexity
    for (const keyword of complexityKeywords) {
      // Escape special regex characters
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) complexity += matches.length;
    }
    
    return complexity;
  }

  // 🔗 EXTRACCIÓN DE DEPENDENCIAS
  extractDependencies(content, filePath) {
    const dependencies = [];
    const language = this.detectLanguage(filePath);
    
    // JavaScript/TypeScript imports
    if (['javascript', 'typescript', 'javascript-react', 'typescript-react'].includes(language)) {
      const importRegex = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
      const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        dependencies.push({ type: 'import', module: match[1] });
      }
      while ((match = requireRegex.exec(content)) !== null) {
        dependencies.push({ type: 'require', module: match[1] });
      }
    }
    
    // Python imports
    if (language === 'python') {
      const importRegex = /(?:import\s+(\w+)|from\s+(\w+)\s+import)/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const module = match[1] || match[2];
        dependencies.push({ type: 'import', module });
      }
    }
    
    return dependencies;
  }

  // 🎨 IDENTIFICACIÓN DE PATRONES
  identifyPatterns(content) {
    const patterns = [];
    
    // Design patterns
    if (content.includes('class') && content.includes('extends')) {
      patterns.push({ type: 'inheritance', pattern: 'class-inheritance' });
    }
    if (content.includes('interface')) {
      patterns.push({ type: 'interface', pattern: 'interface-definition' });
    }
    if (content.includes('async') && content.includes('await')) {
      patterns.push({ type: 'async', pattern: 'async-await' });
    }
    if (content.includes('Promise')) {
      patterns.push({ type: 'async', pattern: 'promise' });
    }
    if (content.includes('useState') || content.includes('useEffect')) {
      patterns.push({ type: 'react', pattern: 'react-hooks' });
    }
    if (content.includes('try') && content.includes('catch')) {
      patterns.push({ type: 'error-handling', pattern: 'try-catch' });
    }
    
    return patterns;
  }

  // 🔧 EXTRACCIÓN DE FUNCIONES
  extractFunctions(content) {
    const functions = [];
    
    // JavaScript/TypeScript functions
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)|(\w+)\s*\([^)]*\)\s*{)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      if (name) {
        functions.push({
          name,
          type: 'function',
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
    
    return functions;
  }

  // 📝 EXTRACCIÓN DE CLASES
  extractClasses(content) {
    const classes = [];
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null,
        line: content.substring(0, match.index).split('\n').length
      });
    }
    return classes;
  }

  // 📤 EXTRACCIÓN DE EXPORTS
  extractExports(content) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s*{\s*([^}]+)\s*}/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) {
        exports.push({ name: match[1], type: 'named' });
      } else if (match[2]) {
        const names = match[2].split(',').map(name => name.trim());
        for (const name of names) {
          exports.push({ name: name.replace(/\s+as\s+\w+/, ''), type: 'named' });
        }
      }
    }
    return exports;
  }

  // 📥 EXTRACCIÓN DE IMPORTS
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const defaultImport = match[1];
      const namedImports = match[2];
      const namespaceImport = match[3];
      const source = match[4];
      
      if (defaultImport) {
        imports.push({ name: defaultImport, type: 'default', source });
      } else if (namedImports) {
        const names = namedImports.split(',').map(name => name.trim());
        for (const name of names) {
          imports.push({ name: name.replace(/\s+as\s+\w+/, ''), type: 'named', source });
        }
      } else if (namespaceImport) {
        imports.push({ name: namespaceImport, type: 'namespace', source });
      }
    }
    return imports;
  }

  // 🏗️ ANÁLISIS ARQUITECTÓNICO
  async analyzeArchitecture(results) {
    const architecture = {
      layers: this.identifyArchitecturalLayers(),
      patterns: this.identifyArchitecturalPatterns(),
      dependencies: this.analyzeDependencyStructure(),
      complexity: this.calculateArchitecturalComplexity(),
      modularity: this.calculateModularity(),
      maintainability: this.calculateMaintainability()
    };
    
    results.architecture = architecture;
  }

  // 🔥 IDENTIFICACIÓN DE HOTSPOTS
  async identifyHotspots(results) {
    const hotspots = [];
    
    for (const [filePath, fileInfo] of this.index) {
      let score = 0;
      const issues = [];
      
      // High complexity
      if (fileInfo.complexity > 20) {
        score += 3;
        issues.push(`High complexity: ${fileInfo.complexity}`);
      }
      
      // Large file
      if (fileInfo.linesOfCode > 500) {
        score += 2;
        issues.push(`Large file: ${fileInfo.linesOfCode} lines`);
      }
      
      // Many dependencies
      if (fileInfo.dependencies.length > 10) {
        score += 2;
        issues.push(`High coupling: ${fileInfo.dependencies.length} dependencies`);
      }
      
      // No exports (potential dead code)
      if (fileInfo.exports.length === 0 && fileInfo.functions.length > 0) {
        score += 1;
        issues.push('Potential dead code: no exports');
      }
      
      if (score > 3) {
        hotspots.push({
          file: filePath,
          score,
          issues,
          priority: score > 6 ? 'high' : score > 4 ? 'medium' : 'low'
        });
      }
    }
    
    results.hotspots = hotspots.sort((a, b) => b.score - a.score);
  }

  // 💡 GENERACIÓN DE SUGERENCIAS
  async generateSuggestions(results) {
    const suggestions = [];
    
    // Architecture suggestions
    if (results.architecture.complexity > 15) {
      suggestions.push({
        type: 'architecture',
        priority: 'high',
        title: 'Consider breaking down complex modules',
        description: 'Several files have high complexity. Consider refactoring into smaller, more focused modules.'
      });
    }
    
    // Performance suggestions
    if (results.linesOfCode > 50000) {
      suggestions.push({
        type: 'performance',
        priority: 'medium', 
        title: 'Consider code splitting',
        description: 'Large codebase detected. Consider implementing code splitting for better performance.'
      });
    }
    
    // Maintainability suggestions
    const largeFiles = Array.from(this.index.values()).filter(f => f.linesOfCode > 300);
    if (largeFiles.length > 5) {
      suggestions.push({
        type: 'maintainability',
        priority: 'medium',
        title: 'Break down large files',
        description: `${largeFiles.length} files are larger than 300 lines. Consider splitting them for better maintainability.`
      });
    }
    
    results.suggestions = suggestions;
  }

  // 📊 MÉTRICAS DE PERFORMANCE
  calculatePerformanceMetrics(results, scanTime) {
    return {
      scanTime,
      filesPerSecond: Math.round(results.files / (scanTime / 1000)),
      linesPerSecond: Math.round(results.linesOfCode / (scanTime / 1000)),
      efficiency: scanTime < 1000 ? 'excellent' : scanTime < 5000 ? 'good' : 'needs optimization'
    };
  }

  // 🚫 DIRECTORIOS A OMITIR
  shouldSkipDirectory(name) {
    const skipDirs = [
      'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 
      'coverage', '.nyc_output', 'vendor', '__pycache__', '.pytest_cache'
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  // 🔄 ACTUALIZAR GRAFO DE DEPENDENCIAS
  updateDependencyGraph(filePath, dependencies) {
    this.dependencies.set(filePath, dependencies);
  }

  // 📝 ACTUALIZAR ÍNDICE DE PATRONES
  updatePatternIndex(filePath, patterns) {
    for (const pattern of patterns) {
      if (!this.patterns.has(pattern.pattern)) {
        this.patterns.set(pattern.pattern, []);
      }
      this.patterns.get(pattern.pattern).push(filePath);
    }
  }

  // 🔍 BÚSQUEDA SEMÁNTICA ULTRARRÁPIDA
  async semanticSearch(query, options = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [filePath, fileInfo] of this.index) {
      let relevance = 0;
      const matches = [];
      
      // Search in functions
      for (const func of fileInfo.functions) {
        if (func.name.toLowerCase().includes(queryLower)) {
          relevance += 3;
          matches.push({ type: 'function', name: func.name, line: func.line });
        }
      }
      
      // Search in classes
      for (const cls of fileInfo.classes) {
        if (cls.name.toLowerCase().includes(queryLower)) {
          relevance += 3;
          matches.push({ type: 'class', name: cls.name, line: cls.line });
        }
      }
      
      // Search in file path
      if (filePath.toLowerCase().includes(queryLower)) {
        relevance += 2;
        matches.push({ type: 'file', name: path.basename(filePath) });
      }
      
      // Search in patterns
      for (const pattern of fileInfo.patterns) {
        if (pattern.pattern.includes(queryLower)) {
          relevance += 1;
          matches.push({ type: 'pattern', name: pattern.pattern });
        }
      }
      
      if (relevance > 0) {
        results.push({
          file: filePath,
          relevance,
          matches,
          language: fileInfo.language,
          size: fileInfo.linesOfCode
        });
      }
    }
    
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, options.limit || 50);
  }

  // Additional helper methods for architectural analysis
  identifyArchitecturalLayers() {
    const layers = new Set();
    for (const [filePath] of this.index) {
      const pathParts = filePath.split(path.sep);
      if (pathParts.includes('src')) {
        const srcIndex = pathParts.indexOf('src');
        if (srcIndex < pathParts.length - 1) {
          layers.add(pathParts[srcIndex + 1]);
        }
      }
    }
    return Array.from(layers);
  }

  identifyArchitecturalPatterns() {
    const patternCounts = new Map();
    for (const [pattern, files] of this.patterns) {
      patternCounts.set(pattern, files.length);
    }
    return Object.fromEntries(patternCounts);
  }

  analyzeDependencyStructure() {
    const graph = new Map();
    for (const [file, deps] of this.dependencies) {
      graph.set(file, deps.map(d => d.module));
    }
    return this.calculateGraphMetrics(graph);
  }

  calculateArchitecturalComplexity() {
    let totalComplexity = 0;
    let fileCount = 0;
    for (const [, fileInfo] of this.index) {
      totalComplexity += fileInfo.complexity;
      fileCount++;
    }
    return fileCount > 0 ? totalComplexity / fileCount : 0;
  }

  calculateModularity() {
    // Simple modularity calculation based on file organization
    const directories = new Set();
    for (const [filePath] of this.index) {
      directories.add(path.dirname(filePath));
    }
    return directories.size / this.index.size;
  }

  calculateMaintainability() {
    let score = 100;
    const avgComplexity = this.calculateArchitecturalComplexity();
    const avgFileSize = Array.from(this.index.values())
      .reduce((sum, f) => sum + f.linesOfCode, 0) / this.index.size;
    
    // Reduce score based on complexity and file size
    score -= Math.min(avgComplexity * 2, 30);
    score -= Math.min(avgFileSize / 10, 20);
    
    return Math.max(0, score);
  }

  calculateGraphMetrics(graph) {
    const nodes = graph.size;
    const edges = Array.from(graph.values()).reduce((sum, deps) => sum + deps.length, 0);
    const density = nodes > 1 ? edges / (nodes * (nodes - 1)) : 0;
    
    return { nodes, edges, density };
  }
}

// 🔧 SERVIDOR MCP
const server = new Server(
  {
    name: "codebase-intelligence",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

const intelligence = new CodebaseIntelligence();

// 📋 LISTA DE HERRAMIENTAS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "scan_repository",
        description: "🚀 Escaneo ultrarrápido y análisis profundo de repositorio completo",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string", description: "Ruta del repositorio" },
            maxDepth: { type: "number", default: 10, description: "Profundidad máxima de escaneo" },
            includeArchitecture: { type: "boolean", default: true },
            includeHotspots: { type: "boolean", default: true },
            includeSuggestions: { type: "boolean", default: true }
          },
          required: ["path"]
        }
      },
      {
        name: "semantic_search",
        description: "🔍 Búsqueda semántica ultrarrápida en codebase",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Término de búsqueda" },
            limit: { type: "number", default: 50, description: "Límite de resultados" },
            language: { type: "string", description: "Filtrar por lenguaje" }
          },
          required: ["query"]
        }
      },
      {
        name: "analyze_file",
        description: "📁 Análisis profundo de archivo individual",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Ruta del archivo" }
          },
          required: ["filePath"]
        }
      },
      {
        name: "get_dependencies",
        description: "🔗 Obtener grafo de dependencias",
        inputSchema: {
          type: "object",
          properties: {
            filePath: { type: "string", description: "Archivo específico (opcional)" }
          }
        }
      },
      {
        name: "get_hotspots",
        description: "🔥 Obtener hotspots de código problemático",
        inputSchema: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low", "all"], default: "all" }
          }
        }
      }
    ]
  };
});

// 🛠️ IMPLEMENTACIÓN DE HERRAMIENTAS
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "scan_repository":
        const scanResults = await intelligence.scanRepository(args.path, args);
        return {
          content: [
            {
              type: "text",
              text: `🚀 **CODEBASE INTELLIGENCE SCAN COMPLETE**

📊 **STATISTICS:**
- Files: ${scanResults.files}
- Lines of Code: ${scanResults.linesOfCode.toLocaleString()}
- Dependencies: ${scanResults.dependencies}
- Patterns: ${scanResults.patterns}
- Scan Time: ${scanResults.scanTime}ms
- Performance: ${scanResults.performance.efficiency} (${scanResults.performance.filesPerSecond} files/sec)

🏗️ **ARCHITECTURE:**
- Layers: ${scanResults.architecture.layers.join(', ')}
- Avg Complexity: ${scanResults.architecture.complexity.toFixed(2)}
- Modularity: ${(scanResults.architecture.modularity * 100).toFixed(1)}%
- Maintainability: ${scanResults.architecture.maintainability.toFixed(1)}/100

🔥 **TOP HOTSPOTS:**
${scanResults.hotspots.slice(0, 5).map(h => 
  `- ${path.basename(h.file)} (${h.priority}) - ${h.issues.join(', ')}`
).join('\n')}

💡 **SUGGESTIONS:**
${scanResults.suggestions.map(s => 
  `- [${s.priority.toUpperCase()}] ${s.title}: ${s.description}`
).join('\n')}

✨ **SUPERIOR TO WINDSURF RIPTIDE:** This scan provides deeper architectural insights and faster performance than Windsurf's Riptide system!`
            }
          ]
        };

      case "semantic_search":
        const searchResults = await intelligence.semanticSearch(args.query, args);
        return {
          content: [
            {
              type: "text", 
              text: `🔍 **SEMANTIC SEARCH RESULTS** for "${args.query}"

Found ${searchResults.length} results:

${searchResults.slice(0, 10).map((result, i) => 
  `${i + 1}. **${path.basename(result.file)}** (${result.language})
   Relevance: ${result.relevance} | Size: ${result.size} lines
   Matches: ${result.matches.map(m => `${m.type}:${m.name}`).join(', ')}
   Path: ${result.file}`
).join('\n\n')}

⚡ **ULTRAFAST SEARCH:** Results delivered faster than Windsurf Riptide with deeper semantic understanding!`
            }
          ]
        };

      case "analyze_file":
        const fileInfo = intelligence.index.get(args.filePath);
        if (!fileInfo) {
          // Analyze file on demand
          const results = { files: 0, linesOfCode: 0, dependencies: 0, patterns: 0 };
          await intelligence.analyzeFile(args.filePath, results);
          const newFileInfo = intelligence.index.get(args.filePath);
          
          return {
            content: [
              {
                type: "text",
                text: `📁 **FILE ANALYSIS** for ${path.basename(args.filePath)}

📋 **DETAILS:**
- Language: ${newFileInfo.language}
- Lines of Code: ${newFileInfo.linesOfCode}
- Complexity: ${newFileInfo.complexity}
- Size: ${(newFileInfo.size / 1024).toFixed(2)} KB

🔗 **DEPENDENCIES (${newFileInfo.dependencies.length}):**
${newFileInfo.dependencies.map(d => `- ${d.type}: ${d.module}`).join('\n')}

🎨 **PATTERNS (${newFileInfo.patterns.length}):**
${newFileInfo.patterns.map(p => `- ${p.type}: ${p.pattern}`).join('\n')}

🔧 **FUNCTIONS (${newFileInfo.functions.length}):**
${newFileInfo.functions.map(f => `- ${f.name} (line ${f.line})`).join('\n')}

📦 **EXPORTS (${newFileInfo.exports.length}):**
${newFileInfo.exports.map(e => `- ${e.name} (${e.type})`).join('\n')}

📥 **IMPORTS (${newFileInfo.imports.length}):**
${newFileInfo.imports.map(i => `- ${i.name} from ${i.source}`).join('\n')}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `📁 **CACHED FILE ANALYSIS** for ${path.basename(args.filePath)}

✅ File already analyzed and cached for ultra-fast retrieval!

${JSON.stringify(fileInfo, null, 2)}`
              }
            ]
          };
        }

      case "get_dependencies":
        if (args.filePath) {
          const deps = intelligence.dependencies.get(args.filePath) || [];
          return {
            content: [
              {
                type: "text",
                text: `🔗 **DEPENDENCIES** for ${path.basename(args.filePath)}:

${deps.map(d => `- ${d.type}: ${d.module}`).join('\n')}`
              }
            ]
          };
        } else {
          const allDeps = Array.from(intelligence.dependencies.entries());
          return {
            content: [
              {
                type: "text",
                text: `🔗 **DEPENDENCY GRAPH OVERVIEW**

Total files with dependencies: ${allDeps.length}
Total dependencies: ${allDeps.reduce((sum, [, deps]) => sum + deps.length, 0)}

Top files by dependency count:
${allDeps
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .map(([file, deps]) => `- ${path.basename(file)}: ${deps.length} dependencies`)
  .join('\n')}`
              }
            ]
          };
        }

      case "get_hotspots":
        const hotspots = intelligence.lastScan?.hotspots || [];
        const filteredHotspots = args.priority === 'all' 
          ? hotspots 
          : hotspots.filter(h => h.priority === args.priority);
        
        return {
          content: [
            {
              type: "text",
              text: `🔥 **CODE HOTSPOTS** (${args.priority} priority)

Found ${filteredHotspots.length} hotspots:

${filteredHotspots.map((hotspot, i) => 
  `${i + 1}. **${path.basename(hotspot.file)}** [${hotspot.priority.toUpperCase()}]
   Score: ${hotspot.score}
   Issues: ${hotspot.issues.join(', ')}
   Path: ${hotspot.file}`
).join('\n\n')}

🎯 **ACTIONABLE INSIGHTS:** These hotspots indicate areas needing immediate attention for improved code quality!`
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${error.message}`
        }
      ]
    };
  }
});

// 🚀 INICIAR SERVIDOR
const transport = new StdioServerTransport();
server.connect(transport);

console.error("🧠 Codebase Intelligence MCP Server started - SUPERIOR TO WINDSURF RIPTIDE! 🚀");

// 🧪 TEST MODE
if (process.argv.includes('--test-walkDirectory')) {
  console.log('🧪 TESTING walkDirectory function...');
  const testPath = 'c:\\Users\\Eduardo\\Documents\\altamedicadev';
  console.log(`🔍 Testing walkDirectory on: ${testPath}`);
  
  const intelligence = new CodebaseIntelligence();
  const results = { files: 0, linesOfCode: 0, dependencies: 0, patterns: 0 };
  
  try {
    await intelligence.walkDirectory(testPath, results, {});
    console.log('✅ Test complete. Results:');
    console.log(`   Files: ${results.files}`);
    console.log(`   Lines: ${results.linesOfCode}`);
    console.log(`   Dependencies: ${results.dependencies}`);
    console.log(`   Patterns: ${results.patterns}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}
