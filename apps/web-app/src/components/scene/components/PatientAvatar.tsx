'use client'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef, forwardRef, useMemo } from 'react'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import { useAnamnesisStore } from '@/stores/anamnesisStore'
import { useOptimizedSettings, useDeviceCapabilities } from '@/utils/device-detection'
import { LowPolyPatientAvatar } from './LowPolyAvatar'
import { SpringAnimatedObject, FadeInAnimation, GestureAnimationController } from '../animations/SpringAnimationSystem'

interface PatientAvatarProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  modelPath?: string
  animationName?: string
  isAnimationPlaying?: boolean
  onAnimationFinish?: () => void
  enableAnamnesisSync?: boolean
}

export const PatientAvatar = forwardRef<Group, PatientAvatarProps>(function PatientAvatar({
  position = [1, 0, -1],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  modelPath = '/models/patient.glb',
  animationName = 'idle',
  isAnimationPlaying = true,
  onAnimationFinish,
  enableAnamnesisSync = false
}, ref) {
  const group = useRef<Group>(null)
  const bodyPartsRefs = useRef<{ [key: string]: Mesh }>({})
  
  // Device capabilities and optimization settings
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()
  
  // Determine if we should use low-poly fallback
  const shouldUseLowPoly = useMemo(() => {
    return capabilities.isLowSpec || !optimizedSettings.enableAnimations
  }, [capabilities.isLowSpec, optimizedSettings.enableAnimations])
  
  // Anamnesis store integration
  const { 
    patientAvatarAnimations, 
    selectedBodyParts, 
    highlightedBodyParts 
  } = useAnamnesisStore()
  
  // Load GLTF model with animations
  const { nodes, materials, animations, scene } = useGLTF(modelPath)
  const { ref: animRef, actions, names } = useAnimations(animations, group)

  // Handle animation control
  useEffect(() => {
    const currentAnimationName = enableAnamnesisSync 
      ? patientAvatarAnimations.currentAnimation 
      : animationName
      
    if (actions && currentAnimationName && names.includes(currentAnimationName)) {
      const action = actions[currentAnimationName]
      
      if (action) {
        if (isAnimationPlaying) {
          action.reset().fadeIn(0.5).play()
        } else {
          action.fadeOut(0.5)
        }

        // Setup animation finished callback
        if (onAnimationFinish) {
          const handleFinished = () => {
            onAnimationFinish()
            action.getMixer().removeEventListener('finished', handleFinished)
          }
          action.getMixer().addEventListener('finished', handleFinished)
        }
      }
    }

    return () => {
      // Cleanup animations on unmount
      if (actions && currentAnimationName) {
        const action = actions[currentAnimationName]
        if (action) {
          action.stop()
        }
      }
    }
  }, [actions, animationName, isAnimationPlaying, onAnimationFinish, names, enableAnamnesisSync, patientAvatarAnimations.currentAnimation])
  
  // Handle body part highlighting
  useEffect(() => {
    if (!enableAnamnesisSync) return
    
    // Reset all materials
    Object.values(bodyPartsRefs.current).forEach((mesh) => {
      if (mesh && mesh.material instanceof MeshStandardMaterial) {
        mesh.material.emissive.setHex(0x000000)
        mesh.material.emissiveIntensity = 0
      }
    })
    
    // Highlight selected body parts
    selectedBodyParts.forEach((bodyPart) => {
      const mesh = bodyPartsRefs.current[bodyPart]
      if (mesh && mesh.material instanceof MeshStandardMaterial) {
        mesh.material.emissive.setHex(0x0066ff)
        mesh.material.emissiveIntensity = 0.3
      }
    })
    
    // Highlight hovered body parts
    highlightedBodyParts.forEach((bodyPart) => {
      const mesh = bodyPartsRefs.current[bodyPart]
      if (mesh && mesh.material instanceof MeshStandardMaterial) {
        mesh.material.emissive.setHex(0xff6600)
        mesh.material.emissiveIntensity = 0.5
      }
    })
  }, [enableAnamnesisSync, selectedBodyParts, highlightedBodyParts])
  
  // Body part mesh mapping for highlighting
  const mapBodyPartMeshes = (object: any, parentName = '') => {
    if (object.isMesh) {
      const name = object.name.toLowerCase()
      
      // Map mesh names to body parts (this would depend on your 3D model structure)
      if (name.includes('head')) bodyPartsRefs.current.head = object
      else if (name.includes('neck')) bodyPartsRefs.current.neck = object
      else if (name.includes('chest') || name.includes('torso')) bodyPartsRefs.current.chest = object
      else if (name.includes('left') && name.includes('arm')) bodyPartsRefs.current.leftArm = object
      else if (name.includes('right') && name.includes('arm')) bodyPartsRefs.current.rightArm = object
      else if (name.includes('left') && name.includes('hand')) bodyPartsRefs.current.leftHand = object
      else if (name.includes('right') && name.includes('hand')) bodyPartsRefs.current.rightHand = object
      else if (name.includes('abdomen') || name.includes('belly')) bodyPartsRefs.current.abdomen = object
      else if (name.includes('back')) bodyPartsRefs.current.back = object
      else if (name.includes('left') && name.includes('leg')) bodyPartsRefs.current.leftLeg = object
      else if (name.includes('right') && name.includes('leg')) bodyPartsRefs.current.rightLeg = object
      else if (name.includes('left') && name.includes('foot')) bodyPartsRefs.current.leftFoot = object
      else if (name.includes('right') && name.includes('foot')) bodyPartsRefs.current.rightFoot = object
    }
    
    if (object.children) {
      object.children.forEach((child: any) => mapBodyPartMeshes(child, object.name))
    }
  }
  
  // Map body parts when scene loads
  useEffect(() => {
    if (scene && enableAnamnesisSync) {
      mapBodyPartMeshes(scene)
    }
  }, [scene, enableAnamnesisSync])

  // Return low-poly version for low-spec devices
  if (shouldUseLowPoly) {
    return (
      <FadeInAnimation trigger={true} duration={800}>
        <LowPolyPatientAvatar
          position={position}
          rotation={rotation}
          scale={scale}
          animationName={animationName}
          isAnimationPlaying={isAnimationPlaying && optimizedSettings.enableAnimations}
          onAnimationFinish={onAnimationFinish}
          gestureType={animationName as any}
        />
      </FadeInAnimation>
    )
  }

  return (
    <FadeInAnimation trigger={true} duration={optimizedSettings.cameraTransitionDuration * 1000}>
      <SpringAnimatedObject
        animationConfig={{
          enabled: optimizedSettings.enableAnimations,
          duration: 1000,
          easing: 'easeOutCubic',
          position,
          rotation,
          scale
        }}
        trigger={true}
      >
        <group
          ref={ref || group}
          dispose={null}
        >
          <primitive 
            object={scene.clone()} 
            ref={animRef}
          />
          
          {/* Patient bed/furniture (if not included in model) */}
          <mesh position={[0, -0.5, 0]} castShadow={optimizedSettings.shadows} receiveShadow={optimizedSettings.shadows}>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
          
          {/* Pillow */}
          <mesh position={[0, -0.3, 0.3]} castShadow={optimizedSettings.shadows}>
            <boxGeometry args={[0.8, 0.2, 0.4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          
          {/* Gesture Animation Controller */}
          {animationName && optimizedSettings.enableAnimations && (
            <GestureAnimationController
              gestureType={animationName as any}
              duration={1200}
              onComplete={onAnimationFinish}
            />
          )}
        </group>
      </SpringAnimatedObject>
    </FadeInAnimation>
  )
})

// Preload the model
useGLTF.preload('/models/patient.glb')
