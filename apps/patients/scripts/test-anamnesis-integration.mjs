/**
 * Script de Prueba para Integración de Anamnesis - Altamedica
 * Prueba la funcionalidad completa de importación de anamnesis
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Iniciando pruebas de integración de anamnesis...\n');

// Datos de prueba simulados del juego de anamnesis
const datosPruebaAnamnesis = {
  nombre: 'María González',
  edad: '28',
  genero: 'Femenino',
  'estado-civil': 'Soltera',
  ocupacion: 'Diseñadora gráfica',
  'diabetes-familiar': false,
  'hipertension-familiar': true,
  'cancer-familiar': false,
  'enfermedades-cardiovasculares': false,
  'otras-enfermedades-familiares': '',
  alergias: true,
  'alergias-descripcion': 'Penicilina y polen',
  'cirugias-previas': false,
  'medicamentos-actuales': true,
  'medicamentos-lista': 'Paracetamol ocasional',
  fuma: false,
  alcohol: true,
  ejercicio: true,
  dieta: 'Equilibrada',
  sueno: '7',
  'motivo-consulta': 'Dolor de cabeza frecuente y fatiga',
  'duracion-sintomas': '3 semanas',
  'intensidad-dolor': '6',
  'factores-agravantes': 'Estrés laboral y falta de sueño',
  'factores-mejorantes': 'Descanso y relajación',
  'sintomas-asociados': 'Fatiga, irritabilidad, dificultad para concentrarse',
  'inicio-sintomas': 'Hace 3 semanas',
  'evolucion-sintomas': 'Progresivo',
  'sistema-cardiovascular': 'Normal',
  'sistema-respiratorio': 'Normal',
  'sistema-digestivo': 'Normal',
  'sistema-neurologico': 'Dolor de cabeza, fatiga',
  'sistema-musculoesqueletico': 'Normal'
};

// Función para simular una llamada a la API
async function probarAPIAnamnesis() {
  console.log('📡 Probando API de anamnesis...');
  
  try {
    // Simular llamada POST para importar anamnesis
    const response = await fetch('http://localhost:3002/api/v1/anamnesis/importar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        anamnesis: {
          pacienteId: 'test-paciente-123',
          doctorId: 'test-doctor-456',
          estado: 'completada',
          datos: {
            nombre: datosPruebaAnamnesis.nombre,
            edad: datosPruebaAnamnesis.edad,
            genero: datosPruebaAnamnesis.genero,
            estadoCivil: datosPruebaAnamnesis['estado-civil'],
            ocupacion: datosPruebaAnamnesis.ocupacion,
            antecedentesFamiliares: {
              diabetes: datosPruebaAnamnesis['diabetes-familiar'],
              hipertension: datosPruebaAnamnesis['hipertension-familiar'],
              cancer: datosPruebaAnamnesis['cancer-familiar'],
              enfermedadesCardiovasculares: datosPruebaAnamnesis['enfermedades-cardiovasculares'],
              otrasEnfermedades: datosPruebaAnamnesis['otras-enfermedades-familiares']
            },
            alergias: datosPruebaAnamnesis.alergias,
            alergiasDescripcion: datosPruebaAnamnesis['alergias-descripcion'],
            cirugiasPrevias: datosPruebaAnamnesis['cirugias-previas'],
            medicamentosActuales: datosPruebaAnamnesis['medicamentos-actuales'],
            medicamentosLista: datosPruebaAnamnesis['medicamentos-lista'],
            fuma: datosPruebaAnamnesis.fuma,
            alcohol: datosPruebaAnamnesis.alcohol,
            ejercicio: datosPruebaAnamnesis.ejercicio,
            dieta: datosPruebaAnamnesis.dieta,
            sueno: datosPruebaAnamnesis.sueno,
            motivoConsulta: datosPruebaAnamnesis['motivo-consulta'],
            duracionSintomas: datosPruebaAnamnesis['duracion-sintomas'],
            intensidadDolor: datosPruebaAnamnesis['intensidad-dolor'],
            factoresAgravantes: datosPruebaAnamnesis['factores-agravantes'],
            factoresMejorantes: datosPruebaAnamnesis['factores-mejorantes'],
            sintomasAsociados: datosPruebaAnamnesis['sintomas-asociados'],
            inicioSintomas: datosPruebaAnamnesis['inicio-sintomas'],
            evolucionSintomas: datosPruebaAnamnesis['evolucion-sintomas'],
            sistemaCardiovascular: datosPruebaAnamnesis['sistema-cardiovascular'],
            sistemaRespiratorio: datosPruebaAnamnesis['sistema-respiratorio'],
            sistemaDigestivo: datosPruebaAnamnesis['sistema-digestivo'],
            sistemaNeurologico: datosPruebaAnamnesis['sistema-neurologico'],
            sistemaMusculoesqueletico: datosPruebaAnamnesis['sistema-musculoesqueletico']
          }
        },
        fuente: 'anamnesis_juego',
        metadata: {
          importadoEn: new Date().toISOString(),
          version: '1.0.0',
          origen: 'juego_anamnesis',
          test: true
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API de anamnesis funcionando correctamente');
      console.log('📊 Datos importados:', {
        id: result.data.id,
        pacienteId: result.data.pacienteId,
        estado: result.data.estado,
        calidad: result.data.validacion?.calidad || 'N/A',
        urgencia: result.data.analisis?.urgencia || 'N/A'
      });
      return result.data;
    } else {
      console.log('❌ Error en API:', response.status, response.statusText);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Error al probar API:', error.message);
    return null;
  }
}

// Función para verificar la estructura de archivos
function verificarEstructuraArchivos() {
  console.log('📁 Verificando estructura de archivos...');
  
  const archivosRequeridos = [
    'src/services/anamnesis-service.ts',
    'src/components/AnamnesisCard.tsx',
    'src/components/AnamnesisStats.tsx',
    'src/hooks/useAnamnesis.ts',
    'src/app/api/v1/anamnesis/route.ts',
    'src/app/api/v1/anamnesis/importar/route.ts',
    'src/app/api/v1/anamnesis/paciente/[id]/route.ts',
    'src/app/api/v1/anamnesis/paciente/[id]/resumen/route.ts'
  ];
  
  let todosExisten = true;
  
  archivosRequeridos.forEach(archivo => {
    const rutaCompleta = path.join(__dirname, '..', archivo);
    if (fs.existsSync(rutaCompleta)) {
      console.log(`✅ ${archivo}`);
    } else {
      console.log(`❌ ${archivo} - NO ENCONTRADO`);
      todosExisten = false;
    }
  });
  
  return todosExisten;
}

// Función para verificar dependencias
function verificarDependencias() {
  console.log('📦 Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );
    
    const dependenciasRequeridas = [
      'next',
      'react',
      'react-dom',
      'lucide-react'
    ];
    
    let todasExisten = true;
    
    dependenciasRequeridas.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`✅ ${dep}`);
      } else {
        console.log(`❌ ${dep} - NO ENCONTRADA`);
        todasExisten = false;
      }
    });
    
    return todasExisten;
    
  } catch (error) {
    console.log('❌ Error al verificar dependencias:', error.message);
    return false;
  }
}

// Función para generar reporte
function generarReporte(resultados) {
  console.log('\n📋 REPORTE DE PRUEBAS DE INTEGRACIÓN');
  console.log('=====================================');
  
  const reporte = {
    fecha: new Date().toISOString(),
    estructuraArchivos: resultados.estructuraArchivos,
    dependencias: resultados.dependencias,
    apiFuncionando: resultados.apiFuncionando,
    datosPrueba: resultados.datosPrueba
  };
  
  console.log('📅 Fecha:', reporte.fecha);
  console.log('📁 Estructura de archivos:', reporte.estructuraArchivos ? '✅ OK' : '❌ FALLA');
  console.log('📦 Dependencias:', reporte.dependencias ? '✅ OK' : '❌ FALLA');
  console.log('📡 API funcionando:', reporte.apiFuncionando ? '✅ OK' : '❌ FALLA');
  
  if (reporte.datosPrueba) {
    console.log('📊 Datos de prueba importados:', {
      id: reporte.datosPrueba.id,
      pacienteId: reporte.datosPrueba.pacienteId,
      estado: reporte.datosPrueba.estado
    });
  }
  
  // Guardar reporte en archivo
  const reportePath = path.join(__dirname, 'reporte-anamnesis.json');
  fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
  console.log('\n💾 Reporte guardado en:', reportePath);
  
  return reporte;
}

// Función principal
async function ejecutarPruebas() {
  const resultados = {
    estructuraArchivos: false,
    dependencias: false,
    apiFuncionando: false,
    datosPrueba: null
  };
  
  try {
    // 1. Verificar estructura de archivos
    resultados.estructuraArchivos = verificarEstructuraArchivos();
    console.log('');
    
    // 2. Verificar dependencias
    resultados.dependencias = verificarDependencias();
    console.log('');
    
    // 3. Probar API (solo si el servidor está corriendo)
    console.log('⚠️  Nota: Para probar la API, asegúrate de que el servidor esté corriendo en puerto 3002');
    console.log('   Comando: pnpm --filter "./apps/patients" run dev\n');
    
    // Intentar probar la API
    const datosPrueba = await probarAPIAnamnesis();
    resultados.apiFuncionando = datosPrueba !== null;
    resultados.datosPrueba = datosPrueba;
    
    // 4. Generar reporte
    const reporte = generarReporte(resultados);
    
    // 5. Resumen final
    console.log('\n🎯 RESUMEN FINAL');
    console.log('================');
    
    const exitoso = resultados.estructuraArchivos && resultados.dependencias;
    
    if (exitoso) {
      console.log('✅ Integración de anamnesis configurada correctamente');
      console.log('🚀 Puedes usar la funcionalidad de anamnesis en el dashboard');
    } else {
      console.log('❌ Hay problemas en la configuración');
      console.log('🔧 Revisa los errores anteriores');
    }
    
    if (resultados.apiFuncionando) {
      console.log('📡 API funcionando correctamente');
    } else {
      console.log('⚠️  API no disponible - asegúrate de que el servidor esté corriendo');
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas
ejecutarPruebas(); 