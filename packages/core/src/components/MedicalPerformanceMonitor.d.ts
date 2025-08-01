import React from 'react';
interface PerformanceMetrics {
    fcp: number | null;
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    apiResponseTime: Record<string, number[]>;
    componentRenderTime: Record<string, number[]>;
    cacheHitRate: Record<string, number>;
    errorRate: Record<string, number>;
    memoryUsage: number;
    networkLatency: number;
    bundleSize: number;
    pageLoadTime: number;
    timeToInteractive: number;
    medicalWorkflowCompletionTime: Record<string, number[]>;
    sessionStart: number;
    lastUpdate: number;
}
interface MedicalPerformanceConfig {
    enableRealTimeMonitoring: boolean;
    enableWebVitals: boolean;
    enableApiMetrics: boolean;
    enableErrorTracking: boolean;
    reportingInterval: number;
    maxMetricsHistory: number;
    medicalWorkflows: string[];
    performanceThresholds: {
        lcp: number;
        fid: number;
        cls: number;
        apiResponse: number;
        errorRate: number;
    };
}
declare const DEFAULT_CONFIG: MedicalPerformanceConfig;
declare class MedicalPerformanceMonitor {
    private static instance;
    private metrics;
    private config;
    private observers;
    private reportingInterval;
    private workflowTimers;
    constructor(config?: MedicalPerformanceConfig);
    static getInstance(config?: MedicalPerformanceConfig): MedicalPerformanceMonitor;
    private initializeMetrics;
    private setupPerformanceObservers;
    private startReporting;
    private updateMetrics;
    private generatePerformanceReport;
    private checkThresholdViolations;
    private sendToMonitoringSystem;
    recordApiCall(endpoint: string, duration: number, success: boolean): void;
    recordComponentRender(componentName: string, renderTime: number): void;
    startMedicalWorkflow(workflowName: string): void;
    completeMedicalWorkflow(workflowName: string): number;
    recordCacheHit(cacheType: string, hit: boolean): void;
    getMetrics(): PerformanceMetrics;
    getAverageApiResponseTime(endpoint?: string): number;
    cleanup(): void;
}
export declare const useMedicalPerformance: (componentName: string, config?: Partial<MedicalPerformanceConfig>) => {
    metrics: PerformanceMetrics | null;
    recordApiCall: (endpoint: string, duration: number, success: boolean) => void;
    startWorkflow: (workflowName: string) => void;
    completeWorkflow: (workflowName: string) => number;
    recordCacheHit: (cacheType: string, hit: boolean) => void;
    getMetrics: () => PerformanceMetrics | null;
    getAverageApiResponseTime: ((endpoint?: string) => number) | undefined;
};
export declare const MedicalPerformanceDashboard: React.FC<{
    minimized?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}>;
export default MedicalPerformanceMonitor;
export { DEFAULT_CONFIG as defaultPerformanceConfig };
export type { PerformanceMetrics, MedicalPerformanceConfig };
//# sourceMappingURL=MedicalPerformanceMonitor.d.ts.map