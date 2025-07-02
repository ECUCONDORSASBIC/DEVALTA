# Test Helpers

This directory contains utility files for testing the philosophical decision-making and knowledge ingestion components.

## Files

### `philosophical-mocks.js`
- **PhilosophicalCore**: Mock class that instantiates with default principles (wisdom: 'high', empathy: 'medium', logic: 'high')
- **sampleDecisions**: Array of sample decisions for testing
- **sampleConflicts**: Array of sample conflicts for testing
- **sampleContext**: Sample context object with situation and urgency

### `knowledge-fixtures.js`
- **KnowledgeIngestionEngine**: Mock class extending EventEmitter that stubs network calls
- **sampleKnowledgeData**: Array of sample knowledge objects
- **sampleApiResponses**: Pre-defined API response objects for different scenarios
- **createStubbedKnowledgeEngine()**: Factory function to create customized stub instances
- **simulateNetworkDelay()**: Helper to add realistic delays in tests

### `test-utils.js`
- **createDefaultPhilosophicalCore()**: Factory for PhilosophicalCore with customizable principles
- **createDecisionScenarios()**: Generates complex decision-making test scenarios
- **createConflictScenarios()**: Generates conflict resolution test scenarios
- **createEventListener()**: Mock event listener for tracking EventEmitter behavior
- **setupTestEnvironment()**: Complete test environment setup with teardown
- **assertNoNetworkCalls()**: Assertion helper to verify no network calls were made
- **assertNetworkCall()**: Assertion helper to verify specific network calls

### `index.js`
Convenience file that re-exports all helpers for easy importing.

## Usage Examples

### Basic Usage
```javascript
const { PhilosophicalCore, KnowledgeIngestionEngine } = require('./test/helpers');

// Create instances with default settings
const core = new PhilosophicalCore();
const engine = new KnowledgeIngestionEngine();
```

### Using Test Utilities
```javascript
const { setupTestEnvironment, createDecisionScenarios } = require('./test/helpers');

describe('Philosophical Decision Making', () => {
    let testEnv;
    
    beforeEach(() => {
        testEnv = setupTestEnvironment({
            customPrinciples: { wisdom: 'very-high' },
            enableEventTracking: true
        });
    });
    
    afterEach(() => {
        testEnv.teardown();
    });
    
    it('should make decisions based on scenarios', () => {
        const scenarios = createDecisionScenarios();
        scenarios.forEach(scenario => {
            const decision = testEnv.philosophicalCore.makeDecision(scenario.context);
            // Assertions here...
        });
    });
});
```

### Stubbing Network Calls
```javascript
const { createStubbedKnowledgeEngine, sampleApiResponses } = require('./test/helpers');

const engine = createStubbedKnowledgeEngine({
    fetchKnowledge: sampleApiResponses.successResponse,
    postKnowledge: sampleApiResponses.errorResponse
});

// Network calls will return predefined responses without making real HTTP requests
```

### Event Tracking
```javascript
const { KnowledgeIngestionEngine, createEventListener } = require('./test/helpers');

const engine = new KnowledgeIngestionEngine();
const eventListener = createEventListener();

engine.on('knowledgeFetched', eventListener.onKnowledgeFetched);

await engine.fetchKnowledge('http://example.com');

// Check what events were emitted
const events = eventListener.getEvents();
const fetchEvents = eventListener.getEventsByType('knowledgeFetched');
```

## Features

- **No Live HTTP Requests**: All network calls are stubbed to prevent external dependencies
- **Event Tracking**: Built-in tracking for EventEmitter behavior
- **Customizable**: Factory functions allow customization of default behavior
- **Rich Test Data**: Includes realistic sample data for various testing scenarios
- **Easy Cleanup**: Automatic cleanup helpers to prevent test pollution
- **Assertion Helpers**: Built-in assertions for common testing patterns

## Integration

These helpers are designed to be imported by individual test files to keep the main test files compact and focused on the actual test logic rather than setup and mocking.
