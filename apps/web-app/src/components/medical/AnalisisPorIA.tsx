import { Brain, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'

export function AnalisisPorIA() {
  const aiInsight = "Basado en tus signos vitales recientes, tu salud cardiovascular muestra una tendencia positiva. Se recomienda mantener la rutina de ejercicio actual."
  
  const recommendation = "Continúa con 30 min de cardio, 3 veces por semana"
  
  return (
    <div className="md:col-span-2 row-span-1 rounded-xl group/bento hover:shadow-xl transition shadow-input p-4 bg-card border-transparent flex flex-col relative overflow-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E0EFFF] via-transparent to-[#00A786]/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center mb-3">
          <div className="relative">
            <Brain className="w-5 h-5 mr-2 text-[#00A786]" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-[#005A9C] animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-[#0A0A0A]">Análisis por IA</h3>
          <div className="ml-auto flex items-center">
            <TrendingUp className="w-4 h-4 text-[#00A786]" />
            <span className="text-xs text-[#00A786] ml-1 font-semibold">Tendencia Positiva</span>
          </div>
        </div>
        
        <div className="flex-grow">
          {/* Efecto de texto generativo simulado */}
          <div className="mb-4">
            <p className="text-sm text-[#0A0A0A] leading-relaxed animate-fade-in">
              {aiInsight}
            </p>
          </div>
          
          <div className="p-3 bg-[#00A786]/10 rounded-lg border-l-4 border-[#00A786]">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 text-[#00A786] mr-2" />
              <span className="text-sm font-semibold text-[#00A786]">Recomendación Personalizada</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {recommendation}
            </p>
            
            {/* Progress bar para objetivo */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#64748B]">Progreso semanal</span>
                <span className="text-xs font-semibold text-[#00A786]">2/3 sesiones</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#00A786] h-2 rounded-full transition-all duration-500" style={{ width: '67%' }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-[#64748B]">
            Generado por ALTAMEDICA AI • Actualizado hace 1 hora
          </p>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#00A786] rounded-full animate-pulse mr-2" />
            <span className="text-xs text-[#00A786] font-semibold">Activo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estilos adicionales para la animación fade-in
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
`
