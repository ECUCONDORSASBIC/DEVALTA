'use client'
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats, Text } from '@react-three/drei'
import { 
  useDeviceCapabilities, 
  usePerformanceMonitor, 
  useOptimizedSettings,
  useAdaptiveQuality 
} from '@/utils/device-detection'
import {
  SpringCameraController,
  FadeInAnimation,
  CameraDollyAnimation,
  GestureAnimationController,
  useTweenHelper
} from '../animations/SpringAnimationSystem'
import { LowPolyPatientAvatar, LowPolyDoctorAvatar } from '../components/LowPolyAvatar'
import { PatientAvatar } from '../components/PatientAvatar'
import { DoctorAvatar } from '../components/DoctorAvatar'

// Performance test scene
function PerformanceTestScene() {
  const capabilities = useDeviceCapabilities()
  const optimizedSettings = useOptimizedSettings()
  const { fps, memoryUsage } = usePerformanceMonitor()
  const qualityLevel = useAdaptiveQuality(60)
  const tweenHelper = useTweenHelper()
  
  const [animationTrigger, setAnimationTrigger] = useState(false)
  const [currentTest, setCurrentTest] = useState<'low-poly' | 'high-poly' | 'animations'>('low-poly')

  // Auto-cycle through tests
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTest(prev => {
        if (prev === 'low-poly') return 'high-poly'
        if (prev === 'high-poly') return 'animations'
        return 'low-poly'
      })
      setAnimationTrigger(prev => !prev)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Camera dolly keyframes for the demo
  const demoKeyframes = [
    { position: [0, 2, 5], lookAt: [0, 0, 0], fov: 75, duration: 2000 },
    { position: [3, 3, 3], lookAt: [1, 1, -1], fov: 65, duration: 2000 },
    { position: [-3, 2, 2], lookAt: [-1, 1, -1], fov: 70, duration: 2000 },
    { position: [0, 5, 8], lookAt: [0, 0, 0], fov: 85, duration: 2000 }
  ]

  return (
    <>
      {/* Performance Info Display */}
      <Text
        position={[-4, 4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="left"
        anchorY="top"
      >
        {`Performance Monitor:
FPS: ${fps}
Memory: ${memoryUsage.toFixed(1)}MB
Quality: ${qualityLevel}
Device: ${capabilities.isLowSpec ? 'Low-spec' : 'High-spec'}
Test: ${currentTest}`}
      </Text>

      {/* Device Capabilities Display */}
      <Text
        position={[4, 4, 0]}
        fontSize={0.25}
        color="cyan"
        anchorX="right"
        anchorY="top"
      >
        {`Device Info:
Mobile: ${capabilities.isMobile}
CPU Cores: ${capabilities.cpuCores}
Memory: ${capabilities.memoryGB}GB
DPR: ${capabilities.devicePixelRatio}
Max FPS: ${capabilities.maxFPS}`}
      </Text>

      {/* Settings Display */}
      <Text
        position={[0, -4, 0]}
        fontSize={0.2}
        color="yellow"
        anchorX="center"
        anchorY="bottom"
      >
        {`Optimized Settings:
Shadows: ${optimizedSettings.shadows}
Antialias: ${optimizedSettings.antialias}
Animations: ${optimizedSettings.enableAnimations}
Pixel Ratio: ${optimizedSettings.pixelRatio}
Model Complexity: ${optimizedSettings.modelComplexity}`}
      </Text>

      {/* Camera Controller Demo */}
      {currentTest === 'animations' && optimizedSettings.enableCameraTransitions && (
        <CameraDollyAnimation
          keyframes={demoKeyframes}
          duration={8000}
          autoPlay={true}
          loop={true}
        />
      )}

      {/* Avatar Performance Test */}
      {currentTest === 'low-poly' && (
        <FadeInAnimation trigger={animationTrigger} duration={800}>
          <LowPolyPatientAvatar
            position={[1, 0, -1]}
            animationName="breathing"
            isAnimationPlaying={true}
            gestureType="breathe"
          />
          <LowPolyDoctorAvatar
            position={[-1, 0, -1]}
            animationName="examining"
            isAnimationPlaying={true}
            gestureType="examine"
          />
        </FadeInAnimation>
      )}

      {currentTest === 'high-poly' && !capabilities.isLowSpec && (
        <FadeInAnimation trigger={animationTrigger} duration={800}>
          <PatientAvatar
            position={[1, 0, -1]}
            animationName="breathing"
            isAnimationPlaying={true}
            enableAnamnesisSync={false}
          />
          <DoctorAvatar
            position={[-1, 0, -1]}
            animationName="examining"
            isAnimationPlaying={true}
            lookAtTarget={[1, 1, -1]}
          />
        </FadeInAnimation>
      )}

      {/* Fallback message for high-poly on low-spec devices */}
      {currentTest === 'high-poly' && capabilities.isLowSpec && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.4}
          color="orange"
          anchorX="center"
          anchorY="center"
        >
          High-poly models disabled
          on low-spec device
        </Text>
      )}

      {/* Performance stress test objects */}
      {currentTest === 'animations' && (
        <>
          {Array.from({ length: optimizedSettings.particleCount / 10 }, (_, i) => (
            <FadeInAnimation
              key={i}
              trigger={animationTrigger}
              duration={tweenHelper.getAnimationDuration(1000)}
              delay={tweenHelper.getAnimationDelay(i * 50)}
            >
              <mesh 
                position={[
                  Math.sin(i * 0.5) * 3,
                  Math.cos(i * 0.3) * 2 + 2,
                  Math.sin(i * 0.7) * 2
                ]}
              >
                <sphereGeometry args={[0.1, 8, 6]} />
                <meshStandardMaterial 
                  color={`hsl(${i * 36}, 70%, 60%)`}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            </FadeInAnimation>
          ))}
        </>
      )}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow={optimizedSettings.shadows}
        shadow-mapSize-width={optimizedSettings.shadows ? 2048 : 512}
        shadow-mapSize-height={optimizedSettings.shadows ? 2048 : 512}
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow={optimizedSettings.shadows}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </>
  )
}

