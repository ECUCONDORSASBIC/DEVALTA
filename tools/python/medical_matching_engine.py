"""
🏥 AltaMedica B2B Matching System Architecture
Sistema de matching para empresas médicas (hospitales, clínicas, centros especializados)
"""

from fastapi import FastAPI, WebSocket, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import redis
import json
from datetime import datetime
import asyncio

# =====================================
# MODELOS DE DATOS
# =====================================

class MedicalSpecialty(BaseModel):
    id: str
    name: str
    category: str
    equipment_required: List[str] = []
    certification_level: str

class Company(BaseModel):
    id: str
    name: str
    type: str  # 'hospital', 'clinic', 'research_center', 'pharmacy'
    specialties: List[MedicalSpecialty]
    location: Dict[str, Any]
    capacity: Dict[str, int]
    equipment: List[str]
    rating: float
    certifications: List[str]
    available_hours: Dict[str, Any]

class MatchRequest(BaseModel):
    requesting_company_id: str
    match_type: str  # 'partnership', 'referral', 'equipment', 'emergency'
    specialty_needed: str
    urgency_level: str = 'medium'
    patient_condition: Optional[str] = None
    geographic_radius: int = 50  # km
    budget_range: Optional[Dict[str, float]] = None

class MatchResult(BaseModel):
    match_id: str
    requesting_company: Company
    matched_company: Company
    match_score: float
    match_reasons: List[str]
    estimated_cost: Optional[float] = None
    availability: Dict[str, Any]
    next_steps: List[str]

# =====================================
# MOTOR DE MATCHING
# =====================================

