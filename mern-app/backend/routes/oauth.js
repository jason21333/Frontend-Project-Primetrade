const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000'

// Initiate OAuth flows
router.get('/oauth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/oauth/github', passport.authenticate('github', { scope: ['user:email'] }))

// Callbacks
router.get('/oauth/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND}/login` }), (req, res) => {
  // req.user is provided by passport strategy
  const user = req.user
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  // Redirect to frontend with token in fragment for client-side pickup
  res.redirect(`${FRONTEND}/auth/success#token=${token}`)
})

router.get('/oauth/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND}/login` }), (req, res) => {
  const user = req.user
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.redirect(`${FRONTEND}/auth/success#token=${token}`)
})

module.exports = router
