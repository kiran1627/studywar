require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { initFirebaseAdmin, sendNotification } = require('../config/firebase');

async function sendTestNotification() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    initFirebaseAdmin();

    console.log('Fetching users with FCM tokens...');
    const users = await User.find({ fcmToken: { $ne: null } });
    
    if (users.length === 0) {
      console.log('No users found with FCM tokens. Make sure you have logged in and allowed notifications on the frontend.');
      process.exit(0);
    }

    const tokens = users.map(u => u.fcmToken);
    console.log(`Sending test notification to ${tokens.length} users...`);

    await sendNotification(
      tokens,
      'Institute Progress Update 🎓',
      'Time to check your latest Institute modules! You have new AI blocks waiting to be completed.',
      { type: 'institute_reminder' }
    );

    console.log('✅ Test notifications sent successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    process.exit(1);
  }
}

sendTestNotification();
