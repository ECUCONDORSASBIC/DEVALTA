import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "../utils/cn";
export const Button = React.forwardRef(({ className, variant = "primary", size = "md", loading = false, icon, iconPosition = "left", fullWidth = false, rounded = false, disabled = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
    };
    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
    };
    const widthClass = fullWidth ? "w-full" : "";
    const roundedClass = rounded ? "rounded-full" : "rounded-md";
    return (_jsxs("button", { className: cn(baseClasses, variants[variant], sizes[size], widthClass, roundedClass, className), ref: ref, disabled: disabled || loading, ...props, children: [loading && (_jsxs("svg", { className: "mr-2 h-4 w-4 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), !loading && icon && iconPosition === "left" && (_jsx("span", { className: "mr-2", children: icon })), children, !loading && icon && iconPosition === "right" && (_jsx("span", { className: "ml-2", children: icon }))] }));
});
Button.displayName = "Button";
export const MedicalButton = (props) => {
    return _jsx(Button, { ...props, variant: "primary" });
};
export const EmergencyButton = (props) => {
    return _jsx(Button, { ...props, variant: "danger" });
};
export const SuccessButton = (props) => {
    return _jsx(Button, { ...props, variant: "success" });
};
export const WarningButton = (props) => {
    return _jsx(Button, { ...props, variant: "warning" });
};
export default Button;
//# sourceMappingURL=Button.js.map