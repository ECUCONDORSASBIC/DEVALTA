// Test Helpers Index
// This file provides a convenient way to import all test helpers

const philosophicalMocks = require('./philosophical-mocks');
const knowledgeFixtures = require('./knowledge-fixtures');
const testUtils = require('./test-utils');

module.exports = {
    // Re-export from philosophical-mocks
    ...philosophicalMocks,
    
    // Re-export from knowledge-fixtures  
    ...knowledgeFixtures,
    
    // Re-export from test-utils
    ...testUtils,
    
    // Namespace exports for more explicit imports
    philosophicalMocks,
    knowledgeFixtures,
    testUtils
};
