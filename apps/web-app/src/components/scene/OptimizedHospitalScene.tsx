// components/scene/OptimizedHospitalScene.tsx
'use client'

import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneControls } from './contexts/SceneControlsContext'

function HospitalModel() {
  const { scene } = useGLTF('/models/hospital.glb')
  const { controls } = useSceneControls()
  
  useEffect(() => {
    if (scene) {
      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.frustumCulled = true
          mesh.castShadow = true
          mesh.receiveShadow = true

          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if ((mat as THREE.Material & { map?: THREE.Texture }).map) {
                  const materialWithMap = mat as THREE.Material & { map: THREE.Texture }
                  materialWithMap.map.minFilter = THREE.LinearFilter
                  materialWithMap.map.magFilter = THREE.LinearFilter
                  materialWithMap.map.generateMipmaps = false
                  materialWithMap.map.needsUpdate = true
                }
                mat.needsUpdate = true
              })
            } else {
              const materialWithMap = mesh.material as THREE.Material & { map?: THREE.Texture }
              if (materialWithMap.map) {
                materialWithMap.map.minFilter = THREE.LinearFilter
                materialWithMap.map.magFilter = THREE.LinearFilter
                materialWithMap.map.generateMipmaps = false
                materialWithMap.map.needsUpdate = true
              }
              mesh.material.needsUpdate = true
            }
          }
        }
      })
    }
  }, [scene])

  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]} 
      scale={[1, 1, 1]} 
    />
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto" />
        <p className="text-lg">Cargando Hospital Optimizado...</p>
        <p className="text-sm opacity-75">Reducción del 88.4% en tamaño</p>
      </div>
    </div>
  )
}

export default function OptimizedHospitalScene() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-100 to-blue-200 relative overflow-hidden">
      <Canvas
        camera={{ 
          position: [0, 5, 10], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          antialias: true,
          alpha: false,
          depth: true,
          stencil: false,
          failIfMajorPerformanceCaveat: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.74
        }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)' }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.74
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.setClearColor('#87CEEB')
        }}
        shadows
      >
        <Environment preset="sunset" background={false} />
        <ambientLight intensity={0.3} color="#ffffff" />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          target={[0, 1, 0]}
        />
        <Suspense fallback={null}>
          <HospitalModel />
        </Suspense>
      </Canvas>

      {/* Controles de interfaz */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🏥 Hospital 3D Optimizado
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Escena optimizada para mejor rendimiento
          </p>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              • Mouse: Rotar vista
            </div>
            <div className="text-xs text-gray-500">
              • Scroll: Zoom
            </div>
            <div className="text-xs text-gray-500">
              • Click + arrastrar: Pan
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

useGLTF.preload('/models/hospital.glb') 