import { useState, useCallback } from "react";
import { LabResult } from "../types";

export function useLabResults(options: { initialFetch?: boolean } = {}) {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const searchLabResults = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Aquí iría la llamada real a la API
      // Simulación de datos
      const mock: LabResult[] = [
        {
          id: "1",
          testName: "Hemograma Completo",
          date: "2024-07-01",
          status: "completed",
          resultSummary: "Todos los valores dentro de rango.",
          laboratoryName: "Lab Central",
          requestedBy: "Dr. Pérez",
          attachments: [],
        },
      ];
      setLabResults(mock);
      setPagination({ page: 1, totalPages: 1, total: 1 });
    } catch (e) {
      setError("Error al cargar resultados de laboratorio");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inicial si se requiere
  if (options.initialFetch) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState(() => {
      searchLabResults();
    });
  }

  return { labResults, loading, error, pagination, searchLabResults };
}

export function useLabResult(id: string) {
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabResult = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Aquí iría la llamada real a la API
      // Simulación de datos
      setLabResult({
        id,
        testName: "Hemograma Completo",
        date: "2024-07-01",
        status: "completed",
        resultSummary: "Todos los valores dentro de rango.",
        laboratoryName: "Lab Central",
        requestedBy: "Dr. Pérez",
        attachments: [],
      });
    } catch (e) {
      setError("Error al cargar resultado de laboratorio");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch inicial
  useState(() => {
    fetchLabResult();
  });

  return { labResult, loading, error };
}
