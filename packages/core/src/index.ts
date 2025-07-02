/**
 * @altamedica/core - Core utilities and shared functionality
 *
 * This package provides essential utilities, hooks, and components
 * that are shared across the ALTAMEDICA platform.
 */

// Utils
export * from "./utils/cn";
export * from "./utils/validation";
export * from "./utils/formatting";
export * from "./utils/storage";
export * from "./utils/medical-utils";

// Hooks
export * from "./hooks/useLocalStorage";
export * from "./hooks/useDebounce";
export * from "./hooks/useMediaQuery";
export * from "./hooks/useMedical";

// Components
export * from "./components/Button";
export * from "./components/Card";
export * from "./components/Loading";
export * from "./components/MedicalPerformanceMonitor";

// Middleware
export * from "./middleware/ApiOptimizationMiddleware";

// Types
export * from "./types/common";
export * from "./types/api";

// Constants
export * from "./constants/medical";
export * from "./constants/ui";
