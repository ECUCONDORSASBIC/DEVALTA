/**
 * 📝 AltaMedica E2E Test - Sistema de Notas Médicas
 * 
 * Esta suite valida completamente el sistema de notas médicas implementado:
 * - Creación de notas con diferentes templates
 * - Búsqueda y filtrado de notas
 * - Categorización y prioridades
 * - Firma digital de notas
 * - Auto-guardado y historial de ediciones
 * - Compliance HIPAA y auditoría
 */

describe('📝 Sistema de Notas Médicas', () => {
  
  beforeEach(() => {
    // Login como doctor antes de cada test
    cy.loginAsDoctor();
    
    // Navegar al sistema de notas médicas
    cy.visit('/dashboard');
    cy.get('[data-cy=medical-notes-section]').click();
    cy.waitForApp();
  });
  
  it('Debe crear nota médica usando template de Anamnesis', () => {
    cy.logTestStep('📋 Creando nota con template de Anamnesis');
    
    // Abrir formulario de nueva nota
    cy.get('[data-cy=new-note-button]').click();
    
    // Seleccionar template de Anamnesis
    cy.get('[data-cy=note-template-selector]').select('anamnesis');
    
    // Verificar que se cargó el template
    cy.get('[data-cy=note-content-editor]')
      .should('contain.value', 'MOTIVO DE CONSULTA');
    
    // Llenar información de anamnesis
    const anamnesisContent = `
MOTIVO DE CONSULTA:
Dolor de cabeza de 3 días de evolución

ENFERMEDAD ACTUAL:
Paciente refiere cefalea de características tensionales, de intensidad moderada (6/10), 
localizada en región frontal bilateral. Inicio gradual hace 3 días. No asocia náuseas ni vómitos.
Mejora parcialmente con paracetamol.

ANTECEDENTES PERSONALES:
- Hipertensión arterial en tratamiento con Losartán 50mg
- No alergias medicamentosas conocidas
- No cirugías previas

ANTECEDENTES FAMILIARES:
- Madre: Diabetes tipo 2
- Padre: Hipertensión arterial

REVISIÓN POR SISTEMAS:
- Cardiovascular: Sin síntomas
- Respiratorio: Sin síntomas  
- Digestivo: Sin síntomas
- Genitourinario: Sin síntomas
- Neurológico: Cefalea como se describe
    `;
    
    cy.get('[data-cy=note-content-editor]')
      .clear()
      .type(anamnesisContent);
    
    // Configurar categoría y prioridad
    cy.get('[data-cy=note-category-selector]').select('anamnesis');
    cy.get('[data-cy=note-priority-selector]').select('medium');
    
    // Agregar tags médicos
    cy.get('[data-cy=note-tags-input]')
      .type('cefalea, hipertension, seguimiento{enter}');
    
    // Verificar vista previa
    cy.get('[data-cy=note-preview-tab]').click();
    cy.get('[data-cy=note-preview-content]')
      .should('contain.text', 'MOTIVO DE CONSULTA')
      .should('contain.text', 'cefalea');
    
    // Guardar nota
    cy.get('[data-cy=save-note-button]').click();
    
    // Verificar confirmación de guardado
    cy.get('[data-cy=note-saved-confirmation]')
      .should('be.visible')
      .should('contain.text', 'Nota guardada exitosamente');
    
    // Verificar que aparece en la lista
    cy.get('[data-cy=medical-notes-list]')
      .should('contain.text', 'MOTIVO DE CONSULTA')
      .within(() => {
        cy.get('[data-cy=note-category-badge]')
          .should('contain.text', 'Anamnesis');
        cy.get('[data-cy=note-priority-badge]')
          .should('contain.text', 'MEDIUM');
      });
    
    cy.takeTestScreenshot('anamnesis-note-created');
  });
  
  it('Debe crear nota de Examen Físico con signos vitales', () => {
    cy.logTestStep('🩺 Creando nota de Examen Físico');
    
    cy.get('[data-cy=new-note-button]').click();
    cy.get('[data-cy=note-template-selector]').select('physical_exam');
    
    const physicalExamContent = `
SIGNOS VITALES:
- Presión arterial: 130/85 mmHg
- Frecuencia cardíaca: 78 lpm, rítmica
- Frecuencia respiratoria: 16 rpm
- Temperatura: 36.8°C
- Saturación de oxígeno: 98% aire ambiente
- Peso: 70 kg
- Talla: 170 cm
- IMC: 24.2 kg/m²

EXAMEN FÍSICO GENERAL:
Paciente consciente, orientado, colaborador. Buen estado general. 
Hidratado, afebril. No palidez ni cianosis.

EXAMEN POR SISTEMAS:

CABEZA Y CUELLO:
- Normocéfalo, no deformidades
- Pupilas isocóricas, reactivas a la luz
- No rigidez de nuca
- Tiroides no palpable

CARDIOVASCULAR:
- Ruidos cardíacos rítmicos, no soplos
- Pulsos periféricos presentes y simétricos
- No edemas en miembros inferiores

RESPIRATORIO:
- Tórax simétrico, expansión conservada
- Murmullo vesicular conservado bilateral
- No ruidos agregados

ABDOMEN:
- Blando, depresible, no doloroso
- Ruidos hidroaéreos presentes
- No visceromegalias palpables

NEUROLÓGICO:
- Consciente, orientado en tiempo, espacio y persona
- Fuerza muscular conservada en 4 extremidades
- Reflejos osteotendinosos conservados
- No signos de focalización neurológica
    `;
    
    cy.get('[data-cy=note-content-editor]')
      .clear()
      .type(physicalExamContent);
    
    cy.get('[data-cy=note-category-selector]').select('physical_exam');
    cy.get('[data-cy=note-priority-selector]').select('high');
    
    // Marcar como requiere revisión
    cy.get('[data-cy=requires-review-checkbox]').check();
    
    cy.get('[data-cy=save-note-button]').click();
    
    cy.get('[data-cy=note-saved-confirmation]').should('be.visible');
    
    cy.takeTestScreenshot('physical-exam-note-created');
  });
  
  it('Debe crear y firmar nota de Diagnóstico', () => {
    cy.logTestStep('🔍 Creando nota de Diagnóstico con firma digital');
    
    cy.get('[data-cy=new-note-button]').click();
    cy.get('[data-cy=note-template-selector]').select('diagnosis');
    
    const diagnosisContent = `
IMPRESIÓN DIAGNÓSTICA:

DIAGNÓSTICO PRINCIPAL:
Cefalea tensional (G44.2)

DIAGNÓSTICOS SECUNDARIOS:
1. Hipertensión arterial esencial (I10)
2. Sobrepeso (E66.3)

ANÁLISIS:
Paciente con cuadro clínico compatible con cefalea de tipo tensional, 
sin signos de alarma. Factores contribuyentes incluyen estrés y tensión muscular.
La hipertensión arterial se encuentra controlada con tratamiento actual.

PLAN TERAPÉUTICO:

MEDICAMENTOS:
1. Paracetamol 500mg cada 8 horas por 5 días (para dolor)
2. Continuar Losartán 50mg diario (para hipertensión)
3. Magnesio 400mg diario por 30 días (prevención)

MEDIDAS NO FARMACOLÓGICAS:
1. Técnicas de relajación y manejo de estrés
2. Ejercicio aeróbico regular (30 min, 3 veces/semana)
3. Higiene del sueño (7-8 horas diarias)
4. Reducción de cafeína

SEGUIMIENTO:
- Control en 7 días si persisten síntomas
- Control de presión arterial en 1 mes
- Consulta inmediata si: vómitos, fiebre, rigidez de nuca, 
  cambios visuales o empeoramiento súbito del dolor

PRONÓSTICO:
Favorable con tratamiento adecuado y modificaciones del estilo de vida.
    `;
    
    cy.get('[data-cy=note-content-editor]')
      .clear()
      .type(diagnosisContent);
    
    cy.get('[data-cy=note-category-selector]').select('diagnosis');
    cy.get('[data-cy=note-priority-selector]').select('high');
    
    // Marcar como requiere firma
    cy.get('[data-cy=requires-signature-checkbox]').check();
    
    // Guardar nota
    cy.get('[data-cy=save-note-button]').click();
    cy.get('[data-cy=note-saved-confirmation]').should('be.visible');
    
    // Firmar nota digitalmente
    cy.get('[data-cy=medical-notes-list]')
      .contains('IMPRESIÓN DIAGNÓSTICA')
      .parent()
      .within(() => {
        cy.get('[data-cy=sign-note-button]').click();
      });
    
    // Modal de firma digital
    cy.get('[data-cy=digital-signature-modal]')
      .should('be.visible')
      .within(() => {
        // Verificar información de la nota
        cy.get('[data-cy=note-summary]')
          .should('contain.text', 'Cefalea tensional');
        
        // Verificar información del médico
        cy.get('[data-cy=doctor-info]')
          .should('contain.text', 'Dr. Test Usuario');
        
        // Confirmación de firma
        cy.get('[data-cy=signature-agreement-checkbox]').check();
        cy.get('[data-cy=confirm-signature-button]').click();
      });
    
    // Verificar nota firmada
    cy.get('[data-cy=signature-success-message]')
      .should('be.visible')
      .should('contain.text', 'Nota firmada digitalmente');
    
    // Verificar indicador de firma en la lista
    cy.get('[data-cy=medical-notes-list]')
      .contains('IMPRESIÓN DIAGNÓSTICA')
      .parent()
      .within(() => {
        cy.get('[data-cy=note-signed-indicator]')
          .should('be.visible')
          .should('have.class', 'signed');
        
        cy.get('[data-cy=signature-timestamp]')
          .should('be.visible');
      });
    
    cy.takeTestScreenshot('diagnosis-note-signed');
  });
  
  it('Debe buscar y filtrar notas médicas', () => {
    cy.logTestStep('🔍 Probando búsqueda y filtrado de notas');
    
    // Verificar que hay notas en la lista (de tests anteriores)
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .should('have.length.greaterThan', 0);
    
    // Buscar por término específico
    cy.get('[data-cy=notes-search-input]')
      .type('cefalea');
    
    cy.get('[data-cy=search-notes-button]').click();
    
    // Verificar resultados de búsqueda
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .should('contain.text', 'cefalea')
      .should('have.length.greaterThan', 0);
    
    // Limpiar búsqueda
    cy.get('[data-cy=clear-search-button]').click();
    
    // Filtrar por categoría
    cy.get('[data-cy=category-filter-select]').select('diagnosis');
    
    // Verificar filtro de categoría
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .each(($note) => {
        cy.wrap($note)
          .find('[data-cy=note-category-badge]')
          .should('contain.text', 'Diagnóstico');
      });
    
    // Filtrar por prioridad
    cy.get('[data-cy=priority-filter-select]').select('high');
    
    // Verificar filtro de prioridad
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .each(($note) => {
        cy.wrap($note)
          .find('[data-cy=note-priority-badge]')
          .should('contain.text', 'HIGH');
      });
    
    // Filtrar por estado de firma
    cy.get('[data-cy=signature-filter-select]').select('signed');
    
    // Verificar filtro de firma
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .each(($note) => {
        cy.wrap($note)
          .find('[data-cy=note-signed-indicator]')
          .should('be.visible');
      });
    
    // Limpiar todos los filtros
    cy.get('[data-cy=clear-filters-button]').click();
    
    cy.takeTestScreenshot('notes-search-and-filter');
  });
  
  it('Debe validar auto-guardado de notas', () => {
    cy.logTestStep('💾 Probando auto-guardado de notas');
    
    cy.get('[data-cy=new-note-button]').click();
    cy.get('[data-cy=note-template-selector]').select('consultation');
    
    // Escribir contenido y esperar auto-guardado
    cy.get('[data-cy=note-content-editor]')
      .type('Contenido de prueba para auto-guardado');
    
    // Verificar indicador de auto-guardado
    cy.get('[data-cy=auto-save-indicator]', { timeout: 35000 })
      .should('be.visible')
      .should('contain.text', 'Guardado automáticamente');
    
    // Simular recargar página para verificar persistencia
    cy.reload();
    cy.waitForApp();
    
    // Verificar que el contenido se mantuvo
    cy.get('[data-cy=draft-notes-section]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=draft-note-item]')
          .should('contain.text', 'auto-guardado')
          .click();
      });
    
    cy.get('[data-cy=note-content-editor]')
      .should('contain.value', 'Contenido de prueba para auto-guardado');
    
    cy.takeTestScreenshot('auto-save-validation');
  });
  
  it('Debe mostrar historial de ediciones de nota', () => {
    cy.logTestStep('📜 Probando historial de ediciones');
    
    // Crear nota inicial
    cy.get('[data-cy=new-note-button]').click();
    cy.get('[data-cy=note-content-editor]')
      .type('Versión inicial de la nota');
    cy.get('[data-cy=save-note-button]').click();
    
    // Editar la nota
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .first()
      .within(() => {
        cy.get('[data-cy=edit-note-button]').click();
      });
    
    cy.get('[data-cy=note-content-editor]')
      .clear()
      .type('Versión actualizada con más información médica');
    
    cy.get('[data-cy=save-note-button]').click();
    
    // Ver historial de la nota
    cy.get('[data-cy=medical-notes-list] [data-cy=medical-note-item]')
      .first()
      .within(() => {
        cy.get('[data-cy=note-history-button]').click();
      });
    
    // Verificar modal de historial
    cy.get('[data-cy=note-history-modal]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=history-version]')
          .should('have.length', 2);
        
        // Verificar primera versión
        cy.get('[data-cy=history-version]:first')
          .should('contain.text', 'Versión actualizada');
        
        // Verificar versión anterior
        cy.get('[data-cy=history-version]:last')
          .should('contain.text', 'Versión inicial');
        
        // Ver detalle de versión anterior
        cy.get('[data-cy=history-version]:last [data-cy=view-version-button]')
          .click();
      });
    
    // Verificar contenido de versión histórica
    cy.get('[data-cy=version-content-viewer]')
      .should('contain.text', 'Versión inicial de la nota');
    
    cy.takeTestScreenshot('note-history-validation');
  });
  
  it('Debe validar compliance HIPAA y auditoría', () => {
    cy.logTestStep('🔒 Validando compliance HIPAA y auditoría');
    
    // Crear nota con datos médicos sensibles
    cy.get('[data-cy=new-note-button]').click();
    
    const sensitiveContent = `
INFORMACIÓN CONFIDENCIAL DEL PACIENTE:
- Diagnóstico: Trastorno de ansiedad generalizada
- Medicación psiquiátrica: Sertralina 50mg
- Historia familiar: Depresión materna
- Datos personales sensibles incluidos
    `;
    
    cy.get('[data-cy=note-content-editor]').type(sensitiveContent);
    
    // Verificar clasificación automática de datos
    cy.get('[data-cy=phi-classification-indicator]')
      .should('be.visible')
      .should('contain.text', 'Contiene PHI');
    
    // Verificar advertencia de compliance
    cy.get('[data-cy=hipaa-compliance-warning]')
      .should('be.visible')
      .should('contain.text', 'Esta nota contiene información médica protegida');
    
    cy.get('[data-cy=note-category-selector]').select('psychiatric');
    cy.get('[data-cy=requires-signature-checkbox]').check();
    
    cy.get('[data-cy=save-note-button]').click();
    
    // Verificar registro de auditoría
    cy.get('[data-cy=audit-trail-link]').click();
    
    cy.get('[data-cy=audit-trail-modal]')
      .should('be.visible')
      .within(() => {
        // Verificar entrada de auditoría reciente
        cy.get('[data-cy=audit-entry]:first')
          .should('contain.text', 'MEDICAL_NOTE_CREATED')
          .should('contain.text', 'PHI: true')
          .should('contain.text', new Date().toLocaleDateString());
        
        // Verificar información de usuario
        cy.get('[data-cy=audit-user-info]')
          .should('contain.text', 'Dr. Test Usuario');
      });
    
    cy.takeTestScreenshot('hipaa-compliance-validation');
  });
  
  afterEach(() => {
    // Limpiar notas de prueba después de cada test
    cy.task('clearTestData');
  });
  
});