import { Heart, Activity, Thermometer, Droplets } from 'lucide-react'

export function SignosVitales() {
  const vitals = {
    heartRate: 72,
    temperature: 36.5,
    bloodPressure: "120/80",
    oxygenSat: 98,
    trend: "stable"
  }
  
  return (
    <div className="md:col-span-2 row-span-1 rounded-xl group/bento hover:shadow-xl transition shadow-input p-4 bg-card border-transparent flex flex-col">
      <div className="flex items-center mb-2">
        <Activity className="w-5 h-5 mr-2 text-[#005A9C]" />
        <h3 className="text-lg font-bold text-[#0A0A0A]">Signos Vitales</h3>
        <div className="ml-auto">
          <span className="text-xs bg-[#00A786] text-white px-2 py-1 rounded font-semibold">
            Estable
          </span>
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <Heart className="w-6 h-6 mx-auto mb-1 text-[#00A786]" />
          <div className="text-2xl font-bold text-[#0A0A0A]">{vitals.heartRate}</div>
          <div className="text-xs text-[#64748B]">LPM</div>
          {/* Sparkline SVG */}
          <svg className="w-full h-8 mt-1" viewBox="0 0 100 20">
            <polyline 
              points="0,15 20,12 40,10 60,13 80,8 100,11" 
              fill="none" 
              stroke="#00A786" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        <div className="text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-1 text-[#005A9C]" />
          <div className="text-2xl font-bold text-[#0A0A0A]">{vitals.temperature}°</div>
          <div className="text-xs text-[#64748B]">Temperatura</div>
          <svg className="w-full h-8 mt-1" viewBox="0 0 100 20">
            <polyline 
              points="0,10 20,9 40,11 60,10 80,12 100,10" 
              fill="none" 
              stroke="#005A9C" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        <div className="text-center">
          <Droplets className="w-6 h-6 mx-auto mb-1 text-[#D92D20]" />
          <div className="text-2xl font-bold text-[#0A0A0A]">{vitals.bloodPressure}</div>
          <div className="text-xs text-[#64748B]">Presión</div>
          <svg className="w-full h-8 mt-1" viewBox="0 0 100 20">
            <polyline 
              points="0,12 20,14 40,11 60,13 80,10 100,12" 
              fill="none" 
              stroke="#D92D20" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        <div className="text-center">
          <Activity className="w-6 h-6 mx-auto mb-1 text-[#00A786]" />
          <div className="text-2xl font-bold text-[#0A0A0A]">{vitals.oxygenSat}%</div>
          <div className="text-xs text-[#64748B]">SpO2</div>
          <svg className="w-full h-8 mt-1" viewBox="0 0 100 20">
            <polyline 
              points="0,8 20,7 40,9 60,8 80,7 100,8" 
              fill="none" 
              stroke="#00A786" 
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      
      <p className="text-xs text-[#64748B] mt-2">
        Última actualización: Hace 2 min • Tendencia: {vitals.trend}
      </p>
    </div>
  )
}
