'use client';

import React, { useEffect, useRef, useState, forwardRef } from 'react';

// --- UTILITIES (reemplazan a clsx y tailwind-merge) ---
const cn = (...inputs: any[]) => {
  const classes = [];
  for (const input of inputs) {
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && input !== null) {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }
  return Array.from(new Set(classes)).join(' ');
};

// --- ICONOS AVANZADOS (SVG en línea para evitar dependencias) ---
const IconCalendarEvent = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M16 3l0 4" /><path d="M8 3l0 4" /><path d="M4 11l16 0" /><path d="M8 15h2v2h-2z" /></svg>
);
const IconClipboardCheck = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 14l2 2l4 -4" /></svg>
);
const IconPill = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7" /><path d="M8.5 8.5l7 7" /></svg>
);
const IconLab = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 21h8" /><path d="M12 21v-14" /><path d="M10 4a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M12 7h.01" /><path d="M6.75 11a5.25 5.25 0 0 1 10.5 0" /><path d="M6.75 11v7" /><path d="M17.25 11v7" /></svg>
);
const IconFileCheck = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 15l2 2l4 -4" /></svg>
);
const IconTimeline = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 18l14 0" /><path d="M4 12l14 0" /><path d="M4 6l14 0" /></svg>
);
const IconMessage = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h8" /><path d="M8 13h6" /><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" /></svg>
);
const IconHeartbeat = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.5c-2.433 2.433 -6.01 4.5 -10.5 4.5c-3.6 0 -5.5 -2.333 -7.5 -4.5" /><path d="M3 12h4l3 8l4 -16l3 8h4" /></svg>
);
const IconUsers = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>
);
const IconCurrencyDollar = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
);
const IconTarget = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>
);
const IconCube = ({ className, ...rest }: { className?: string; [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 12l-9 -9l-9 9l9 9l9 -9" /><path d="M3 12v6l9 3l9 -3v-6" /><path d="M12 21l0 -9" /></svg>
);

// --- COMPONENTES DE ACETERNITY UI (Básicos y Adaptados) ---
const BentoGrid = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 w-full", className)}>
    {children}
  </div>
);

const BentoGridItem = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input p-4 bg-white border border-transparent justify-between flex flex-col space-y-4", className)}>
    {children}
  </div>
);

