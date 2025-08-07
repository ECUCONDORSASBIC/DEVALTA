/**
 * 💳 MERCADOPAGO PAYMENT COMPONENT - ALTAMEDICA
 * Componente React unificado para integración con MercadoPago
 * Versión centralizada para todas las aplicaciones
 */

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Badge,
  Alert,
  AlertDescription 
} from '@altamedica/ui';
import { Loader2, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Tipos de datos
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

interface PaymentResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  status: string;
  external_reference: string;
}

interface CardData {
  cardNumber: string;
  cardName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  installments: string;
}

interface MercadoPagoPaymentProps {
  paymentData: PaymentData;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
  useCustomSelect?: boolean; // Para compatibilidad con versiones que usan Select custom
}

export const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
  paymentData,
  onSuccess,
  onError,
  onCancel,
  className = '',
  useCustomSelect = false
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'cancelled'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    installments: '1'
  });

  // Función para crear la preferencia de pago
  const createPaymentPreference = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const data = await response.json();
      setPaymentResponse(data);
      
      // En producción, redirigir a MercadoPago
      if (process.env.NODE_ENV === 'production' && data.init_point) {
        window.location.href = data.init_point;
      } else {
        // En desarrollo, mostrar formulario de tarjeta
        setShowCardForm(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      setPaymentStatus('error');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar el pago con tarjeta (desarrollo/testing)
  const processCardPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validación básica
      if (!cardData.cardNumber || !cardData.cardName || !cardData.cvv) {
        throw new Error('Por favor complete todos los campos de la tarjeta');
      }

      const response = await fetch('/api/v1/payments/mercadopago/process-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          card: cardData
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago con tarjeta');
      }

      const data = await response.json();
      setPaymentStatus('success');
      onSuccess?.(data.payment_id);
      
      // Mostrar mensaje de éxito
      setTimeout(() => {
        setShowCardForm(false);
        setPaymentStatus('idle');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      setPaymentStatus('error');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar el pago
  const handleCancel = () => {
    setPaymentStatus('cancelled');
    setShowCardForm(false);
    onCancel?.();
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Renderizado condicional del estado
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">¡Pago Exitoso!</h3>
            <p className="text-gray-600">Tu pago ha sido procesado correctamente</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <XCircle className="h-16 w-16 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-900">Error en el Pago</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => setPaymentStatus('idle')} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <AlertCircle className="h-16 w-16 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Pago Cancelado</h3>
            <p className="text-gray-600">El proceso de pago ha sido cancelado</p>
            <Button onClick={() => setPaymentStatus('idle')} variant="outline">
              Volver
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Select component helper for backwards compatibility
  const SelectField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    options 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pago con MercadoPago
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {paymentStatus !== 'idle' ? (
          renderPaymentStatus()
        ) : showCardForm ? (
          // Formulario de tarjeta (desarrollo/testing)
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <strong>Modo de desarrollo:</strong> Ingrese los datos de una tarjeta de prueba
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tarjeta
                </label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    cardNumber: formatCardNumber(e.target.value) 
                  }))}
                  maxLength={19}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre en la Tarjeta
                </label>
                <Input
                  type="text"
                  placeholder="JUAN PEREZ"
                  value={cardData.cardName}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    cardName: e.target.value.toUpperCase() 
                  }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Mes"
                  value={cardData.expirationMonth}
                  onChange={(value) => setCardData(prev => ({ ...prev, expirationMonth: value }))}
                  placeholder="MM"
                  options={Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({
                    value: month.toString().padStart(2, '0'),
                    label: month.toString().padStart(2, '0')
                  }))}
                />

                <SelectField
                  label="Año"
                  value={cardData.expirationYear}
                  onChange={(value) => setCardData(prev => ({ ...prev, expirationYear: value }))}
                  placeholder="YYYY"
                  options={Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => ({
                    value: year.toString(),
                    label: year.toString()
                  }))}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <Input
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({ 
                      ...prev, 
                      cvv: e.target.value.replace(/\D/g, '') 
                    }))}
                    maxLength={4}
                  />
                </div>
              </div>

              <SelectField
                label="Cuotas"
                value={cardData.installments}
                onChange={(value) => setCardData(prev => ({ ...prev, installments: value }))}
                placeholder="Seleccione cuotas"
                options={Array.from({ length: 12 }, (_, i) => i + 1).map(installment => ({
                  value: installment.toString(),
                  label: `${installment} ${installment === 1 ? 'cuota' : 'cuotas'}`
                }))}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={processCardPayment}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar ${paymentData.amount.toLocaleString('es-AR')}
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          // Vista inicial con resumen del pago
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen del Pago</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Descripción:</span>
                  <span className="font-medium">{paymentData.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-xl">
                    ${paymentData.amount.toLocaleString('es-AR')} {paymentData.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{paymentData.payer.email}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={createPaymentPreference}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando preferencia de pago...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continuar con el Pago
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export adicional para retrocompatibilidad
export default MercadoPagoPayment;