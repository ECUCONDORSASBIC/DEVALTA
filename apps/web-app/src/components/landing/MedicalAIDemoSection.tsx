'use client';

import {
  Center,
  Float,
  MeshDistortMaterial,
  OrbitControls,
  PerspectiveCamera,
  Sphere,
  Stars,
  useGLTF
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle,
  ChevronRight,
  Clock,
  HeartHandshake,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';

// Tipos de síntomas para la demo
interface Symptom {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  icon: React.ComponentType<{ className?: string }>;
  position: [number, number, number];
}

// Especialistas disponibles
interface Specialist {
  id: string;
  name: string;
  specialty: string;
  matchScore: number;
  availability: string;
  avatar: string;
  experience: string;
}

// Componente 3D del cuerpo humano con puntos de síntomas
const HumanBody3D = ({ symptoms, activeSymptom }: { 
  symptoms: Symptom[]; 
  activeSymptom: string | null;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Cuerpo principal */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={meshRef}>
          <capsuleGeometry args={[0.5, 2, 16, 32]} />
          <MeshDistortMaterial
            color="#0077CC"
            metalness={0.3}
            roughness={0.4}
            distort={0.2}
            speed={2}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      {/* Puntos de síntomas */}
      {symptoms.map((symptom) => (
        <group key={symptom.id} position={symptom.position}>
          <Float speed={4} floatIntensity={0.3}>
            <Sphere args={[0.15]}>
              <meshStandardMaterial
                color={
                  symptom.severity === 'high' ? '#FF4444' :
                  symptom.severity === 'medium' ? '#FFB800' :
                  '#00D9FF'
                }
                emissive={
                  symptom.severity === 'high' ? '#FF4444' :
                  symptom.severity === 'medium' ? '#FFB800' :
                  '#00D9FF'
                }
                emissiveIntensity={activeSymptom === symptom.id ? 1 : 0.3}
              />
            </Sphere>
            {activeSymptom === symptom.id && (
              <pointLight
                color={
                  symptom.severity === 'high' ? '#FF4444' :
                  symptom.severity === 'medium' ? '#FFB800' :
                  '#00D9FF'
                }
                intensity={2}
                distance={3}
              />
            )}
          </Float>
        </group>
      ))}
    </group>
  );
};

// Red neuronal animada para mostrar el procesamiento de IA
const NeuralNetwork = ({ isProcessing }: { isProcessing: boolean }) => {
  const nodesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (nodesRef.current && isProcessing) {
      nodesRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      nodesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  const nodes = [];
  const connections = [];
  
  // Crear estructura de red neuronal
  const layers = [3, 5, 4, 2];
  const layerPositions: THREE.Vector3[][] = [];
  
  layers.forEach((nodeCount, layerIndex) => {
    const layer: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = (layerIndex - 1.5) * 2;
      const y = (i - nodeCount / 2) * 0.8;
      layer.push(new THREE.Vector3(x, y, 0));
    }
    layerPositions.push(layer);
  });

  // Crear nodos
  layerPositions.forEach((layer, layerIndex) => {
    layer.forEach((pos, nodeIndex) => {
      nodes.push(
        <Sphere key={`node-${layerIndex}-${nodeIndex}`} position={pos} args={[0.1]}>
          <meshStandardMaterial
            color="#00D9FF"
            emissive="#00D9FF"
            emissiveIntensity={isProcessing ? 0.5 : 0.1}
          />
        </Sphere>
      );
    });
  });

  // Crear conexiones
  for (let i = 0; i < layerPositions.length - 1; i++) {
    const currentLayer = layerPositions[i];
    const nextLayer = layerPositions[i + 1];
    
    currentLayer.forEach((fromPos) => {
      nextLayer.forEach((toPos) => {
        connections.push(
          <line key={`connection-${fromPos.x}-${toPos.x}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  fromPos.x, fromPos.y, fromPos.z,
                  toPos.x, toPos.y, toPos.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#00D9FF"
              opacity={isProcessing ? 0.6 : 0.2}
              transparent
            />
          </line>
        );
      });
    });
  }

  return (
    <group ref={nodesRef}>
      {nodes}
      {connections}
    </group>
  );
};

// Componente para cargar el modelo 3D de texto
const Text3DModel = ({ text, position }: { text: string; position: [number, number, number] }) => {
  const { scene } = useGLTF('/models/text3d.glb');
  return (
    <primitive 
      object={scene.clone()} 
      position={position} 
      scale={[0.5, 0.5, 0.5]}
    />
  );
};

// Partículas flotantes para ambiente médico
const MedicalParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <sphereGeometry args={[5, 32, 32]} />
      <pointsMaterial
        color="#00D9FF"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const MedicalAIDemoSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [matchedSpecialist, setMatchedSpecialist] = useState<Specialist | null>(null);
  const [showResults, setShowResults] = useState(false);

  const symptoms: Symptom[] = [
    { id: 'head', name: 'Dolor de cabeza', severity: 'medium', icon: Brain, position: [0, 1.5, 0] },
    { id: 'chest', name: 'Presión en el pecho', severity: 'high', icon: Activity, position: [0, 0.5, 0] },
    { id: 'stomach', name: 'Malestar estomacal', severity: 'low', icon: AlertCircle, position: [0, -0.2, 0] },
    { id: 'joint', name: 'Dolor articular', severity: 'medium', icon: Sparkles, position: [-0.3, -0.8, 0] }
  ];

  const specialists: Specialist[] = [
    {
      id: '1',
      name: 'Dra. María González',
      specialty: 'Cardióloga',
      matchScore: 98,
      availability: 'Disponible ahora',
      avatar: '👩‍⚕️',
      experience: '15 años experiencia'
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendez',
      specialty: 'Neurólogo',
      matchScore: 92,
      availability: 'En 30 minutos',
      avatar: '👨‍⚕️',
      experience: '12 años experiencia'
    },
    {
      id: '3',
      name: 'Dra. Ana Rodríguez',
      specialty: 'Gastroenteróloga',
      matchScore: 85,
      availability: 'Hoy 4:00 PM',
      avatar: '👩‍⚕️',
      experience: '10 años experiencia'
    }
  ];

  const demoSteps = [
    {
      title: "Evaluación de síntomas",
      description: "La IA analiza tus síntomas actuales y tu historial médico completo",
      icon: Search
    },
    {
      title: "Procesamiento inteligente",
      description: "Red neuronal especializada procesa 50+ factores médicos",
      icon: Brain
    },
    {
      title: "Match con especialista",
      description: "Te conectamos con el especialista exacto sin pasar por médico general",
      icon: HeartHandshake
    }
  ];

  const handleSymptomClick = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const startAIAnalysis = () => {
    setIsProcessing(true);
    setCurrentStep(1);

    // Simular procesamiento
    setTimeout(() => {
      setCurrentStep(2);
      setMatchedSpecialist(specialists[0]);
      setTimeout(() => {
        setIsProcessing(false);
        setShowResults(true);
      }, 1000);
    }, 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-4">
            <Brain className="h-5 w-5 mr-2" />
            IA MÉDICA REVOLUCIONARIA
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Evaluación médica con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">IA avanzada</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra IA analiza tu historia clínica completa y anamnesis para conectarte 
            directamente con el especialista que necesitas, sin intermediarios
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Canvas 3D */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[600px] bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
              />
              
              {/* Iluminación */}
              <ambientLight intensity={0.2} />
              <directionalLight position={[10, 10, 5]} intensity={0.5} />
              <pointLight position={[0, 0, 3]} intensity={0.5} color="#00D9FF" />
              
              {/* Fondo estrellado */}
              <Stars radius={50} depth={20} count={1000} factor={2} saturation={0} fade />
              
              {/* Partículas médicas */}
              <MedicalParticles />
              
              {/* Mostrar según el paso actual */}
              {currentStep === 0 && (
                <HumanBody3D 
                  symptoms={symptoms} 
                  activeSymptom={selectedSymptoms[selectedSymptoms.length - 1] || null}
                />
              )}
              
              {currentStep === 1 && (
                <NeuralNetwork isProcessing={isProcessing} />
              )}
              
              {currentStep === 2 && matchedSpecialist && (
                <Float speed={2} floatIntensity={0.5}>
                  <Center>
                    <Text3D
                      font="/fonts/helvetiker_regular.typeface.json"
                      size={0.5}
                      height={0.2}
                      curveSegments={12}
                    >
                      {`${matchedSpecialist.matchScore}%`}
                      <meshStandardMaterial
                        color="#00D9FF"
                        emissive="#00D9FF"
                        emissiveIntensity={0.5}
                      />
                    </Text3D>
                  </Center>
                </Float>
              )}
            </Canvas>

            {/* Overlay de información */}
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {demoSteps[currentStep].icon && React.createElement(demoSteps[currentStep].icon, {
                    className: "h-5 w-5 text-cyan-400"
                  })}
                  <h3 className="font-semibold">{demoSteps[currentStep].title}</h3>
                </div>
                <p className="text-sm text-gray-300">{demoSteps[currentStep].description}</p>
              </div>
            </div>

            {/* Indicadores de progreso */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {demoSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-all ${
                    index <= currentStep ? 'bg-cyan-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Panel de control */}
          <div className="space-y-6">
            {/* Selección de síntomas */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  Selecciona tus síntomas
                </h3>
                
                <div className="space-y-3 mb-6">
                  {symptoms.map((symptom) => {
                    const Icon = symptom.icon;
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    
                    return (
                      <motion.button
                        key={symptom.id}
                        onClick={() => handleSymptomClick(symptom.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              symptom.severity === 'high' ? 'bg-red-100' :
                              symptom.severity === 'medium' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                symptom.severity === 'high' ? 'text-red-600' :
                                symptom.severity === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{symptom.name}</p>
                              <p className="text-sm text-gray-500">
                                Severidad: {
                                  symptom.severity === 'high' ? 'Alta' :
                                  symptom.severity === 'medium' ? 'Media' :
                                  'Baja'
                                }
                              </p>
                            </div>
                          </div>
                          <CheckCircle className={`h-5 w-5 transition-opacity ${
                            isSelected ? 'text-blue-600 opacity-100' : 'opacity-0'
                          }`} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedSymptoms.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={startAIAnalysis}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Brain className="h-5 w-5" />
                    Iniciar análisis con IA
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Procesando */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <Brain className="h-16 w-16 text-blue-600" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Analizando con IA avanzada
                  </h3>
                  
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Revisando historial médico completo</span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Analizando patrones de síntomas</span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="animate-pulse">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-gray-700">Encontrando especialista ideal...</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Resultados */}
            {showResults && matchedSpecialist && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Match encontrado */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        ¡Especialista perfecto encontrado!
                      </h3>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{matchedSpecialist.avatar}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">
                            {matchedSpecialist.name}
                          </h4>
                          <p className="text-gray-600">{matchedSpecialist.specialty}</p>
                          <p className="text-sm text-gray-500">{matchedSpecialist.experience}</p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">
                                {matchedSpecialist.matchScore}% compatibilidad
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {matchedSpecialist.availability}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Agendar consulta ahora
                      </motion.button>
                    </div>
                  </div>

                  {/* Beneficios */}
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Ventajas de nuestra IA médica
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Historial permanente</p>
                          <p className="text-sm text-gray-600">
                            Tu información médica siempre disponible para consultas recursivas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Sin intermediarios</p>
                          <p className="text-sm text-gray-600">
                            Directo al especialista que necesitas, ahorrando tiempo y dinero
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">IA entrenada médicamente</p>
                          <p className="text-sm text-gray-600">
                            50+ factores analizados con precisión clínica del 94%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* CTA si no hay resultados aún */}
            {!showResults && currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 text-center"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Experimenta el futuro de la medicina
                </h3>
                <p className="text-gray-600 mb-6">
                  Nuestra IA analiza millones de casos médicos para encontrar el tratamiento 
                  perfecto para ti. Sin esperas, sin referencias innecesarias.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Comenzar evaluación gratis
                  </button>
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors">
                    Ver video demo
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats finales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600">2.5M+</div>
            <p className="text-gray-600 mt-2">Diagnósticos precisos</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600">94%</div>
            <p className="text-gray-600 mt-2">Precisión diagnóstica</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600">&lt; 3min</div>
            <p className="text-gray-600 mt-2">Tiempo de análisis</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <p className="text-gray-600 mt-2">Disponibilidad total</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Precargar el modelo 3D
if (typeof window !== 'undefined') {
  useGLTF.preload('/models/text3d.glb');
}

export default MedicalAIDemoSection;