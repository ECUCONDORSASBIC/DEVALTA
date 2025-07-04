# Interactive Anamnesis Stepper 3D

A comprehensive 5-step interactive anamnesis flow built with Zustand, Three.js, and React Three Fiber.

## Features

### 🔧 Technology Stack
- **Zustand**: Global state management for the stepper
- **React Three Fiber**: 3D rendering
- **Drei**: 3D helpers and components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### 📋 5-Step Process

1. **Intro & Consent** (`ConsentStep.tsx`)
   - Medical consent forms
   - Data processing agreements
   - Telemedicine consent
   - GDPR compliance

2. **Personal Data Autofill** (`PersonalDataStep.tsx`)
   - Automatic data loading via API
   - Editable patient information
   - Emergency contacts
   - Medical history & allergies

3. **Symptom Location** (`SymptomLocationStep.tsx`)
   - Interactive 3D body part selection
   - Raycaster-based clicking
   - Visual highlighting of selected areas
   - Multiple symptom locations support

4. **Symptom Details** (`SymptomDetailsStep.tsx`)
   - Pain level sliders (0-10 scale)
   - Pain type selection with icons
   - Trigger and relief factors
   - Color-coded heatmap generation
   - Associated symptoms

5. **Review & Confirmation** (`ReviewStep.tsx`)
   - Complete data summary
   - Doctor notes
   - Final confirmation

## Components

### Main Components

- `InteractiveAnamnesisStepper.tsx` - Main stepper orchestrator
- `anamnesisStore.ts` - Zustand store with state management
- `PatientAvatar.tsx` - Enhanced with highlighting support

### Store Structure

```typescript
interface AnamnesisStore {
  // Navigation
  currentStep: number
  totalSteps: number
  steps: AnamnesisStep[]
  
  // Step Data
  consent: ConsentData | null
  personalData: PatientPersonalData | null
  symptomLocations: SymptomLocation[]
  symptomDetails: SymptomDetails[]
  reviewData: ReviewData
  
  // 3D Synchronization
  patientAvatarAnimations: {
    currentAnimation: string
    highlightedBodyParts: string[]
    isHighlighting: boolean
  }
  
  // Actions
  actions: {
    nextStep: () => void
    previousStep: () => void
    // ... more actions
  }
}
```

## Usage

### Basic Implementation

```tsx
import { InteractiveAnamnesisStepper } from '@/components/scene/anamnesis'
import { useRef } from 'react'
import { Group } from 'three'

function MedicalScene() {
  const patientAvatarRef = useRef<Group>(null)
  
  return (
    <Canvas>
      <PatientAvatar 
        ref={patientAvatarRef}
        enableAnamnesisSync={true}
      />
      <InteractiveAnamnesisStepper 
        patientAvatarRef={patientAvatarRef}
      />
    </Canvas>
  )
}
```

### Store Usage

```tsx
import { useAnamnesisStore } from '@/stores/anamnesisStore'

function CustomComponent() {
  const { currentStep, actions } = useAnamnesisStore()
  
  return (
    <div>
      <p>Current Step: {currentStep + 1}</p>
      <button onClick={actions.nextStep}>Next</button>
    </div>
  )
}
```

## Features in Detail

### 🎯 Raycaster Integration
- Click detection on 3D patient model
- Body part mapping and highlighting
- Visual feedback for selections

### 🎨 3D Widgets
- Pain level sliders with color coding
- Interactive buttons for symptom types
- Heatmap point generation
- Real-time visual updates

### 🔄 State Synchronization
- Patient avatar animations sync with selections
- Body part highlighting in real-time
- UI overlay updates
- Progress tracking

### 📱 Responsive Design
- Adaptive UI components
- Touch-friendly interactions
- Mobile-optimized controls

## API Integration

### Mock API Functions
```typescript
// Personal data loading
const mockLoadPersonalData = async (patientId: string): Promise<PatientPersonalData>

// Could be extended to:
// - Save anamnesis data
// - Load existing anamnesis
// - Sync with EHR systems
```

## Development

### Running the Demo

```bash
# Navigate to web-app
cd apps/web-app

# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev

# Visit the demo page
http://localhost:3000/anamnesis-demo
```

### Customization

#### Adding New Steps

1. Create step component in `steps/` directory
2. Add step to `DEFAULT_STEPS` in store
3. Update `renderCurrentStep()` in main stepper
4. Add step-specific state and actions

#### Modifying Body Parts

Update the `BODY_PARTS` mapping in `SymptomLocationStep.tsx`:

```typescript
const BODY_PARTS = {
  newBodyPart: { name: 'New Part', color: '#ff0000' },
  // ... existing parts
}
```

#### Custom 3D Models

Update the mesh mapping in `PatientAvatar.tsx`:

```typescript
const mapBodyPartMeshes = (object: any) => {
  if (object.isMesh) {
    const name = object.name.toLowerCase()
    if (name.includes('your_mesh_name')) {
      bodyPartsRefs.current.yourBodyPart = object
    }
  }
}
```

## Browser Support

- Modern browsers with WebGL support
- Chrome 90+, Firefox 88+, Safari 14+
- Mobile browsers with hardware acceleration

## Performance

- Optimized for 60fps rendering
- Efficient state updates with Zustand
- Lazy loading for 3D assets
- Memory management for large models

## Future Enhancements

- [ ] Voice input for symptoms
- [ ] AR/VR support
- [ ] Advanced AI symptom analysis
- [ ] Real EHR integration
- [ ] Multi-language support
- [ ] Accessibility improvements

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Include unit tests for store actions
4. Update documentation for new components
