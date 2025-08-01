# ALTAMEDICA Agent Collaborative Testing Guide

## Overview

This guide demonstrates how to test the collaborative capabilities of the ALTAMEDICA agent system. The test scenario shows how multiple specialized agents work together proactively to handle complex medical scenarios.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Event Bus (Port 3010)                    │
│                    Central Message Broker (WebSocket)            │
└─────────────────┬───────────────────────────────┬───────────────┘
                  │                               │
    ┌─────────────┴─────────────┐   ┌────────────┴────────────┐
    │                           │   │                          │
┌───▼────────┐  ┌──────────────▼┐ ┌▼─────────────┐ ┌─────────▼──────┐
│Auth Agent  │  │Routing Agent  │ │Security Agent│ │Monitoring Agent│
│(Port 3001) │  │(Port 3002)    │ │(Port 3003)   │ │(Port 3004)     │
└────────────┘  └───────────────┘ └──────────────┘ └────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                    ┌─────────▼────────┐     ┌─────────▼──────────┐
                    │Knowledge Graph   │     │DevOps Agent        │
                    │Agent (Port 3006) │     │(Port 3005)         │
                    └──────────────────┘     └────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │   Neo4j Database │
                    └──────────────────┘
```

## Test Scenario

The collaborative test scenario simulates a medical emergency involving:

1. **Patient Profile**:
   - Maria García, 65 years old
   - Existing conditions: Diabetes, Hypertension
   - Current medications: Metformin, Lisinopril, Aspirin
   - Allergies: Penicillin

2. **Emergency Situation**:
   - Symptoms: Chest pain, shortness of breath, dizziness
   - Duration: 2 hours
   - Severity: High

3. **Agent Collaboration**:
   - **Auth Agent**: Authenticates patient and creates secure session
   - **Knowledge Graph Agent**: Provides drug interaction warnings and clinical guidelines
   - **Security Agent**: Detects suspicious concurrent access patterns
   - **Monitoring Agent**: Tracks all events and generates alerts
   - **Routing Agent**: Directs requests to appropriate services

## Prerequisites

1. **Neo4j Database**:
   ```bash
   # Using Docker
   docker run -d \
     --name neo4j \
     -p 7474:7474 -p 7687:7687 \
     -e NEO4J_AUTH=neo4j/password \
     neo4j:latest
   ```

2. **Firebase/Firestore**:
   - Create a Firebase project
   - Download service account credentials
   - Set environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
     ```

3. **Install Dependencies**:
   ```bash
   cd agents
   npm install
   npm install -D neo4j-driver @google-cloud/firestore
   ```

## Running the Collaborative Test

### Option 1: Automated Full Test

Run the complete collaborative test suite:

```bash
npm run test:collaborative
```

This will:
1. Start the Event Bus
2. Launch all agents with proper configuration
3. Wait for all services to be ready
4. Execute the medical emergency scenario
5. Display collaboration results

### Option 2: Manual Step-by-Step

1. **Start Event Bus**:
   ```bash
   npm run start:event-bus
   ```

2. **Start Agents** (in separate terminals):
   ```bash
   npm run start:auth
   npm run start:routing
   npm run start:security
   npm run start:monitoring
   npm run start:knowledge-graph
   ```

3. **Run Test Scenario**:
   ```bash
   npm run test:scenario
   ```

## Expected Results

### Successful Collaboration Indicators:

1. **Event Flow**:
   - Patient authentication creates session
   - Symptom submission triggers knowledge graph query
   - Drug interactions are detected and alerted
   - Security anomaly is identified
   - Monitoring agent aggregates all events

2. **Key Outputs**:
   ```
   📍 Drug interaction detected by Knowledge Graph
   📍 Security alert processed
   📍 Knowledge Graph provided reasoning
   📍 Monitoring agent sent alert
   🚨 MEDICAL EMERGENCY ALERT TRIGGERED!
   ```

3. **Metrics**:
   - Total event count: 15-25 events
   - Response time: < 2 seconds for critical alerts
   - All agents participate in the scenario

## Monitoring the Test

### Event Bus Dashboard
Access the Event Bus metrics at: `http://localhost:3010/metrics`

### Agent Health Checks
Each agent exposes health endpoints:
- Auth: `http://localhost:3001/health`
- Routing: `http://localhost:3002/health`
- Security: `http://localhost:3003/health`
- Monitoring: `http://localhost:3004/health`
- Knowledge Graph: `http://localhost:3006/health`

### Real-time Event Stream
Connect to the Event Bus WebSocket:
```javascript
const ws = new WebSocket('ws://localhost:3010/event-bus');
ws.on('message', (data) => console.log(JSON.parse(data)));
```

## Troubleshooting

### Common Issues:

1. **Port Already in Use**:
   ```bash
   # Find process using port
   netstat -ano | findstr :3010
   # Kill process
   taskkill /PID <process_id> /F
   ```

2. **Neo4j Connection Failed**:
   - Ensure Neo4j is running: `http://localhost:7474`
   - Check credentials in `knowledge-graph-agent.json`

3. **Event Bus Connection Timeout**:
   - Verify WebSocket port 3010 is accessible
   - Check firewall settings

## Extending the Test

### Add New Test Scenarios:

1. Create new scenario file in `test/` directory
2. Import `ScenarioOrchestrator` class
3. Define new patient data and events
4. Run with: `ts-node test/your-scenario.ts`

### Custom Agent Rules:

Add reactive rules to any agent:
```typescript
this.addRule({
  id: 'custom-rule',
  name: 'My Custom Rule',
  conditions: [{
    field: 'event.type',
    operator: 'eq',
    value: 'my-event'
  }],
  actions: [{
    type: 'alert',
    data: { priority: 'high' }
  }]
});
```

## Performance Benchmarks

Expected performance metrics:
- Event Bus throughput: 1000+ events/second
- Agent response time: < 100ms
- End-to-end scenario: < 5 seconds
- Memory usage per agent: < 100MB

## Next Steps

1. **Production Deployment**:
   - Configure proper authentication for Event Bus
   - Set up monitoring with Grafana
   - Implement distributed tracing

2. **Advanced Scenarios**:
   - Multi-patient emergency simulation
   - Load testing with 100+ concurrent patients
   - Disaster recovery testing

3. **Integration**:
   - Connect to real medical AI services
   - Integrate with hospital information systems
   - Add FHIR compliance
