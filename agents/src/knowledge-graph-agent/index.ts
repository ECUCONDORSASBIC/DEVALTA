import { EnhancedBaseAgent, EnhancedAgentConfig, EventMessage, MetricPoint, ReactiveRule } from '../shared/EnhancedBaseAgent.js';
import neo4j, { Driver, Session, Result } from 'neo4j-driver';
import { Firestore } from '@google-cloud/firestore';
import { z } from 'zod';
import crypto from 'crypto';

// Schemas for validation
const GuidelineSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
  conditions: z.array(z.string()),
  contraindications: z.array(z.string()).optional(),
  version: z.string(),
  source: z.string()
});

const DrugSchema = z.object({
  name: z.string(),
  genericName: z.string(),
  category: z.string(),
  interactions: z.array(z.object({
    drugName: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']),
    description: z.string()
  })).optional(),
  contraindications: z.array(z.string()).optional(),
  dosageForms: z.array(z.string()),
  activeIngredients: z.array(z.string())
});

const ICD10Schema = z.object({
  code: z.string(),
  description: z.string(),
  category: z.string(),
  parentCode: z.string().optional(),
  excludes: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional()
});

const ReasoningQuerySchema = z.object({
  query: z.string(),
  context: z.object({
    patientAge: z.number().optional(),
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional()
  }).optional(),
  depth: z.number().min(1).max(5).default(3)
});

interface KnowledgeGraphAgentConfig extends EnhancedAgentConfig {
  neo4j: {
    uri: string;
    user: string;
    password: string;
  };
  firestore: {
    projectId: string;
    snapshotCollection: string;
  };
  snapshot: {
    interval: string; // Cron schedule
    retention: number; // Days to keep snapshots
  };
}

export class KnowledgeGraphAgent extends EnhancedBaseAgent {
  private driver: Driver;
  private firestore: Firestore;
  private config: KnowledgeGraphAgentConfig;
  private snapshotInProgress = false;

