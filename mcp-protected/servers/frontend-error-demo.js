#!/usr/bin/env node
// 🎯 FRONTEND ERROR HANDLING DEMO
// Demonstrates how to use the frontend error handler utilities

import { SafeDOMHandler, PromptManager, CSPManager, ErrorRecoveryManager } from './frontend-error-handler.js';

// 🔍 DEMO 1: Safe DOM Text Extraction
function demonstrateSafeDOMHandling() {
  console.log('\n🔍 DEMO 1: Safe DOM Text Extraction');
  console.log('='.repeat(50));

  // Simulate DOM elements (in real browser environment)
  const mockElement = {
    innerText: 'Hello World',
    textContent: 'Hello World Fallback',
    innerHTML: '<span>Hello HTML</span>'
  };

  const nullElement = null;
  const emptyElement = {};

  console.log('✅ Safe text extraction from valid element:');
  console.log(`Result: "${SafeDOMHandler.safeInnerText(mockElement)}"`);

  console.log('\n⚠️ Safe text extraction from null element:');
  console.log(`Result: "${SafeDOMHandler.safeInnerText(nullElement, 'Fallback text')}"`);

  console.log('\n⚠️ Safe text extraction from empty element:');
  console.log(`Result: "${SafeDOMHandler.safeInnerText(emptyElement, 'No content')}"`);

  // Multiple elements simulation
  const mockElements = [mockElement, nullElement, mockElement];
  console.log('\n📝 Multiple elements text extraction:');
  console.log(`Result: "${SafeDOMHandler.safeInnerTextMultiple(mockElements, ' | ', 'No elements')}"`);
}

// 📝 DEMO 2: Prompt Management and Pagination
async function demonstratePromptManagement() {
  console.log('\n📝 DEMO 2: Prompt Management and Pagination');
  console.log('='.repeat(50));

  const promptManager = new PromptManager({
    maxPromptLength: 1000,
    maxTokens: 250,
    chunkSize: 400
  });

  // Short prompt (no pagination needed)
  const shortPrompt = 'Create a React component for user authentication.';
  console.log('✅ Short prompt processing:');
  const shortResult = promptManager.processForAPI(shortPrompt);
  console.log(`Need pagination: ${shortResult.needsPagination}`);
  console.log(`Chunks: ${shortResult.chunks.length}`);
  console.log(`Total tokens: ${shortResult.totalTokens}`);

  // Long prompt (needs pagination)
  const longPrompt = `
    Create a comprehensive React application for a medical practice management system.
    The application should include the following features:
    
    1. Patient Management:
    - Patient registration and profile management
    - Medical history tracking
    - Insurance information management
    - Emergency contact information
    - Appointment scheduling system
    
    2. Doctor Management:
    - Doctor profiles and specializations
    - Schedule management
    - Availability tracking
    - Performance metrics
    
    3. Appointment System:
    - Real-time scheduling
    - Automated reminders
    - Conflict resolution
    - Waitlist management
    - Integration with calendar systems
    
    4. Medical Records:
    - Electronic health records (EHR)
    - Document management
    - Lab results integration
    - Prescription management
    - Medical imaging support
    
    5. Billing and Insurance:
    - Insurance verification
    - Claims processing
    - Payment tracking
    - Financial reporting
    - Integration with payment gateways
    
    6. Reporting and Analytics:
    - Patient analytics
    - Financial reports
    - Operational metrics
    - Custom dashboards
    - Export functionality
    
    The application should be built using modern React with TypeScript, use Firebase for backend services,
    implement proper authentication and authorization, ensure HIPAA compliance, and provide a responsive
    design that works on desktop and mobile devices. Include comprehensive error handling, loading states,
    and proper data validation throughout the application.
  `.repeat(5); // Make it really long

  console.log('\n⚡ Long prompt processing:');
  const longResult = promptManager.processForAPI(longPrompt);
  console.log(`Original length: ${longPrompt.length} characters`);
  console.log(`Need pagination: ${longResult.needsPagination}`);
  console.log(`Chunks: ${longResult.chunks.length}`);
  console.log(`Total tokens: ${longResult.totalTokens}`);

  if (longResult.chunks.length > 1) {
    console.log('\n📄 Chunk breakdown:');
    longResult.chunks.forEach((chunk, index) => {
      console.log(`  Chunk ${chunk.index}/${chunk.total}: ${chunk.content.length} chars, ~${chunk.estimatedTokens} tokens`);
    });
  }

  // Demonstrate truncation
  console.log('\n✂️ Truncation demonstration:');
  const truncatedResult = promptManager.processForAPI(longPrompt, { truncate: true });
  console.log(`Truncated: ${truncatedResult.truncated}`);
  console.log(`Final length: ${truncatedResult.chunks[0].content.length} characters`);

  // Smart summarization
  console.log('\n🧠 Smart summarization:');
  const summary = promptManager.smartSummarize(longPrompt, 500);
  console.log(`Summary length: ${summary.length} characters`);
  console.log(`Preview: ${summary.substring(0, 200)}...`);
}

// 🔒 DEMO 3: CSP Management
function demonstrateCSPManagement() {
  console.log('\n🔒 DEMO 3: CSP Management');
  console.log('='.repeat(50));

  const cspManager = new CSPManager();

  // Generate CSP header
  console.log('✅ Generate safe CSP header:');
  const cspHeader = cspManager.generateCSPHeader({
    allowInlineScripts: false,
    allowInlineStyles: true,
    additionalDomains: ['api.example.com', 'cdn.example.com']
  });
  console.log(`CSP Header: ${cspHeader}`);

  // Validate resource URLs
  console.log('\n🔍 URL Validation:');
  const urls = [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'http://malicious-site.com/script.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
    'ftp://unsafe-protocol.com/file.js'
  ];

  urls.forEach(url => {
    const validation = cspManager.validateResourceURL(url);
    console.log(`  ${url}`);
    console.log(`  Valid: ${validation.valid}`);
    if (!validation.valid) {
      console.log(`  Error: ${validation.error}`);
      if (validation.suggestion) {
        console.log(`  Suggestion: ${validation.suggestion}`);
      }
    }
    console.log('');
  });

  // Generate safe URLs
  console.log('🔧 Safe URL generation:');
  const libraries = ['react', 'vue', 'nonexistent-lib'];
  libraries.forEach(lib => {
    const safeUrl = cspManager.generateSafeResourceURL(lib, 'script');
    console.log(`  ${lib}: ${safeUrl}`);
  });
}

