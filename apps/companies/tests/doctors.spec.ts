import { expect, test } from '@playwright/test';
import { assertions, AuthPage, DoctorPage, testData } from '../helpers/page-objects';

test.describe('Gestión de Doctores', () => {
  let authPage: AuthPage;
  let doctorPage: DoctorPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    doctorPage = new DoctorPage(page);
    
    await authPage.login();
    await doctorPage.goto('/dashboard/doctors');
  });

  test('debería mostrar la lista de doctores correctamente', async ({ page }) => {
    await doctorPage.assertPageTitle('Doctores');
    await doctorPage.assertHeading('Gestión de Doctores');
    
    // Verificar elementos de la interfaz
    await expect(page.locator('[data-testid="doctors-grid"]')).toBeVisible();
    await expect(page.locator('button:has-text("Nuevo Doctor")')).toBeVisible();
    await expect(page.locator('[placeholder*="Buscar doctores"]')).toBeVisible();
    
    // Verificar estadísticas
    await expect(page.locator('[data-testid="total-doctors"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-doctors"]')).toBeVisible();
    await expect(page.locator('[data-testid="specialties-count"]')).toBeVisible();
  });

  test('debería crear un nuevo doctor exitosamente', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `doctor.${Date.now()}@example.com`,
      licenseNumber: `LIC${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    
    // Verificar que el doctor aparece en la lista
    await expect(page.locator(`[data-testid="doctor-card-${doctorData.firstName} ${doctorData.lastName}"]`)).toBeVisible();
    
    // Verificar información del doctor
    const doctorCard = page.locator(`[data-testid="doctor-card-${doctorData.firstName} ${doctorData.lastName}"]`);
    await expect(doctorCard.locator(`text="${doctorData.specialty}"`)).toBeVisible();
    await expect(doctorCard.locator(`text="${doctorData.licenseNumber}"`)).toBeVisible();
  });

  test('debería validar campos requeridos al crear doctor', async ({ page }) => {
    await page.click('button:has-text("Nuevo Doctor")');
    await doctorPage.waitForModal();
    
    // Intentar enviar formulario vacío
    await page.click('button:has-text("Crear Doctor")');
    
    // Verificar mensajes de validación
    await assertions.assertFormValidation(page, 'firstName', 'El nombre es requerido');
    await assertions.assertFormValidation(page, 'lastName', 'El apellido es requerido');
    await assertions.assertFormValidation(page, 'email', 'El email es requerido');
    await assertions.assertFormValidation(page, 'specialty', 'La especialidad es requerida');
    await assertions.assertFormValidation(page, 'licenseNumber', 'El número de licencia es requerido');
  });

  test('debería buscar doctores por nombre y especialidad', async ({ page }) => {
    // Crear doctores de prueba
    const doctors = [
      { 
        ...testData.doctor, 
        firstName: 'Carlos', 
        lastName: 'Mendoza', 
        specialty: 'Cardiología',
        email: 'carlos@test.com',
        licenseNumber: 'CARD123'
      },
      { 
        ...testData.doctor, 
        firstName: 'Elena', 
        lastName: 'Ruiz', 
        specialty: 'Neurología',
        email: 'elena@test.com',
        licenseNumber: 'NEUR456'
      }
    ];

    for (const doctor of doctors) {
      await doctorPage.createDoctor(doctor);
    }

    // Buscar por nombre
    await page.fill('[placeholder*="Buscar doctores"]', 'Carlos');
    await doctorPage.waitForPageLoad();
    await expect(page.locator('text="Carlos Mendoza"')).toBeVisible();
    await expect(page.locator('text="Elena Ruiz"')).not.toBeVisible();

    // Limpiar búsqueda y filtrar por especialidad
    await page.fill('[placeholder*="Buscar doctores"]', '');
    await doctorPage.filterBySpecialty('Neurología');
    await expect(page.locator('text="Elena Ruiz"')).toBeVisible();
    await expect(page.locator('text="Carlos Mendoza"')).not.toBeVisible();
  });

  test('debería mostrar perfil detallado del doctor', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `profile.${Date.now()}@example.com`,
      licenseNumber: `PROF${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Verificar información en el perfil
    await expect(page.locator(`text="${doctorData.firstName} ${doctorData.lastName}"`)).toBeVisible();
    await expect(page.locator(`text="${doctorData.specialty}"`)).toBeVisible();
    await expect(page.locator(`text="${doctorData.licenseNumber}"`)).toBeVisible();
    await expect(page.locator(`text="${doctorData.email}"`)).toBeVisible();
    
    // Verificar pestañas del perfil
    await expect(page.locator('[data-testid="profile-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="schedule-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="reviews-tab"]')).toBeVisible();
  });

  test('debería gestionar horarios del doctor', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `schedule.${Date.now()}@example.com`,
      licenseNumber: `SCHED${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.editDoctorSchedule(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Verificar que los horarios se guardaron
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    await page.click('[data-testid="schedule-tab"]');
    
    await expect(page.locator('text="Lunes: 09:00 - 17:00"')).toBeVisible();
  });

  test('debería configurar horarios especiales y excepciones', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `special.${Date.now()}@example.com`,
      licenseNumber: `SPEC${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Ir a configuración de horarios
    await page.click('[data-testid="schedule-tab"]');
    await page.click('button:has-text("Configurar Excepciones")');
    
    // Agregar excepción (vacaciones)
    await page.click('button:has-text("Agregar Excepción")');
    await page.fill('[data-testid="exception-date"]', '2024-12-25');
    await page.selectOption('[data-testid="exception-type"]', 'holiday');
    await page.fill('[data-testid="exception-reason"]', 'Navidad');
    
    await page.click('button:has-text("Guardar Excepción")');
    await doctorPage.assertNotification('Excepción agregada exitosamente');
  });

  test('debería mostrar citas del doctor', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `appointments.${Date.now()}@example.com`,
      licenseNumber: `APPT${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Ver citas del doctor
    await page.click('[data-testid="appointments-tab"]');
    
    // Verificar calendario de citas
    await expect(page.locator('[data-testid="doctor-calendar"]')).toBeVisible();
    
    // Verificar estadísticas de citas
    await expect(page.locator('[data-testid="appointments-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-week"]')).toBeVisible();
    await expect(page.locator('[data-testid="appointments-month"]')).toBeVisible();
  });

  test('debería gestionar reseñas y calificaciones', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `reviews.${Date.now()}@example.com`,
      licenseNumber: `REV${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Ver reseñas del doctor
    await page.click('[data-testid="reviews-tab"]');
    
    // Verificar elementos de reseñas
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-reviews"]')).toBeVisible();
    await expect(page.locator('[data-testid="rating-breakdown"]')).toBeVisible();
    
    // Si hay reseñas, verificar su estructura
    const reviewsList = page.locator('[data-testid="reviews-list"]');
    if (await reviewsList.isVisible()) {
      const firstReview = reviewsList.locator('.review-item').first();
      await expect(firstReview.locator('.reviewer-name')).toBeVisible();
      await expect(firstReview.locator('.review-rating')).toBeVisible();
      await expect(firstReview.locator('.review-text')).toBeVisible();
      await expect(firstReview.locator('.review-date')).toBeVisible();
    }
  });

  test('debería cambiar estado de disponibilidad del doctor', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `status.${Date.now()}@example.com`,
      licenseNumber: `STAT${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    
    const doctorCard = page.locator(`[data-testid="doctor-card-${doctorData.firstName} ${doctorData.lastName}"]`);
    
    // Cambiar estado a no disponible
    await doctorCard.locator('[data-testid="availability-toggle"]').click();
    await expect(doctorCard.locator('.status-unavailable')).toBeVisible();
    
    // Cambiar estado de vuelta a disponible
    await doctorCard.locator('[data-testid="availability-toggle"]').click();
    await expect(doctorCard.locator('.status-available')).toBeVisible();
  });

  test('debería filtrar doctores por múltiples criterios', async ({ page }) => {
    // Crear doctores con diferentes estados y especialidades
    const doctors = [
      { 
        ...testData.doctor, 
        firstName: 'Pedro',
        specialty: 'Cardiología',
        status: 'available',
        email: 'pedro@test.com',
        licenseNumber: 'CARD001'
      },
      { 
        ...testData.doctor, 
        firstName: 'Laura',
        specialty: 'Dermatología',
        status: 'unavailable',
        email: 'laura@test.com',
        licenseNumber: 'DERM002'
      }
    ];

    for (const doctor of doctors) {
      await doctorPage.createDoctor(doctor);
    }

    // Aplicar filtros combinados
    await doctorPage.filterBySpecialty('Cardiología');
    await page.selectOption('[data-testid="status-filter"]', 'available');
    
    await expect(page.locator('text="Pedro"')).toBeVisible();
    await expect(page.locator('text="Laura"')).not.toBeVisible();
  });

  test('debería exportar lista de doctores', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    
    await page.click('button:has-text("Exportar Doctores")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/doctores.*\.(csv|xlsx)$/);
  });

  test('debería validar número de licencia único', async ({ page }) => {
    const licenseNumber = `UNIQUE${Date.now()}`;
    
    // Crear primer doctor
    const doctor1 = {
      ...testData.doctor,
      email: 'doctor1@test.com',
      licenseNumber
    };
    await doctorPage.createDoctor(doctor1);
    
    // Intentar crear segundo doctor con misma licencia
    await page.click('button:has-text("Nuevo Doctor")');
    await doctorPage.waitForModal();
    
    const doctor2 = {
      ...testData.doctor,
      firstName: 'Otro',
      lastName: 'Doctor',
      email: 'doctor2@test.com',
      licenseNumber
    };
    
    await doctorPage.fillForm(doctor2);
    await page.click('button:has-text("Crear Doctor")');
    
    await expect(page.locator('text="Número de licencia ya está en uso"')).toBeVisible();
  });

  test('debería manejar vista responsive para doctores', async ({ page }) => {
    // Vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que la grilla se adapte a móvil
    await expect(page.locator('[data-testid="doctors-mobile-list"]')).toBeVisible();
    
    // Verificar que cada card de doctor sea clickeable en móvil
    const firstDoctorCard = page.locator('[data-testid="doctor-card"]').first();
    if (await firstDoctorCard.isVisible()) {
      await firstDoctorCard.click();
      await doctorPage.waitForModal();
      await expect(page.locator('[data-testid="doctor-profile-modal"]')).toBeVisible();
    }
  });

  test('debería gestionar especialidades médicas', async ({ page }) => {
    // Verificar lista de especialidades disponibles
    await page.click('button:has-text("Nuevo Doctor")');
    await doctorPage.waitForModal();
    
    const specialtySelect = page.locator('[name="specialty"]');
    await specialtySelect.click();
    
    // Verificar especialidades comunes
    const commonSpecialties = [
      'Cardiología',
      'Dermatología', 
      'Neurología',
      'Pediatría',
      'Ginecología',
      'Traumatología'
    ];
    
    for (const specialty of commonSpecialties) {
      await expect(page.locator(`option:has-text("${specialty}")`)).toBeVisible();
    }
  });

  test('debería mostrar estadísticas de productividad del doctor', async ({ page }) => {
    const doctorData = {
      ...testData.doctor,
      email: `stats.${Date.now()}@example.com`,
      licenseNumber: `STATS${Date.now()}`
    };

    await doctorPage.createDoctor(doctorData);
    await doctorPage.viewDoctorProfile(`${doctorData.firstName} ${doctorData.lastName}`);
    
    // Ir a pestaña de estadísticas
    await page.click('[data-testid="stats-tab"]');
    
    // Verificar métricas de productividad
    await expect(page.locator('[data-testid="consultations-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-satisfaction"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-consultation-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-generated"]')).toBeVisible();
  });
});
