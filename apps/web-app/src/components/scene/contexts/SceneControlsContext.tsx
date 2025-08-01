// components/scene/contexts/SceneControlsContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SceneControls {
  isRotating: boolean
  isZooming: boolean
  isPanning: boolean
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
}

interface SceneControlsContextType {
  controls: SceneControls
  setControls: React.Dispatch<React.SetStateAction<SceneControls>>
  resetCamera: () => void
  toggleRotation: () => void
}

const defaultControls: SceneControls = {
  isRotating: false,
  isZooming: false,
  isPanning: false,
  cameraPosition: [0, 5, 10],
  targetPosition: [0, 0, 0]
}

const SceneControlsContext = createContext<SceneControlsContextType | undefined>(undefined)

export function SceneControlsProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<SceneControls>(defaultControls)

  const resetCamera = () => {
    setControls(prev => ({
      ...prev,
      cameraPosition: [0, 5, 10],
      targetPosition: [0, 0, 0]
    }))
  }

  const toggleRotation = () => {
    setControls(prev => ({
      ...prev,
      isRotating: !prev.isRotating
    }))
  }

  return (
    <SceneControlsContext.Provider value={{
      controls,
      setControls,
      resetCamera,
      toggleRotation
    }}>
      {children}
    </SceneControlsContext.Provider>
  )
}

export function useSceneControls() {
  const context = useContext(SceneControlsContext)
  if (context === undefined) {
    throw new Error('useSceneControls must be used within a SceneControlsProvider')
  }
  return context
} 