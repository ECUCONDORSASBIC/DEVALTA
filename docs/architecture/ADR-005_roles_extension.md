# ADR-005: Extensión de Catálogo de Roles Profesionales Técnicos

*Estado*: Propuesto  
*Fecha*: 2025-07-02  
*Autores*: Equipo de Plataforma AltaMédica  

## Contexto

El crecimiento de la plataforma exige admitir nuevos perfiles técnicos que colaboran en procesos clínicos avanzados (p. ej. análisis genómico, operación de telemedicina, IA clínica).  Hasta ahora sólo existían los roles `admin`, `doctor`, `patient`, `staff` (y variantes internas como `nurse` y `receptionist`).  Estos resultan insuficientes para cubrir workflows especializados ni permiten aplicar el principio de **mínimo privilegio**.

Stakeholders de negocio (Dirección Médica y Operaciones) y Seguridad TI solicitaron la ampliación del catálogo para:

* Delegar responsabilidades especializadas sin otorgar permisos excesivos.
* Trazar auditoría granular sobre acciones sensibles (p. ej. entrenamiento de modelos de IA o publicación de resultados genómicos).
* Preparar la integración con futuros módulos (telemedicina, laboratorio molecular, analítica avanzada, IA generativa).

## Decisión

Se crea un nuevo **Catálogo de Profesionales Técnicos** con los roles detallados en la tabla siguiente.  Cada rol incluye:

* `code`: identificador interno (kebab-case).
* `name`: etiqueta visible (es-ES).
* `description`: propósito y responsabilidades.
* `default_permissions`: permisos asignados al crear el usuario (se pueden ampliar/revocar explícitamente).
* `scope`: alcance de datos y recursos al que puede acceder por defecto.

| code | name | description | default_permissions | scope |
|------|------|-------------|---------------------|-------|
| bioinformatician | Bioinformático/a | Analiza datos ómicos (secuenciación, transcriptómica) y genera informes clínicos. | read_patient_data, read_lab_results, write_lab_reports, manage_genomic_files | Datos del paciente asignado y repositorio de laboratorio molecular |
| telemedicine-technician | Técnico/a de Telemedicina | Configura equipos, asiste al personal clínico y monitoriza sesiones de teleconsulta. | read_patient_data, manage_video_session, schedule_appointments, device_diagnostics | Pacientes en sesiones programadas y dispositivos vinculados |
| clinical-ai-engineer | Ingeniero/a de IA Clínica | Entrena, valida y despliega modelos AI usados en diagnóstico y automatización. | read_aggregated_data, manage_ai_models, publish_ai_models, view_audit_logs | Datos anonimizados, entorno de ML, repositorio de modelos |
| radiology-technician | Técnico/a de Radiología | Opera equipos de imagen y sube estudios PACS; no interpreta resultados. | read_patient_data, upload_imaging, manage_imaging_devices | Pacientes asignados al servicio de imagen |
| genetic-counselor | Consejero/a Genético/a | Explica a pacientes los resultados genéticos y planifica seguimiento. | read_patient_data, read_lab_results, create_clinical_notes | Pacientes propios / remitidos |
| medical-data-engineer | Ingeniero/a de Datos Médicos | Gestiona pipelines ETL, calidad y gobernanza de datos. | read_all_data_catalog, manage_etl_jobs, manage_metadata | Datos de toda la organización (nivel de dataset, no PHI detallado) |
| clinical-research-coordinator | Coordinador/a de Investigación Clínica | Gestiona estudios, consentimientos y seguimiento de sujetos. | read_patient_data, manage_trial_records, export_deidentified_data | Pacientes enrolados en estudios |
| device-integration-specialist | Especialista Integración Dispositivos | Integra dispositivos IoMT & wearables con la plataforma. | register_devices, manage_device_firmware, device_diagnostics | Dispositivos y métricas time-series |

### Niveles de acceso y alineación con Seguridad

1. **PHI detallada** sólo accesible a roles con contacto directo paciente (bioinformatician, telemedicine-technician, radiology-technician, genetic-counselor).
2. **Datos anonimizados** para roles analíticos (clinical-ai-engineer, medical-data-engineer).
3. **Permisos de despliegue** (manage_ai_models, manage_etl_jobs) requieren flujo de aprobación (4-eyes) definido por Seguridad.
4. Todos los roles se registran en IAM con política *least-privilege*; ningún nuevo rol posee `write_patient_data` salvo indicación explícita.

## Consecuencias

* Se habilita la asignación precisa de privilegios, reduciendo riesgo de violaciones de datos.
* Auditoría podrá trazar con mayor granularidad las acciones técnicas.
* Los módulos nuevos (genómica, telemedicina, IA) dispondrán de roles nativos listos para usar.
* Será necesario:
  * Actualizar esquemas de tipos (`UserRoleSchema` y enumeraciones TS).
  * Crear políticas IAM y plantillas de permisos en el servicio Auth.
  * Adaptar UI de administración para mostrar y asignar estos roles.

## Motivos de inclusión de cada rol

* **Bioinformático/a**: demanda creciente de pruebas genómicas; requiere acceso a BAM/VCF y generación de interpretaciones.
* **Técnico/a de Telemedicina**: operación de cabinas y periféricos médicos remotos.
* **Ingeniero/a de IA Clínica**: gobernanza de modelos regulados (EU MDR/US FDA).
* **Técnico/a de Radiología**: carga de estudios a PACS sin privilegio de diagnóstico.
* **Consejero/a Genético/a**: comunicación especializada de resultados sensibles.
* **Ingeniero/a de Datos Médicos**: calidad y lineage para analítica reglamentaria.
* **Coordinador/a de Investigación Clínica**: cumplimiento GCP, control de consentimientos.
* **Especialista Integración Dispositivos**: influx de dispositivos IoMT y wearables.

---

> Este ADR se almacenará en `docs/architecture/ADR-005_roles_extension.md` y forma parte del plan de ampliación 2025-Q3.

