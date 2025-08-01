// data/anamnesis-data.ts
import { 
  SeccionAnamnesis, 
  HistoriaMedica, 
  PreguntaAnamnesis, 
  Logro,
  CategoriaAnamnesis,
  EscenaAnamnesis
} from '../types/anamnesis.types'

// Historias médicas fascinantes
const HISTORIAS_MEDICAS: Record<string, HistoriaMedica> = {
  // Datos Personales
  'datos-personales': {
    id: 'datos-personales',
    titulo: 'El Primer Paso en la Historia de la Medicina',
    contenido: `En la antigua Grecia, Hipócrates, considerado el padre de la medicina, estableció que "el médico debe conocer al paciente como persona, no solo como un conjunto de síntomas". Esta filosofía revolucionaria transformó la medicina de un arte mágico a una ciencia basada en la observación y el conocimiento profundo del individuo.

Los datos personales no son solo información básica; son la base sobre la cual construimos una relación médico-paciente sólida y efectiva. Cada detalle cuenta en el rompecabezas de tu salud.`
  },

  'nombre': {
    id: 'nombre',
    titulo: 'El Poder del Nombre en la Medicina',
    contenido: `En la medicina tradicional china, el nombre de una persona se considera una parte fundamental de su identidad energética. Los antiguos médicos creían que pronunciar el nombre del paciente con respeto y atención era el primer paso para establecer una conexión curativa.

Hoy sabemos que llamar a alguien por su nombre no solo es cortesía, sino que activa áreas del cerebro relacionadas con la confianza y la empatía, fundamentales para una relación médico-paciente efectiva.`
  },

  'edad': {
    id: 'edad',
    titulo: 'La Edad: El Cronómetro de la Vida',
    contenido: `En el siglo XIX, el médico francés Claude Bernard descubrió que cada edad tiene sus propios patrones fisiológicos. Observó que los niños no son "adultos pequeños" y los ancianos no son "adultos viejos", sino que cada etapa de la vida tiene características únicas que requieren atención médica específica.

Tu edad es como una brújula que nos guía hacia los exámenes preventivos apropiados, los factores de riesgo específicos y las expectativas normales para tu etapa de vida.`
  },

  'sexo': {
    id: 'sexo',
    titulo: 'Diferencias Biológicas: Más que Anatomía',
    contenido: `En 1990, el Dr. Marianne Legato fundó el primer instituto dedicado al estudio de las diferencias de género en medicina. Sus investigaciones revelaron que hombres y mujeres experimentan enfermedades de manera diferente, desde los síntomas hasta la respuesta a los tratamientos.

Por ejemplo, las mujeres tienen síntomas de infarto diferentes a los hombres, y los medicamentos pueden metabolizarse de forma distinta según el sexo biológico. Esta información es crucial para un diagnóstico preciso.`
  },

  'ocupacion': {
    id: 'ocupacion',
    titulo: 'El Trabajo: Tu Segundo Hogar Médico',
    contenido: `En 1700, el médico italiano Bernardino Ramazzini publicó "De Morbis Artificum Diatriba", el primer tratado sobre enfermedades ocupacionales. Observó que los mineros, panaderos y otros trabajadores desarrollaban problemas de salud específicos de sus oficios.

Hoy sabemos que tu ocupación puede exponerte a riesgos específicos: desde el síndrome del túnel carpiano en oficinistas hasta problemas respiratorios en trabajadores de la construcción. Esta información nos ayuda a prevenir y detectar problemas tempranamente.`
  },

  // Motivo de Consulta
  'motivo-consulta': {
    id: 'motivo-consulta',
    titulo: 'El Arte de Escuchar el Motivo',
    contenido: `En 1895, Sigmund Freud revolucionó la medicina al demostrar que escuchar atentamente el motivo de consulta del paciente era fundamental para el diagnóstico. Descubrió que a menudo, el problema real está "entre líneas" de lo que el paciente dice explícitamente.

El motivo de consulta es como el título de un libro: nos da la primera pista sobre qué historia vamos a descubrir juntos. Es el hilo conductor que nos llevará a través del laberinto de síntomas hacia el diagnóstico correcto.`
  },

  'motivo-principal': {
    id: 'motivo-principal',
    titulo: 'El Síntoma Principal: La Estrella de la Historia',
    contenido: `En la medicina medieval, los médicos árabes desarrollaron el concepto de "síntoma guía", el problema más importante que trae el paciente. Ibn Sina (Avicena) escribió que "el síntoma principal es como la estrella polar que guía al navegante en la noche".

Identificar el motivo principal nos ayuda a priorizar qué investigar primero y qué puede esperar. Es la diferencia entre tratar un resfriado común y detectar una neumonía temprana.`
  },

  // Enfermedad Actual
  'enfermedad-actual': {
    id: 'enfermedad-actual',
    titulo: 'La Historia del Presente: Un Relato en Tiempo Real',
    contenido: `En 1900, el Dr. William Osler, fundador de la medicina moderna, estableció que "escuchar la historia del paciente es el 80% del diagnóstico". Desarrolló un método sistemático para recopilar la información de la enfermedad actual que aún usamos hoy.

La enfermedad actual es como una película que se está rodando: necesitamos saber cuándo empezó, cómo evolucionó, qué la mejora o empeora, y qué otros síntomas la acompañan. Cada detalle puede ser la clave del diagnóstico.`
  },

  'inicio-sintomas': {
    id: 'inicio-sintomas',
    titulo: 'El Momento Cero: Cuándo Todo Cambió',
    contenido: `En 1950, el Dr. John Snow investigó el brote de cólera en Londres. Descubrió que el momento exacto del inicio de los síntomas era crucial para identificar la fuente de la infección. Esta observación fundó la epidemiología moderna.

El momento del inicio de los síntomas nos dice mucho: si fue súbito o gradual, si hubo algún evento desencadenante, y nos ayuda a calcular la evolución natural de la enfermedad. Es como encontrar el punto de partida en un mapa.`
  },

  'dolor-caracteristicas': {
    id: 'dolor-caracteristicas',
    titulo: 'El Lenguaje del Dolor: Un Código por Descifrar',
    contenido: `En 1970, la Dra. Margo McCaffery definió el dolor como "lo que el paciente dice que es". Esta definición revolucionaria reconoció que el dolor es subjetivo y personal, y que cada persona lo experimenta de manera única.

El dolor tiene su propio vocabulario: puede ser punzante, opresivo, quemante, sordo. Cada tipo de dolor nos habla de diferentes mecanismos y posibles causas. Es como un idioma que debemos aprender a interpretar.`
  },

  // Antecedentes Personales
  'antecedentes-personales': {
    id: 'antecedentes-personales',
    titulo: 'Tu Historia Médica: El Libro de Tu Vida',
    contenido: `En 1800, el Dr. René Laennec inventó el estetoscopio, pero también estableció la importancia de registrar la historia médica completa del paciente. Creó el primer sistema de historias clínicas que incluía antecedentes personales.

Tus antecedentes personales son como los capítulos anteriores de un libro: nos cuentan qué enfermedades has tenido, qué cirugías te han hecho, qué medicamentos tomas. Esta información es crucial para evitar interacciones medicamentosas y entender tu riesgo actual.`
  },

  'enfermedades-previas': {
    id: 'enfermedades-previas',
    titulo: 'Las Batallas Pasadas: Tu Experiencia con la Enfermedad',
    contenido: `En 1850, el Dr. Ignaz Semmelweis descubrió que las mujeres que habían tenido fiebre puerperal tenían mayor riesgo de complicaciones en embarazos futuros. Esta observación estableció la importancia de los antecedentes patológicos.

Las enfermedades previas nos enseñan sobre tu sistema inmune, tu capacidad de recuperación, y pueden predisponerte a ciertos problemas. Es como revisar el historial de un equipo deportivo para predecir su rendimiento futuro.`
  },

  'alergias': {
    id: 'alergias',
    titulo: 'Las Alergias: El Sistema de Alarma de Tu Cuerpo',
    contenido: `En 1906, el Dr. Clemens von Pirquet acuñó el término "alergia" para describir las reacciones exageradas del sistema inmune. Descubrió que el cuerpo puede "recordar" sustancias inofensivas como amenazas peligrosas.

Las alergias son como un sistema de alarma hiperactivo: tu cuerpo reacciona a sustancias que para otros son inofensivas. Conocer tus alergias es crucial para evitar reacciones que pueden ser desde molestas hasta mortales.`
  },

  'habitos': {
    id: 'habitos',
    titulo: 'Los Hábitos: Los Arquitectos de Tu Salud',
    contenido: `En 1960, el Dr. Ancel Keys publicó el "Estudio de los Siete Países", que demostró la relación entre hábitos de vida y enfermedades cardiovasculares. Sus investigaciones establecieron que los hábitos son más importantes que la genética en muchos casos.

Los hábitos son como los cimientos de un edificio: determinan la fortaleza de tu salud a largo plazo. El tabaco, el alcohol, la dieta, el ejercicio y el sueño son los pilares sobre los que construyes tu bienestar futuro.`
  },

  // Antecedentes Familiares
  'antecedentes-familiares': {
    id: 'antecedentes-familiares',
    titulo: 'El Árbol Genealógico de la Salud',
    contenido: `En 1865, Gregor Mendel estableció las leyes de la herencia estudiando guisantes. Sus descubrimientos sentaron las bases para entender cómo las enfermedades pueden pasar de generación en generación.

Los antecedentes familiares son como un mapa genético: nos muestran qué enfermedades son más comunes en tu familia y, por tanto, a qué debes estar más atento. Es información preventiva valiosa que puede salvar vidas.`
  }
}

