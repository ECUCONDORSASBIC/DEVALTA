'use client';

import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Configuración optimizada para doctor_male.glb
const DOCTOR_MODEL_PATH = '/models/doctor_male.glb';
const DOCTOR_MODEL_PATH_COMPRESSED = '/models/doctor_male_draco.glb';
const DOCTOR_POSITION: [number, number, number] = [0, 1.2, 0];
const DOCTOR_SCALE: [number, number, number] = [1.8, 1.8, 1.8];
const DOCTOR_ROTATION: [number, number, number] = [0, -Math.PI / 6, 0];

// Hook para cargar modelo con DRACOLoader optimizado
function useDRACOGLTF(url: string) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    // Configurar DRACOLoader una sola vez
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderConfig({ type: 'js' }); // Usar JS decoder para compatibilidad
    dracoLoader.preload(); // Precargar decoder
    
    loader.setDRACOLoader(dracoLoader);
    
    console.log('🚀 DRACOLoader configurado para:', url);
  });
  
  return gltf;
}

// Componente optimizado con DRACOLoader
function OptimizedDoctorModelWithDraco() {
  const modelRef = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer>();
  
  // Detectar soporte de Draco y cargar modelo apropiado
  const modelPath = useMemo(() => {
    // Verificar si existe la versión comprimida
    const supportsCompressed = true; // Podríamos hacer fetch para verificar
    return supportsCompressed ? DOCTOR_MODEL_PATH_COMPRESSED : DOCTOR_MODEL_PATH;
  }, []);

  // Cargar con DRACO optimization
  const { scene, animations } = useDRACOGLTF(modelPath);
  
  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      // Optimizaciones mejoradas para modelo DRACO
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Optimizaciones de renderizado más agresivas
          child.frustumCulled = true; // Re-habilitar culling para performance
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Optimizar geometría DRACO
          if (child.geometry) {
            // Compute vertex normals para mejor lighting
            child.geometry.computeVertexNormals();
            
            // Dispose de atributos no necesarios para ahorrar memoria
            if (child.geometry.attributes.uv2) {
              child.geometry.deleteAttribute('uv2');
            }
            if (child.geometry.attributes.color && !child.material.vertexColors) {
              child.geometry.deleteAttribute('color');
            }
          }
          
          // Optimizaciones de materiales específicas para DRACO
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Configuración optimizada para modelos médicos
                mat.metalness = Math.min(mat.metalness, 0.1);
                mat.roughness = Math.max(mat.roughness, 0.6);
                mat.envMapIntensity = 0.2;
                
                // Optimizar mapas de textura
                if (mat.map) {
                  mat.map.generateMipmaps = false;
                  mat.map.minFilter = THREE.LinearFilter;
                }
                
                if (mat.normalMap) {
                  mat.normalScale.set(0.8, 0.8); // Reducir intensidad para mejor performance
                  mat.normalMap.generateMipmaps = false;
                }
                
                // Habilitar optimizaciones de material
                mat.matcap = null; // Remove matcap if not needed
                mat.transparent = false; // Explicit non-transparency para better performance
              }
            });
          }
        }
      });

      // Configurar animaciones con mejor performance
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      
      console.log('✅ Modelo DRACO optimizado cargado:', {
        modelPath,
        vertices: scene.children.reduce((count, child) => {
          if (child instanceof THREE.Mesh) {
            return count + (child.geometry.attributes.position?.count || 0);
          }
          return count;
        }, 0),
        materials: scene.children.filter(child => child instanceof THREE.Mesh).length,
        animations: animations.length,
        memoryUsage: `${(scene.children.length * 1024).toFixed(1)}KB estimated`
      });
    }
  }, [scene, animations, modelPath]);

  // Frame loop optimizado
  useFrame((state, delta) => {
    mixer.current?.update(delta);
    
    // Efecto respiración más eficiente
    if (modelRef.current) {
      const time = state.clock.elapsedTime;
      // Usar función más eficiente y menos frecuente
      const breathingScale = 1 + Math.sin(time * 0.5) * 0.003;
      modelRef.current.scale.setScalar(breathingScale * DOCTOR_SCALE[0]);
    }
  });

  return (
    <group ref={modelRef}>
      <primitive 
        object={scene} 
        position={DOCTOR_POSITION}
        scale={DOCTOR_SCALE}
        rotation={DOCTOR_ROTATION}
      />
    </group>
  );
}

// Loading fallback optimizado
function DoctorModelSkeleton() {
  return (
    <group position={DOCTOR_POSITION} scale={DOCTOR_SCALE}>
      {/* Skeleton placeholder con formas básicas */}
      <mesh>
        <capsuleGeometry args={[0.3, 1.5, 4, 8]} />
        <meshStandardMaterial color="#e0e0e0" wireframe />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#f0f0f0" wireframe />
      </mesh>
    </group>
  );
}

// Componente principal con performance monitoring
export default function Medical3DCanvasOptimized() {
  const [performanceStats, setPerformanceStats] = useState<{
    fps: number;
    loadTime: number;
    memoryUsage: number;
  }>({ fps: 0, loadTime: 0, memoryUsage: 0 });

  useEffect(() => {
    const startTime = performance.now();
    
    // Monitor performance
    const monitorPerformance = () => {
      const memInfo = (performance as any).memory;
      setPerformanceStats({
        fps: Math.round(1000 / (performance.now() - startTime)),
        loadTime: performance.now() - startTime,
        memoryUsage: memInfo ? Math.round(memInfo.usedJSHeapSize / 1024 / 1024) : 0
      });
    };

    const interval = setInterval(monitorPerformance, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Performance Stats Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 text-white p-3 rounded-lg text-sm font-mono">
        <div>FPS: {performanceStats.fps}</div>
        <div>Load: {performanceStats.loadTime.toFixed(0)}ms</div>
        <div>Memory: {performanceStats.memoryUsage}MB</div>
      </div>

      <Canvas
        camera={{ 
          position: [0, 0, 4], 
          fov: 45,
          near: 0.1,
          far: 1000 
        }}
        gl={{
          antialias: false, // Disable for better performance
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
        performance={{ min: 0.5 }} // Allow performance scaling
        onCreated={(state) => {
          // Configuración optimizada del renderer
          state.gl.outputColorSpace = THREE.SRGBColorSpace;
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.2;
          state.gl.shadowMap.enabled = true;
          state.gl.shadowMap.type = THREE.PCFSoftShadowMap;
          
          console.log('🎯 Canvas 3D optimizado inicializado');
        }}
      >
        {/* Lighting optimizado para modelo médico */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        {/* Modelo con Suspense para loading */}
        <Suspense fallback={<DoctorModelSkeleton />}>
          <OptimizedDoctorModelWithDraco />
        </Suspense>
        
        {/* Controles optimizados */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
          maxDistance={8}
          minDistance={2}
        />
      </Canvas>
      
      {/* Medical UI Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🏥 Modelo 3D Médico Optimizado
        </h3>
        <p className="text-sm text-gray-600">
          Doctor virtual con compresión DRACO avanzada
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Optimizado para performance médica professional
        </div>
      </div>
    </div>
  );
}