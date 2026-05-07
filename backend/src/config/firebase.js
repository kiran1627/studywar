const admin = require('firebase-admin');

// Note: To use Firebase Admin, you need to provide service account credentials.
// For development, you can set the FIREBASE_SERVICE_ACCOUNT_PATH env variable
// pointing to your serviceAccountKey.json, or configure the credentials directly
// in the environment variables.

const initFirebaseAdmin = () => {
  try {
    if (admin.apps.length > 0) return admin;

    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      credential = admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    } else if (process.env.FIREBASE_PROJECT_ID) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \\n with \n if it comes from env vars
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      });
    } else {
      console.warn('⚠️ Firebase Admin SDK not initialized: Missing credentials.');
      return null;
    }

    admin.initializeApp({
      credential,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    return null;
  }
};

const sendNotification = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;
  if (admin.apps.length === 0) {
    console.warn('Firebase Admin not initialized. Skipping notification:', title);
    return;
  }

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens: Array.isArray(tokens) ? tokens : [tokens],
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Notification sent: ${response.successCount} successful, ${response.failureCount} failed.`);
    // Optionally handle failures by removing invalid tokens from DB
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

module.exports = { initFirebaseAdmin, sendNotification, admin };
