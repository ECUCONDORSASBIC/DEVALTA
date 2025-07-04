#!/usr/bin/env node
// 📊 ANALIZADOR DE MÉTRICAS REALES DEVALTAMEDICA
// Extrae métricas reales del proyecto en lugar de datos simulados

const fs = require('fs');
const path = require('path');

class DevaltamedicaRealMetrics {
    constructor(options = {}) {
        this.projectRoot = process.cwd();
        this.silent = options.silent || false;
        this.metrics = {
            project: {},
            codebase: {},
            performance: {},
            security: {},
            medical: {},
            development: {}
        };
        
        this.init();
    }
    
    init() {
        if (!this.silent) {
            console.log('📊 ANALIZANDO MÉTRICAS REALES DE DEVALTAMEDICA');
            console.log('===============================================');
        }
        this.analyzeProject();
        this.analyzeCodebase();
        this.analyzeSecurity();
        this.analyzeMedical();
        this.analyzeDevelopment();
    }
    
    analyzeProject() {
        if (!this.silent) {
            console.log('🔍 Analizando estructura del proyecto...');
        }
        
        // Leer package.json principal
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            this.metrics.project = {
                name: packageData.name || 'DEVALTAMEDICA',
                version: packageData.version || '1.0.0',
                description: packageData.description || 'Plataforma médica',
                type: packageData.type || 'module'
            };
        }
        
        // Analizar aplicaciones
        const appsDir = path.join(this.projectRoot, 'apps');
        if (fs.existsSync(appsDir)) {
            const apps = fs.readdirSync(appsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
                
            this.metrics.project.applications = apps;
            this.metrics.project.appCount = apps.length;
        }
        
        // Analizar packages
        const packagesDir = path.join(this.projectRoot, 'packages');
        if (fs.existsSync(packagesDir)) {
            const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
                
            this.metrics.project.packages = packages;
            this.metrics.project.packageCount = packages.length;
        }
        
        if (!this.silent) {
            console.log(`   ✅ Proyecto: ${this.metrics.project.name}`);
            console.log(`   📦 Aplicaciones: ${this.metrics.project.appCount || 0}`);
            console.log(`   🔧 Packages: ${this.metrics.project.packageCount || 0}`);
        }
    }
    
    analyzeCodebase() {
        if (!this.silent) {
            console.log('📈 Analizando base de código...');
        }
        
        // Contar archivos por tipo
        const fileStats = this.countFilesByType();
        this.metrics.codebase = fileStats;
        
        // Calcular métricas de complejidad
        this.metrics.codebase.complexity = this.calculateComplexity();
        
        if (!this.silent) {
            console.log(`   📄 Archivos TypeScript: ${fileStats.typescript || 0}`);
            console.log(`   ⚛️ Componentes React: ${fileStats.react || 0}`);
            console.log(`   🎨 Archivos CSS: ${fileStats.css || 0}`);
            console.log(`   📝 Documentación: ${fileStats.docs || 0}`);
        }
    }
    
    countFilesByType() {
        const stats = {
            typescript: 0,
            javascript: 0,
            react: 0,
            css: 0,
            docs: 0,
            config: 0,
            test: 0,
            total: 0
        };
        
        this.walkDirectory(this.projectRoot, (filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            const basename = path.basename(filePath).toLowerCase();
            
            stats.total++;
            
            if (ext === '.ts' || ext === '.tsx') {
                stats.typescript++;
                if (ext === '.tsx') stats.react++;
            } else if (ext === '.js' || ext === '.jsx') {
                stats.javascript++;
                if (ext === '.jsx') stats.react++;
            } else if (ext === '.css' || ext === '.scss' || ext === '.sass') {
                stats.css++;
            } else if (ext === '.md' || ext === '.mdx') {
                stats.docs++;
            } else if (basename.includes('config') || basename.includes('package.json')) {
                stats.config++;
            } else if (basename.includes('test') || basename.includes('spec')) {
                stats.test++;
            }
        });
        
        return stats;
    }
    
