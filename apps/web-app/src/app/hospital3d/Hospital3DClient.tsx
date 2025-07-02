'use client'
import dynamic from 'next/dynamic'

const HospitalScene = dynamic(() => import('@/components/scene/HospitalScene'), {
  ssr: false,
  loading: () => <p className="text-white">Cargando Escenario 3D...</p>
})

export default function Hospital3DClient() {
  return <HospitalScene />
} 