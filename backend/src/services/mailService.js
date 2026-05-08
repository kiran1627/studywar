const axios = require('axios');

/**
 * Send a performance warning email to a student via Resend HTTP API
 * (Bypasses SMTP port blocks on Render/Vercel)
 * @param {string} toEmail - Student's Gmail
 * @param {string} userName - Student's Name
 */
const sendWarningMail = async (toEmail, userName) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing in environment variables');
  }

  const emailHtml = `
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
  `;

  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: `StudyWar <${EMAIL_FROM}>`,
        to: toEmail,
        subject: 'StudyWar Performance Warning',
        html: emailHtml,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Warning email sent via Resend:', response.data);
    return { success: true, message: 'Email sent successfully via Resend' };
  } catch (error) {
    console.error('Resend API Error:', error.response?.data || error.message);
    const errorDetail = error.response?.data?.message || error.message;
    throw new Error(`Resend Error: ${errorDetail}`);
  }
};

module.exports = {
  sendWarningMail,
};
