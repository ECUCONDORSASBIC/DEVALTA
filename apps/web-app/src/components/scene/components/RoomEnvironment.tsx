'use client'
import { Environment, ContactShadows } from '@react-three/drei'
import { Color } from 'three'

interface RoomEnvironmentProps {
  hdriPath?: string
  background?: boolean
  intensity?: number
  ambientIntensity?: number
  showContactShadows?: boolean
}

export function RoomEnvironment({
  hdriPath = '/textures/hospital_room_2_4k.exr',
  background = true,
  intensity = 1,
  ambientIntensity = 0.5,
  showContactShadows = true
}: RoomEnvironmentProps) {
  return (
    <>
      {/* HDRI Environment */}
      <Environment 
        files={hdriPath} 
        background={background}
        environmentIntensity={intensity}
      />
      
      {/* Ambient Light */}
      <ambientLight intensity={ambientIntensity} color={new Color('#ffffff')} />
      
      {/* Directional Light for better shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color={new Color('#ffffff')}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Point lights for medical equipment illumination */}
      <pointLight
        position={[3, 3, 3]}
        intensity={0.6}
        color={new Color('#f0f8ff')}
        distance={10}
        decay={2}
      />
      
      <pointLight
        position={[-3, 3, 3]}
        intensity={0.4}
        color={new Color('#fff5ee')}
        distance={8}
        decay={2}
      />
      
      {/* Contact shadows for better grounding */}
      {showContactShadows && (
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.4}
          scale={20}
          blur={1.5}
          far={4.5}
        />
      )}
    </>
  )
}
