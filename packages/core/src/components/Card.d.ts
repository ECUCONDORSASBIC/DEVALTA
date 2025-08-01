import React from "react";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardHeader: React.ForwardRefExoticComponent<CardHeaderProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardContent: React.ForwardRefExoticComponent<CardContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const CardFooter: React.ForwardRefExoticComponent<CardFooterProps & React.RefAttributes<HTMLDivElement>>;
export declare const MedicalCard: React.FC<CardProps>;
export declare const EmergencyCard: React.FC<CardProps>;
export declare const SuccessCard: React.FC<CardProps>;
export declare const WarningCard: React.FC<CardProps>;
export declare const PatientCard: React.FC<CardProps>;
export declare const AppointmentCard: React.FC<CardProps>;
export declare const PrescriptionCard: React.FC<CardProps>;
export declare const LabResultCard: React.FC<CardProps>;
export default Card;
//# sourceMappingURL=Card.d.ts.map