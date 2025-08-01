'use client'
import { forwardRef, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group, Mesh, Material, Color } from 'three'
import { usePatient3DStore } from './store/patient3DStore'

interface Patient3DAvatarProps {
  position?: [number, number, number]
  scale?: [number, number, number]
}

const Patient3DAvatar = forwardRef<Group, Patient3DAvatarProps>(
  ({ position = [0, 0, 0], scale = [1, 1, 1] }, ref) => {
    const groupRef = useRef<Group>(null)
    const { patientAvatarState, actions } = usePatient3DStore()
    
    // Cargar modelo 3D (usando un modelo simple por ahora)
    const { nodes, materials, animations } = useGLTF('/models/patient-avatar.glb') || {
      nodes: {},
      materials: {},
      animations: []
    }
    
    const { actions: animationActions } = useAnimations(animations, groupRef)
    
    // Mapeo de partes del cuerpo para interacción
    const bodyPartsMap = useMemo(() => ({
      cabeza: ['head', 'skull', 'face'],
      cuello: ['neck', 'throat'],
      torax: ['chest', 'thorax', 'ribs'],
      abdomen: ['abdomen', 'belly', 'stomach'],
      brazo_derecho: ['right_arm', 'right_shoulder', 'right_elbow', 'right_forearm', 'right_hand'],
      brazo_izquierdo: ['left_arm', 'left_shoulder', 'left_elbow', 'left_forearm', 'left_hand'],
      pierna_derecha: ['right_leg', 'right_thigh', 'right_knee', 'right_calf', 'right_foot'],
      pierna_izquierda: ['left_leg', 'left_thigh', 'left_knee', 'left_calf', 'left_foot'],
      espalda: ['back', 'spine', 'lumbar'],
      pelvis: ['pelvis', 'hip', 'buttocks']
    }), [])
    
    // Materiales originales para restaurar
    const originalMaterials = useRef<Map<Mesh, Material>>(new Map())
    
    // Función para resaltar partes del cuerpo
    const highlightBodyPart = (partName: string, highlight: boolean) => {
      if (!groupRef.current) return
      
      const partsToHighlight = bodyPartsMap[partName as keyof typeof bodyPartsMap] || []
      
      groupRef.current.traverse((child) => {
        if (child instanceof Mesh) {
          const childName = child.name.toLowerCase()
          
          if (partsToHighlight.some(part => childName.includes(part))) {
            if (highlight) {
              // Guardar material original si no se ha guardado
              if (!originalMaterials.current.has(child)) {
                originalMaterials.current.set(child, child.material.clone())
              }
              
              // Aplicar material de resaltado
              const highlightMaterial = child.material.clone()
              highlightMaterial.color = new Color(0xff6b6b)
              highlightMaterial.emissive = new Color(0x330000)
              highlightMaterial.transparent = true
              highlightMaterial.opacity = 0.8
              child.material = highlightMaterial
            } else {
              // Restaurar material original
              const originalMaterial = originalMaterials.current.get(child)
              if (originalMaterial) {
                child.material = originalMaterial
              }
            }
          }
        }
      })
    }
    
    // Efecto para manejar animaciones
    useEffect(() => {
      if (animationActions[patientAvatarState.currentAnimation]) {
        // Detener todas las animaciones
        Object.values(animationActions).forEach(action => action?.stop())
        
        // Reproducir la animación actual
        const currentAction = animationActions[patientAvatarState.currentAnimation]
        if (currentAction) {
          currentAction.reset().fadeIn(0.5).play()
        }
      }
    }, [patientAvatarState.currentAnimation, animationActions])
    
    // Efecto para manejar resaltado de partes del cuerpo
    useEffect(() => {
      if (patientAvatarState.isHighlighting) {
        patientAvatarState.highlightedBodyParts.forEach(part => {
          highlightBodyPart(part, true)
        })
      } else {
        // Limpiar todos los resaltados
        Object.keys(bodyPartsMap).forEach(part => {
          highlightBodyPart(part, false)
        })
      }
    }, [patientAvatarState.isHighlighting, patientAvatarState.highlightedBodyParts, bodyPartsMap])
    
    // Función para manejar clics en el modelo
    const handleModelClick = (event: any) => {
      event.stopPropagation()
      
      // Raycasting para detectar qué parte se clickeó
      const clickedMesh = event.object
      if (clickedMesh instanceof Mesh) {
        const meshName = clickedMesh.name.toLowerCase()
        
        // Encontrar qué parte del cuerpo corresponde
        for (const [bodyPart, keywords] of Object.entries(bodyPartsMap)) {
          if (keywords.some(keyword => meshName.includes(keyword))) {
            actions.updatePatientAvatar({
              selectedRegion: bodyPart,
              highlightedBodyParts: [bodyPart],
              isHighlighting: true
            })
            break
          }
        }
      }
    }
    
    // Frame loop para animaciones adicionales
    useFrame((state) => {
      if (groupRef.current) {
        // Rotación suave del modelo
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        
        // Respiración simulada
        const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
        groupRef.current.scale.setScalar(breathingScale)
      }
    })
    
    // Si no hay modelo cargado, mostrar solo un mensaje minimalista
    if (!nodes || Object.keys(nodes).length === 0) {
      return (
        <group ref={groupRef} position={position} scale={scale}>
          {/* Sin modelo 3D disponible */}
        </group>
      )
    }
    
    return (
      <group ref={groupRef} position={position} scale={scale}>
        {/* Renderizar los nodos del modelo GLTF */}
        {Object.entries(nodes).map(([name, node]) => {
          if (node && typeof node === 'object' && 'geometry' in node) {
            return (
              <mesh
                key={name}
                geometry={node.geometry}
                material={materials[node.material?.name || ''] || materials[Object.keys(materials)[0]]}
                onClick={handleModelClick}
                onPointerOver={(e) => {
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={(e) => {
                  document.body.style.cursor = 'default'
                }}
              />
            )
          }
          return null
        })}
      </group>
    )
  }
)

Patient3DAvatar.displayName = 'Patient3DAvatar'

export default Patient3DAvatar