'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Schema de validación para ofertas de trabajo
const jobOfferSchema = z.object({
  title: z.string().min(10, 'El título debe tener al menos 10 caracteres'),
  specialty: z.string().min(1, 'Selecciona una especialidad'),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  requirements: z.array(z.string()).min(1, 'Agrega al menos un requisito'),
  benefits: z.array(z.string()).min(1, 'Agrega al menos un beneficio'),
  location: z.string().min(1, 'Especifica la ubicación'),
  remote: z.boolean(),
  type: z.enum(['job', 'contract', 'consultation', 'partnership']),
  schedule: z.string().min(1, 'Especifica el horario'),
  experience: z.string().min(1, 'Especifica la experiencia requerida'),
  salary: z.object({
    min: z.number().min(0, 'El salario mínimo debe ser mayor a 0'),
    max: z.number().min(0, 'El salario máximo debe ser mayor a 0'),
    currency: z.enum(['USD', 'ARS', 'EUR']),
    period: z.enum(['hour', 'month', 'year'])
  }),
  urgent: z.boolean(),
  contactInfo: z.object({
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    contactPerson: z.string().min(1, 'Especifica la persona de contacto')
  }),
  applicationDeadline: z.string().min(1, 'Especifica la fecha límite'),
  startDate: z.string().min(1, 'Especifica la fecha de inicio'),
  keywords: z.array(z.string()).optional(),
  equipmentProvided: z.boolean(),
  travelRequired: z.boolean(),
  languagesRequired: z.array(z.string()).optional(),
});

type JobOfferFormData = z.infer<typeof jobOfferSchema>;

interface JobFormProps {
  onSubmit: (data: JobOfferFormData) => void;
  onCancel: () => void;
  initialData?: Partial<JobOfferFormData>;
  isEditing?: boolean;
}

const specialties = [
  'Cardiología', 'Pediatría', 'Neurología', 'Oncología', 'Ginecología',
  'Traumatología', 'Dermatología', 'Psiquiatría', 'Radiología', 'Anestesiología',
  'Medicina Interna', 'Medicina General', 'Cirugía General', 'Endocrinología'
];

const languages = [
  'Español', 'Inglés', 'Portugués', 'Francés', 'Italiano', 'Alemán'
];

