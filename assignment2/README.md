# QR Code Attendance System

A Telegram bot that marks student attendance by scanning QR codes on IITK ID cards.

## What it does

- A volunteer sends a photo of a student's IITK ID card to the bot
- The bot decodes the QR code on the card using `jimp` + `jsqr`
- It extracts the roll number from the `<prefix>.<rollNumber>,<version>,<signature>.iitkidcard` QR format and validates it's in the registered range (240001–249999, adjustable in `parser.js`)
- Marks the student present in a local `attendance.json` store
- Handles duplicates gracefully (shows original timestamp)
- `/report` command returns total count + list of present roll numbers
- `/export` command sends the attendance as a downloadable CSV file

## Project Structure

```
assignment2/
├── bot.js          # Telegram bot — I/O only, wires modules together
├── qr.js           # QR decoder using jimp + jsqr
├── parser.js       # Roll number extractor and range validator
├── attendance.js   # JSON-based attendance store (read/write)
├── .env.example    # Template for environment variables
├── package.json
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and paste your bot token:

```
BOT_TOKEN=your_actual_token_here
```

To get a token: open Telegram → search `@BotFather` → `/newbot` → follow prompts → copy the token.

### 3. Run the bot

```bash
node bot.js
```

## Usage

| Action | How |
|--------|-----|
| Mark attendance | Send a photo of an IITK ID card to the bot |
| View stats | Send `/report` to the bot |
| Download CSV | Send `/export` to the bot |

## Bot Replies

| Situation | Reply |
|-----------|-------|
| Attendance marked | ✅ Roll number *XXXXXX* marked present |
| Already marked | ⚠️ Already marked — shows original timestamp |
| QR not found | ❌ No QR code found in the image |
| Roll number not in QR | ❌ Could not find a roll number |
| Roll number out of range | ⚠️ Not in registered range |

## Files not to submit

- `node_modules/`
- `.env` (keep your token private!)
- `attendance.json` (runtime data)
