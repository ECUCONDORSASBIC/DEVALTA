'use client'
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

// Types for scene controls
export interface CameraSettings {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  near: number
  far: number
}

export interface SceneSettings {
  showUI: boolean
  showVitals: boolean
  showDeviceInfo: boolean
  showProgressBar: boolean
  enableInteraction: boolean
  enableShadows: boolean
  enablePostProcessing: boolean
  ambientIntensity: number
  qualityLevel: 'low' | 'medium' | 'high'
}

export interface InteractionState {
  selectedObject?: string
  hoveredObject?: string
  activeDevice?: string
  isExamining: boolean
  interactionMode: 'none' | 'examine' | 'navigate' | 'device_interaction'
  availableInteractions: string[]
}

export interface SceneControlsState {
  // Camera and view
  camera: CameraSettings
  
  // Scene settings
  scene: SceneSettings
  
  // Interaction state
  interaction: InteractionState
  
  // Animation state
  animations: {
    patientAnimation: string
    doctorAnimation: string
    isAnimationPlaying: boolean
    animationSpeed: number
  }
  
  // Performance monitoring
  performance: {
    fps: number
    renderTime: number
    memoryUsage: number
    isOptimizationEnabled: boolean
  }
  
  // Debug mode
  debug: {
    enabled: boolean
    showStats: boolean
    showHelpers: boolean
    showWireframe: boolean
  }
}

// Action types
type SceneControlsAction =
  | { type: 'SET_CAMERA_POSITION'; payload: [number, number, number] }
  | { type: 'SET_CAMERA_TARGET'; payload: [number, number, number] }
  | { type: 'SET_CAMERA_FOV'; payload: number }
  | { type: 'RESET_CAMERA' }
  | { type: 'UPDATE_SCENE_SETTINGS'; payload: Partial<SceneSettings> }
  | { type: 'SET_SELECTED_OBJECT'; payload: string | undefined }
  | { type: 'SET_HOVERED_OBJECT'; payload: string | undefined }
  | { type: 'SET_ACTIVE_DEVICE'; payload: string | undefined }
  | { type: 'SET_INTERACTION_MODE'; payload: InteractionState['interactionMode'] }
  | { type: 'SET_EXAMINING'; payload: boolean }
  | { type: 'ADD_AVAILABLE_INTERACTION'; payload: string }
  | { type: 'REMOVE_AVAILABLE_INTERACTION'; payload: string }
  | { type: 'SET_PATIENT_ANIMATION'; payload: string }
  | { type: 'SET_DOCTOR_ANIMATION'; payload: string }
  | { type: 'TOGGLE_ANIMATION_PLAYING' }
  | { type: 'SET_ANIMATION_SPEED'; payload: number }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<SceneControlsState['performance']> }
  | { type: 'TOGGLE_DEBUG' }
  | { type: 'UPDATE_DEBUG_SETTINGS'; payload: Partial<SceneControlsState['debug']> }
  | { type: 'OPTIMIZE_FOR_DEVICE'; payload: 'mobile' | 'desktop' | 'auto' }

// Default camera settings
const DEFAULT_CAMERA: CameraSettings = {
  position: [0, 2, 5],
  target: [0, 0, 0],
  fov: 75,
  near: 0.1,
  far: 1000
}

// Default scene settings
const DEFAULT_SCENE: SceneSettings = {
  showUI: true,
  showVitals: true,
  showDeviceInfo: true,
  showProgressBar: true,
  enableInteraction: true,
  enableShadows: true,
  enablePostProcessing: true,
  ambientIntensity: 0.5,
  qualityLevel: 'high'
}

// Initial state
const initialState: SceneControlsState = {
  camera: DEFAULT_CAMERA,
  scene: DEFAULT_SCENE,
  interaction: {
    selectedObject: undefined,
    hoveredObject: undefined,
    activeDevice: undefined,
    isExamining: false,
    interactionMode: 'none',
    availableInteractions: []
  },
  animations: {
    patientAnimation: 'idle',
    doctorAnimation: 'examining',
    isAnimationPlaying: true,
    animationSpeed: 1.0
  },
  performance: {
    fps: 60,
    renderTime: 16,
    memoryUsage: 0,
    isOptimizationEnabled: false
  },
  debug: {
    enabled: false,
    showStats: false,
    showHelpers: false,
    showWireframe: false
  }
}

