export interface PreguntaAnamnesis {
  id: string
  pregunta: string
  tipo: 'text' | 'number' | 'select' | 'boolean' | 'textarea'
  categoria: string
  opciones?: string[]
  requerida: boolean
  orden: number
}

export interface SeccionAnamnesis {
  id: string
  titulo: string
  descripcion: string
  orden: number
  preguntas: PreguntaAnamnesis[]
}

export interface AvatarConfig {
  edad: number
  genero: string
  altura: number
  peso: number
  complexion: string
  colorPiel: string
  colorCabello: string
  enfermedades: string[]
  sintomas: string[]
  medicamentos: string[]
}

// Datos de anamnesis basados en Álvarez de Semiología Médica
export const SECCIONES_ANAMNESIS: SeccionAnamnesis[] = [
  {
    id: 'datos-personales',
    titulo: 'Datos Personales',
    descripcion: 'Información básica del paciente',
    orden: 1,
    preguntas: [
      {
        id: 'nombre',
        pregunta: '¿Cuál es su nombre completo?',
        tipo: 'text',
        categoria: 'identificacion',
        requerida: true,
        orden: 1
      },
      {
        id: 'edad',
        pregunta: '¿Cuál es su edad?',
        tipo: 'number',
        categoria: 'identificacion',
        requerida: true,
        orden: 2
      },
      {
        id: 'genero',
        pregunta: '¿Cuál es su género?',
        tipo: 'select',
        categoria: 'identificacion',
        opciones: ['Masculino', 'Femenino', 'No binario', 'Prefiero no decir'],
        requerida: true,
        orden: 3
      },
      {
        id: 'estado-civil',
        pregunta: '¿Cuál es su estado civil?',
        tipo: 'select',
        categoria: 'identificacion',
        opciones: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre'],
        requerida: false,
        orden: 4
      },
      {
        id: 'ocupacion',
        pregunta: '¿Cuál es su ocupación?',
        tipo: 'text',
        categoria: 'identificacion',
        requerida: false,
        orden: 5
      }
    ]
  },
  {
    id: 'antecedentes-familiares',
    titulo: 'Antecedentes Familiares',
    descripcion: 'Historia médica de la familia',
    orden: 2,
    preguntas: [
      {
        id: 'diabetes-familiar',
        pregunta: '¿Hay antecedentes de diabetes en su familia?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 1
      },
      {
        id: 'hipertension-familiar',
        pregunta: '¿Hay antecedentes de hipertensión arterial en su familia?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 2
      },
      {
        id: 'cancer-familiar',
        pregunta: '¿Hay antecedentes de cáncer en su familia?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 3
      },
      {
        id: 'enfermedades-cardiovasculares',
        pregunta: '¿Hay antecedentes de enfermedades cardiovasculares?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 4
      },
      {
        id: 'otras-enfermedades-familiares',
        pregunta: '¿Hay otras enfermedades importantes en su familia?',
        tipo: 'textarea',
        categoria: 'antecedentes',
        requerida: false,
        orden: 5
      }
    ]
  },
  {
    id: 'antecedentes-personales',
    titulo: 'Antecedentes Personales',
    descripcion: 'Historia médica personal',
    orden: 3,
    preguntas: [
      {
        id: 'alergias',
        pregunta: '¿Tiene alguna alergia conocida?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 1
      },
      {
        id: 'alergias-descripcion',
        pregunta: 'Si tiene alergias, ¿cuáles son?',
        tipo: 'textarea',
        categoria: 'antecedentes',
        requerida: false,
        orden: 2
      },
      {
        id: 'cirugias-previas',
        pregunta: '¿Ha tenido alguna cirugía previa?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 3
      },
      {
        id: 'cirugias-descripcion',
        pregunta: 'Si ha tenido cirugías, ¿cuáles fueron?',
        tipo: 'textarea',
        categoria: 'antecedentes',
        requerida: false,
        orden: 4
      },
      {
        id: 'medicamentos-actuales',
        pregunta: '¿Toma algún medicamento actualmente?',
        tipo: 'boolean',
        categoria: 'antecedentes',
        requerida: false,
        orden: 5
      },
      {
        id: 'medicamentos-lista',
        pregunta: 'Si toma medicamentos, ¿cuáles son?',
        tipo: 'textarea',
        categoria: 'antecedentes',
        requerida: false,
        orden: 6
      }
    ]
  },
  {
    id: 'habitos',
    titulo: 'Hábitos',
    descripcion: 'Hábitos de vida del paciente',
    orden: 4,
    preguntas: [
      {
        id: 'fuma',
        pregunta: '¿Fuma?',
        tipo: 'boolean',
        categoria: 'habitos',
        requerida: false,
        orden: 1
      },
      {
        id: 'alcohol',
        pregunta: '¿Consume alcohol?',
        tipo: 'boolean',
        categoria: 'habitos',
        requerida: false,
        orden: 2
      },
      {
        id: 'ejercicio',
        pregunta: '¿Realiza ejercicio regularmente?',
        tipo: 'boolean',
        categoria: 'habitos',
        requerida: false,
        orden: 3
      },
      {
        id: 'dieta',
        pregunta: '¿Cómo describiría su dieta?',
        tipo: 'select',
        categoria: 'habitos',
        opciones: ['Muy saludable', 'Saludable', 'Regular', 'Poco saludable', 'Muy poco saludable'],
        requerida: false,
        orden: 4
      },
      {
        id: 'sueno',
        pregunta: '¿Cuántas horas duerme en promedio?',
        tipo: 'number',
        categoria: 'habitos',
        requerida: false,
        orden: 5
      }
    ]
  },
  {
    id: 'enfermedad-actual',
    titulo: 'Enfermedad Actual',
    descripcion: 'Motivo de consulta y síntomas actuales',
    orden: 5,
    preguntas: [
      {
        id: 'motivo-consulta',
        pregunta: '¿Cuál es el motivo principal de su consulta?',
        tipo: 'textarea',
        categoria: 'sintomas',
        requerida: true,
        orden: 1
      },
      {
        id: 'inicio-sintomas',
        pregunta: '¿Cuándo comenzaron los síntomas?',
        tipo: 'text',
        categoria: 'sintomas',
        requerida: false,
        orden: 2
      },
      {
        id: 'intensidad',
        pregunta: '¿Cómo calificaría la intensidad de sus síntomas?',
        tipo: 'select',
        categoria: 'sintomas',
        opciones: ['Leve', 'Moderada', 'Intensa', 'Muy intensa'],
        requerida: false,
        orden: 3
      },
      {
        id: 'factores-agravantes',
        pregunta: '¿Hay algo que empeore sus síntomas?',
        tipo: 'textarea',
        categoria: 'sintomas',
        requerida: false,
        orden: 4
      },
      {
        id: 'factores-mejorantes',
        pregunta: '¿Hay algo que mejore sus síntomas?',
        tipo: 'textarea',
        categoria: 'sintomas',
        requerida: false,
        orden: 5
      }
    ]
  }
]

