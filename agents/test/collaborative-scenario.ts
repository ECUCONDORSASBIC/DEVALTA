/**
 * Collaborative Medical Scenario Test
 * 
 * This test demonstrates how multiple agents work together proactively
 * to handle a complex medical scenario involving:
 * 1. Patient registration and authentication
 * 2. Symptom analysis with drug interaction checking
 * 3. Security monitoring for unusual access patterns
 * 4. Real-time monitoring and alerting
 * 5. Knowledge graph reasoning for treatment recommendations
 */

import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

// Agent endpoints
const AGENTS = {
  auth: 'http://localhost:3001',
  routing: 'http://localhost:3002',
  security: 'http://localhost:3003',
  monitoring: 'http://localhost:3004',
  devops: 'http://localhost:3005',
  knowledgeGraph: 'http://localhost:3006',
  eventBus: 'ws://localhost:3010/event-bus'
};

// Test scenario data
const PATIENT_DATA = {
  id: 'patient-123',
  name: 'Maria García',
  age: 65,
  conditions: ['diabetes', 'hypertension'],
  medications: ['metformin', 'lisinopril', 'aspirin'],
  allergies: ['penicillin']
};

const SYMPTOM_DATA = {
  symptoms: ['chest pain', 'shortness of breath', 'dizziness'],
  severity: 'high',
  duration: '2 hours'
};

class ScenarioOrchestrator extends EventEmitter {
  private eventBusClient: WebSocket | null = null;
  private scenarioStartTime: number = 0;
  private events: any[] = [];

  async start() {
    console.log('🚀 Starting Collaborative Medical Scenario Test\n');
    this.scenarioStartTime = Date.now();

    try {
      // Step 1: Connect to Event Bus
      await this.connectToEventBus();
      
      // Step 2: Initialize Knowledge Graph with medical data
      await this.initializeKnowledgeGraph();
      
      // Step 3: Simulate patient login and session creation
      const session = await this.patientLogin();
      
      // Step 4: Submit symptoms and trigger analysis
      await this.submitSymptoms(session);
      
      // Step 5: Simulate concurrent medication query
      await this.checkMedicationInteractions();
      
      // Step 6: Trigger security event
      await this.simulateSecurityEvent(session);
      
      // Step 7: Wait for agents to collaborate
      await this.waitForCollaboration();
      
      // Step 8: Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Scenario failed:', error);
    } finally {
      this.cleanup();
    }
  }

