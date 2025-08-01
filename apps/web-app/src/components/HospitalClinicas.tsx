'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function HospitalClinicas() {
  const { scene } = useGLTF('/models/hospital.glb')
  const hospitalRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (hospitalRef.current) {
      // Rotación suave del hospital
      hospitalRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <group ref={hospitalRef}>
      <primitive 
        object={scene} 
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
      />
      
      {/* Ventanas características del Hospital de Clínicas */}
      <HospitalWindows />
    </group>
  )
}

// Componente específico para las ventanas del Hospital de Clínicas
function HospitalWindows() {
  const windowRefs = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    // Efecto de brillo en las ventanas
    windowRefs.current.forEach((window, index) => {
      if (window && window.material) {
        const material = window.material as THREE.MeshBasicMaterial
        material.opacity = 0.6 + Math.sin(state.clock.elapsedTime + index * 0.5) * 0.2
      }
    })
  })

  // Crear ventanas características del Hospital de Clínicas José de San Martín
  const createWindows = () => {
    const windows = []
    const windowGeometry = new THREE.PlaneGeometry(1.2, 1.8)
    
    // Ventanas del edificio principal (fachada)
    for (let floor = 0; floor < 6; floor++) {
      for (let window = 0; window < 12; window++) {
        const windowMaterial = new THREE.MeshBasicMaterial({
          color: '#B8D4E3',
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        })

        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
        windowMesh.position.set(
          (window - 5.5) * 2.2,  // Distribución horizontal
          floor * 3.2 + 2,       // Distribución vertical por pisos
          15                      // Distancia desde el centro
        )
        
        windows.push(windowMesh)
      }
    }

    // Ventanas de los edificios laterales
    for (let floor = 0; floor < 4; floor++) {
      for (let window = 0; window < 6; window++) {
        // Edificio lateral izquierdo
        const leftWindowMaterial = new THREE.MeshBasicMaterial({
          color: '#A8C4D3',
          transparent: true,
          opacity: 0.6
        })
        const leftWindow = new THREE.Mesh(windowGeometry, leftWindowMaterial)
        leftWindow.position.set(
          -25,                    // Posición lateral izquierda
          floor * 3.2 + 2,
          (window - 2.5) * 2.5
        )
        windows.push(leftWindow)

        // Edificio lateral derecho
        const rightWindowMaterial = new THREE.MeshBasicMaterial({
          color: '#A8C4D3',
          transparent: true,
          opacity: 0.6
        })
        const rightWindow = new THREE.Mesh(windowGeometry, rightWindowMaterial)
        rightWindow.position.set(
          25,                     // Posición lateral derecha
          floor * 3.2 + 2,
          (window - 2.5) * 2.5
        )
        windows.push(rightWindow)
      }
    }

    return windows
  }

  const windows = createWindows()

  return (
    <group>
      {windows.map((window, index) => (
        <primitive
          key={index}
          object={window}
          ref={(el) => {
            if (el) windowRefs.current[index] = el
          }}
        />
      ))}
    </group>
  )
}

// Precargar el modelo
useGLTF.preload('/models/hospital.glb') 