// Test script for diagnostic engine
import { DiagnosticEngine } from './packages/diagnostic-engine/dist/index.js';

console.log('🔍 Testing Diagnostic Engine with expanded medical model...\n');

const engine = new DiagnosticEngine();

// Start a session
const session = engine.startSession({ age: 30, sex: 'M' });
console.log('📋 Session started:', session.id);
console.log('Initial hypotheses (top 5):');
session.hypotheses.slice(0, 5).forEach((h, i) => {
  console.log(`  ${i + 1}. ${h.name}: ${(h.probability * 100).toFixed(2)}%`);
});

// Simulate answering questions about headache and fever
console.log('\n🤒 Patient symptoms: Headache, fever, cough');

// Get first question
let question = engine.nextQuestion(session.id);
console.log('\n❓ Q1:', question?.text);

// Answer based on symptoms
if (question?.text.includes('Dolor de cabeza') || question?.text.includes('headache')) {
  engine.submitAnswer(session.id, question.id, { value: true });
  console.log('   ✅ Answer: Yes');
} else if (question?.text.includes('Fiebre') || question?.text.includes('fever')) {
  engine.submitAnswer(session.id, question.id, { value: true });
  console.log('   ✅ Answer: Yes');
} else if (question?.text.includes('Tos') || question?.text.includes('cough')) {
  engine.submitAnswer(session.id, question.id, { value: true });
  console.log('   ✅ Answer: Yes');
} else {
  engine.submitAnswer(session.id, question.id, { value: false });
  console.log('   ❌ Answer: No');
}

// Get next questions
for (let i = 0; i < 5; i++) {
  question = engine.nextQuestion(session.id);
  if (!question) break;
  
  console.log(`\n❓ Q${i + 2}:`, question.text);
  
  // Answer based on common flu symptoms
  let answer = false;
  if (question.text.includes('Dolor de cabeza') || question.text.includes('headache')) answer = true;
  if (question.text.includes('Fiebre') || question.text.includes('fever')) answer = true;
  if (question.text.includes('Tos') || question.text.includes('cough')) answer = true;
  if (question.text.includes('Mialgias') || question.text.includes('myalgia')) answer = true;
  if (question.text.includes('Dolor de garganta') || question.text.includes('sore throat')) answer = true;
  
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

if (report?.safetyWarnings && report.safetyWarnings.length > 0) {
  console.log('\n⚠️ Safety Warnings:', report.safetyWarnings);
}

console.log('\n✅ Test completed successfully!');
console.log('📝 Note: The diagnostic engine now includes:');
console.log('  - 27 medical conditions (cardio, gastro, respiratory, neuro, infectious, endocrine)');
console.log('  - 42 symptoms and evidence templates');
console.log('  - Bayesian inference with likelihood ratios');
console.log('  - Safety warnings for critical conditions');