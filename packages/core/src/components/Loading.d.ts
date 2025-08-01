import React from "react";
export interface LoadingProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "spinner" | "dots" | "pulse" | "bars" | "medical";
    color?: "primary" | "secondary" | "white" | "gray";
    text?: string;
    fullScreen?: boolean;
    overlay?: boolean;
    className?: string;
}
export declare const Loading: React.FC<LoadingProps>;
export declare const MedicalLoading: React.FC<LoadingProps>;
export declare const PatientLoading: React.FC<LoadingProps>;
export declare const AppointmentLoading: React.FC<LoadingProps>;
export declare const PrescriptionLoading: React.FC<LoadingProps>;
export declare const LabResultLoading: React.FC<LoadingProps>;
export declare const LoadingState: React.FC<{
    loading: boolean;
    children: React.ReactNode;
}>;
export declare const LoadingOverlay: React.FC<{
    loading: boolean;
    children: React.ReactNode;
}>;
export declare const Skeleton: React.FC<{
    className?: string;
}>;
export declare const SkeletonText: React.FC<{
    lines?: number;
    className?: string;
}>;
export declare const SkeletonCard: React.FC;
export default Loading;
export declare const LoadingSpinner: React.FC<LoadingProps>;
export declare const LoadingDots: (props: Omit<LoadingProps, "variant">) => import("react/jsx-runtime").JSX.Element;
export declare const LoadingPulse: (props: Omit<LoadingProps, "variant">) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Loading.d.ts.map