'use client'
import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import { AvatarConfig } from '../../data/anamnesis-alvarez'

interface AvatarPaciente3DProps {
  config: AvatarConfig
}

function Avatar3D({ config }: { config: AvatarConfig }) {
  const { scene } = useGLTF('/models/patient-avatar.glb')
  const meshRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (scene) {
      scene.traverse(child => {
        if (child.isMesh) {
          child.frustumCulled = true
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])

  useFrame((state) => {
    if (meshRef.current) {
      // Rotación suave del avatar
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Ajustar escala basada en la complexión
  const getScale = () => {
    switch (config.complexion) {
      case 'Sobrepeso':
        return [1.1, 1.1, 1.1]
      case 'Atlética':
        return [0.9, 0.9, 0.9]
      default:
        return [1, 1, 1]
    }
  }

  return (
    <group ref={meshRef}>
      <primitive 
        object={scene} 
        position={[0, -1, 0]}
        rotation={[0, 0, 0]} 
        scale={getScale()} 
      />
      
      {/* Información del avatar */}
      <Html position={[0, 2, 0]}>
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-green-200 max-w-xs">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Tu Avatar Médico
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Edad: {config.edad} años</div>
            <div>Género: {config.genero}</div>
            <div>Complexión: {config.complexion}</div>
            {config.enfermedades.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold text-red-600">Riesgos:</div>
                {config.enfermedades.map((enfermedad, index) => (
                  <div key={index} className="text-red-500">• {enfermedad}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function AvatarPaciente3D({ config }: AvatarPaciente3DProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tu Avatar 3D</h3>
      <div className="h-80 relative">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          shadows
        >
          <Suspense fallback={null}>
            <Avatar3D config={config} />
            {/* Iluminación manual optimizada - sin dependencias externas */}
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={1}
              color="#ffffff"
            />
            <pointLight position={[-5, 5, 5]} intensity={0.5} color="#88ccff" />
            <hemisphereLight 
              intensity={0.3} 
              groundColor="#404040" 
              color="#ffffff" 
            />
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Altura:</span>
          <span className="font-semibold">{config.altura} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Peso:</span>
          <span className="font-semibold">{config.peso} kg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Color de piel:</span>
          <span className="font-semibold">{config.colorPiel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Color de cabello:</span>
          <span className="font-semibold">{config.colorCabello}</span>
        </div>
      </div>
    </div>
  )
} 