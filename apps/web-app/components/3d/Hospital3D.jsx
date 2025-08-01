import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei'
import { useHospitalModel } from '../../hooks/useHospitalModel'

function HospitalModel({ onCameraChange }) {
  const groupRef = useRef()
  const { camera } = useThree()
  const [cameraDistance, setCameraDistance] = useState(10)
  
  const { 
    scene, 
    isLoading, 
    loadingProgress, 
    modelConfig,
    currentLOD 
  } = useHospitalModel(cameraDistance)

  // Seguimiento de distancia de cámara
  useFrame(() => {
    if (camera && groupRef.current) {
      const distance = camera.position.distanceTo(groupRef.current.position)
      if (Math.abs(distance - cameraDistance) > 1) {
        setCameraDistance(distance)
        onCameraChange?.(distance)
      }
    }
  })

  useEffect(() => {
    if (scene && groupRef.current) {
      // Aplicar configuración del modelo
      groupRef.current.scale.copy(modelConfig.scale)
      groupRef.current.position.copy(modelConfig.position)
      groupRef.current.rotation.copy(modelConfig.rotation)
    }
  }, [scene, modelConfig])

  if (isLoading) {
    return (
      <Html center>
        <div className="loading-hospital">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p>Cargando Hospital 3D... {Math.round(loadingProgress)}%</p>
          <small>LOD: {currentLOD}</small>
        </div>
      </Html>
    )
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="canvas-loader">
        <div className="spinner" />
        <p>{progress.toFixed(0)}% Inicializando...</p>
      </div>
    </Html>
  )
}

export default function Hospital3D({ 
  className = "",
  enableControls = true,
  environment = "city",
  onModelLoad,
  onCameraChange
}) {
  return (
    <div className={`hospital-3d-container ${className}`}>
      <Canvas
        shadows
        camera={{ 
          position: [0, 5, 15], 
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={<Loader />}>
          {/* Iluminación optimizada */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, 10, -5]} intensity={0.3} color="#88ccff" />
          <hemisphereLight 
            intensity={0.2} 
            groundColor="#404040" 
            color="#ffffff" 
          />
          
          {/* Modelo del hospital */}
          <HospitalModel onCameraChange={onCameraChange} />
          
          {/* Controles */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2}
              makeDefault
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
