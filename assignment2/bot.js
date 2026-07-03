require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const os = require('os');
const fs = require('fs');

const { decodeQR } = require('./qr');
const { extractRollNumber, isRegistered } = require('./parser');
const { markPresent, getStats } = require('./attendance');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('Error: BOT_TOKEN is not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    '👋 Welcome to the IITK Attendance Bot!\n\n' +
    'Send a photo of a student\'s IITK ID card to mark attendance.\n\n' +
    'Commands:\n' +
    '/report — View current attendance stats\n' +
    '/export — Download attendance as CSV'
  );
});

// /report command
bot.onText(/\/report/, (msg) => {
  const chatId = msg.chat.id;
  const stats = getStats();

  const rollList = stats.rollNumbers.length > 0
    ? stats.rollNumbers.join('\n')
    : '(none yet)';

  bot.sendMessage(
    chatId,
    `📊 *Attendance Report*\n\n` +
    `Total present: *${stats.total}*\n\n` +
    `Roll numbers:\n${rollList}`,
    { parse_mode: 'Markdown' }
  );
});

// /export command — BONUS: CSV export
bot.onText(/\/export/, async (msg) => {
  const chatId = msg.chat.id;
  const stats = getStats();

  if (stats.total === 0) {
    bot.sendMessage(chatId, 'No attendance data to export yet.');
    return;
  }

  // Build CSV string manually (no library)
  const header = 'RollNumber,Timestamp';
  const rows = stats.rollNumbers.map(roll => {
    // Read timestamp from the store via getStats — re-read file for timestamp
    const raw = fs.readFileSync('./attendance.json', 'utf8');
    const store = JSON.parse(raw);
    return [roll, store[roll].timestamp].join(',');
  });
  const csvContent = [header, ...rows].join('\n');

  // Write to temp file
  const tmpPath = path.join(os.tmpdir(), `attendance_${Date.now()}.csv`);
  fs.writeFileSync(tmpPath, csvContent, 'utf8');

  try {
    await bot.sendDocument(chatId, tmpPath, {}, {
      filename: 'attendance.csv',
      contentType: 'text/csv',
    });
  } finally {
    fs.unlinkSync(tmpPath);
  }
});

// Photo handler
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Get highest resolution photo (last item in array)
    const photoArray = msg.photo;
    const photo = photoArray[photoArray.length - 1];
    const fileId = photo.file_id;

    // Download image to temp directory
    const tmpPath = path.join(os.tmpdir(), fileId + '.jpg');
    await bot.downloadFile(fileId, os.tmpdir());

    // Decode QR
    let qrString;
    try {
      qrString = await decodeQR(tmpPath);
    } catch (err) {
      bot.sendMessage(chatId, '❌ No QR code found in the image. Please send a clear photo of the ID card.');
      return;
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(tmpPath); } catch {}
    }

    // Extract roll number
    const rollNumber = extractRollNumber(qrString);
    if (!rollNumber) {
      bot.sendMessage(chatId, '❌ Could not find a roll number in the QR code data.');
      return;
    }

    // Check if registered
    if (!isRegistered(rollNumber)) {
      bot.sendMessage(
        chatId,
        `⚠️ Roll number *${rollNumber}* is out of the registered range (240001–240400).`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Mark present
    const result = markPresent(rollNumber);

    if (!result.success && result.reason === 'already_marked') {
      bot.sendMessage(
        chatId,
        `⚠️ Roll number *${rollNumber}* was already marked present.\nFirst marked at: ${result.timestamp}`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    bot.sendMessage(
      chatId,
      `✅ Attendance marked for roll number *${rollNumber}*!`,
      { parse_mode: 'Markdown' }
    );

  } catch (err) {
    console.error('Unexpected error in photo handler:', err);
    bot.sendMessage(chatId, '❌ An unexpected error occurred. Please try again.');
  }
});

console.log('🤖 Bot is running...');
