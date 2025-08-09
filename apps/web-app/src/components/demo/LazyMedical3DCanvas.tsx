'use client';

import { Suspense, memo, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DOCTOR_MODEL_PATH = '/models/doctor_male.glb';

// 🎯 CONFIGURACIÓN OPTIMIZADA
const DOCTOR_CONFIG = {
  position: [0, 1.2, 0] as [number, number, number],
  scale: [1.8, 1.8, 1.8] as [number, number, number],
  rotation: [0, -Math.PI / 6, 0] as [number, number, number],
};

const CAMERA_CONFIG = {
  position: [1.5, -1.0, 3.0] as [number, number, number],
  fov: 70,
  near: 0.01,
  far: 1000,
};

// ⚡ PERFORMANCE OPTIMIZED DOCTOR MODEL
const OptimizedDoctorModel = memo(() => {
  const { scene, animations } = useGLTF(DOCTOR_MODEL_PATH);
  const mixer = useRef<THREE.AnimationMixer>();
  const modelRef = useRef<THREE.Group>(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (!scene || !animations || animations.length === 0) return;

    // 🔥 AGGRESSIVE OPTIMIZATION
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true; // Enable frustum culling for performance
        child.castShadow = false; // Disable shadows for performance
        child.receiveShadow = false;
        
        // Material optimizations
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.metalness = Math.min(mat.metalness, 0.1);
              mat.roughness = Math.max(mat.roughness, 0.7);
              mat.envMapIntensity = 0.2;
              // Reduce normal map intensity for performance
              if (mat.normalMap) {
                mat.normalScale.set(0.8, 0.8);
              }
            }
          });
        }
      }
    });

    // Setup animation mixer
    mixer.current = new THREE.AnimationMixer(scene);
    const action = mixer.current.clipAction(animations[0]);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    
    setIsReady(true);
    
    console.log('✅ Optimized 3D Model loaded');
    
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [scene, animations]);

  const updateMixer = useCallback((delta: number) => {
    mixer.current?.update(delta);
    
    // Subtle breathing effect (reduced for performance)
    if (modelRef.current) {
      const breathingScale = 1 + Math.sin(Date.now() * 0.0008) * 0.003;
      modelRef.current.scale.setScalar(breathingScale * DOCTOR_CONFIG.scale[0]);
    }
  }, []);

  useFrame((state, delta) => {
    // Only update if ready
    if (isReady) {
      updateMixer(delta);
    }
  });

  if (!isReady) return null;

  return (
    <group ref={modelRef}>
      <primitive 
        object={scene} 
        position={DOCTOR_CONFIG.position}
        scale={DOCTOR_CONFIG.scale}
        rotation={DOCTOR_CONFIG.rotation}
      />
    </group>
  );
});

OptimizedDoctorModel.displayName = 'OptimizedDoctorModel';

// 🎨 OPTIMIZED LOADING COMPONENT
const Loading3D = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-3 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg animate-pulse">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-blue-500 mx-auto"></div>
      <p className="text-sm text-slate-700 font-medium">Cargando modelo médico 3D...</p>
      <p className="text-xs text-slate-500">Optimizando rendimiento...</p>
    </div>
  </div>
));

Loading3D.displayName = 'Loading3D';

// 🏗️ SKELETON PLACEHOLDER
const CanvasSkeleton = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg animate-pulse">
    <div className="absolute inset-4 bg-white/40 rounded-lg border-2 border-dashed border-slate-300">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto animate-pulse"></div>
          <div className="w-24 h-3 bg-slate-300 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
));

CanvasSkeleton.displayName = 'CanvasSkeleton';

// 🎯 OPTIMIZED LIGHTING SETUP
const OptimizedLighting = memo(() => (
  <>
    <ambientLight intensity={0.6} color="#ffffff" />
    <directionalLight 
      position={[2, 4, 2]} 
      intensity={1.0} 
      color="#ffffff"
      castShadow={false} // Disabled for performance
    />
    <directionalLight 
      position={[0, -2, 3]} 
      intensity={0.6} 
      color="#f8fafc" 
    />
    <pointLight 
      position={[0, -1.5, 2.5]} 
      intensity={0.5} 
      color="#ffffff"
      decay={2}
      distance={15}
    />
  </>
));

OptimizedLighting.displayName = 'OptimizedLighting';

interface LazyMedical3DCanvasProps {
  height?: string;
  priority?: boolean; // For above-the-fold loading
}

// 🚀 MAIN LAZY COMPONENT
const LazyMedical3DCanvas = memo(({ height, priority = false }: LazyMedical3DCanvasProps) => {
  const [shouldLoad, setShouldLoad] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  if (!shouldLoad) {
    return (
      <div ref={containerRef} className="absolute inset-0 w-full h-full">
        <CanvasSkeleton />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <Suspense fallback={<Loading3D />}>
        <Canvas
          camera={CAMERA_CONFIG}
          style={{ 
            background: 'transparent',
            width: '100%', 
            height: '100%' 
          }}
          dpr={[1, 1.5]} // Reduced DPR for performance
          shadows={false} // Disabled for performance
          gl={{ 
            antialias: false, // Disabled for performance
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            // Performance optimizations
            logarithmicDepthBuffer: false,
            preserveDrawingBuffer: false,
          }}
          frameloop="demand" // Only render when needed
          performance={{
            min: 0.2, // Lower minimum performance threshold
            max: 1,
            debounce: 200
          }}
        >
          <OptimizedLighting />
          <OptimizedDoctorModel />
          
          <Suspense fallback={null}>
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={0.1} // Slower for better performance
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 6}
              maxAzimuthAngle={Math.PI / 4}
              minAzimuthAngle={-Math.PI / 4}
              target={[0, 0.8, 0]}
              enableDamping
              dampingFactor={0.08}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
});

LazyMedical3DCanvas.displayName = 'LazyMedical3DCanvas';

// Preload model only when component is imported (not immediately)
const preloadModel = () => {
  if (typeof window !== 'undefined') {
    // Delay preload to avoid blocking initial page load
    setTimeout(() => {
      useGLTF.preload(DOCTOR_MODEL_PATH);
    }, 2000);
  }
};

// Start preloading after component definition
preloadModel();

export default LazyMedical3DCanvas;