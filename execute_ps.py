# AltaMedica - Wrapper Python para ejecutar PowerShell (Solución al problema bash)
# Evita bash completamente y ejecuta directamente en Windows

import subprocess
import sys
import os
import time
from pathlib import Path

def print_colored(message, color="white"):
    """Simular colores en output (básico)"""
    colors = {
        "red": "❌",
        "green": "✅", 
        "yellow": "⚠️",
        "cyan": "🚀",
        "white": "📄"
    }
    prefix = colors.get(color, "📄")
    print(f"{prefix} {message}")

def execute_powershell_script(script_path):
    """Ejecutar script PowerShell con manejo robusto"""
    print_colored("AltaMedica - Wrapper Python (Solución Bash Fix)", "cyan")
    print("=" * 60)
    
    # Verificar que el script existe
    if not os.path.exists(script_path):
        print_colored(f"Script no encontrado: {script_path}", "red")
        return False
    
    print_colored(f"Script encontrado: {script_path}", "green")
    print_colored(f"Tamaño: {os.path.getsize(script_path)} bytes", "white")
    
    # Cambiar al directorio del proyecto
    project_dir = os.path.dirname(script_path)
    if project_dir:
        os.chdir(project_dir)
        print_colored(f"Directorio cambiado a: {os.getcwd()}", "green")
    
    print("\n" + "=" * 60)
    print_colored("EJECUTANDO ACTUALIZACIÓN ALTAMEDICA", "cyan")
    print("=" * 60)
    
    start_time = time.time()
    
    try:
        # Ejecutar PowerShell con output en tiempo real
        process = subprocess.Popen(
            ['powershell.exe', '-ExecutionPolicy', 'Bypass', '-File', script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        print_colored(f"Proceso PowerShell iniciado - PID: {process.pid}", "cyan")
        print_colored("Tiempo estimado: 5-8 minutos", "white")
        print("💡 Presiona Ctrl+C para interrumpir\n")
        
        # Leer output línea por línea en tiempo real
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            
            if output:
                line = output.strip()
                # Colorear según contenido
                if any(word in line.lower() for word in ['error', '❌', 'failed']):
                    print_colored(line, "red")
                elif any(word in line.lower() for word in ['success', '✅', 'completed', 'exitosamente']):
                    print_colored(line, "green")
                elif any(word in line.lower() for word in ['warning', '⚠️', 'warn']):
                    print_colored(line, "yellow")
                elif any(word in line.lower() for word in ['fase', 'phase', '🚀', 'iniciando']):
                    print_colored(line, "cyan")
                else:
                    print_colored(line, "white")
        
        # Obtener código de salida
        return_code = process.poll()
        
        # Leer errores si los hay
        stderr_output = process.stderr.read()
        if stderr_output:
            print("\n" + "=" * 40)
            print_colored("ERRORES POWERSHELL:", "red")
            print(stderr_output)
        
        elapsed_time = time.time() - start_time
        
        print("\n" + "=" * 60)
        print_colored(f"TIEMPO TOTAL: {elapsed_time:.1f} segundos", "white")
        print_colored(f"CÓDIGO DE SALIDA: {return_code}", "white")
        
        if return_code == 0:
            print_colored("🎉 ACTUALIZACIÓN ALTAMEDICA COMPLETADA EXITOSAMENTE!", "green")
            
            # Verificar logs generados
            logs_dir = os.path.join(os.getcwd(), 'logs')
            if os.path.exists(logs_dir):
                print_colored("📁 Logs generados:", "cyan")
                for log_file in os.listdir(logs_dir):
                    if log_file.endswith(('.log', '.json')):
                        log_path = os.path.join(logs_dir, log_file)
                        size_kb = os.path.getsize(log_path) / 1024
                        print_colored(f"  📄 {log_file} ({size_kb:.1f} KB)", "white")
            
            print("\n🚀 PRÓXIMOS PASOS:")
            print("1. Revisar logs para confirmar todas las actualizaciones")
            print("2. Ejecutar: npm run dev:all") 
            print("3. Abrir: http://localhost:3000")
            print("4. Verificar que todas las apps funcionan")
            
            return True
        else:
            print_colored(f"⚠️ Script terminado con código: {return_code}", "yellow")
            print_colored("📊 Revisar errores arriba para detalles", "white")
            return False
            
    except KeyboardInterrupt:
        print_colored("\n🛑 Interrumpido por usuario", "yellow")
        process.terminate()
        return False
    except Exception as e:
        print_colored(f"❌ Error ejecutando PowerShell: {e}", "red")
        return False

def main():
    """Función principal"""
    print("🏥 AltaMedica - Ejecutor Python Autónomo")
    print("Solución definitiva al problema bash Unix/Windows")
    print()
    
    # Determinar script a ejecutar
    project_path = r"C:\Users\Eduardo\Documents\devaltamedica"
    
    # Intentar diferentes scripts en orden de preferencia
    scripts_to_try = [
        "ultra-simple-update.ps1",     # Versión ultra limpia sin errores
        "simple-update.ps1",           # Más simple, menos errores
        "autonomous-update-fixed.ps1", # Versión corregida
        "automated-update.ps1",        # Original
        "verify-environment.ps1"       # Solo verificación
    ]
    
    script_found = None
    for script_name in scripts_to_try:
        script_path = os.path.join(project_path, script_name)
        if os.path.exists(script_path):
            script_found = script_path
            print_colored(f"Script encontrado: {script_name}", "green")
            break
    
    if not script_found:
        print_colored("❌ No se encontró ningún script PowerShell", "red")
        print("Scripts buscados:")
        for script in scripts_to_try:
            print(f"  - {script}")
        return False
    
    # Preguntar confirmación (opcional, para automatización completa comenta esta parte)
    print(f"\n¿Ejecutar {os.path.basename(script_found)}? (Enter para continuar, Ctrl+C para cancelar)")
    try:
        input()
    except KeyboardInterrupt:
        print_colored("Cancelado por usuario", "yellow")
        return False
    
    # Ejecutar script
    return execute_powershell_script(script_found)

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🏥 Tu plataforma AltaMedica está lista para desarrollo!")
    else:
        print("\n⚠️ Actualización incompleta. Revisar errores arriba.")
    
    input("\nPresiona Enter para salir...")