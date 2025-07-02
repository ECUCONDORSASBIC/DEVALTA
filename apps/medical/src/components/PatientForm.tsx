import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define Zod schema for patient form validation
const patientFormSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  dateOfBirth: z.string()
    .refine((date) => new Date(date) < new Date(), 'Date of birth must be in the past'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits'),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    surgicalHistory: z.array(z.string()).optional(),
    familyHistory: z.string().optional(),
  }),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  }),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
  }).optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData || {
      address: {},
      medicalHistory: {},
      emergencyContact: {},
      insurance: {},
    },
    mode: 'onChange',
  });

  const watchedFields = watch();

  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Patient Information</h2>
      
      {/* Personal Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              {...register('dateOfBirth')}
              type="date"
              id="dateOfBirth"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
            />
            {errors.dateOfBirth && (
              <p id="dateOfBirth-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              {...register('gender')}
              id="gender"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p id="gender-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              {...register('address.street')}
              type="text"
              id="address.street"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address?.street ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.address?.street ? 'street-error' : undefined}
            />
            {errors.address?.street && (
              <p id="street-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('address.city')}
              type="text"
              id="address.city"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address?.city ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.address?.city ? 'city-error' : undefined}
            />
            {errors.address?.city && (
              <p id="city-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.address.city.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              {...register('address.state')}
              type="text"
              id="address.state"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address?.state ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.address?.state ? 'state-error' : undefined}
            />
            {errors.address?.state && (
              <p id="state-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.address.state.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              {...register('address.zipCode')}
              type="text"
              id="address.zipCode"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address?.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.address?.zipCode ? 'zipCode-error' : undefined}
            />
            {errors.address?.zipCode && (
              <p id="zipCode-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.address.zipCode.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              {...register('address.country')}
              type="text"
              id="address.country"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address?.country ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.address?.country ? 'country-error' : undefined}
            />
            {errors.address?.country && (
              <p id="country-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.address.country.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name *
            </label>
            <input
              {...register('emergencyContact.name')}
              type="text"
              id="emergencyContact.name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.emergencyContact?.name ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.emergencyContact?.name ? 'emergencyName-error' : undefined}
            />
            {errors.emergencyContact?.name && (
              <p id="emergencyName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <input
              {...register('emergencyContact.relationship')}
              type="text"
              id="emergencyContact.relationship"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.emergencyContact?.relationship ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.emergencyContact?.relationship ? 'emergencyRelationship-error' : undefined}
            />
            {errors.emergencyContact?.relationship && (
              <p id="emergencyRelationship-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.emergencyContact.relationship.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone *
            </label>
            <input
              {...register('emergencyContact.phone')}
              type="tel"
              id="emergencyContact.phone"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.emergencyContact?.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.emergencyContact?.phone ? 'emergencyPhone-error' : undefined}
            />
            {errors.emergencyContact?.phone && (
              <p id="emergencyPhone-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`px-6 py-3 text-white font-medium rounded-md transition-colors duration-200 ${
            isValid && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 focus:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          aria-label={isLoading ? 'Saving patient information...' : 'Save patient information'}
        >
          {isLoading ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
