'use client'
import { useRef, useEffect, useMemo } from 'react'
import { useSpring, useSpringValue, animated, config } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { useOptimizedSettings, useDeviceCapabilities } from '@/utils/device-detection'

// Types for animation configurations
export interface SpringAnimationConfig {
  enabled: boolean
  duration: number
  easing: keyof typeof config
  delay?: number
}

export interface CameraAnimationConfig extends SpringAnimationConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}

export interface ObjectAnimationConfig extends SpringAnimationConfig {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  opacity?: number
}

// Spring-animated Camera Controller
export function SpringCameraController({
  targetPosition = [0, 2, 5],
  targetLookAt = [0, 0, 0],
  fov = 75,
  onAnimationComplete,
  config: animConfig = { enabled: true, duration: 1000, easing: 'easeOutCubic' }
}: {
  targetPosition?: [number, number, number]
  targetLookAt?: [number, number, number]
  fov?: number
  onAnimationComplete?: () => void
  config?: CameraAnimationConfig
}) {
  const { camera } = useThree()
  const optimizedSettings = useOptimizedSettings()
  const capabilities = useDeviceCapabilities()

  // Adjust config based on device capabilities
  const adjustedConfig = useMemo(() => ({
    ...animConfig,
    duration: capabilities.isLowSpec ? animConfig.duration * 0.7 : animConfig.duration,
    enabled: animConfig.enabled && optimizedSettings.enableCameraTransitions
  }), [animConfig, capabilities.isLowSpec, optimizedSettings.enableCameraTransitions])

  // Spring animation for camera position
  const [{ position, lookAt, fovValue }] = useSpring(() => ({
    position: targetPosition,
    lookAt: targetLookAt,
    fovValue: fov,
    config: {
      tension: 120,
      friction: 20,
      duration: adjustedConfig.duration
    },
    onRest: onAnimationComplete
  }), [targetPosition, targetLookAt, fov, adjustedConfig])

  // Apply spring values to camera
  useFrame(() => {
    if (adjustedConfig.enabled) {
      camera.position.set(...position.get())
      camera.lookAt(...lookAt.get())
      camera.fov = fovValue.get()
      camera.updateProjectionMatrix()
    }
  })

  return null
}

// Spring-animated Object wrapper
export function SpringAnimatedObject({
  children,
  animationConfig,
  trigger,
  loop = false
}: {
  children: React.ReactNode
  animationConfig: ObjectAnimationConfig
  trigger?: boolean
  loop?: boolean
}) {
  const groupRef = useRef<Group>(null)
  const optimizedSettings = useOptimizedSettings()
  const capabilities = useDeviceCapabilities()

  // Adjust config based on device capabilities
  const adjustedConfig = useMemo(() => ({
    ...animationConfig,
    duration: capabilities.isLowSpec ? animationConfig.duration * 0.7 : animationConfig.duration,
    enabled: animationConfig.enabled && optimizedSettings.enableAnimations
  }), [animationConfig, capabilities.isLowSpec, optimizedSettings.enableAnimations])

  // Spring animations
  const [springs] = useSpring(() => ({
    position: adjustedConfig.position || [0, 0, 0],
    rotation: adjustedConfig.rotation || [0, 0, 0],
    scale: adjustedConfig.scale || [1, 1, 1],
    opacity: adjustedConfig.opacity || 1,
    config: {
      tension: 170,
      friction: 26,
      duration: adjustedConfig.duration
    },
    loop
  }), [adjustedConfig, trigger, loop])

  return (
    <animated.group
      ref={groupRef}
      position={springs.position as any}
      rotation={springs.rotation as any}
      scale={springs.scale as any}
    >
      <animated.group>
        {children}
      </animated.group>
    </animated.group>
  )
}

