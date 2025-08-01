'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect, useCallback, memo } from 'react';
const DEFAULT_CONFIG = {
    enableRealTimeMonitoring: true,
    enableWebVitals: true,
    enableApiMetrics: true,
    enableErrorTracking: true,
    reportingInterval: 10000,
    maxMetricsHistory: 100,
    medicalWorkflows: [
        'patient_search',
        'appointment_booking',
        'medical_record_access',
        'prescription_creation',
        'telemedicine_session'
    ],
    performanceThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        apiResponse: 1000,
        errorRate: 1
    }
};
class MedicalPerformanceMonitor {
    constructor(config = DEFAULT_CONFIG) {
        this.reportingInterval = null;
        this.workflowTimers = new Map();
        this.config = config;
        this.metrics = this.initializeMetrics();
        this.observers = new Map();
        if (typeof window !== 'undefined') {
            this.setupPerformanceObservers();
            this.startReporting();
        }
    }
    static getInstance(config) {
        if (!MedicalPerformanceMonitor.instance) {
            MedicalPerformanceMonitor.instance = new MedicalPerformanceMonitor(config);
        }
        return MedicalPerformanceMonitor.instance;
    }
    initializeMetrics() {
        return {
            fcp: null,
            lcp: null,
            fid: null,
            cls: null,
            apiResponseTime: {},
            componentRenderTime: {},
            cacheHitRate: {},
            errorRate: {},
            memoryUsage: 0,
            networkLatency: 0,
            bundleSize: 0,
            pageLoadTime: 0,
            timeToInteractive: 0,
            medicalWorkflowCompletionTime: {},
            sessionStart: Date.now(),
            lastUpdate: Date.now()
        };
    }
    setupPerformanceObservers() {
        if (this.config.enableWebVitals && 'PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                this.updateMetrics();
            });
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.set('lcp', lcpObserver);
            }
            catch (e) {
                console.warn('[MEDICAL-PERFORMANCE] LCP observer not supported');
            }
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    this.metrics.fcp = fcpEntry.startTime;
                    this.updateMetrics();
                }
            });
            try {
                fcpObserver.observe({ entryTypes: ['paint'] });
                this.observers.set('fcp', fcpObserver);
            }
            catch (e) {
                console.warn('[MEDICAL-PERFORMANCE] FCP observer not supported');
            }
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                this.updateMetrics();
            });
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('cls', clsObserver);
            }
            catch (e) {
                console.warn('[MEDICAL-PERFORMANCE] CLS observer not supported');
            }
            const navigationObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const navEntry = entries[0];
                if (navEntry) {
                    this.metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;
                    this.metrics.timeToInteractive = navEntry.domInteractive - navEntry.fetchStart;
                    this.updateMetrics();
                }
            });
            try {
                navigationObserver.observe({ entryTypes: ['navigation'] });
                this.observers.set('navigation', navigationObserver);
            }
            catch (e) {
                console.warn('[MEDICAL-PERFORMANCE] Navigation observer not supported');
            }
        }
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                this.metrics.memoryUsage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
                this.updateMetrics();
            }, 5000);
        }
    }
    startReporting() {
        if (this.config.enableRealTimeMonitoring) {
            this.reportingInterval = setInterval(() => {
                this.generatePerformanceReport();
            }, this.config.reportingInterval);
        }
    }
    updateMetrics() {
        this.metrics.lastUpdate = Date.now();
    }
    generatePerformanceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.metrics.sessionStart,
            metrics: { ...this.metrics },
            thresholds: this.config.performanceThresholds,
            violations: this.checkThresholdViolations()
        };
        console.log('[MEDICAL-PERFORMANCE-REPORT]', report);
        this.sendToMonitoringSystem(report);
    }
    checkThresholdViolations() {
        const violations = [];
        const { performanceThresholds } = this.config;
        if (this.metrics.lcp && this.metrics.lcp > performanceThresholds.lcp) {
            violations.push(`LCP excede threshold: ${this.metrics.lcp}ms > ${performanceThresholds.lcp}ms`);
        }
        if (this.metrics.fid && this.metrics.fid > performanceThresholds.fid) {
            violations.push(`FID excede threshold: ${this.metrics.fid}ms > ${performanceThresholds.fid}ms`);
        }
        if (this.metrics.cls && this.metrics.cls > performanceThresholds.cls) {
            violations.push(`CLS excede threshold: ${this.metrics.cls} > ${performanceThresholds.cls}`);
        }
        return violations;
    }
    sendToMonitoringSystem(report) {
        if (report.violations.length > 0) {
            console.warn('[MEDICAL-PERFORMANCE-ALERT] Performance violations detected:', report.violations);
        }
    }
    recordApiCall(endpoint, duration, success) {
        if (!this.config.enableApiMetrics)
            return;
        if (!this.metrics.apiResponseTime[endpoint]) {
            this.metrics.apiResponseTime[endpoint] = [];
        }
        this.metrics.apiResponseTime[endpoint].push(duration);
        if (this.metrics.apiResponseTime[endpoint].length > this.config.maxMetricsHistory) {
            this.metrics.apiResponseTime[endpoint].shift();
        }
        if (!success) {
            if (!this.metrics.errorRate[endpoint]) {
                this.metrics.errorRate[endpoint] = 0;
            }
            this.metrics.errorRate[endpoint]++;
        }
        this.updateMetrics();
    }
    recordComponentRender(componentName, renderTime) {
        if (!this.metrics.componentRenderTime[componentName]) {
            this.metrics.componentRenderTime[componentName] = [];
        }
        this.metrics.componentRenderTime[componentName].push(renderTime);
        if (this.metrics.componentRenderTime[componentName].length > this.config.maxMetricsHistory) {
            this.metrics.componentRenderTime[componentName].shift();
        }
        this.updateMetrics();
    }
    startMedicalWorkflow(workflowName) {
        this.workflowTimers.set(workflowName, Date.now());
    }
    completeMedicalWorkflow(workflowName) {
        const startTime = this.workflowTimers.get(workflowName);
        if (!startTime)
            return 0;
        const duration = Date.now() - startTime;
        this.workflowTimers.delete(workflowName);
        if (!this.metrics.medicalWorkflowCompletionTime[workflowName]) {
            this.metrics.medicalWorkflowCompletionTime[workflowName] = [];
        }
        this.metrics.medicalWorkflowCompletionTime[workflowName].push(duration);
        if (this.metrics.medicalWorkflowCompletionTime[workflowName].length > this.config.maxMetricsHistory) {
            this.metrics.medicalWorkflowCompletionTime[workflowName].shift();
        }
        this.updateMetrics();
        return duration;
    }
    recordCacheHit(cacheType, hit) {
        if (!this.metrics.cacheHitRate[cacheType]) {
            this.metrics.cacheHitRate[cacheType] = 0;
        }
        const currentRate = this.metrics.cacheHitRate[cacheType];
        this.metrics.cacheHitRate[cacheType] = hit
            ? (currentRate + 1) / 2
            : currentRate / 2;
        this.updateMetrics();
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getAverageApiResponseTime(endpoint) {
        if (endpoint) {
            const times = this.metrics.apiResponseTime[endpoint];
            return times && times.length > 0
                ? times.reduce((sum, time) => sum + time, 0) / times.length
                : 0;
        }
        let totalTime = 0;
        let totalCalls = 0;
        Object.values(this.metrics.apiResponseTime).forEach(times => {
            totalTime += times.reduce((sum, time) => sum + time, 0);
            totalCalls += times.length;
        });
        return totalCalls > 0 ? totalTime / totalCalls : 0;
    }
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = null;
        }
        this.workflowTimers.clear();
    }
}
export const useMedicalPerformance = (componentName, config) => {
    const monitor = useRef(null);
    const [metrics, setMetrics] = useState(null);
    const renderStart = useRef(0);
    useEffect(() => {
        monitor.current = MedicalPerformanceMonitor.getInstance(config);
        setMetrics(monitor.current.getMetrics());
    }, [config]);
    useEffect(() => {
        renderStart.current = performance.now();
        return () => {
            if (monitor.current) {
                const renderTime = performance.now() - renderStart.current;
                monitor.current.recordComponentRender(componentName, renderTime);
            }
        };
    });
    const recordApiCall = useCallback((endpoint, duration, success) => {
        monitor.current?.recordApiCall(endpoint, duration, success);
    }, []);
    const startWorkflow = useCallback((workflowName) => {
        monitor.current?.startMedicalWorkflow(workflowName);
    }, []);
    const completeWorkflow = useCallback((workflowName) => {
        return monitor.current?.completeMedicalWorkflow(workflowName) || 0;
    }, []);
    const recordCacheHit = useCallback((cacheType, hit) => {
        monitor.current?.recordCacheHit(cacheType, hit);
    }, []);
    const getMetrics = useCallback(() => {
        return monitor.current?.getMetrics() || null;
    }, []);
    return {
        metrics,
        recordApiCall,
        startWorkflow,
        completeWorkflow,
        recordCacheHit,
        getMetrics,
        getAverageApiResponseTime: monitor.current?.getAverageApiResponseTime.bind(monitor.current)
    };
};
export const MedicalPerformanceDashboard = memo(({ minimized = true, position = 'bottom-right' }) => {
    const [metrics, setMetrics] = useState(null);
    const [isVisible, setIsVisible] = useState(!minimized);
    useEffect(() => {
        const monitor = MedicalPerformanceMonitor.getInstance();
        const updateMetrics = () => {
            setMetrics(monitor.getMetrics());
        };
        updateMetrics();
        const interval = setInterval(updateMetrics, 1000);
        return () => clearInterval(interval);
    }, []);
    if (!metrics)
        return null;
    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4'
    };
    return (_jsx("div", { className: `fixed z-50 ${positionClasses[position] || positionClasses['bottom-right']}`, children: _jsxs("div", { className: `bg-white rounded-lg shadow-lg border transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-80 scale-95'}`, children: [_jsxs("div", { className: "p-2 bg-medical-primary text-white rounded-t-lg cursor-pointer flex items-center justify-between", onClick: () => setIsVisible(!isVisible), children: [_jsx("span", { className: "text-sm font-medium", children: "Performance" }), _jsx("span", { className: "text-xs", children: isVisible ? '−' : '+' })] }), isVisible && (_jsxs("div", { className: "p-3 space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "LCP:" }), _jsx("span", { className: metrics.lcp && metrics.lcp > 2500 ? 'text-red-600' : 'text-green-600', children: metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "FCP:" }), _jsx("span", { className: metrics.fcp && metrics.fcp > 1800 ? 'text-red-600' : 'text-green-600', children: metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "CLS:" }), _jsx("span", { className: metrics.cls && metrics.cls > 0.1 ? 'text-red-600' : 'text-green-600', children: metrics.cls ? metrics.cls.toFixed(3) : 'N/A' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Memory:" }), _jsxs("span", { className: metrics.memoryUsage > 0.8 ? 'text-red-600' : 'text-green-600', children: [(metrics.memoryUsage * 100).toFixed(1), "%"] })] })] }))] }) }));
});
MedicalPerformanceDashboard.displayName = 'MedicalPerformanceDashboard';
export default MedicalPerformanceMonitor;
export { DEFAULT_CONFIG as defaultPerformanceConfig };
//# sourceMappingURL=MedicalPerformanceMonitor.js.map