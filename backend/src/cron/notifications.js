const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendNotification } = require('../config/firebase');

const initCronJobs = () => {
  // Morning Reminder (e.g., 9:00 AM UTC daily)
  cron.schedule('0 9 * * *', async () => {
    try {
      const users = await User.find({ fcmToken: { $ne: null } });
      const tokens = users.map(u => u.fcmToken);
      await sendNotification(
        tokens,
        'Good Morning! ☀️',
        'Time for your morning Python session! Keep the streak alive.',
        { type: 'morning_reminder' }
      );
      console.log('Morning reminders sent.');
    } catch (error) {
      console.error('Error in morning cron:', error);
    }
  });

  // Evening Reminder (e.g., 6:00 PM UTC daily)
  cron.schedule('0 18 * * *', async () => {
    try {
      const users = await User.find({ fcmToken: { $ne: null } });
      const tokens = users.map(u => u.fcmToken);
      await sendNotification(
        tokens,
        'Evening Check-in 🌙',
        'Have you completed your backend study session today?',
        { type: 'evening_reminder' }
      );
      console.log('Evening reminders sent.');
    } catch (error) {
      console.error('Error in evening cron:', error);
    }
  });

  // Streak Alerts (e.g., 8:00 PM UTC daily - Warn users who haven't studied today but have a streak)
  cron.schedule('0 20 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Find users with a streak > 0 whose lastActiveDate is NOT today
      const usersAtRisk = await User.find({
        fcmToken: { $ne: null },
        streak: { $gt: 0 },
        lastActiveDate: { $ne: today }
      });

      const tokens = usersAtRisk.map(u => u.fcmToken);
      await sendNotification(
        tokens,
        'Don\'t lose your streak! 🔥',
        'You haven\'t completed a session today. Log in now to keep your streak going!',
        { type: 'streak_alert' }
      );
      console.log('Streak alerts sent to at-risk users.');
    } catch (error) {
      console.error('Error in streak alert cron:', error);
    }
  });

  // Weekly Progress Summary (e.g., Sunday at 10:00 AM UTC)
  cron.schedule('0 10 * * 0', async () => {
    try {
      const users = await User.find({ fcmToken: { $ne: null } });
      const tokens = users.map(u => u.fcmToken);
      await sendNotification(
        tokens,
        'Weekly Summary 📊',
        'Check out your progress for this week and plan your next goals!',
        { type: 'weekly_summary' }
      );
      console.log('Weekly summary notifications sent.');
    } catch (error) {
      console.error('Error in weekly summary cron:', error);
    }
  });

  // Institute Reminders (e.g., 12:00 PM UTC daily)
  cron.schedule('0 12 * * *', async () => {
    try {
      const users = await User.find({ fcmToken: { $ne: null } });
      const tokens = users.map(u => u.fcmToken);
      await sendNotification(
        tokens,
        'Institute Modules Await 🎓',
        'Your daily institute module is ready. Continue your learning path!',
        { type: 'institute_reminder' }
      );
      console.log('Institute reminders sent.');
    } catch (error) {
      console.error('Error in institute cron:', error);
    }
  });

  console.log('📅 Notification cron jobs scheduled.');
};

module.exports = { initCronJobs };
