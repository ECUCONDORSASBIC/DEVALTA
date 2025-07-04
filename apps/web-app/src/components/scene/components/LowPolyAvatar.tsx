'use client'
import { useMemo, useRef } from 'react'
import { Group, BoxGeometry, SphereGeometry, CylinderGeometry } from 'three'
import { useFrame } from '@react-three/fiber'
import { GestureAnimationController } from '../animations/SpringAnimationSystem'

interface LowPolyAvatarProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  animationName?: string
  isAnimationPlaying?: boolean
  avatarType?: 'patient' | 'doctor'
  gestureType?: 'wave' | 'point' | 'nod' | 'examine' | 'write' | 'breathe' | 'cough'
  onAnimationFinish?: () => void
}

export function LowPolyAvatar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  animationName = 'idle',
  isAnimationPlaying = true,
  avatarType = 'patient',
  gestureType,
  onAnimationFinish
}: LowPolyAvatarProps) {
  const groupRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const bodyRef = useRef<Group>(null)
  const leftArmRef = useRef<Group>(null)
  const rightArmRef = useRef<Group>(null)
  const leftLegRef = useRef<Group>(null)
  const rightLegRef = useRef<Group>(null)

  // Colors based on avatar type
  const colors = useMemo(() => {
    if (avatarType === 'doctor') {
      return {
        skin: '#fdbcb4',
        clothes: '#ffffff', // White coat
        hair: '#8b4513',
        accent: '#4a90e2' // Stethoscope
      }
    } else {
      return {
        skin: '#fdbcb4',
        clothes: '#e6f3ff', // Patient gown
        hair: '#8b4513',
        accent: '#ff6b6b' // Patient identifier
      }
    }
  }, [avatarType])

  // Simple idle animation
  useFrame((state) => {
    if (!isAnimationPlaying) return

    const time = state.clock.elapsedTime
    
    // Breathing animation
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02
    }

    // Head slight movement
    if (headRef.current && animationName === 'idle') {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
    }

    // Arms slight sway
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = Math.sin(time * 1.2) * 0.05
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -Math.sin(time * 1.2) * 0.05
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Head */}
      <group ref={headRef} position={[0, 1.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Hair */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.16, 8, 4]} />
          <meshLambertMaterial color={colors.hair} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.05, 0.02, 0.12]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.12]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshLambertMaterial color="#000000" />
        </mesh>
      </group>

      {/* Body */}
      <group ref={bodyRef} position={[0, 1, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.6, 0.2]} />
          <meshLambertMaterial color={colors.clothes} />
        </mesh>
        
        {/* Doctor's stethoscope or patient accent */}
        {avatarType === 'doctor' && (
          <mesh position={[0, 0.2, 0.11]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
            <meshLambertMaterial color={colors.accent} />
          </mesh>
        )}
        
        {avatarType === 'patient' && (
          <mesh position={[0, 0.2, 0.11]}>
            <boxGeometry args={[0.15, 0.05, 0.02]} />
            <meshLambertMaterial color={colors.accent} />
          </mesh>
        )}
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.2, 1.2, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Lower arm */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.25, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Hand */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.2, 1.2, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Lower arm */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.25, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Hand */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.1, 0.4, 0]}>
        {/* Upper leg */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
          <meshLambertMaterial color={colors.clothes} />
        </mesh>
        
        {/* Lower leg */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.7, 0.05]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.1, 0.4, 0]}>
        {/* Upper leg */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
          <meshLambertMaterial color={colors.clothes} />
        </mesh>
        
        {/* Lower leg */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
          <meshLambertMaterial color={colors.skin} />
        </mesh>
        
        {/* Foot */}
        <mesh position={[0, -0.7, 0.05]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </group>

      {/* Patient bed (if patient) */}
      {avatarType === 'patient' && (
        <group position={[0, -0.5, 0]}>
          <mesh>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshLambertMaterial color="#f5f5f5" />
          </mesh>
          
          {/* Pillow */}
          <mesh position={[0, 0.1, 0.3]}>
            <boxGeometry args={[0.8, 0.15, 0.4]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Gesture animation controller */}
      {gestureType && (
        <GestureAnimationController
          gestureType={gestureType}
          duration={1500}
          onComplete={onAnimationFinish}
        />
      )}
    </group>
  )
}

// Simplified patient avatar specifically
export function LowPolyPatientAvatar(props: Omit<LowPolyAvatarProps, 'avatarType'>) {
  return <LowPolyAvatar {...props} avatarType="patient" />
}

// Simplified doctor avatar specifically
export function LowPolyDoctorAvatar(props: Omit<LowPolyAvatarProps, 'avatarType'>) {
  return <LowPolyAvatar {...props} avatarType="doctor" />
}
