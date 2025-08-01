-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "numeroHistoriaClinica" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "genero" TEXT NOT NULL,
    "estadoCivil" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" JSONB NOT NULL,
    "grupoSanguineo" TEXT,
    "factorRh" TEXT,
    "alergias" JSONB,
    "consentimientoTratamientoDatos" BOOLEAN NOT NULL,
    "fechaConsentimiento" TIMESTAMP(3) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaActualizacion" TIMESTAMP(3) NOT NULL,
    "estadoPaciente" TEXT NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_numeroHistoriaClinica_key" ON "Paciente"("numeroHistoriaClinica");