// Reducer function
function sceneControlsReducer(state: SceneControlsState, action: SceneControlsAction): SceneControlsState {
  switch (action.type) {
    case 'SET_CAMERA_POSITION':
      return {
        ...state,
        camera: { ...state.camera, position: action.payload }
      }

    case 'SET_CAMERA_TARGET':
      return {
        ...state,
        camera: { ...state.camera, target: action.payload }
      }

    case 'SET_CAMERA_FOV':
      return {
        ...state,
        camera: { ...state.camera, fov: action.payload }
      }

    case 'RESET_CAMERA':
      return {
        ...state,
        camera: DEFAULT_CAMERA
      }

    case 'UPDATE_SCENE_SETTINGS':
      return {
        ...state,
        scene: { ...state.scene, ...action.payload }
      }

    case 'SET_SELECTED_OBJECT':
      return {
        ...state,
        interaction: { ...state.interaction, selectedObject: action.payload }
      }

    case 'SET_HOVERED_OBJECT':
      return {
        ...state,
        interaction: { ...state.interaction, hoveredObject: action.payload }
      }

    case 'SET_ACTIVE_DEVICE':
      return {
        ...state,
        interaction: { 
          ...state.interaction, 
          activeDevice: action.payload,
          interactionMode: action.payload ? 'device_interaction' : 'none'
        }
      }

    case 'SET_INTERACTION_MODE':
      return {
        ...state,
        interaction: { ...state.interaction, interactionMode: action.payload }
      }

    case 'SET_EXAMINING':
      return {
        ...state,
        interaction: { ...state.interaction, isExamining: action.payload }
      }

    case 'ADD_AVAILABLE_INTERACTION':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          availableInteractions: [...state.interaction.availableInteractions, action.payload]
        }
      }

    case 'REMOVE_AVAILABLE_INTERACTION':
      return {
        ...state,
        interaction: {
          ...state.interaction,
          availableInteractions: state.interaction.availableInteractions.filter(
            interaction => interaction !== action.payload
          )
        }
      }

    case 'SET_PATIENT_ANIMATION':
      return {
        ...state,
        animations: { ...state.animations, patientAnimation: action.payload }
      }

    case 'SET_DOCTOR_ANIMATION':
      return {
        ...state,
        animations: { ...state.animations, doctorAnimation: action.payload }
      }

    case 'TOGGLE_ANIMATION_PLAYING':
      return {
        ...state,
        animations: { 
          ...state.animations, 
          isAnimationPlaying: !state.animations.isAnimationPlaying 
        }
      }

    case 'SET_ANIMATION_SPEED':
      return {
        ...state,
        animations: { ...state.animations, animationSpeed: action.payload }
      }

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      }

    case 'TOGGLE_DEBUG':
      return {
        ...state,
        debug: { ...state.debug, enabled: !state.debug.enabled }
      }

    case 'UPDATE_DEBUG_SETTINGS':
      return {
        ...state,
        debug: { ...state.debug, ...action.payload }
      }

    case 'OPTIMIZE_FOR_DEVICE':
      const optimizations = getDeviceOptimizations(action.payload)
      return {
        ...state,
        scene: { ...state.scene, ...optimizations.scene },
        performance: { ...state.performance, isOptimizationEnabled: true }
      }

    default:
      return state
  }
}