// Fade-in animation for questionnaires and UI elements
export function FadeInAnimation({
  children,
  delay = 0,
  duration = 800,
  from = { opacity: 0, scale: 0.9 },
  to = { opacity: 1, scale: 1 },
  trigger = true
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  from?: { opacity: number; scale: number }
  to?: { opacity: number; scale: number }
  trigger?: boolean
}) {
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()

  const adjustedDuration = capabilities.isLowSpec ? duration * 0.7 : duration
  const enabled = optimizedSettings.enableAnimations

  const [springs] = useSpring(() => ({
    from: enabled ? from : to,
    to: enabled && trigger ? to : from,
    delay: enabled ? delay : 0,
    config: {
      tension: 120,
      friction: 14,
      duration: adjustedDuration
    }
  }), [trigger, enabled, adjustedDuration, delay, from, to])

  return (
    <animated.group
      scale={springs.scale as any}
    >
      <animated.group>
        {children}
      </animated.group>
    </animated.group>
  )
}

// Camera dolly animation for scene transitions
export function CameraDollyAnimation({
  keyframes,
  duration = 3000,
  autoPlay = false,
  loop = false,
  onComplete
}: {
  keyframes: Array<{
    position: [number, number, number]
    lookAt: [number, number, number]
    fov?: number
    duration?: number
  }>
  duration?: number
  autoPlay?: boolean
  loop?: boolean
  onComplete?: () => void
}) {
  const { camera } = useThree()
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()
  const currentKeyframe = useRef(0)

  const adjustedDuration = capabilities.isLowSpec ? duration * 0.7 : duration
  const enabled = optimizedSettings.enableCameraTransitions

  // Create spring for current keyframe
  const [springs, api] = useSpring(() => {
    const keyframe = keyframes[0] || { position: [0, 2, 5], lookAt: [0, 0, 0], fov: 75 }
    return {
      position: keyframe.position,
      lookAt: keyframe.lookAt,
      fov: keyframe.fov || 75,
      config: {
        tension: 120,
        friction: 20,
        duration: keyframe.duration || adjustedDuration / keyframes.length
      },
      onRest: () => {
        currentKeyframe.current++
        if (currentKeyframe.current < keyframes.length) {
          // Move to next keyframe
          const nextKeyframe = keyframes[currentKeyframe.current]
          api.start({
            position: nextKeyframe.position,
            lookAt: nextKeyframe.lookAt,
            fov: nextKeyframe.fov || 75,
            config: {
              duration: nextKeyframe.duration || adjustedDuration / keyframes.length
            }
          })
        } else if (loop) {
          // Restart from beginning
          currentKeyframe.current = 0
          const firstKeyframe = keyframes[0]
          api.start({
            position: firstKeyframe.position,
            lookAt: firstKeyframe.lookAt,
            fov: firstKeyframe.fov || 75
          })
        } else {
          // Animation complete
          onComplete?.()
        }
      }
    }
  }, [keyframes, adjustedDuration, loop])

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && enabled && keyframes.length > 1) {
      currentKeyframe.current = 0
      const firstKeyframe = keyframes[0]
      api.start({
        position: firstKeyframe.position,
        lookAt: firstKeyframe.lookAt,
        fov: firstKeyframe.fov || 75
      })
    }
  }, [autoPlay, enabled, keyframes, api])

  // Apply spring values to camera
  useFrame(() => {
    if (enabled) {
      camera.position.set(...springs.position.get())
      camera.lookAt(...springs.lookAt.get())
      camera.fov = springs.fov.get()
      camera.updateProjectionMatrix()
    }
  })

  return null
}

