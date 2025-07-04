'use client'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useEffect, useRef, useMemo } from 'react'
import { Group } from 'three'
import { useOptimizedSettings, useDeviceCapabilities } from '@/utils/device-detection'
import { LowPolyDoctorAvatar } from './LowPolyAvatar'
import { SpringAnimatedObject, FadeInAnimation, GestureAnimationController } from '../animations/SpringAnimationSystem'

interface DoctorAvatarProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  modelPath?: string
  animationName?: string
  isAnimationPlaying?: boolean
  lookAtTarget?: [number, number, number]
  onAnimationFinish?: () => void
}

export function DoctorAvatar({
  position = [-1, 0, -1],
  rotation = [0, Math.PI / 4, 0],
  scale = [1, 1, 1],
  modelPath = '/models/nurse.glb', // Using nurse model as doctor for now
  animationName = 'examining',
  isAnimationPlaying = true,
  lookAtTarget,
  onAnimationFinish
}: DoctorAvatarProps) {
  const group = useRef<Group>(null)
  
  // Device capabilities and optimization settings
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()
  
  // Determine if we should use low-poly fallback
  const shouldUseLowPoly = useMemo(() => {
    return capabilities.isLowSpec || !optimizedSettings.enableAnimations
  }, [capabilities.isLowSpec, optimizedSettings.enableAnimations])
  
  // Load GLTF model with animations
  const { nodes, materials, animations, scene } = useGLTF(modelPath)
  const { ref, actions, names } = useAnimations(animations, group)

  // Handle animation control
  useEffect(() => {
    if (actions && animationName && names.includes(animationName)) {
      const action = actions[animationName]
      
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
      if (actions && animationName) {
        const action = actions[animationName]
        if (action) {
          action.stop()
        }
      }
    }
  }, [actions, animationName, isAnimationPlaying, onAnimationFinish, names])

  // Handle look-at target
  useEffect(() => {
    if (group.current && lookAtTarget) {
      group.current.lookAt(...lookAtTarget)
    }
  }, [lookAtTarget])

  // Return low-poly version for low-spec devices
  if (shouldUseLowPoly) {
    return (
      <FadeInAnimation trigger={true} duration={800}>
        <LowPolyDoctorAvatar
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
          ref={group}
          dispose={null}
        >
          <primitive 
            object={scene.clone()} 
            ref={ref}
          />
          
          {/* Doctor's coat indicator (white overlay) */}
          <mesh position={[0, 1, 0]} scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.1} 
              depthWrite={false}
            />
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
}

// Preload the model
useGLTF.preload('/models/nurse.glb')
