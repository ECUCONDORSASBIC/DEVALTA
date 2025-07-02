import { Calendar, Clock, MapPin, User } from 'lucide-react'

export function ProximaCita() {
  const appointment = {
    date: "Mañana",
    time: "10:30 AM",
    doctor: "Dr. García Ruiz",
    specialty: "Cardiología",
    location: "Consultorio 205",
    status: "confirmed"
  }
  
  return (
    <div className="md:col-span-1 row-span-1 rounded-xl group/bento hover:shadow-xl transition shadow-input p-4 bg-card border-transparent flex flex-col">
      <div className="flex items-center mb-2">
        <Calendar className="w-5 h-5 mr-2 text-[#005A9C]" />
        <h3 className="text-lg font-bold text-[#0A0A0A]">Próxima Cita</h3>
      </div>
      
      <div className="flex-grow">
        <div className="text-3xl font-bold text-[#005A9C] mb-1">{appointment.date}</div>
        <div className="flex items-center text-sm text-[#64748B] mb-3">
          <Clock className="w-4 h-4 mr-1" />
          {appointment.time}
        </div>
        
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <User className="w-4 h-4 mr-2 text-[#005A9C]" />
            <div className="font-semibold text-[#0A0A0A]">{appointment.doctor}</div>
          </div>
          <div className="text-sm text-[#64748B] ml-6">{appointment.specialty}</div>
        </div>
        
        <div className="flex items-center text-xs text-[#64748B] mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          {appointment.location}
        </div>
        
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            appointment.status === 'confirmed' ? 'bg-[#00A786]' : 'bg-[#D92D20]'
          }`} />
          <span className="text-xs font-semibold text-[#00A786]">
            Confirmado
          </span>
        </div>
      </div>
      
      <button className="mt-2 bg-[#005A9C] text-white px-3 py-2 rounded text-sm hover:bg-[#004080] transition font-semibold">
        Ver Detalles
      </button>
    </div>
  )
}
