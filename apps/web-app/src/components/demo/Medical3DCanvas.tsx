'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DOCTOR_MODEL_PATH = '/models/doctor_male.glb';
const DOCTOR_POSITION: [number, number, number] = [0, -0.5, 0]; // Más arriba para que la cabeza toque el extremo
const DOCTOR_SCALE: [number, number, number] = [1.8, 1.8, 1.8]; // Mucho más grande para mayor zoom

function GLBDoctor3D() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { scene, animations } = useGLTF(DOCTOR_MODEL_PATH);

  useEffect(() => {
    if (scene) {
      // Configurar propiedades del modelo como en anamnesis
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.frustumCulled = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    if (animations && animations.length > 0) {
      // Crear mixer para animaciones
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;

      // Cargar la animación de escritura (única animación en el GLB)
      const clip = animations[0];
      if (clip) {
        console.log('Cargando animación de escritura:', clip.name, 'Duración:', clip.duration);
        const action = mixer.clipAction(clip);
        action.reset().play();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      }

      return () => {
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
          mixerRef.current = null;
        }
      };
    }
  }, [scene, animations]);

  useFrame((state, delta) => {
    // Actualizar animaciones
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene.clone()} 
        position={DOCTOR_POSITION}
        scale={DOCTOR_SCALE}
        rotation={[0, Math.PI / 6, 0]}
      />
    </group>
  );
}

const Loading3D = () => (
  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
      <p className="text-xs text-blue-600 font-medium">Cargando consulta...</p>
    </div>
  </div>
);

interface Medical3DCanvasProps {
  height?: string;
}

export default function Medical3DCanvas({ height = '140px' }: Medical3DCanvasProps) {
  return (
    <div className="relative w-full" style={{ height }}>
      <Suspense fallback={<Loading3D />}>
        <Canvas
          camera={{ position: [1.2, 0.8, 2.0], fov: 45 }}
          style={{ background: 'black' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[2, 2, 1]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-1, 1, -1]} intensity={0.6} color="#e8f4fd" />
          <pointLight position={[0, 2, 2]} intensity={0.8} color="#ffffff" />
          <GLBDoctor3D />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 3}
            target={[0, 0, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}