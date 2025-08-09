'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DOCTOR_MODEL_PATH = '/models/doctor_male.glb';
// Configuración para vista desde abajo hacia arriba - médico en posición elevada
const DOCTOR_POSITION: [number, number, number] = [0, 1.2, 0]; // Médico en posición muy elevada
const DOCTOR_SCALE: [number, number, number] = [1.8, 1.8, 1.8]; // Escala aumentada para presencia imponente
const DOCTOR_ROTATION: [number, number, number] = [0, -Math.PI / 6, 0]; // Rotación ligera hacia la izquierda

// Componente optimizado para vista desde abajo hacia arriba - médico en posición elevada
function OptimizedDoctorModel() {
  const { scene, animations } = useGLTF(DOCTOR_MODEL_PATH);
  const mixer = useRef<THREE.AnimationMixer>();
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      // Optimizar materiales para vista diagonal del torso
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Mejorar calidad de renderizado para vista diagonal
          child.frustumCulled = false;
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ajustar materiales para mejor definición en vista de torso
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.metalness = Math.min(mat.metalness, 0.2);
                  mat.roughness = Math.max(mat.roughness, 0.5);
                  mat.envMapIntensity = 0.3;
                  // Aumentar resolución de normales para detalles del torso
                  if (mat.normalMap) {
                    mat.normalScale.set(1.1, 1.1);
                  }
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.metalness = Math.min(child.material.metalness, 0.2);
              child.material.roughness = Math.max(child.material.roughness, 0.5);
              child.material.envMapIntensity = 0.3;
              if (child.material.normalMap) {
                child.material.normalScale.set(1.1, 1.1);
              }
            }
          }
        }
      });

      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      
      console.log('✅ Modelo con vista desde abajo cargado:', {
        position: DOCTOR_POSITION,
        scale: DOCTOR_SCALE,
        rotation: DOCTOR_ROTATION,
        mode: 'vista-desde-abajo-medico-elevado'
      });
    }
  }, [scene, animations]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
    
    // Efecto sutil de respiración para mayor realismo
    if (modelRef.current) {
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.005;
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

function GLBDoctor3D() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const sceneRef = useRef<THREE.Object3D | null>(null);
  const { scene, animations } = useGLTF(DOCTOR_MODEL_PATH);

  useEffect(() => {
    console.log('🎯 Modelo cargado:', { 
      scene: !!scene, 
      animationsCount: animations?.length || 0,
      animationNames: animations?.map(a => a.name) || []
    });

    if (!scene || !animations) return;

    // Clonar la escena UNA SOLA VEZ y guardar la referencia
    const clonedScene = scene.clone();
    sceneRef.current = clonedScene;

    // Configurar propiedades del modelo clonado
    clonedScene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = false;
        child.castShadow = true;
        child.receiveShadow = true;
        
        console.log('🔧 Mesh encontrada:', child.name, 'Material:', child.material?.type);
      }
    });

    if (animations.length > 0) {
      // Crear mixer SOLO para la escena clonada
      const mixer = new THREE.AnimationMixer(clonedScene);
      mixerRef.current = mixer;

      // Tomar la primera animación disponible
      const targetClip = animations[0];
      
      console.log('✅ Configurando animación:', {
        name: targetClip.name,
        duration: targetClip.duration,
        tracks: targetClip.tracks.length
      });
      
      const action = mixer.clipAction(targetClip);
      
      // Configurar la animación para que se ejecute inmediatamente
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.setEffectiveTimeScale(1.0);
      action.setEffectiveWeight(1.0);
      action.enabled = true;
      action.play();
      
      // Forzar el primer update inmediatamente
      mixer.update(0);
      
      console.log('🎬 Animación iniciada:', {
        isRunning: action.isRunning(),
        enabled: action.enabled,
        time: action.time,
        timeScale: action.getEffectiveTimeScale(),
        weight: action.getEffectiveWeight()
      });
    } else {
      console.warn('⚠️ No hay animaciones disponibles en el modelo');
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      sceneRef.current = null;
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    // Actualizar animaciones SOLO si el mixer existe
    if (mixerRef.current) {
      mixerRef.current.update(delta);
      
      // Debug: Log del estado de la animación cada 5 segundos
      if (Math.floor(state.clock.elapsedTime) % 5 === 0 && Math.floor(state.clock.elapsedTime * 10) % 10 === 0) {
        const actions = mixerRef.current._actions;
        if (actions.length > 0) {
          console.log('🎬 Estado animación:', {
            time: actions[0].time,
            isRunning: actions[0].isRunning(),
            enabled: actions[0].enabled,
            elapsedTime: state.clock.elapsedTime
          });
        }
      }
    }
  });

  // Renderizar SOLO si tenemos la escena clonada
  if (!sceneRef.current) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={sceneRef.current} 
        position={DOCTOR_POSITION}
        scale={DOCTOR_SCALE}
        rotation={DOCTOR_ROTATION}
      />
      {/* Plano de referencia para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="red" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

const Loading3D = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-3 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-primary-500 mx-auto"></div>
      <p className="text-sm text-slate-700 font-medium">Cargando modelo médico 3D...</p>
      <p className="text-xs text-slate-500">Configurando escena y materiales</p>
    </div>
  </div>
);

interface Medical3DCanvasProps {
  height?: string;
}

// Precargar el modelo para mejor rendimiento
useGLTF.preload(DOCTOR_MODEL_PATH);

export default function Medical3DCanvas({ height }: Medical3DCanvasProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Suspense fallback={<Loading3D />}>
        <Canvas
          camera={{ 
            position: [1.5, -1.0, 3.0], // Cámara muy baja mirando hacia arriba
            fov: 70, // FOV amplio para capturar la figura completa desde abajo
            near: 0.01,
            far: 1000
          }}
          style={{ 
            background: 'transparent', // Fondo transparente para integración total con la página
            width: '100%', 
            height: '100%' 
          }}
          dpr={[1, 2]} // Pixel density ratio para mejor calidad
          shadows
          gl={{ 
            antialias: true, // Anti-aliasing para eliminar "rallas"
            alpha: true, // Habilitar transparencia
            premultipliedAlpha: false, // Mejor manejo de transparencia
            powerPreference: "high-performance"
          }}
        >
          {/* Iluminación optimizada para vista desde abajo hacia arriba */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight 
            position={[2, 4, 2]} 
            intensity={1.2} 
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.01}
            shadow-camera-far={30}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={10}
            shadow-camera-bottom={-2}
            shadow-bias={-0.0001}
          />
          {/* Luz desde abajo para iluminar bien el rostro y torso desde perspectiva baja */}
          <directionalLight 
            position={[0, -2, 3]} 
            intensity={0.8} 
            color="#f8fafc" 
          />
          {/* Luz de relleno frontal desde abajo para eliminar sombras duras */}
          <pointLight 
            position={[0, -1.5, 2.5]} 
            intensity={0.7} 
            color="#ffffff"
            decay={2}
            distance={15}
          />
          
          {/* Modelo optimizado */}
          <OptimizedDoctorModel />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate={true} // Rotación automática suave para mostrar diferentes ángulos
            autoRotateSpeed={0.15} // Velocidad lenta para no distraer
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2} // Límites para mantener perspectiva desde abajo
            minPolarAngle={Math.PI / 6} // Evitar que la cámara se vaya muy arriba
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
            target={[0, 0.8, 0]} // Target apuntando al torso del médico elevado
            enableDamping
            dampingFactor={0.06}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}