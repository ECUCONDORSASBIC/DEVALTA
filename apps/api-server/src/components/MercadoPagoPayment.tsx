/**
 * 💳 MERCADOPAGO PAYMENT COMPONENT - ALTAMEDICA
 * Componente React para integración con MercadoPago
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface MercadoPagoPaymentProps {
  paymentData: PaymentData;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
  paymentData,
  onSuccess,
  onError,
  onCancel,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null);

  // Estados para formulario de tarjeta
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    installments: '1',
  });

  const [showCardForm, setShowCardForm] = useState(false);

  /**
   * Crear preferencia de pago
   */
  const createPaymentPreference = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/payments/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear preferencia de pago');
      }

      setPaymentResponse(result.data);
      setPaymentStatus('pending');

      // Redirigir a MercadoPago
      if (process.env.NODE_ENV === 'production') {
        window.location.href = result.data.init_point;
      } else {
        window.location.href = result.data.sandbox_init_point;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setPaymentStatus('error');
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Procesar pago con tarjeta
   */
  const processCardPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validar datos de tarjeta
      if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expirationMonth || !cardData.expirationYear || !cardData.cvv) {
        throw new Error('Por favor completa todos los campos de la tarjeta');
      }

      // Crear token de tarjeta
      const tokenResponse = await fetch('/api/v1/payments/mercadopago/card-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_number: cardData.cardNumber.replace(/\s/g, ''),
          cardholder: {
            name: cardData.cardholderName,
          },
          expiration_month: cardData.expirationMonth,
          expiration_year: cardData.expirationYear,
        }),
      });

      const tokenResult = await tokenResponse.json();

      if (!tokenResult.success) {
        throw new Error(tokenResult.error || 'Error al validar tarjeta');
      }

      // Procesar pago
      const paymentResponse = await fetch('/api/v1/payments/mercadopago', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_amount: paymentData.amount,
          token: tokenResult.data.id,
          description: paymentData.description,
          installments: parseInt(cardData.installments),
          payment_method_id: 'visa', // Se puede hacer dinámico
          payer: paymentData.payer,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Error al procesar pago');
      }

      setPaymentStatus('success');
      onSuccess?.(paymentResult.data.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setPaymentStatus('error');
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear número de tarjeta
   */
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
      return v;
    }
  };

  /**
   * Obtener tipo de tarjeta
   */
  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    
    return 'Tarjeta';
  };

  // Renderizar formulario de tarjeta
  const renderCardForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Tarjeta
        </label>
        <Input
          type="text"
          placeholder="1234 5678 9012 3456"
          value={cardData.cardNumber}
          onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
          maxLength={19}
          className="font-mono"
        />
        {cardData.cardNumber && (
          <Badge variant="secondary" className="mt-1">
            {getCardType(cardData.cardNumber)}
          </Badge>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titular de la Tarjeta
        </label>
        <Input
          type="text"
          placeholder="NOMBRE APELLIDO"
          value={cardData.cardholderName}
          onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes
          </label>
          <Select value={cardData.expirationMonth} onValueChange={(value) => setCardData(prev => ({ ...prev, expirationMonth: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año
          </label>
          <Select value={cardData.expirationYear} onValueChange={(value) => setCardData(prev => ({ ...prev, expirationYear: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <Input
            type="text"
            placeholder="123"
            value={cardData.cvv}
            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
            maxLength={4}
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cuotas
        </label>
        <Select value={cardData.installments} onValueChange={(value) => setCardData(prev => ({ ...prev, installments: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(installment => (
              <SelectItem key={installment} value={installment.toString()}>
                {installment} {installment === 1 ? 'cuota' : 'cuotas'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Renderizar estado de éxito
  if (paymentStatus === 'success') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-800">¡Pago Exitoso!</h3>
            <p className="text-gray-600">
              Tu pago ha sido procesado correctamente. Recibirás una confirmación por email.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar estado de error
  if (paymentStatus === 'error') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-800">Error en el Pago</h3>
            <p className="text-gray-600">
              {error || 'Hubo un problema al procesar tu pago. Por favor intenta nuevamente.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Intentar Nuevamente
              </Button>
              <Button onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pago con MercadoPago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen del pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Resumen del Pago</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Descripción:</span>
              <span>{paymentData.description}</span>
            </div>
            <div className="flex justify-between">
              <span>Monto:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: paymentData.currency,
                }).format(paymentData.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Paciente:</span>
              <span>{paymentData.payer.name}</span>
            </div>
          </div>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Opciones de pago */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCardForm(false)}
              variant={!showCardForm ? 'default' : 'outline'}
              className="flex-1"
            >
              Pago Rápido
            </Button>
            <Button
              onClick={() => setShowCardForm(true)}
              variant={showCardForm ? 'default' : 'outline'}
              className="flex-1"
            >
              Tarjeta Directa
            </Button>
          </div>

          {showCardForm ? (
            <div className="space-y-4">
              {renderCardForm()}
              <Button
                onClick={processCardPayment}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando Pago...
                  </>
                ) : (
                  'Pagar Ahora'
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={createPaymentPreference}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparando Pago...
                </>
              ) : (
                'Continuar con MercadoPago'
              )}
            </Button>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 text-center">
          <p>Tu pago será procesado de forma segura por MercadoPago</p>
          <p>Aceptamos todas las tarjetas principales y métodos de pago locales</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MercadoPagoPayment; 