// Logros gamificados
const LOGROS: Record<string, Logro> = {
  'primer-paso': {
    id: 'primer-paso',
    nombre: 'Primer Paso',
    descripcion: 'Completaste tu primera pregunta',
    icono: '👣',
    puntos: 10,
    rareza: 'comun'
  },
  'explorador': {
    id: 'explorador',
    nombre: 'Explorador de la Salud',
    descripcion: 'Completaste una sección completa',
    icono: '🗺️',
    puntos: 50,
    rareza: 'raro'
  },
  'detective': {
    id: 'detective',
    nombre: 'Detective Médico',
    descripcion: 'Identificaste síntomas importantes',
    icono: '🔍',
    puntos: 100,
    rareza: 'epico'
  },
  'guardian': {
    id: 'guardian',
    nombre: 'Guardián de la Salud',
    descripcion: 'Completaste toda la anamnesis',
    icono: '🛡️',
    puntos: 500,
    rareza: 'legendario'
  },
  'velocista': {
    id: 'velocista',
    nombre: 'Velocista Responsable',
    descripcion: 'Completaste preguntas rápidamente pero con cuidado',
    icono: '⚡',
    puntos: 75,
    rareza: 'raro'
  },
  'preciso': {
    id: 'preciso',
    nombre: 'Precisión Absoluta',
    descripcion: 'Todas tus respuestas fueron detalladas',
    icono: '🎯',
    puntos: 150,
    rareza: 'epico'
  }
}

