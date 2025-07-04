// Advanced Animation System Exports
export {
  SpringCameraController,
  SpringAnimatedObject,
  FadeInAnimation,
  CameraDollyAnimation,
  GestureAnimationController,
  useTweenHelper,
  type SpringAnimationConfig,
  type CameraAnimationConfig,
  type ObjectAnimationConfig
} from './SpringAnimationSystem'

// Low-poly avatar components for performance fallback
export {
  LowPolyAvatar,
  LowPolyPatientAvatar,
  LowPolyDoctorAvatar
} from '../components/LowPolyAvatar'

// Device detection and optimization utilities
export {
  useDeviceCapabilities,
  useOptimizedSettings,
  usePerformanceMonitor,
  useAdaptiveQuality,
  type DeviceCapabilities
} from '@/utils/device-detection'
