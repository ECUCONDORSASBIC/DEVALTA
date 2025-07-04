const FHIRToParquetETL = require('./src/fhir-to-parquet');
require('dotenv').config();

async function main() {
  try {
    console.log('Starting FHIR to Parquet ETL Pipeline...');
    
    const config = {
      fhirServerUrl: process.env.FHIR_SERVER_URL || 'http://localhost:3000/fhir',
      accessToken: process.env.ACCESS_TOKEN,
      outputPath: process.env.OUTPUT_PATH || './output',
      batchSize: parseInt(process.env.BATCH_SIZE) || 100,
      bigQuery: process.env.BIGQUERY_PROJECT_ID ? {
        projectId: process.env.BIGQUERY_PROJECT_ID,
        datasetId: process.env.BIGQUERY_DATASET_ID || 'fhir_data',
        keyFilename: process.env.BIGQUERY_KEY_FILE
      } : null
    };

    if (!config.accessToken) {
      console.error('ERROR: ACCESS_TOKEN environment variable is required');
      process.exit(1);
    }

    const etl = new FHIRToParquetETL(config);
    
    const results = await etl.runETL(['Patient', 'Observation']);
    
    console.log('\nETL Pipeline Results:');
    console.table(results);
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\nSummary: ${successful}/${total} resource types processed successfully`);
    
    if (successful === total) {
      console.log('✅ ETL pipeline completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  ETL pipeline completed with errors');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ ETL pipeline failed:', error.message);
    process.exit(1);
  }
}

main();
