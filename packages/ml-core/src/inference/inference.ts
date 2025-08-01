import * as tf from '@tensorflow/tfjs-node';
import { Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import { logger } from '@alta/logger';
import { InferenceRequest, InferenceResponse, InferenceRequestSchema, InferenceResponseSchema } from '../types';

export class InferenceHelper {
  private firestore: Firestore;
  private storage: Storage;
  private bucketName: string;
  private cache: Map<string, tf.LayersModel> = new Map();

  constructor(firestore: Firestore, storage: Storage, bucketName: string) {
    this.firestore = firestore;
    this.storage = storage;
    this.bucketName = bucketName;
  }

  /**
   * Load model for inference
   */
  async loadModelForInference(modelId: string, version?: string): Promise<tf.LayersModel> {
    try {
      const cacheKey = version ? `${modelId}:${version}` : modelId;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      // Get model metadata
      const modelDoc = version
        ? await this.firestore.collection('ml_models').where('id', '==', modelId).where('version', '==', version).get()
        : await this.firestore.collection('ml_models').doc(modelId).get();

      if (version && modelDoc.empty) {
        throw new Error(`Model not found: ${modelId} version ${version}`);
      }
      
      const modelData = modelDoc.empty ? modelDoc.docs[0].data() : modelDoc.data();
      const modelPath = modelData.artifactPath.replace(`gs://${this.bucketName}/`, '');
      const bucket = this.storage.bucket(this.bucketName);

      // Download and load model
      const modelDir = `./model_cache/${modelId}/${version || 'latest'}`;
      await bucket.file(modelPath).download({ destination: `${modelDir}/model.json` });
      const model = await tf.loadLayersModel(`file://${modelDir}/model.json`);

      // Cache model
      this.cache.set(cacheKey, model);
      return model;
    } catch (error) {
      logger.error('Failed to load model for inference', error);
      throw error;
    }
  }

  /**
   * Make a prediction
   */
  async predict(request: InferenceRequest): Promise<InferenceResponse> {
    let model: tf.LayersModel;

    try {
      const validatedRequest = InferenceRequestSchema.parse(request);

      // Load model for inference
      model = await this.loadModelForInference(validatedRequest.modelId, validatedRequest.modelVersion);

      // Prepare model input
      const inputTensor = tf.tensor(validatedRequest.input);

      // Run inference
      const predictionTensor = model.predict(inputTensor) as tf.Tensor;

      // Collect results and prepare response
      const predictions = await predictionTensor.array();
      const response: InferenceResponse = {
        requestId: validatedRequest.modelId,
        modelId: validatedRequest.modelId,
        modelVersion: validatedRequest.modelVersion || 'latest',
        predictions,
        metadata: {
          inferenceTime: Date.now()
        },
        timestamp: new Date()
      };

      predictionTensor.dispose();
      inputTensor.dispose();

      // Validate response
      const validatedResponse = InferenceResponseSchema.parse(response);

      return validatedResponse;
    } catch (error) {
      logger.error('Failed to make prediction', error);
      throw error;
    }
  }
}
