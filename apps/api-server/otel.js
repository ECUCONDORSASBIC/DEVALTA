// OpenTelemetry configuration for Altamedica API Server

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const traceExporter = new OTLPTraceExporter({
  // Configure endpoint via environment variables or defaults
});

const sdk = new NodeSDK({
  traceExporter,
  serviceName: 'altamedica-api',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()
  .then(() => {
    console.log('OpenTelemetry initialized');
  })
  .catch((error) => {
    console.error('Error initializing OpenTelemetry', error);
  });