const Jimp = require('jimp');
const jsqr = require('jsqr');

/**
 * Decodes a QR code from an image file.
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - The decoded QR string
 */
async function decodeQR(imagePath) {
  const image = await Jimp.read(imagePath);

  const bitmap = image.bitmap;
  const { data, width, height } = bitmap;

  const result = jsqr(data, width, height);

  if (result === null) {
    throw new Error('No QR code found');
  }

  return result.data;
}

if (require.main === module) {
  const testImagePath = process.argv[2] || './test.jpg';
  decodeQR(testImagePath)
    .then(data => {
      console.log('QR Code decoded successfully:');
      console.log(data);
    })
    .catch(err => {
      console.error('Error:', err.message);
    });
}

module.exports = { decodeQR };
