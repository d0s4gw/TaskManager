const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// In tests, we might want to skip initialization or initialize differently,
// but for now, we'll try to initialize normally if credentials exist.
const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  try {
    // This will automatically pick up GOOGLE_APPLICATION_CREDENTIALS
    // from the environment (or .env) if set.
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log('Connected to Firestore database.');
  } catch (error) {
    console.error('Error connecting to Firestore database:', error.message);
    console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your .env file or environment.');
  }
} else {
  // Test configuration if needed
  // For tests we could use the emulator
  console.log('Test mode: skipping actual Firestore connection.');
}

const db = admin.apps.length ? admin.firestore() : null;

module.exports = db;
