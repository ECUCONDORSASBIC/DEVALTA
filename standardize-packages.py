#!/usr/bin/env python3
"""
AltaMedica Package Standardization Tool
======================================

Script automatizado para mantener consistencia en package.json
a través del monorepo AltaMedica.

Autor: Eduardo Altamedica
Versión: 1.0.0
"""

import json
import os
import glob
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import argparse

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('package-standardization.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PackageStandardizer:
    """Clase principal para estandarización de package.json en monorepo AltaMedica"""
    
    def __init__(self, root_dir: str = "."):
        self.root_dir = Path(root_dir).resolve()
        self.config_file = self.root_dir / "package-template-config.json"
        self.backup_dir = self.root_dir / "backups" / f"packages_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.config = self._load_config()
        
        # Crear directorio de backup
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"📁 Directorio de backup creado: {self.backup_dir}")

    def _load_config(self) -> Dict[str, Any]:
        """Carga la configuración desde package-template-config.json"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                logger.info("✅ Configuración cargada exitosamente")
                return config
        except FileNotFoundError:
            logger.error(f"❌ No se encontró el archivo de configuración: {self.config_file}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"❌ Error al parsear JSON: {e}")
            raise

    def find_package_files(self) -> List[Path]:
        """Encuentra todos los package.json en el monorepo"""
        package_files = []
        
        # Root package.json
        root_package = self.root_dir / "package.json"
        if root_package.exists():
            package_files.append(root_package)
        
        # Apps package.json
        apps_dir = self.root_dir / "apps"
        if apps_dir.exists():
            for app_dir in apps_dir.iterdir():
                if app_dir.is_dir():
                    package_file = app_dir / "package.json"
                    if package_file.exists():
                        package_files.append(package_file)
        
        # Packages package.json
        packages_dir = self.root_dir / "packages"
        if packages_dir.exists():
            for package_dir in packages_dir.iterdir():
                if package_dir.is_dir():
                    package_file = package_dir / "package.json"
                    if package_file.exists():
                        package_files.append(package_file)
        
        # Agents package.json
        agents_dir = self.root_dir / "agents"
        if agents_dir.exists():
            for agent_dir in agents_dir.iterdir():
                if agent_dir.is_dir():
                    package_file = agent_dir / "package.json"
                    if package_file.exists():
                        package_files.append(package_file)
        
        logger.info(f"📦 Encontrados {len(package_files)} archivos package.json")
        return package_files

    def backup_file(self, file_path: Path) -> Path:
        """Crea backup de un archivo package.json"""
        relative_path = file_path.relative_to(self.root_dir)
        backup_path = self.backup_dir / relative_path
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        
        shutil.copy2(file_path, backup_path)
        return backup_path

    def load_package_json(self, file_path: Path) -> Dict[str, Any]:
        """Carga un archivo package.json"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"❌ Error al cargar {file_path}: {e}")
            return {}

    def save_package_json(self, file_path: Path, package_data: Dict[str, Any]):
        """Guarda un archivo package.json con formato consistente"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(package_data, f, indent=2, ensure_ascii=False)
            logger.info(f"✅ Actualizado: {file_path.relative_to(self.root_dir)}")
        except Exception as e:
            logger.error(f"❌ Error al guardar {file_path}: {e}")

    def detect_package_type(self, file_path: Path, package_data: Dict[str, Any]) -> str:
        """Detecta el tipo de package (root, app, package, agent)"""
        relative_path = file_path.relative_to(self.root_dir)
        
        if str(relative_path) == "package.json":
            return "root"
        elif "apps" in relative_path.parts:
            return "app"
        elif "packages" in relative_path.parts:
            return "package"
        elif "agents" in relative_path.parts:
            return "agent"
        else:
            return "unknown"

    def get_app_name(self, file_path: Path) -> str:
        """Extrae el nombre de la app desde la ruta"""
        parts = file_path.parts
        if "apps" in parts:
            app_index = parts.index("apps")
            if app_index + 1 < len(parts):
                return parts[app_index + 1]
        elif "packages" in parts:
            package_index = parts.index("packages")
            if package_index + 1 < len(parts):
                return parts[package_index + 1]
        return ""

    def merge_dependencies(self, base_deps: Dict[str, str], new_deps: Dict[str, str]) -> Dict[str, str]:
        """Combina dependencias manteniendo versiones existentes cuando sea apropiado"""
        merged = base_deps.copy()
        
        for dep, version in new_deps.items():
            if dep not in merged:
                merged[dep] = version
            elif merged[dep] != version:
                # Si las versiones difieren, usar la del template (más nueva generalmente)
                if version.startswith("workspace:"):
                    merged[dep] = version
                elif version.startswith("^") and not merged[dep].startswith("^"):
                    merged[dep] = version
        
        return dict(sorted(merged.items()))

    def standardize_package(self, file_path: Path, dry_run: bool = False) -> bool:
        """Estandariza un package.json individual preservando configuraciones que funcionan"""
        logger.info(f"🔧 Procesando: {file_path.relative_to(self.root_dir)}")
        
        # Backup del archivo original
        if not dry_run:
            backup_path = self.backup_file(file_path)
            logger.info(f"💾 Backup creado: {backup_path.relative_to(self.root_dir)}")
        
        # Cargar package actual
        package_data = self.load_package_json(file_path)
        if not package_data:
            return False
        
        # Detectar tipo de package
        package_type = self.detect_package_type(file_path, package_data)
        app_name = self.get_app_name(file_path)
        
        logger.info(f"📂 Tipo detectado: {package_type} | App: {app_name}")
        
        # Obtener template base
        if package_type in self.config["templates"]:
            template = self.config["templates"][package_type].copy()
        else:
            logger.warning(f"⚠️  No hay template para tipo '{package_type}', usando genérico")
            template = {}
        
        # Combinar con datos existentes - PRESERVAR CONFIGURACIONES CRÍTICAS
        standardized = package_data.copy()
        
        # PRESERVAR campos críticos que no deben cambiar
        fields_to_preserve = self.config.get("fieldsToPreserve", [])
        for field in fields_to_preserve:
            if field in package_data:
                logger.info(f"🔒 Preservando campo crítico: {field}")
                # No tocar estos campos
                continue
        
        # Personalizar template para apps específicas
        if package_type == "app" and app_name in self.config["appConfigurations"]:
            app_config = self.config["appConfigurations"][app_name]
            
            # Usar versión específica si está definida, sino usar template
            if "version" in app_config:
                standardized["version"] = app_config["version"]
            elif self.config.get("optionalStandardizations", {}).get("normalizeVersions", False):
                standardized["version"] = template.get("version", "1.0.0")
            
            # Actualizar descripción
            standardized["description"] = app_config["description"]
            
            # SCRIPTS: Manejo inteligente preservando custom scripts
            self._handle_app_scripts(standardized, app_config, template, app_name)
        
        if package_type == "package" and app_name:
            standardized["name"] = f"@altamedica/{app_name}"
            standardized["description"] = f"{app_name.replace('-', ' ').title()} package for AltaMedica platform"
        
        # Campos que OPCIONALMENTE se actualizan desde template
        optional_update = ["author", "license", "keywords", "repository", "homepage", "bugs"]
        for field in optional_update:
            if field in template and (field not in standardized or not standardized[field]):
                standardized[field] = template[field]
        
        # WORKSPACE DEPENDENCIES: Estandarizar formato
        if self.config.get("optionalStandardizations", {}).get("standardizeWorkspaceDeps", False):
            self._standardize_workspace_dependencies(standardized)
        
        # Dependencies: merge CONSERVADOR
        self._merge_dependencies_conservatively(standardized, template, package_type)
        
        # PeerDependencies y exports para packages (solo si no existen)
        if package_type == "package":
            for field in ["peerDependencies", "exports", "files", "main", "types"]:
                if field in template and field not in standardized:
                    standardized[field] = template[field]
        
        # Agregar dependencias estándar OPCIONALMENTE
        if self.config.get("optionalStandardizations", {}).get("addMissingScripts", False):
            self._add_standard_dependencies(standardized, app_name, package_type)
        
        # Verificar constraints de versiones SOLO si está habilitado
        if self.config.get("optionalStandardizations", {}).get("updateDependencyVersions", False):
            self._verify_version_constraints(standardized)
        
        # Guardar archivo estandarizado
        if not dry_run:
            self.save_package_json(file_path, standardized)
            logger.info(f"✅ Actualizado: {file_path.relative_to(self.root_dir)}")
        else:
            logger.info(f"🎯 [DRY RUN] Se habría actualizado: {file_path.relative_to(self.root_dir)}")
        
        return True

    def _handle_app_scripts(self, package_data: Dict[str, Any], app_config: Dict[str, Any], template: Dict[str, Any], app_name: str):
        """Maneja scripts de aplicaciones preservando configuraciones custom"""
        existing_scripts = package_data.get("scripts", {})
        new_scripts = {}
        
        # Preservar scripts específicos definidos en config
        preserve_scripts = app_config.get("preserveScripts", [])
        for script_name in preserve_scripts:
            if script_name in existing_scripts:
                new_scripts[script_name] = existing_scripts[script_name]
                logger.info(f"🔒 Preservando script custom: {script_name}")
        
        # Agregar scripts custom definidos en config
        custom_scripts = app_config.get("customScripts", {})
        for script_name, script_value in custom_scripts.items():
            new_scripts[script_name] = script_value
            logger.info(f"📝 Script custom aplicado: {script_name}")
        
        # Agregar scripts estándar del template (solo los que no existen)
        template_scripts = template.get("scripts", {})
        for script_name, script_value in template_scripts.items():
            if script_name not in new_scripts:
                # Reemplazar placeholder de puerto
                script_with_port = script_value.replace("{PORT}", str(app_config["port"]))
                new_scripts[script_name] = script_with_port
        
        # Mantener otros scripts existentes que no están en ninguna categoría
        for script_name, script_value in existing_scripts.items():
            if script_name not in new_scripts:
                new_scripts[script_name] = script_value
        
        package_data["scripts"] = dict(sorted(new_scripts.items()))
    
    def _standardize_workspace_dependencies(self, package_data: Dict[str, Any]):
        """Estandariza el formato de dependencias workspace"""
        workspace_config = self.config.get("workspaceDependencyStandardization", {})
        preferred_format = workspace_config.get("preferredFormat", "workspace:*")
        exceptions = workspace_config.get("exceptions", {})
        
        for deps_type in ["dependencies", "devDependencies"]:
            if deps_type in package_data:
                deps = package_data[deps_type]
                for dep_name, dep_version in deps.items():
                    if dep_name.startswith("@altamedica/"):
                        if dep_name in exceptions:
                            deps[dep_name] = exceptions[dep_name]
                        elif dep_version.startswith("workspace:"):
                            deps[dep_name] = preferred_format
                            logger.info(f"🔄 Estandarizado workspace dep: {dep_name} -> {preferred_format}")
    
    def _merge_dependencies_conservatively(self, package_data: Dict[str, Any], template: Dict[str, Any], package_type: str):
        """Merge conservador de dependencias - solo agrega las que faltan"""
        if not self.config.get("optionalStandardizations", {}).get("updateDependencyVersions", False):
            logger.info("🔒 Saltando actualización de dependencias (preservando existentes)")
            return
        
        # Solo agregar dependencias que faltan completamente
        for deps_type in ["dependencies", "devDependencies"]:
            if deps_type in template:
                existing_deps = package_data.get(deps_type, {})
                template_deps = template[deps_type]
                
                for dep_name, dep_version in template_deps.items():
                    if dep_name not in existing_deps:
                        existing_deps[dep_name] = dep_version
                        logger.info(f"➕ Agregada dependencia faltante: {dep_name}")
                
                if existing_deps:
                    package_data[deps_type] = dict(sorted(existing_deps.items()))

    def _add_standard_dependencies(self, package_data: Dict[str, Any], app_name: str, package_type: str):
        """Agrega dependencias estándar según características detectadas"""
        dependencies = package_data.get("dependencies", {})
        dev_dependencies = package_data.get("devDependencies", {})
        
        # Dependencias médicas para apps/packages médicos
        if any(keyword in str(package_data.get("description", "")).lower() for keyword in ["medical", "telemedicine", "doctor", "patient"]):
            for dep, version in self.config["standardDependencies"]["medical"]["dependencies"].items():
                if dep not in dependencies:
                    dependencies[dep] = version
        
        # Dependencias UI para apps frontend
        if package_type == "app" or "ui" in app_name:
            for dep, version in self.config["standardDependencies"]["ui"]["dependencies"].items():
                if dep not in dependencies:
                    dependencies[dep] = version
        
        # Dependencias Firebase
        if any(keyword in dependencies.keys() for keyword in ["firebase", "firestore"]):
            for dep, version in self.config["standardDependencies"]["firebase"]["dependencies"].items():
                if dep not in dependencies:
                    dependencies[dep] = version
        
        # Dependencias WebRTC para telemedicina
        if any(keyword in str(package_data).lower() for keyword in ["webrtc", "telemedicine", "signaling"]):
            webrtc_deps = self.config["standardDependencies"]["webrtc"]
            for dep, version in webrtc_deps["dependencies"].items():
                if dep not in dependencies:
                    dependencies[dep] = version
            
            for dep, version in webrtc_deps.get("devDependencies", {}).items():
                if dep not in dev_dependencies:
                    dev_dependencies[dep] = version
        
        # Actualizar en el package
        if dependencies:
            package_data["dependencies"] = dict(sorted(dependencies.items()))
        if dev_dependencies:
            package_data["devDependencies"] = dict(sorted(dev_dependencies.items()))

    def _verify_version_constraints(self, package_data: Dict[str, Any]):
        """Verifica y corrige constraints de versiones"""
        constraints = self.config["versionConstraints"]
        
        all_deps = {}
        all_deps.update(package_data.get("dependencies", {}))
        all_deps.update(package_data.get("devDependencies", {}))
        
        for dep, constraint_version in constraints.items():
            if dep in all_deps:
                current_version = all_deps[dep]
                if not current_version.startswith(constraint_version.split("^")[0] if "^" in constraint_version else constraint_version):
                    logger.warning(f"⚠️  Versión de {dep} ({current_version}) no cumple constraint ({constraint_version})")
                    # Actualizar a versión constraint
                    if dep in package_data.get("dependencies", {}):
                        package_data["dependencies"][dep] = constraint_version
                    elif dep in package_data.get("devDependencies", {}):
                        package_data["devDependencies"][dep] = constraint_version

    def standardize_all(self, dry_run: bool = False, target_apps: Optional[List[str]] = None):
        """Estandariza todos los package.json del monorepo"""
        logger.info("🚀 Iniciando estandarización de monorepo AltaMedica")
        logger.info(f"📂 Directorio raíz: {self.root_dir}")
        logger.info(f"🔍 Modo: {'DRY RUN' if dry_run else 'EJECUCIÓN REAL'}")
        
        package_files = self.find_package_files()
        processed = 0
        errors = 0
        
        for package_file in package_files:
            try:
                # Filtrar por apps específicas si se solicita
                if target_apps:
                    app_name = self.get_app_name(package_file)
                    if app_name and app_name not in target_apps:
                        continue
                
                success = self.standardize_package(package_file, dry_run)
                if success:
                    processed += 1
                else:
                    errors += 1
                    
            except Exception as e:
                logger.error(f"❌ Error procesando {package_file}: {e}")
                errors += 1
        
        # Resumen final
        logger.info("=" * 60)
        logger.info("📊 RESUMEN DE ESTANDARIZACIÓN")
        logger.info("=" * 60)
        logger.info(f"✅ Archivos procesados: {processed}")
        logger.info(f"❌ Errores: {errors}")
        logger.info(f"📁 Total encontrados: {len(package_files)}")
        
        if not dry_run:
            logger.info(f"💾 Backups guardados en: {self.backup_dir}")
            
        if errors == 0:
            logger.info("🎉 ¡Estandarización completada exitosamente!")
        else:
            logger.warning(f"⚠️  Completado con {errors} errores")

    def validate_config(self) -> bool:
        """Valida la configuración del template"""
        required_sections = ["templates", "appConfigurations", "standardDependencies", "versionConstraints"]
        
        for section in required_sections:
            if section not in self.config:
                logger.error(f"❌ Sección requerida '{section}' no encontrada en configuración")
                return False
        
        logger.info("✅ Configuración validada correctamente")
        return True

    def create_git_hook(self):
        """Crea un git hook para estandarización automática"""
        hooks_dir = self.root_dir / ".git" / "hooks"
        if not hooks_dir.exists():
            logger.warning("⚠️  Directorio .git/hooks no encontrado")
            return
        
        pre_commit_hook = hooks_dir / "pre-commit"
        hook_content = f"""#!/bin/sh