// Función para generar configuración de avatar basada en respuestas
export function generarAvatarConfig(respuestas: Record<string, any>): AvatarConfig {
  const edad = respuestas.edad || 30
  const genero = respuestas.genero || 'Masculino'
  
  // Determinar complexión basada en hábitos
  let complexion = 'Normal'
  if (respuestas.ejercicio === false && respuestas.dieta === 'Poco saludable') {
    complexion = 'Sobrepeso'
  } else if (respuestas.ejercicio === true && respuestas.dieta === 'Saludable') {
    complexion = 'Atlética'
  }
  
  // Determinar enfermedades basadas en antecedentes
  const enfermedades: string[] = []
  if (respuestas.diabetes_familiar === true) enfermedades.push('Riesgo de diabetes')
  if (respuestas.hipertension_familiar === true) enfermedades.push('Riesgo de hipertensión')
  if (respuestas.cancer_familiar === true) enfermedades.push('Riesgo de cáncer')
  
  // Determinar síntomas basados en enfermedad actual
  const sintomas: string[] = []
  if (respuestas.motivo_consulta) {
    sintomas.push(respuestas.motivo_consulta)
  }
  
  // Determinar medicamentos
  const medicamentos: string[] = []
  if (respuestas.medicamentos_lista) {
    medicamentos.push(respuestas.medicamentos_lista)
  }
  
  return {
    edad,
    genero,
    altura: 170, // Valor por defecto
    peso: 70, // Valor por defecto
    complexion,
    colorPiel: 'Caucásico', // Valor por defecto
    colorCabello: 'Castaño', // Valor por defecto
    enfermedades,
    sintomas,
    medicamentos
  }
} 