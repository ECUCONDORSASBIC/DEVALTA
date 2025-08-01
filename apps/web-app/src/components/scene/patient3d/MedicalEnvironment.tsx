'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { Mesh } from 'three'

export default function MedicalEnvironment() {
  const equipmentRef = useRef<Mesh>(null)
  const monitorRef = useRef<Mesh>(null)
  
  // Animación de equipos médicos
  useFrame((state) => {
    if (equipmentRef.current) {
      // Simular latidos del monitor cardíaco
      const heartbeat = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1
      equipmentRef.current.scale.setScalar(heartbeat)
    }
    
    if (monitorRef.current) {
      // Rotación suave del monitor
      monitorRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <group>
      {/* Camilla médica */}
      <Box 
        position={[0, 0.3, 0]} 
        args={[2, 0.1, 0.8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Patas de la camilla */}
      <Box position={[0.8, 0.15, 0.3]} args={[0.05, 0.3, 0.05]}>
        <meshStandardMaterial color="#444444" />
      </Box>
      <Box position={[-0.8, 0.15, 0.3]} args={[0.05, 0.3, 0.05]}>
        <meshStandardMaterial color="#444444" />
      </Box>
      <Box position={[0.8, 0.15, -0.3]} args={[0.05, 0.3, 0.05]}>
        <meshStandardMaterial color="#444444" />
      </Box>
      <Box position={[-0.8, 0.15, -0.3]} args={[0.05, 0.3, 0.05]}>
        <meshStandardMaterial color="#444444" />
      </Box>
      
      {/* Monitor de signos vitales */}
      <group position={[1.5, 1.5, 0]}>
        <Box 
          ref={monitorRef}
          args={[0.4, 0.3, 0.1]}
          castShadow
        >
          <meshStandardMaterial color="#2c3e50" />
        </Box>
        
        {/* Pantalla del monitor */}
        <Box position={[0, 0, 0.06]} args={[0.35, 0.25, 0.02]}>
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
        </Box>
        
        {/* Líneas del ECG simuladas */}
        <Box position={[0, 0, 0.07]} args={[0.3, 0.01, 0.001]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      </group>
      
      {/* Equipo de succión */}
      <group position={[-1.5, 0.8, 0]}>
        <Cylinder 
          args={[0.1, 0.1, 0.6, 16]}
          castShadow
        >
          <meshStandardMaterial color="#34495e" />
        </Cylinder>
        
        {/* Tubo de succión */}
        <Cylinder 
          position={[0, -0.4, 0]}
          args={[0.02, 0.02, 0.8, 8]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color="#95a5a6" />
        </Cylinder>
      </group>
      
      {/* Lámpara de examen */}
      <group position={[0, 2.5, 0]}>
        <Cylinder args={[0.05, 0.05, 0.3, 16]}>
          <meshStandardMaterial color="#7f8c8d" />
        </Cylinder>
        
        <Sphere args={[0.2, 16, 16]} position={[0, -0.25, 0]}>
          <meshStandardMaterial 
            color="#f39c12" 
            emissive="#f39c12" 
            emissiveIntensity={0.5}
          />
        </Sphere>
      </group>
      
      {/* Carro de instrumentos */}
      <group position={[0, 0.4, 1.2]}>
        <Box args={[0.8, 0.6, 0.4]} castShadow>
          <meshStandardMaterial color="#ecf0f1" />
        </Box>
        
        {/* Cajones */}
        <Box position={[0, 0.1, 0]} args={[0.7, 0.05, 0.3]}>
          <meshStandardMaterial color="#bdc3c7" />
        </Box>
        
        {/* Manija */}
        <Box position={[0, 0.15, 0]} args={[0.1, 0.02, 0.05]}>
          <meshStandardMaterial color="#95a5a6" />
        </Box>
      </group>
      
      {/* Silla del médico */}
      <group position={[0, 0.3, -1.5]}>
        <Box args={[0.5, 0.1, 0.5]} castShadow>
          <meshStandardMaterial color="#2c3e50" />
        </Box>
        
        <Box position={[0, 0.4, -0.2]} args={[0.5, 0.8, 0.1]}>
          <meshStandardMaterial color="#2c3e50" />
        </Box>
      </group>
      
      {/* Equipo de oxigenación */}
      <group position={[1.5, 0.8, -1]}>
        <Cylinder 
          ref={equipmentRef}
          args={[0.15, 0.15, 0.8, 16]}
          castShadow
        >
          <meshStandardMaterial color="#3498db" />
        </Cylinder>
        
        {/* Válvula */}
        <Cylinder 
          position={[0, 0.5, 0]}
          args={[0.05, 0.05, 0.2, 16]}
        >
          <meshStandardMaterial color="#2980b9" />
        </Cylinder>
        
        {/* Tubo de oxígeno */}
        <Cylinder 
          position={[0, 0.3, 0.3]}
          args={[0.02, 0.02, 0.6, 8]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial color="#95a5a6" />
        </Cylinder>
      </group>
      
      {/* Desfibrilador */}
      <group position={[-1.5, 0.8, -1]}>
        <Box args={[0.3, 0.2, 0.4]} castShadow>
          <meshStandardMaterial color="#e74c3c" />
        </Box>
        
        {/* Pantalla */}
        <Box position={[0, 0.1, 0.21]} args={[0.25, 0.15, 0.02]}>
          <meshStandardMaterial color="#2c3e50" />
        </Box>
        
        {/* Pads */}
        <Box position={[0, -0.1, 0.21]} args={[0.1, 0.05, 0.02]}>
          <meshStandardMaterial color="#ecf0f1" />
        </Box>
      </group>
      
      {/* Iluminación ambiental */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.8} castShadow />
      <pointLight position={[2, 2, 2]} intensity={0.4} color="#3498db" />
      <pointLight position={[-2, 2, -2]} intensity={0.4} color="#e74c3c" />
    </group>
  )
}