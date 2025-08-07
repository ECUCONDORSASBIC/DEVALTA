# AltaMédica - Herramientas de Testing Python + Selenium

## 🎯 Descripción General

Suite completa de herramientas de testing automatizado para la plataforma médica AltaMédica, implementada con Python + Selenium.

## 🛠️ Herramientas Incluidas

### 1. selenium_testing_suite.py
**Suite principal de testing con Selenium**
- Testing de disponibilidad de aplicaciones
- Verificación de elementos críticos de UI
- Métricas de performance web
- Compliance médico HIPAA
- Generación de reportes automáticos

**Uso:**
```bash
python selenium_testing_suite.py --headless --timeout 30
python selenium_testing_suite.py --app web-app
python selenium_testing_suite.py --continuous  # Monitoreo continuo
```

### 2. visual_regression_tester.py  
**Testing visual y detección de regresiones**
- Capturas de pantalla automatizadas
- Comparación visual entre versiones
- Detección de cambios visuales
- Reportes HTML con imágenes

**Uso:**
```bash
python visual_regression_tester.py
```

### 3. medical_workflow_tester.py
**Testing de flujos médicos específicos**
- Reserva de citas médicas
- Sesiones de telemedicina
- Acceso a registros médicos
- Flujos de emergencia médica
- Compliance HIPAA automatizado

**Uso:**
```bash
python medical_workflow_tester.py
```

### 4. run_altamedica_tests.py
**Ejecutor principal de todos los tests**
```bash
python run_altamedica_tests.py --suite all
python run_altamedica_tests.py --suite selenium
python run_altamedica_tests.py --suite visual
python run_altamedica_tests.py --suite medical
```

## 📦 Instalación

### Requisitos
- Python 3.7+
- Google Chrome instalado
- Sistema operativo: Windows, macOS, Linux

### Instalación Automática
```bash
python setup_python_testing.py
```

### Instalación Manual
```bash
pip install selenium pillow numpy requests beautifulsoup4 lxml
```

## 🏥 Configuración Médica

### Aplicaciones AltaMédica Testeadas
- **web-app (3000)**: Gateway central y autenticación
- **api-server (3001)**: Backend APIs y WebSocket
- **doctors (3002)**: Portal médicos profesionales  
- **patients (3003)**: Portal pacientes
- **admin (3005)**: Panel administrativo
- **companies (3004)**: Portal empresas B2B

### Usuarios de Prueba
Configurados en `altamedica_testing_config.json`:
- **Paciente**: patient.test@altamedica.com
- **Doctor**: doctor.test@altamedica.com  
- **Admin**: admin.test@altamedica.com

### Compliance Médico
- ✅ **HIPAA**: Verificación automática de compliance
- ✅ **WebRTC**: Testing de videollamadas médicas
- ✅ **Emergencias**: Tiempo de respuesta < 3 segundos
- ✅ **Accesibilidad**: Compliance WCAG 2.1 AA

## 📊 Reportes Generados

### Ubicaciones de Reportes
- `selenium_reports/`: Reportes JSON de testing general
- `visual_testing/reports/`: Reportes HTML de testing visual
- `medical_testing_results/`: Reportes de flujos médicos
- `selenium_screenshots/`: Capturas de pantalla
- `visual_testing/baselines/`: Imágenes baseline para comparación

### Tipos de Reportes
1. **JSON detallado**: Datos completos para análisis
2. **HTML visual**: Reportes con imágenes y gráficos
3. **Screenshots**: Evidencia visual de tests
4. **Compliance médico**: Análisis específico HIPAA

## 🚀 Ejecución en Producción

### Testing Continuo
```bash
python selenium_testing_suite.py --continuous
```

### Testing Programado (cron)
```bash
# Cada hora
0 * * * * cd /path/to/scripts && python run_altamedica_tests.py

# Diario a las 2 AM
0 2 * * * cd /path/to/scripts && python run_altamedica_tests.py --suite all
```

### Integración CI/CD
Agregar a pipeline de deployment:
```yaml
- name: Run AltaMédica Tests
  run: python run_altamedica_tests.py --suite all --headless
```

## 🔧 Solución de Problemas

### ChromeDriver Issues
```bash
# Verificar versión Chrome
google-chrome --version

# Descargar ChromeDriver compatible
# https://chromedriver.chromium.org/
```

### Timeouts en Testing
- Aumentar timeout: `--timeout 60`
- Verificar que apps estén iniciadas
- Comprobar puertos disponibles

### Errores de Selenium
- Verificar versión de Selenium: `pip show selenium`
- Actualizar: `pip install --upgrade selenium`
- Chrome en modo headless: `--headless`

## 🏥 Consideraciones Médicas

### Datos de Prueba
- **NUNCA** usar datos médicos reales
- Usar solo usuarios de prueba configurados
- Datos anonymizados exclusivamente

### Compliance y Seguridad
- Tests diseñados para verificar HIPAA
- Auditoría automática de accesos
- Verificación de encriptación HTTPS
- Control de accesos por roles

### Performance Médica
- **Emergencias**: < 3 segundos respuesta
- **Telemedicina**: WebRTC funcional
- **Accesibilidad**: WCAG AA compliance
- **Disponibilidad**: 99.9% uptime target

---

**Autor**: Eduardo Marques MD + Claude AI  
**Fecha**: 2025-08-01  
**Versión**: 1.0.0  
**Licencia**: MIT  
