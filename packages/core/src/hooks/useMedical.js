import { useState, useCallback } from 'react';
export const usePacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [totalPacientes, setTotalPacientes] = useState(0);
    const cargarPacientes = useCallback(async (params) => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch('/api/pacientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HIPAA-Audit': 'true'
                },
                body: JSON.stringify(params)
            });
            const datos = await respuesta.json();
            if (respuesta.ok) {
                setPacientes(datos.datos);
                setTotalPacientes(datos.totalElementos);
            }
            else {
                throw new Error('Error al cargar pacientes');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
        finally {
            setCargando(false);
        }
    }, []);
    const buscarPacientes = useCallback(async (criterios) => {
        setCargando(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(criterios).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value.toString());
                }
            });
            const respuesta = await fetch(`/api/pacientes/buscar?${queryParams}`, {
                headers: {
                    'X-HIPAA-Audit': 'true',
                    'X-Search-Reason': 'clinical_lookup'
                }
            });
            const datos = await respuesta.json();
            if (datos.exito) {
                setPacientes(datos.datos || []);
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error en búsqueda');
        }
        finally {
            setCargando(false);
        }
    }, []);
    const crearPaciente = useCallback(async (datosNuevoPaciente) => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch('/api/pacientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HIPAA-Audit': 'true',
                    'X-Action': 'create_patient'
                },
                body: JSON.stringify(datosNuevoPaciente)
            });
            const datos = await respuesta.json();
            if (datos.exito && datos.datos) {
                setPacientes(prev => [...prev, datos.datos]);
                return datos.datos;
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear paciente');
            throw err;
        }
        finally {
            setCargando(false);
        }
    }, []);
    const actualizarPaciente = useCallback(async (pacienteId, datosActualizados) => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch(`/api/pacientes/${pacienteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HIPAA-Audit': 'true',
                    'X-Action': 'update_patient'
                },
                body: JSON.stringify(datosActualizados)
            });
            const datos = await respuesta.json();
            if (datos.exito && datos.datos) {
                setPacientes(prev => prev.map(p => p.id === pacienteId ? datos.datos : p));
                return datos.datos;
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar paciente');
            throw err;
        }
        finally {
            setCargando(false);
        }
    }, []);
    return {
        pacientes,
        cargando,
        error,
        totalPacientes,
        cargarPacientes,
        buscarPacientes,
        crearPaciente,
        actualizarPaciente
    };
};
export const useCitasMedicas = () => {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const cargarCitasPorFecha = useCallback(async (fechaInicio, fechaFin, medicoId) => {
        setCargando(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString()
            });
            if (medicoId) {
                params.append('medicoId', medicoId);
            }
            const respuesta = await fetch(`/api/citas?${params}`, {
                headers: {
                    'X-HIPAA-Audit': 'true'
                }
            });
            const datos = await respuesta.json();
            if (datos.exito) {
                setCitas(datos.datos || []);
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar citas');
        }
        finally {
            setCargando(false);
        }
    }, []);
    const programarCita = useCallback(async (datosCita) => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch('/api/citas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HIPAA-Audit': 'true',
                    'X-Action': 'schedule_appointment'
                },
                body: JSON.stringify(datosCita)
            });
            const datos = await respuesta.json();
            if (datos.exito && datos.datos) {
                setCitas(prev => [...prev, datos.datos]);
                return datos.datos;
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al programar cita');
            throw err;
        }
        finally {
            setCargando(false);
        }
    }, []);
    const cancelarCita = useCallback(async (citaId, motivoCancelacion) => {
        setCargando(true);
        setError(null);
        try {
            const respuesta = await fetch(`/api/citas/${citaId}/cancelar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HIPAA-Audit': 'true',
                    'X-Action': 'cancel_appointment'
                },
                body: JSON.stringify({ motivoCancelacion })
            });
            const datos = await respuesta.json();
            if (datos.exito && datos.datos) {
                setCitas(prev => prev.map(c => c.id === citaId ? datos.datos : c));
                return datos.datos;
            }
            else {
                throw new Error(datos.mensaje);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cancelar cita');
            throw err;
        }
        finally {
            setCargando(false);
        }
    }, []);
    const verificarDisponibilidad = useCallback(async (medicoId, fecha, duracionMinutos) => {
        try {
            const respuesta = await fetch('/api/citas/disponibilidad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    medicoId,
                    fecha: fecha.toISOString(),
                    duracionMinutos
                })
            });
            const datos = await respuesta.json();
            return datos.datos?.disponible || false;
        }
        catch {
            return false;
        }
    }, []);
    return {
        citas,
        cargando,
        error,
        cargarCitasPorFecha,
        programarCita,
        cancelarCita,
        verificarDisponibilidad
    };
};
export const useAuditoriaHIPAA = () => {
    const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
    const [cargando, setCargando] = useState(false);
    const registrarEvento = useCallback(async (evento) => {
        try {
            await fetch('/api/auditoria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...evento,
                    timestamp: new Date().toISOString()
                })
            });
        }
        catch (error) {
            console.error('Error al registrar evento de auditoría:', error);
        }
    }, []);
    const obtenerRegistros = useCallback(async (fechaInicio, fechaFin, usuarioId) => {
        setCargando(true);
        try {
            const params = new URLSearchParams({
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString()
            });
            if (usuarioId) {
                params.append('usuarioId', usuarioId);
            }
            const respuesta = await fetch(`/api/auditoria?${params}`);
            const datos = await respuesta.json();
            if (datos.exito) {
                setRegistrosAuditoria(datos.datos || []);
            }
        }
        catch (error) {
            console.error('Error al obtener registros:', error);
        }
        finally {
            setCargando(false);
        }
    }, []);
    return {
        registrosAuditoria,
        cargando,
        registrarEvento,
        obtenerRegistros
    };
};
//# sourceMappingURL=useMedical.js.map