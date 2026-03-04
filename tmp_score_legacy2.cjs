const fs = require('fs');

const { scoreAssessment, DEFAULT_SCORING_CONFIG } = require('./tmp_build/useAssessmentScoring.js');
const DEFAULT_ASSESSMENT_QUESTIONS = require('./tmp_legacy_questions.js');

const data = JSON.parse(fs.readFileSync('tmp_assessments_full.json', 'utf8'));
const oldAssessment = data.find(d => d.id === '497aadf4-015e-43e0-9eb0-0ba3fb4ac69e');

const DEFAULT_QUESTIONS = DEFAULT_ASSESSMENT_QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    type: q.type,
    options: q.options,
    required: q.required,
    weight: q.weight,
    help_text: q.description,
    scale_min: q.scale_min,
    scale_max: q.scale_max,
    scale_labels: q.scale_labels
}));

// Normalize questions just like in the component
const normalized = DEFAULT_QUESTIONS.map(q => ({
    ...q,
    question: q.question || q.text || 'Questão sem título'
}));

console.log("Answers:", Object.keys(oldAssessment.responses).length);
console.log("Legacy Questions Available:", normalized.length);

try {
    const result = scoreAssessment(oldAssessment.responses, normalized, DEFAULT_SCORING_CONFIG);
    console.log("Score Result: ", result.score, "%");
    console.log("Maturity: ", result.maturityLevel.name);
} catch (e) {
    console.error("Error running scoreAssessment:", e);
}