// Preguntas de anamnesis
const PREGUNTAS: PreguntaAnamnesis[] = [
  {
    id: 'nombre',
    texto: '¿Cuál es tu nombre completo?',
    tipo: 'text',
    historiaPreliminar: HISTORIAS_MEDICAS['nombre'],
    explicacionMedica: 'El nombre es fundamental para establecer una relación médico-paciente personalizada y para la documentación médica legal.',
    puntosGamificacion: 5,
    categoria: CategoriaAnamnesis.DATOS_PERSONALES,
    requerida: true,
    orden: 1
  },
  {
    id: 'edad',
    texto: '¿Cuál es tu edad?',
    tipo: 'number',
    historiaPreliminar: HISTORIAS_MEDICAS['edad'],
    explicacionMedica: 'La edad determina los factores de riesgo, exámenes preventivos apropiados y expectativas normales de salud para tu etapa de vida.',
    puntosGamificacion: 5,
    categoria: CategoriaAnamnesis.DATOS_PERSONALES,
    requerida: true,
    orden: 2,
    validacion: (valor) => {
      const edad = parseInt(valor)
      if (isNaN(edad) || edad < 0 || edad > 150) {
        return 'Por favor ingresa una edad válida entre 0 y 150 años'
      }
      return true
    }
  },
  {
    id: 'sexo',
    texto: '¿Cuál es tu sexo biológico?',
    tipo: 'select',
    opciones: ['Masculino', 'Femenino', 'Intersexual'],
    historiaPreliminar: HISTORIAS_MEDICAS['sexo'],
    explicacionMedica: 'El sexo biológico influye en la presentación de enfermedades, metabolismo de medicamentos y factores de riesgo específicos.',
    puntosGamificacion: 5,
    categoria: CategoriaAnamnesis.DATOS_PERSONALES,
    requerida: true,
    orden: 3
  },
  {
    id: 'ocupacion',
    texto: '¿Cuál es tu ocupación actual?',
    tipo: 'text',
    historiaPreliminar: HISTORIAS_MEDICAS['ocupacion'],
    explicacionMedica: 'La ocupación puede exponerte a riesgos específicos y afectar tu salud física y mental de manera significativa.',
    puntosGamificacion: 10,
    categoria: CategoriaAnamnesis.DATOS_PERSONALES,
    orden: 4
  },
  {
    id: 'motivo-principal',
    texto: '¿Cuál es el motivo principal de tu consulta hoy?',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['motivo-principal'],
    explicacionMedica: 'El motivo de consulta es la base del diagnóstico. Nos ayuda a priorizar qué investigar y qué puede esperar.',
    puntosGamificacion: 15,
    categoria: CategoriaAnamnesis.MOTIVO_CONSULTA,
    requerida: true,
    orden: 5
  },
  {
    id: 'inicio-sintomas',
    texto: '¿Cuándo comenzaron estos síntomas?',
    tipo: 'date',
    historiaPreliminar: HISTORIAS_MEDICAS['inicio-sintomas'],
    explicacionMedica: 'El momento del inicio nos ayuda a calcular la evolución de la enfermedad y determinar si es aguda o crónica.',
    puntosGamificacion: 10,
    categoria: CategoriaAnamnesis.ENFERMEDAD_ACTUAL,
    orden: 6
  },
  {
    id: 'dolor-caracteristicas',
    texto: 'Si tienes dolor, ¿cómo lo describirías?',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['dolor-caracteristicas'],
    explicacionMedica: 'Las características del dolor (tipo, intensidad, localización) son cruciales para identificar su causa y determinar el tratamiento apropiado.',
    puntosGamificacion: 15,
    categoria: CategoriaAnamnesis.ENFERMEDAD_ACTUAL,
    orden: 7
  },
  {
    id: 'enfermedades-previas',
    texto: '¿Has tenido alguna enfermedad importante en el pasado?',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['enfermedades-previas'],
    explicacionMedica: 'Las enfermedades previas pueden predisponerte a ciertos problemas y son cruciales para evitar interacciones medicamentosas.',
    puntosGamificacion: 20,
    categoria: CategoriaAnamnesis.ANTECEDENTES_PERSONALES,
    orden: 8
  },
  {
    id: 'alergias',
    texto: '¿Tienes alguna alergia conocida?',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['alergias'],
    explicacionMedica: 'Las alergias pueden causar reacciones graves. Es fundamental conocerlas para evitar medicamentos o sustancias que puedan causar problemas.',
    puntosGamificacion: 15,
    categoria: CategoriaAnamnesis.ANTECEDENTES_PERSONALES,
    orden: 9
  },
  {
    id: 'habitos',
    texto: '¿Cuáles son tus hábitos de vida? (tabaco, alcohol, ejercicio, dieta)',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['habitos'],
    explicacionMedica: 'Los hábitos de vida son los principales determinantes de tu salud a largo plazo y pueden influir en el desarrollo de muchas enfermedades.',
    puntosGamificacion: 25,
    categoria: CategoriaAnamnesis.HABITOS,
    orden: 10
  },
  {
    id: 'familiares',
    texto: '¿Hay alguna enfermedad que sea común en tu familia?',
    tipo: 'textarea',
    historiaPreliminar: HISTORIAS_MEDICAS['antecedentes-familiares'],
    explicacionMedica: 'Los antecedentes familiares nos ayudan a identificar factores de riesgo genéticos y a planificar exámenes preventivos apropiados.',
    puntosGamificacion: 20,
    categoria: CategoriaAnamnesis.ANTECEDENTES_FAMILIARES,
    orden: 11
  }
]

