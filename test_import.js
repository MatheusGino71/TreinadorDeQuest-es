console.log('Testing direct import from server...');

const path = require('path');
process.chdir('/home/runner/workspace');

// Simular o mesmo import que o servidor faz
try {
  const questionsData = require('./clean_questions.ts');
  console.log('Clean questions loaded:', Object.keys(questionsData));
} catch (e) {
  console.log('Import error:', e.message);
}

