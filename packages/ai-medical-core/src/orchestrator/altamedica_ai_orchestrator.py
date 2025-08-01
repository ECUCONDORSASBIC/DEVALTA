#!/usr/bin/env python3
"""
AltaMedica AI Orchestrator - Integración Grok-4 + Claude
Orquestador inteligente que usa Grok-4 automáticamente para tareas creativas
y mantiene Claude para tareas técnicas médicas complejas
"""

import os
import json
import asyncio
import aiohttp
import re
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging

# Configurar logging con formato médico
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [ALTAMEDICA-AI] - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ModelType(Enum):
    """Tipos de modelos AI disponibles"""
    GROK_4 = "grok-4"
    CLAUDE_SONNET = "claude-3.5-sonnet"
    CLAUDE_OPUS = "claude-3-opus"

class TaskType(Enum):
    """Tipos de tareas con mapping automático a modelos"""
    # Tareas creativas -> Grok-4
    UI_IDEAS = "ui_ideas"
    MARKETING = "marketing" 
    RESEARCH = "research"
    GAMIFICATION = "gamification"
    ASSETS = "assets"
    
    # Tareas técnicas complejas -> Claude Opus
    TELEMEDICINE_REAL = "telemedicine_real"
    WEBRTC_IMPLEMENTATION = "webrtc_implementation"
    REAL_TIME_CHAT = "real_time_chat"
    BACKEND_ARCHITECTURE = "backend_architecture"
    VIDEO_CALL_SYSTEM = "video_call_system"
    SOCKET_INTEGRATION = "socket_integration"
    MEDICAL_AI = "medical_ai"
    HIPAA_COMPLIANCE = "hipaa_compliance"
    
    # Tareas técnicas estándar -> Claude Sonnet
    ARCHITECTURE = "architecture"
    DEBUGGING = "debugging"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    TELEMEDICINE = "telemedicine"

@dataclass
class TaskConfig:
    """Configuración de tarea"""
    task_type: TaskType
    prompt: str
    context: Dict[str, Any] = None
    hipaa_safe: bool = True
    max_tokens: int = 4000
    temperature: float = 0.7
    priority: str = "medium"

@dataclass
class ModelResponse:
    """Respuesta de modelo AI"""
    content: str
    model_used: ModelType
    tokens_used: int
    success: bool
    error: Optional[str] = None
    fallback_used: bool = False

