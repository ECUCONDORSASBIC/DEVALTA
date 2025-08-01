'use client'

import { Layout } from './Layout'
import { Section } from './Section'
import { Container } from './Container'

export default function LayoutSystemExample() {
  return (
    <Layout
      headerProps={{
        title: "ALTAMEDICA",
        subtitle: "Portal Médico Inteligente",
        showMenuToggle: true,
        onMenuToggle: () => console.log('Menu toggled')
      }}
      containerSize="xl"
    >
      {/* Hero section with gradient background */}
      <Section background="gradient" padding="xl">
        <Container size="lg" centerContent>
          <h1 className="text-4xl font-bold text-center mb-4">
            Bienvenido a ALTAMEDICA
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-2xl">
            Tu plataforma médica inteligente que conecta pacientes, doctores y clínicas 
            con tecnología de IA avanzada.
          </p>
        </Container>
      </Section>

      {/* Features section */}
      <Section background="white" padding="lg">
        <Container size="xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Consultas Online</h3>
              <p className="text-gray-600">
                Conecta con doctores desde cualquier lugar con nuestro sistema de telemedicina.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">IA Médica</h3>
              <p className="text-gray-600">
                Asistente inteligente que ayuda en el diagnóstico y seguimiento médico.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Gestión Integral</h3>
              <p className="text-gray-600">
                Administra citas, historiales médicos y tratamientos en una sola plataforma.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA section */}
      <Section background="primary" padding="lg">
        <Container size="md" centerContent>
          <h2 className="text-3xl font-bold text-center mb-6 text-primary-900">
            ¿Listo para comenzar?
          </h2>
          <p className="text-center text-primary-700 mb-8 text-lg">
            Únete a miles de profesionales que ya confían en ALTAMEDICA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Comenzar Ahora
            </button>
            <button className="btn-secondary">
              Saber Más
            </button>
          </div>
        </Container>
      </Section>
    </Layout>
  )
}
