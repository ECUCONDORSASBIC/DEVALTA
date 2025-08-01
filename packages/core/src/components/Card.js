import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "../utils/cn";
export const Card = React.forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className), ...props, children: children })));
Card.displayName = "Card";
export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props, children: children })));
CardHeader.displayName = "CardHeader";
export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("p-6 pt-0", className), ...props, children: children })));
CardContent.displayName = "CardContent";
export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex items-center p-6 pt-0", className), ...props, children: children })));
CardFooter.displayName = "CardFooter";
export const MedicalCard = ({ children, ...props }) => {
    return _jsx(Card, { ...props, children: children });
};
export const EmergencyCard = ({ children, ...props }) => {
    return _jsx(Card, { ...props, children: children });
};
export const SuccessCard = ({ children, ...props }) => {
    return _jsx(Card, { ...props, children: children });
};
export const WarningCard = ({ children, ...props }) => {
    return _jsx(Card, { ...props, children: children });
};
export const PatientCard = ({ children, ...props }) => {
    return (_jsxs(MedicalCard, { ...props, children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Informaci\u00F3n del Paciente" }) }), _jsx(CardContent, { children: children })] }));
};
export const AppointmentCard = ({ children, ...props }) => {
    return (_jsxs(Card, { ...props, children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Cita M\u00E9dica" }) }), _jsx(CardContent, { children: children })] }));
};
export const PrescriptionCard = ({ children, ...props }) => {
    return (_jsxs(MedicalCard, { ...props, children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Prescripci\u00F3n M\u00E9dica" }) }), _jsx(CardContent, { children: children })] }));
};
export const LabResultCard = ({ children, ...props }) => {
    return (_jsxs(Card, { ...props, children: [_jsx(CardHeader, { children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Resultados de Laboratorio" }) }), _jsx(CardContent, { children: children })] }));
};
export default Card;
//# sourceMappingURL=Card.js.map