import mercadopago from 'mercadopago';

/**
 * Configuración de MercadoPago para api-server
 */

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

export const mercadopagoConfig = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
  environment: process.env.MERCADOPAGO_ENVIRONMENT || 'test',
  country: process.env.MERCADOPAGO_COUNTRY || 'AR',
  currency: process.env.MERCADOPAGO_CURRENCY || 'ARS',
  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL,
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
};

export const createPaymentPreference = async (preferenceData: any) => {
  try {
    const preference = {
      items: [
        {
          id: 'telemedicine-session',
          title: preferenceData.description,
          quantity: 1,
          unit_price: preferenceData.amount,
          currency_id: preferenceData.currency,
        },
      ],
      payer: {
        email: preferenceData.payer.email,
        name: preferenceData.payer.name,
        identification: preferenceData.payer.identification,
      },
      external_reference: preferenceData.external_reference || `altamedica-${Date.now()}`,
      notification_url: preferenceData.notification_url || mercadopagoConfig.webhookUrl,
      back_urls: preferenceData.back_urls,
      auto_return: preferenceData.auto_return || 'approved',
      expires: preferenceData.expires !== false,
      expiration_date_from: preferenceData.expiration_date_from,
      expiration_date_to: preferenceData.expiration_date_to,
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }, // Excluir pagos en efectivo para telemedicina
        ],
        installments: 12, // Permitir hasta 12 cuotas
      },
      statement_descriptor: 'ALTAMEDICA',
      binary_mode: true, // Solo éxito o fallo, no pendiente
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    throw error;
  }
};

export const getPaymentInfo = async (paymentId: string) => {
  try {
    const payment = await mercadopago.payment.findById(paymentId);
    return payment.body;
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId: string, amount?: number) => {
  try {
    const refundData = amount ? { amount } : {};
    const refund = await mercadopago.refund.create({
      payment_id: paymentId,
      ...refundData,
    });
    return refund.body;
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

export const getPaymentMethods = async (country: string = 'AR') => {
  try {
    const paymentMethods = await mercadopago.payment_methods.list({ country });
    return paymentMethods.body;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

export default {
  config: mercadopagoConfig,
  createPaymentPreference,
  getPaymentInfo,
  refundPayment,
  getPaymentMethods,
};