// Main Performance Demo Component
export function PerformanceDemo() {
  const optimizedSettings = useOptimizedSettings()
  const capabilities = useDeviceCapabilities()

  return (
    <div className="w-full h-screen bg-gray-900 relative">
      <Canvas
        shadows={optimizedSettings.shadows}
        camera={{ position: [0, 2, 5], fov: 75 }}
        gl={{
          antialias: optimizedSettings.antialias,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={optimizedSettings.pixelRatio}
        frameloop={optimizedSettings.enableAnimations ? "always" : "demand"}
      >
        <PerformanceTestScene />
        <OrbitControls enableDamping dampingFactor={0.05} />
        <Stats showPanel={0} />
      </Canvas>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-xs">
        <h3 className="font-bold mb-2">Performance Demo</h3>
        <p className="text-sm mb-2">
          This demo showcases the adaptive animation system with:
        </p>
        <ul className="text-xs space-y-1">
          <li>• Device capability detection</li>
          <li>• Low-poly fallback models</li>
          <li>• Smooth spring animations</li>
          <li>• Performance monitoring</li>
          <li>• Adaptive quality adjustment</li>
          <li>• 60 FPS targeting</li>
        </ul>
        
        <div className="mt-3 text-xs">
          <div className={`inline-block px-2 py-1 rounded ${
            capabilities.isLowSpec ? 'bg-orange-600' : 'bg-green-600'
          }`}>
            {capabilities.isLowSpec ? 'Low-spec Mode' : 'High-spec Mode'}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg">
        <h4 className="font-bold text-sm mb-2">Live Stats</h4>
        <div className="text-xs space-y-1">
          <div>Animations: {optimizedSettings.enableAnimations ? 'ON' : 'OFF'}</div>
          <div>Shadows: {optimizedSettings.shadows ? 'ON' : 'OFF'}</div>
          <div>Quality: {optimizedSettings.modelComplexity}</div>
          <div>Target FPS: {optimizedSettings.maxFPS}</div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDemo
