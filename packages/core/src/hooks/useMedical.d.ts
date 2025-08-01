import { PacienteBase, CitaMedica, ParametrosPaginacion, RegistroAuditoria } from '@altamedica/types';
export declare const usePacientes: () => {
    pacientes: PacienteBase[];
    cargando: boolean;
    error: string | null;
    totalPacientes: number;
    cargarPacientes: (params: ParametrosPaginacion) => Promise<void>;
    buscarPacientes: (criterios: {
        nombres?: string;
        apellidos?: string;
        numeroDocumento?: string;
        numeroHistoriaClinica?: string;
        fechaNacimientoDesde?: Date;
        fechaNacimientoHasta?: Date;
    }) => Promise<void>;
    crearPaciente: (datosNuevoPaciente: Omit<PacienteBase, "id" | "fechaCreacion" | "fechaUltimaActualizacion">) => Promise<PacienteBase>;
    actualizarPaciente: (pacienteId: string, datosActualizados: Partial<PacienteBase>) => Promise<PacienteBase>;
};
export declare const useCitasMedicas: () => {
    citas: CitaMedica[];
    cargando: boolean;
    error: string | null;
    cargarCitasPorFecha: (fechaInicio: Date, fechaFin: Date, medicoId?: string) => Promise<void>;
    programarCita: (datosCita: Omit<CitaMedica, "id" | "fechaCreacion" | "fechaUltimaModificacion">) => Promise<CitaMedica>;
    cancelarCita: (citaId: string, motivoCancelacion: string) => Promise<CitaMedica>;
    verificarDisponibilidad: (medicoId: string, fecha: Date, duracionMinutos: number) => Promise<boolean>;
};
export declare const useAuditoriaHIPAA: () => {
    registrosAuditoria: RegistroAuditoria[];
    cargando: boolean;
    registrarEvento: (evento: Omit<RegistroAuditoria, "timestamp">) => Promise<void>;
    obtenerRegistros: (fechaInicio: Date, fechaFin: Date, usuarioId?: string) => Promise<void>;
};
//# sourceMappingURL=useMedical.d.ts.map