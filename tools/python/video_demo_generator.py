#!/usr/bin/env python3
"""
🎬 AltaMedica Video Demo Generator
Sistema Python para crear videos de demostración profesionales con efectos avanzados
"""

import os
import time
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
import subprocess
import threading
from datetime import datetime

@dataclass
class VideoScene:
    """Escena individual del video"""
    name: str
    url: str
    duration: float
    zoom_level: float = 1.0
    pan_direction: str = "none"  # none, left, right, up, down
    transition: str = "fade"     # fade, zoom, blur, slide
    text_overlay: Optional[str] = None
    voice_text: Optional[str] = None
    effects: List[str] = None

@dataclass
class VideoConfig:
    """Configuración del video de demostración"""
    title: str
    resolution: Tuple[int, int] = (1920, 1080)
    fps: int = 60
    total_duration: float = 120.0  # 2 minutos
    intro_duration: float = 3.0
    outro_duration: float = 3.0
    background_music: bool = True
    voice_narration: bool = True

class AltaMedicaVideoGenerator:
    def __init__(self, workspace_root: str = None):
        self.workspace_root = Path(workspace_root or os.getcwd())
        self.output_dir = self.workspace_root / "media" / "demo_videos"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # URLs de las aplicaciones
        self.app_urls = {
            "patients": "http://localhost:3003",
            "doctors": "http://localhost:3002", 
            "admin": "http://localhost:3005",
            "api-server": "http://localhost:3001",
            "companies": "http://localhost:3004",
            "web-app": "http://localhost:3000"
        }
        
        print("🎬 AltaMedica Video Generator inicializado")
        print(f"📁 Output: {self.output_dir}")
        
    def create_demo_script(self) -> List[VideoScene]:
        """Crea el guión del video de demostración"""
        scenes = [
            # Intro dinámico
            VideoScene(
                name="intro",
                url=self.app_urls["patients"],
                duration=3.0,
                zoom_level=0.5,
                transition="zoom",
                text_overlay="AltaMedica - Plataforma Médica Integral",
                voice_text="Bienvenidos a AltaMedica, la plataforma médica más avanzada",
                effects=["blur_to_focus", "title_animation"]
            ),
            
            # Dashboard de Pacientes - Zoom rápido
            VideoScene(
                name="patients_dashboard",
                url=f"{self.app_urls['patients']}/",
                duration=8.0,
                zoom_level=1.2,
                pan_direction="right",
                transition="zoom_fast",
                text_overlay="Dashboard de Pacientes",
                voice_text="Dashboard intuitivo para pacientes con acceso a citas, historial médico y telemedicina",
                effects=["fast_zoom", "highlight_features"]
            ),
            
            # Búsqueda de Doctores - Efecto de desenfoque
            VideoScene(
                name="doctor_search",
                url=f"{self.app_urls['patients']}/doctors",
                duration=6.0,
                zoom_level=1.0,
                pan_direction="down",
                transition="blur",
                text_overlay="Búsqueda Inteligente de Doctores",
                voice_text="Encuentra el especialista perfecto con nuestro sistema de búsqueda avanzado",
                effects=["blur_transition", "card_highlight"]
            ),
            
            # Telemedicina - Zoom dinámico
            VideoScene(
                name="telemedicine",
                url=f"{self.app_urls['patients']}/telemedicine",
                duration=7.0,
                zoom_level=1.5,
                pan_direction="none",
                transition="zoom",
                text_overlay="Telemedicina Avanzada",
                voice_text="Consultas médicas por video con tecnología de última generación",
                effects=["zoom_to_feature", "pulse_animation"]
            ),
            
            # Dashboard de Doctores - Transición rápida
            VideoScene(
                name="doctors_dashboard",
                url=f"{self.app_urls['doctors']}/",
                duration=8.0,
                zoom_level=1.1,
                pan_direction="left",
                transition="slide",
                text_overlay="Dashboard Médico Profesional",
                voice_text="Herramientas profesionales para médicos con gestión completa de pacientes",
                effects=["fast_transition", "data_highlight"]
            ),
            
            # Gestión de Pacientes
            VideoScene(
                name="patient_management",
                url=f"{self.app_urls['doctors']}/pacientes",
                duration=6.0,
                zoom_level=1.3,
                pan_direction="up",
                transition="fade",
                text_overlay="Gestión Integral de Pacientes",
                voice_text="Sistema completo de gestión de historiales y seguimiento médico",
                effects=["smooth_zoom", "content_focus"]
            ),
            
            # Marketplace Médico - Efecto espectacular
            VideoScene(
                name="marketplace",
                url=f"{self.app_urls['doctors']}/marketplace",
                duration=7.0,
                zoom_level=0.8,
                pan_direction="right",
                transition="zoom_out",
                text_overlay="Marketplace Médico B2B",
                voice_text="Conecta profesionales médicos con oportunidades y recursos especializados",
                effects=["zoom_out_reveal", "grid_animation"]
            ),
            
            # Panel de Administración - Vista panorámica
            VideoScene(
                name="admin_panel",
                url=f"{self.app_urls['admin']}/",
                duration=6.0,
                zoom_level=0.9,
                pan_direction="none",
                transition="fade",
                text_overlay="Panel de Administración",
                voice_text="Control total del sistema con métricas en tiempo real",
                effects=["panoramic_view", "metrics_highlight"]
            ),
            
            # API Dashboard - Técnico
            VideoScene(
                name="api_dashboard",
                url=f"{self.app_urls['api-server']}/dashboard",
                duration=5.0,
                zoom_level=1.2,
                pan_direction="down",
                transition="zoom",
                text_overlay="API Monitoring en Tiempo Real",
                voice_text="Monitoreo avanzado de APIs con análisis de rendimiento",
                effects=["tech_zoom", "data_flow"]
            ),
            
            # Outro impactante
            VideoScene(
                name="outro",
                url=self.app_urls["patients"],
                duration=4.0,
                zoom_level=0.3,
                transition="zoom_out",
                text_overlay="AltaMedica - El Futuro de la Medicina Digital",
                voice_text="AltaMedica, transformando la atención médica para el futuro",
                effects=["final_zoom_out", "logo_animation", "call_to_action"]
            )
        ]
        
        return scenes
    
    def generate_ffmpeg_script(self, scenes: List[VideoScene], config: VideoConfig) -> str:
        """Genera script FFmpeg para crear el video"""
        
        # Crear directorio temporal para capturas
        temp_dir = self.output_dir / "temp_captures"
        temp_dir.mkdir(exist_ok=True)
        
        ffmpeg_script = f"""#!/bin/bash
# 🎬 Script FFmpeg generado automáticamente para AltaMedica Demo
# Resolución: {config.resolution[0]}x{config.resolution[1]} @ {config.fps}fps

# Variables
TEMP_DIR="{temp_dir}"
OUTPUT_DIR="{self.output_dir}"
FINAL_VIDEO="$OUTPUT_DIR/altamedica_demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"

echo "🎬 Generando video de demostración AltaMedica..."

# Crear video base con efectos
ffmpeg -y \\
"""
        
        # Agregar inputs de cada escena
        for i, scene in enumerate(scenes):
            ffmpeg_script += f"  -i \"$TEMP_DIR/scene_{i:02d}_{scene.name}.png\" \\\n"
        
        # Filtros complejos para efectos
        ffmpeg_script += """  -filter_complex "
# Intro con zoom y blur
[0:v]scale=3840:2160,zoompan=z='min(zoom+0.0015,1.5)':d=180:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,fade=t=in:st=0:d=1,fade=t=out:st=2:d=1[intro];

# Efectos de zoom rápido para dashboard
[1:v]scale=3840:2160,zoompan=z='min(zoom+0.002,2.0)':d=480:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[dashboard];

# Efecto blur para búsqueda
[2:v]scale=1920:1080,boxblur=5:1,fade=t=in:st=0:d=0.5:alpha=1,fade=t=out:st=5.5:d=0.5[search_blur];

# Zoom dinámico para telemedicina
[3:v]scale=3840:2160,zoompan=z='min(zoom+0.003,2.5)':d=420:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[telemed];

# Transición slide para doctores
[4:v]scale=1920:1080,fade=t=in:st=0:d=0.3,fade=t=out:st=7.7:d=0.3[docs_dash];

# Zoom suave para gestión
[5:v]scale=3840:2160,zoompan=z='min(zoom+0.0025,1.8)':d=360:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[management];

# Zoom out reveal para marketplace
[6:v]scale=1920:1080,zoompan=z='max(zoom-0.002,0.8)':d=420:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[marketplace];

# Vista panorámica admin
[7:v]scale=1920:1080,fade=t=in:st=0:d=0.5,fade=t=out:st=5.5:d=0.5[admin];

# Zoom técnico API
[8:v]scale=3840:2160,zoompan=z='min(zoom+0.004,2.2)':d=300:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080[api];

# Outro con zoom out épico
[9:v]scale=1920:1080,zoompan=z='max(zoom-0.01,0.3)':d=240:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,fade=t=out:st=3:d=1[outro];

# Concatenar todas las escenas
[intro][dashboard][search_blur][telemed][docs_dash][management][marketplace][admin][api][outro]concat=n=10:v=1:a=0[final]
" \\"""

        # Audio y configuración final
        ffmpeg_script += f"""
  -map "[final]" \\
  -c:v libx264 \\
  -preset medium \\
  -crf 18 \\
  -pix_fmt yuv420p \\
  -r {config.fps} \\
  -movflags +faststart \\
  "$FINAL_VIDEO"

echo "✅ Video generado: $FINAL_VIDEO"
echo "🎬 Duración total: {sum(scene.duration for scene in scenes)} segundos"
echo "📊 Efectos aplicados: zoom, blur, fade, pan"
"""
        
        return ffmpeg_script
    
    def capture_screenshots(self, scenes: List[VideoScene]) -> bool:
        """Captura screenshots de cada escena usando playwright"""
        print("\n📸 Capturando screenshots de las escenas...")
        
        # Crear script de captura con Playwright
        capture_script = f"""
import asyncio
from playwright.async_api import async_playwright
import time

async def capture_scenes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=['--disable-web-security', '--disable-features=VizDisplayCompositor']
        )
        
        context = await browser.new_context(
            viewport={{'width': 1920, 'height': 1080}},
            device_scale_factor=1
        )
        
        page = await context.new_page()
        
        scenes = {scenes}
        
        for i, scene in enumerate(scenes):
            print(f"📸 Capturando escena {{i+1}}/{{len(scenes)}}: {{scene['name']}}")
            
            try:
                await page.goto(scene['url'], wait_until='networkidle', timeout=30000)
                await page.wait_for_timeout(2000)  # Esperar carga completa
                
                # Aplicar zoom si es necesario
                if scene.get('zoom_level', 1.0) != 1.0:
                    zoom = scene['zoom_level']
                    await page.evaluate(f"document.body.style.zoom = {{zoom}}")
                    await page.wait_for_timeout(1000)
                
                # Capturar screenshot
                screenshot_path = "{self.output_dir}/temp_captures/scene_{{i:02d}}_{{scene['name']}}.png"
                await page.screenshot(
                    path=screenshot_path,
                    full_page=False,
                    clip={{'x': 0, 'y': 0, 'width': 1920, 'height': 1080}}
                )
                
                print(f"✅ Capturada: {{scene['name']}}")
                
            except Exception as e:
                print(f"❌ Error capturando {{scene['name']}}: {{e}}")
                continue
        
        await browser.close()
        print("🎬 Todas las capturas completadas")

# Ejecutar captura
asyncio.run(capture_scenes())
"""
        
        # Guardar script de captura
        capture_file = self.output_dir / "capture_scenes.py"
        capture_file.write_text(capture_script)
        
        # Ejecutar captura
        try:
            subprocess.run([
                "python", str(capture_file)
            ], check=True, cwd=self.workspace_root)
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error en captura: {e}")
            return False
    
    def generate_voice_narration(self, scenes: List[VideoScene]) -> bool:
        """Genera narración de voz para el video"""
        print("\n🎤 Generando narración de voz...")
        
        # Script para generar audio con TTS
        tts_script = f"""
import pyttsx3
import os

def generate_narration():
    engine = pyttsx3.init()
    
    # Configurar voz
    voices = engine.getProperty('voices')
    if voices:
        engine.setProperty('voice', voices[0].id)  # Voz masculina
    
    engine.setProperty('rate', 160)  # Velocidad
    engine.setProperty('volume', 0.9)  # Volumen
    
    scenes_text = {[(scene.name, scene.voice_text) for scene in scenes if scene.voice_text]}
    
    for scene_name, text in scenes_text:
        if text:
            audio_file = "{self.output_dir}/temp_captures/voice_{{scene_name}}.wav"
            engine.save_to_file(text, audio_file)
            print(f"🎤 Audio generado: {{scene_name}}")
    
    engine.runAndWait()
    print("✅ Narración completada")

generate_narration()
"""
        
        try:
            # Ejecutar TTS
            exec(tts_script)
            return True
        except Exception as e:
            print(f"⚠️ TTS no disponible: {e}")
            return False
    
    def create_demo_video(self, config: VideoConfig = None) -> str:
        """Crea el video completo de demostración"""
        if not config:
            config = VideoConfig(
                title="AltaMedica - Plataforma Médica Integral",
                resolution=(1920, 1080),
                fps=60,
                total_duration=60.0
            )
        
        print(f"\n🎬 Creando video de demostración: {config.title}")
        
        # Crear guión
        scenes = self.create_demo_script()
        
        # Capturar screenshots
        if not self.capture_screenshots(scenes):
            print("❌ Error en captura de pantallas")
            return None
        
        # Generar narración
        self.generate_voice_narration(scenes)
        
        # Generar script FFmpeg
        ffmpeg_script = self.generate_ffmpeg_script(scenes, config)
        
        # Guardar script
        script_file = self.output_dir / "generate_video.sh"
        script_file.write_text(ffmpeg_script)
        script_file.chmod(0o755)
        
        print(f"\n🎯 Script FFmpeg guardado: {script_file}")
        print(f"📁 Archivos temporales: {self.output_dir}/temp_captures/")
        
        return str(script_file)
    
    def generate_quick_demo(self) -> str:
        """Genera un demo rápido de 30 segundos"""
        print("\n⚡ Generando demo rápido...")
        
        quick_config = VideoConfig(
            title="AltaMedica - Demo Rápido",
            total_duration=30.0,
            fps=60
        )
        
        return self.create_demo_video(quick_config)

