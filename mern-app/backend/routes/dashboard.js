const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
  res.json({ message: 'Welcome to the dashboard', userId: req.user.id });
});

module.exports = router;