class MedicalMatchingEngine:
    """Motor de matching especializado para instituciones médicas"""
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.companies_cache = {}
        self.specialty_vectors = {}
        
    async def initialize_data(self):
        """Cargar y procesar datos de empresas médicas"""
        # En producción, esto vendría de Firebase/PostgreSQL
        self.companies_data = await self.load_companies_from_db()
        self.build_specialty_vectors()
        
    def build_specialty_vectors(self):
        """Construir vectores TF-IDF para especialidades médicas"""
        specialty_texts = []
        company_ids = []
        
        for company in self.companies_data:
            # Combinar especialidades, equipos y certificaciones
            text = " ".join([
                " ".join([s.name for s in company.specialties]),
                " ".join(company.equipment),
                " ".join(company.certifications),
                company.type
            ])
            specialty_texts.append(text)
            company_ids.append(company.id)
            
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.specialty_matrix = vectorizer.fit_transform(specialty_texts)
        self.company_index = {cid: idx for idx, cid in enumerate(company_ids)}
        
    def calculate_similarity_score(self, company1_id: str, company2_id: str) -> float:
        """Calcular similitud entre dos empresas médicas"""
        idx1 = self.company_index[company1_id]
        idx2 = self.company_index[company2_id]
        
        similarity = cosine_similarity(
            self.specialty_matrix[idx1:idx1+1],
            self.specialty_matrix[idx2:idx2+1]
        )[0][0]
        
        return float(similarity)
    
    def calculate_geographic_score(self, company1: Company, company2: Company) -> float:
        """Calcular score basado en proximidad geográfica"""
        # Simplificado - en producción usar geolocalización real
        lat1, lon1 = company1.location['latitude'], company1.location['longitude']
        lat2, lon2 = company2.location['latitude'], company2.location['longitude']
        
        # Fórmula haversine simplificada
        distance = np.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111  # aprox km
        
        # Score inverso a la distancia (más cerca = mejor score)
        if distance == 0:
            return 1.0
        return max(0, 1 - (distance / 100))  # Normalizar a 100km max
    
    def calculate_capacity_score(self, requesting: Company, candidate: Company, match_type: str) -> float:
        """Evaluar capacidad disponible"""
        if match_type == 'emergency':
            emergency_capacity = candidate.capacity.get('emergency_beds', 0)
            return min(1.0, emergency_capacity / 10)  # Normalizar a 10 camas
            
        elif match_type == 'referral':
            specialist_capacity = candidate.capacity.get('specialist_appointments', 0)
            return min(1.0, specialist_capacity / 50)  # Normalizar a 50 citas
            
        return 0.5  # Score neutro para otros tipos
    
    async def find_matches(self, request: MatchRequest) -> List[MatchResult]:
        """Encontrar matches para una solicitud"""
        requesting_company = next(
            (c for c in self.companies_data if c.id == request.requesting_company_id),
            None
        )
        
        if not requesting_company:
            return []
        
        candidates = []
        
        for candidate in self.companies_data:
            if candidate.id == request.requesting_company_id:
                continue
                
            # Filtrar por tipo de matching
            if not self.is_compatible_match(requesting_company, candidate, request):
                continue
                
            # Calcular scores
            similarity_score = self.calculate_similarity_score(
                requesting_company.id, candidate.id
            )
            
            geographic_score = self.calculate_geographic_score(
                requesting_company, candidate
            )
            
            capacity_score = self.calculate_capacity_score(
                requesting_company, candidate, request.match_type
            )
            
            # Score compuesto con pesos
            final_score = (
                similarity_score * 0.4 +
                geographic_score * 0.3 +
                capacity_score * 0.2 +
                candidate.rating * 0.1
            )
            
            if final_score > 0.3:  # Threshold mínimo
                match_result = MatchResult(
                    match_id=f"match_{requesting_company.id}_{candidate.id}_{int(datetime.now().timestamp())}",
                    requesting_company=requesting_company,
                    matched_company=candidate,
                    match_score=final_score,
                    match_reasons=self.generate_match_reasons(
                        requesting_company, candidate, request
                    ),
                    estimated_cost=self.estimate_cost(request, candidate),
                    availability=self.get_availability(candidate),
                    next_steps=self.generate_next_steps(request.match_type)
                )
                
                candidates.append(match_result)
        
        # Ordenar por score y devolver top matches
        candidates.sort(key=lambda x: x.match_score, reverse=True)
        return candidates[:10]
    
    def is_compatible_match(self, requesting: Company, candidate: Company, request: MatchRequest) -> bool:
        """Verificar compatibilidad básica"""
        # Verificar especialidad requerida
        candidate_specialties = [s.name.lower() for s in candidate.specialties]
        
        if request.specialty_needed.lower() not in candidate_specialties:
            return False
            
        # Verificar tipo de empresa compatible
        if request.match_type == 'referral':
            return candidate.type in ['hospital', 'clinic', 'research_center']
        elif request.match_type == 'emergency':
            return candidate.type == 'hospital'
        elif request.match_type == 'equipment':
            return len(candidate.equipment) > 0
            
        return True
    
    def generate_match_reasons(self, requesting: Company, candidate: Company, request: MatchRequest) -> List[str]:
        """Generar razones del matching"""
        reasons = []
        
        # Especialidades en común
        req_specialties = {s.name for s in requesting.specialties}
        cand_specialties = {s.name for s in candidate.specialties}
        common_specialties = req_specialties.intersection(cand_specialties)
        
        if common_specialties:
            reasons.append(f"Especialidades complementarias: {', '.join(common_specialties)}")
            
        # Rating alto
        if candidate.rating >= 4.5:
            reasons.append(f"Excelente calificación: {candidate.rating}/5.0")
            
        # Proximidad geográfica
        geo_score = self.calculate_geographic_score(requesting, candidate)
        if geo_score > 0.7:
            reasons.append("Ubicación conveniente para pacientes")
            
        # Capacidad disponible
        if candidate.capacity.get('emergency_beds', 0) > 5:
            reasons.append("Buena capacidad de atención")
            
        return reasons
    
    def estimate_cost(self, request: MatchRequest, candidate: Company) -> Optional[float]:
        """Estimar costo del servicio"""
        base_costs = {
            'referral': 150000,  # COP
            'emergency': 500000,
            'equipment': 200000,
            'partnership': 0
        }
        
        base_cost = base_costs.get(request.match_type, 0)
        
        # Ajustar por rating (mayor rating = mayor costo)
        rating_multiplier = 1 + (candidate.rating - 3) * 0.2
        
        return base_cost * rating_multiplier if base_cost > 0 else None
    
    def get_availability(self, company: Company) -> Dict[str, Any]:
        """Obtener disponibilidad actual"""
        return {
            'emergency_beds': company.capacity.get('emergency_beds', 0),
            'next_appointment': '2025-08-05T09:00:00Z',  # Mock data
            'response_time': '15 minutes',
            'working_hours': company.available_hours
        }
    
    def generate_next_steps(self, match_type: str) -> List[str]:
        """Generar próximos pasos"""
        steps = {
            'referral': [
                'Contactar al coordinador médico',
                'Enviar historial clínico del paciente',
                'Agendar cita especializada',
                'Confirmar cobertura de seguro'
            ],
            'emergency': [
                'Llamar directamente al hospital',
                'Preparar traslado del paciente',
                'Enviar información médica urgente',
                'Coordinar ambulancia si es necesario'
            ],
            'equipment': [
                'Solicitar cotización de alquiler',
                'Verificar disponibilidad del equipo',
                'Coordinar instalación y capacitación',
                'Establecer contrato de mantenimiento'
            ],
            'partnership': [
                'Agendar reunión ejecutiva',
                'Preparar propuesta de colaboración',
                'Revisar aspectos legales',
                'Definir términos comerciales'
            ]
        }
        
        return steps.get(match_type, ['Contactar a la institución'])
    
    async def load_companies_from_db(self) -> List[Company]:
        """Cargar empresas desde la base de datos"""
        # Mock data - en producción conectar a Firebase/PostgreSQL
        mock_companies = [
            Company(
                id="hosp_001",
                name="Hospital San Vicente Fundación",
                type="hospital",
                specialties=[
                    MedicalSpecialty(id="card", name="Cardiología", category="Especialidad", certification_level="high"),
                    MedicalSpecialty(id="neur", name="Neurología", category="Especialidad", certification_level="high")
                ],
                location={"latitude": 6.2442, "longitude": -75.5812, "city": "Medellín"},
                capacity={"emergency_beds": 20, "specialist_appointments": 100},
                equipment=["Resonancia Magnética", "Tomógrafo", "Cateterismo"],
                rating=4.8,
                certifications=["JCI", "ICONTEC"],
                available_hours={"monday": "24h", "emergency": True}
            ),
            Company(
                id="clin_002", 
                name="Clínica Cardiovascular Santa María",
                type="clinic",
                specialties=[
                    MedicalSpecialty(id="card", name="Cardiología", category="Especialidad", certification_level="high"),
                    MedicalSpecialty(id="circ", name="Cirugía Cardiovascular", category="Especialidad", certification_level="high")
                ],
                location={"latitude": 6.2518, "longitude": -75.5636, "city": "Medellín"},
                capacity={"specialist_appointments": 80, "surgery_rooms": 5},
                equipment=["Cateterismo", "Ecocardiograma", "Holter"],
                rating=4.9,
                certifications=["ISO 9001", "Habilitación MinSalud"],
                available_hours={"monday_friday": "6:00-20:00"}
            )
        ]
        
        return mock_companies