  constructor(config: KnowledgeGraphAgentConfig) {
    super(config);
    this.config = config;
    
    // Initialize Neo4j driver
    this.driver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000,
        connectionTimeout: 30000
      }
    );
    
    // Initialize Firestore
    this.firestore = new Firestore({ 
      projectId: config.firestore.projectId 
    });

    // Setup scheduled snapshot job
    this.addScheduledJob(
      'knowledge-graph-snapshot',
      config.snapshot.interval,
      this.createSnapshot.bind(this)
    );

    // Setup reactive rules
    this.setupReactiveRules();
  }

  protected setupCustomRoutes(): void {
    // Guideline ingestion
    this.app.post('/ingest/guidelines', async (req, res) => {
      try {
        const guidelines = z.array(GuidelineSchema).parse(req.body);
        const result = await this.ingestGuidelines(guidelines);
        
        this.publishEvent('knowledge-graph.guidelines.ingested', {
          count: guidelines.length,
          timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, ...result });
      } catch (error) {
        this.log('error', 'Failed to ingest guidelines', { error });
        res.status(400).json({ error: error.message });
      }
    });

    // Drug database ingestion
    this.app.post('/ingest/drugs', async (req, res) => {
      try {
        const drugs = z.array(DrugSchema).parse(req.body);
        const result = await this.ingestDrugs(drugs);
        
        this.publishEvent('knowledge-graph.drugs.ingested', {
          count: drugs.length,
          timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, ...result });
      } catch (error) {
        this.log('error', 'Failed to ingest drugs', { error });
        res.status(400).json({ error: error.message });
      }
    });

    // ICD-10 codes ingestion
    this.app.post('/ingest/icd10', async (req, res) => {
      try {
        const codes = z.array(ICD10Schema).parse(req.body);
        const result = await this.ingestICD10Codes(codes);
        
        this.publishEvent('knowledge-graph.icd10.ingested', {
          count: codes.length,
          timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, ...result });
      } catch (error) {
        this.log('error', 'Failed to ingest ICD-10 codes', { error });
        res.status(400).json({ error: error.message });
      }
    });

    // Reasoning API
    this.app.post('/reason', async (req, res) => {
      try {
        const query = ReasoningQuerySchema.parse(req.body);
        const result = await this.performReasoning(query);
        
        this.recordMetric('reasoning_queries', 1, { type: 'success' });
        res.json(result);
      } catch (error) {
        this.log('error', 'Reasoning query failed', { error });
        this.recordMetric('reasoning_queries', 1, { type: 'error' });
        res.status(400).json({ error: error.message });
      }
    });

    // Drug interaction check
    this.app.post('/check/drug-interactions', async (req, res) => {
      try {
        const { drugs } = z.object({ drugs: z.array(z.string()) }).parse(req.body);
        const interactions = await this.checkDrugInteractions(drugs);
        res.json({ interactions });
      } catch (error) {
        this.log('error', 'Drug interaction check failed', { error });
        res.status(400).json({ error: error.message });
      }
    });

    // Condition guideline lookup
    this.app.get('/guidelines/by-condition/:condition', async (req, res) => {
      try {
        const { condition } = req.params;
        const guidelines = await this.getGuidelinesForCondition(condition);
        res.json({ guidelines });
      } catch (error) {
        this.log('error', 'Guideline lookup failed', { error });
        res.status(500).json({ error: error.message });
      }
    });

    // Graph statistics
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.getGraphStatistics();
        res.json(stats);
      } catch (error) {
        this.log('error', 'Failed to get graph statistics', { error });
        res.status(500).json({ error: error.message });
      }
    });
  }

  private async ingestGuidelines(guidelines: z.infer<typeof GuidelineSchema>[]): Promise<any> {
    const session = this.driver.session();
    const startTime = Date.now();
    
    try {
      const tx = session.beginTransaction();
      let created = 0;
      let updated = 0;

      for (const guideline of guidelines) {
        const result = await tx.run(
          `
          MERGE (g:Guideline {id: $id})
          ON CREATE SET 
            g.created = timestamp(),
            g += $properties,
            created = true
          ON MATCH SET 
            g.updated = timestamp(),
            g += $properties,
            created = false
          WITH g, created
          UNWIND $conditions AS condition
          MERGE (c:Condition {name: condition})
          MERGE (g)-[:APPLIES_TO]->(c)
          RETURN created
          `,
          {
            id: guideline.id,
            properties: {
              title: guideline.title,
              category: guideline.category,
              content: guideline.content,
              version: guideline.version,
              source: guideline.source,
              contraindications: guideline.contraindications || []
            },
            conditions: guideline.conditions
          }
        );
        
        if (result.records[0]?.get('created')) {
          created++;
        } else {
          updated++;
        }
      }

      await tx.commit();
      
      const duration = Date.now() - startTime;
      this.recordMetric('guideline_ingestion_duration', duration);
      this.recordMetric('guidelines_ingested', guidelines.length);
      
      return { created, updated, duration };
    } catch (error) {
      await session.close();
      throw error;
    } finally {
      await session.close();
    }
  }

  private async ingestDrugs(drugs: z.infer<typeof DrugSchema>[]): Promise<any> {
    const session = this.driver.session();
    const startTime = Date.now();
    
    try {
      const tx = session.beginTransaction();
      let created = 0;
      let interactionsCreated = 0;

      for (const drug of drugs) {
        // Create drug node
        await tx.run(
          `
          MERGE (d:Drug {name: $name})
          SET d += $properties
          `,
          {
            name: drug.name,
            properties: {
              genericName: drug.genericName,
              category: drug.category,
              dosageForms: drug.dosageForms,
              activeIngredients: drug.activeIngredients,
              contraindications: drug.contraindications || [],
              updated: neo4j.int(Date.now())
            }
          }
        );
        created++;

        // Create drug interactions
        if (drug.interactions) {
          for (const interaction of drug.interactions) {
            await tx.run(
              `
              MATCH (d1:Drug {name: $drug1})
              MERGE (d2:Drug {name: $drug2})
              MERGE (d1)-[i:INTERACTS_WITH]->(d2)
              SET i.severity = $severity,
                  i.description = $description,
                  i.updated = timestamp()
              `,
              {
                drug1: drug.name,
                drug2: interaction.drugName,
                severity: interaction.severity,
                description: interaction.description
              }
            );
            interactionsCreated++;
          }
        }
      }

      await tx.commit();
      
      const duration = Date.now() - startTime;
      this.recordMetric('drug_ingestion_duration', duration);
      
      return { created, interactionsCreated, duration };
    } catch (error) {
      await session.close();
      throw error;
    } finally {
      await session.close();
    }
  }

  private async ingestICD10Codes(codes: z.infer<typeof ICD10Schema>[]): Promise<any> {
    const session = this.driver.session();
    const startTime = Date.now();
    
    try {
      const tx = session.beginTransaction();
      let created = 0;
      let relationships = 0;

      for (const code of codes) {
        // Create ICD-10 node
        await tx.run(
          `
          MERGE (i:ICD10 {code: $code})
          SET i += $properties
          `,
          {
            code: code.code,
            properties: {
              description: code.description,
              category: code.category,
              excludes: code.excludes || [],
              includes: code.includes || [],
              updated: neo4j.int(Date.now())
            }
          }
        );
        created++;

        // Create parent relationship if exists
        if (code.parentCode) {
          await tx.run(
            `
            MATCH (child:ICD10 {code: $childCode})
            MERGE (parent:ICD10 {code: $parentCode})
            MERGE (child)-[:CHILD_OF]->(parent)
            `,
            {
              childCode: code.code,
              parentCode: code.parentCode
            }
          );
          relationships++;
        }
      }

      await tx.commit();
      
      const duration = Date.now() - startTime;
      this.recordMetric('icd10_ingestion_duration', duration);
      
      return { created, relationships, duration };
    } catch (error) {
      await session.close();
      throw error;
    } finally {
      await session.close();
    }
  }

  private async performReasoning(query: z.infer<typeof ReasoningQuerySchema>): Promise<any> {
    const session = this.driver.session();
    const startTime = Date.now();
    
    try {
      // Build context-aware Cypher query
      let cypherQuery = ``;
      const params: any = { query: query.query, depth: neo4j.int(query.depth) };

      // Example reasoning: Find related guidelines and drugs for conditions
      if (query.context?.conditions && query.context.conditions.length > 0) {
        cypherQuery = `
          UNWIND $conditions AS conditionName
          MATCH (c:Condition {name: conditionName})
          OPTIONAL MATCH (c)<-[:APPLIES_TO]-(g:Guideline)
          OPTIONAL MATCH (c)-[:TREATED_BY]->(d:Drug)
          WITH c, collect(DISTINCT g) AS guidelines, collect(DISTINCT d) AS drugs
          RETURN c.name AS condition, 
                 [g IN guidelines | {id: g.id, title: g.title, category: g.category}] AS guidelines,
                 [d IN drugs | {name: d.name, category: d.category}] AS recommendedDrugs
        `;
        params.conditions = query.context.conditions;
      } else {
        // General knowledge query
        cypherQuery = `
          CALL db.index.fulltext.queryNodes('knowledge_index', $query) YIELD node, score
          MATCH (node)-[r*0..$depth]-(related)
          WHERE score > 0.5
          RETURN node, collect(DISTINCT {node: related, relationship: type(r)}) AS relatedNodes
          LIMIT 20
        `;
      }

      const result = await session.run(cypherQuery, params);
      
      // Check for drug interactions if medications are provided
      let interactions = [];
      if (query.context?.medications && query.context.medications.length > 1) {
        interactions = await this.checkDrugInteractions(query.context.medications);
      }

      const duration = Date.now() - startTime;
      this.recordMetric('reasoning_query_duration', duration);
      
      return {
        query: query.query,
        results: result.records.map(record => record.toObject()),
        interactions,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await session.close();
      throw error;
    } finally {
      await session.close();
    }
  }

  private async checkDrugInteractions(drugs: string[]): Promise<any[]> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        UNWIND $drugs AS drug1Name
        UNWIND $drugs AS drug2Name
        WHERE drug1Name < drug2Name
        MATCH (d1:Drug {name: drug1Name})-[i:INTERACTS_WITH]-(d2:Drug {name: drug2Name})
        RETURN d1.name AS drug1, d2.name AS drug2, i.severity AS severity, i.description AS description
        `,
        { drugs }
      );
      
      return result.records.map(record => ({
        drug1: record.get('drug1'),
        drug2: record.get('drug2'),
        severity: record.get('severity'),
        description: record.get('description')
      }));
    } finally {
      await session.close();
    }
  }

  private async getGuidelinesForCondition(condition: string): Promise<any[]> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MATCH (c:Condition {name: $condition})<-[:APPLIES_TO]-(g:Guideline)
        RETURN g
        ORDER BY g.updated DESC
        `,
        { condition }
      );
      
      return result.records.map(record => record.get('g').properties);
    } finally {
      await session.close();
    }
  }

  private async getGraphStatistics(): Promise<any> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (n)
        WITH labels(n) AS label
        RETURN label[0] AS nodeType, count(*) AS count
        UNION ALL
        MATCH ()-[r]->()
        RETURN type(r) AS nodeType, count(*) AS count
      `);
      
      const stats = {
        nodes: {},
        relationships: {},
        totalNodes: 0,
        totalRelationships: 0
      };
      
      result.records.forEach(record => {
        const type = record.get('nodeType');
        const count = record.get('count').toNumber();
        
        if (['Guideline', 'Drug', 'ICD10', 'Condition'].includes(type)) {
          stats.nodes[type] = count;
          stats.totalNodes += count;
        } else {
          stats.relationships[type] = count;
          stats.totalRelationships += count;
        }
      });
      
      return stats;
    } finally {
      await session.close();
    }
  }

  private async createSnapshot(): Promise<void> {
    if (this.snapshotInProgress) {
      this.log('warn', 'Snapshot already in progress, skipping');
      return;
    }

    this.snapshotInProgress = true;
    const snapshotId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      this.log('info', 'Starting knowledge graph snapshot', { snapshotId });
      
      // Export graph data
      const session = this.driver.session();
      const exportData = {
        id: snapshotId,
        timestamp: new Date().toISOString(),
        nodes: {},
        relationships: []
      };
      
      // Export all node types
      const nodeTypes = ['Guideline', 'Drug', 'ICD10', 'Condition'];
      for (const nodeType of nodeTypes) {
        const result = await session.run(
          `MATCH (n:${nodeType}) RETURN n`
        );
        exportData.nodes[nodeType] = result.records.map(r => r.get('n').properties);
      }
      
      // Export all relationships
      const relResult = await session.run(`
        MATCH (a)-[r]->(b)
        RETURN 
          id(a) AS sourceId, 
          labels(a) AS sourceLabels,
          type(r) AS relType, 
          properties(r) AS relProps,
          id(b) AS targetId,
          labels(b) AS targetLabels
      `);
      
      exportData.relationships = relResult.records.map(record => ({
        sourceId: record.get('sourceId').toString(),
        sourceLabels: record.get('sourceLabels'),
        type: record.get('relType'),
        properties: record.get('relProps'),
        targetId: record.get('targetId').toString(),
        targetLabels: record.get('targetLabels')
      }));
      
      await session.close();
      
      // Save to Firestore
      const docRef = this.firestore
        .collection(this.config.firestore.snapshotCollection)
        .doc(snapshotId);
      
      await docRef.set({
        ...exportData,
        metadata: {
          nodeCount: Object.values(exportData.nodes).reduce((sum: number, nodes: any) => sum + nodes.length, 0),
          relationshipCount: exportData.relationships.length,
          duration: Date.now() - startTime,
          status: 'completed'
        }
      });
      
      // Clean up old snapshots
      await this.cleanupOldSnapshots();
      
      const duration = Date.now() - startTime;
      this.log('info', 'Knowledge graph snapshot completed', { snapshotId, duration });
      this.recordMetric('snapshot_duration', duration);
      
      // Publish event
      this.publishEvent('knowledge-graph.snapshot.created', {
        snapshotId,
        timestamp: exportData.timestamp,
        nodeCount: exportData.metadata.nodeCount,
        relationshipCount: exportData.metadata.relationshipCount
      });
      
    } catch (error) {
      this.log('error', 'Failed to create snapshot', { error, snapshotId });
      this.recordMetric('snapshot_errors', 1);
      throw error;
    } finally {
      this.snapshotInProgress = false;
    }
  }

  private async cleanupOldSnapshots(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.snapshot.retention);
    
    const snapshot = await this.firestore
      .collection(this.config.firestore.snapshotCollection)
      .where('timestamp', '<', cutoffDate.toISOString())
      .get();
    
    const batch = this.firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    this.log('info', `Cleaned up ${snapshot.size} old snapshots`);
  }

  private setupReactiveRules(): void {
    // Rule: Alert on high-severity drug interactions
    this.addRule({
      id: 'drug-interaction-alert',
      name: 'High Severity Drug Interaction Alert',
      description: 'Triggers when a high-severity drug interaction is detected',
      enabled: true,
      conditions: [
        {
          field: 'event.type',
          operator: 'eq',
          value: 'drug-interaction-detected'
        },
        {
          field: 'event.data.severity',
          operator: 'eq',
          value: 'severe'
        }
      ],
      conditionOperator: 'and',
      actions: [
        {
          type: 'alert',
          data: { priority: 'high', channel: 'medical-alerts' }
        },
        {
          type: 'emit',
          target: 'medical-emergency',
          data: { requiresImmediate: true }
        }
      ],
      priority: 10
    });

    // Rule: Update cache on data ingestion
    this.addRule({
      id: 'cache-invalidation',
      name: 'Cache Invalidation on Data Update',
      enabled: true,
      conditions: [
        {
          field: 'event.type',
          operator: 'matches',
          value: 'knowledge-graph\\.(guidelines|drugs|icd10)\\.ingested'
        }
      ],
      conditionOperator: 'and',
      actions: [
        {
          type: 'command',
          target: 'invalidate-cache',
          data: { scope: 'knowledge-graph' }
        }
      ],
      priority: 5
    });
  }

  protected subscribeToEvents(): void {
    // Subscribe to medical data update events
    this.on('medical-data-update', async (data) => {
      this.log('info', 'Received medical data update', data);
      await this.evaluateRules({ event: { type: 'medical-data-update', data } });
    });

    // Subscribe to query requests from other agents
    this.on('knowledge-query-request', async (data) => {
      try {
        const result = await this.performReasoning(data.query);
        this.publishEvent('knowledge-query-response', {
          requestId: data.requestId,
          result
        }, data.requestId);
      } catch (error) {
        this.publishEvent('knowledge-query-error', {
          requestId: data.requestId,
          error: error.message
        }, data.requestId);
      }
    });
  }

  protected handleEventBusMessage(message: EventMessage): void {
    switch (message.type) {
      case 'medical-data-update':
        this.emit('medical-data-update', message.data);
        break;
      case 'knowledge-query-request':
        this.emit('knowledge-query-request', message.data);
        break;
      default:
        this.log('debug', 'Received event bus message', { type: message.type });
    }
  }

  protected async executeCustomRuleAction(rule: ReactiveRule, action: any, context: any): Promise<void> {
    switch (action.target) {
      case 'invalidate-cache':
        // Implement cache invalidation logic
        this.log('info', 'Invalidating cache', action.data);
        break;
      default:
        this.log('warn', `Unknown custom action: ${action.target}`);
    }
  }

  protected async executeCommand(command: string, data: any): Promise<void> {
    switch (command) {
      case 'invalidate-cache':
        // Implement cache invalidation
        this.recordMetric('cache_invalidations', 1, { scope: data.scope });
        break;
      case 'create-snapshot':
        await this.createSnapshot();
        break;
      default:
        this.log('warn', `Unknown command: ${command}`);
    }
  }

  protected performHealthChecks(): Record<string, boolean> {
    const baseChecks = super.performHealthChecks();
    
    return {
      ...baseChecks,
      neo4j: this.driver ? true : false,
      firestore: this.firestore ? true : false,
      snapshotScheduled: this.cronJobs.has('knowledge-graph-snapshot')
    };
  }

  protected getCustomMetrics(): MetricPoint[] {
    const metrics = super.getCustomMetrics();
    
    // Add knowledge graph specific metrics
    metrics.push({
      name: 'snapshot_in_progress',
      value: this.snapshotInProgress ? 1 : 0,
      timestamp: new Date().toISOString()
    });
    
    return metrics;
  }

  public async stop(): Promise<void> {
    await this.driver.close();
    await super.stop();
  }
}

// Export for use
export default KnowledgeGraphAgent;
