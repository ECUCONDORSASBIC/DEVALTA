import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BloodType, createPatientSchema, Gender, MaritalStatus, PatientStatus, type CreatePatient } from '@altamedica/types';
import { cn } from '@altamedica/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Contact, FileText, Heart, Plus, Settings, Shield, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface PatientFormProps {
  patient?: CreatePatient;
  onSubmit: (data: CreatePatient) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({ patient, onSubmit, onCancel, isLoading = false }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  
  const form = useForm<CreatePatient>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: patient || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Argentina',
      gender: Gender.OTHER,
      dni: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      notes: '',
      tags: [],
      preferredLanguage: 'Español',
      preferredCommunication: 'Email',
      status: PatientStatus.ACTIVE,
      consentForMarketing: false,
      consentForDataSharing: false,
      createdBy: '', // Se debe llenar desde el contexto de usuario
      companyId: '', // Se debe llenar desde el contexto de empresa
    }
  });

  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy
  } = useFieldArray({
    control: form.control,
    name: 'allergies'
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition
  } = useFieldArray({
    control: form.control,
    name: 'chronicConditions'
  });

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication
  } = useFieldArray({
    control: form.control,
    name: 'currentMedications'
  });

  const handleSubmit = (data: CreatePatient) => {
    // Agregar timestamps y metadatos
    const patientData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Estos deberían venir del contexto de usuario/empresa
      createdBy: 'current-user-id',
      companyId: 'current-company-id',
    };
    onSubmit(patientData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h1>
        <p className="text-gray-600 mt-2">
          {patient ? 'Modifica la información del paciente' : 'Registra un nuevo paciente en el sistema'}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Contact className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Emergencia
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Datos básicos del paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      placeholder="Ingresa el nombre"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      placeholder="Ingresa el apellido"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      {...form.register('dni')}
                      placeholder="12345678"
                    />
                    {form.formState.errors.dni && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.dni.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      value={form.watch('gender')}
                      onValueChange={(value) => form.setValue('gender', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona género" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(Gender).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch('dateOfBirth') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('dateOfBirth') ? (
                            format(form.watch('dateOfBirth'), 'PPP', { locale: es })
                          ) : (
                            <span>Selecciona fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.watch('dateOfBirth')}
                          onSelect={(date) => form.setValue('dateOfBirth', date!)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Tipo de Sangre</Label>
                    <Select
                      value={form.watch('bloodType')}
                      onValueChange={(value) => form.setValue('bloodType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de sangre" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BloodType).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maritalStatus">Estado Civil</Label>
                    <Select
                      value={form.watch('maritalStatus')}
                      onValueChange={(value) => form.setValue('maritalStatus', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MaritalStatus).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="occupation">Ocupación</Label>
                  <Input
                    id="occupation"
                    {...form.register('occupation')}
                    placeholder="Ingeniero, Doctor, Estudiante..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información de Contacto */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Datos de contacto y dirección</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="paciente@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      placeholder="+54 11 1234-5678"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="alternativePhone">Teléfono Alternativo</Label>
                  <Input
                    id="alternativePhone"
                    {...form.register('alternativePhone')}
                    placeholder="+54 11 8765-4321"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="Av. Corrientes 1234, Piso 5, Depto. A"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="Buenos Aires"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">Provincia *</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      placeholder="CABA"
                    />
                    {form.formState.errors.state && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input
                      id="zipCode"
                      {...form.register('zipCode')}
                      placeholder="C1000"
                    />
                    {form.formState.errors.zipCode && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    {...form.register('country')}
                    placeholder="Argentina"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacto de Emergencia */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
                <CardDescription>Información de la persona a contactar en caso de emergencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact.name">Nombre Completo *</Label>
                    <Input
                      id="emergencyContact.name"
                      {...form.register('emergencyContact.name')}
                      placeholder="Juan Pérez"
                    />
                    {form.formState.errors.emergencyContact?.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.emergencyContact.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact.relationship">Relación *</Label>
                    <Input
                      id="emergencyContact.relationship"
                      {...form.register('emergencyContact.relationship')}
                      placeholder="Esposo/a, Padre/Madre, Hermano/a..."
                    />
                    {form.formState.errors.emergencyContact?.relationship && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.emergencyContact.relationship.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact.phone">Teléfono *</Label>
                    <Input
                      id="emergencyContact.phone"
                      {...form.register('emergencyContact.phone')}
                      placeholder="+54 11 1234-5678"
                    />
                    {form.formState.errors.emergencyContact?.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.emergencyContact.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact.email">Email</Label>
                    <Input
                      id="emergencyContact.email"
                      type="email"
                      {...form.register('emergencyContact.email')}
                      placeholder="contacto@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="emergencyContact.address">Dirección</Label>
                  <Textarea
                    id="emergencyContact.address"
                    {...form.register('emergencyContact.address')}
                    placeholder="Dirección del contacto de emergencia"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Médica */}
          <TabsContent value="medical">
            <div className="space-y-6">
              {/* Alergias */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Alergias</CardTitle>
                      <CardDescription>Alergias conocidas del paciente</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAllergy({
                        id: crypto.randomUUID(),
                        allergen: '',
                        severity: 'Leve',
                        reaction: '',
                        notes: ''
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Alergia
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {allergyFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay alergias registradas</p>
                  ) : (
                    <div className="space-y-4">
                      {allergyFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Alergia {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAllergy(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Alérgeno</Label>
                              <Input
                                {...form.register(`allergies.${index}.allergen`)}
                                placeholder="Polen, Maní, Penicilina..."
                              />
                            </div>
                            <div>
                              <Label>Severidad</Label>
                              <Select
                                value={form.watch(`allergies.${index}.severity`)}
                                onValueChange={(value) => 
                                  form.setValue(`allergies.${index}.severity`, value as any)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Leve">Leve</SelectItem>
                                  <SelectItem value="Moderada">Moderada</SelectItem>
                                  <SelectItem value="Severa">Severa</SelectItem>
                                  <SelectItem value="Crítica">Crítica</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Reacción</Label>
                            <Input
                              {...form.register(`allergies.${index}.reaction`)}
                              placeholder="Erupción cutánea, dificultad respiratoria..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Condiciones Crónicas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Condiciones Crónicas</CardTitle>
                      <CardDescription>Condiciones médicas crónicas</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCondition({
                        id: crypto.randomUUID(),
                        condition: '',
                        status: 'Activa',
                        medications: [],
                        notes: ''
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Condición
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {conditionFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay condiciones crónicas registradas</p>
                  ) : (
                    <div className="space-y-4">
                      {conditionFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Condición {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Condición</Label>
                              <Input
                                {...form.register(`chronicConditions.${index}.condition`)}
                                placeholder="Diabetes, Hipertensión, Asma..."
                              />
                            </div>
                            <div>
                              <Label>Estado</Label>
                              <Select
                                value={form.watch(`chronicConditions.${index}.status`)}
                                onValueChange={(value) => 
                                  form.setValue(`chronicConditions.${index}.status`, value as any)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Activa">Activa</SelectItem>
                                  <SelectItem value="Controlada">Controlada</SelectItem>
                                  <SelectItem value="En Remisión">En Remisión</SelectItem>
                                  <SelectItem value="Curada">Curada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medicaciones Actuales */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Medicaciones Actuales</CardTitle>
                      <CardDescription>Medicamentos que toma actualmente</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendMedication({
                        id: crypto.randomUUID(),
                        name: '',
                        dosage: '',
                        frequency: '',
                        startDate: new Date(),
                        isActive: true,
                        notes: ''
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Medicación
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {medicationFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay medicaciones registradas</p>
                  ) : (
                    <div className="space-y-4">
                      {medicationFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Medicación {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedication(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label>Medicamento</Label>
                              <Input
                                {...form.register(`currentMedications.${index}.name`)}
                                placeholder="Ibuprofeno, Omeprazol..."
                              />
                            </div>
                            <div>
                              <Label>Dosis</Label>
                              <Input
                                {...form.register(`currentMedications.${index}.dosage`)}
                                placeholder="400mg, 1 comprimido..."
                              />
                            </div>
                            <div>
                              <Label>Frecuencia</Label>
                              <Input
                                {...form.register(`currentMedications.${index}.frequency`)}
                                placeholder="Cada 8 horas, 2 veces al día..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historial (placeholder) */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial Médico</CardTitle>
                <CardDescription>Historial médico se gestionará después de crear el paciente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  El historial médico se puede gestionar una vez que el paciente sea creado
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración y Preferencias</CardTitle>
                <CardDescription>Preferencias de comunicación y privacidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredLanguage">Idioma Preferido</Label>
                    <Select
                      value={form.watch('preferredLanguage')}
                      onValueChange={(value) => form.setValue('preferredLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Español">Español</SelectItem>
                        <SelectItem value="Inglés">Inglés</SelectItem>
                        <SelectItem value="Portugués">Portugués</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="preferredCommunication">Comunicación Preferida</Label>
                    <Select
                      value={form.watch('preferredCommunication')}
                      onValueChange={(value) => form.setValue('preferredCommunication', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Teléfono">Teléfono</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consentimiento para Marketing</Label>
                      <p className="text-sm text-gray-600">
                        Acepta recibir comunicaciones promocionales
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('consentForMarketing')}
                      onCheckedChange={(checked) => form.setValue('consentForMarketing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consentimiento para Compartir Datos</Label>
                      <p className="text-sm text-gray-600">
                        Permite compartir datos con otros profesionales de la salud
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('consentForDataSharing')}
                      onCheckedChange={(checked) => form.setValue('consentForDataSharing', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    {...form.register('notes')}
                    placeholder="Notas adicionales sobre el paciente..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : patient ? 'Actualizar Paciente' : 'Crear Paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
}