# =====================================
# API ENDPOINTS
# =====================================

app = FastAPI(title="AltaMedica B2B Matching API", version="1.0.0")
matching_engine = MedicalMatchingEngine()

@app.on_event("startup")
async def startup():
    await matching_engine.initialize_data()

@app.post("/api/matching/find-partners", response_model=List[MatchResult])
async def find_medical_partners(request: MatchRequest):
    """Encontrar socios médicos compatibles"""
    return await matching_engine.find_matches(request)

@app.get("/api/matching/companies/{company_id}/recommendations")
async def get_company_recommendations(company_id: str, limit: int = 5):
    """Obtener recomendaciones proactivas para una empresa"""
    # Implementar lógica de recomendaciones basada en historial
    pass

@app.post("/api/matching/partnership/create")
async def create_partnership(partnership_data: dict):
    """Crear una nueva asociación entre empresas"""
    pass

@app.websocket("/ws/matching/{company_id}")
async def websocket_matching_updates(websocket: WebSocket, company_id: str):
    """WebSocket para actualizaciones de matching en tiempo real"""
    await websocket.accept()
    
    while True:
        # Enviar updates de nuevos matches disponibles
        await websocket.send_json({
            "type": "new_match",
            "timestamp": datetime.now().isoformat(),
            "match_count": 3  # Mock data
        })
        await asyncio.sleep(30)  # Update cada 30 segundos

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8889)
