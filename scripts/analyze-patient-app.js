// scripts/analyze-patient-app.js
// Script de análisis exhaustivo para la app de pacientes

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PatientAppAnalyzer {
  constructor() {
    this.basePath = path.join(process.cwd(), "apps/patients");
    this.results = {
      estructura: {},
      dependencias: {},
      conflictos: [],
      recomendaciones: [],
      metricas: {},
    };
  }

  // 1. Análisis de estructura de archivos (versión compatible con Windows)
  analizarEstructura() {
    console.log("📁 Analizando estructura de archivos...\n");

    const contarArchivos = (dir, extension) => {
      if (!fs.existsSync(dir)) {
        return 0;
      }
      let count = 0;
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          count += contarArchivos(fullPath, extension);
        } else if (file.name.endsWith(`.${extension}`)) {
          count++;
        }
      }
      return count;
    };

    this.results.estructura = {
      componentes: contarArchivos(
        path.join(this.basePath, "src/components"),
        "tsx"
      ),
      paginas: contarArchivos(path.join(this.basePath, "src/app"), "tsx"),
      hooks: contarArchivos(path.join(this.basePath, "src/hooks"), "ts"),
      servicios: contarArchivos(path.join(this.basePath, "src/services"), "ts"),
      estilos: contarArchivos(path.join(this.basePath, "src"), "css"),
      tests: contarArchivos(path.join(this.basePath, "src"), "test.ts"),
    };

    console.log("Estructura actual:");
    Object.entries(this.results.estructura).forEach(([tipo, cantidad]) => {
      console.log(`  ${tipo}: ${cantidad} archivos`);
    });
  }

  // 2. Análisis de dependencias
  analizarDependencias() {
    console.log("\n📦 Analizando dependencias...\n");

    const packagePath = path.join(this.basePath, "package.json");

    if (!fs.existsSync(packagePath)) {
      this.results.conflictos.push(
        "❌ No se encontró package.json en apps/patients"
      );
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    const dependenciasCriticas = {
      react: "^18.0.0 o ^19.0.0",
      next: "^14.0.0 o ^15.0.0",
      tailwindcss: "^3.4.0",
      "@altamedica/ui": "workspace:*",
      "@altamedica/shared": "workspace:*",
    };

    this.results.dependencias = {
      instaladas: Object.keys(packageJson.dependencies || {}),
      desarrollo: Object.keys(packageJson.devDependencies || {}),
      faltantes: [],
      versiones: {},
    };

    Object.entries(dependenciasCriticas).forEach(([dep, versionEsperada]) => {
      const versionActual =
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];

      if (!versionActual) {
        this.results.dependencias.faltantes.push(dep);
        this.results.conflictos.push(`❌ Falta dependencia crítica: ${dep}`);
      } else {
        this.results.dependencias.versiones[dep] = versionActual;
      }
    });

    console.log(
      "Dependencias instaladas:",
      this.results.dependencias.instaladas.length
    );
    console.log("Dependencias faltantes:", this.results.dependencias.faltantes);
  }

  // 3. Análisis de conflictos de Tailwind
  analizarTailwind() {
    console.log("\n🎨 Analizando configuración de Tailwind...\n");

    const archivosConfig = [
      {
        path: path.join(this.basePath, "tailwind.config.js"),
        tipo: "local",
      },
      {
        path: path.join(this.basePath, "postcss.config.js"),
        tipo: "postcss",
      },
      {
        path: path.join(process.cwd(), "tailwind.config.js"),
        tipo: "raiz",
      },
    ];

    archivosConfig.forEach(({ path: archivo, tipo }) => {
      if (fs.existsSync(archivo)) {
        console.log(`✅ Encontrado: ${tipo} config`);

        if (tipo === "postcss") {
          const contenido = fs.readFileSync(archivo, "utf8");
          if (contenido.includes("../../tailwind.config.js")) {
            this.results.conflictos.push(
              "⚠️  PostCSS usa config de raíz - posibles conflictos de estilos"
            );
          }
        }
      } else if (tipo === "local") {
        this.results.conflictos.push(
          "⚠️  No hay tailwind.config.js local - usando config global"
        );
      }
    });

    const globalsPath = path.join(this.basePath, "src/app/globals.css");
    if (fs.existsSync(globalsPath)) {
      const contenido = fs.readFileSync(globalsPath, "utf8");
      const tieneTailwind = contenido.includes("@tailwind");
      console.log(
        `Globals.css tiene directivas Tailwind: ${tieneTailwind ? "✅" : "❌"}`
      );
    }
  }

  // 4. Análisis de código y métricas (versión compatible con Windows)
  analizarCodigo() {
    console.log("\n📊 Analizando métricas de código...\n");

    try {
      let totalLineasTSX = 0;
      const componentesGrandes = [];

      const analizarArchivosRecursivo = (dir) => {
        if (!fs.existsSync(dir)) return;

        const archivos = fs.readdirSync(dir, { withFileTypes: true });

        for (const archivo of archivos) {
          const rutaCompleta = path.join(dir, archivo.name);

          if (archivo.isDirectory()) {
            analizarArchivosRecursivo(rutaCompleta);
          } else if (archivo.name.endsWith(".tsx")) {
            const contenido = fs.readFileSync(rutaCompleta, "utf8");
            const lineas = contenido.split("\n").length;
            totalLineasTSX += lineas;

            if (lineas > 350) {
              componentesGrandes.push({
                archivo: archivo.name,
                lineas: lineas,
                ruta: rutaCompleta.replace(process.cwd(), "."),
              });
            }
          }
        }
      };

      analizarArchivosRecursivo(path.join(this.basePath, "src"));

      this.results.metricas = {
        lineasTotales: totalLineasTSX,
        componentesGrandes: componentesGrandes,
        complejidadPromedio: "Media",
      };

      console.log(
        `Total líneas de código TSX: ${this.results.metricas.lineasTotales}`
      );
      console.log(`Componentes > 350 líneas: ${componentesGrandes.length}`);

      if (componentesGrandes.length > 0) {
        this.results.recomendaciones.push(
          "📝 Considerar dividir componentes grandes en módulos más pequeños"
        );
        componentesGrandes.forEach((comp) => {
          console.log(`  - ${comp.archivo}: ${comp.lineas} líneas`);
        });
      }
    } catch (e) {
      console.log("⚠️  No se pudieron obtener métricas completas", e);
    }
  }

  // 5. Generar recomendaciones
  generarRecomendaciones() {
    console.log("\n💡 Generando recomendaciones...\n");

    if (this.results.dependencias.faltantes.length > 0) {
      this.results.recomendaciones.push(
        "1. Instalar dependencias faltantes con: pnpm install"
      );
    }

    if (!fs.existsSync(path.join(this.basePath, "tailwind.config.js"))) {
      this.results.recomendaciones.push(
        "2. Crear configuración Tailwind local para evitar conflictos"
      );
    }

    if (this.results.estructura.tests === 0) {
      this.results.recomendaciones.push(
        "3. Agregar tests unitarios para componentes críticos"
      );
    }

    if (this.results.metricas.componentesGrandes.length > 2) {
      this.results.recomendaciones.push(
        "4. Refactorizar componentes grandes siguiendo el principio 350-L"
      );
    }

    this.results.recomendaciones.push(
      "\n🎯 Orden de prioridad sugerido:",
      "   Alta: Resolver conflictos de Tailwind",
      "   Alta: Completar módulos faltantes del MVP",
      "   Media: Agregar tests",
      "   Baja: Optimizar componentes grandes"
    );
  }

  // 6. Generar reporte completo
  generarReporte() {
    console.log("\n" + "=".repeat(60));
    console.log("📋 REPORTE DE ANÁLISIS - APP PACIENTES");
    console.log("=".repeat(60) + "\n");

    console.log("🚨 CONFLICTOS DETECTADOS:");
    if (this.results.conflictos.length === 0) {
      console.log("  ✅ No se detectaron conflictos críticos");
    } else {
      this.results.conflictos.forEach((conflicto) => {
        console.log(`  ${conflicto}`);
      });
    }

    console.log("\n💡 RECOMENDACIONES:");
    this.results.recomendaciones.forEach((rec) => {
      console.log(`  ${rec}`);
    });

    const reportePath = path.join(
      process.cwd(),
      "logs",
      "patient-app-analysis.json"
    );
    fs.mkdirSync(path.dirname(reportePath), { recursive: true });
    fs.writeFileSync(reportePath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Reporte completo guardado en: ${reportePath}`);
  }

  // Ejecutar análisis completo
  ejecutar() {
    console.log("🔍 Iniciando análisis completo de la app de pacientes...\n");

    this.analizarEstructura();
    this.analizarDependencias();
    this.analizarTailwind();
    this.analizarCodigo();
    this.generarRecomendaciones();
    this.generarReporte();
  }
}

if (require.main === module) {
  const analyzer = new PatientAppAnalyzer();
  analyzer.ejecutar();
}

module.exports = PatientAppAnalyzer;
