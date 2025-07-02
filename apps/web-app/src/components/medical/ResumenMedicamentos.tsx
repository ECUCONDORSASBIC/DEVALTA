import { Pill, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export function ResumenMedicamentos() {
  const medications = [
    { 
      name: "Atorvastatina", 
      dose: "20mg", 
      time: "Mañana", 
      status: "taken",
      nextDose: "Mañana 8:00 AM"
    },
    { 
      name: "Metformina", 
      dose: "500mg", 
      time: "Con comida", 
      status: "pending",
      nextDose: "En 2 horas"
    },
    { 
      name: "Lisinopril", 
      dose: "10mg", 
      time: "Noche", 
      status: "taken",
      nextDose: "Hoy 10:00 PM"
    }
  ]
  
  const takenToday = medications.filter(med => med.status === 'taken').length
  const totalMeds = medications.length
  
  return (
    <div className="md:col-span-1 row-span-2 rounded-xl group/bento hover:shadow-xl transition shadow-input p-4 bg-card border-transparent flex flex-col">
      <div className="flex items-center mb-3">
        <Pill className="w-5 h-5 mr-2 text-[#005A9C]" />
        <h3 className="text-lg font-bold text-[#0A0A0A]">Medicamentos</h3>
      </div>
      
      <div className="flex-grow">
        {/* Modelo 3D placeholder - representación visual */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#E0EFFF] to-[#005A9C] rounded-full flex items-center justify-center shadow-lg">
          <Pill className="w-10 h-10 text-white" />
        </div>
        
        {/* Progress indicator */}
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-[#0A0A0A]">{takenToday}/{totalMeds}</div>
          <div className="text-xs text-[#64748B]">Medicamentos tomados hoy</div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2 mt-2">
            <div 
              className="bg-[#00A786] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(takenToday / totalMeds) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {medications.map((med, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#E0EFFF]/30 rounded-lg border border-[#E2E8F0]">
              <div className="flex-1">
                <div className="font-semibold text-sm text-[#0A0A0A]">{med.name}</div>
                <div className="text-xs text-[#64748B]">{med.dose} • {med.time}</div>
                <div className="flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1 text-[#64748B]" />
                  <span className="text-xs text-[#64748B]">{med.nextDose}</span>
                </div>
              </div>
              <div className="ml-2">
                {med.status === 'taken' ? (
                  <CheckCircle className="w-5 h-5 text-[#00A786]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#D92D20] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#D92D20]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-[#00A786]/10 rounded border-l-4 border-[#00A786]">
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-[#00A786] mr-2" />
          <span className="text-xs font-semibold text-[#00A786]">Recordatorio</span>
        </div>
        <p className="text-xs text-[#64748B] mt-1">
          Próxima dosis: Metformina en 2 horas
        </p>
      </div>
    </div>
  )
}
