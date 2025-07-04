/**
 * Demostración del WebDesigner3DAgent
 * Muestra cómo usar el agente para análisis de código 3D médico
 */

import { WebDesigner3DAgent } from './web-designer-3d-agent.js';

// Ejemplo de código Three.js para aplicación médica
const medicalThreeJSExample = `
import * as THREE from 'three';
import React, { useRef, useFrame, useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Configuración para entorno médico
const MedicalScene = () => {
  const heartRef = useRef();
  const [loading, setLoading] = useState(false);
  
  // Modelo 3D del corazón con precisión médica
  const heartModel = useLoader(GLTFLoader, '/models/medical/heart-detailed.gltf');
  
  // Animación del latido cardíaco
  useFrame((state) => {
    if (heartRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      heartRef.current.scale.setScalar(scale);
    }
  });

  // Manejo de errores médicos críticos
  const handleMedicalError = (error) => {
    try {
      console.error('Error médico crítico:', error);
      // Notificar al sistema médico
    } catch (e) {
      console.error('Error en manejo de errores:', e);
    }
  };

  return (
    <group ref={heartRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 32]} />
        <meshStandardMaterial 
          color="#cc3333" 
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

// Componente principal con UX médico
const MedicalVisualization = () => {
  const [language, setLanguage] = useState('es');
  
  const translations = {
    en: {
      title: 'Heart 3D Model',
      controls: 'Use mouse to rotate, wheel to zoom',
      warning: 'For educational purposes only'
    },
    es: {
      title: 'Modelo 3D del Corazón',
      controls: 'Usa el ratón para rotar, rueda para zoom',
      warning: 'Solo para propósitos educativos'
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)'
    }}>
      {/* Encabezado accesible */}
      <header 
        role="banner"
        style={{
          padding: '20px',
          background: '#ffffff',
          borderBottom: '2px solid #0066cc'
        }}
      >
        <h1 
          style={{ 
            color: '#0066cc',
            fontSize: '24px',
            margin: 0
          }}
          aria-level="1"
        >
          {translations[language].title}
        </h1>
        
        {/* Controles accesibles */}
        <div style={{ marginTop: '10px' }}>
          <button
            style={{
              minWidth: '48px',
              minHeight: '48px',
              padding: '12px 24px',
              background: '#4CAF50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              marginRight: '12px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            aria-label="Cambiar idioma"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setLanguage(language === 'en' ? 'es' : 'en');
              }
            }}
            tabIndex={0}
          >
            {language === 'en' ? 'Español' : 'English'}
          </button>
        </div>
        
        <p style={{ 
          color: '#666666',
          fontSize: '14px',
          margin: '10px 0 0 0'
        }}>
          {translations[language].controls}
        </p>
        
        <div 
          role="alert"
          style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '8px 12px',
            marginTop: '10px',
            fontSize: '14px',
            color: '#856404'
          }}
        >
          ⚠️ {translations[language].warning}
        </div>
      </header>

      {/* Canvas 3D accesible */}
      <main role="main" style={{ height: 'calc(100vh - 200px)' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            gl.setSize(window.innerWidth, window.innerHeight);
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
          aria-label="Visualización 3D del corazón"
          role="img"
          tabIndex={0}
        >
          {/* Iluminación médica apropiada */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            color="#ffffff"
            castShadow
          />
          <pointLight 
            position={[-10, -10, -5]} 
            intensity={0.3}
            color="#ffffff"
          />

          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#cccccc" transparent opacity={0.5} />
            </mesh>
          }>
            <MedicalScene />
          </Suspense>
        </Canvas>
      </main>

      {/* Controles de navegación accesibles */}
      <footer 
        role="contentinfo"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              minWidth: '44px',
              minHeight: '44px',
              background: '#2196F3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            aria-label="Resetear vista"
            tabIndex={0}
          >
            🔄
          </button>
          
          <button
            style={{
              minWidth: '44px',
              minHeight: '44px',
              background: '#ff9800',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            aria-label="Información médica"
            tabIndex={0}
          >
            ℹ️
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MedicalVisualization;
`;

