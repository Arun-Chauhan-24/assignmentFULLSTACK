const fs = require('fs');

const ATTENDANCE_FILE = './attendance.json';

// Init store: read from disk on require, start with {} if file doesn't exist
let store = {};
try {
  const raw = fs.readFileSync(ATTENDANCE_FILE, 'utf8');
  store = JSON.parse(raw);
} catch (err) {
  store = {};
}

/**
 * Marks a student as present.
 * @param {string} rollNumber
 * @returns {{ success: boolean, reason?: string, timestamp?: string }}
 */
function markPresent(rollNumber) {
  if (store[rollNumber]) {
    return {
      success: false,
      reason: 'already_marked',
      timestamp: store[rollNumber].timestamp,
    };
  }

  store[rollNumber] = {
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(store, null, 2), 'utf8');

  return { success: true };
}

/**
 * Returns current attendance statistics.
 * @returns {{ total: number, rollNumbers: string[] }}
 */
function getStats() {
  const rollNumbers = Object.keys(store).sort();
  return {
    total: rollNumbers.length,
    rollNumbers,
  };
}

// Standalone test
if (require.main === module) {
  console.log('Testing markPresent()...');

  let result = markPresent('240101');
  console.log('Mark 240101 (first time):', result);

  result = markPresent('240101');
  console.log('Mark 240101 (duplicate):', result);

  result = markPresent('240202');
  console.log('Mark 240202 (first time):', result);

  console.log('\ngetStats():', getStats());
}

module.exports = { markPresent, getStats };