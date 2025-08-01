import { z } from 'zod';

// Model Registry Types
export const ModelMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  framework: z.enum(['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'custom']),
  modelType: z.enum(['classification', 'regression', 'clustering', 'nlp', 'custom']),
  inputSchema: z.record(z.any()).optional(),
  outputSchema: z.record(z.any()).optional(),
  metrics: z.record(z.number()).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  status: z.enum(['draft', 'staging', 'production', 'archived']),
  artifactPath: z.string(),
  deploymentEndpoints: z.array(z.string()).optional()
});

export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

// Feature Store Types
export const FeatureDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  dataType: z.enum(['numeric', 'categorical', 'text', 'datetime', 'embedding']),
  shape: z.array(z.number()).optional(),
  source: z.object({
    type: z.enum(['firestore', 'bigquery', 'realtime', 'computed']),
    collection: z.string().optional(),
    table: z.string().optional(),
    query: z.string().optional()
  }),
  transformations: z.array(z.object({
    type: z.string(),
    params: z.record(z.any())
  })).optional(),
  version: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FeatureDefinition = z.infer<typeof FeatureDefinitionSchema>;

export const FeatureSetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()), // Feature IDs
  entity: z.string(), // e.g., 'patient', 'appointment', 'provider'
  version: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FeatureSet = z.infer<typeof FeatureSetSchema>;

// Training Pipeline Types
export const TrainingConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  modelType: z.string(),
  framework: z.string(),
  dataSource: z.object({
    featureSetId: z.string(),
    filters: z.record(z.any()).optional(),
    splitRatio: z.object({
      train: z.number(),
      validation: z.number(),
      test: z.number()
    })
  }),
  hyperparameters: z.record(z.any()),
  trainingParams: z.object({
    epochs: z.number().optional(),
    batchSize: z.number().optional(),
    learningRate: z.number().optional(),
    optimizer: z.string().optional(),
    lossFunction: z.string().optional(),
    metrics: z.array(z.string()).optional()
  }),
  infrastructure: z.object({
    compute: z.enum(['cpu', 'gpu', 'tpu']).optional(),
    memory: z.string().optional(),
    maxDuration: z.number().optional() // in minutes
  }).optional(),
  schedule: z.object({
    type: z.enum(['once', 'recurring']),
    cron: z.string().optional(),
    startDate: z.date().optional()
  }).optional(),
  outputConfig: z.object({
    modelRegistryId: z.string().optional(),
    artifactStorage: z.string(),
    exportFormats: z.array(z.string()).optional()
  })
});

export type TrainingConfig = z.infer<typeof TrainingConfigSchema>;

export const TrainingJobSchema = z.object({
  id: z.string(),
  configId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  metrics: z.record(z.number()).optional(),
  logs: z.array(z.object({
    timestamp: z.date(),
    level: z.string(),
    message: z.string()
  })).optional(),
  artifacts: z.object({
    modelPath: z.string().optional(),
    checkpoints: z.array(z.string()).optional(),
    reports: z.array(z.string()).optional()
  }).optional(),
  error: z.string().optional()
});

export type TrainingJob = z.infer<typeof TrainingJobSchema>;

// Inference Types
export const InferenceRequestSchema = z.object({
  modelId: z.string(),
  modelVersion: z.string().optional(),
  input: z.any(),
  options: z.object({
    batchSize: z.number().optional(),
    timeout: z.number().optional(),
    format: z.enum(['json', 'numpy', 'tensor']).optional()
  }).optional()
});

export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;

export const InferenceResponseSchema = z.object({
  requestId: z.string(),
  modelId: z.string(),
  modelVersion: z.string(),
  predictions: z.any(),
  confidence: z.array(z.number()).optional(),
  metadata: z.object({
    inferenceTime: z.number(), // milliseconds
    modelLoadTime: z.number().optional(),
    preprocessingTime: z.number().optional(),
    postprocessingTime: z.number().optional()
  }),
  timestamp: z.date()
});

export type InferenceResponse = z.infer<typeof InferenceResponseSchema>;

// Cache Types
export const ModelCacheEntrySchema = z.object({
  modelId: z.string(),
  version: z.string(),
  loadedAt: z.date(),
  lastUsed: z.date(),
  usageCount: z.number(),
  sizeInMemory: z.number(), // bytes
  ttl: z.number().optional() // seconds
});

export type ModelCacheEntry = z.infer<typeof ModelCacheEntrySchema>;

// Export all schemas as a collection
export const MLCoreSchemas = {
  ModelMetadataSchema,
  FeatureDefinitionSchema,
  FeatureSetSchema,
  TrainingConfigSchema,
  TrainingJobSchema,
  InferenceRequestSchema,
  InferenceResponseSchema,
  ModelCacheEntrySchema
};
