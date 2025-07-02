import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>

      <h3 className="text-2xl font-semibold text-slate-800 mb-2">
        Error al cargar datos
      </h3>

      <p className="text-slate-600 mb-6 max-w-md mx-auto">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Intentar de nuevo
        </button>
      )}

      <div className="mt-6 text-sm text-slate-500">
        Si el problema persiste, contacta al soporte técnico
      </div>
    </div>
  );
}
