// Load .env before reading process.env (required for GEMINI_API_KEY in extra)
require('dotenv').config();

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...require('./app.json').expo,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    },
  },
};
