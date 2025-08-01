import debug from 'debug';
import { IMessageInterceptor } from '../types/transport.js';

const log = debug('altamedica:interceptor');

/**
 * Create a logging interceptor
 */
export function createLoggingInterceptor(
  options: {
    logOutgoing?: boolean;
    logIncoming?: boolean;
    logHeaders?: boolean;
    maxBodyLength?: number;
  } = {}
): IMessageInterceptor {
  const {
    logOutgoing = true,
    logIncoming = true,
    logHeaders = false,
    maxBodyLength = 1000,
  } = options;

  return {
    async onSend(message: any, headers: Record<string, string>) {
      if (logOutgoing) {
        const messageStr = JSON.stringify(message);
        const truncated = messageStr.length > maxBodyLength 
          ? messageStr.substring(0, maxBodyLength) + '...' 
          : messageStr;

        log('Outgoing message:', {
          type: message.type,
          id: message.id,
          body: truncated,
          headers: logHeaders ? headers : undefined,
        });
      }

      return { message, headers };
    },

    async onReceive(message: any, headers: Record<string, string>) {
      if (logIncoming) {
        const messageStr = JSON.stringify(message);
        const truncated = messageStr.length > maxBodyLength 
          ? messageStr.substring(0, maxBodyLength) + '...' 
          : messageStr;

        log('Incoming message:', {
          type: message.type,
          id: message.id,
          body: truncated,
          headers: logHeaders ? headers : undefined,
        });
      }

      return { message, headers };
    },
  };
}

/**
 * Create a metrics interceptor
 */
export function createMetricsInterceptor(
  onMetric: (metric: {
    direction: 'incoming' | 'outgoing';
    type: string;
    size: number;
    timestamp: Date;
    headers: Record<string, string>;
  }) => void
): IMessageInterceptor {
  return {
    async onSend(message: any, headers: Record<string, string>) {
      const size = JSON.stringify(message).length;
      
      onMetric({
        direction: 'outgoing',
        type: message.type || 'unknown',
        size,
        timestamp: new Date(),
        headers,
      });

      return { message, headers };
    },

    async onReceive(message: any, headers: Record<string, string>) {
      const size = JSON.stringify(message).length;
      
      onMetric({
        direction: 'incoming',
        type: message.type || 'unknown',
        size,
        timestamp: new Date(),
        headers,
      });

      return { message, headers };
    },
  };
}

/**
 * Create a header enrichment interceptor
 */
export function createHeaderEnrichmentInterceptor(
  enrichHeaders: (headers: Record<string, string>) => Record<string, string>
): IMessageInterceptor {
  return {
    async onSend(message: any, headers: Record<string, string>) {
      const enrichedHeaders = enrichHeaders(headers);
      return { message, headers: { ...headers, ...enrichedHeaders } };
    },
  };
}

/**
 * Create a message validation interceptor
 */
export function createValidationInterceptor(
  validate: (message: any, direction: 'incoming' | 'outgoing') => void
): IMessageInterceptor {
  return {
    async onSend(message: any, headers: Record<string, string>) {
      validate(message, 'outgoing');
      return { message, headers };
    },

    async onReceive(message: any, headers: Record<string, string>) {
      validate(message, 'incoming');
      return { message, headers };
    },
  };
}

/**
 * Create a message transformation interceptor
 */
export function createTransformationInterceptor(
  options: {
    transformOutgoing?: (message: any) => any;
    transformIncoming?: (message: any) => any;
  }
): IMessageInterceptor {
  return {
    async onSend(message: any, headers: Record<string, string>) {
      const transformed = options.transformOutgoing 
        ? options.transformOutgoing(message) 
        : message;
      return { message: transformed, headers };
    },

    async onReceive(message: any, headers: Record<string, string>) {
      const transformed = options.transformIncoming 
        ? options.transformIncoming(message) 
        : message;
      return { message: transformed, headers };
    },
  };
}