class AltamedicaAIOrchestrator:
    """
    Orquestador AI principal de AltaMedica
    Integra Grok-4 para creatividad + Claude para técnico médico
    """
    
    def __init__(self):
        self.xai_api_key = os.getenv('XAI_API_KEY')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        
        # Task type mapping a modelos
        self.task_model_mapping = {
            # Grok-4 para tareas creativas
            TaskType.UI_IDEAS: ModelType.GROK_4,
            TaskType.MARKETING: ModelType.GROK_4,
            TaskType.RESEARCH: ModelType.GROK_4,
            TaskType.GAMIFICATION: ModelType.GROK_4,
            TaskType.ASSETS: ModelType.GROK_4,
            
            # Claude Opus para tareas técnicas complejas de telemedicina
            TaskType.TELEMEDICINE_REAL: ModelType.CLAUDE_OPUS,
            TaskType.WEBRTC_IMPLEMENTATION: ModelType.CLAUDE_OPUS,
            TaskType.REAL_TIME_CHAT: ModelType.CLAUDE_OPUS,
            TaskType.BACKEND_ARCHITECTURE: ModelType.CLAUDE_OPUS,
            TaskType.VIDEO_CALL_SYSTEM: ModelType.CLAUDE_OPUS,
            TaskType.SOCKET_INTEGRATION: ModelType.CLAUDE_OPUS,
            TaskType.MEDICAL_AI: ModelType.CLAUDE_OPUS,
            TaskType.HIPAA_COMPLIANCE: ModelType.CLAUDE_OPUS,
            
            # Claude Sonnet para tareas técnicas estándar
            TaskType.ARCHITECTURE: ModelType.CLAUDE_SONNET,
            TaskType.DEBUGGING: ModelType.CLAUDE_SONNET,
            TaskType.TESTING: ModelType.CLAUDE_SONNET,
            TaskType.DOCUMENTATION: ModelType.CLAUDE_SONNET,
            TaskType.TELEMEDICINE: ModelType.CLAUDE_SONNET,
        }
        
        # Métricas de uso
        self.usage_stats = {
            ModelType.GROK_4: {"requests": 0, "tokens": 0, "errors": 0},
            ModelType.CLAUDE_SONNET: {"requests": 0, "tokens": 0, "errors": 0},
            ModelType.CLAUDE_OPUS: {"requests": 0, "tokens": 0, "errors": 0},
        }
        
        # Cache de respuestas
        self.response_cache = {}
        
        logger.info("🤖 AltaMedica AI Orchestrator inicializado")
        logger.info(f"🔐 XAI API Key: {'✅ Configurada' if self.xai_api_key else '❌ Faltante'}")
        logger.info(f"🔐 Anthropic API Key: {'✅ Configurada' if self.anthropic_api_key else '❌ Faltante'}")

    def _get_primary_model(self, task_type: TaskType) -> ModelType:
        """
        Obtiene el modelo primario para un tipo de tarea
        Implementa la lógica de routing automático
        """
        model = self.task_model_mapping.get(task_type, ModelType.CLAUDE_SONNET)
        
        logger.info(f"📋 Task: {task_type.value} -> 🤖 Model: {model.value}")
        return model

    def _get_fallback_model(self, primary_model: ModelType) -> ModelType:
        """
        Obtiene modelo de fallback si el primario falla
        """
        fallback_map = {
            ModelType.GROK_4: ModelType.CLAUDE_SONNET,
            ModelType.CLAUDE_OPUS: ModelType.CLAUDE_SONNET,
            ModelType.CLAUDE_SONNET: ModelType.CLAUDE_SONNET,  # No hay fallback
        }
        
        fallback = fallback_map[primary_model]
        logger.warning(f"🔄 Fallback: {primary_model.value} -> {fallback.value}")
        return fallback

    def _sanitize_prompt_for_hipaa(self, prompt: str, task_type: TaskType) -> str:
        """
        Sanitiza prompt para cumplimiento HIPAA
        Especialmente importante para prompts enviados a Grok
        """
        # Patrones de datos sensibles médicos
        sensitive_patterns = [
            (r'\b\d{3}-\d{2}-\d{4}\b', '[SSN-REDACTED]'),  # SSN
            (r'\b\d{16}\b', '[CARD-REDACTED]'),  # Tarjetas de crédito
            (r'paciente\s+[A-Z][a-z]+\s+[A-Z][a-z]+', 'paciente [NOMBRE-CENSURADO]'),
            (r'patient\s+[A-Z][a-z]+\s+[A-Z][a-z]+', 'patient [NAME-REDACTED]'),
            (r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(?:born|nació)\s+\d{4}', '[PATIENT-DATA-REDACTED]'),
            (r'historia\s+clínica\s+#?\d+', 'historia clínica [ID-CENSURADO]'),
            (r'medical\s+record\s+#?\d+', 'medical record [ID-REDACTED]'),
        ]
        
        sanitized_prompt = prompt
        redactions_made = []
        
        for pattern, replacement in sensitive_patterns:
            matches = re.findall(pattern, sanitized_prompt, re.IGNORECASE)
            if matches:
                sanitized_prompt = re.sub(pattern, replacement, sanitized_prompt, flags=re.IGNORECASE)
                redactions_made.extend(matches)
        
        # Agregar contexto HIPAA para tareas que van a Grok
        if task_type in [TaskType.UI_IDEAS, TaskType.MARKETING, TaskType.RESEARCH, 
                        TaskType.GAMIFICATION, TaskType.ASSETS]:
            hipaa_context = """
[CONTEXTO HIPAA] Este prompt es para diseño/marketing médico. 
NUNCA incluir datos reales de pacientes. Usar solo ejemplos ficticios.
Enfocarse en UX/diseño sin comprometer privacidad médica.
"""
            sanitized_prompt = hipaa_context + sanitized_prompt
        
        if redactions_made:
            logger.warning(f"🔒 HIPAA: {len(redactions_made)} censuras aplicadas")
            
        return sanitized_prompt

    async def _call_grok_api(self, prompt: str, max_tokens: int = 4000, 
                           temperature: float = 0.7) -> ModelResponse:
        """
        Llama a la API de Grok (xAI) para tareas creativas
        """
        if not self.xai_api_key:
            logger.error("❌ XAI_API_KEY no configurada")
            return ModelResponse(
                content="", 
                model_used=ModelType.GROK_4,
                tokens_used=0,
                success=False,
                error="XAI_API_KEY no configurada"
            )

        headers = {
            "Authorization": f"Bearer {self.xai_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "grok-4-0709",  # Modelo Grok-4 disponible
            "messages": [
                {
                    "role": "system",
                    "content": "Eres un asistente creativo especializado en UX/UI médico y marketing para AltaMedica. Generas ideas innovadoras manteniendo compliance HIPAA."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.x.ai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        tokens_used = data.get("usage", {}).get("total_tokens", 0)
                        
                        # Actualizar estadísticas
                        self.usage_stats[ModelType.GROK_4]["requests"] += 1
                        self.usage_stats[ModelType.GROK_4]["tokens"] += tokens_used
                        
                        logger.info(f"✅ Grok-4 Success: {tokens_used} tokens")
                        
                        return ModelResponse(
                            content=content,
                            model_used=ModelType.GROK_4,
                            tokens_used=tokens_used,
                            success=True
                        )
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Grok API Error {response.status}: {error_text}")
                        
                        self.usage_stats[ModelType.GROK_4]["errors"] += 1
                        
                        return ModelResponse(
                            content="",
                            model_used=ModelType.GROK_4,
                            tokens_used=0,
                            success=False,
                            error=f"API Error {response.status}: {error_text}"
                        )
                        
        except asyncio.TimeoutError:
            logger.error("⏰ Grok API Timeout")
            self.usage_stats[ModelType.GROK_4]["errors"] += 1
            return ModelResponse(
                content="",
                model_used=ModelType.GROK_4,
                tokens_used=0,
                success=False,
                error="Timeout de API"
            )
        except Exception as e:
            logger.error(f"💥 Grok API Exception: {str(e)}")
            self.usage_stats[ModelType.GROK_4]["errors"] += 1
            return ModelResponse(
                content="",
                model_used=ModelType.GROK_4,
                tokens_used=0,
                success=False,
                error=str(e)
            )

    async def _call_claude_api(self, prompt: str, model: ModelType, 
                             max_tokens: int = 4000) -> ModelResponse:
        """
        Llama a la API de Claude (Anthropic) para tareas técnicas médicas
        Placeholder - implementar con SDK oficial de Anthropic
        """
        # Nota: Esta implementación requiere el SDK oficial de Anthropic
        # pip install anthropic
        
        try:
            # Simular llamada a Claude (implementar con SDK real)
            logger.info(f"🔄 Simulando llamada a {model.value}")
            
            # Aquí iría la implementación real con:
            # import anthropic
            # client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            # response = client.messages.create(...)
            
            # Por ahora, simular respuesta
            simulated_content = f"[SIMULADO] Respuesta de {model.value} para: {prompt[:100]}..."
            tokens_used = len(prompt) // 4  # Estimación
            
            # Actualizar estadísticas
            self.usage_stats[model]["requests"] += 1
            self.usage_stats[model]["tokens"] += tokens_used
            
            logger.info(f"✅ {model.value} Success: {tokens_used} tokens")
            
            return ModelResponse(
                content=simulated_content,
                model_used=model,
                tokens_used=tokens_used,
                success=True
            )
            
        except Exception as e:
            logger.error(f"💥 Claude API Exception: {str(e)}")
            self.usage_stats[model]["errors"] += 1
            return ModelResponse(
                content="",
                model_used=model,
                tokens_used=0,
                success=False,
                error=str(e)
            )

    async def execute_task(self, config: TaskConfig) -> ModelResponse:
        """
        Ejecuta una tarea usando el modelo óptimo automáticamente
        """
        logger.info(f"🎯 Ejecutando tarea: {config.task_type.value}")
        
        # 1. Obtener modelo primario
        primary_model = self._get_primary_model(config.task_type)
        
        # 2. Sanitizar prompt para HIPAA
        sanitized_prompt = self._sanitize_prompt_for_hipaa(config.prompt, config.task_type)
        
        # 3. Intentar con modelo primario
        if primary_model == ModelType.GROK_4:
            response = await self._call_grok_api(
                sanitized_prompt, 
                config.max_tokens, 
                config.temperature
            )
        else:
            response = await self._call_claude_api(
                sanitized_prompt, 
                primary_model, 
                config.max_tokens
            )
        
        # 4. Si falla, usar fallback
        if not response.success:
            logger.warning(f"⚠️ Modelo primario falló, usando fallback")
            fallback_model = self._get_fallback_model(primary_model)
            
            fallback_response = await self._call_claude_api(
                sanitized_prompt,
                fallback_model,
                config.max_tokens
            )
            
            if fallback_response.success:
                fallback_response.fallback_used = True
                return fallback_response
        
        return response

    def get_usage_stats(self) -> Dict:
        """
        Obtiene estadísticas de uso para /status
        """
        stats = {
            "usage_by_model": self.usage_stats,
            "total_requests": sum(model["requests"] for model in self.usage_stats.values()),
            "total_tokens": sum(model["tokens"] for model in self.usage_stats.values()),
            "total_errors": sum(model["errors"] for model in self.usage_stats.values()),
            "cache_size": len(self.response_cache),
            "models_available": {
                "grok_4": bool(self.xai_api_key),
                "claude": bool(self.anthropic_api_key)
            }
        }
        
        return stats

    # Métodos de conveniencia para tareas específicas
    async def generate_ui_ideas(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Genera ideas UX/UI usando Grok-4 automáticamente"""
        config = TaskConfig(
            task_type=TaskType.UI_IDEAS,
            prompt=prompt,
            context=context,
            temperature=0.8  # Más creativo
        )
        return await self.execute_task(config)

    async def create_marketing_content(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Crea contenido de marketing usando Grok-4 automáticamente"""
        config = TaskConfig(
            task_type=TaskType.MARKETING,
            prompt=prompt,
            context=context,
            temperature=0.9  # Muy creativo
        )
        return await self.execute_task(config)

    async def research_competitors(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Investiga competidores usando Grok-4 automáticamente"""
        config = TaskConfig(
            task_type=TaskType.RESEARCH,
            prompt=prompt,
            context=context
        )
        return await self.execute_task(config)

    async def design_gamification(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Diseña gamificación usando Grok-4 automáticamente"""
        config = TaskConfig(
            task_type=TaskType.GAMIFICATION,
            prompt=prompt,
            context=context,
            temperature=0.8
        )
        return await self.execute_task(config)

    async def generate_assets(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Genera assets/imágenes usando Grok-4 automáticamente"""
        config = TaskConfig(
            task_type=TaskType.ASSETS,
            prompt=prompt,
            context=context,
            temperature=0.7
        )
        return await self.execute_task(config)

    # Métodos específicos para tareas complejas de telemedicina (Claude Opus)
    async def implement_webrtc_system(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Implementa sistema WebRTC completo usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.WEBRTC_IMPLEMENTATION,
            prompt=prompt,
            context=context,
            max_tokens=8000,  # Más tokens para implementaciones complejas
            temperature=0.3   # Más preciso para código
        )
        return await self.execute_task(config)

    async def create_real_time_chat(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Crea sistema de chat en tiempo real usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.REAL_TIME_CHAT,
            prompt=prompt,
            context=context,
            max_tokens=8000,
            temperature=0.3
        )
        return await self.execute_task(config)

    async def design_backend_architecture(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Diseña arquitectura backend usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.BACKEND_ARCHITECTURE,
            prompt=prompt,
            context=context,
            max_tokens=8000,
            temperature=0.3
        )
        return await self.execute_task(config)

    async def build_video_call_system(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Construye sistema completo de videollamadas usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.VIDEO_CALL_SYSTEM,
            prompt=prompt,
            context=context,
            max_tokens=8000,
            temperature=0.3
        )
        return await self.execute_task(config)

    async def implement_socket_integration(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Implementa integración WebSocket usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.SOCKET_INTEGRATION,
            prompt=prompt,
            context=context,
            max_tokens=8000,
            temperature=0.3
        )
        return await self.execute_task(config)

    async def create_telemedicine_system(self, prompt: str, context: Dict = None) -> ModelResponse:
        """Crea sistema completo de telemedicina usando Claude Opus automáticamente"""
        config = TaskConfig(
            task_type=TaskType.TELEMEDICINE_REAL,
            prompt=prompt,
            context=context,
            max_tokens=8000,
            temperature=0.3
        )
        return await self.execute_task(config)

# Función de conveniencia para importar
def create_orchestrator() -> AltamedicaAIOrchestrator:
    """Crea instancia del orquestrador"""
    return AltamedicaAIOrchestrator()

# Ejemplo de uso
async def main():
    """
    Ejemplo de uso del orquestador
    Demuestra routing automático Grok-4 vs Claude
    """
    orchestrator = create_orchestrator()
    
    # Ejemplo 1: Ideas UX para patients app -> Automáticamente Grok-4
    print("🎨 Ejemplo: Generar ideas UX para patients app")
    ux_response = await orchestrator.generate_ui_ideas(
        prompt="""
        Genera 5 ideas innovadoras de UX para mejorar la app de pacientes de AltaMedica.
        Enfócate en telemedicina, accessibility y engagement de pacientes.
        Considera que los usuarios son principalmente adultos mayores con condiciones crónicas.
        """,
        context={"app": "patients", "target": "elderly", "focus": "telemedicine"}
    )
    
    if ux_response.success:
        print(f"✅ Modelo usado: {ux_response.model_used.value}")
        print(f"📊 Tokens: {ux_response.tokens_used}")
        print(f"🔄 Fallback: {ux_response.fallback_used}")
        print(f"💡 Ideas generadas:\n{ux_response.content}")
    else:
        print(f"❌ Error: {ux_response.error}")
    
    # Ejemplo 2: Debugging técnico -> Automáticamente Claude
    print("\n🔧 Ejemplo: Debugging técnico")
    debug_response = await orchestrator.execute_task(TaskConfig(
        task_type=TaskType.DEBUGGING,
        prompt="Analiza error de WebRTC en telemedicina: connection failed after 30s timeout"
    ))
    
    if debug_response.success:
        print(f"✅ Modelo usado: {debug_response.model_used.value}")
        print(f"🔍 Análisis:\n{debug_response.content}")
    
    # Mostrar estadísticas
    print("\n📊 Estadísticas de uso:")
    stats = orchestrator.get_usage_stats()
    print(json.dumps(stats, indent=2))

if __name__ == "__main__":
    # Ejecutar ejemplo
    asyncio.run(main())