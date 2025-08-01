import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "../utils/cn";
export const Loading = ({ size = "md", variant = "spinner", color = "primary", text, fullScreen = false, overlay = false, className, }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
    };
    const colorClasses = {
        primary: "text-blue-600",
        secondary: "text-gray-600",
        white: "text-white",
        gray: "text-gray-400",
    };
    const renderSpinner = () => (_jsx("div", { className: cn("animate-spin", sizeClasses[size], colorClasses[color], className), children: _jsxs("svg", { fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) }));
    const renderDots = () => (_jsxs("div", { className: cn("flex space-x-1", sizeClasses[size], className), children: [_jsx("div", { className: cn("animate-bounce bg-current rounded-full", colorClasses[color]), style: { animationDelay: "0ms" } }), _jsx("div", { className: cn("animate-bounce bg-current rounded-full", colorClasses[color]), style: { animationDelay: "150ms" } }), _jsx("div", { className: cn("animate-bounce bg-current rounded-full", colorClasses[color]), style: { animationDelay: "300ms" } })] }));
    const renderPulse = () => (_jsx("div", { className: cn("animate-pulse bg-current rounded", sizeClasses[size], colorClasses[color], className) }));
    const renderBars = () => (_jsxs("div", { className: `flex space-x-1 ${sizeClasses[size]}`, children: [_jsx("div", { className: `w-1 bg-current animate-pulse ${colorClasses[color]}`, style: { animationDelay: "0ms" } }), _jsx("div", { className: `w-1 bg-current animate-pulse ${colorClasses[color]}`, style: { animationDelay: "150ms" } }), _jsx("div", { className: `w-1 bg-current animate-pulse ${colorClasses[color]}`, style: { animationDelay: "300ms" } }), _jsx("div", { className: `w-1 bg-current animate-pulse ${colorClasses[color]}`, style: { animationDelay: "450ms" } })] }));
    const renderMedical = () => (_jsxs("div", { className: `relative ${sizeClasses[size]}`, children: [_jsx("div", { className: `absolute inset-0 border-2 border-current rounded-full animate-ping opacity-75 ${colorClasses[color]}` }), _jsx("div", { className: `absolute inset-0 border-2 border-current rounded-full ${colorClasses[color]}` }), _jsx("div", { className: `absolute inset-2 bg-current rounded-full animate-pulse ${colorClasses[color]}` })] }));
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return renderDots();
            case "pulse":
                return renderPulse();
            case "bars":
                return renderBars();
            case "medical":
                return renderMedical();
            default:
                return renderSpinner();
        }
    };
    const content = (_jsxs("div", { className: "flex flex-col items-center justify-center space-y-2", children: [renderLoader(), text && (_jsx("p", { className: `text-sm font-medium ${colorClasses[color]}`, children: text }))] }));
    if (fullScreen) {
        return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90", children: content }));
    }
    if (overlay) {
        return (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75", children: content }));
    }
    return content;
};
export const MedicalLoading = (props) => {
    return (_jsx(Loading, { variant: "medical", color: "primary", text: "Cargando datos m\u00E9dicos...", ...props }));
};
export const PatientLoading = (props) => {
    return (_jsx(Loading, { variant: "spinner", color: "primary", text: "Cargando informaci\u00F3n del paciente...", ...props }));
};
export const AppointmentLoading = (props) => {
    return (_jsx(Loading, { variant: "dots", color: "primary", text: "Cargando citas...", ...props }));
};
export const PrescriptionLoading = (props) => {
    return (_jsx(Loading, { variant: "medical", color: "primary", text: "Cargando prescripciones...", ...props }));
};
export const LabResultLoading = (props) => {
    return (_jsx(Loading, { variant: "bars", color: "primary", text: "Cargando resultados...", ...props }));
};
export const LoadingState = ({ loading, children }) => {
    if (loading) {
        return _jsx(Loading, {});
    }
    return _jsx(_Fragment, { children: children });
};
export const LoadingOverlay = ({ loading, children }) => {
    return (_jsxs("div", { className: "relative", children: [children, loading && _jsx(Loading, { overlay: true })] }));
};
export const Skeleton = ({ className = "", }) => {
    return _jsx("div", { className: `animate-pulse bg-gray-200 rounded ${className}` });
};
export const SkeletonText = ({ lines = 1, className = "", }) => {
    return (_jsx("div", { className: `space-y-2 ${className}`, children: Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { className: "h-4" }, i))) }));
};
export const SkeletonCard = () => {
    return (_jsxs("div", { className: "p-4 border border-gray-200 rounded-lg", children: [_jsx(Skeleton, { className: "h-6 w-3/4 mb-2" }), _jsx(SkeletonText, { lines: 3 }), _jsxs("div", { className: "flex space-x-2 mt-4", children: [_jsx(Skeleton, { className: "h-8 w-20" }), _jsx(Skeleton, { className: "h-8 w-20" })] })] }));
};
export default Loading;
export const LoadingSpinner = Loading;
export const LoadingDots = (props) => (_jsx(Loading, { ...props, variant: "dots" }));
export const LoadingPulse = (props) => (_jsx(Loading, { ...props, variant: "pulse" }));
//# sourceMappingURL=Loading.js.map