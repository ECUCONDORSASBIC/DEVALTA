'use client'

import React from 'react'
import { Wizard, WizardStep, ProgressBar, WizardNavigation, FormField } from './index'
import type { WizardProps, WizardStep as WizardStepType } from './Wizard'

// Medical onboarding wizard template
export interface MedicalOnboardingWizardProps extends Omit<WizardProps, 'steps' | 'children'> {
  onPatientDataSubmit?: (data: any) => void
  onMedicalHistorySubmit?: (data: any) => void
  onConsentSubmit?: (data: any) => void
  showProgressBar?: boolean
  progressBarVariant?: 'default' | 'compact' | 'detailed'
}

export function MedicalOnboardingWizard({
  onPatientDataSubmit,
  onMedicalHistorySubmit,
  onConsentSubmit,
  showProgressBar = true,
  progressBarVariant = 'default',
  ...wizardProps
}: MedicalOnboardingWizardProps) {
  const steps: WizardStepType[] = [
    {
      id: 'personal-info',
      name: 'Personal Info',
      title: 'Personal Information',
      description: 'Please provide your basic information',
      component: <PersonalInfoStep />,
      validation: (data) => {
        const errors: string[] = []
        if (!data?.firstName) errors.push('First name is required')
        if (!data?.lastName) errors.push('Last name is required')
        if (!data?.email) errors.push('Email is required')
        if (!data?.phone) errors.push('Phone number is required')
        return errors
      }
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      title: 'Medical History',
      description: 'Help us understand your medical background',
      component: <MedicalHistoryStep />,
      validation: (data) => {
        // Medical history can be optional, but if provided, validate format
        return []
      }
    },
    {
      id: 'consent',
      name: 'Consent',
      title: 'Consent & Agreements',
      description: 'Review and accept our terms and conditions',
      component: <ConsentStep />,
      validation: (data) => {
        const errors: string[] = []
        if (!data?.hasConsented) errors.push('You must provide consent to continue')
        if (!data?.privacyAccepted) errors.push('You must accept the privacy policy')
        return errors
      }
    }
  ]

  const handleComplete = (data: any) => {
    onPatientDataSubmit?.(data['personal-info'])
    onMedicalHistorySubmit?.(data['medical-history'])
    onConsentSubmit?.(data['consent'])
    wizardProps.onComplete?.(data)
  }

  return (
    <Wizard
      {...wizardProps}
      steps={steps}
      onComplete={handleComplete}
      className="medical-onboarding-wizard"
    >
      {showProgressBar && (
        <ProgressBar 
          variant={progressBarVariant} 
          className="mb-6"
        />
      )}
      
      <div className="wizard-content">
        <WizardStep id="personal-info">
          <PersonalInfoStep />
        </WizardStep>
        
        <WizardStep id="medical-history">
          <MedicalHistoryStep />
        </WizardStep>
        
        <WizardStep id="consent">
          <ConsentStep />
        </WizardStep>
      </div>
      
      <WizardNavigation />
    </Wizard>
  )
}

// Personal Info Step Component
function PersonalInfoStep() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          stepId="personal-info"
          fieldId="firstName"
          type="text"
          placeholder="Enter your first name"
          required
          validation={{ required: true, minLength: 2 }}
        />
        
        <FormField
          label="Last Name"
          stepId="personal-info"
          fieldId="lastName"
          type="text"
          placeholder="Enter your last name"
          required
          validation={{ required: true, minLength: 2 }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email Address"
          stepId="personal-info"
          fieldId="email"
          type="email"
          placeholder="Enter your email"
          required
          validation={{ required: true, email: true }}
        />
        
        <FormField
          label="Phone Number"
          stepId="personal-info"
          fieldId="phone"
          type="tel"
          placeholder="Enter your phone number"
          required
          validation={{ required: true, phone: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date of Birth"
          stepId="personal-info"
          fieldId="dateOfBirth"
          type="date"
          required
          validation={{ required: true }}
        />
        
        <FormField
          label="Gender"
          stepId="personal-info"
          fieldId="gender"
          type="select"
          required
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' }
          ]}
          validation={{ required: true }}
        />
      </div>
    </div>
  )
}

// Medical History Step Component
function MedicalHistoryStep() {
  return (
    <div className="space-y-6">
      <FormField
        label="Do you have any chronic medical conditions?"
        stepId="medical-history"
        fieldId="hasChronicConditions"
        type="radio"
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]}
      />
      
      <FormField
        label="Please list any chronic conditions"
        stepId="medical-history"
        fieldId="chronicConditions"
        type="textarea"
        placeholder="e.g., Diabetes, Hypertension, Asthma..."
        rows={3}
        helpText="Please provide details about any ongoing medical conditions"
      />
      
      <FormField
        label="Current Medications"
        stepId="medical-history"
        fieldId="currentMedications"
        type="textarea"
        placeholder="List any medications you are currently taking..."
        rows={3}
        helpText="Include prescription medications, over-the-counter drugs, and supplements"
      />
      
      <FormField
        label="Known Allergies"
        stepId="medical-history"
        fieldId="allergies"
        type="textarea"
        placeholder="List any known allergies..."
        rows={2}
        helpText="Include drug allergies, food allergies, and environmental allergies"
      />
      
      <FormField
        label="Emergency Contact Name"
        stepId="medical-history"
        fieldId="emergencyContactName"
        type="text"
        placeholder="Enter emergency contact name"
        required
        validation={{ required: true }}
      />
      
      <FormField
        label="Emergency Contact Phone"
        stepId="medical-history"
        fieldId="emergencyContactPhone"
        type="tel"
        placeholder="Enter emergency contact phone"
        required
        validation={{ required: true, phone: true }}
      />
    </div>
  )
}

