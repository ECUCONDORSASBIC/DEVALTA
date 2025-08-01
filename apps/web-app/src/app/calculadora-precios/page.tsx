'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Users, 
  Video, 
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/navigation/Footer';

interface CalculatorInputs {
  consultasPresenciales: number;
  costoConsultaPresencial: number;
  tiempoEsperaPromedio: number;
  pacientesNoShow: number;
  gastosOperativos: number;
}

const PricingCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    consultasPresenciales: 100,
    costoConsultaPresencial: 50,
    tiempoEsperaPromedio: 30,
    pacientesNoShow: 15,
    gastosOperativos: 2000,
  });

  const calculations = useMemo(() => {
    const { 
      consultasPresenciales, 
      costoConsultaPresencial, 
      tiempoEsperaPromedio,
      pacientesNoShow,
      gastosOperativos 
    } = inputs;

    // Cálculos actuales
    const ingresosActuales = consultasPresenciales * costoConsultaPresencial;
    const perdidaNoShow = (pacientesNoShow / 100) * ingresosActuales;
    const ingresoNetoActual = ingresosActuales - perdidaNoShow - gastosOperativos;

    // Proyecciones con AltaMedica
    const consultasVirtuales = Math.floor(consultasPresenciales * 0.4); // 40% adicionales
    const consultasTotales = consultasPresenciales + consultasVirtuales;
    const reduccionNoShow = pacientesNoShow * 0.7; // 70% reducción
    const ahorroCostos = gastosOperativos * 0.3; // 30% ahorro operativo
    
    const ingresosConAltamedica = consultasTotales * costoConsultaPresencial;
    const perdidaNoShowReducida = (reduccionNoShow / 100) * consultasPresenciales * costoConsultaPresencial;
    const gastosReducidos = gastosOperativos - ahorroCostos;
    const ingresoNetoConAltamedica = ingresosConAltamedica - perdidaNoShowReducida - gastosReducidos;

    // ROI y métricas
    const incrementoIngresos = ingresoNetoConAltamedica - ingresoNetoActual;
    const porcentajeIncremento = (incrementoIngresos / ingresoNetoActual) * 100;
    const tiempoAhorrado = tiempoEsperaPromedio * 0.8; // 80% reducción tiempo espera
    const roi = (incrementoIngresos / (19.99 * 12)) * 100; // ROI basado en costo anual

    return {
      actual: {
        ingresos: ingresosActuales,
        perdidaNoShow,
        gastos: gastosOperativos,
        neto: ingresoNetoActual,
      },
      conAltamedica: {
        ingresos: ingresosConAltamedica,
        consultasVirtuales,
        perdidaNoShow: perdidaNoShowReducida,
        gastos: gastosReducidos,
        neto: ingresoNetoConAltamedica,
        ahorroCostos,
      },
      mejoras: {
        incrementoIngresos,
        porcentajeIncremento,
        tiempoAhorrado,
        roi,
        consultasAdicionales: consultasVirtuales,
      }
    };
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-semibold">Calculadora de ROI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Descubre cuánto puedes ahorrar
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calcula el retorno de inversión y el impacto en tu práctica médica al implementar AltaMedica
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Datos de tu práctica actual
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultas presenciales mensuales
                  </label>
                  <input
                    type="number"
                    value={inputs.consultasPresenciales}
                    onChange={(e) => handleInputChange('consultasPresenciales', Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio promedio por consulta ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.costoConsultaPresencial}
                    onChange={(e) => handleInputChange('costoConsultaPresencial', Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de espera promedio (minutos)
                  </label>
                  <input
                    type="number"
                    value={inputs.tiempoEsperaPromedio}
                    onChange={(e) => handleInputChange('tiempoEsperaPromedio', Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de pacientes que no asisten (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.pacientesNoShow}
                    onChange={(e) => handleInputChange('pacientesNoShow', Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gastos operativos mensuales ($)
                  </label>
                  <input
                    type="number"
                    value={inputs.gastosOperativos}
                    onChange={(e) => handleInputChange('gastosOperativos', Number(e.target.value))}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Estos cálculos son estimaciones basadas en datos de más de 2,000 clínicas
                    que usan AltaMedica.
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Current vs Future */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Comparación de resultados
                </h3>

                <div className="space-y-4">
                  {/* Sin AltaMedica */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Sin AltaMedica</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos mensuales:</span>
                        <span className="font-semibold">${calculations.actual.ingresos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pérdidas por no-show:</span>
                        <span className="font-semibold text-red-600">-${calculations.actual.perdidaNoShow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gastos operativos:</span>
                        <span className="font-semibold">-${calculations.actual.gastos.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between">
                        <span className="font-semibold">Ingreso neto:</span>
                        <span className="font-bold text-lg">${calculations.actual.neto.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Con AltaMedica */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Con AltaMedica</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos totales:</span>
                        <span className="font-semibold text-green-600">${calculations.conAltamedica.ingresos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultas virtuales adicionales:</span>
                        <span className="font-semibold text-blue-600">+{calculations.conAltamedica.consultasVirtuales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pérdidas por no-show:</span>
                        <span className="font-semibold text-orange-600">-${calculations.conAltamedica.perdidaNoShow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gastos operativos:</span>
                        <span className="font-semibold">-${calculations.conAltamedica.gastos.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between">
                        <span className="font-semibold">Ingreso neto:</span>
                        <span className="font-bold text-lg text-green-600">${calculations.conAltamedica.neto.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Summary */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Tu retorno de inversión</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-3xl font-bold">
                      +${calculations.mejoras.incrementoIngresos.toLocaleString()}
                    </div>
                    <div className="text-green-100">Incremento mensual</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {calculations.mejoras.porcentajeIncremento.toFixed(1)}%
                    </div>
                    <div className="text-green-100">Aumento en ingresos</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{calculations.mejoras.consultasAdicionales} consultas virtuales adicionales/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{calculations.mejoras.tiempoAhorrado} minutos ahorrados por paciente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>${calculations.conAltamedica.ahorroCostos.toLocaleString()} en costos operativos</span>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {calculations.mejoras.roi.toFixed(0)}% ROI
                    </div>
                    <div className="text-green-100">
                      en el primer año
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comienza a ahorrar hoy
                </h3>
                <p className="text-gray-600 mb-6">
                  Únete a más de 2,000 clínicas que ya optimizaron sus operaciones con AltaMedica
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = '/register'}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    Comenzar prueba gratuita
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  
                  <button
                    onClick={() => window.location.href = '/demo'}
                    className="w-full border border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Ver demo interactiva
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Sin tarjeta de crédito • Cancela cuando quieras
                </p>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mayor alcance</h4>
              <p className="text-gray-600 text-sm">
                Atiende pacientes de cualquier ubicación sin límites geográficos
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Crecimiento sostenible</h4>
              <p className="text-gray-600 text-sm">
                Escala tu práctica sin aumentar proporcionalmente los costos
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mejor gestión del tiempo</h4>
              <p className="text-gray-600 text-sm">
                Optimiza tu agenda y reduce tiempos muertos entre consultas
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PricingCalculator;