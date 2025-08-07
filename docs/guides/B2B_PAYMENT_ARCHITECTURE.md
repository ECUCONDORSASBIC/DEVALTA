# 🏥 AltaMedica B2B Matching System - Arquitectura de Pagos

## 💳 Sistema de Pagos Integrado para Matching B2B

### Stack Recomendado para Pagos

```typescript
// Arquitectura de Pagos Multi-Provider
{
  "primary": "Stripe Connect",     // Para pagos internacionales B2B
  "colombia": "PayU Latam",        // Para pagos locales colombianos
  "backup": "Mercado Pago",        // Respaldo regional
  "crypto": "Web3 Payments"        // Futuro: pagos descentralizados
}
```

## 🔄 Integración con Backend/Frontend/API

### 1. **Backend Integration** 

#### A. API Server Extension (Node.js/TypeScript)
```typescript
// apps/api-server/src/routes/matching-payments.ts
import { Router } from 'express'
import Stripe from 'stripe'
import { PayUService } from '../services/payu'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Crear pago por match exitoso
router.post('/matching/:matchId/payment', requireAuth, async (req, res) => {
  const { matchId } = req.params
  const { amount, currency, paymentMethod } = req.body
  
  try {
    let paymentResult
    
    if (currency === 'COP') {
      // Usar PayU para Colombia
      paymentResult = await PayUService.createPayment({
        matchId,
        amount,
        currency,
        description: `AltaMedica B2B Match Payment - ${matchId}`
      })
    } else {
      // Usar Stripe para internacional
      paymentResult = await StripeService.createPaymentIntent({
        amount,
        currency,
        metadata: { matchId, type: 'b2b_match' }
      })
    }
    
    res.json(paymentResult)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Webhook para confirmación de pagos
router.post('/webhooks/payments', async (req, res) => {
  const event = req.body
  
  if (event.type === 'payment.successful') {
    // Activar partnership
    await activatePartnership(event.data.matchId)
    
    // Notificar a ambas empresas
    await NotificationService.sendPartnershipConfirmation(event.data)
  }
  
  res.json({ received: true })
})
```

#### B. Stripe Connect para Marketplace
```typescript
// services/stripe-connect.ts
export class StripeConnectService {
  async createConnectedAccount(companyData: Company) {
    return await stripe.accounts.create({
      type: 'express',
      country: 'CO',
      email: companyData.contactInfo.email,
      business_type: 'company',
      company: {
        name: companyData.name,
        tax_id: companyData.taxId,
        address: {
          line1: companyData.address.street,
          city: companyData.address.city,
          state: companyData.address.state,
          postal_code: companyData.address.zipCode,
          country: 'CO'
        }
      }
    })
  }

  async processMarketplacePayment(matchData: MatchResult) {
    const platformFee = Math.round(matchData.estimated_cost * 0.05) // 5% comisión
    
    return await stripe.paymentIntents.create({
      amount: matchData.estimated_cost * 100, // Centavos
      currency: 'cop',
      application_fee_amount: platformFee * 100,
      transfer_data: {
        destination: matchData.matched_company.stripe_account_id,
      },
      metadata: {
        match_id: matchData.match_id,
        requesting_company: matchData.requesting_company.id,
        matched_company: matchData.matched_company.id
      }
    })
  }
}
```

### 2. **Frontend Integration** (Companies App)