    calculateComplexity() {
        // Complejidad basada en estructura del proyecto
        const appCount = this.metrics.project.appCount || 0;
        const packageCount = this.metrics.project.packageCount || 0;
        const totalFiles = this.metrics.codebase.total || 0;
        
        let complexity = 'Simple';
        if (appCount > 5 || packageCount > 10 || totalFiles > 1000) {
            complexity = 'Alta';
        } else if (appCount > 2 || packageCount > 5 || totalFiles > 500) {
            complexity = 'Media';
        }
        
        return complexity;
    }
    
    analyzeSecurity() {
        if (!this.silent) {
            console.log('🛡️ Analizando configuración de seguridad...');
        }
        
        const security = {
            eslintConfigured: false,
            prettierConfigured: false,
            typescriptStrict: false,
            envExampleExists: false,
            gitignoreExists: false,
            securityScore: 0
        };
        
        // Verificar ESLint
        if (this.fileExists('.eslintrc.js') || this.fileExists('.eslintrc.json') || this.fileExists('eslint.config.js')) {
            security.eslintConfigured = true;
            security.securityScore += 20;
        }
        
        // Verificar Prettier
        if (this.fileExists('.prettierrc') || this.fileExists('prettier.config.js')) {
            security.prettierConfigured = true;
            security.securityScore += 15;
        }
        
        // Verificar TypeScript config
        const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
        if (fs.existsSync(tsconfigPath)) {
            try {
                const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
                if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict) {
                    security.typescriptStrict = true;
                    security.securityScore += 25;
                }
            } catch (e) {
                // Archivo corrupto
            }
        }
        
        // Verificar .env.example
        if (this.fileExists('.env.example')) {
            security.envExampleExists = true;
            security.securityScore += 20;
        }
        
        // Verificar .gitignore
        if (this.fileExists('.gitignore')) {
            security.gitignoreExists = true;
            security.securityScore += 20;
        }
        
        this.metrics.security = security;
        
