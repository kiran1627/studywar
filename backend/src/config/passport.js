const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.picture = profile.photos[0]?.value || user.picture;
            user.name = profile.displayName;
            await user.save();
            return done(null, user);
          }
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0]?.value || '',
            score: 0,
            streak: 0,
          });
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy configured');
} else {
  console.warn('⚠️  Google OAuth credentials not found. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