// Secciones de anamnesis
export const SECCIONES_ANAMNESIS: SeccionAnamnesis[] = [
  {
    id: 'datos-personales',
    titulo: 'Datos Personales',
    descripcion: 'Información básica para establecer la relación médico-paciente',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.DATOS_PERSONALES),
    historia: HISTORIAS_MEDICAS['datos-personales'],
    logrosDesbloqueables: [LOGROS['primer-paso']],
    orden: 1,
    puntosSeccion: 25
  },
  {
    id: 'motivo-consulta',
    titulo: 'Motivo de Consulta',
    descripcion: '¿Por qué buscas atención médica hoy?',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.MOTIVO_CONSULTA),
    historia: HISTORIAS_MEDICAS['motivo-consulta'],
    logrosDesbloqueables: [LOGROS['detective']],
    orden: 2,
    puntosSeccion: 15
  },
  {
    id: 'enfermedad-actual',
    titulo: 'Enfermedad Actual',
    descripcion: 'Detalles sobre tu problema de salud actual',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.ENFERMEDAD_ACTUAL),
    historia: HISTORIAS_MEDICAS['enfermedad-actual'],
    logrosDesbloqueables: [LOGROS['velocista']],
    orden: 3,
    puntosSeccion: 25
  },
  {
    id: 'antecedentes-personales',
    titulo: 'Antecedentes Personales',
    descripcion: 'Tu historia médica personal',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.ANTECEDENTES_PERSONALES),
    historia: HISTORIAS_MEDICAS['antecedentes-personales'],
    logrosDesbloqueables: [LOGROS['preciso']],
    orden: 4,
    puntosSeccion: 35
  },
  {
    id: 'habitos',
    titulo: 'Hábitos de Vida',
    descripcion: 'Tus costumbres y estilo de vida',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.HABITOS),
    historia: HISTORIAS_MEDICAS['habitos'],
    logrosDesbloqueables: [LOGROS['explorador']],
    orden: 5,
    puntosSeccion: 25
  },
  {
    id: 'antecedentes-familiares',
    titulo: 'Antecedentes Familiares',
    descripcion: 'Historia médica de tu familia',
    preguntas: PREGUNTAS.filter(p => p.categoria === CategoriaAnamnesis.ANTECEDENTES_FAMILIARES),
    historia: HISTORIAS_MEDICAS['antecedentes-familiares'],
    logrosDesbloqueables: [LOGROS['guardian']],
    orden: 6,
    puntosSeccion: 20
  }
]

