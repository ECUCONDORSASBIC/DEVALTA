'use client'
import { useGLTF } from '@react-three/drei'
import { useRef, useState } from 'react'
import { Group, Color } from 'three'

export type MedicalDeviceType = 'stethoscope' | 'bp_cuff' | 'thermometer' | 'reflex_hammer' | 'otoscope'

interface MedicalDeviceProps {
  type: MedicalDeviceType
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  isActive?: boolean
  isInteractable?: boolean
  onInteract?: () => void
  customModelPath?: string
}

const DEVICE_CONFIGS = {
  stethoscope: {
    modelPath: '/models/stethoscope.glb',
    fallbackGeometry: 'torus',
    color: '#2d3748',
    activeColor: '#4299e1',
    scale: [0.5, 0.5, 0.5]
  },
  bp_cuff: {
    modelPath: '/models/bp_cuff.glb',
    fallbackGeometry: 'cylinder',
    color: '#4a5568',
    activeColor: '#38b2ac',
    scale: [0.8, 0.3, 0.8]
  },
  thermometer: {
    modelPath: '/models/thermometer.glb',
    fallbackGeometry: 'cylinder',
    color: '#e2e8f0',
    activeColor: '#f56565',
    scale: [0.1, 1, 0.1]
  },
  reflex_hammer: {
    modelPath: '/models/reflex_hammer.glb',
    fallbackGeometry: 'cylinder',
    color: '#2d3748',
    activeColor: '#ed8936',
    scale: [0.2, 0.8, 0.2]
  },
  otoscope: {
    modelPath: '/models/otoscope.glb',
    fallbackGeometry: 'cylinder',
    color: '#4a5568',
    activeColor: '#9f7aea',
    scale: [0.3, 0.8, 0.3]
  }
}

export function MedicalDevice({
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  isActive = false,
  isInteractable = false,
  onInteract,
  customModelPath
}: MedicalDeviceProps) {
  const group = useRef<Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const config = DEVICE_CONFIGS[type]
  const modelPath = customModelPath || config.modelPath
  
  // Try to load GLTF model, fallback to primitive geometry
  let modelScene = null
  try {
    const { scene } = useGLTF(modelPath)
    modelScene = scene
  } catch (error) {
    console.warn(`Failed to load model ${modelPath}, using fallback geometry`)
  }

  const currentColor = isActive ? config.activeColor : config.color
  const hoverScale = isHovered && isInteractable ? 1.1 : 1
  const finalScale = scale.map(s => s * hoverScale) as [number, number, number]

  const handleClick = () => {
    if (isInteractable && onInteract) {
      onInteract()
    }
  }

  const handlePointerEnter = () => {
    if (isInteractable) {
      setIsHovered(true)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    document.body.style.cursor = 'default'
  }

  const renderFallbackGeometry = () => {
    switch (config.fallbackGeometry) {
      case 'torus':
        return <torusGeometry args={[0.5, 0.1, 8, 16]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />
    }
  }

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={finalScale}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {modelScene ? (
        <primitive object={modelScene.clone()} />
      ) : (
        <mesh castShadow receiveShadow>
          {renderFallbackGeometry()}
          <meshStandardMaterial 
            color={new Color(currentColor)}
            metalness={0.3}
            roughness={0.4}
            emissive={isActive ? new Color(currentColor).multiplyScalar(0.1) : new Color(0x000000)}
          />
        </mesh>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <mesh position={[0, 0.8, 0]} scale={[0.1, 0.1, 0.1]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial 
            color={new Color('#00ff00')}
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Interaction glow effect */}
      {isInteractable && isHovered && (
        <mesh scale={[1.2, 1.2, 1.2]}>
          {renderFallbackGeometry()}
          <meshBasicMaterial 
            color={new Color(currentColor)}
            transparent 
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

// Stethoscope specific component
export function Stethoscope(props: Omit<MedicalDeviceProps, 'type'>) {
  return <MedicalDevice type="stethoscope" {...props} />
}

// Blood Pressure Cuff specific component
export function BloodPressureCuff(props: Omit<MedicalDeviceProps, 'type'>) {
  return <MedicalDevice type="bp_cuff" {...props} />
}

// Thermometer specific component
export function Thermometer(props: Omit<MedicalDeviceProps, 'type'>) {
  return <MedicalDevice type="thermometer" {...props} />
}

// Reflex Hammer specific component
export function ReflexHammer(props: Omit<MedicalDeviceProps, 'type'>) {
  return <MedicalDevice type="reflex_hammer" {...props} />
}

// Otoscope specific component
export function Otoscope(props: Omit<MedicalDeviceProps, 'type'>) {
  return <MedicalDevice type="otoscope" {...props} />
}

// Preload models (optional, only if they exist)
const preloadModels = () => {
  Object.values(DEVICE_CONFIGS).forEach(config => {
    try {
      useGLTF.preload(config.modelPath)
    } catch (error) {
      // Silently fail if model doesn't exist
    }
  })
}

// Call preload on module load
preloadModels()