// 🚨 DEMO 4: Error Recovery
async function demonstrateErrorRecovery() {
  console.log('\n🚨 DEMO 4: Error Recovery');
  console.log('='.repeat(50));

  const errorRecovery = new ErrorRecoveryManager();
  const promptManager = new PromptManager();

  // Simulate API function that fails due to prompt length
  async function simulateAPICall(context) {
    if (context.prompt && context.prompt.length > 500) {
      throw new Error('prompt is too long');
    }
    if (Math.random() > 0.7) {
      throw new Error('rate limit exceeded');
    }
    return { success: true, response: 'API call successful' };
  }

  console.log('⚡ Testing error recovery with long prompt:');
  
  const longPrompt = 'This is a very long prompt that will cause an API error. '.repeat(50);
  
  try {
    const result = await errorRecovery.handleAPILimitError(
      new Error('prompt is too long'),
      simulateAPICall,
      { 
        prompt: longPrompt,
        endpoint: 'test-api',
        originalLength: longPrompt.length
      }
    );
    
    console.log('✅ Recovery successful:', result);
  } catch (error) {
    console.log('❌ Recovery failed after max retries:', error.message);
  }

  // Demonstrate graceful degradation
  console.log('\n🛡️ Graceful degradation:');
  const degradationResult = errorRecovery.gracefulDegrade(
    new Error('Service temporarily unavailable'),
    { message: 'Using cached data', cached: true }
  );
  console.log('Degradation result:', degradationResult);
}

// 🎯 DEMO 5: Integration Example
function demonstrateIntegration() {
  console.log('\n🎯 DEMO 5: Integration Example');
  console.log('='.repeat(50));

  // Simulate a complete MCP tool that uses all utilities
  class SafeMCPTool {
    constructor() {
      this.promptManager = new PromptManager();
      this.cspManager = new CSPManager();
      this.errorRecovery = new ErrorRecoveryManager();
    }

    async processUserInput(input) {
      try {
        console.log('🔄 Processing user input with safety checks...');

        // 1. Validate and process prompt
        const processed = this.promptManager.processForAPI(input.prompt);
        console.log(`✅ Prompt processed: ${processed.chunks.length} chunks, ${processed.totalTokens} tokens`);

        // 2. Validate any resource URLs
        if (input.resourceUrls) {
          input.resourceUrls.forEach(url => {
            const validation = this.cspManager.validateResourceURL(url);
            console.log(`🔍 URL ${url}: ${validation.valid ? 'Valid' : 'Invalid'}`);
          });
        }

        // 3. Safe DOM operations (simulated)
        if (input.domElements) {
          const texts = input.domElements.map(el => 
            SafeDOMHandler.safeInnerText(el, 'No content')
          );
          console.log(`📝 Extracted texts: ${texts.length} elements processed`);
        }

        // 4. Generate CSP if needed
        if (input.generateCSP) {
          const csp = this.cspManager.generateCSPHeader(input.cspOptions);
          console.log(`🔒 Generated CSP: ${csp.substring(0, 100)}...`);
        }

        return {
          success: true,
          processed: processed,
          message: 'Input processed safely with all error handling utilities'
        };

      } catch (error) {
        console.log('⚠️ Error occurred, attempting recovery...');
        return this.errorRecovery.gracefulDegrade(error, {
          partialResult: true,
          message: 'Partial processing completed'
        });
      }
    }
  }

  // Test the integrated tool
  const safeTool = new SafeMCPTool();
  
  const testInput = {
    prompt: 'Create a React component for user authentication with proper error handling.',
    resourceUrls: ['https://unpkg.com/react@18/umd/react.production.min.js'],
    domElements: [
      { innerText: 'Button Text' },
      null,
      { textContent: 'Fallback content' }
    ],
    generateCSP: true,
    cspOptions: { allowInlineStyles: true }
  };

  safeTool.processUserInput(testInput).then(result => {
    console.log('🎉 Integration result:', result);
  });
}

// 🚀 RUN ALL DEMOS
async function runAllDemos() {
  console.log('🎯 FRONTEND ERROR HANDLING UTILITIES DEMO');
  console.log('='.repeat(60));
  console.log('Demonstrating comprehensive error handling for MCP servers');

  demonstrateSafeDOMHandling();
  await demonstratePromptManagement();
  demonstrateCSPManagement();
  await demonstrateErrorRecovery();
  demonstrateIntegration();

  console.log('\n🎉 ALL DEMOS COMPLETED!');
  console.log('='.repeat(60));
  console.log('These utilities resolve:');
  console.log('✅ innerText null reference errors');
  console.log('✅ "prompt is too long" API limits');
  console.log('✅ "exceeded_limit" rate limiting');
  console.log('✅ CSP violations for external resources');
  console.log('✅ Graceful degradation on errors');
}

// Export for use in MCP servers
export {
  demonstrateSafeDOMHandling,
  demonstratePromptManagement,
  demonstrateCSPManagement,
  demonstrateErrorRecovery,
  demonstrateIntegration
};

// Run demos if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos().catch(console.error);
}
