import React from 'react';
import { AlertTriangle, Download, Calendar, User, FileText } from 'lucide-react';
import { CardCorporate, CardHeaderCorporate, CardContentCorporate, CardFooterCorporate } from './CardCorporate';
import { ButtonCorporate } from './ButtonCorporate';
import { BadgeCorporate } from './BadgeCorporate';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'consultation' | 'examination' | 'procedure' | 'test' | 'prescription';
  doctor: string;
  diagnosis?: string[];
  symptoms?: string[];
  treatment?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  testResults?: Array<{
    test: string;
    result: string;
    normalRange: string;
    status: 'normal' | 'abnormal' | 'critical';
  }>;
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  followUpRequired?: boolean;
  followUpDate?: Date;
  tags?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface MedicalRecordCardProps {
  record: MedicalRecord;
  isDetailed?: boolean;
  isCompact?: boolean;
  showActions?: boolean;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getTypeIcon = (type: MedicalRecord['type']) => {
  switch (type) {
    case 'consultation': return '👨‍⚕️';
    case 'examination': return '🔍';
    case 'procedure': return '⚕️';
    case 'test': return '🔬';
    case 'prescription': return '💊';
    default: return '📋';
  }
};

const getTypeLabel = (type: MedicalRecord['type']) => {
  switch (type) {
    case 'consultation': return 'Consulta';
    case 'examination': return 'Examen';
    case 'procedure': return 'Procedimiento';
    case 'test': return 'Análisis';
    case 'prescription': return 'Receta';
    default: return 'Registro';
  }
};

const getPriorityColor = (priority: MedicalRecord['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const MedicationsList: React.FC<{ medications: MedicalRecord['medications'], compact?: boolean }> = ({ medications, compact }) => {
  if (!medications || medications.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className={`font-medium text-primary-altamedica ${compact ? 'text-sm' : 'text-base'}`}>
        Medicamentos:
      </h4>
      <div className="space-y-2">
        {medications.map((med, index) => (
          <div key={index} className={`p-2 bg-blue-50 rounded-lg ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="font-medium text-blue-900">{med.name}</div>
            <div className="text-blue-700">
              {med.dosage} - {med.frequency} - {med.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TestResults: React.FC<{ results: MedicalRecord['testResults'], compact?: boolean }> = ({ results, compact }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className={`font-medium text-primary-altamedica ${compact ? 'text-sm' : 'text-base'}`}>
        Resultados de Análisis:
      </h4>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className={`p-2 rounded-lg ${
            result.status === 'critical' ? 'bg-red-50' :
            result.status === 'abnormal' ? 'bg-yellow-50' : 'bg-green-50'
          } ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="font-medium">{result.test}</div>
            <div className="text-gray-700">
              Resultado: {result.result} (Normal: {result.normalRange})
            </div>
            <BadgeCorporate 
              variant={result.status === 'critical' ? 'destructive' : 
                      result.status === 'abnormal' ? 'warning' : 'success'}
              size={compact ? 'sm' : 'md'}
            >
              {result.status === 'critical' ? 'Crítico' :
               result.status === 'abnormal' ? 'Anormal' : 'Normal'}
            </BadgeCorporate>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttachmentsList: React.FC<{ attachments: MedicalRecord['attachments'], compact?: boolean }> = ({ attachments, compact }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className={`font-medium text-primary-altamedica ${compact ? 'text-sm' : 'text-base'}`}>
        Archivos Adjuntos:
      </h4>
      <div className="space-y-1">
        {attachments.map((attachment, index) => (
          <div key={index} className={`flex items-center space-x-2 p-2 bg-gray-50 rounded-lg ${compact ? 'text-xs' : 'text-sm'}`}>
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{attachment.name}</span>
            <span className="text-gray-500">({attachment.size})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  isDetailed = false,
  isCompact = false,
  showActions = true,
  onView,
  onShare,
  onDownload,
  onEdit
}) => {
  return (
    <CardCorporate className={`${isCompact ? 'max-w-sm' : 'w-full'}`}>
      {/* 🏷️ HEADER CON METADATOS */}
      <CardHeaderCorporate>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTypeIcon(record.type)}</span>
            <div>
              <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
                {record.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <BadgeCorporate variant="outline" size={isCompact ? 'sm' : 'md'}>
                  {getTypeLabel(record.type)}
                </BadgeCorporate>
                <BadgeCorporate 
                  variant={record.priority === 'urgent' ? 'destructive' : 
                          record.priority === 'high' ? 'warning' : 'secondary'}
                  size={isCompact ? 'sm' : 'md'}
                >
                  {record.priority === 'urgent' ? 'Urgente' :
                   record.priority === 'high' ? 'Alta' :
                   record.priority === 'medium' ? 'Media' : 'Baja'}
                </BadgeCorporate>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {formatDate(record.date)}
            </div>
          </div>
        </div>

        {/* 👨‍⚕️ DOCTOR */}
        <div className="flex items-center space-x-2 mt-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className={`text-gray-700 ${isCompact ? 'text-sm' : 'text-base'}`}>
            Dr. {record.doctor}
          </span>
        </div>
      </CardHeaderCorporate>

      {/* 📋 CONTENIDO PRINCIPAL */}
      <CardContentCorporate>
        <div className="space-y-4">
          {/* 📝 DESCRIPCIÓN COMPACTA */}
          {!isDetailed && record.description && (
            <p className={`text-gray-600 ${isCompact ? 'text-sm' : 'text-base'} line-clamp-2`}>
              {record.description}
            </p>
          )}

          {/* 🩺 DIAGNÓSTICOS */}
          {record.diagnosis && record.diagnosis.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-medium text-primary-altamedica ${isCompact ? 'text-sm' : 'text-base'}`}>
                Diagnóstico:
              </h4>
              <div className="flex flex-wrap gap-2">
                {record.diagnosis.map((diagnosis, index) => (
                  <span 
                    key={index} 
                    className={`px-2 py-1 bg-primary-altamedica/10 text-primary-altamedica rounded-lg ${isCompact ? 'text-xs' : 'text-sm'}`}
                  >
                    {diagnosis}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🔬 SÍNTOMAS */}
          {isDetailed && record.symptoms && record.symptoms.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-medium text-primary-altamedica ${isCompact ? 'text-sm' : 'text-base'}`}>
                Síntomas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {record.symptoms.map((symptom, index) => (
                  <span 
                    key={index} 
                    className={`px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg ${isCompact ? 'text-xs' : 'text-sm'}`}
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 💊 TRATAMIENTO */}
          {record.treatment && (
            <div className="space-y-2">
              <h4 className={`font-medium text-primary-altamedica ${isCompact ? 'text-sm' : 'text-base'}`}>
                Tratamiento:
              </h4>
              <p className={`text-gray-700 ${isCompact ? 'text-sm' : 'text-base'}`}>
                {record.treatment}
              </p>
            </div>
          )}

          {/* 💊 MEDICAMENTOS */}
          <MedicationsList medications={record.medications || []} compact={isCompact} />

          {/* 📊 RESULTADOS DE ANÁLISIS */}
          <TestResults results={record.testResults} compact={isCompact} />

          {/* 📎 ARCHIVOS ADJUNTOS (SOLO EN VISTA DETALLADA) */}
          {isDetailed && (
            <AttachmentsList attachments={record.attachments} compact={isCompact} />
          )}

          {/* 📅 SEGUIMIENTO REQUERIDO */}
          {record.followUpRequired && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className={`font-medium text-yellow-800 ${isCompact ? 'text-sm' : 'text-base'}`}>
                  Seguimiento Requerido
                </p>
                {record.followUpDate && (
                  <p className={`text-yellow-700 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    Fecha: {formatDate(record.followUpDate)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 🏷️ ETIQUETAS */}
          {isDetailed && record.tags && record.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-medium text-primary-altamedica ${isCompact ? 'text-sm' : 'text-base'}`}>
                Etiquetas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {record.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`px-2 py-1 bg-gray-100 text-gray-700 rounded-lg ${isCompact ? 'text-xs' : 'text-sm'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContentCorporate>

      {/* 🦶 FOOTER CON ACCIONES */}
      {showActions && (
        <CardFooterCorporate align="between">
          <div className="flex items-center space-x-2">
            {/* 👁️ BOTÓN VER DETALLES */}
            <ButtonCorporate
              variant="ghost"
              size={isCompact ? 'sm' : 'md'}
              onClick={() => onView?.(record.id)}
            >
              Ver Completo
            </ButtonCorporate>
            
            {/* 📤 BOTÓN COMPARTIR */}
            <ButtonCorporate
              variant="outline"
              size={isCompact ? 'sm' : 'md'}
              onClick={() => onShare?.(record.id)}
            >
              Compartir
            </ButtonCorporate>
          </div>

          <div className="flex items-center space-x-2">
            {/* 📥 BOTÓN DESCARGAR */}
            <ButtonCorporate
              variant="secondary"
              size={isCompact ? 'sm' : 'md'}
              icon={<Download className="w-4 h-4" />}
              onClick={() => onDownload?.(record.id)}
            >
              Descargar
            </ButtonCorporate>
          </div>
        </CardFooterCorporate>
      )}
    </CardCorporate>
  );
};

export default MedicalRecordCard;