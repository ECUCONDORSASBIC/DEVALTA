/**
 * 🔥 FIRESTORE INTEGRATION VALIDATOR & OPTIMIZER
 * Herramienta para verificar y optimizar la integración con Firestore
 */

import { adminDb, adminAuth } from '@altamedica/firebase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'unknown';
  details: any;
  recommendations: string[];
}

interface DiagnosticResult {
  timestamp: string;
  tests: TestResult[];
  overall: string;
  performance: any;
  recommendations: any[];
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const diagnostics: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      tests: [],
      overall: 'unknown',
      performance: {},
      recommendations: [],
    };

    // Test 1: Verificar conexión básica
    diagnostics.tests.push(await testFirestoreConnection());
    
    // Test 2: Verificar operaciones CRUD
    diagnostics.tests.push(await testCrudOperations());
    
    // Test 3: Verificar autenticación
    diagnostics.tests.push(await testAuthentication());
    
    // Test 4: Verificar rendimiento
    diagnostics.tests.push(await testPerformance());

    // Calcular resultado general
    const passedTests = diagnostics.tests.filter((t: any) => t.status === 'pass').length;
    const totalTests = diagnostics.tests.length;
    
    if (passedTests === totalTests) {
      diagnostics.overall = 'excellent';
    } else if (passedTests >= totalTests * 0.8) {
      diagnostics.overall = 'good';
    } else if (passedTests >= totalTests * 0.6) {
      diagnostics.overall = 'fair';
    } else {
      diagnostics.overall = 'poor';
    }

    // Calcular métricas de rendimiento
    const totalTime = Date.now() - startTime;
    diagnostics.performance = {
      totalExecutionTime: `${totalTime}ms`,
      averageTestTime: `${Math.round(totalTime / totalTests)}ms`,
      testsExecuted: totalTests,
      testsPassedPercentage: Math.round((passedTests / totalTests) * 100),
    };

    // Generar recomendaciones
    diagnostics.recommendations = generateRecommendations(diagnostics.tests);

    return NextResponse.json({
      success: true,
      data: diagnostics,
      metadata: {
        engine: 'AltaMedica Firestore Diagnostics v1.0',
        executionTime: `${totalTime}ms`,
        status: diagnostics.overall,
      },
    });

  } catch (error: any) {
    console.error('Error en diagnóstico de Firestore:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'FIRESTORE_DIAGNOSTIC_ERROR',
        message: 'Error durante el diagnóstico de Firestore',
        details: error?.message || 'Unknown error',
      },
    }, { status: 500 });
  }
}

async function testFirestoreConnection(): Promise<TestResult> {
  const test: TestResult = {
    name: 'Firestore Connection',
    status: 'unknown',
    details: {},
    recommendations: [],
  };

  try {
    const startTime = Date.now();
    
    // Intentar crear y leer un documento de prueba
    const healthRef = adminDb.collection('health-checks').doc('connection-test');
    await healthRef.set({
      timestamp: new Date().toISOString(),
      source: 'firestore-diagnostic',
      test: 'connection',
    });
    
    const doc = await healthRef.get();
    
    if (doc.exists) {
      await healthRef.delete(); // Limpiar
      
      test.status = 'pass';
      test.details = {
        connectionTime: `${Date.now() - startTime}ms`,
        projectId: process.env.FIREBASE_PROJECT_ID,
        status: 'connected',
      };
    } else {
      throw new Error('Document not found after creation');
    }

  } catch (error: any) {
    test.status = 'fail';
    test.details = {
      error: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
    };
    (test.recommendations as any[]).push('Verificar configuración de Firebase Admin SDK');
    (test.recommendations as any[]).push('Verificar variables de entorno de Firebase');
  }

  return test;
}