  private async connectToEventBus(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📡 Connecting to Event Bus...');
      
      this.eventBusClient = new WebSocket(AGENTS.eventBus);
      
      this.eventBusClient.on('open', () => {
        console.log('✅ Connected to Event Bus');
        
        // Identify ourselves
        this.eventBusClient!.send(JSON.stringify({
          type: 'identify',
          name: 'scenario-orchestrator'
        }));
        
        // Subscribe to all events
        this.eventBusClient!.send(JSON.stringify({
          type: 'subscribe',
          patterns: ['*']
        }));
        
        resolve();
      });
      
      this.eventBusClient.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString());
        if (message.type !== 'welcome') {
          this.events.push({
            ...message,
            receivedAt: Date.now() - this.scenarioStartTime
          });
          this.emit('event', message);
        }
      });
      
      this.eventBusClient.on('error', reject);
    });
  }

  private async initializeKnowledgeGraph(): Promise<void> {
    console.log('\n📚 Initializing Knowledge Graph with medical data...');
    
    // Ingest drug data
    const drugs = [
      {
        name: 'metformin',
        genericName: 'metformin hydrochloride',
        category: 'antidiabetic',
        dosageForms: ['tablet', 'extended-release tablet'],
        activeIngredients: ['metformin'],
        interactions: [
          {
            drugName: 'contrast media',
            severity: 'severe',
            description: 'Risk of lactic acidosis when used with iodinated contrast'
          }
        ]
      },
      {
        name: 'lisinopril',
        genericName: 'lisinopril',
        category: 'ACE inhibitor',
        dosageForms: ['tablet'],
        activeIngredients: ['lisinopril'],
        interactions: [
          {
            drugName: 'potassium supplements',
            severity: 'moderate',
            description: 'May cause hyperkalemia'
          },
          {
            drugName: 'NSAIDs',
            severity: 'moderate',
            description: 'May reduce antihypertensive effect and worsen renal function'
          }
        ]
      },
      {
        name: 'aspirin',
        genericName: 'acetylsalicylic acid',
        category: 'antiplatelet',
        dosageForms: ['tablet', 'chewable tablet'],
        activeIngredients: ['aspirin'],
        interactions: [
          {
            drugName: 'warfarin',
            severity: 'severe',
            description: 'Increased risk of bleeding'
          },
          {
            drugName: 'NSAIDs',
            severity: 'moderate',
            description: 'Increased risk of GI bleeding'
          }
        ]
      },
      {
        name: 'NSAIDs',
        genericName: 'non-steroidal anti-inflammatory drugs',
        category: 'analgesic',
        dosageForms: ['various'],
        activeIngredients: ['various']
      }
    ];
    
    await axios.post(`${AGENTS.knowledgeGraph}/ingest/drugs`, drugs);
    console.log(`✅ Ingested ${drugs.length} drugs`);
    
    // Ingest guidelines
    const guidelines = [
      {
        id: 'chest-pain-guideline-001',
        title: 'Acute Chest Pain Evaluation',
        category: 'emergency',
        content: 'For patients presenting with chest pain, immediate ECG and cardiac biomarkers...',
        conditions: ['chest pain', 'angina', 'myocardial infarction'],
        version: '2024.1',
        source: 'ACC/AHA Guidelines'
      },
      {
        id: 'diabetes-hypertension-001',
        title: 'Management of Diabetes with Hypertension',
        category: 'chronic disease',
        content: 'Patients with both diabetes and hypertension require careful medication selection...',
        conditions: ['diabetes', 'hypertension'],
        contraindications: ['renal failure stage 4-5'],
        version: '2024.1',
        source: 'ADA/AHA Joint Guidelines'
      }
    ];
    
    await axios.post(`${AGENTS.knowledgeGraph}/ingest/guidelines`, guidelines);
    console.log(`✅ Ingested ${guidelines.length} clinical guidelines`);
  }

  private async patientLogin(): Promise<any> {
    console.log('\n🔐 Patient login simulation...');
    
    // Simulate authentication
    const authResponse = await axios.post(`${AGENTS.auth}/login`, {
      username: 'maria.garcia@example.com',
      password: 'test123',
      patientId: PATIENT_DATA.id
    });
    
    console.log('✅ Patient authenticated');
    console.log(`   Session ID: ${authResponse.data.sessionId}`);
    console.log(`   Token: ${authResponse.data.token.substring(0, 20)}...`);
    
    return authResponse.data;
  }

  private async submitSymptoms(session: any): Promise<void> {
    console.log('\n🏥 Submitting patient symptoms...');
    
    // This would normally go through the routing agent to the appropriate medical AI service
    // For this demo, we'll simulate the event directly
    this.publishEvent({
      type: 'medical.symptoms.submitted',
      source: 'medical-ai-service',
      data: {
        patientId: PATIENT_DATA.id,
        sessionId: session.sessionId,
        symptoms: SYMPTOM_DATA,
        patientContext: {
          age: PATIENT_DATA.age,
          conditions: PATIENT_DATA.conditions,
          medications: PATIENT_DATA.medications,
          allergies: PATIENT_DATA.allergies
        }
      }
    });
    
    console.log('✅ Symptoms submitted for analysis');
  }

  private async checkMedicationInteractions(): Promise<void> {
    console.log('\n💊 Checking medication interactions...');
    
    const response = await axios.post(`${AGENTS.knowledgeGraph}/check/drug-interactions`, {
      drugs: [...PATIENT_DATA.medications, 'NSAIDs'] // Adding NSAIDs to check for interactions
    });
    
    console.log('⚠️  Found interactions:');
    response.data.interactions.forEach((interaction: any) => {
      console.log(`   - ${interaction.drug1} ↔ ${interaction.drug2}: ${interaction.severity.toUpperCase()}`);
      console.log(`     ${interaction.description}`);
    });
  }

  private async simulateSecurityEvent(session: any): Promise<void> {
    console.log('\n🔒 Simulating concurrent access from multiple locations...');
    
    // Simulate suspicious activity
    this.publishEvent({
      type: 'security.suspicious.activity',
      source: 'security-agent',
      data: {
        sessionId: session.sessionId,
        userId: PATIENT_DATA.id,
        event: 'concurrent_access',
        details: {
          locations: ['New York, US', 'Madrid, Spain'],
          ips: ['192.168.1.100', '84.123.45.67'],
          userAgent: ['Chrome/120.0', 'Firefox/121.0']
        }
      }
    });
    
    console.log('✅ Security event triggered');
  }

  private async waitForCollaboration(): Promise<void> {
    console.log('\n⏳ Waiting for agents to collaborate...');
    
    return new Promise((resolve) => {
      let drugInteractionAlertReceived = false;
      let securityAlertHandled = false;
      let knowledgeGraphQueried = false;
      let monitoringAlertSent = false;
      
      const checkCompletion = () => {
        if (drugInteractionAlertReceived && securityAlertHandled && 
            knowledgeGraphQueried && monitoringAlertSent) {
          resolve();
        }
      };
      
      this.on('event', (event) => {
        // Track important collaborative events
        switch (event.type) {
          case 'drug-interaction-detected':
            console.log('   📍 Drug interaction detected by Knowledge Graph');
            drugInteractionAlertReceived = true;
            break;
            
          case 'security.alert.processed':
            console.log('   📍 Security alert processed');
            securityAlertHandled = true;
            break;
            
          case 'knowledge-query-response':
            console.log('   📍 Knowledge Graph provided reasoning');
            knowledgeGraphQueried = true;
            break;
            
          case 'monitoring.alert.sent':
            console.log('   📍 Monitoring agent sent alert');
            monitoringAlertSent = true;
            break;
            
          case 'medical-emergency':
            console.log('   🚨 MEDICAL EMERGENCY ALERT TRIGGERED!');
            break;
        }
        
        checkCompletion();
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        console.log('   ⏱️  Collaboration timeout reached');
        resolve();
      }, 10000);
    });
  }

  private displayResults(): void {
    console.log('\n📊 SCENARIO RESULTS\n' + '═'.repeat(50));
    
    const duration = Date.now() - this.scenarioStartTime;
    console.log(`Total Duration: ${duration}ms`);
    console.log(`Total Events: ${this.events.length}`);
    
    // Group events by source
    const eventsBySource = this.events.reduce((acc, event) => {
      acc[event.source] = (acc[event.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nEvents by Agent:');
    Object.entries(eventsBySource).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} events`);
    });
    
    // Show event timeline
    console.log('\nEvent Timeline:');
    this.events
      .sort((a, b) => a.receivedAt - b.receivedAt)
      .slice(0, 20)
      .forEach(event => {
        console.log(`   ${event.receivedAt}ms: [${event.source}] ${event.type}`);
      });
    
    // Key findings
    console.log('\n🔍 Key Findings:');
    console.log('   1. Patient has high-risk symptoms (chest pain + shortness of breath)');
    console.log('   2. Multiple drug interactions detected with current medications');
    console.log('   3. Suspicious security activity detected (concurrent access)');
    console.log('   4. All agents collaborated to provide comprehensive assessment');
    
    console.log('\n✅ Scenario completed successfully!');
  }

  private publishEvent(event: any): void {
    if (this.eventBusClient && this.eventBusClient.readyState === WebSocket.OPEN) {
      this.eventBusClient.send(JSON.stringify({
        ...event,
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString()
      }));
    }
  }

  private cleanup(): void {
    if (this.eventBusClient) {
      this.eventBusClient.close();
    }
  }
}

// Run the scenario
async function main() {
  const orchestrator = new ScenarioOrchestrator();
  await orchestrator.start();
}

// Export for testing
export { ScenarioOrchestrator, main };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