// Contexto médico de ejemplo
const medicalContext = {
  type: 'anatomy',
  environment: 'hospital',
  purpose: 'education',
  setting: 'patient_room',
  targetAudience: 'medical_students',
  accessibility: 'high',
  languages: ['es', 'en']
};

// Función de demostración
async function demoWebDesigner3DAgent() {
  console.log('🏥 Demostración WebDesigner3DAgent');
  console.log('=====================================\n');

  const agent = new WebDesigner3DAgent();
  
  try {
    // 1. Análisis completo de UX médico 3D
    console.log('📋 1. Análisis de UX Médico 3D');
    console.log('----------------------------');
    const uxAnalysis = await agent.analyzeMedical3DUX(medicalThreeJSExample);
    
    console.log('✅ Accesibilidad:');
    console.log(`   - Navegación por teclado: ${uxAnalysis.accessibility.keyboardNavigation ? '✓' : '✗'}`);
    console.log(`   - Lectores de pantalla: ${uxAnalysis.accessibility.screenReaderSupport ? '✓' : '✗'}`);
    console.log(`   - Gestión de foco: ${uxAnalysis.accessibility.focusManagement ? '✓' : '✗'}`);
    
    console.log('✅ Usabilidad:');
    console.log(`   - Manejo de errores: ${uxAnalysis.usability.errorHandling ? '✓' : '✗'}`);
    console.log(`   - Estados de carga: ${uxAnalysis.usability.loadingStates ? '✓' : '✗'}`);
    
    console.log('✅ Soporte bilingüe:');
    console.log(`   - Internacionalización: ${uxAnalysis.bilingualSupport.internationalization ? '✓' : '✗'}`);
    
    console.log('✅ Áreas clickeables:');
    console.log(`   - Tamaño mínimo: ${uxAnalysis.interactionAreas.minimumSize ? '✓' : '✗'}`);
    console.log(`   - Espaciado: ${uxAnalysis.interactionAreas.spacing ? '✓' : '✗'}`);

    console.log('\n📊 2. Análisis de Performance 3D');
    console.log('--------------------------------');
    const perfAnalysis = await agent.performSpecializedAnalysis(medicalThreeJSExample, 'javascript');
    
    console.log(`🎯 Draw calls estimados: ${perfAnalysis.drawCalls.estimatedCalls}`);
    console.log(`🔧 Complejidad de shaders: ${perfAnalysis.shaderComplexity.complexity}`);
    console.log(`📈 Recomendaciones de performance: ${perfAnalysis.performance3D.recommendations.length}`);
    
    if (perfAnalysis.performance3D.recommendations.length > 0) {
      console.log('   Recomendaciones:');
      perfAnalysis.performance3D.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    console.log('\n🎨 3. Sugerencias de Assets 3D Médicos');
    console.log('--------------------------------------');
    const assetSuggestions = await agent.suggest3DAssets(medicalContext);
    
    console.log(`📦 Modelos sugeridos: ${assetSuggestions.models.length}`);
    assetSuggestions.models.forEach((model, i) => {
      console.log(`   ${i + 1}. ${model.name} (${model.format}, ${model.fileSize})`);
    });
    
    console.log(`🎨 Texturas sugeridas: ${assetSuggestions.textures.length}`);
    assetSuggestions.textures.forEach((texture, i) => {
      console.log(`   ${i + 1}. ${texture.name} (${texture.resolution})`);
    });

    console.log('\n💡 4. Recomendaciones Específicas del Rol');
    console.log('----------------------------------------');
    const roleRecs = await agent.getRoleSpecificRecommendations(medicalContext);
    
    roleRecs.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.category}`);
      console.log(`   ${rec.recommendation}`);
      console.log(`   💻 ${rec.implementation}\n`);
    });

    console.log('🎉 Demostración completada exitosamente!');
    console.log('El WebDesigner3DAgent está listo para analizar aplicaciones médicas 3D.');

  } catch (error) {
    console.error('❌ Error en la demostración:', error);
  }
}

export { demoWebDesigner3DAgent, medicalThreeJSExample, medicalContext };

// Ejecutar demostración si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demoWebDesigner3DAgent();
}