async function testCrudOperations(): Promise<TestResult> {
  const test: TestResult = {
    name: 'CRUD Operations',
    status: 'unknown',
    details: {},
    recommendations: [],
  };

  try {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testData = {
      id: testId,
      name: 'Test Record',
      type: 'diagnostic',
      createdAt: new Date().toISOString(),
      data: {
        numbers: [1, 2, 3],
        nested: { value: 'test' },
      },
    };

    const collection = adminDb.collection('crud-tests');
    
    // CREATE
    const createStart = Date.now();
    await collection.doc(testId).set(testData);
    const createTime = Date.now() - createStart;

    // READ
    const readStart = Date.now();
    const readDoc = await collection.doc(testId).get();
    const readTime = Date.now() - readStart;

    if (!readDoc.exists) {
      throw new Error('Created document not found');
    }

    // UPDATE
    const updateStart = Date.now();
    await collection.doc(testId).update({
      updatedAt: new Date().toISOString(),
      status: 'updated',
    });
    const updateTime = Date.now() - updateStart;

    // DELETE
    const deleteStart = Date.now();
    await collection.doc(testId).delete();
    const deleteTime = Date.now() - deleteStart;

    // Verificar eliminación
    const deletedDoc = await collection.doc(testId).get();
    if (deletedDoc.exists) {
      throw new Error('Document still exists after deletion');
    }

    test.status = 'pass';
    test.details = {
      createTime: `${createTime}ms`,
      readTime: `${readTime}ms`,
      updateTime: `${updateTime}ms`,
      deleteTime: `${deleteTime}ms`,
      totalTime: `${createTime + readTime + updateTime + deleteTime}ms`,
    };

  } catch (error: any) {
    test.status = 'fail';
    test.details = {
      error: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
    };
    (test.recommendations as any[]).push('Verificar permisos de Firestore');
    (test.recommendations as any[]).push('Revisar reglas de seguridad de Firestore');
  }

  return test;
}

async function testAuthentication(): Promise<TestResult> {
  const test: TestResult = {
    name: 'Firebase Authentication',
    status: 'unknown',
    details: {},
    recommendations: [],
  };

  try {
    // Test básico de Auth Admin
    const listResult = await adminAuth.listUsers(1);
    
    test.status = 'pass';
    test.details = {
      authStatus: 'connected',
      usersFound: listResult.users.length,
      hasNextPageToken: !!listResult.pageToken,
    };

  } catch (error: any) {
    test.status = 'fail';
    test.details = {
      error: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
    };
    (test.recommendations as any[]).push('Verificar configuración de Firebase Auth');
    (test.recommendations as any[]).push('Verificar permisos del service account');
  }

  return test;
}

async function testPerformance(): Promise<TestResult> {
  const test: TestResult = {
    name: 'Performance Test',
    status: 'unknown',
    details: {},
    recommendations: [],
  };

  try {
    const tests = [];
    
    // Test 1: Single document read
    const singleStart = Date.now();
    await adminDb.collection('health-checks').doc('perf-test').set({
      timestamp: new Date().toISOString(),
    });
    const singleDoc = await adminDb.collection('health-checks').doc('perf-test').get();
    tests.push({
      name: 'Single document',
      time: Date.now() - singleStart,
      exists: singleDoc.exists,
    });

    // Test 2: Small batch read
    const batchStart = Date.now();
    const batchQuery = await adminDb.collection('health-checks').limit(5).get();
    tests.push({
      name: 'Batch read (5 docs)',
      time: Date.now() - batchStart,
      count: batchQuery.size,
    });

    // Cleanup
    await adminDb.collection('health-checks').doc('perf-test').delete();

    const avgTime = tests.reduce((sum, t) => sum + t.time, 0) / tests.length;
    
    test.status = avgTime < 500 ? 'pass' : 'fail';
    test.details = {
      tests: tests,
      averageTime: `${Math.round(avgTime)}ms`,
      performance: avgTime < 200 ? 'excellent' : avgTime < 500 ? 'good' : 'poor',
    };

    if (avgTime > 500) {
      (test.recommendations as any[]).push('Optimizar queries de Firestore');
      (test.recommendations as any[]).push('Considerar caching para datos frecuentes');
    }

  } catch (error: any) {
    test.status = 'fail';
    test.details = {
      error: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
    };
  }

  return test;
}

function generateRecommendations(tests: TestResult[]) {
  const recommendations = [];
  
  const failedTests = tests.filter((t: any) => t.status === 'fail');
  
  if (failedTests.length === 0) {
    recommendations.push({
      type: 'success',
      message: '✅ Firestore está completamente configurado y optimizado',
      priority: 'info',
    });
  } else {
    failedTests.forEach((test: any) => {
      recommendations.push({
        type: 'error',
        message: `❌ ${test.name} falló: Se requiere atención`,
        priority: 'high',
        details: test.recommendations,
      });
    });
  }

  // Recomendaciones generales
  recommendations.push({
    type: 'optimization',
    message: '🚀 Considerar implementar caching para queries frecuentes',
    priority: 'medium',
  });

  recommendations.push({
    type: 'monitoring',
    message: '📊 Configurar alertas de rendimiento en Firebase Console',
    priority: 'low',
  });

  return recommendations;
}
