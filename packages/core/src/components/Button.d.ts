import React from "react";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
    rounded?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const MedicalButton: React.FC<ButtonProps>;
export declare const EmergencyButton: React.FC<ButtonProps>;
export declare const SuccessButton: React.FC<ButtonProps>;
export declare const WarningButton: React.FC<ButtonProps>;
export default Button;
//# sourceMappingURL=Button.d.ts.map