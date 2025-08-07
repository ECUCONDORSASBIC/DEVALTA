'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Video, 
  Brain, 
  Users, 
  FileText, 
  AlertCircle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

interface TimelineEvent {
  time: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  position: [number, number, number];
  color: string;
  description: string;
  demo?: string;
}

const timeline: TimelineEvent[] = [
  {
    time: "7:00 AM",
    title: "Revisión matutina inteligente",
    icon: Clock,
    position: [-3, 2, 0],
    color: "#0077CC",
    description: "Dashboard con IA priorizando casos urgentes y notificaciones nocturnas",
    demo: "/screenshots/dashboard-morning.png"
  },
  {
    time: "9:00 AM",
    title: "Primera videoconsulta HD",
    icon: Video,
    position: [-1, 2, 0],
    color: "#00A859",
    description: "Conexión HD con historial médico integrado y herramientas colaborativas",
    demo: "/screenshots/video-consultation.png"
  },
  {
    time: "11:00 AM",
    title: "Alerta IA: Caso urgente",
    icon: Brain,
    position: [1, 2, 0],
    color: "#FF6B6B",
    description: "Sistema detecta patrón cardíaco anormal y notifica especialista automáticamente",
    demo: "/screenshots/ai-alert.png"
  },
  {
    time: "2:00 PM",
    title: "Consulta colaborativa",
    icon: Users,
    position: [3, 2, 0],
    color: "#8B5CF6",
    description: "3 especialistas coordinan tratamiento complejo en tiempo real",
    demo: "/screenshots/collaborative-consultation.png"
  },
  {
    time: "4:00 PM",
    title: "Prescripciones inteligentes",
    icon: FileText,
    position: [1, -2, 0],
    color: "#0EA5E9",
    description: "IA valida interacciones medicamentosas y sugiere alternativas",
    demo: "/screenshots/smart-prescription.png"
  },
  {
    time: "6:00 PM",
    title: "Emergencia telemedicina",
    icon: AlertCircle,
    position: [-1, -2, 0],
    color: "#F59E0B",
    description: "Protocolo de emergencia activado con acceso prioritario a especialistas",
    demo: "/screenshots/emergency-protocol.png"
  }
];

// Componente 3D para cada nodo del timeline
const TimelineNode = ({ event, isActive, isPassed }: { 
  event: TimelineEvent; 
  isActive: boolean;
  isPassed: boolean;
}) => {
  return (
    <group position={event.position}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={isActive ? event.color : isPassed ? '#94A3B8' : '#E5E7EB'} 
          emissive={isActive ? event.color : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {isActive && (
        <>
          <pointLight intensity={1} color={event.color} distance={3} />
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.3}
            color={event.color}
            anchorX="center"
            anchorY="middle"
          >
            {event.time}
          </Text>
        </>
      )}
    </group>
  );
};

// Líneas de conexión animadas
const ConnectionLine = ({ start, end, isActive }: {
  start: [number, number, number];
  end: [number, number, number];
  isActive: boolean;
}) => {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={isActive ? '#0077CC' : '#E5E7EB'} 
        linewidth={isActive ? 3 : 1}
      />
    </line>
  );
};

export const DayInLifeSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % timeline.length);
    }, 4000); // 4 segundos por evento

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeEvent = timeline[activeIndex];
  const Icon = activeEvent.icon;

  const handlePrevious = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev - 1 + timeline.length) % timeline.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev + 1) % timeline.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header de la sección */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Clock className="h-4 w-4 mr-2" />
            EXPERIENCIA INTERACTIVA 3D
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Un día en la vida de un médico con <span className="text-[#0077CC]">AltaMedica</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Descubre cómo nuestra plataforma transforma cada momento del día médico
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Canvas 3D */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-4 h-[500px] relative"
          >
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 10]} />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              
              {/* Renderizar líneas de conexión */}
              {timeline.map((event, i) => {
                const next = timeline[(i + 1) % timeline.length];
                return (
                  <ConnectionLine
                    key={`line-${i}`}
                    start={event.position}
                    end={next.position}
                    isActive={i < activeIndex || (activeIndex === 0 && i === timeline.length - 1)}
                  />
                );
              })}
              
              {/* Renderizar nodos */}
              {timeline.map((event, i) => (
                <TimelineNode 
                  key={`node-${i}`}
                  event={event} 
                  isActive={i === activeIndex}
                  isPassed={i < activeIndex}
                />
              ))}
            </Canvas>

            {/* Controles de reproducción */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Evento anterior"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-gray-700" />
                ) : (
                  <Play className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Siguiente evento"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </motion.div>

          {/* Panel de información */}
          <div className="space-y-6">
            {/* Evento actual destacado */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100"
              >
                <div className="flex items-start gap-4 mb-6">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: activeEvent.color }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {activeEvent.time}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">{activeEvent.title}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {activeEvent.description}
                </p>

                {/* Preview de funcionalidad */}
                {activeEvent.demo && (
                  <motion.div 
                    className="relative overflow-hidden rounded-lg bg-gray-100 aspect-video"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img 
                      src={activeEvent.demo}
                      alt={activeEvent.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-demo.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Timeline clickeable */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">LÍNEA DE TIEMPO COMPLETA</h4>
              <div className="space-y-2">
                {timeline.map((event, i) => {
                  const EventIcon = event.icon;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setActiveIndex(i);
                        setIsPlaying(false);
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        i === activeIndex 
                          ? 'bg-gradient-to-r from-[#0077CC] to-[#0099FF] text-white shadow-md' 
                          : hoveredIndex === i
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <EventIcon className={`w-5 h-5 ${
                          i === activeIndex ? 'text-white' : 'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${
                            i === activeIndex ? 'text-white' : 'text-gray-900'
                          }`}>
                            {event.time}
                          </p>
                          <p className={`text-xs ${
                            i === activeIndex ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {event.title}
                          </p>
                        </div>
                        {i === activeIndex && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 bg-white rounded-full"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={() => window.location.href = '/demo'}
                className="inline-flex items-center gap-2 bg-[#0077CC] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#005599] transition-all shadow-lg"
              >
                Explorar demo completa
                <Play className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Indicadores de progreso */}
        <div className="flex justify-center mt-8 gap-2">
          {timeline.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setIsPlaying(false);
              }}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === activeIndex 
                  ? 'w-8 bg-[#0077CC]' 
                  : i < activeIndex
                  ? 'w-2 bg-gray-400'
                  : 'w-2 bg-gray-300'
              }`}
              aria-label={`Ir a evento ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};