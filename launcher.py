# AltaMedica - Launcher Python (Alternativa robusta al problema bash)
# Ejecuta PowerShell scripts evitando conflictos Unix/Windows paths

import subprocess
import os
import sys
import time
import json
from pathlib import Path

print("🏥 AltaMedica - Launcher Python (Bash Fix Solution)")
print("=" * 60)

# Configuración
PROJECT_PATH = r"C:\Users\Eduardo\Documents\devaltamedica"
SCRIPT_PATH = os.path.join(PROJECT_PATH, "autonomous-update-monitor.ps1")
LOGS_PATH = os.path.join(PROJECT_PATH, "logs")

def run_diagnostics():
    """Ejecutar diagnóstico del entorno"""
    print("\n🔍 DIAGNÓSTICO DEL ENTORNO:")
    print("-" * 40)
    
    # Verificar Python
    print(f"✅ Python versión: {sys.version.split()[0]}")
    print(f"✅ Plataforma: {sys.platform}")
    
    # Verificar PowerShell
    try:
        result = subprocess.run(
            ["powershell.exe", "-Command", "$PSVersionTable.PSVersion"], 
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            print(f"✅ PowerShell versión: {result.stdout.strip()}")
        else:
            print(f"❌ PowerShell error: {result.stderr}")
    except Exception as e:
        print(f"❌ PowerShell no disponible: {e}")
    
    # Verificar directorio y archivos
    print(f"✅ Directorio actual: {os.getcwd()}")
    print(f"✅ Directorio proyecto: {PROJECT_PATH}")
    
    if os.path.exists(SCRIPT_PATH):
        print(f"✅ Script encontrado: {SCRIPT_PATH}")
        print(f"✅ Tamaño script: {os.path.getsize(SCRIPT_PATH)} bytes")
    else:
        print(f"❌ Script NO encontrado: {SCRIPT_PATH}")
    
    # Verificar permisos
    if os.access(PROJECT_PATH, os.R_OK | os.W_OK):
        print("✅ Permisos de directorio: OK")
    else:
        print("❌ Permisos de directorio: FALLO")

def execute_powershell_script(script_path):
    """Ejecutar script PowerShell con manejo robusto de errores"""
    print(f"\n🚀 Ejecutando PowerShell script...")
    print(f"📄 Script: {script_path}")
    
    # Comando PowerShell con paths escapados correctamente
    cmd = [
        "powershell.exe",
        "-ExecutionPolicy", "Bypass",
        "-NoProfile",
        "-File", script_path
    ]
    
    print(f"💻 Comando: {' '.join(cmd)}")
    
    try:
        # Cambiar al directorio del proyecto
        os.chdir(PROJECT_PATH)
        print(f"✅ Directorio cambiado a: {os.getcwd()}")
        
        # Ejecutar con output en tiempo real
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
            cwd=PROJECT_PATH
        )
        
        print(f"🎯 Proceso iniciado con PID: {process.pid}")
        print("⏱️ Tiempo estimado: 5-8 minutos")
        print("💡 Presiona Ctrl+C para interrumpir\n")
        
        start_time = time.time()
        
        # Leer output en tiempo real
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                line = output.strip()
                # Colorear output según contenido (simulado con prefijos)
                if 'ERROR' in line or '❌' in line:
                    print(f"❌ {line}")
                elif 'SUCCESS' in line or '✅' in line:
                    print(f"✅ {line}")
                elif 'WARNING' in line or '⚠️' in line:
                    print(f"⚠️ {line}")
                elif '🚀' in line or 'FASE' in line:
                    print(f"🚀 {line}")
                else:
                    print(f"📄 {line}")
        
        # Obtener código de salida
        return_code = process.poll()
        elapsed_time = time.time() - start_time
        
        # Leer errores si los hay
        stderr_output = process.stderr.read()
        if stderr_output:
            print(f"\n🔥 Errores PowerShell:")
            print(stderr_output)
        
        print("\n" + "=" * 60)
        print(f"⏱️ Tiempo total: {elapsed_time:.1f} segundos")
        print(f"🏁 Código de salida: {return_code}")
        
        return return_code, stderr_output
        
    except subprocess.TimeoutExpired:
        print("⏰ Timeout: El script tardó más de lo esperado")
        process.kill()
        return -1, "Timeout"
    except KeyboardInterrupt:
        print("\n🛑 Interrumpido por usuario")
        process.terminate()
        return -2, "Interrumpido"
    except Exception as e:
        print(f"❌ Error ejecutando script: {e}")
        return -3, str(e)

def check_results():
    """Verificar resultados de la actualización"""
    print("\n📊 VERIFICANDO RESULTADOS:")
    print("-" * 30)
    
    # Verificar logs generados
    if os.path.exists(LOGS_PATH):
        print(f"✅ Directorio de logs: {LOGS_PATH}")
        
        log_files = [f for f in os.listdir(LOGS_PATH) if f.endswith('.log') or f.endswith('.json')]
        if log_files:
            print("📁 Logs generados:")
            for log_file in log_files:
                log_path = os.path.join(LOGS_PATH, log_file)
                size_kb = os.path.getsize(log_path) / 1024
                print(f"  📄 {log_file} ({size_kb:.1f} KB)")
        else:
            print("⚠️ No se encontraron archivos de log")
    else:
        print("❌ Directorio de logs no creado")
    
    # Verificar estado final
    status_file = os.path.join(LOGS_PATH, "update-status.json")
    if os.path.exists(status_file):
        try:
            with open(status_file, 'r') as f:
                status = json.load(f)
            print(f"📋 Estado final: {status.get('status', 'UNKNOWN')}")
            print(f"🎯 Fase: {status.get('phase', 'UNKNOWN')}")
            print(f"📈 Progreso: {status.get('progress', 0)}%")
        except Exception as e:
            print(f"⚠️ Error leyendo estado: {e}")

def main():
    """Función principal"""
    print("🔧 Solucionando problema bash Unix/Windows paths...")
    
    # Ejecutar diagnóstico
    run_diagnostics()
    
    # Verificar que el script existe
    if not os.path.exists(SCRIPT_PATH):
        print(f"\n❌ Script no encontrado: {SCRIPT_PATH}")
        print("💡 Verifica que el archivo existe y la ruta es correcta")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🚀 INICIANDO ACTUALIZACIÓN AUTÓNOMA ALTAMEDICA")
    print("=" * 60)
    
    try:
        # Ejecutar el script
        return_code, error_output = execute_powershell_script(SCRIPT_PATH)
        
        # Verificar resultados
        check_results()
        
        # Mensaje final
        if return_code == 0:
            print("\n🎉 ¡ACTUALIZACIÓN ALTAMEDICA COMPLETADA EXITOSAMENTE!")
            print("\n🚀 PRÓXIMOS PASOS:")
            print("1. Revisar logs para confirmar todas las actualizaciones")
            print("2. Ejecutar: npm run dev:all")
            print("3. Abrir: http://localhost:3000")
            print("4. Verificar que todas las apps funcionan correctamente")
        else:
            print(f"\n⚠️ Actualización terminada con código: {return_code}")
            print("📊 Revisa los logs para más detalles")
            if error_output:
                print(f"🔥 Errores: {error_output}")
        
        print(f"\n🏥 Tu plataforma AltaMedica está lista para desarrollo!")
        
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()