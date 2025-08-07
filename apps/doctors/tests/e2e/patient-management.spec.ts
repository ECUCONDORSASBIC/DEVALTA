import { test, expect } from '@playwright/test';

/**
 * 🧪 PRUEBAS E2E PARA EL FLUJO DE GESTIÓN DE PACIENTES (DOCTORS APP)
 *
 * @group e2e
 */

// URL base para la aplicación de doctores
const BASE_URL = 'http://localhost:3002'; // Asumiendo que doctors app corre en el puerto 3002

test.describe('Flujo de Gestión de Pacientes del Doctor', () => {

  // Navegar a la página antes de cada prueba
  test.beforeEach(async ({ page }) => {
    // Ahora navegamos directamente ya que el usuario está autenticado
    await page.goto('/dashboard/my-patients');
    
    // Verificar que estamos en la página correcta y que cargó
    await page.waitForLoadState('networkidle');
    
    // Esperar a que el componente principal se cargue
    // Podemos ser más flexibles con el selector
    await expect(
      page.locator('h1').filter({ hasText: /mis pacientes/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test('debe mostrar la lista de pacientes y el total', async ({ page }) => {
    // Verificar el título (case insensitive para mayor robustez)
    await expect(page.locator('h1').filter({ hasText: /mis pacientes/i })).toBeVisible();

    // Verificar que el contador de total de pacientes sea visible
    await expect(page.locator('text=/total.*pacientes/i')).toBeVisible({ timeout: 10000 });

    // Esperar a que las tarjetas de pacientes se carguen o que aparezca un mensaje de "no hay pacientes"
    await page.waitForFunction(() => {
      // Buscar tarjetas de pacientes O mensaje de "no hay pacientes"
      const hasCards = document.querySelector('[class*="card"], [class*="patient"]');
      const hasEmptyMessage = document.querySelector('text=/no.*pacientes/i, text=/no se encontraron/i');
      return hasCards || hasEmptyMessage;
    }, { timeout: 20000 });

    // Si hay pacientes, verificar que se muestren correctamente
    const patientCards = page.locator('[class*="card"], [class*="patient"]').first();
    const emptyMessage = page.locator('text=/no.*pacientes/i, text=/no se encontraron/i');
    
    const hasCards = await patientCards.isVisible().catch(() => false);
    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    
    // Debe haber al menos una de las dos cosas: tarjetas o mensaje vacío
    expect(hasCards || hasEmpty).toBe(true);
    
    if (hasCards) {
      console.log('✅ Pacientes encontrados en la lista');
    } else {
      console.log('ℹ️ No hay pacientes en la lista (estado válido)');
    }
  });

  test('debe permitir buscar un paciente y mostrar los resultados correctos', async ({ page }) => {
    const searchTerm = 'Juan Perez'; // Paciente que debería existir en los datos de prueba

    // Llenar el campo de búsqueda
    await page.locator('input[placeholder*="Buscar paciente"]').fill(searchTerm);

    // Hacer clic en el botón de búsqueda
    await page.locator('button:has-text("Buscar")').click();

    // Esperar a que la búsqueda termine (ej. mostrando un spinner o actualizando la lista)
    await page.waitForLoadState('networkidle');

    // Verificar que solo se muestren las tarjetas de los pacientes que coinciden
    const visibleCards = page.locator('div[class*="PatientCard"]');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0); // Al menos un resultado

    // Verificar que todas las tarjetas visibles contengan el término de búsqueda
    for (const card of await visibleCards.all()) {
      const cardText = await card.textContent();
      expect(cardText).toContain(searchTerm.split(' ')[0]); // Verificar nombre o apellido
    }
  });

  test('debe mostrar los detalles de un paciente al hacer clic en su tarjeta', async ({ page }) => {
    // Hacer clic en la primera tarjeta de paciente de la lista
    const firstPatientCard = page.locator('div[class*="PatientCard"]').first();
    const patientName = await firstPatientCard.locator('h3').textContent();
    
    await firstPatientCard.click();

    // Verificar que el panel de detalles se actualice con la información correcta
    const detailsPanel = page.locator('div[class*="PatientDetails"]');
    await expect(detailsPanel).toBeVisible();

    // El nombre en los detalles debe coincidir con el de la tarjeta
    const detailsTitle = detailsPanel.locator('h3');
    await expect(detailsTitle).toHaveText(patientName!);
    
    // Verificar que se muestren campos clave como Email y Teléfono
    await expect(detailsPanel.locator('p:has-text("@")')).toBeVisible(); // Un email
    await expect(detailsPanel.locator('text=/Teléfono:/')).toBeVisible();
  });

  test('debe permitir limpiar la búsqueda y volver a la lista completa', async ({ page }) => {
    const initialCount = await page.locator('div[class*="PatientCard"]').count();
    
    // Realizar una búsqueda que devuelva menos resultados
    await page.locator('input[placeholder*="Buscar paciente"]').fill('Ana Gomez');
    await page.locator('button:has-text("Buscar")').click();
    await page.waitForLoadState('networkidle');

    const searchCount = await page.locator('div[class*="PatientCard"]').count();
    expect(searchCount).toBeLessThan(initialCount);

    // Hacer clic en el botón "Limpiar"
    await page.locator('button:has-text("Limpiar")').click();
    await page.waitForLoadState('networkidle');

    // Verificar que el número de pacientes vuelve a ser el inicial
    const finalCount = await page.locator('div[class*="PatientCard"]').count();
    expect(finalCount).toBe(initialCount);
  });
});
