const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const isProd = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('vercel.app');

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

// Development login backdoor
router.get('/dev-login', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'dev@studywar.com' });
    if (!user) {
      user = await User.create({
        name: 'Dev Warrior',
        email: 'dev@studywar.com',
        picture: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        score: 150,
        streak: 3,
      });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);
    
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).send('Dev login failed');
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie('token', token, cookieOptions);
    
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (frontendUrl.endsWith('/')) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  }
);

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    _id: req.user._id, name: req.user.name, email: req.user.email,
    picture: req.user.picture, score: req.user.score, streak: req.user.streak,
    lastActiveDate: req.user.lastActiveDate, xp: req.user.xp, level: req.user.level,
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