def main():
    """Función principal"""
    print("🎬 AltaMedica Video Demo Generator")
    print("="*50)
    
    generator = AltaMedicaVideoGenerator()
    
    print("\nOpciones disponibles:")
    print("1. Demo completo (60 segundos)")
    print("2. Demo rápido (30 segundos)")
    print("3. Solo capturas de pantalla")
    
    try:
        choice = input("\nSelecciona una opción (1-3): ").strip()
        
        if choice == "1":
            script_path = generator.create_demo_video()
        elif choice == "2":
            script_path = generator.generate_quick_demo()
        elif choice == "3":
            scenes = generator.create_demo_script()
            generator.capture_screenshots(scenes)
            print("✅ Capturas completadas")
            return
        else:
            print("❌ Opción inválida")
            return
        
        if script_path:
            print(f"\n🎬 Video demo configurado!")
            print(f"📝 Script FFmpeg: {script_path}")
            print(f"\n🚀 Para generar el video ejecuta:")
            print(f"   bash {script_path}")
            print(f"\n📋 Requisitos:")
            print(f"   • FFmpeg instalado")
            print(f"   • Aplicaciones ejecutándose en puertos:")
            for app, url in generator.app_urls.items():
                print(f"     - {app}: {url}")
    
    except KeyboardInterrupt:
        print("\n❌ Operación cancelada")

if __name__ == "__main__":
    main()
