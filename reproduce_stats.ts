
// Mock localStorage and window
global.localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    key: () => null,
    length: 0
} as any;

global.window = {
    location: {
        origin: 'http://localhost:3000'
    }
} as any;

import { DEFAULT_ASSESSMENT_QUESTIONS, calculateAssessmentStats } from './src/components/vendor-risk/shared/RiskAssessmentManager';

// Mock questions to match the 16 default ones
const questions = DEFAULT_ASSESSMENT_QUESTIONS;

console.log('Total Questions:', questions.length);

// Scenario 1: All required answered, optional unanswered
const responses1 = {
    gov_1: 'yes',
    gov_2: 'yes',
    gov_3: 'Sim, anualmente',
    access_1: 'yes',
    access_2: 'Imediato (automático)',
    access_3: 'yes',
    privacy_1: 'yes',
    privacy_2: '5',
    privacy_3: 'yes',
    phys_1: 'yes',
    // phys_2 (optional) skipped
    inc_1: 'yes',
    inc_2: 'Mensalmente',
    tp_1: 'yes',
    // evid_1 (optional) skipped
    // obs_1 (optional) skipped
};

const stats1 = calculateAssessmentStats(questions, responses1);
console.log('Scenario 1 (13/16 answered):', stats1);

// Scenario 2: All answered (including optional)
const responses2 = {
    ...responses1,
    phys_2: 'yes',
    evid_1: '{"name":"test.pdf"}',
    obs_1: 'No observations'
};

const stats2 = calculateAssessmentStats(questions, responses2);
console.log('Scenario 2 (16/16 answered):', stats2);

// Scenario 3: Optional answered with empty string (should be unanswered)
const responses3 = {
    ...responses1,
    evid_1: ''
};

const stats3 = calculateAssessmentStats(questions, responses3);
console.log('Scenario 3 (13/16 answered, evid_1 empty):', stats3);

// Scenario 4: Optional answered with null (should be unanswered)
const responses4 = {
    ...responses1,
    evid_1: null
};

const stats4 = calculateAssessmentStats(questions, responses4);
console.log('Scenario 4 (13/16 answered, evid_1 null):', stats4);

// Scenario 5: Extra keys in responses (should be ignored)
const responses5 = {
    ...responses1,
    garbage_key: 'some value',
    evid_1_evidence: 'some evidence'
};

const stats5 = calculateAssessmentStats(questions, responses5);
console.log('Scenario 5 (13/16 answered, extra keys):', stats5);