// Gesture animation system for avatars
export function GestureAnimationController({
  gestureType,
  intensity = 1,
  duration = 1000,
  onComplete
}: {
  gestureType: 'wave' | 'point' | 'nod' | 'examine' | 'write' | 'breathe' | 'cough'
  intensity?: number
  duration?: number
  onComplete?: () => void
}) {
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()
  
  const adjustedDuration = capabilities.isLowSpec ? duration * 0.7 : duration
  const enabled = optimizedSettings.enableAnimations

  // Define gesture keyframes
  const gestureKeyframes = useMemo(() => {
    const baseIntensity = enabled ? intensity : 0
    
    switch (gestureType) {
      case 'wave':
        return {
          rightArm: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 },
            { rotation: [0, 0, Math.PI / 4 * baseIntensity], duration: adjustedDuration * 0.3 },
            { rotation: [0, 0, -Math.PI / 6 * baseIntensity], duration: adjustedDuration * 0.3 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 }
          ]
        }
      
      case 'point':
        return {
          rightArm: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.3 },
            { rotation: [-Math.PI / 3 * baseIntensity, 0, Math.PI / 6 * baseIntensity], duration: adjustedDuration * 0.4 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.3 }
          ]
        }
      
      case 'nod':
        return {
          head: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.3 },
            { rotation: [Math.PI / 12 * baseIntensity, 0, 0], duration: adjustedDuration * 0.4 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.3 }
          ]
        }
      
      case 'examine':
        return {
          head: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 },
            { rotation: [0, Math.PI / 8 * baseIntensity, 0], duration: adjustedDuration * 0.3 },
            { rotation: [0, -Math.PI / 8 * baseIntensity, 0], duration: adjustedDuration * 0.3 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 }
          ],
          rightArm: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.4 },
            { rotation: [-Math.PI / 4 * baseIntensity, 0, Math.PI / 6 * baseIntensity], duration: adjustedDuration * 0.6 }
          ]
        }
      
      case 'write':
        return {
          rightArm: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 },
            { rotation: [-Math.PI / 2 * baseIntensity, 0, Math.PI / 4 * baseIntensity], duration: adjustedDuration * 0.3 },
            { rotation: [-Math.PI / 2 * baseIntensity, 0, Math.PI / 3 * baseIntensity], duration: adjustedDuration * 0.3 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 }
          ]
        }
      
      case 'breathe':
        return {
          chest: [
            { scale: [1, 1, 1], duration: adjustedDuration * 0.5 },
            { scale: [1.05 * baseIntensity, 1.03 * baseIntensity, 1.02 * baseIntensity], duration: adjustedDuration * 0.5 }
          ]
        }
      
      case 'cough':
        return {
          head: [
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.3 },
            { rotation: [Math.PI / 6 * baseIntensity, 0, 0], duration: adjustedDuration * 0.2 },
            { rotation: [0, 0, 0], duration: adjustedDuration * 0.2 },
            { rotation: [Math.PI / 8 * baseIntensity, 0, 0], duration: adjustedDuration * 0.3 }
          ],
          chest: [
            { scale: [1, 1, 1], duration: adjustedDuration * 0.4 },
            { scale: [0.95, 0.98, 0.98], duration: adjustedDuration * 0.3 },
            { scale: [1, 1, 1], duration: adjustedDuration * 0.3 }
          ]
        }
      
      default:
        return {}
    }
  }, [gestureType, intensity, adjustedDuration, enabled])

  // This would typically be used by avatar components to animate specific body parts
  // The actual implementation would depend on the avatar's bone structure
  
  useEffect(() => {
    if (enabled) {
      // Trigger gesture animation
      // This would be implemented by the specific avatar component
      const timer = setTimeout(() => {
        onComplete?.()
      }, adjustedDuration)
      
      return () => clearTimeout(timer)
    } else {
      onComplete?.()
    }
  }, [gestureType, enabled, adjustedDuration, onComplete])

  return null
}

// Tweening helpers for agent recommendations
export function useTweenHelper() {
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()

  return useMemo(() => ({
    // Smooth value interpolation
    smoothTo: (value: number, target: number, factor = 0.1) => {
      if (!optimizedSettings.enableAnimations) return target
      const adjustedFactor = capabilities.isLowSpec ? factor * 2 : factor
      return value + (target - value) * adjustedFactor
    },

    // Elastic ease for UI feedback
    elasticEase: (t: number) => {
      if (!optimizedSettings.enableAnimations) return 1
      return t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)
    },

    // Bounce ease for avatar reactions
    bounceEase: (t: number) => {
      if (!optimizedSettings.enableAnimations) return 1
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    },

    // Recommended animation duration based on device
    getAnimationDuration: (baseDuration: number) => {
      if (!optimizedSettings.enableAnimations) return 0
      return capabilities.isLowSpec ? baseDuration * 0.7 : baseDuration
    },

    // Performance-aware delay
    getAnimationDelay: (baseDelay: number) => {
      if (!optimizedSettings.enableAnimations) return 0
      return capabilities.isLowSpec ? baseDelay * 0.5 : baseDelay
    }
  }), [capabilities, optimizedSettings])
}
