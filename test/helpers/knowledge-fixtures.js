// Knowledge Fixtures and Stubs
const { EventEmitter } = require('events');

// Mock KnowledgeIngestionEngine class that extends EventEmitter
class KnowledgeIngestionEngine extends EventEmitter {
    constructor() {
        super();
        this.isStubbed = true;
        this.networkCalls = [];
    }

    // Stub network calls to avoid live HTTP requests
    async fetchKnowledge(url) {
        this.networkCalls.push({ method: 'GET', url });
        
        // Return mock data instead of making real HTTP request
        const mockResponse = {
            status: 200,
            data: {
                knowledge: `Mock knowledge from ${url}`,
                timestamp: new Date().toISOString(),
                source: 'test-fixture'
            }
        };

        // Emit event to simulate real behavior
        this.emit('knowledgeFetched', mockResponse.data);
        
        return mockResponse;
    }

    async postKnowledge(url, data) {
        this.networkCalls.push({ method: 'POST', url, data });
        
        const mockResponse = {
            status: 201,
            data: {
                id: 'mock-id-123',
                message: 'Knowledge posted successfully',
                data: data
            }
        };

        this.emit('knowledgePosted', mockResponse.data);
        
        return mockResponse;
    }

    // Method to reset network call tracking
    resetNetworkCalls() {
        this.networkCalls = [];
    }

    // Method to get all tracked network calls
    getNetworkCalls() {
        return [...this.networkCalls];
    }

    // Simulate processing knowledge
    async processKnowledge(knowledge) {
        const processed = {
            ...knowledge,
            processed: true,
            processingTime: Date.now()
        };

        this.emit('knowledgeProcessed', processed);
        
        return processed;
    }
}

// Sample knowledge data for testing
const sampleKnowledgeData = [
    {
        id: 'knowledge-1',
        type: 'factual',
        content: 'The earth is round',
        source: 'test-source-1',
        confidence: 0.95
    },
    {
        id: 'knowledge-2',
        type: 'procedural',
        content: 'How to make coffee: 1. Boil water, 2. Add coffee, 3. Stir',
        source: 'test-source-2',
        confidence: 0.85
    },
    {
        id: 'knowledge-3',
        type: 'conceptual',
        content: 'Machine learning is a subset of artificial intelligence',
        source: 'test-source-3',
        confidence: 0.90
    }
];

// Sample API responses for stubbing
const sampleApiResponses = {
    successResponse: {
        status: 200,
        message: 'Success',
        data: sampleKnowledgeData[0]
    },
    errorResponse: {
        status: 500,
        message: 'Internal Server Error',
        error: 'Mock error for testing'
    },
    notFoundResponse: {
        status: 404,
        message: 'Not Found',
        error: 'Resource not found'
    }
};

// Helper function to create a stubbed instance with predefined responses
function createStubbedKnowledgeEngine(customResponses = {}) {
    const engine = new KnowledgeIngestionEngine();
    
    // Override methods with custom responses if provided
    if (customResponses.fetchKnowledge) {
        engine.fetchKnowledge = async (url) => {
            engine.networkCalls.push({ method: 'GET', url });
            const response = customResponses.fetchKnowledge;
            engine.emit('knowledgeFetched', response.data);
            return response;
        };
    }

    if (customResponses.postKnowledge) {
        engine.postKnowledge = async (url, data) => {
            engine.networkCalls.push({ method: 'POST', url, data });
            const response = customResponses.postKnowledge;
            engine.emit('knowledgePosted', response.data);
            return response;
        };
    }

    return engine;
}

// Helper function to simulate network delay
function simulateNetworkDelay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    KnowledgeIngestionEngine,
    sampleKnowledgeData,
    sampleApiResponses,
    createStubbedKnowledgeEngine,
    simulateNetworkDelay
};
