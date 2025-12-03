const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const User = require('../models/User')

module.exports = function configurePassport() {
  // Google OAuth (only if credentials are provided)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/oauth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile?.emails?.[0]?.value
      const name = profile.displayName || profile.username || 'No Name'
      if (!email) return done(new Error('No email from Google'), null)
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({ name, email, password: Math.random().toString(36) })
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
    }))
  }

  // GitHub OAuth (only if credentials are provided)
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/oauth/github/callback',
      scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      // GitHub can return emails separately
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || profile._json?.email
      const name = profile.displayName || profile.username || 'No Name'
      if (!email) return done(new Error('No email from GitHub'), null)
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({ name, email, password: Math.random().toString(36) })
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
    }))
  }
}
