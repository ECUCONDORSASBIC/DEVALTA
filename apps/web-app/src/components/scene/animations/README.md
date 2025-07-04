# Advanced Animation System with @react-spring/three

This implementation provides a comprehensive animation system for the Altamedica 3D medical scene with performance optimization and device adaptation.

## Features Implemented

### ✅ @react-spring/three Integration
- **SpringCameraController**: Smooth camera transitions with easing
- **CameraDollyAnimation**: Keyframe-based camera movements for scene intros
- **SpringAnimatedObject**: Physics-based object animations
- **FadeInAnimation**: Smooth fade-in for questionnaires and UI elements

### ✅ GLTF Animation Support via Drei's useAnimations
- Integrated into PatientAvatar and DoctorAvatar components
- Automatic animation loading and control
- Gesture-based animation system for medical interactions

### ✅ Advanced Gesture System
- **GestureAnimationController**: Predefined gestures for avatars
  - Wave, Point, Nod, Examine, Write, Breathe, Cough
- Contextual avatar animations based on medical procedures
- Intensity and duration controls

### ✅ Performance Optimization & Device Detection
- **useDeviceCapabilities**: Comprehensive device detection
  - CPU cores, memory, mobile detection
  - WebGL capabilities assessment
  - Performance classification
- **useOptimizedSettings**: Adaptive quality settings
- **usePerformanceMonitor**: Real-time FPS and memory monitoring
- **useAdaptiveQuality**: Dynamic quality adjustment

### ✅ 60 FPS Targeting with Fallbacks
- **Low-poly avatar system**: Simplified models for low-spec devices
- **Adaptive frame rate targeting**: 30 FPS for mobile, 60 FPS for desktop
- **Performance-based quality scaling**: Automatic reduction when needed

### ✅ Tweening Helpers for Agent Recommendations
- **useTweenHelper**: Performance-aware animation utilities
  - Smooth interpolation functions
  - Elastic and bounce easing
  - Device-optimized duration calculations

## Component Architecture

```
animations/
├── SpringAnimationSystem.tsx    # Core animation components
├── index.ts                    # Exports
└── README.md                   # This file

components/
├── LowPolyAvatar.tsx          # Fallback avatar system
├── PatientAvatar.tsx          # Enhanced with animations
└── DoctorAvatar.tsx           # Enhanced with animations

utils/
└── device-detection.ts        # Performance utilities

demo/
└── PerformanceDemo.tsx        # Complete demo showcase
```

## Usage Examples

### 1. Camera Dolly Animation
```tsx
<CameraDollyAnimation
  keyframes={[
    { position: [0, 2, 5], lookAt: [0, 0, 0], fov: 75, duration: 2000 },
    { position: [2, 3, 3], lookAt: [1, 1, -1], fov: 65, duration: 2000 }
  ]}
  duration={4000}
  autoPlay={true}
  loop={false}
  onComplete={() => console.log('Animation complete')}
/>
```

### 2. Fade-in Questionnaire
```tsx
<FadeInAnimation 
  trigger={showQuestionnaire}
  duration={800}
  from={{ opacity: 0, scale: 0.9 }}
  to={{ opacity: 1, scale: 1 }}
>
  <QuestionnairePanel />
</FadeInAnimation>
```

### 3. Device-Adaptive Avatar
```tsx
// Automatically switches between high-poly and low-poly based on device
<PatientAvatar
  position={[1, 0, -1]}
  animationName="breathing"
  isAnimationPlaying={true}
  enableAnamnesisSync={true}
/>
```

### 4. Performance Monitoring
```tsx
function PerformanceAwareComponent() {
  const { fps, memoryUsage } = usePerformanceMonitor()
  const qualityLevel = useAdaptiveQuality(60)
  const optimizedSettings = useOptimizedSettings()
  
  return (
    <div>
      FPS: {fps} | Quality: {qualityLevel}
      {optimizedSettings.enableAnimations && <AnimatedContent />}
    </div>
  )
}
```

## Performance Optimizations

### Device Detection Strategy
- **Memory**: < 4GB = Low-spec
- **CPU**: < 4 cores = Low-spec  
- **Mobile**: Automatic low-spec classification
- **WebGL**: Texture size and RTT support detection

### Fallback System
```tsx
const shouldUseLowPoly = useMemo(() => {
  return capabilities.isLowSpec || !optimizedSettings.enableAnimations
}, [capabilities.isLowSpec, optimizedSettings.enableAnimations])

if (shouldUseLowPoly) {
  return <LowPolyAvatar {...props} />
}
return <HighQualityAvatar {...props} />
```

### Quality Levels
- **High**: Full animations, shadows, antialiasing, high-poly models
- **Medium**: Reduced particles, simplified shadows
- **Low**: Low-poly models, disabled effects, 30 FPS target

## Animation Configuration

### Spring Configuration Types
```tsx
interface SpringAnimationConfig {
  enabled: boolean
  duration: number
  easing: keyof typeof config
  delay?: number
}

interface CameraAnimationConfig extends SpringAnimationConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
}
```

### Gesture Types
- `wave`: Friendly greeting gesture
- `point`: Directional pointing
- `nod`: Agreement/acknowledgment
- `examine`: Medical examination motion
- `write`: Note-taking gesture
- `breathe`: Patient breathing animation
- `cough`: Symptom demonstration

## Performance Metrics

### Target Performance
- **Desktop High-spec**: 60 FPS, full quality
- **Desktop Low-spec**: 45-60 FPS, medium quality
- **Mobile**: 30 FPS, low quality with low-poly models
- **Memory**: < 100MB for scene

### Monitoring
- Real-time FPS tracking
- Memory usage monitoring
- Adaptive quality adjustment
- Performance warnings in development

## Integration with Medical Workflow

### Anamnesis Integration
- Questionnaire fade-ins synchronized with patient interaction
- Body part highlighting with smooth transitions
- Progress indicator animations
- Step transition effects

### Medical Device Interactions
- Smooth camera focus transitions
- Device highlight animations
- Measurement result presentations
- Contextual avatar gestures

## Browser Compatibility

### Supported Features
- WebGL 1.0/2.0 with fallbacks
- deviceMemory API (where available)
- hardwareConcurrency detection
- prefers-reduced-motion support

### Fallback Strategy
- No WebGL: Static 2D fallback
- Low memory: Aggressive optimization
- Reduced motion preference: Disable animations
- Old browsers: Graceful degradation

## Testing

Run the performance demo:
```bash
# Navigate to performance demo
/apps/web-app/src/components/scene/demo/PerformanceDemo.tsx
```

Features tested:
- Device capability detection
- Low-poly fallback rendering
- Animation performance scaling
- Memory usage optimization
- FPS targeting accuracy

## Future Enhancements

### Planned Features
- VR/AR adaptation for mobile devices
- Machine learning-based performance prediction
- Advanced medical gesture recognition
- Real-time quality adjustment algorithms
- WebXR integration for immersive experiences

### Performance Targets
- < 50ms animation response time
- < 16.67ms frame time (60 FPS)
- < 200MB peak memory usage
- Smooth operation on 3+ year old devices

This system ensures smooth, professional medical animations while maintaining excellent performance across all device types and specifications.
