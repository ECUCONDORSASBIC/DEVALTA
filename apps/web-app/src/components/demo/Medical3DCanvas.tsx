'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DOCTOR_MODEL_PATH = '/models/doctor_male.glb';
const DOCTOR_POSITION: [number, number, number] = [0, -0.3, 0]; // Posicionado para vista completa desde rodillas
const DOCTOR_SCALE: [number, number, number] = [1.6, 1.6, 1.6]; // Escala ajustada para mejor encuadre
const DOCTOR_ROTATION: [number, number, number] = [0, Math.PI / 6, 0]; // Rotación mejorada hacia el espectador

// Componente alternativo más simple para debugging
function SimpleDoctorModel() {
  const { scene, animations } = useGLTF(DOCTOR_MODEL_PATH);
  const mixer = useRef<THREE.AnimationMixer>();
  
  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
      console.log('🚀 Animación simple iniciada');
      console.log('📍 Configuración completa del modelo (vista rodillas-arriba):', {
        position: DOCTOR_POSITION,
        scale: DOCTOR_SCALE,
        rotation: DOCTOR_ROTATION,
        cameraPosition: [2.2, 0.2, 4.0],
        cameraTarget: [0, -0.5, 0],
        fov: 42,
        background: 'white-neutral'
      });
    }
  }, [scene, animations]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  return (
    <group>
      <primitive 
        object={scene} 
        position={DOCTOR_POSITION}
        scale={DOCTOR_SCALE}
        rotation={DOCTOR_ROTATION}
      />
      {/* Helpers de debugging temporal */}
      {process.env.NODE_ENV === 'development' && (
        <>
          {/* Punto de referencia en el centro */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="red" />
          </mesh>
          {/* Punto donde está el target de la cámara */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.03]} />
            <meshBasicMaterial color="green" />
          </mesh>
          {/* Líneas de referencia para el suelo */}
          <gridHelper args={[4, 10]} position={[0, -1, 0]} />
        </>
      )}
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
  <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
      <p className="text-xs text-gray-600 font-medium">Cargando modelo 3D...</p>
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
            position: [2.2, 0.2, 4.0], 
            fov: 42,
            near: 0.1,
            far: 1000
          }}
          style={{ background: '#f8f9fa', width: '100%', height: '100%' }}
          dpr={[1, 2]} // Pixel density ratio para mejor calidad
          shadows
        >
          {/* Iluminación optimizada para fondo blanco */}
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight 
            position={[2, 4, 3]} 
            intensity={0.8} 
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight 
            position={[-2, 3, 2]} 
            intensity={0.4} 
            color="#f0f8ff" 
          />
          <pointLight 
            position={[0, 2, 3]} 
            intensity={0.3} 
            color="#ffffff"
            decay={2}
            distance={15}
          />
          
          {/* Usa SimpleDoctorModel temporalmente para debugging */}
          <SimpleDoctorModel />
          {/* <GLBDoctor3D /> */}
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            enableRotate={true}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
            target={[0, -0.5, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}