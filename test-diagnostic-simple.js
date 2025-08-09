// Simple test for diagnostic engine
const { DiagnosticEngine } = require('./packages/diagnostic-engine/dist/engine/diagnosticEngine.js');

console.log('🔍 Testing Diagnostic Engine with expanded medical model...\n');

const engine = new DiagnosticEngine();

// Start a session
const session = engine.startSession({ age: 30, sex: 'M' });
console.log('📋 Session started:', session.id);
console.log('Initial hypotheses (top 5):');
session.hypotheses.slice(0, 5).forEach((h, i) => {
  console.log(`  ${i + 1}. ${h.name}: ${(h.probability * 100).toFixed(2)}%`);
});

// Get first question
let question = engine.nextQuestion(session.id);
console.log('\n❓ Q1:', question?.text);

// Simulate answering "yes" to fever
if (question) {
  engine.submitAnswer(session.id, question.id, { value: true });
  console.log('   ✅ Answer: Yes (simulating fever)');
}

// Get more questions
for (let i = 0; i < 3; i++) {
  question = engine.nextQuestion(session.id);
  if (!question) break;
  
  console.log(`\n❓ Q${i + 2}:`, question.text);
  
  // Answer yes to flu-like symptoms
  const answer = i % 2 === 0;
  engine.submitAnswer(session.id, question.id, { value: answer });
  console.log(`   ${answer ? '✅' : '❌'} Answer: ${answer ? 'Yes' : 'No'}`);
}

// Generate report
const report = engine.generateReport(session.id);
console.log('\n📊 Final Diagnosis Report:');
console.log('Top conditions:');
report?.topHypotheses.slice(0, 5).forEach((h, i) => {
  console.log(`  ${i + 1}. ${h.name}: ${(h.probability * 100).toFixed(2)}%`);
});

console.log('\n✅ Test completed!');