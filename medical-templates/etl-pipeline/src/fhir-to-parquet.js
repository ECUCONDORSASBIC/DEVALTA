const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
const parquet = require('parquetjs');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/etl.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class FHIRToParquetETL {
  constructor(config) {
    this.config = {
      fhirServerUrl: config.fhirServerUrl || 'http://localhost:3000/fhir',
      accessToken: config.accessToken,
      outputPath: config.outputPath || './output',
      batchSize: config.batchSize || 100,
      bigQuery: config.bigQuery || null,
      snowflake: config.snowflake || null,
      ...config
    };

    if (this.config.bigQuery) {
      this.bigquery = new BigQuery({
        projectId: this.config.bigQuery.projectId,
        keyFilename: this.config.bigQuery.keyFilename
      });
    }
  }

  async extractFHIRData(resourceType, params = {}) {
    try {
      logger.info(`Extracting ${resourceType} data from FHIR server`);
      
      const response = await axios.get(`${this.config.fhirServerUrl}/${resourceType}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Accept': 'application/fhir+json'
        },
        params: {
          _count: this.config.batchSize,
          ...params
        }
      });

      const bundle = response.data;
      const resources = bundle.entry ? bundle.entry.map(e => e.resource) : [];
      
      logger.info(`Extracted ${resources.length} ${resourceType} resources`);
      return {
        resources,
        total: bundle.total || resources.length,
        nextUrl: this.extractNextUrl(bundle)
      };
    } catch (error) {
      logger.error(`Error extracting ${resourceType} data:`, error);
      throw error;
    }
  }

  extractNextUrl(bundle) {
    if (!bundle.link) return null;
    
    const nextLink = bundle.link.find(link => link.relation === 'next');
    return nextLink ? nextLink.url : null;
  }

  async transformToParquetSchema(resourceType, resources) {
    logger.info(`Transforming ${resources.length} ${resourceType} resources to Parquet schema`);
    
    const transformedData = [];
    
    for (const resource of resources) {
      const transformed = await this.transformResource(resourceType, resource);
      transformedData.push(transformed);
    }
    
    return transformedData;
  }

  async transformResource(resourceType, resource) {
    const baseFields = {
      id: resource.id,
      resourceType: resource.resourceType,
      lastUpdated: resource.meta?.lastUpdated || new Date().toISOString(),
      versionId: resource.meta?.versionId || '1'
    };

    switch (resourceType) {
      case 'Patient':
        return this.transformPatient(resource, baseFields);
      case 'Observation':
        return this.transformObservation(resource, baseFields);
      default:
        return {
          ...baseFields,
          rawData: JSON.stringify(resource)
        };
    }
  }

  transformPatient(patient, baseFields) {
    const name = patient.name && patient.name[0];
    const telecom = patient.telecom || [];
    const address = patient.address && patient.address[0];
    
    return {
      ...baseFields,
      // Demographics
      family_name: name?.family || null,
      given_name: name?.given?.join(' ') || null,
      gender: patient.gender || null,
      birth_date: patient.birthDate || null,
      
      // Contact information
      phone: telecom.find(t => t.system === 'phone')?.value || null,
      email: telecom.find(t => t.system === 'email')?.value || null,
      
      // Address
      address_line: address?.line?.join(', ') || null,
      city: address?.city || null,
      state: address?.state || null,
      postal_code: address?.postalCode || null,
      country: address?.country || null,
      
      // Identifiers
      mrn: patient.identifier?.find(i => 
        i.type?.coding?.some(c => c.code === 'MR')
      )?.value || null,
      
      // Status
      active: patient.active || false,
      
      // Raw data for complex queries
      raw_data: JSON.stringify(patient)
    };
  }

  transformObservation(observation, baseFields) {
    const coding = observation.code?.coding?.[0];
    const category = observation.category?.[0]?.coding?.[0];
    
    return {
      ...baseFields,
      // Core observation data
      status: observation.status,
      code_system: coding?.system || null,
      code: coding?.code || null,
      display: coding?.display || null,
      category_code: category?.code || null,
      category_display: category?.display || null,
      
      // Subject reference
      subject_reference: observation.subject?.reference || null,
      patient_id: this.extractPatientId(observation.subject?.reference),
      
      // Timing
      effective_date_time: observation.effectiveDateTime || null,
      issued: observation.issued || null,
      
      // Values
      value_quantity: observation.valueQuantity?.value || null,
      value_unit: observation.valueQuantity?.unit || null,
      value_string: observation.valueString || null,
      value_boolean: observation.valueBoolean || null,
      
      // Reference ranges
      reference_range_low: observation.referenceRange?.[0]?.low?.value || null,
      reference_range_high: observation.referenceRange?.[0]?.high?.value || null,
      
      // Raw data
      raw_data: JSON.stringify(observation)
    };
  }

  extractPatientId(reference) {
    if (!reference) return null;
    const match = reference.match(/Patient\/(.+)/);
    return match ? match[1] : null;
  }

  async writeParquetFile(resourceType, data) {
    const schema = this.getParquetSchema(resourceType);
    const filename = `${resourceType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.parquet`;
    const filepath = path.join(this.config.outputPath, filename);

    // Ensure output directory exists
    await fs.mkdir(this.config.outputPath, { recursive: true });

    logger.info(`Writing ${data.length} records to ${filepath}`);

    const writer = await parquet.ParquetWriter.openFile(schema, filepath);
    
    for (const record of data) {
      await writer.appendRow(record);
    }
    
    await writer.close();
    
    logger.info(`Successfully wrote Parquet file: ${filepath}`);
    return filepath;
  }

  getParquetSchema(resourceType) {
    const baseSchema = new parquet.ParquetSchema({
      id: { type: 'UTF8' },
      resourceType: { type: 'UTF8' },
      lastUpdated: { type: 'UTF8' },
      versionId: { type: 'UTF8' }
    });

    switch (resourceType) {
      case 'Patient':
        return new parquet.ParquetSchema({
          ...baseSchema.fields,
          family_name: { type: 'UTF8', optional: true },
          given_name: { type: 'UTF8', optional: true },
          gender: { type: 'UTF8', optional: true },
          birth_date: { type: 'UTF8', optional: true },
          phone: { type: 'UTF8', optional: true },
          email: { type: 'UTF8', optional: true },
          address_line: { type: 'UTF8', optional: true },
          city: { type: 'UTF8', optional: true },
          state: { type: 'UTF8', optional: true },
          postal_code: { type: 'UTF8', optional: true },
          country: { type: 'UTF8', optional: true },
          mrn: { type: 'UTF8', optional: true },
          active: { type: 'BOOLEAN' },
          raw_data: { type: 'UTF8' }
        });

      case 'Observation':
        return new parquet.ParquetSchema({
          ...baseSchema.fields,
          status: { type: 'UTF8' },
          code_system: { type: 'UTF8', optional: true },
          code: { type: 'UTF8', optional: true },
          display: { type: 'UTF8', optional: true },
          category_code: { type: 'UTF8', optional: true },
          category_display: { type: 'UTF8', optional: true },
          subject_reference: { type: 'UTF8', optional: true },
          patient_id: { type: 'UTF8', optional: true },
          effective_date_time: { type: 'UTF8', optional: true },
          issued: { type: 'UTF8', optional: true },
          value_quantity: { type: 'DOUBLE', optional: true },
          value_unit: { type: 'UTF8', optional: true },
          value_string: { type: 'UTF8', optional: true },
          value_boolean: { type: 'BOOLEAN', optional: true },
          reference_range_low: { type: 'DOUBLE', optional: true },
          reference_range_high: { type: 'DOUBLE', optional: true },
          raw_data: { type: 'UTF8' }
        });

      default:
        return new parquet.ParquetSchema({
          ...baseSchema.fields,
          rawData: { type: 'UTF8' }
        });
    }
  }

  async loadToBigQuery(resourceType, parquetFilePath) {
    if (!this.config.bigQuery) {
      logger.warn('BigQuery configuration not provided, skipping load');
      return;
    }

    try {
      logger.info(`Loading ${resourceType} data to BigQuery`);

      const datasetId = this.config.bigQuery.datasetId;
      const tableId = `${resourceType.toLowerCase()}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;

      const [job] = await this.bigquery
        .dataset(datasetId)
        .table(tableId)
        .load(parquetFilePath, {
          sourceFormat: 'PARQUET',
          autodetect: true,
          writeDisposition: 'WRITE_TRUNCATE'
        });

      logger.info(`BigQuery load job ${job.id} completed for ${resourceType}`);
    } catch (error) {
      logger.error(`Error loading to BigQuery:`, error);
      throw error;
    }
  }

  async runETL(resourceTypes = ['Patient', 'Observation']) {
    logger.info('Starting FHIR to Parquet ETL pipeline');
    
    const results = [];
    
    for (const resourceType of resourceTypes) {
      try {
        // Extract
        const { resources } = await this.extractFHIRData(resourceType);
        
        if (resources.length === 0) {
          logger.info(`No ${resourceType} resources found, skipping`);
          continue;
        }
        
        // Transform
        const transformedData = await this.transformToParquetSchema(resourceType, resources);
        
        // Load to Parquet
        const parquetFilePath = await this.writeParquetFile(resourceType, transformedData);
        
        // Load to BigQuery (optional)
        if (this.config.bigQuery) {
          await this.loadToBigQuery(resourceType, parquetFilePath);
        }
        
        results.push({
          resourceType,
          recordCount: resources.length,
          parquetFile: parquetFilePath,
          success: true
        });
        
      } catch (error) {
        logger.error(`Error processing ${resourceType}:`, error);
        results.push({
          resourceType,
          error: error.message,
          success: false
        });
      }
    }
    
    logger.info('ETL pipeline completed', { results });
    return results;
  }
}

module.exports = FHIRToParquetETL;
