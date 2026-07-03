// Raw IITK ID card QR string (example format — replace with your actual scanned string):
// Example: "IITK|240123|John Doe|B.Tech|CSE|2024"
// The roll number appears as a 6-digit number in the range 240001–240400.
// In the raw QR string above, '240123' is the roll number field.

/**
 * Extracts a valid IITK roll number from a QR string.
 * Regex-matches all 6-digit sequences, returns the first one in range 240001–240400.
 * @param {string} qrString - Raw decoded QR string
 * @returns {string|null} - Roll number as string, or null if not found
 */
function extractRollNumber(qrString) {
  const matches = qrString.match(/\d{6}/g);
  if (!matches) return null;

  const found = matches.find(num => {
    const n = Number(num);
    return n >= 240001 && n <= 240400;
  });

  return found || null;
}

/**
 * Checks whether a roll number is in the registered range (240001–240400 inclusive).
 * @param {string} rollNumber - Roll number as string
 * @returns {boolean}
 */
function isRegistered(rollNumber) {
  const n = Number(rollNumber);
  return n >= 240001 && n <= 240400;
}

// Standalone test
if (require.main === module) {
  const testStrings = [
    'IITK|240123|John Doe|B.Tech|CSE|2024',
    'IITK|239999|Jane Doe|B.Tech|EE|2024',
    'IITK|240400|Alice|B.Tech|ME|2024',
    'IITK|240401|Bob|B.Tech|PHY|2024',
    'no-numbers-here',
  ];

  for (const str of testStrings) {
    const roll = extractRollNumber(str);
    console.log(`Input: "${str}"`);
    console.log(`  extractRollNumber → ${roll}`);
    if (roll) console.log(`  isRegistered     → ${isRegistered(roll)}`);
    console.log();
  }
}

module.exports = { extractRollNumber, isRegistered };
