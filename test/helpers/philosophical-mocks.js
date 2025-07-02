// Philosophical Mocks

// Assuming PhilosophicalCore is a class that requires some default principles
class PhilosophicalCore {
    constructor(principles = { wisdom: 'high', empathy: 'medium', logic: 'high' }) {
        this.principles = principles;
    }

    makeDecision(context) {
        return `Decision based on context: ${context}`;
    }

    resolveConflict(conflict) {
        return `Conflict resolved: ${conflict}`;
    }
}

const sampleDecisions = [
    'Decision 1', 'Decision 2', 'Decision 3'
];

const sampleConflicts = [
    'Conflict A', 'Conflict B'
];

const sampleContext = {
    situation: 'Example situation',
    urgency: 'low',
};

module.exports = {
    PhilosophicalCore,
    sampleDecisions,
    sampleConflicts,
    sampleContext
};

