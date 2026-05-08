const nodemailer = require('nodemailer');

// Final attempt: Use Nodemailer's optimized 'gmail' service with pooling and long timeouts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

/**
 * Send a performance warning email to a student
 * @param {string} toEmail - Student's Gmail
 * @param {string} userName - Student's Name
 */
const sendWarningMail = async (toEmail, userName) => {
  const mailOptions = {
    from: `"StudyWar Team" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'StudyWar Performance Warning',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #7c3aed; text-align: center;">StudyWar Performance Warning</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We noticed that your attendance and learning progress are currently below expectations.</p>
        <p>Your recent activity indicates:</p>
        <ul style="color: #666;">
          <li>Low attendance</li>
          <li>Missed sessions</li>
          <li>Low consistency</li>
        </ul>
        <p>Please complete:</p>
        <ul style="color: #666;">
          <li>Morning Python sessions</li>
          <li>Institute learning sessions</li>
          <li>Evening backend practice</li>
        </ul>
        <p>Continuous inactivity may affect:</p>
        <ul style="color: #666;">
          <li>XP</li>
          <li>Streak</li>
          <li>Module unlocks</li>
        </ul>
        <p>Please improve your participation and continue learning consistently.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 14px; color: #888;">Regards,<br /><strong>StudyWar Team</strong></p>
      </div>
    `,
    text: `Hello ${userName},\n\nWe noticed that your attendance and learning progress are currently below expectations.\n\nYour recent activity indicates:\n- Low attendance\n- Missed sessions\n- Low consistency\n\nPlease complete:\n- Morning Python sessions\n- Institute learning sessions\n- Evening backend practice\n\nContinuous inactivity may affect:\n- XP\n- Streak\n- Module unlocks\n\nPlease improve your participation and continue learning consistently.\n\nRegards,\nStudyWar Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Warning email sent: ' + info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending failed details:', error);
    // Return a more descriptive error message if possible
    const errorMessage = error.response || error.message || 'SMTP authentication failure or invalid email';
    throw new Error(`Mail Error: ${errorMessage}`);
  }
};

module.exports = {
  sendWarningMail,
};
