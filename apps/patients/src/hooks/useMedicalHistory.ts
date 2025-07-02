import { useState, useCallback } from "react";
import { MedicalRecord } from "../types";

export function useMedicalHistory(options: { initialFetch?: boolean } = {}) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const searchRecords = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Aquí iría la llamada real a la API
      // Simulación de datos
      const mock: MedicalRecord[] = [
        {
          id: "1",
          patientId: "p1",
          doctorId: "d1",
          date: "2024-07-01",
          type: "consultation",
          title: "Consulta de control",
          description: "Chequeo general anual.",
          diagnosis: ["Hipertensión"],
          symptoms: ["Dolor de cabeza"],
          treatment: "Ajuste de medicación.",
          medications: [
            {
              name: "Enalapril",
              dosage: "10mg",
              frequency: "1/día",
              startDate: "2024-07-01",
              prescribedBy: "Dr. Ruiz",
            },
          ],
          testResults: [],
          attachments: [],
          followUpRequired: false,
          priority: "normal",
          isPrivate: false,
          tags: [],
          createdAt: "2024-07-01",
          updatedAt: "2024-07-01",
        },
      ];
      setRecords(mock);
      setPagination({ page: 1, totalPages: 1, total: 1 });
    } catch (e) {
      setError("Error al cargar registros médicos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial si se requiere
  if (options.initialFetch) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState(() => {
      searchRecords();
    });
  }

  return { records, loading, error, pagination, searchRecords };
}

export function useMedicalRecord(id: string) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Aquí iría la llamada real a la API
      // Simulación de datos
      setRecord({
        id,
        patientId: "p1",
        doctorId: "d1",
        date: "2024-07-01",
        type: "consultation",
        title: "Consulta de control",
        description: "Chequeo general anual.",
        diagnosis: ["Hipertensión"],
        symptoms: ["Dolor de cabeza"],
        treatment: "Ajuste de medicación.",
        medications: [
          {
            name: "Enalapril",
            dosage: "10mg",
            frequency: "1/día",
            startDate: "2024-07-01",
            prescribedBy: "Dr. Ruiz",
          },
        ],
        testResults: [],
        attachments: [],
        followUpRequired: false,
        priority: "normal",
        isPrivate: false,
        tags: [],
        createdAt: "2024-07-01",
        updatedAt: "2024-07-01",
      });
    } catch (e) {
      setError("Error al cargar registro médico");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch inicial
  useState(() => {
    fetchRecord();
  });

  return { record, loading, error };
}
