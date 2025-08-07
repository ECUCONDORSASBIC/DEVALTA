
// Claude Integration Script for Gemini CLI
// Use this in Gemini to call Claude for medical expertise

async function callClaude(prompt, context = "medical") {
  const config = JSON.parse(require('fs').readFileSync('./gemini-claude-config.json', 'utf8'));
  
  const claudePrompt = `${config.medical_context.project} Context:

${prompt}

Please provide analysis focusing on:
1. Medical safety and patient care
2. HIPAA compliance requirements  
3. Code quality and architecture
4. Performance optimization for medical scenarios
5. Specific actionable recommendations`;

  console.log("🏥 Calling Claude for medical expertise...");
  console.log("📋 Prompt:", claudePrompt.substring(0, 200) + "...");
  
  return claudePrompt;
}

// Export for use in Gemini
if (typeof module !== 'undefined') {
  module.exports = { callClaude };
}