        if (!this.silent) {
            console.log(`   🔒 Score de seguridad: ${security.securityScore}%`);
            console.log(`   ✅ ESLint: ${security.eslintConfigured ? 'Configurado' : 'No configurado'}`);
            console.log(`   📏 TypeScript Strict: ${security.typescriptStrict ? 'Sí' : 'No'}`);
        }
    }
    
    analyzeMedical() {
        if (!this.silent) {
            console.log('🏥 Analizando componentes médicos...');
        }
        
        const medical = {
            patientManagement: false,
            appointmentScheduling: false,
            medicalRecords: false,
            telemedicine: false,
            medicalTypes: false,
            hipaaCompliance: false,
            medicalScore: 0
        };
        
        // Verificar apps médicas
        const apps = this.metrics.project.applications || [];
        if (apps.includes('patients')) {
            medical.patientManagement = true;
            medical.medicalScore += 20;
        }
        if (apps.includes('medical')) {
            medical.medicalRecords = true;
            medical.medicalScore += 25;
        }
        if (apps.includes('admin')) {
            medical.medicalScore += 15;
        }
        
        // Verificar packages médicos
        const packages = this.metrics.project.packages || [];
        if (packages.includes('medical-types')) {
            medical.medicalTypes = true;
            medical.medicalScore += 20;
        }
        
        // Verificar archivos de compliance
        if (this.searchInFiles('HIPAA') || this.searchInFiles('compliance')) {
            medical.hipaaCompliance = true;
            medical.medicalScore += 20;
        }
        
        this.metrics.medical = medical;
        
        if (!this.silent) {
            console.log(`   🏥 Score médico: ${medical.medicalScore}%`);
            console.log(`   👥 Gestión de pacientes: ${medical.patientManagement ? 'Sí' : 'No'}`);
            console.log(`   📋 Tipos médicos: ${medical.medicalTypes ? 'Sí' : 'No'}`);
            console.log(`   🛡️ HIPAA Compliance: ${medical.hipaaCompliance ? 'Detectado' : 'No detectado'}`);
        }
    }
    
    analyzeDevelopment() {
        if (!this.silent) {
            console.log('⚙️ Analizando entorno de desarrollo...');
        }
        
        const development = {
            workspaceConfigured: false,
            monorepoStructure: false,
            scriptsCount: 0,
            testingConfigured: false,
            developmentScore: 0
        };
        
        // Verificar workspace
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packagePath)) {
            try {
                const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                if (packageData.workspaces) {
                    development.workspaceConfigured = true;
                    development.developmentScore += 25;
                }
                if (packageData.scripts) {
                    development.scriptsCount = Object.keys(packageData.scripts).length;
                    development.developmentScore += Math.min(25, development.scriptsCount * 3);
                }
            } catch (e) {
                // Error leyendo package.json
            }
        }
        
        // Verificar estructura monorepo
        if (fs.existsSync(path.join(this.projectRoot, 'apps')) && 
            fs.existsSync(path.join(this.projectRoot, 'packages'))) {
            development.monorepoStructure = true;
            development.developmentScore += 25;
        }
        
        // Verificar testing
        if (this.searchInFiles('vitest') || this.searchInFiles('jest') || this.fileExists('vitest.config.js')) {
            development.testingConfigured = true;
            development.developmentScore += 25;
        }
        
        this.metrics.development = development;
        
        if (!this.silent) {
            console.log(`   ⚙️ Score de desarrollo: ${development.developmentScore}%`);
            console.log(`   📦 Workspace: ${development.workspaceConfigured ? 'Configurado' : 'No configurado'}`);
            console.log(`   🏗️ Monorepo: ${development.monorepoStructure ? 'Sí' : 'No'}`);
            console.log(`   🧪 Testing: ${development.testingConfigured ? 'Configurado' : 'No configurado'}`);
        }
    }
    
    // Utilidades
    fileExists(filename) {
        return fs.existsSync(path.join(this.projectRoot, filename));
    }
    
    searchInFiles(searchTerm) {
        let found = false;
        try {
            this.walkDirectory(this.projectRoot, (filePath) => {
                if (found) return;
                const ext = path.extname(filePath).toLowerCase();
                if (['.js', '.ts', '.tsx', '.json', '.md'].includes(ext)) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
                            found = true;
                        }
                    } catch (e) {
                        // Error leyendo archivo
                    }
                }
            });
        } catch (e) {
            // Error en búsqueda
        }
        return found;
    }
    
    walkDirectory(dir, callback) {
        const skipDirs = ['node_modules', '.git', '.next', 'dist', 'coverage', 'logs'];
        
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory()) {
                    if (!skipDirs.includes(file.name)) {
                        this.walkDirectory(fullPath, callback);
                    }
                } else {
                    callback(fullPath);
                }
            }
        } catch (e) {
            // Error leyendo directorio
        }
    }
    
    getMetrics() {
        return this.metrics;
    }
    
    getRealPlatformMetrics() {
        // Generar métricas realistas basadas en el proyecto real
        const baseMetrics = {
            projectName: this.metrics.project.name || 'DEVALTAMEDICA',
            projectVersion: this.metrics.project.version || '1.0.0',
            applicationsCount: this.metrics.project.appCount || 0,
            packagesCount: this.metrics.project.packageCount || 0,
            
            // Métricas de desarrollo (basadas en análisis real)
            codeQuality: this.metrics.security.securityScore,
            medicalCompliance: this.metrics.medical.medicalScore,
            developmentScore: this.metrics.development.developmentScore,
            
            // Métricas técnicas estimadas (no simuladas)
            filesCount: this.metrics.codebase.total || 0,
            typescriptFiles: this.metrics.codebase.typescript || 0,
            reactComponents: this.metrics.codebase.react || 0,
            
            // Estado del proyecto
            hasWorkspace: this.metrics.development.workspaceConfigured,
            isMonorepo: this.metrics.development.monorepoStructure,
            hasTests: this.metrics.development.testingConfigured,
            hasESLint: this.metrics.security.eslintConfigured,
            hasMedicalTypes: this.metrics.medical.medicalTypes,
            hasPatientManagement: this.metrics.medical.patientManagement,
            
            // Métricas de tiempo real (no simuladas)
            timestamp: new Date().toISOString(),
            uptime: this.calculateUptime(),
            
            // Eliminar métricas simuladas que no existen
            activeUsers: null, // No tenemos usuarios reales
            apiResponseTime: null, // No hay API ejecutándose
            databasePerformance: null, // No hay DB activa
            errorRate: null // No hay errores que medir sin app ejecutándose
        };
        
        return baseMetrics;
    }
    
    calculateUptime() {
        // Uptime basado en cuándo se modificó por última vez el proyecto
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            if (fs.existsSync(packagePath)) {
                const stats = fs.statSync(packagePath);
                const now = Date.now();
                const modified = stats.mtime.getTime();
                const uptimeMs = now - modified;
                
                const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
                const days = Math.floor(hours / 24);
                
                if (days > 0) {
                    return `${days}d ${hours % 24}h`;
                } else {
                    return `${hours}h`;
                }
            }
        } catch (e) {
            // Error calculando uptime
        }
        
        return '0h';
    }
    
    generateReport() {
        const realMetrics = this.getRealPlatformMetrics();
        
        if (!this.silent) {
            console.log('\n📊 REPORTE DE MÉTRICAS REALES');
            console.log('=============================');
            
            console.log(`🏥 Proyecto: ${realMetrics.projectName} v${realMetrics.projectVersion}`);
            console.log(`📦 Aplicaciones: ${realMetrics.applicationsCount}`);
            console.log(`🔧 Packages: ${realMetrics.packagesCount}`);
            console.log(`📄 Archivos totales: ${realMetrics.filesCount}`);
            console.log(`⚛️ Componentes React: ${realMetrics.reactComponents}`);
            console.log('');
            console.log('📈 SCORES REALES:');
            console.log(`🔒 Calidad de código: ${realMetrics.codeQuality}%`);
            console.log(`🏥 Compliance médico: ${realMetrics.medicalCompliance}%`);
            console.log(`⚙️ Desarrollo: ${realMetrics.developmentScore}%`);
            console.log('');
            console.log('✅ CARACTERÍSTICAS:');
            console.log(`📦 Workspace: ${realMetrics.hasWorkspace ? 'Sí' : 'No'}`);
            console.log(`🏗️ Monorepo: ${realMetrics.isMonorepo ? 'Sí' : 'No'}`);
            console.log(`🧪 Testing: ${realMetrics.hasTests ? 'Sí' : 'No'}`);
            console.log(`🏥 Tipos médicos: ${realMetrics.hasMedicalTypes ? 'Sí' : 'No'}`);
            console.log(`👥 Gestión pacientes: ${realMetrics.hasPatientManagement ? 'Sí' : 'No'}`);
        }
        
        return realMetrics;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    // Verificar si se solicita salida JSON únicamente
    const isJsonOutput = process.argv.includes('--json');
    
    const analyzer = new DevaltamedicaRealMetrics({ silent: isJsonOutput });
    
    if (isJsonOutput) {
        // Solo imprimir JSON sin logs adicionales
        const metrics = analyzer.getRealPlatformMetrics();
        console.log(JSON.stringify(metrics, null, 2));
    } else {
        // Comportamiento normal con reporte completo
        const metrics = analyzer.generateReport();
        
        // Guardar métricas en archivo
        const outputPath = path.join(process.cwd(), 'logs', 'real-metrics.json');
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
        console.log(`\n💾 Métricas guardadas en: ${outputPath}`);
    }
}

module.exports = DevaltamedicaRealMetrics;