# AltaMedica Package Standardization Hook
# Auto-generated by standardize-packages.py

echo "🔧 Ejecutando estandarización de packages..."
cd "{self.root_dir}"
python3 standardize-packages.py --mode=auto --quiet

if [ $? -ne 0 ]; then
    echo "❌ Error en estandarización automática"
    exit 1
fi

echo "✅ Estandarización completada"
"""
        
        try:
            with open(pre_commit_hook, 'w') as f:
                f.write(hook_content)
            pre_commit_hook.chmod(0o755)
            logger.info(f"✅ Git hook creado: {pre_commit_hook}")
        except Exception as e:
            logger.error(f"❌ Error creando git hook: {e}")

def main():
    parser = argparse.ArgumentParser(description="AltaMedica Package Standardization Tool")
    parser.add_argument("--dry-run", action="store_true", help="Ejecutar sin modificar archivos")
    parser.add_argument("--apps", nargs="*", help="Apps específicas a procesar")
    parser.add_argument("--create-hook", action="store_true", help="Crear git hook para auto-estandarización")
    parser.add_argument("--validate", action="store_true", help="Solo validar configuración")
    parser.add_argument("--quiet", action="store_true", help="Modo silencioso")
    parser.add_argument("--mode", choices=["manual", "auto"], default="manual", help="Modo de ejecución")
    
    args = parser.parse_args()
    
    if args.quiet:
        logging.getLogger().setLevel(logging.WARNING)
    
    try:
        standardizer = PackageStandardizer()
        
        if args.validate:
            return standardizer.validate_config()
        
        if args.create_hook:
            standardizer.create_git_hook()
            return True
        
        if not standardizer.validate_config():
            return False
        
        standardizer.standardize_all(
            dry_run=args.dry_run,
            target_apps=args.apps
        )
        
        return True
        
    except KeyboardInterrupt:
        logger.info("⏹️  Operación cancelada por el usuario")
        return False
    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        return False

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)