// Escenas de anamnesis
export const ESCENAS_ANAMNESIS: EscenaAnamnesis[] = [
  {
    id: 'escena-inicial',
    titulo: 'El Primer Encuentro',
    descripcion: 'Conociendo al paciente',
    imagenUrl: '/images/anamnesis/escena-inicial.jpg',
    secciones: ['datos-personales'],
    orden: 1,
    puntosEscena: 25
  },
  {
    id: 'escena-problema',
    titulo: 'El Problema Presente',
    descripcion: 'Entendiendo el motivo de consulta',
    imagenUrl: '/images/anamnesis/escena-problema.jpg',
    secciones: ['motivo-consulta', 'enfermedad-actual'],
    orden: 2,
    puntosEscena: 40
  },
  {
    id: 'escena-historia',
    titulo: 'La Historia Personal',
    descripcion: 'Explorando el pasado médico',
    imagenUrl: '/images/anamnesis/escena-historia.jpg',
    secciones: ['antecedentes-personales', 'habitos'],
    orden: 3,
    puntosEscena: 60
  },
  {
    id: 'escena-familia',
    titulo: 'El Árbol Genealógico',
    descripcion: 'Conociendo la historia familiar',
    imagenUrl: '/images/anamnesis/escena-familia.jpg',
    secciones: ['antecedentes-familiares'],
    orden: 4,
    puntosEscena: 20
  }
]

// Exportar todos los datos
export const TODOS_LOS_LOGROS = Object.values(LOGROS)
export const TODAS_LAS_PREGUNTAS = PREGUNTAS
export const TODAS_LAS_HISTORIAS = Object.values(HISTORIAS_MEDICAS) 