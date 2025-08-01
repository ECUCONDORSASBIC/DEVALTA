/**
 * @altamedica/core - Core utilities and shared functionality
 *
 * This package provides essential utilities, hooks, and components
 * that are shared across the ALTAMEDICA platform.
 */

// Utils
export * from "./utils";

// Hooks
export * from "./hooks";

// Components
export * from "./components/Button";
export * from "./components/Card";
export * from "./components/Loading";
export { default as MedicalPerformanceMonitor, MedicalPerformanceDashboard } from "./components/MedicalPerformanceMonitor";

// Middleware
export * from "./middleware/ApiOptimizationMiddleware";

// Types
export * from "./types/common";
export * from "./types/api";
export type { 
  PacienteBase, 
  CitaMedica, 
  TipoCita, 
  EstadoCita, 
  ProvinciaArgentina 
} from "@altamedica/types";

// Constants
export * from "./constants/medical";
export * from "./constants/ui";