// Consent Step Component
function ConsentStep() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-secondary p-4 rounded-lg">
        <h3 className="text-h6 font-semibold mb-2">Terms and Conditions</h3>
        <p className="text-small text-secondary mb-4">
          By proceeding, you agree to our medical services terms and conditions. 
          Please read and accept the following agreements to continue.
        </p>
      </div>
      
      <FormField
        label="I consent to medical treatment and evaluation"
        stepId="consent"
        fieldId="hasConsented"
        type="checkbox"
        required
        validation={{ required: true }}
        description="I understand and consent to medical evaluation and treatment as deemed necessary by healthcare providers."
      />
      
      <FormField
        label="I accept the Privacy Policy and HIPAA Notice"
        stepId="consent"
        fieldId="privacyAccepted"
        type="checkbox"
        required
        validation={{ required: true }}
        description="I have read and accept the Privacy Policy and understand how my medical information will be used and protected."
      />
      
      <FormField
        label="I consent to telemedicine services"
        stepId="consent"
        fieldId="telemedicineConsent"
        type="checkbox"
        description="I understand the benefits and limitations of telemedicine services and consent to their use when appropriate."
      />
      
      <FormField
        label="I agree to receive appointment reminders via SMS/Email"
        stepId="consent"
        fieldId="communicationConsent"
        type="checkbox"
        description="I consent to receive appointment reminders, health tips, and relevant medical communications."
      />
      
      <div className="bg-info-50 p-4 rounded-lg border border-info-200">
        <h4 className="text-small font-semibold text-info-800 mb-2">Important Information</h4>
        <p className="text-small text-info-700">
          Your information is protected by state and federal privacy laws. 
          We will never share your personal health information without your explicit consent, 
          except as required by law or for treatment purposes.
        </p>
      </div>
    </div>
  )
}

// Survey wizard template
export interface SurveyWizardProps extends Omit<WizardProps, 'steps' | 'children'> {
  surveyQuestions: Array<{
    id: string
    title: string
    description?: string
    questions: Array<{
      id: string
      label: string
      type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
      options?: Array<{ value: string; label: string }>
      required?: boolean
      validation?: any
    }>
  }>
}

export function SurveyWizard({ surveyQuestions, ...wizardProps }: SurveyWizardProps) {
  const steps: WizardStepType[] = surveyQuestions.map(section => ({
    id: section.id,
    name: section.title,
    title: section.title,
    description: section.description,
    component: <SurveySection questions={section.questions} stepId={section.id} />,
    validation: (data) => {
      const errors: string[] = []
      section.questions.forEach(question => {
        if (question.required && !data?.[question.id]) {
          errors.push(`${question.label} is required`)
        }
      })
      return errors
    }
  }))

  return (
    <Wizard
      {...wizardProps}
      steps={steps}
      className="survey-wizard"
    >
      <ProgressBar variant="compact" className="mb-6" />
      
      <div className="wizard-content">
        {surveyQuestions.map(section => (
          <WizardStep key={section.id} id={section.id}>
            <SurveySection questions={section.questions} stepId={section.id} />
          </WizardStep>
        ))}
      </div>
      
      <WizardNavigation />
    </Wizard>
  )
}

// Survey Section Component
function SurveySection({ 
  questions, 
  stepId 
}: { 
  questions: Array<{
    id: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
    options?: Array<{ value: string; label: string }>
    required?: boolean
    validation?: any
  }>
  stepId: string 
}) {
  return (
    <div className="space-y-6">
      {questions.map(question => (
        <FormField
          key={question.id}
          label={question.label}
          stepId={stepId}
          fieldId={question.id}
          type={question.type}
          options={question.options}
          required={question.required}
          validation={question.validation}
        />
      ))}
    </div>
  )
}

// Multi-step form wizard template
export interface MultiStepFormWizardProps extends Omit<WizardProps, 'steps' | 'children'> {
  formSections: Array<{
    id: string
    title: string
    description?: string
    fields: Array<{
      id: string
      label: string
      type: string
      [key: string]: any
    }>
    validation?: (data: any) => string[]
  }>
}

export function MultiStepFormWizard({ formSections, ...wizardProps }: MultiStepFormWizardProps) {
  const steps: WizardStepType[] = formSections.map(section => ({
    id: section.id,
    name: section.title,
    title: section.title,
    description: section.description,
    component: <FormSection fields={section.fields} stepId={section.id} />,
    validation: section.validation
  }))

  return (
    <Wizard
      {...wizardProps}
      steps={steps}
      className="multi-step-form-wizard"
    >
      <ProgressBar className="mb-6" />
      
      <div className="wizard-content">
        {formSections.map(section => (
          <WizardStep key={section.id} id={section.id}>
            <FormSection fields={section.fields} stepId={section.id} />
          </WizardStep>
        ))}
      </div>
      
      <WizardNavigation />
    </Wizard>
  )
}

// Form Section Component
function FormSection({ 
  fields, 
  stepId 
}: { 
  fields: Array<{
    id: string
    label: string
    type: string
    [key: string]: any
  }>
  stepId: string 
}) {
  return (
    <div className="space-y-6">
      {fields.map(field => (
        <FormField
          key={field.id}
          label={field.label}
          stepId={stepId}
          fieldId={field.id}
          type={field.type}
          {...field}
        />
      ))}
    </div>
  )
}