const TextGenerateEffect = ({ words, className }: { words: string; className?: string }) => {
    const [wordsArray, setWordsArray] = useState<string[]>([]);
    useEffect(() => {
        setWordsArray(words.split(" "));
    }, [words]);
    return (
      <div className={cn("font-sans", className)}>
        <div className="mt-4">
          <div className="text-foreground text-sm leading-snug">
            {wordsArray.map((word, idx) => (
              <span 
                key={word + idx} 
                className="opacity-0 animate-fade-in" 
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {word}{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
};

const BackgroundGradient = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative p-px rounded-xl", className)}>
    <div className="absolute top-0 left-0 w-full h-full rounded-xl bg-gradient-radial from-primary-foreground to-secondary" />
    <div className={cn("relative z-10 bg-white p-4 rounded-[11px] h-full w-full")}>
      {children}
    </div>
  </div>
);

// --- TARJETAS PERSONALIZADAS ---
const ProximoTurnoCard_V1 = () => (
  <BentoGridItem className="md:col-span-1 bg-secondary border-primary/20">
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-2">
        <IconCalendarEvent className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-bold text-secondary-foreground">Próximo Turno</h3>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl font-bold text-primary">25</p>
          <p className="text-lg text-secondary-foreground -mt-1">JUNIO, 2025</p>
          <p className="text-md font-semibold text-secondary-foreground mt-2">11:30 hs - Dr. Rossi</p>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">Recuerde traer estudios anteriores.</p>
    </div>
  </BentoGridItem>
);

const HistorialClinicoCard = () => (
  <BentoGridItem className="md:col-span-1">
    <div className="flex items-center mb-2">
      <IconClipboardCheck className="h-5 w-5 text-primary mr-2" />
      <h3 className="text-lg font-bold text-foreground">Historial Clínico</h3>
    </div>
    <div className="flex-grow">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Consultas</span>
          <span className="font-semibold text-foreground">24</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Estudios</span>
          <span className="font-semibold text-foreground">8</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Medicación</span>
          <span className="font-semibold text-accent">Activa</span>
        </div>
      </div>
    </div>
    <button className="w-full mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
      Ver Completo
    </button>
  </BentoGridItem>
);

const MedicacionCard = () => (
  <BentoGridItem className="md:col-span-1">
    <div className="flex items-center mb-2">
      <IconPill className="h-5 w-5 text-primary mr-2" />
      <h3 className="text-lg font-bold text-foreground">Medicación Actual</h3>
    </div>
    <div className="flex-grow space-y-2">
      <div className="bg-secondary p-3 rounded-lg">
        <p className="font-semibold text-secondary-foreground">Atorvastatina 20mg</p>
        <p className="text-sm text-muted-foreground">1 vez al día - Cena</p>
      </div>
      <div className="bg-secondary p-3 rounded-lg">
        <p className="font-semibold text-secondary-foreground">Enalapril 10mg</p>
        <p className="text-sm text-muted-foreground">2 veces al día</p>
      </div>
    </div>
  </BentoGridItem>
);

// === CONCEPTOS VISUALES AVANZADOS ===
const Sparkline = ({ data, width = 100, height = 30, color = "currentColor" }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) => {
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - minVal) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
        </svg>
    );
};

const SparklineVitalCard = () => {
    const heartRateData = [72, 75, 74, 78, 80, 79, 76, 82, 81, 79, 85, 83];
    return (
        <BentoGridItem className="md:col-span-1">
            <div className="flex items-center mb-2">
              <IconHeartbeat className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-bold text-foreground">Frec. Cardíaca</h3>
            </div>
            <div className="flex-grow flex items-center justify-between">
                <div>
                    <p className="text-4xl font-bold text-foreground">83 <span className="text-lg text-muted-foreground">LPM</span></p>
                    <p className="text-sm text-accent font-semibold">+2% vs ayer</p>
                </div>
                <Sparkline data={heartRateData} width={120} height={40} color="rgb(0 90 156)" />
            </div>
        </BentoGridItem>
    );
};

const Interactive3DModelCard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (!canvasRef.current || !(window as any).THREE) return;
            const THREE = (window as any).THREE;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvasRef.current!.clientWidth / canvasRef.current!.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
            
            renderer.setSize(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);

            const geometry = new THREE.SphereGeometry(0.6, 32, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0x005A9C, metalness: 0.3, roughness: 0.4 });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            camera.position.z = 2.5;

            let mouseX = 0;
            const onMouseMove = (event: MouseEvent) => {
                if (!canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            };
            window.addEventListener('mousemove', onMouseMove);

            const animate = () => {
                if (!sphere) return;
                requestAnimationFrame(animate);
                sphere.rotation.y += 0.005 + mouseX * 0.02;
                sphere.rotation.x += 0.005;
                renderer.render(scene, camera);
            };
            animate();
            
            return () => {
                window.removeEventListener('mousemove', onMouseMove);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        };
    }, []);

    return (
        <BentoGridItem className="md:col-span-1">
            <div className="flex items-center mb-2">
              <IconCube className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-bold text-foreground">Modelo Interactivo</h3>
            </div>
            <div className="flex-grow flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
        </BentoGridItem>
    );
};

const GradientGoalCard = () => {
    const progress = 82;
    return (
        <BackgroundGradient className="md:col-span-1 rounded-xl">
            <div className="flex items-center mb-2">
              <IconTarget className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-bold text-foreground">Metas de Salud</h3>
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <p className="text-sm font-semibold text-foreground">Pasos Diarios</p>
                <div className="w-full bg-border rounded-full h-2.5 my-2">
                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right font-bold text-accent">{progress.toLocaleString()}/10,000</p>
            </div>
        </BackgroundGradient>
    );
};

// --- APLICACIÓN PRINCIPAL ---
export default function GaleriaComponentes() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
        <div className="absolute top-0 left-0 h-full w-full bg-white bg-dot-pattern bg-dot-16"></div>
        
        <div className="relative z-10 w-full p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Galería de Componentes</h1>
                    <p className="text-muted-foreground">Variaciones de diseño para el Portal del Paciente.</p>
                </div>
                
                <div className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Portal del Paciente - Dashboard</h2>
                        <BentoGrid>
                            <ProximoTurnoCard_V1 />
                            <HistorialClinicoCard />
                            <MedicacionCard />
                        </BentoGrid>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Conceptos Visuales Avanzados</h2>
                        <BentoGrid>
                            <SparklineVitalCard />
                            <Interactive3DModelCard />
                            <GradientGoalCard />
                        </BentoGrid>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
