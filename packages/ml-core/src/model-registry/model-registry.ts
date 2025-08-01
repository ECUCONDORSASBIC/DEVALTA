import { Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { ModelMetadata, ModelMetadataSchema } from '../types';
import { logger } from '@alta/logger';

export class ModelRegistry {
  private firestore: Firestore;
  private storage: Storage;
  private bucketName: string;
  private collectionName = 'ml_models';

  constructor(firestore: Firestore, storage: Storage, bucketName: string) {
    this.firestore = firestore;
    this.storage = storage;
    this.bucketName = bucketName;
  }

  /**
   * Register a new model in the registry
   */
  async registerModel(metadata: Omit<ModelMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelMetadata> {
    try {
      const modelId = uuidv4();
      const now = new Date();
      
      const fullMetadata: ModelMetadata = {
        ...metadata,
        id: modelId,
        createdAt: now,
        updatedAt: now
      };

      // Validate metadata
      const validatedMetadata = ModelMetadataSchema.parse(fullMetadata);

      // Store metadata in Firestore
      await this.firestore
        .collection(this.collectionName)
        .doc(modelId)
        .set({
          ...validatedMetadata,
          createdAt: Firestore.Timestamp.fromDate(validatedMetadata.createdAt),
          updatedAt: Firestore.Timestamp.fromDate(validatedMetadata.updatedAt)
        });

      logger.info(`Model registered: ${modelId}`, { modelName: metadata.name, version: metadata.version });
      return validatedMetadata;
    } catch (error) {
      logger.error('Failed to register model', error);
      throw error;
    }
  }

  /**
   * Get model metadata by ID
   */
  async getModel(modelId: string): Promise<ModelMetadata | null> {
    try {
      const doc = await this.firestore
        .collection(this.collectionName)
        .doc(modelId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as ModelMetadata;
    } catch (error) {
      logger.error(`Failed to get model: ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Get model by name and version
   */
  async getModelByNameAndVersion(name: string, version: string): Promise<ModelMetadata | null> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('name', '==', name)
        .where('version', '==', version)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as ModelMetadata;
    } catch (error) {
      logger.error(`Failed to get model by name and version: ${name}@${version}`, error);
      throw error;
    }
  }

  /**
   * List all models with optional filters
   */
  async listModels(filters?: {
    status?: ModelMetadata['status'];
    framework?: ModelMetadata['framework'];
    modelType?: ModelMetadata['modelType'];
    tags?: string[];
  }): Promise<ModelMetadata[]> {
    try {
      let query = this.firestore.collection(this.collectionName) as any;

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.framework) {
        query = query.where('framework', '==', filters.framework);
      }
      if (filters?.modelType) {
        query = query.where('modelType', '==', filters.modelType);
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as ModelMetadata;
      });
    } catch (error) {
      logger.error('Failed to list models', error);
      throw error;
    }
  }

  /**
   * Update model metadata
   */
  async updateModel(modelId: string, updates: Partial<ModelMetadata>): Promise<ModelMetadata> {
    try {
      const model = await this.getModel(modelId);
      if (!model) {
        throw new Error(`Model not found: ${modelId}`);
      }

      const updatedModel = {
        ...model,
        ...updates,
        id: modelId,
        updatedAt: new Date()
      };

      const validatedModel = ModelMetadataSchema.parse(updatedModel);

      await this.firestore
        .collection(this.collectionName)
        .doc(modelId)
        .update({
          ...validatedModel,
          updatedAt: Firestore.Timestamp.fromDate(validatedModel.updatedAt)
        });

      logger.info(`Model updated: ${modelId}`);
      return validatedModel;
    } catch (error) {
      logger.error(`Failed to update model: ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Promote model to a different status (e.g., staging to production)
   */
  async promoteModel(modelId: string, newStatus: ModelMetadata['status']): Promise<ModelMetadata> {
    return this.updateModel(modelId, { status: newStatus });
  }

  /**
   * Upload model artifact to storage
   */
  async uploadModelArtifact(modelId: string, artifactPath: string, localPath: string): Promise<string> {
    try {
      const destination = `models/${modelId}/${artifactPath}`;
      const bucket = this.storage.bucket(this.bucketName);
      
      await bucket.upload(localPath, {
        destination,
        metadata: {
          contentType: 'application/octet-stream',
          metadata: {
            modelId,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      const artifactUrl = `gs://${this.bucketName}/${destination}`;
      
      // Update model metadata with artifact path
      await this.updateModel(modelId, { artifactPath: artifactUrl });
      
      logger.info(`Model artifact uploaded: ${modelId}`, { artifactUrl });
      return artifactUrl;
    } catch (error) {
      logger.error(`Failed to upload model artifact: ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Download model artifact from storage
   */
  async downloadModelArtifact(modelId: string, destinationPath: string): Promise<void> {
    try {
      const model = await this.getModel(modelId);
      if (!model || !model.artifactPath) {
        throw new Error(`Model artifact not found: ${modelId}`);
      }

      const artifactPath = model.artifactPath.replace(`gs://${this.bucketName}/`, '');
      const bucket = this.storage.bucket(this.bucketName);
      
      await bucket.file(artifactPath).download({ destination: destinationPath });
      
      logger.info(`Model artifact downloaded: ${modelId}`, { destinationPath });
    } catch (error) {
      logger.error(`Failed to download model artifact: ${modelId}`, error);
      throw error;
    }
  }

  /**
   * Delete model (soft delete by setting status to archived)
   */
  async archiveModel(modelId: string): Promise<void> {
    await this.promoteModel(modelId, 'archived');
  }
}

