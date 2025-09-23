
// src/lib/db-test.js
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const admin = require('firebase-admin');

async function testFirebaseAdmin() {
  console.log('[DB TEST] Starting Firebase Admin SDK test...');

  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountJson) {
    console.error('[DB TEST] CRITICAL: GOOGLE_APPLICATION_CREDENTIALS_JSON is not set.');
    process.exit(1);
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log('[DB TEST] Successfully parsed service account JSON.');

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[DB TEST] Firebase Admin SDK initialized successfully.');
    } else {
      console.log('[DB TEST] Using existing Firebase Admin app.');
    }

    const db = admin.firestore();
    console.log('[DB TEST] Attempting to access Firestore...');
    
    // Perform a simple read operation to test the connection
    await db.collection('test-collection').limit(1).get();
    
    console.log('[DB TEST] SUCCESS: Firestore connection is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('[DB TEST] FAILED: An error occurred during the test.');
    console.error('Error Details:', error);
    process.exit(1);
  }
}

testFirebaseAdmin();