export default function JobForm({ onSubmit, onCancel, initialData, isEditing = false }: JobFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: initialData?.title || '',
      specialty: initialData?.specialty || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements || [''],
      benefits: initialData?.benefits || [''],
      location: initialData?.location || '',
      remote: initialData?.remote || false,
      type: initialData?.type || 'job',
      schedule: initialData?.schedule || '',
      experience: initialData?.experience || '',
      salary: {
        min: initialData?.salary?.min || 0,
        max: initialData?.salary?.max || 0,
        currency: initialData?.salary?.currency || 'USD',
        period: initialData?.salary?.period || 'month'
      },
      urgent: initialData?.urgent || false,
      contactInfo: {
        email: initialData?.contactInfo?.email || '',
        phone: initialData?.contactInfo?.phone || '',
        contactPerson: initialData?.contactInfo?.contactPerson || ''
      },
      applicationDeadline: initialData?.applicationDeadline || '',
      startDate: initialData?.startDate || '',
      keywords: initialData?.keywords || [],
      equipmentProvided: initialData?.equipmentProvided || false,
      travelRequired: initialData?.travelRequired || false,
      languagesRequired: initialData?.languagesRequired || [],
    }
  });

  const watchedValues = watch();

  // Funciones para manejar arrays dinámicos
  const addArrayItem = (field: 'requirements' | 'benefits' | 'keywords' | 'languagesRequired') => {
    const currentValue = watchedValues[field] || [];
    setValue(field, [...currentValue, '']);
  };

  const removeArrayItem = (field: 'requirements' | 'benefits' | 'keywords' | 'languagesRequired', index: number) => {
    const currentValue = watchedValues[field] || [];
    setValue(field, currentValue.filter((_, i) => i !== index));
  };

  const updateArrayItem = (field: 'requirements' | 'benefits' | 'keywords' | 'languagesRequired', index: number, value: string) => {
    const currentValue = watchedValues[field] || [];
    const newValue = [...currentValue];
    newValue[index] = value;
    setValue(field, newValue);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-24 h-1 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Información Básica</span>
        <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Detalles del Puesto</span>
        <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Compensación</span>
        <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Contacto y Fechas</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Información Básica del Puesto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Puesto *
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej. Cardiólogo Intervencionista Senior"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialidad Médica *
          </label>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una especialidad</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            )}
          />
          {errors.specialty && <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Posición *
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="job">Empleo Fijo</option>
                <option value="contract">Contrato</option>
                <option value="consultation">Consultoría</option>
                <option value="partnership">Sociedad</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej. Buenos Aires, Argentina"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidad de Trabajo
          </label>
          <div className="flex items-center space-x-4">
            <Controller
              name="remote"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Trabajo Remoto Disponible</span>
                </label>
              )}
            />
            <Controller
              name="urgent"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Posición Urgente</span>
                </label>
              )}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Puesto *
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={5}
              placeholder="Describe las responsabilidades, objetivos y características principales del puesto..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        <p className="mt-1 text-sm text-gray-500">
          {watchedValues.description?.length || 0} caracteres (mínimo 50)
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Detalles del Puesto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experiencia Requerida *
          </label>
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona el nivel de experiencia</option>
                <option value="Junior (1-3 años)">Junior (1-3 años)</option>
                <option value="Semi-senior (3-7 años)">Semi-senior (3-7 años)</option>
                <option value="Senior (7+ años)">Senior (7+ años)</option>
                <option value="Especialista (10+ años)">Especialista (10+ años)</option>
              </select>
            )}
          />
          {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horario de Trabajo *
          </label>
          <Controller
            name="schedule"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona el horario</option>
                <option value="Tiempo completo">Tiempo completo</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Por horas">Por horas</option>
                <option value="Guardias rotativas">Guardias rotativas</option>
                <option value="Flexible">Flexible</option>
              </select>
            )}
          />
          {errors.schedule && <p className="mt-1 text-sm text-red-600">{errors.schedule.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Controller
              name="equipmentProvided"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Equipamiento Proporcionado</span>
                </label>
              )}
            />
          </div>
        </div>

        <div>
          <Controller
            name="travelRequired"
            control={control}
            render={({ field }) => (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Requiere Viajes</span>
              </label>
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idiomas Requeridos
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {languages.map(language => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={watchedValues.languagesRequired?.includes(language) || false}
                onChange={(e) => {
                  const current = watchedValues.languagesRequired || [];
                  if (e.target.checked) {
                    setValue('languagesRequired', [...current, language]);
                  } else {
                    setValue('languagesRequired', current.filter(l => l !== language));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{language}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requisitos *
        </label>
        {(watchedValues.requirements || ['']).map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={requirement}
              onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
              placeholder="ej. Especialización en Cardiología"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('requirements', index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('requirements')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Agregar Requisito
        </button>
        {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Beneficios *
        </label>
        {(watchedValues.benefits || ['']).map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
              placeholder="ej. Obra social premium"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('benefits', index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('benefits')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Agregar Beneficio
        </button>
        {errors.benefits && <p className="mt-1 text-sm text-red-600">{errors.benefits.message}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Compensación</h3>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para el Salario</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ofrece un rango competitivo basado en la experiencia del mercado</li>
          <li>• Los salarios transparentes atraen más candidatos de calidad</li>
          <li>• Considera beneficios adicionales como parte del paquete total</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salario Mínimo *
          </label>
          <Controller
            name="salary.min"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                step="100"
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.salary?.min && <p className="mt-1 text-sm text-red-600">{errors.salary.min.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salario Máximo *
          </label>
          <Controller
            name="salary.max"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                step="100"
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.salary?.max && <p className="mt-1 text-sm text-red-600">{errors.salary.max.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda *
          </label>
          <Controller
            name="salary.currency"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="ARS">ARS ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período *
          </label>
          <Controller
            name="salary.period"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hour">Por Hora</option>
                <option value="month">Mensual</option>
                <option value="year">Anual</option>
              </select>
            )}
          />
        </div>
      </div>

      {watchedValues.salary && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Vista Previa del Salario</h4>
          <p className="text-lg font-semibold text-green-600">
            {watchedValues.salary.currency} {watchedValues.salary.min?.toLocaleString()} - {watchedValues.salary.max?.toLocaleString()}
            <span className="text-sm text-gray-600 ml-2">
              por {watchedValues.salary.period === 'hour' ? 'hora' : 
                   watchedValues.salary.period === 'month' ? 'mes' : 'año'}
            </span>
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Información de Contacto y Fechas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de Contacto *
          </label>
          <Controller
            name="contactInfo.email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="contacto@empresa.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.contactInfo?.email && <p className="mt-1 text-sm text-red-600">{errors.contactInfo.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (Opcional)
          </label>
          <Controller
            name="contactInfo.phone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                placeholder="+54 11 1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persona de Contacto *
          </label>
          <Controller
            name="contactInfo.contactPerson"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="ej. Dr. María González - Directora de RRHH"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.contactInfo?.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactInfo.contactPerson.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Límite de Aplicación *
          </label>
          <Controller
            name="applicationDeadline"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.applicationDeadline && <p className="mt-1 text-sm text-red-600">{errors.applicationDeadline.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio Esperada *
          </label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Palabras Clave (Opcional)
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Agrega palabras clave para ayudar a los médicos a encontrar tu oferta
        </p>
        {(watchedValues.keywords || []).map((keyword, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => updateArrayItem('keywords', index, e.target.value)}
              placeholder="ej. cardiología, urgencias, telemedicina"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem('keywords', index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('keywords')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Agregar Palabra Clave
        </button>
      </div>
    </div>
  );

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: JobOfferFormData) => {
    onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Oferta de Trabajo' : 'Crear Nueva Oferta de Trabajo'}
        </h2>
        <p className="text-gray-600 mt-2">
          Completa la información para {isEditing ? 'actualizar' : 'publicar'} tu oferta en el marketplace médico
        </p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Oferta' : '🚀 Publicar Oferta')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
