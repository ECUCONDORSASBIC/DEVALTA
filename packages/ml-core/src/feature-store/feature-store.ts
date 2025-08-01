import { Firestore } from 'firebase-admin/firestore';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { logger } from '@alta/logger';
import { FeatureDefinition, FeatureSet, FeatureDefinitionSchema, FeatureSetSchema } from '../types';

export class FeatureStore {
  private firestore: Firestore;
  private bigquery: BigQuery;
  private datasetId: string;
  private featureDefCollection = 'ml_feature_definitions';
  private featureSetCollection = 'ml_feature_sets';

  constructor(firestore: Firestore, bigquery: BigQuery, datasetId: string) {
    this.firestore = firestore;
    this.bigquery = bigquery;
    this.datasetId = datasetId;
  }

  /**
   * Register a new feature definition
   */
  async createFeatureDefinition(
    definition: Omit<FeatureDefinition, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FeatureDefinition> {
    try {
      const featureId = uuidv4();
      const now = new Date();
      
      const fullDefinition: FeatureDefinition = {
        ...definition,
        id: featureId,
        createdAt: now,
        updatedAt: now
      };

      const validated = FeatureDefinitionSchema.parse(fullDefinition);

      await this.firestore
        .collection(this.featureDefCollection)
        .doc(featureId)
        .set({
          ...validated,
          createdAt: Firestore.Timestamp.fromDate(validated.createdAt),
          updatedAt: Firestore.Timestamp.fromDate(validated.updatedAt)
        });

      logger.info(`Feature definition created: ${featureId}`, { name: definition.name });
      return validated;
    } catch (error) {
      logger.error('Failed to create feature definition', error);
      throw error;
    }
  }

  /**
   * Create a feature set (collection of features)
   */
  async createFeatureSet(
    featureSet: Omit<FeatureSet, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FeatureSet> {
    try {
      const setId = uuidv4();
      const now = new Date();
      
      const fullSet: FeatureSet = {
        ...featureSet,
        id: setId,
        createdAt: now,
        updatedAt: now
      };

      const validated = FeatureSetSchema.parse(fullSet);

      await this.firestore
        .collection(this.featureSetCollection)
        .doc(setId)
        .set({
          ...validated,
          createdAt: Firestore.Timestamp.fromDate(validated.createdAt),
          updatedAt: Firestore.Timestamp.fromDate(validated.updatedAt)
        });

      logger.info(`Feature set created: ${setId}`, { name: featureSet.name });
      return validated;
    } catch (error) {
      logger.error('Failed to create feature set', error);
      throw error;
    }
  }

  /**
   * Store feature data in BigQuery
   */
  async storeFeatures(
    featureSetId: string,
    data: Record<string, any>[],
    options?: {
      partitionField?: string;
      expirationDays?: number;
    }
  ): Promise<void> {
    try {
      const featureSet = await this.getFeatureSet(featureSetId);
      if (!featureSet) {
        throw new Error(`Feature set not found: ${featureSetId}`);
      }

      const tableName = `features_${featureSet.entity}_${featureSet.version.replace(/\./g, '_')}`;
      const tableId = `${this.datasetId}.${tableName}`;
      
      // Create table if it doesn't exist
      const dataset = this.bigquery.dataset(this.datasetId);
      const [tableExists] = await dataset.table(tableName).exists();
      
      if (!tableExists) {
        const schema = await this.generateBigQuerySchema(featureSet);
        const tableOptions: any = { schema };
        
        if (options?.partitionField) {
          tableOptions.timePartitioning = {
            type: 'DAY',
            field: options.partitionField
          };
        }
        
        if (options?.expirationDays) {
          tableOptions.expirationMs = options.expirationDays * 24 * 60 * 60 * 1000;
        }
        
        await dataset.createTable(tableName, tableOptions);
        logger.info(`Created BigQuery table: ${tableId}`);
      }

      // Insert data
      const table = dataset.table(tableName);
      const rows = data.map(row => ({
        ...row,
        _feature_set_id: featureSetId,
        _inserted_at: new Date().toISOString()
      }));
      
      await table.insert(rows);
      logger.info(`Inserted ${rows.length} rows into ${tableId}`);
    } catch (error) {
      logger.error('Failed to store features', error);
      throw error;
    }
  }

  /**
   * Load features from BigQuery
   */
  async loadFeatures(
    featureSetId: string,
    filters?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
    }
  ): Promise<any[]> {
    try {
      const featureSet = await this.getFeatureSet(featureSetId);
      if (!featureSet) {
        throw new Error(`Feature set not found: ${featureSetId}`);
      }

      const tableName = `features_${featureSet.entity}_${featureSet.version.replace(/\./g, '_')}`;
      
      // Build query
      let query = `SELECT * FROM \`${this.datasetId}.${tableName}\` WHERE _feature_set_id = @featureSetId`;
      const params: any = { featureSetId };
      
      if (filters) {
        Object.entries(filters).forEach(([key, value], index) => {
          query += ` AND ${key} = @filter${index}`;
          params[`filter${index}`] = value;
        });
      }
      
      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      }
      
      if (options?.limit) {
        query += ` LIMIT ${options.limit}`;
      }
      
      if (options?.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      const [rows] = await this.bigquery.query({
        query,
        params
      });

      logger.info(`Loaded ${rows.length} features from ${tableName}`);
      return rows;
    } catch (error) {
      logger.error('Failed to load features', error);
      throw error;
    }
  }

  /**
   * Store features in Firestore (for real-time access)
   */
  async storeRealtimeFeatures(
    entityType: string,
    entityId: string,
    features: Record<string, any>
  ): Promise<void> {
    try {
      await this.firestore
        .collection('ml_realtime_features')
        .doc(`${entityType}_${entityId}`)
        .set({
          entityType,
          entityId,
          features,
          updatedAt: Firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      logger.info(`Stored realtime features for ${entityType}:${entityId}`);
    } catch (error) {
      logger.error('Failed to store realtime features', error);
      throw error;
    }
  }

  /**
   * Load features from Firestore (real-time)
   */
  async loadRealtimeFeatures(
    entityType: string,
    entityId: string
  ): Promise<Record<string, any> | null> {
    try {
      const doc = await this.firestore
        .collection('ml_realtime_features')
        .doc(`${entityType}_${entityId}`)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return data.features || {};
    } catch (error) {
      logger.error('Failed to load realtime features', error);
      throw error;
    }
  }

  /**
   * Compute derived features
   */
  async computeFeatures(
    featureSetId: string,
    entityIds: string[],
    computeFn: (entity: any) => Promise<Record<string, any>>
  ): Promise<Record<string, any>[]> {
    try {
      const results = [];
      
      for (const entityId of entityIds) {
        const baseFeatures = await this.loadRealtimeFeatures('entity', entityId) || {};
        const computedFeatures = await computeFn({ id: entityId, ...baseFeatures });
        
        results.push({
          entityId,
          ...baseFeatures,
          ...computedFeatures,
          _computed_at: new Date()
        });
      }

      // Store computed features
      await this.storeFeatures(featureSetId, results);
      
      return results;
    } catch (error) {
      logger.error('Failed to compute features', error);
      throw error;
    }
  }

  /**
   * Get feature set metadata
   */
  private async getFeatureSet(featureSetId: string): Promise<FeatureSet | null> {
    try {
      const doc = await this.firestore
        .collection(this.featureSetCollection)
        .doc(featureSetId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as FeatureSet;
    } catch (error) {
      logger.error(`Failed to get feature set: ${featureSetId}`, error);
      throw error;
    }
  }

  /**
   * Generate BigQuery schema from feature definitions
   */
  private async generateBigQuerySchema(featureSet: FeatureSet): Promise<any[]> {
    const schema = [
      { name: '_feature_set_id', type: 'STRING', mode: 'REQUIRED' },
      { name: '_inserted_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'entity_id', type: 'STRING', mode: 'REQUIRED' }
    ];

    // Get feature definitions
    for (const featureId of featureSet.features) {
      const doc = await this.firestore
        .collection(this.featureDefCollection)
        .doc(featureId)
        .get();
      
      if (doc.exists) {
        const feature = doc.data() as FeatureDefinition;
        schema.push({
          name: feature.name,
          type: this.mapDataTypeToBigQuery(feature.dataType),
          mode: 'NULLABLE'
        });
      }
    }

    return schema;
  }

  /**
   * Map feature data types to BigQuery types
   */
  private mapDataTypeToBigQuery(dataType: FeatureDefinition['dataType']): string {
    switch (dataType) {
      case 'numeric': return 'FLOAT64';
      case 'categorical': return 'STRING';
      case 'text': return 'STRING';
      case 'datetime': return 'TIMESTAMP';
      case 'embedding': return 'REPEATED FLOAT64';
      default: return 'STRING';
    }
  }

  /**
   * Create a point-in-time feature snapshot
   */
  async createFeatureSnapshot(
    featureSetId: string,
    timestamp: Date,
    entityIds: string[]
  ): Promise<string> {
    try {
      const snapshotId = uuidv4();
      const snapshotTable = `snapshot_${snapshotId.replace(/-/g, '_')}`;
      
      // Create snapshot query
      const featureSet = await this.getFeatureSet(featureSetId);
      if (!featureSet) {
        throw new Error(`Feature set not found: ${featureSetId}`);
      }

      const sourceTable = `features_${featureSet.entity}_${featureSet.version.replace(/\./g, '_')}`;
      const entityIdList = entityIds.map(id => `'${id}'`).join(',');
      
      const query = `
        CREATE TABLE \`${this.datasetId}.${snapshotTable}\` AS
        SELECT * FROM \`${this.datasetId}.${sourceTable}\`
        WHERE entity_id IN (${entityIdList})
        AND _inserted_at <= @timestamp
        QUALIFY ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY _inserted_at DESC) = 1
      `;

      await this.bigquery.query({
        query,
        params: { timestamp: timestamp.toISOString() }
      });

      logger.info(`Created feature snapshot: ${snapshotId}`);
      return snapshotId;
    } catch (error) {
      logger.error('Failed to create feature snapshot', error);
      throw error;
    }
  }
}
