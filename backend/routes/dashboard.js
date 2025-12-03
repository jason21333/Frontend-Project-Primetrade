const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')

// GET /api/dashboard
router.get('/', auth, (req, res) => {
  // req.user is populated by middleware
  res.json({ user: req.user })
})

module.exports = router