// Device optimization presets
function getDeviceOptimizations(deviceType: 'mobile' | 'desktop' | 'auto') {
  const isMobile = deviceType === 'mobile' || 
    (deviceType === 'auto' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

  if (isMobile) {
    return {
      scene: {
        enableShadows: false,
        enablePostProcessing: false,
        qualityLevel: 'low' as const,
        ambientIntensity: 0.8
      }
    }
  } else {
    return {
      scene: {
        enableShadows: true,
        enablePostProcessing: true,
        qualityLevel: 'high' as const,
        ambientIntensity: 0.5
      }
    }
  }
}

// Context
interface SceneControlsContextType {
  state: SceneControlsState
  actions: {
    // Camera controls
    setCameraPosition: (position: [number, number, number]) => void
    setCameraTarget: (target: [number, number, number]) => void
    setCameraFOV: (fov: number) => void
    resetCamera: () => void
    
    // Scene controls
    updateSceneSettings: (settings: Partial<SceneSettings>) => void
    toggleUI: () => void
    toggleShadows: () => void
    
    // Interaction controls
    setSelectedObject: (objectId?: string) => void
    setHoveredObject: (objectId?: string) => void
    setActiveDevice: (deviceId?: string) => void
    setInteractionMode: (mode: InteractionState['interactionMode']) => void
    setExamining: (examining: boolean) => void
    addAvailableInteraction: (interaction: string) => void
    removeAvailableInteraction: (interaction: string) => void
    
    // Animation controls
    setPatientAnimation: (animation: string) => void
    setDoctorAnimation: (animation: string) => void
    toggleAnimationPlaying: () => void
    setAnimationSpeed: (speed: number) => void
    
    // Performance monitoring
    updatePerformance: (metrics: Partial<SceneControlsState['performance']>) => void
    
    // Debug controls
    toggleDebug: () => void
    updateDebugSettings: (settings: Partial<SceneControlsState['debug']>) => void
    
    // Device optimization
    optimizeForDevice: (deviceType: 'mobile' | 'desktop' | 'auto') => void
  }
}

const SceneControlsContext = createContext<SceneControlsContextType | undefined>(undefined)

// Provider component
interface SceneControlsProviderProps {
  children: ReactNode
}

export function SceneControlsProvider({ children }: SceneControlsProviderProps) {
  const [state, dispatch] = useReducer(sceneControlsReducer, initialState)

  const actions = {
    // Camera controls
    setCameraPosition: useCallback((position: [number, number, number]) => {
      dispatch({ type: 'SET_CAMERA_POSITION', payload: position })
    }, []),

    setCameraTarget: useCallback((target: [number, number, number]) => {
      dispatch({ type: 'SET_CAMERA_TARGET', payload: target })
    }, []),

    setCameraFOV: useCallback((fov: number) => {
      dispatch({ type: 'SET_CAMERA_FOV', payload: fov })
    }, []),

    resetCamera: useCallback(() => {
      dispatch({ type: 'RESET_CAMERA' })
    }, []),

    // Scene controls
    updateSceneSettings: useCallback((settings: Partial<SceneSettings>) => {
      dispatch({ type: 'UPDATE_SCENE_SETTINGS', payload: settings })
    }, []),

    toggleUI: useCallback(() => {
      dispatch({ 
        type: 'UPDATE_SCENE_SETTINGS', 
        payload: { showUI: !state.scene.showUI }
      })
    }, [state.scene.showUI]),

    toggleShadows: useCallback(() => {
      dispatch({ 
        type: 'UPDATE_SCENE_SETTINGS', 
        payload: { enableShadows: !state.scene.enableShadows }
      })
    }, [state.scene.enableShadows]),

    // Interaction controls
    setSelectedObject: useCallback((objectId?: string) => {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: objectId })
    }, []),

    setHoveredObject: useCallback((objectId?: string) => {
      dispatch({ type: 'SET_HOVERED_OBJECT', payload: objectId })
    }, []),

    setActiveDevice: useCallback((deviceId?: string) => {
      dispatch({ type: 'SET_ACTIVE_DEVICE', payload: deviceId })
    }, []),

    setInteractionMode: useCallback((mode: InteractionState['interactionMode']) => {
      dispatch({ type: 'SET_INTERACTION_MODE', payload: mode })
    }, []),

    setExamining: useCallback((examining: boolean) => {
      dispatch({ type: 'SET_EXAMINING', payload: examining })
    }, []),

    addAvailableInteraction: useCallback((interaction: string) => {
      dispatch({ type: 'ADD_AVAILABLE_INTERACTION', payload: interaction })
    }, []),

    removeAvailableInteraction: useCallback((interaction: string) => {
      dispatch({ type: 'REMOVE_AVAILABLE_INTERACTION', payload: interaction })
    }, []),

    // Animation controls
    setPatientAnimation: useCallback((animation: string) => {
      dispatch({ type: 'SET_PATIENT_ANIMATION', payload: animation })
    }, []),

    setDoctorAnimation: useCallback((animation: string) => {
      dispatch({ type: 'SET_DOCTOR_ANIMATION', payload: animation })
    }, []),

    toggleAnimationPlaying: useCallback(() => {
      dispatch({ type: 'TOGGLE_ANIMATION_PLAYING' })
    }, []),

    setAnimationSpeed: useCallback((speed: number) => {
      dispatch({ type: 'SET_ANIMATION_SPEED', payload: speed })
    }, []),

    // Performance monitoring
    updatePerformance: useCallback((metrics: Partial<SceneControlsState['performance']>) => {
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics })
    }, []),

    // Debug controls
    toggleDebug: useCallback(() => {
      dispatch({ type: 'TOGGLE_DEBUG' })
    }, []),

    updateDebugSettings: useCallback((settings: Partial<SceneControlsState['debug']>) => {
      dispatch({ type: 'UPDATE_DEBUG_SETTINGS', payload: settings })
    }, []),

    // Device optimization
    optimizeForDevice: useCallback((deviceType: 'mobile' | 'desktop' | 'auto') => {
      dispatch({ type: 'OPTIMIZE_FOR_DEVICE', payload: deviceType })
    }, [])
  }

  return (
    <SceneControlsContext.Provider value={{ state, actions }}>
      {children}
    </SceneControlsContext.Provider>
  )
}

// Hook to use the context
export function useSceneControls() {
  const context = useContext(SceneControlsContext)
  if (context === undefined) {
    throw new Error('useSceneControls must be used within a SceneControlsProvider')
  }
  return context
}