#### A. Componente de Pago
```typescript
// components/payments/MatchPayment.tsx
'use client'

import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface MatchPaymentProps {
  matchResult: MatchResult
  onPaymentSuccess: (paymentIntent: any) => void
}

function PaymentForm({ matchResult, onPaymentSuccess }: MatchPaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) return

    setIsProcessing(true)

    // Crear payment intent en el backend
    const response = await fetch(`/api/matching/${matchResult.match_id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: matchResult.estimated_cost,
        currency: 'cop',
        paymentMethod: 'card'
      })
    })

    const { client_secret } = await response.json()

    // Confirmar pago con Stripe
    const result = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: matchResult.requesting_company.name,
          email: matchResult.requesting_company.contactInfo.email
        }
      }
    })

    setIsProcessing(false)

    if (result.error) {
      console.error('Error en el pago:', result.error)
    } else {
      onPaymentSuccess(result.paymentIntent)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar Partnership - {matchResult.matched_company.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumen del costo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Costo del servicio:</span>
              <span className="font-semibold">{formatCurrency(matchResult.estimated_cost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Comisión AltaMedica (5%):</span>
              <span>{formatCurrency(matchResult.estimated_cost * 0.05)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center font-bold">
              <span>Total:</span>
              <span>{formatCurrency(matchResult.estimated_cost * 1.05)}</span>
            </div>
          </div>

          {/* Datos de tarjeta */}
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>

          {/* Términos y condiciones */}
          <div className="text-sm text-gray-600">
            <p>Al proceder con el pago:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Aceptas los términos del partnership médico</li>
              <li>El pago se procesa de forma segura</li>
              <li>Se notificará a ambas instituciones</li>
              <li>El partnership se activará automáticamente</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Procesando...' : `Pagar ${formatCurrency(matchResult.estimated_cost * 1.05)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function MatchPayment({ matchResult, onPaymentSuccess }: MatchPaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm matchResult={matchResult} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  )
}
```

#### B. Hook de Pagos
```typescript
// hooks/usePayments.ts
import { useMutation, useQuery } from '@tanstack/react-query'

export function useMatchPayment() {
  return useMutation({
    mutationFn: async ({ matchId, paymentData }: { matchId: string; paymentData: any }) => {
      const response = await fetch(`/api/matching/${matchId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })
      
      if (!response.ok) {
        throw new Error('Error processing payment')
      }
      
      return response.json()
    }
  })
}

export function usePaymentHistory(companyId: string) {
  return useQuery({
    queryKey: ['payment-history', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/payments`)
      if (!response.ok) throw new Error('Error loading payment history')
      return response.json()
    }
  })
}

export function useStripeAccount(companyId: string) {
  return useQuery({
    queryKey: ['stripe-account', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${companyId}/stripe-account`)
      if (!response.ok) throw new Error('Error loading Stripe account')
      return response.json()
    }
  })
}
```

### 3. **API Routes** (Next.js)

```typescript
// apps/companies/src/app/api/matching/[matchId]/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StripeConnectService } from '@/services/stripe-connect'
import { validateAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const user = await validateAuth(request)
    const body = await request.json()
    const { matchId } = params

    // Obtener datos del match
    const matchData = await getMatchData(matchId)
    
    if (!matchData) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Procesar pago
    const stripeService = new StripeConnectService()
    const paymentIntent = await stripeService.processMarketplacePayment(matchData)

    // Guardar transacción en la base de datos
    await savePaymentTransaction({
      matchId,
      paymentIntentId: paymentIntent.id,
      amount: body.amount,
      status: 'pending',
      companyId: user.companyId
    })

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
```

## 💰 Modelos de Monetización

### 1. **Comisión por Match** 
- 5% sobre el valor del servicio
- Mínimo: $50,000 COP
- Máximo: $500,000 COP

### 2. **Suscripciones Premium**
```typescript
const subscriptionPlans = {
  basic: {
    price: 99000, // COP/mes
    matches_limit: 10,
    features: ['basic_matching', 'email_support']
  },
  pro: {
    price: 299000, // COP/mes  
    matches_limit: 50,
    features: ['advanced_matching', 'priority_support', 'analytics']
  },
  enterprise: {
    price: 599000, // COP/mes
    matches_limit: 'unlimited',
    features: ['custom_matching', 'dedicated_support', 'api_access']
  }
}
```

### 3. **Revenue Share**
- Partners recurrentes: 2% del valor generado
- Referrals exitosos: 1% por cada remisión
- Equipamiento compartido: 3% del alquiler

## 🔒 Seguridad y Compliance

### A. **PCI Compliance**
```typescript
// Security measures
const securityConfig = {
  encryption: 'AES-256',
  tokenization: 'Stripe Elements',
  fraud_detection: 'Stripe Radar',
  compliance: ['PCI-DSS Level 1', 'SOC 2 Type II']
}
```

### B. **Auditoría de Transacciones**
```typescript
// Logging financiero para compliance médico
const auditLog = {
  transaction_id: 'tx_123',
  match_id: 'match_456', 
  companies_involved: ['hosp_001', 'clin_002'],
  amount: 250000,
  currency: 'COP',
  commission: 12500,
  medical_service_type: 'cardiology_referral',
  patient_anonymized_id: 'patient_hash_789',
  timestamp: '2025-08-04T15:30:00Z',
  compliance_flags: ['HIPAA_compliant', 'local_regulation_met']
}
```

## 🚀 Implementación Progresiva

### Fase 1: MVP (2 semanas)
- [ ] Stripe básico para pagos únicos
- [ ] Comisión fija del 5%
- [ ] Dashboard de pagos simple

### Fase 2: Marketplace (4 semanas)  
- [ ] Stripe Connect implementado
- [ ] PayU para Colombia
- [ ] Sistema de subscripciones

### Fase 3: Advanced (8 semanas)
- [ ] Revenue share automático
- [ ] Analytics financieros avanzados
- [ ] Integración con ERP médicos

Esta arquitectura te permite tener un sistema de pagos robusto, escalable y compliance con regulaciones médicas colombianas! 🏥💳
