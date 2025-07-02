'use client'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Nurse } from './Nurse'

export default function HospitalScene() {
  return (
    <Canvas>
      {/* Fondo EXR */}
      <Environment files="/textures/hospital_room_2_4k.exr" background />

      {/* Personaje médico */}
      <Nurse position={[0, 0, -2]} />

      {/* Aquí puedes agregar el robot y otros elementos */}
    </Canvas>
  )
} 