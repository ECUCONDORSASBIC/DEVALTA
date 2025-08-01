"""
AltaMedica AI Orchestrator Package
Orquestador inteligente con integración automática Grok-4 + Claude
"""

from .altamedica_ai_orchestrator import (
    AltamedicaAIOrchestrator,
    TaskType,
    ModelType,
    TaskConfig,
    ModelResponse,
    create_orchestrator
)

__all__ = [
    'AltamedicaAIOrchestrator',
    'TaskType',
    'ModelType', 
    'TaskConfig',
    'ModelResponse',
    'create_orchestrator'
]