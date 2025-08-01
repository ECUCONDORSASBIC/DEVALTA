import { Firestore } from 'firebase-admin/firestore';
import Bull from 'bull';
import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs-node';
import { logger } from '@alta/logger';
import { TrainingConfig, TrainingJob, TrainingConfigSchema, TrainingJobSchema } from '../types';
import { ModelRegistry } from '../model-registry/model-registry';
import { FeatureStore } from '../feature-store/feature-store';

export class TrainingPipeline {
  private firestore: Firestore;
  private queue: Bull.Queue;
  private modelRegistry: ModelRegistry;
  private featureStore: FeatureStore;
  private configCollection = 'ml_training_configs';
  private jobCollection = 'ml_training_jobs';

  constructor(
    firestore: Firestore,
    redisUrl: string,
    modelRegistry: ModelRegistry,
    featureStore: FeatureStore
  ) {
    this.firestore = firestore;
    this.modelRegistry = modelRegistry;
    this.featureStore = featureStore;
    
    // Initialize Bull queue for training jobs
    this.queue = new Bull('ml-training', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    // Process training jobs
    this.queue.process(async (job) => {
      return this.executeTrainingJob(job.data.jobId);
    });
  }

  /**
   * Create a new training pipeline configuration
   */
  async createTrainingConfig(
    config: Omit<TrainingConfig, 'id'>
  ): Promise<TrainingConfig> {
    try {
      const configId = uuidv4();
      const fullConfig: TrainingConfig = {
        ...config,
        id: configId
      };

      const validated = TrainingConfigSchema.parse(fullConfig);

      await this.firestore
        .collection(this.configCollection)
        .doc(configId)
        .set(validated);

      logger.info(`Training config created: ${configId}`, { name: config.name });
      return validated;
    } catch (error) {
      logger.error('Failed to create training config', error);
      throw error;
    }
  }

  /**
   * Start a training job
   */
  async startTrainingJob(configId: string): Promise<TrainingJob> {
    try {
      // Get training config
      const configDoc = await this.firestore
        .collection(this.configCollection)
        .doc(configId)
        .get();

      if (!configDoc.exists) {
        throw new Error(`Training config not found: ${configId}`);
      }

      const config = configDoc.data() as TrainingConfig;

      // Create training job
      const jobId = uuidv4();
      const job: TrainingJob = {
        id: jobId,
        configId,
        status: 'pending',
        startTime: new Date()
      };

      const validated = TrainingJobSchema.parse(job);

      await this.firestore
        .collection(this.jobCollection)
        .doc(jobId)
        .set({
          ...validated,
          startTime: Firestore.Timestamp.fromDate(validated.startTime!)
        });

      // Queue the job
      await this.queue.add({ jobId }, {
        priority: config.infrastructure?.compute === 'gpu' ? 1 : 0,
        delay: config.schedule?.type === 'recurring' ? this.calculateDelay(config.schedule) : 0
      });

      logger.info(`Training job started: ${jobId}`, { configId });
      return validated;
    } catch (error) {
      logger.error('Failed to start training job', error);
      throw error;
    }
  }

  /**
   * Execute a training job
   */
  private async executeTrainingJob(jobId: string): Promise<void> {
    let job: TrainingJob | null = null;
    
    try {
      // Update job status to running
      await this.updateJobStatus(jobId, 'running');
      
      // Get job and config
      const jobDoc = await this.firestore
        .collection(this.jobCollection)
        .doc(jobId)
        .get();
        
      job = jobDoc.data() as TrainingJob;
      
      const configDoc = await this.firestore
        .collection(this.configCollection)
        .doc(job.configId)
        .get();
        
      const config = configDoc.data() as TrainingConfig;

      // Load training data
      const trainingData = await this.loadTrainingData(config);
      
      // Train model based on framework
      let trainedModel: any;
      let metrics: Record<string, number> = {};
      
      switch (config.framework.toLowerCase()) {
        case 'tensorflow':
          ({ model: trainedModel, metrics } = await this.trainTensorFlowModel(config, trainingData));
          break;
        default:
          throw new Error(`Unsupported framework: ${config.framework}`);
      }

      // Save model artifacts
      const modelPath = await this.saveModelArtifacts(jobId, trainedModel, config);
      
      // Register model in registry
      const modelMetadata = await this.modelRegistry.registerModel({
        name: config.name,
        version: `v${Date.now()}`,
        description: `Trained by job ${jobId}`,
        framework: config.framework as any,
        modelType: config.modelType as any,
        metrics,
        createdBy: 'training-pipeline',
        status: 'staging',
        artifactPath: modelPath
      });

      // Update job with results
      await this.firestore
        .collection(this.jobCollection)
        .doc(jobId)
        .update({
          status: 'completed',
          endTime: Firestore.FieldValue.serverTimestamp(),
          metrics,
          artifacts: {
            modelPath,
            modelId: modelMetadata.id
          }
        });

      logger.info(`Training job completed: ${jobId}`, { modelId: modelMetadata.id, metrics });
    } catch (error) {
      logger.error(`Training job failed: ${jobId}`, error);
      
      await this.firestore
        .collection(this.jobCollection)
        .doc(jobId)
        .update({
          status: 'failed',
          endTime: Firestore.FieldValue.serverTimestamp(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
      throw error;
    }
  }

  /**
   * Load training data from feature store
   */
  private async loadTrainingData(config: TrainingConfig): Promise<{
    train: any;
    validation: any;
    test: any;
  }> {
    try {
      // Load features from feature store
      const features = await this.featureStore.loadFeatures(
        config.dataSource.featureSetId,
        config.dataSource.filters
      );

      // Split data according to ratios
      const totalSize = features.length;
      const trainSize = Math.floor(totalSize * config.dataSource.splitRatio.train);
      const valSize = Math.floor(totalSize * config.dataSource.splitRatio.validation);
      
      // Shuffle data
      const shuffled = features.sort(() => Math.random() - 0.5);
      
      return {
        train: shuffled.slice(0, trainSize),
        validation: shuffled.slice(trainSize, trainSize + valSize),
        test: shuffled.slice(trainSize + valSize)
      };
    } catch (error) {
      logger.error('Failed to load training data', error);
      throw error;
    }
  }

  /**
   * Train a TensorFlow model
   */
  private async trainTensorFlowModel(
    config: TrainingConfig,
    data: { train: any[]; validation: any[]; test: any[] }
  ): Promise<{ model: tf.LayersModel; metrics: Record<string, number> }> {
    try {
      // This is a simplified example - you would implement specific model architectures
      // based on the config.modelType
      
      // Create model
      const model = tf.sequential();
      
      // Add layers based on model type
      if (config.modelType === 'classification') {
        model.add(tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [10] // This should be dynamic based on features
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({
          units: 64,
          activation: 'relu'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({
          units: 2, // Binary classification - adjust based on classes
          activation: 'softmax'
        }));
      }

      // Compile model
      model.compile({
        optimizer: config.trainingParams.optimizer || 'adam',
        loss: config.trainingParams.lossFunction || 'categoricalCrossentropy',
        metrics: config.trainingParams.metrics || ['accuracy']
      });

      // Prepare data tensors
      const trainTensors = this.prepareDataTensors(data.train);
      const valTensors = this.prepareDataTensors(data.validation);
      
      // Train model
      const history = await model.fit(trainTensors.x, trainTensors.y, {
        epochs: config.trainingParams.epochs || 10,
        batchSize: config.trainingParams.batchSize || 32,
        validationData: [valTensors.x, valTensors.y],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            logger.info(`Epoch ${epoch + 1}`, logs);
          }
        }
      });

      // Evaluate on test set
      const testTensors = this.prepareDataTensors(data.test);
      const evaluation = model.evaluate(testTensors.x, testTensors.y) as tf.Scalar[];
      
      const metrics: Record<string, number> = {};
      const metricNames = ['loss', ...(config.trainingParams.metrics || ['accuracy'])];
      
      for (let i = 0; i < evaluation.length; i++) {
        metrics[metricNames[i]] = await evaluation[i].data()[0];
      }

      // Clean up tensors
      trainTensors.x.dispose();
      trainTensors.y.dispose();
      valTensors.x.dispose();
      valTensors.y.dispose();
      testTensors.x.dispose();
      testTensors.y.dispose();
      evaluation.forEach(t => t.dispose());

      return { model, metrics };
    } catch (error) {
      logger.error('Failed to train TensorFlow model', error);
      throw error;
    }
  }

  /**
   * Prepare data tensors for training
   */
  private prepareDataTensors(data: any[]): { x: tf.Tensor; y: tf.Tensor } {
    // This is a placeholder - implement based on your feature schema
    const features = data.map(d => Object.values(d).slice(0, 10) as number[]);
    const labels = data.map(d => d.label || 0);
    
    const x = tf.tensor2d(features);
    const y = tf.oneHot(tf.tensor1d(labels, 'int32'), 2);
    
    return { x, y };
  }

  /**
   * Save model artifacts
   */
  private async saveModelArtifacts(
    jobId: string,
    model: any,
    config: TrainingConfig
  ): Promise<string> {
    try {
      const artifactPath = `training-jobs/${jobId}/model`;
      
      // Save based on framework
      if (config.framework.toLowerCase() === 'tensorflow' && model.save) {
        await model.save(`file://./${artifactPath}`);
      }
      
      // Upload to model registry storage
      // This would integrate with your cloud storage
      
      return artifactPath;
    } catch (error) {
      logger.error('Failed to save model artifacts', error);
      throw error;
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: TrainingJob['status']): Promise<void> {
    await this.firestore
      .collection(this.jobCollection)
      .doc(jobId)
      .update({ status });
  }

  /**
   * Calculate delay for recurring jobs
   */
  private calculateDelay(schedule: TrainingConfig['schedule']): number {
    if (!schedule || schedule.type !== 'recurring' || !schedule.cron) {
      return 0;
    }
    
    // Simple implementation - you'd use a proper cron parser
    // This just returns 24 hours in milliseconds
    return 24 * 60 * 60 * 1000;
  }

  /**
   * Get training job status
   */
  async getJobStatus(jobId: string): Promise<TrainingJob | null> {
    try {
      const doc = await this.firestore
        .collection(this.jobCollection)
        .doc(jobId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        ...data,
        startTime: data.startTime?.toDate(),
        endTime: data.endTime?.toDate()
      } as TrainingJob;
    } catch (error) {
      logger.error(`Failed to get job status: ${jobId}`, error);
      throw error;
    }
  }

  /**
   * List training jobs
   */
  async listJobs(filters?: {
    configId?: string;
    status?: TrainingJob['status'];
    limit?: number;
  }): Promise<TrainingJob[]> {
    try {
      let query = this.firestore.collection(this.jobCollection) as any;
      
      if (filters?.configId) {
        query = query.where('configId', '==', filters.configId);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      query = query.orderBy('startTime', 'desc');
      
      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate()
        } as TrainingJob;
      });
    } catch (error) {
      logger.error('Failed to list training jobs', error);
      throw error;
    }
  }

  /**
   * Stop a running job
   */
  async stopJob(jobId: string): Promise<void> {
    try {
      // Remove from queue if pending
      const job = await this.queue.getJob(jobId);
      if (job) {
        await job.remove();
      }
      
      // Update status
      await this.updateJobStatus(jobId, 'cancelled');
      
      logger.info(`Training job stopped: ${jobId}`);
    } catch (error) {
      logger.error(`Failed to stop job: ${jobId}`, error);
      throw error;
    }
  }
}
