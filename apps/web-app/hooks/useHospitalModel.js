import { useGLTF, useProgress } from '@react-three/drei'
import { useEffect, useState, useMemo } from 'react'
import { Vector3 } from 'three'

const MODEL_PATHS = {
  high: '/models/hospital-lod0.glb',
  medium: '/models/hospital-lod1.glb', 
  low: '/models/hospital-lod2.glb'
}

export function useHospitalModel(cameraDistance = 10) {
  const [currentLOD, setCurrentLOD] = useState('medium')
  const [isOptimized, setIsOptimized] = useState(false)
  const { progress } = useProgress()

  // Determinar LOD basado en distancia de cámara
  const lodLevel = useMemo(() => {
    if (cameraDistance < 5) return 'high'
    if (cameraDistance < 15) return 'medium'
    return 'low'
  }, [cameraDistance])

  // Cargar modelo según LOD
  const { scene, materials, nodes } = useGLTF(MODEL_PATHS[currentLOD])

  useEffect(() => {
    if (lodLevel !== currentLOD && progress === 100) {
      setCurrentLOD(lodLevel)
    }
  }, [lodLevel, currentLOD, progress])

  // Optimizar materiales y sombras
  useEffect(() => {
    if (scene && !isOptimized) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Configurar sombras
          child.castShadow = true
          child.receiveShadow = true
          
          // Optimizar materiales
          if (child.material) {
            child.material.needsUpdate = true
            // Forzar compilación de shaders
            child.material.side = 2 // DoubleSide para KHR_materials_unlit
          }
          
          // Configurar frustum culling
          child.frustumCulled = true
        }
      })
      
      // Calcular bounding box para optimizaciones
      if (scene.geometry) {
        scene.geometry.computeBoundingBox()
      }
      setIsOptimized(true)
    }
  }, [scene, isOptimized])

  // Configuración de escala y posición basada en análisis
  const modelConfig = useMemo(() => ({
    scale: new Vector3(0.08, 0.08, 0.08),
    position: new Vector3(0, -2, -8),
    rotation: new Vector3(0, 0, 0)
  }), [])

  return {
    scene,
    materials,
    nodes,
    currentLOD,
    isLoading: progress < 100,
    loadingProgress: progress,
    modelConfig,
    lodLevel
  }
}

// Precargar todos los modelos
useGLTF.preload(MODEL_PATHS.high)
useGLTF.preload(MODEL_PATHS.medium)
useGLTF.preload(MODEL_PATHS.low)
