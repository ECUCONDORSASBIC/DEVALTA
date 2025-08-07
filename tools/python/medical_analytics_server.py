#!/usr/bin/env python3
"""
AltaMedica - Servidor de Análisis Médico Poblacional
Sistema completo de estadísticas médicas, demografía y restricciones de uso
"""

import os
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
import sqlite3
import pandas as pd
import numpy as np
from collections import defaultdict, Counter

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('medical_analytics.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuración de la aplicación
app = FastAPI(
    title="AltaMedica Medical Analytics API",
    description="Sistema de análisis poblacional médico y restricciones de uso",
    version="1.0.0"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# MODELOS DE DATOS Y ENUMS
# ================================

class SeverityLevel(str, Enum):
    LEVE = "leve"
    MODERADO = "moderado"
    SEVERO = "severo"
    CRITICO = "critico"

class Gender(str, Enum):
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"
    NO_ESPECIFICADO = "no_especificado"

class SymptomCategory(str, Enum):
    RESPIRATORIO = "respiratorio"
    CARDIOVASCULAR = "cardiovascular"
    GASTROINTESTINAL = "gastrointestinal"
    NEUROLOGICO = "neurologico"
    MUSCULOESQUELETICO = "musculoesqueletico"
    DERMATOLOGICO = "dermatologico"
    ENDOCRINO = "endocrino"
    PSIQUIATRICO = "psiquiatrico"
    GENITOURINARIO = "genitourinario"
    OFTALMOLOGICO = "oftalmologico"
    OTORRINOLARINGOLOGICO = "otorrinolaringologico"
    HEMATOLOGICO = "hematologico"
    INMUNOLOGICO = "inmunologico"
    OTRO = "otro"

class DiagnosisCategory(str, Enum):
    INFECCIOSO = "infeccioso"
    NEOPLASICO = "neoplasico"
    ENDOCRINO = "endocrino"
    NUTRICIONAL = "nutricional"
    MENTAL = "mental"
    NERVIOSO = "nervioso"
    CARDIOVASCULAR = "cardiovascular"
    RESPIRATORIO = "respiratorio"
    DIGESTIVO = "digestivo"
    GENITOURINARIO = "genitourinario"
    EMBARAZO = "embarazo"
    PIEL = "piel"
    MUSCULOESQUELETICO = "musculoesqueletico"
    CONGENITO = "congenito"
    SINTOMAS_GENERALES = "sintomas_generales"
    TRAUMATISMOS = "traumatismos"
    OTRO = "otro"

# ================================
# MODELOS PYDANTIC
# ================================

class SymptomData(BaseModel):
    name: str = Field(..., description="Nombre del síntoma")
    category: SymptomCategory = Field(..., description="Categoría del síntoma")
    severity: SeverityLevel = Field(..., description="Severidad del síntoma")
    duration_days: Optional[int] = Field(None, description="Duración en días")
    description: Optional[str] = Field(None, description="Descripción adicional")

class DiagnosisData(BaseModel):
    primary_diagnosis: str = Field(..., description="Diagnóstico principal")
    category: DiagnosisCategory = Field(..., description="Categoría del diagnóstico")
    confidence_percentage: float = Field(..., ge=0, le=100, description="Porcentaje de confianza")
    differential_diagnoses: List[str] = Field(default=[], description="Diagnósticos diferenciales")
    icd10_code: Optional[str] = Field(None, description="Código CIE-10")

class PatientDemographics(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Edad del paciente")
    gender: Gender = Field(..., description="Género del paciente")
    location_country: str = Field(default="Mexico", description="País")
    location_state: Optional[str] = Field(None, description="Estado")
    location_city: Optional[str] = Field(None, description="Ciudad")
    occupation: Optional[str] = Field(None, description="Ocupación")

class MedicalDiagnosisRequest(BaseModel):
    user_id: str = Field(..., description="ID único del usuario")
    patient_demographics: PatientDemographics
    symptoms: List[SymptomData] = Field(..., min_items=1, description="Lista de síntomas")
    diagnosis: DiagnosisData
    consultation_notes: Optional[str] = Field(None, description="Notas de la consulta")

class UsageRestrictionResponse(BaseModel):
    can_use: bool
    next_available_date: Optional[datetime] = None
    days_remaining: Optional[int] = None
    total_diagnoses_count: int = 0

class PopulationStatistics(BaseModel):
    total_diagnoses: int
    unique_users: int
    gender_distribution: Dict[str, Dict[str, Any]]
    age_distribution: Dict[str, int]
    symptom_prevalence: Dict[str, Dict[str, Any]]
    diagnosis_prevalence: Dict[str, Dict[str, Any]]
    geographic_distribution: Dict[str, int]
    temporal_trends: Dict[str, List[Dict[str, Any]]]

# ================================
# BASE DE DATOS Y PERSISTENCIA
# ================================

class MedicalDatabase:
    def __init__(self, db_path: str = "medical_analytics.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializar base de datos SQLite con tablas necesarias"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de usuarios y restricciones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                first_diagnosis_date TEXT,
                last_diagnosis_date TEXT,
                total_diagnoses INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabla principal de diagnósticos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS medical_diagnoses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                diagnosis_id TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                
                -- Demografia
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                location_country TEXT DEFAULT 'Mexico',
                location_state TEXT,
                location_city TEXT,
                occupation TEXT,
                
                -- Diagnóstico principal
                primary_diagnosis TEXT NOT NULL,
                diagnosis_category TEXT NOT NULL,
                confidence_percentage REAL NOT NULL,
                icd10_code TEXT,
                
                -- Metadatos
                consultation_notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabla de síntomas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS symptoms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                diagnosis_id TEXT NOT NULL,
                symptom_name TEXT NOT NULL,
                symptom_category TEXT NOT NULL,
                severity TEXT NOT NULL,
                duration_days INTEGER,
                description TEXT,
                FOREIGN KEY (diagnosis_id) REFERENCES medical_diagnoses (diagnosis_id)
            )
        """)
        
        # Tabla de diagnósticos diferenciales
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS differential_diagnoses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                diagnosis_id TEXT NOT NULL,
                differential_diagnosis TEXT NOT NULL,
                FOREIGN KEY (diagnosis_id) REFERENCES medical_diagnoses (diagnosis_id)
            )
        """)
        
        # Índices para performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_id ON medical_diagnoses (user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON medical_diagnoses (timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_gender ON medical_diagnoses (gender)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_age ON medical_diagnoses (age)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_diagnosis_category ON medical_diagnoses (diagnosis_category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_symptom_category ON symptoms (symptom_category)")
        
        conn.commit()
        conn.close()
        logger.info("Base de datos inicializada correctamente")
    
    def check_usage_restriction(self, user_id: str) -> UsageRestrictionResponse:
        """Verificar restricciones de uso (1 cada 10 días)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT last_diagnosis_date, total_diagnoses 
            FROM user_usage 
            WHERE user_id = ?
        """, (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            # Usuario nuevo - puede usar
            return UsageRestrictionResponse(
                can_use=True,
                total_diagnoses_count=0
            )
        
        last_diagnosis_str, total_count = result
        last_diagnosis = datetime.fromisoformat(last_diagnosis_str)
        now = datetime.now()
        days_since_last = (now - last_diagnosis).days
        
        if days_since_last >= 10:
            # Puede usar
            return UsageRestrictionResponse(
                can_use=True,
                total_diagnoses_count=total_count
            )
        else:
            # No puede usar todavía
            next_available = last_diagnosis + timedelta(days=10)
            return UsageRestrictionResponse(
                can_use=False,
                next_available_date=next_available,
                days_remaining=10 - days_since_last,
                total_diagnoses_count=total_count
            )
    
    def save_diagnosis(self, request: MedicalDiagnosisRequest) -> str:
        """Guardar diagnóstico en la base de datos"""
        diagnosis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Insertar diagnóstico principal
            cursor.execute("""
                INSERT INTO medical_diagnoses (
                    diagnosis_id, user_id, timestamp, age, gender,
                    location_country, location_state, location_city, occupation,
                    primary_diagnosis, diagnosis_category, confidence_percentage,
                    icd10_code, consultation_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                diagnosis_id, request.user_id, timestamp,
                request.patient_demographics.age, request.patient_demographics.gender.value,
                request.patient_demographics.location_country,
                request.patient_demographics.location_state,
                request.patient_demographics.location_city,
                request.patient_demographics.occupation,
                request.diagnosis.primary_diagnosis,
                request.diagnosis.category.value,
                request.diagnosis.confidence_percentage,
                request.diagnosis.icd10_code,
                request.consultation_notes
            ))
            
            # Insertar síntomas
            for symptom in request.symptoms:
                cursor.execute("""
                    INSERT INTO symptoms (
                        diagnosis_id, symptom_name, symptom_category,
                        severity, duration_days, description
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    diagnosis_id, symptom.name, symptom.category.value,
                    symptom.severity.value, symptom.duration_days, symptom.description
                ))
            
            # Insertar diagnósticos diferenciales
            for diff_diagnosis in request.diagnosis.differential_diagnoses:
                cursor.execute("""
                    INSERT INTO differential_diagnoses (diagnosis_id, differential_diagnosis)
                    VALUES (?, ?)
                """, (diagnosis_id, diff_diagnosis))
            
            # Actualizar uso del usuario
            cursor.execute("""
                INSERT OR REPLACE INTO user_usage (
                    user_id, first_diagnosis_date, last_diagnosis_date, total_diagnoses
                ) VALUES (
                    ?,
                    COALESCE((SELECT first_diagnosis_date FROM user_usage WHERE user_id = ?), ?),
                    ?,
                    COALESCE((SELECT total_diagnoses FROM user_usage WHERE user_id = ?), 0) + 1
                )
            """, (request.user_id, request.user_id, timestamp, timestamp, request.user_id))
            
            conn.commit()
            logger.info(f"Diagnóstico guardado: {diagnosis_id} para usuario {request.user_id}")
            return diagnosis_id
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Error guardando diagnóstico: {e}")
            raise HTTPException(status_code=500, detail=f"Error guardando diagnóstico: {str(e)}")
        finally:
            conn.close()
    
    def get_population_statistics(self) -> PopulationStatistics:
        """Generar estadísticas poblacionales completas"""
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Estadísticas básicas
            df_diagnoses = pd.read_sql_query("""
                SELECT * FROM medical_diagnoses 
                ORDER BY timestamp DESC
            """, conn)
            
            df_symptoms = pd.read_sql_query("""
                SELECT s.*, d.gender, d.age, d.timestamp
                FROM symptoms s
                JOIN medical_diagnoses d ON s.diagnosis_id = d.diagnosis_id
            """, conn)
            
            if len(df_diagnoses) == 0:
                return PopulationStatistics(
                    total_diagnoses=0,
                    unique_users=0,
                    gender_distribution={},
                    age_distribution={},
                    symptom_prevalence={},
                    diagnosis_prevalence={},
                    geographic_distribution={},
                    temporal_trends={}
                )
            
            # Distribución por género
            gender_stats = {}
            for gender in df_diagnoses['gender'].unique():
                gender_data = df_diagnoses[df_diagnoses['gender'] == gender]
                gender_stats[gender] = {
                    'count': len(gender_data),
                    'percentage': round((len(gender_data) / len(df_diagnoses)) * 100, 2),
                    'avg_age': round(gender_data['age'].mean(), 1),
                    'most_common_diagnosis': gender_data['primary_diagnosis'].mode().iloc[0] if len(gender_data) > 0 else None
                }
            
            # Distribución por edad
            age_groups = {
                '0-17': len(df_diagnoses[df_diagnoses['age'] < 18]),
                '18-29': len(df_diagnoses[(df_diagnoses['age'] >= 18) & (df_diagnoses['age'] < 30)]),
                '30-49': len(df_diagnoses[(df_diagnoses['age'] >= 30) & (df_diagnoses['age'] < 50)]),
                '50-64': len(df_diagnoses[(df_diagnoses['age'] >= 50) & (df_diagnoses['age'] < 65)]),
                '65+': len(df_diagnoses[df_diagnoses['age'] >= 65])
            }
            
            # Prevalencia de síntomas
            symptom_stats = {}
            symptom_counts = df_symptoms['symptom_name'].value_counts()
            for symptom, count in symptom_counts.head(20).items():
                symptom_data = df_symptoms[df_symptoms['symptom_name'] == symptom]
                symptom_stats[symptom] = {
                    'total_cases': int(count),
                    'prevalence_percentage': round((count / len(df_symptoms)) * 100, 2),
                    'gender_distribution': dict(symptom_data['gender'].value_counts()),
                    'avg_age': round(symptom_data['age'].mean(), 1),
                    'most_common_category': symptom_data['symptom_category'].mode().iloc[0]
                }
            
            # Prevalencia de diagnósticos
            diagnosis_stats = {}
            diagnosis_counts = df_diagnoses['primary_diagnosis'].value_counts()
            for diagnosis, count in diagnosis_counts.head(15).items():
                diagnosis_data = df_diagnoses[df_diagnoses['primary_diagnosis'] == diagnosis]
                diagnosis_stats[diagnosis] = {
                    'total_cases': int(count),
                    'prevalence_percentage': round((count / len(df_diagnoses)) * 100, 2),
                    'gender_distribution': dict(diagnosis_data['gender'].value_counts()),
                    'avg_age': round(diagnosis_data['age'].mean(), 1),
                    'avg_confidence': round(diagnosis_data['confidence_percentage'].mean(), 1),
                    'category': diagnosis_data['diagnosis_category'].iloc[0]
                }
            
            # Distribución geográfica
            geo_distribution = dict(df_diagnoses['location_country'].value_counts())
            
            # Tendencias temporales
            df_diagnoses['date'] = pd.to_datetime(df_diagnoses['timestamp']).dt.date
            daily_counts = df_diagnoses.groupby('date').size()
            temporal_trends = {
                'daily': [
                    {'date': str(date), 'count': int(count)}
                    for date, count in daily_counts.tail(30).items()
                ]
            }
            
            return PopulationStatistics(
                total_diagnoses=len(df_diagnoses),
                unique_users=df_diagnoses['user_id'].nunique(),
                gender_distribution=gender_stats,
                age_distribution=age_groups,
                symptom_prevalence=symptom_stats,
                diagnosis_prevalence=diagnosis_stats,
                geographic_distribution=geo_distribution,
                temporal_trends=temporal_trends
            )
            
        except Exception as e:
            logger.error(f"Error generando estadísticas: {e}")
            raise HTTPException(status_code=500, detail=f"Error generando estadísticas: {str(e)}")
        finally:
            conn.close()

# Instancia global de la base de datos
db = MedicalDatabase()

# ================================
# ENDPOINTS DE LA API
# ================================

@app.get("/health")
async def health_check():
    """Health check del servidor"""
    return {
        "status": "healthy",
        "service": "AltaMedica Medical Analytics",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/usage-restriction/{user_id}", response_model=UsageRestrictionResponse)
async def check_usage_restriction(user_id: str):
    """Verificar si un usuario puede realizar un diagnóstico"""
    try:
        return db.check_usage_restriction(user_id)
    except Exception as e:
        logger.error(f"Error verificando restricción de uso: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/diagnosis/submit")
async def submit_diagnosis(request: MedicalDiagnosisRequest, background_tasks: BackgroundTasks):
    """Enviar un nuevo diagnóstico médico"""
    try:
        # Verificar restricciones de uso
        usage_check = db.check_usage_restriction(request.user_id)
        if not usage_check.can_use:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Límite de uso excedido",
                    "next_available_date": usage_check.next_available_date,
                    "days_remaining": usage_check.days_remaining
                }
            )
        
        # Guardar diagnóstico
        diagnosis_id = db.save_diagnosis(request)
        
        # Tarea en segundo plano para procesamiento adicional
        background_tasks.add_task(process_diagnosis_analytics, diagnosis_id)
        
        return {
            "success": True,
            "diagnosis_id": diagnosis_id,
            "message": "Diagnóstico guardado exitosamente",
            "next_usage_available": datetime.now() + timedelta(days=10)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enviando diagnóstico: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics/population", response_model=PopulationStatistics)
async def get_population_statistics():
    """Obtener estadísticas poblacionales completas"""
    try:
        return db.get_population_statistics()
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics/symptoms")
async def get_symptom_statistics():
    """Estadísticas específicas de síntomas"""
    try:
        conn = sqlite3.connect(db.db_path)
        df = pd.read_sql_query("""
            SELECT 
                s.symptom_category,
                s.symptom_name,
                s.severity,
                COUNT(*) as frequency,
                d.gender,
                AVG(d.age) as avg_age
            FROM symptoms s
            JOIN medical_diagnoses d ON s.diagnosis_id = d.diagnosis_id
            GROUP BY s.symptom_category, s.symptom_name, s.severity, d.gender
            ORDER BY frequency DESC
        """, conn)
        conn.close()
        
        if len(df) == 0:
            return {"message": "No hay datos de síntomas disponibles"}
        
        # Organizar por categoría
        categories = {}
        for category in df['symptom_category'].unique():
            category_data = df[df['symptom_category'] == category]
            categories[category] = {
                'total_cases': int(category_data['frequency'].sum()),
                'unique_symptoms': int(category_data['symptom_name'].nunique()),
                'top_symptoms': category_data.nlargest(5, 'frequency')[['symptom_name', 'frequency']].to_dict('records'),
                'gender_distribution': dict(category_data.groupby('gender')['frequency'].sum()),
                'severity_distribution': dict(category_data.groupby('severity')['frequency'].sum())
            }
        
        return {
            "total_symptom_reports": int(df['frequency'].sum()),
            "categories": categories,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en estadísticas de síntomas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics/demographics")
async def get_demographic_analysis():
    """Análisis demográfico detallado"""
    try:
        conn = sqlite3.connect(db.db_path)
        df = pd.read_sql_query("""
            SELECT 
                age, gender, location_country, location_state,
                primary_diagnosis, diagnosis_category,
                confidence_percentage, timestamp
            FROM medical_diagnoses
            ORDER BY timestamp DESC
        """, conn)
        conn.close()
        
        if len(df) == 0:
            return {"message": "No hay datos demográficos disponibles"}
        
        # Análisis por género y edad
        age_gender_analysis = {}
        for gender in df['gender'].unique():
            gender_data = df[df['gender'] == gender]
            age_gender_analysis[gender] = {
                'total_patients': len(gender_data),
                'age_statistics': {
                    'mean': round(gender_data['age'].mean(), 1),
                    'median': round(gender_data['age'].median(), 1),
                    'std': round(gender_data['age'].std(), 1),
                    'min': int(gender_data['age'].min()),
                    'max': int(gender_data['age'].max())
                },
                'top_diagnoses': dict(gender_data['primary_diagnosis'].value_counts().head(5)),
                'avg_confidence': round(gender_data['confidence_percentage'].mean(), 1)
            }
        
        # Análisis por grupos de edad
        df['age_group'] = pd.cut(df['age'], 
                                bins=[0, 18, 30, 50, 65, 120], 
                                labels=['0-17', '18-29', '30-49', '50-64', '65+'])
        
        age_group_analysis = {}
        for age_group in df['age_group'].cat.categories:
            group_data = df[df['age_group'] == age_group]
            if len(group_data) > 0:
                age_group_analysis[age_group] = {
                    'total_patients': len(group_data),
                    'gender_distribution': dict(group_data['gender'].value_counts()),
                    'top_diagnoses': dict(group_data['primary_diagnosis'].value_counts().head(3)),
                    'diagnosis_categories': dict(group_data['diagnosis_category'].value_counts())
                }
        
        return {
            "total_patients": len(df),
            "gender_age_analysis": age_gender_analysis,
            "age_group_analysis": age_group_analysis,
            "geographic_summary": dict(df['location_country'].value_counts()),
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en análisis demográfico: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_diagnosis_analytics(diagnosis_id: str):
    """Procesar analytics adicionales en segundo plano"""
    try:
        logger.info(f"Procesando analytics para diagnóstico: {diagnosis_id}")
        # Aquí se podrían agregar procesamiento ML, alertas, etc.
        await asyncio.sleep(1)  # Simular procesamiento
        logger.info(f"Analytics procesados para: {diagnosis_id}")
    except Exception as e:
        logger.error(f"Error procesando analytics: {e}")

# ================================
# DATOS DE EJEMPLO Y SEEDING
# ================================

@app.post("/api/admin/seed-demo-data")
async def seed_demo_data():
    """Poblar base de datos con datos de demostración"""
    try:
        # Datos de ejemplo para demostración
        demo_data = [
            {
                "user_id": "demo_user_1",
                "patient_demographics": {
                    "age": 35,
                    "gender": "femenino",
                    "location_country": "Mexico",
                    "location_state": "CDMX",
                    "occupation": "Oficinista"
                },
                "symptoms": [
                    {
                        "name": "Dolor de cabeza",
                        "category": "neurologico",
                        "severity": "moderado",
                        "duration_days": 3
                    },
                    {
                        "name": "Fatiga",
                        "category": "sintomas_generales", 
                        "severity": "leve",
                        "duration_days": 7
                    }
                ],
                "diagnosis": {
                    "primary_diagnosis": "Cefalea tensional",
                    "category": "nervioso",
                    "confidence_percentage": 85.5,
                    "differential_diagnoses": ["Migraña", "Cefalea cervicogénica"]
                }
            },
            {
                "user_id": "demo_user_2", 
                "patient_demographics": {
                    "age": 42,
                    "gender": "masculino",
                    "location_country": "Mexico",
                    "location_state": "Jalisco",
                    "occupation": "Ingeniero"
                },
                "symptoms": [
                    {
                        "name": "Tos seca",
                        "category": "respiratorio",
                        "severity": "moderado",
                        "duration_days": 5
                    },
                    {
                        "name": "Fiebre",
                        "category": "sintomas_generales",
                        "severity": "moderado", 
                        "duration_days": 2
                    }
                ],
                "diagnosis": {
                    "primary_diagnosis": "Infección respiratoria alta",
                    "category": "respiratorio",
                    "confidence_percentage": 92.0,
                    "differential_diagnoses": ["COVID-19", "Bronquitis aguda"]
                }
            }
        ]
        
        saved_diagnoses = []
        for data in demo_data:
            request = MedicalDiagnosisRequest(**data)
            # Temporalmente desactivar restricción para datos demo
            diagnosis_id = db.save_diagnosis(request)
            saved_diagnoses.append(diagnosis_id)
        
        return {
            "success": True,
            "message": f"Se crearon {len(saved_diagnoses)} diagnósticos de demostración",
            "diagnosis_ids": saved_diagnoses
        }
        
    except Exception as e:
        logger.error(f"Error creando datos demo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Iniciando AltaMedica Medical Analytics Server...")
    logger.info("Características disponibles:")
    logger.info("✅ Restricciones de uso (1 cada 10 días)")
    logger.info("✅ Base de datos SQLite con persistencia")
    logger.info("✅ Categorización de síntomas y diagnósticos")
    logger.info("✅ Análisis demográfico completo")
    logger.info("✅ Estadísticas poblacionales en tiempo real")
    logger.info("✅ APIs RESTful para integración")
    
    uvicorn.run(
        "medical_analytics_server:app",
        host="0.0.0.0",
        port=8889,
        reload=True,
        log_level="info"
    )