import { expect, test } from '@playwright/test';
import { assertions, AuthPage, PatientPage, testData } from '../helpers/page-objects';

test.describe('Gestión de Pacientes', () => {
  let authPage: AuthPage;
  let patientPage: PatientPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    patientPage = new PatientPage(page);
    
    await authPage.login();
    await patientPage.goto('/dashboard/patients');
  });

  test('debería mostrar la interfaz de pacientes correctamente', async ({ page }) => {
    await patientPage.assertPageTitle('Pacientes');
    await patientPage.assertHeading('Gestión de Pacientes');
    
    // Verificar elementos principales
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
    await expect(page.locator('button:has-text("Nuevo Paciente")')).toBeVisible();
    await expect(page.locator('[placeholder*="Buscar por nombre"]')).toBeVisible();
    
    // Verificar estadísticas de pacientes
    await expect(page.locator('[data-testid="total-patients"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-patients"]')).toBeVisible();
    await expect(page.locator('[data-testid="patients-with-allergies"]')).toBeVisible();
    
    // Verificar pestañas de vista
    await expect(page.locator('[data-testid="table-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="cards-view"]')).toBeVisible();
  });

  test('debería crear un nuevo paciente con información completa', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `patient.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    
    // Verificar que el paciente aparece en la lista
    await patientPage.searchPatient(patientData.firstName);
    await expect(page.locator(`text="${patientData.firstName} ${patientData.lastName}"`)).toBeVisible();
    
    // Verificar información del paciente
    await expect(page.locator(`text="${patientData.email}"`)).toBeVisible();
    await expect(page.locator(`text="${patientData.phone}"`)).toBeVisible();
    await expect(page.locator(`text="${patientData.dni}"`)).toBeVisible();
  });

  test('debería validar campos requeridos al crear paciente', async ({ page }) => {
    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    // Intentar crear paciente sin datos
    await page.click('button:has-text("Crear Paciente")');
    
    // Verificar validaciones en pestaña personal
    await assertions.assertFormValidation(page, 'firstName', 'El nombre debe tener al menos 2 caracteres');
    await assertions.assertFormValidation(page, 'lastName', 'El apellido debe tener al menos 2 caracteres');
    await assertions.assertFormValidation(page, 'email', 'Email inválido');
    await assertions.assertFormValidation(page, 'dni', 'El DNI debe tener al menos 7 caracteres');
  });

  test('debería navegar entre pestañas del formulario de paciente', async ({ page }) => {
    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    // Verificar todas las pestañas
    const tabs = [
      { id: 'personal', name: 'Personal' },
      { id: 'contact', name: 'Contacto' },
      { id: 'emergency', name: 'Emergencia' },
      { id: 'medical', name: 'Médico' },
      { id: 'history', name: 'Historial' },
      { id: 'settings', name: 'Configuración' }
    ];

    for (const tab of tabs) {
      await page.click(`[data-testid="${tab.id}-tab"]`);
      await expect(page.locator(`[data-testid="${tab.id}-content"]`)).toBeVisible();
    }
  });

  test('debería agregar información médica del paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `medical.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    // Llenar información básica
    await page.click('[data-testid="personal-tab"]');
    await patientPage.fillForm(patientData);
    
    // Ir a pestaña médica
    await page.click('[data-testid="medical-tab"]');
    
    // Agregar alergia
    await page.click('button:has-text("Agregar Alergia")');
    await page.fill('[name="allergies.0.allergen"]', 'Penicilina');
    await page.selectOption('[name="allergies.0.severity"]', 'Severa');
    await page.fill('[name="allergies.0.reaction"]', 'Erupción cutánea');
    
    // Agregar condición crónica
    await page.click('button:has-text("Agregar Condición")');
    await page.fill('[name="chronicConditions.0.condition"]', 'Diabetes Tipo 2');
    await page.selectOption('[name="chronicConditions.0.status"]', 'Controlada');
    
    // Agregar medicación
    await page.click('button:has-text("Agregar Medicación")');
    await page.fill('[name="currentMedications.0.name"]', 'Metformina');
    await page.fill('[name="currentMedications.0.dosage"]', '500mg');
    await page.fill('[name="currentMedications.0.frequency"]', '2 veces al día');
    
    await page.click('button:has-text("Crear Paciente")');
    await patientPage.assertNotification('Paciente creado exitosamente');
  });

  test('debería buscar pacientes por diferentes criterios', async ({ page }) => {
    // Crear pacientes de prueba
    const patients = [
      { 
        ...testData.patient, 
        firstName: 'Ana', 
        lastName: 'García', 
        email: 'ana@test.com',
        dni: '11111111'
      },
      { 
        ...testData.patient, 
        firstName: 'Luis', 
        lastName: 'Martín', 
        email: 'luis@test.com',
        dni: '22222222'
      }
    ];

    for (const patient of patients) {
      await patientPage.createPatient(patient);
    }

    // Buscar por nombre
    await patientPage.searchPatient('Ana');
    await expect(page.locator('text="Ana García"')).toBeVisible();
    await expect(page.locator('text="Luis Martín"')).not.toBeVisible();

    // Buscar por DNI
    await page.fill('[placeholder*="Buscar por nombre"]', '22222222');
    await patientPage.waitForPageLoad();
    await expect(page.locator('text="Luis Martín"')).toBeVisible();
    await expect(page.locator('text="Ana García"')).not.toBeVisible();

    // Buscar por email
    await page.fill('[placeholder*="Buscar por nombre"]', 'ana@test.com');
    await patientPage.waitForPageLoad();
    await expect(page.locator('text="Ana García"')).toBeVisible();
  });

  test('debería filtrar pacientes por estado y otras características', async ({ page }) => {
    // Filtrar por estado
    await page.selectOption('[data-testid="status-filter"]', 'Activo');
    await patientPage.waitForPageLoad();
    
    // Verificar que solo se muestren pacientes activos
    const statusCells = page.locator('[data-testid="patient-status"]');
    const count = await statusCells.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusCells.nth(i)).toHaveText('Activo');
    }
    
    // Filtrar por edad (si está implementado)
    const ageFilter = page.locator('[data-testid="age-filter"]');
    if (await ageFilter.isVisible()) {
      await page.fill('[data-testid="min-age"]', '18');
      await page.fill('[data-testid="max-age"]', '65');
      await patientPage.waitForPageLoad();
    }
  });

  test('debería cambiar entre vista de tabla y tarjetas', async ({ page }) => {
    // Vista de tabla (por defecto)
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
    
    // Cambiar a vista de tarjetas
    await page.click('[data-testid="cards-view"]');
    await expect(page.locator('[data-testid="patients-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-card"]')).toHaveCountGreaterThan(0);
    
    // Volver a vista de tabla
    await page.click('[data-testid="table-view"]');
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
  });

  test('debería ver perfil completo del paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `profile.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    await patientPage.viewPatientProfile(`${patientData.firstName} ${patientData.lastName}`);
    
    // Verificar información en el perfil
    await expect(page.locator(`text="${patientData.firstName} ${patientData.lastName}"`)).toBeVisible();
    await expect(page.locator(`text="${patientData.email}"`)).toBeVisible();
    await expect(page.locator(`text="${patientData.dni}"`)).toBeVisible();
    
    // Verificar pestañas del perfil
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="medical-history-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="documents-tab"]')).toBeVisible();
  });

  test('debería agregar historial médico al paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `history.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    
    const historyData = {
      description: 'Consulta por dolor de cabeza persistente',
      diagnosis: 'Migraña tensional',
      treatment: 'Ibuprofeno 400mg cada 8 horas'
    };

    await patientPage.addMedicalHistory(`${patientData.firstName} ${patientData.lastName}`, historyData);
    
    // Verificar que el historial se agregó
    await patientPage.viewPatientProfile(`${patientData.firstName} ${patientData.lastName}`);
    await page.click('[data-testid="medical-history-tab"]');
    
    await expect(page.locator(`text="${historyData.description}"`)).toBeVisible();
    await expect(page.locator(`text="${historyData.diagnosis}"`)).toBeVisible();
    await expect(page.locator(`text="${historyData.treatment}"`)).toBeVisible();
  });

  test('debería gestionar alergias del paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `allergies.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    
    const allergyData = {
      allergen: 'Mariscos',
      severity: 'Crítica',
      reaction: 'Anafilaxia'
    };

    await patientPage.addAllergy(`${patientData.firstName} ${patientData.lastName}`, allergyData);
    
    // Verificar que la alergia aparece en la lista principal con indicador
    await patientPage.searchPatient(patientData.firstName);
    await expect(page.locator(`[data-testid="patient-${patientData.firstName}"] .allergy-indicator`)).toBeVisible();
  });

  test('debería calcular y mostrar edad correctamente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `age.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8),
      dateOfBirth: '1990-05-15'
    };

    await patientPage.createPatient(patientData);
    
    // Verificar que se muestre la edad calculada
    await patientPage.searchPatient(patientData.firstName);
    
    const currentYear = new Date().getFullYear();
    const birthYear = 1990;
    const expectedAge = currentYear - birthYear;
    
    await expect(page.locator(`text="${expectedAge} años"`)).toBeVisible();
  });

  test('debería validar DNI único', async ({ page }) => {
    const dni = `${Date.now()}`.slice(-8);
    
    // Crear primer paciente
    const patient1 = {
      ...testData.patient,
      email: 'patient1@test.com',
      dni
    };
    await patientPage.createPatient(patient1);
    
    // Intentar crear segundo paciente con mismo DNI
    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    const patient2 = {
      ...testData.patient,
      firstName: 'Otro',
      lastName: 'Paciente',
      email: 'patient2@test.com',
      dni
    };
    
    await patientPage.fillForm(patient2);
    await page.click('button:has-text("Crear Paciente")');
    
    await expect(page.locator('text="DNI ya está registrado"')).toBeVisible();
  });

  test('debería exportar datos de pacientes', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('button:has-text("Exportar")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/pacientes.*\.(csv|xlsx)$/);
  });

  test('debería mostrar signos vitales del paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `vitals.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    await patientPage.viewPatientProfile(`${patientData.firstName} ${patientData.lastName}`);
    
    // Ir a pestaña de signos vitales
    await page.click('[data-testid="vitals-tab"]');
    
    // Agregar signos vitales
    await page.click('button:has-text("Registrar Signos Vitales")');
    
    await page.fill('[data-testid="heart-rate"]', '72');
    await page.fill('[data-testid="blood-pressure-systolic"]', '120');
    await page.fill('[data-testid="blood-pressure-diastolic"]', '80');
    await page.fill('[data-testid="temperature"]', '36.5');
    await page.fill('[data-testid="weight"]', '70');
    await page.fill('[data-testid="height"]', '170');
    
    await page.click('button:has-text("Guardar Signos Vitales")');
    
    // Verificar que se calculó el IMC automáticamente
    await expect(page.locator('[data-testid="calculated-bmi"]')).toBeVisible();
  });

  test('debería gestionar documentos del paciente', async ({ page }) => {
    const patientData = {
      ...testData.patient,
      email: `documents.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };

    await patientPage.createPatient(patientData);
    await patientPage.viewPatientProfile(`${patientData.firstName} ${patientData.lastName}`);
    
    // Ir a pestaña de documentos
    await page.click('[data-testid="documents-tab"]');
    
    // Subir documento
    await page.click('button:has-text("Subir Documento")');
    
    // Simular subida de archivo
    const fileInput = page.locator('input[type="file"]');
    // En un test real, usarías setInputFiles()
    
    await page.fill('[data-testid="document-name"]', 'Análisis de sangre');
    await page.selectOption('[data-testid="document-type"]', 'lab-result');
    await page.fill('[data-testid="document-description"]', 'Análisis de rutina - Enero 2024');
    
    await page.click('button:has-text("Guardar Documento")');
    
    // Verificar que el documento aparece en la lista
    await expect(page.locator('text="Análisis de sangre"')).toBeVisible();
  });

  test('debería manejar contacto de emergencia', async ({ page }) => {
    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    // Ir a pestaña de emergencia
    await page.click('[data-testid="emergency-tab"]');
    
    // Verificar validaciones de contacto de emergencia
    await page.click('button:has-text("Crear Paciente")');
    
    await assertions.assertFormValidation(page, 'emergencyContact.name', 'El nombre debe tener al menos 2 caracteres');
    await assertions.assertFormValidation(page, 'emergencyContact.relationship', 'La relación debe tener al menos 2 caracteres');
    await assertions.assertFormValidation(page, 'emergencyContact.phone', 'El teléfono debe tener al menos 10 dígitos');
  });

  test('debería funcionar correctamente en dispositivos móviles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar vista móvil
    await expect(page.locator('[data-testid="mobile-patients-view"]')).toBeVisible();
    
    // Verificar que el botón de nuevo paciente sea accesible
    await expect(page.locator('[data-testid="mobile-new-patient"]')).toBeVisible();
    
    // Verificar navegación en móvil
    const firstPatientCard = page.locator('[data-testid="patient-card"]').first();
    if (await firstPatientCard.isVisible()) {
      await firstPatientCard.click();
      await patientPage.waitForModal();
      await expect(page.locator('[data-testid="patient-profile-mobile"]')).toBeVisible();
    }
  });

  test('debería mostrar alertas médicas importantes', async ({ page }) => {
    // Crear paciente con alergias críticas
    await page.click('button:has-text("Nuevo Paciente")');
    await patientPage.waitForModal();
    
    const patientData = {
      ...testData.patient,
      email: `alerts.${Date.now()}@example.com`,
      dni: `${Date.now()}`.slice(-8)
    };
    
    // Llenar información básica
    await patientPage.fillForm(patientData);
    
    // Agregar alergia crítica
    await page.click('[data-testid="medical-tab"]');
    await page.click('button:has-text("Agregar Alergia")');
    await page.fill('[name="allergies.0.allergen"]', 'Penicilina');
    await page.selectOption('[name="allergies.0.severity"]', 'Crítica');
    
    await page.click('button:has-text("Crear Paciente")');
    
    // Verificar que aparece alerta visual
    await patientPage.searchPatient(patientData.firstName);
    await expect(page.locator(`[data-testid="patient-${patientData.firstName}"] .critical-alert`)).toBeVisible();
  });
});
