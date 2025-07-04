'use client'
import { useMemo, useEffect, useState } from 'react'

export interface DeviceCapabilities {
  isLowSpec: boolean
  preferReducedMotion: boolean
  supportsMobileVR: boolean
  maxTextureSize: number
  supportsRTT: boolean
  cpuCores: number
  memoryGB: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  devicePixelRatio: number
  maxFPS: number
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  LOW_SPEC_MEMORY: 4, // GB
  LOW_SPEC_CORES: 4,
  MIN_TEXTURE_SIZE: 1024,
  HIGH_DPR_THRESHOLD: 2.5,
  MOBILE_VIEWPORT: 768,
  TABLET_VIEWPORT: 1024
}

/**
 * Detect device capabilities for 3D scene optimization
 */
export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isLowSpec: false,
    preferReducedMotion: false,
    supportsMobileVR: false,
    maxTextureSize: 2048,
    supportsRTT: true,
    cpuCores: 4,
    memoryGB: 8,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    devicePixelRatio: 1,
    maxFPS: 60
  })

  useEffect(() => {
    const detectCapabilities = async () => {
      // Basic device info
      const isMobile = window.innerWidth <= PERFORMANCE_THRESHOLDS.MOBILE_VIEWPORT
      const isTablet = window.innerWidth <= PERFORMANCE_THRESHOLDS.TABLET_VIEWPORT && !isMobile
      const isDesktop = !isMobile && !isTablet
      const devicePixelRatio = window.devicePixelRatio || 1

      // Memory detection
      const memory = (navigator as any).deviceMemory || 8
      const cpuCores = navigator.hardwareConcurrency || 4

      // Motion preferences
      const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // WebGL capabilities
      let maxTextureSize = 2048
      let supportsRTT = true
      
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
        
        if (gl) {
          maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
          supportsRTT = gl.getExtension('OES_texture_float') !== null
        }
      } catch (error) {
        console.warn('WebGL detection failed:', error)
      }

      // Performance classification
      const isLowSpec = (
        memory < PERFORMANCE_THRESHOLDS.LOW_SPEC_MEMORY ||
        cpuCores < PERFORMANCE_THRESHOLDS.LOW_SPEC_CORES ||
        maxTextureSize < PERFORMANCE_THRESHOLDS.MIN_TEXTURE_SIZE ||
        isMobile
      )

      // VR support detection
      const supportsMobileVR = isMobile && 'DeviceOrientationEvent' in window

      // Frame rate targets
      const maxFPS = isLowSpec || isMobile ? 30 : 60

      setCapabilities({
        isLowSpec,
        preferReducedMotion,
        supportsMobileVR,
        maxTextureSize,
        supportsRTT,
        cpuCores,
        memoryGB: memory,
        isMobile,
        isTablet,
        isDesktop,
        devicePixelRatio,
        maxFPS
      })
    }

    detectCapabilities()

    // Listen for viewport changes
    const handleResize = () => {
      detectCapabilities()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return capabilities
}

/**
 * Get optimized settings based on device capabilities
 */
export const useOptimizedSettings = () => {
  const capabilities = useDeviceCapabilities()

  return useMemo(() => {
    const {
      isLowSpec,
      isMobile,
      preferReducedMotion,
      maxFPS,
      devicePixelRatio
    } = capabilities

    return {
      // Render settings
      pixelRatio: Math.min(devicePixelRatio, isLowSpec ? 1.5 : 2),
      antialias: !isLowSpec,
      shadows: !isLowSpec && !isMobile,
      
      // Animation settings
      enableAnimations: !preferReducedMotion,
      animationQuality: isLowSpec ? 'low' : 'high',
      maxFPS,
      
      // Model settings
      modelComplexity: isLowSpec ? 'low' : 'high',
      textureQuality: isLowSpec ? 'medium' : 'high',
      
      // Effects settings
      enablePostprocessing: !isLowSpec,
      enableParticles: !isLowSpec,
      particleCount: isLowSpec ? 50 : 200,
      
      // Camera settings
      enableCameraTransitions: !preferReducedMotion,
      cameraTransitionDuration: isLowSpec ? 0.5 : 1.0
    }
  }, [capabilities])
}

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60)
  const [memoryUsage, setMemoryUsage] = useState(0)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measure = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime

        // Memory usage (if available)
        if ((performance as any).memory) {
          const memory = (performance as any).memory
          setMemoryUsage(memory.usedJSHeapSize / 1024 / 1024) // MB
        }
      }

      animationId = requestAnimationFrame(measure)
    }

    animationId = requestAnimationFrame(measure)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return { fps, memoryUsage }
}

/**
 * Adaptive quality manager
 */
export const useAdaptiveQuality = (targetFPS = 60) => {
  const { fps } = usePerformanceMonitor()
  const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>('high')

  useEffect(() => {
    if (fps < targetFPS * 0.8) {
      // Performance is suffering, reduce quality
      setQualityLevel(prev => {
        if (prev === 'high') return 'medium'
        if (prev === 'medium') return 'low'
        return 'low'
      })
    } else if (fps > targetFPS * 0.95) {
      // Performance is good, can increase quality
      setQualityLevel(prev => {
        if (prev === 'low') return 'medium'
        if (prev === 'medium') return 'high'
        return 'high'
      })
    }
  }, [fps, targetFPS])

  return qualityLevel
}
