'use client'
import { useGLTF } from '@react-three/drei'

export function Nurse({ position = [0, 0, 0], ...props }: { position?: [number, number, number] }) {
  const { scene } = useGLTF('/models/nurse.glb')
  return (
    <primitive object={scene} position={position} {...props} />
  )
} 