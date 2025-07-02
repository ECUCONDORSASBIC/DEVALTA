// Test Utilities
const { PhilosophicalCore, sampleDecisions, sampleConflicts, sampleContext } = require('./philosophical-mocks');
const { 
    KnowledgeIngestionEngine, 
    sampleKnowledgeData, 
    sampleApiResponses, 
    createStubbedKnowledgeEngine,
    simulateNetworkDelay 
} = require('./knowledge-fixtures');

// Create a default PhilosophicalCore instance with default principles
function createDefaultPhilosophicalCore(customPrinciples = {}) {
    const defaultPrinciples = {
        wisdom: 'high',
        empathy: 'medium',
        logic: 'high',
        creativity: 'medium',
        pragmatism: 'high',
        ...customPrinciples
    };
    
    return new PhilosophicalCore(defaultPrinciples);
}

// Create multiple test scenarios for decision making
function createDecisionScenarios() {
    return [
        {
            name: 'urgent-medical-decision',
            context: {
                situation: 'Patient requires immediate attention',
                urgency: 'critical',
                resources: 'limited',
                stakeholders: ['patient', 'family', 'medical-team']
            },
            expectedDecision: 'Prioritize immediate patient care'
        },
        {
            name: 'resource-allocation',
            context: {
                situation: 'Limited resources need to be distributed',
                urgency: 'medium',
                resources: 'constrained',
                stakeholders: ['multiple-patients', 'staff', 'administration']
            },
            expectedDecision: 'Allocate based on medical priority'
        },
        {
            name: 'ethical-dilemma',
            context: {
                situation: 'Conflicting ethical principles',
                urgency: 'low',
                resources: 'adequate',
                stakeholders: ['patient', 'family', 'ethics-committee']
            },
            expectedDecision: 'Consult ethics committee for guidance'
        }
    ];
}

// Create conflict scenarios for testing
function createConflictScenarios() {
    return [
        {
            name: 'patient-family-disagreement',
            conflict: {
                type: 'stakeholder-disagreement',
                parties: ['patient', 'family'],
                issue: 'treatment-approach',
                severity: 'high'
            },
            resolution: 'Facilitate family meeting with medical team'
        },
        {
            name: 'resource-conflict',
            conflict: {
                type: 'resource-scarcity',
                parties: ['department-a', 'department-b'],
                issue: 'equipment-allocation',
                severity: 'medium'
            },
            resolution: 'Implement fair rotation schedule'
        }
    ];
}

// Helper to create a mock event listener for testing EventEmitter behavior
function createEventListener() {
    const events = [];
    
    const listener = {
        events,
        onKnowledgeFetched: (data) => events.push({ type: 'knowledgeFetched', data, timestamp: Date.now() }),
        onKnowledgePosted: (data) => events.push({ type: 'knowledgePosted', data, timestamp: Date.now() }),
        onKnowledgeProcessed: (data) => events.push({ type: 'knowledgeProcessed', data, timestamp: Date.now() }),
        getEvents: () => [...events],
        clearEvents: () => events.length = 0,
        getEventsByType: (type) => events.filter(event => event.type === type)
    };
    
    return listener;
}

// Helper to set up a complete test environment
function setupTestEnvironment(options = {}) {
    const {
        customPrinciples = {},
        customKnowledgeResponses = {},
        enableEventTracking = true
    } = options;

    const philosophicalCore = createDefaultPhilosophicalCore(customPrinciples);
    const knowledgeEngine = createStubbedKnowledgeEngine(customKnowledgeResponses);
    const eventListener = enableEventTracking ? createEventListener() : null;

    // Attach event listeners if tracking is enabled
    if (eventListener) {
        knowledgeEngine.on('knowledgeFetched', eventListener.onKnowledgeFetched);
        knowledgeEngine.on('knowledgePosted', eventListener.onKnowledgePosted);
        knowledgeEngine.on('knowledgeProcessed', eventListener.onKnowledgeProcessed);
    }

    return {
        philosophicalCore,
        knowledgeEngine,
        eventListener,
        teardown: () => {
            if (knowledgeEngine) {
                knowledgeEngine.removeAllListeners();
                knowledgeEngine.resetNetworkCalls();
            }
            if (eventListener) {
                eventListener.clearEvents();
            }
        }
    };
}

// Helper to assert that no network calls were made
function assertNoNetworkCalls(knowledgeEngine) {
    const calls = knowledgeEngine.getNetworkCalls();
    if (calls.length > 0) {
        throw new Error(`Expected no network calls, but found ${calls.length} calls: ${JSON.stringify(calls)}`);
    }
}

// Helper to assert specific network calls were made
function assertNetworkCall(knowledgeEngine, expectedCall) {
    const calls = knowledgeEngine.getNetworkCalls();
    const matchingCall = calls.find(call => 
        call.method === expectedCall.method && 
        call.url === expectedCall.url
    );
    
    if (!matchingCall) {
        throw new Error(`Expected network call not found: ${JSON.stringify(expectedCall)}. Actual calls: ${JSON.stringify(calls)}`);
    }
    
    return matchingCall;
}

module.exports = {
    // Core instances
    createDefaultPhilosophicalCore,
    createStubbedKnowledgeEngine,
    
    // Test scenarios
    createDecisionScenarios,
    createConflictScenarios,
    
    // Event handling
    createEventListener,
    
    // Environment setup
    setupTestEnvironment,
    
    // Assertion helpers
    assertNoNetworkCalls,
    assertNetworkCall,
    
    // Utilities
    simulateNetworkDelay,
    
    // Sample data
    sampleDecisions,
    sampleConflicts,
    sampleContext,
    sampleKnowledgeData,
    sampleApiResponses
};
