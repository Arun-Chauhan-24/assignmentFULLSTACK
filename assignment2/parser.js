// IITK ID card QR string format:
// "<prefix>.<rollNumber>,<version>,<signature>.iitkidcard"
//
// Example (real scanned value):
// "02.240764,1,MEYCIQCXuPDEM/zeRq7fviBit/zRGyv3CuizDVHgj3cSfKxuSAIhAPLb8O0oJptyZLfPlL8N6six7uL5XhetRnxZGgAdQOwu.iitkidcard"
//
// Breakdown:
//   "02.240764"   -> prefix "02" + 6-digit roll number "240764", joined by "."
//   "1"           -> version/type flag
//   "MEYCIQ...QOwu" -> base64-ish ECDSA signature over the card data
//   ".iitkidcard" -> trailing tag on the whole string
//
// NOTE: 240764 is OUTSIDE the old 240001-240400 range. That range was wrong/
// incomplete for real data. Update VALID_ROLL_MIN / VALID_ROLL_MAX below once
// you know the actual valid batch range for your registered students.

const VALID_ROLL_MIN = 240001;
const VALID_ROLL_MAX = 249999; // widen/narrow this once the real range is confirmed

/**
 * Extracts the roll number from a raw IITK ID card QR string.
 * @param {string} qrString - Raw decoded QR string
 * @returns {string|null} - Roll number as string, or null if not found/malformed
 */
function extractRollNumber(qrString) {
  if (typeof qrString !== 'string' || !qrString.trim()) return null;

  // First comma-separated field looks like "02.240764"
  const firstField = qrString.split(',')[0];
  if (!firstField || !firstField.includes('.')) return null;

  const parts = firstField.split('.');
  const rollNumber = parts[1];

  if (rollNumber && /^\d{6}$/.test(rollNumber)) {
    return rollNumber;
  }
  return null;
}

/**
 * Checks whether a roll number is a plausible/registered IITK roll number.
 * @param {string} rollNumber
 * @returns {boolean}
 */
function isRegistered(rollNumber) {
  if (!rollNumber || !/^\d{6}$/.test(rollNumber)) return false;
  const n = Number(rollNumber);
  return n >= VALID_ROLL_MIN && n <= VALID_ROLL_MAX;
}

if (require.main === module) {
  const testCases = [
    '02.240764,1,MEYCIQCXuPDEM/zeRq7fviBit/zRGyv3CuizDVHgj3cSfKxuSAIhAPLb8O0oJptyZLfPlL8N6six7uL5XhetRnxZGgAdQOwu.iitkidcard',
    '02.240123,1,SOMESIGNATURE.iitkidcard',
    '02.240400,2,ANOTHERSIG.iitkidcard',
    'garbage-no-valid-format',
    '',
  ];

  testCases.forEach((str) => {
    const roll = extractRollNumber(str);
    console.log(`Input: "${str}"`);
    console.log(`  Roll: ${roll}, Registered: ${roll ? isRegistered(roll) : false}`);
  });
}

module.exports = { extractRollNumber, isRegistered };
