# @altamedica/medical-components

Componentes médicos compartidos para la plataforma AltaMedica.

## Instalación

```bash
npm install @altamedica/medical-components
```

## Componentes Disponibles

### MercadoPagoPayment

Componente unificado para procesar pagos con MercadoPago.

#### Uso Básico

```tsx
import { MercadoPagoPayment } from '@altamedica/medical-components';

function PaymentPage() {
  const paymentData = {
    amount: 1500,
    currency: 'MXN',
    description: 'Consulta médica general',
    payer: {
      email: 'paciente@example.com',
      name: 'Juan Pérez',
      identification: {
        type: 'DNI',
        number: '12345678'
      }
    }
  };

  const handleSuccess = (paymentId: string) => {
    console.log('Pago exitoso:', paymentId);
    // Redirigir o mostrar confirmación
  };

  const handleError = (error: string) => {
    console.error('Error en el pago:', error);
    // Mostrar mensaje de error
  };

  return (
    <MercadoPagoPayment
      paymentData={paymentData}
      onSuccess={handleSuccess}
      onError={handleError}
      onCancel={() => console.log('Pago cancelado')}
    />
  );
}
```

#### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `paymentData` | `PaymentData` | Datos del pago a procesar | ✅ |
| `onSuccess` | `(paymentId: string) => void` | Callback cuando el pago es exitoso | ❌ |
| `onError` | `(error: string) => void` | Callback cuando hay un error | ❌ |
| `onCancel` | `() => void` | Callback cuando se cancela el pago | ❌ |
| `className` | `string` | Clases CSS adicionales | ❌ |
| `useCustomSelect` | `boolean` | Usar Select personalizado (compatibilidad) | ❌ |

#### Tipos

```typescript
interface PaymentData {
  amount: number;
  currency: 'ARS' | 'BRL' | 'CLP' | 'COP' | 'MXN' | 'PEN' | 'UYU';
  description: string;
  payer: {
    email: string;
    name: string;
    identification: {
      type: 'CPF' | 'CNPJ' | 'DNI' | 'CC' | 'CE' | 'RUT';
      number: string;
    };
  };
  session_id?: string;
}
```

## Migración desde Versiones Locales

Si estabas importando MercadoPagoPayment desde una ubicación local:

```tsx
// Antes ❌
import { MercadoPagoPayment } from '../components/MercadoPagoPayment';

// Ahora ✅
import { MercadoPagoPayment } from '@altamedica/medical-components';
```

## Características

- ✅ **Unificado**: Una sola versión para todas las apps
- ✅ **Tipado**: TypeScript completo con interfaces exportadas
- ✅ **Flexible**: Soporta múltiples monedas latinoamericanas
- ✅ **Desarrollo**: Modo de desarrollo con formulario de tarjeta de prueba
- ✅ **Producción**: Redirección automática a MercadoPago en producción
- ✅ **Retrocompatible**: Funciona con implementaciones existentes

## Soporte

Para reportar issues o solicitar features, contactar al equipo de desarrollo de AltaMedica.