import React from "react";
import { cn } from "../utils/cn";

// ==================== CARD TYPES ====================

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

// ==================== CARD COMPONENT ====================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";

// ==================== CARD HEADER COMPONENT ====================

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// ==================== CARD CONTENT COMPONENT ====================

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

// ==================== CARD FOOTER COMPONENT ====================

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

// ==================== MEDICAL CARD VARIANTS ====================

export const MedicalCard: React.FC<CardProps> = ({ children, ...props }) => {
  return <Card {...props}>{children}</Card>;
};

export const EmergencyCard: React.FC<CardProps> = ({ children, ...props }) => {
  return <Card {...props}>{children}</Card>;
};

export const SuccessCard: React.FC<CardProps> = ({ children, ...props }) => {
  return <Card {...props}>{children}</Card>;
};

export const WarningCard: React.FC<CardProps> = ({ children, ...props }) => {
  return <Card {...props}>{children}</Card>;
};

// ==================== SPECIALIZED MEDICAL CARDS ====================

export const PatientCard: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <MedicalCard {...props}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          Información del Paciente
        </h3>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </MedicalCard>
  );
};

export const AppointmentCard: React.FC<CardProps> = ({
  children,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Cita Médica</h3>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export const PrescriptionCard: React.FC<CardProps> = ({
  children,
  ...props
}) => {
  return (
    <MedicalCard {...props}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          Prescripción Médica
        </h3>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </MedicalCard>
  );
};

export const LabResultCard: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <Card {...props}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          Resultados de Laboratorio
        </h3>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// ==================== EXPORT ====================

export default Card;
